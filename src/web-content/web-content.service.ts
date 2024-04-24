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

@Injectable()
export class WebContentService {
  constructor(
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Collections)
    private readonly collectionRepository: Repository<Collections>,
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

  blindAdultImage(user, contents: WebContents[]) {
    if (
      user === false ||
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      const adult_image =
        'https://ssl.pstatic.net/static/m/nstore/thumb/19/home_book_4.png';
      contents.map((content) => {
        if (content.isAdult) {
          content.image = adult_image;
        }
        return content;
      });
    }
    return contents;
  }

  isAdult(user) {
    const userInfo = { isAdult: 1 };
    if (
      user === false ||
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

  async searchFromAuthors(keyword: string) {
    const webContents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .where('webContents.author LIKE :keyword', { keyword: `%${keyword}%` })
      .getRawMany();

    return webContents;
  }

  async searchFromWebContents(keyword: string, user) {
    let webContents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .where('webContents.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('webContents.desc LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('webContents.category LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .orWhere('webContents.keyword LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .getMany();
    webContents = this.blindAdultImage(user, webContents);

    const webnovels = webContents.filter(
      (webContent) => webContent.contentType === ContentType.WEBNOVEL,
    );
    const webtoons = webContents.filter(
      (webContent) => webContent.contentType === ContentType.WEBTOON,
    );

    return {
      webnovels,
      webtoons,
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
}
