import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { WebContents } from './entities/webContents.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType } from './webContent.type';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';
import _ from 'lodash';
import { ElasticSearchService } from '../elastic-search/elastic-search.service';

@Injectable()
export class WebContentService {
  constructor(
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Collections)
    private readonly collectionRepository: Repository<Collections>,
    private readonly elasticSearchService: ElasticSearchService,
  ) {}

  async findBestWebContents(platform: string, type: ContentType, user) {
    try {
      const bestWebContents = await this.webContentRepository
        .createQueryBuilder('webContents')
        .leftJoinAndSelect('webContents.cReviews', 'cReview')
        .leftJoinAndSelect('webContents.pReviews', 'pReview')
        .where(
          `JSON_EXTRACT(webContents.platform, '$.${platform}') IS NOT NULL`,
        )
        .andWhere('webContents.contentType = :type', { type })
        .andWhere('JSON_EXTRACT(webContents.rank, :platform) IS NOT NULL', {
          platform: `$.${platform}`,
        })
        .groupBy('webContents.id')
        .select([
          'webContents.id AS id',
          'webContents.category AS category',
          'webContents.title AS title',
          'webContents.image AS image',
          'webContents.author AS author',
          'webContents.isAdult AS isAdult',
        ])
        .addSelect('COUNT(pReview.id)', 'pReviewCount')
        .addSelect('COUNT(cReview.id)', 'cReviewCount')
        .addSelect(`JSON_EXTRACT(webContents.rank, '$.${platform}')`, 'ranking') // 플랫폼 별 랭킹
        .orderBy('ranking', 'ASC') // ranking에 따라 정렬
        .getRawMany();

      return this.blindAdultImage(user, bestWebContents);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  isOver19(birthDate: Date) {
    const today = new Date();
    const date19YearsAgo = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate(),
    );
    return birthDate <= date19YearsAgo;
  }

  blindAdultImage(user: Users | null, contents: any[]) {
    if (
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      const adult_image =
        'https://ssl.pstatic.net/static/m/nstore/thumb/19/home_book_4.png';
      contents.map((content) => {
        if (content.isAdult === 1) {
          content.image = adult_image;
        }
        return content;
      });
    }
    return contents;
  }

  isAdult(user: Users | null) {
    const userInfo = { isAdult: 1 };
    if (
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      userInfo.isAdult = 0;
    }
    return userInfo;
  }

  async searchFromUsers(keyword: string) {
    const users = await this.userRepository
      .createQueryBuilder('users')
      .where('users.nickname LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('users.intro LIKE :keyword', { keyword: `%${keyword}%` })
      .getRawMany();

    return users;
  }

  async searchFromCollections(keyword: string) {
    const collections = await this.collectionRepository
      .createQueryBuilder('collections')
      .where('collections.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('collections.desc LIKE :keyword', { keyword: `%${keyword}%` })
      .getRawMany();

    return collections;
  }

  async searchFromAuthors(keyword: string, user) {
    let authors = await this.elasticSearchService.search(
      'web*',
      keyword,
      'author',
    );
    authors = this.blindAdultImage(user, authors);
    return authors;
  }

  async searchFromKeywordCategory(keyword: string, user) {
    let ck = await this.elasticSearchService.searchMultipleField(
      'web*',
      keyword,
      'category',
      'keyword',
    );
    ck = this.blindAdultImage(user, ck);

    return ck;
  }

  async searchFromWebContents(keyword: string, user) {
    const webnovels = await this.elasticSearchService.search(
      'webnovels',
      keyword,
      'title',
    );
    console.log('웹소설:', webnovels);
    const webtoons = await this.elasticSearchService.search(
      'webtoons',
      keyword,
      'title',
    );
    console.log('웹툰:', webtoons);

    return {
      webnovels: this.blindAdultImage(user, webnovels),
      webtoons: this.blindAdultImage(user, webtoons),
      userInfo: this.isAdult(user),
    };
  }

  async findContent(id: number, type: ContentType) {
    const content = await this.webContentRepository.findOne({
      where: { id, contentType: type },
    });

    if (!content) {
      throw new NotFoundException('해당 작품 페이지가 존재하지 않습니다!');
    }

    return content;
  }

  // 지난 24시간 이내 생성된 likeCount가 높은 순 상위 20개
  async getBestLikesContents(user: Users | null) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const contents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .leftJoinAndSelect('webContents.likes', 'likes')
      .where('likes.createdAt > :yesterday', { yesterday })
      .groupBy('webContents.id')
      .orderBy('COUNT(likes.id)', 'DESC')
      .select([
        'webContents.id',
        'webContents.title',
        'webContents.image',
        'webContents.category',
        'webContents.isAdult',
        'webContents.author',
      ])
      .addSelect('COUNT(likes.id)', 'likeCount')
      .limit(20)
      .getMany();

    return contents;
  }
}
