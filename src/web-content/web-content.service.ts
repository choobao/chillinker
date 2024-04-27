import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, Like, Repository } from 'typeorm';
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

  blindAdultImage(user, contents) {
    if (
      user === false ||
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

  async searchFromUsers(keyword: string, page: number, take: number) {
    page = page ? page : 1;
    let skip = (page - 1) * take;

    const users = await this.userRepository
      .createQueryBuilder('users')
      .where('users.nickname LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('users.intro LIKE :keyword', { keyword: `%${keyword}%` })
      .offset(skip) // 페이지에 따라 스킵하는 수 계산
      .limit(take) // 페이지당 아이템 수 설정
      .getRawMany();

    return users;
  }

  async searchFromCollections(keyword: string, page: number, take: number) {
    page = page ? page : 1;
    let skip = (page - 1) * take;

    const collections = await this.collectionRepository
      .createQueryBuilder('collections')
      .where('collections.title LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('collections.desc LIKE :keyword', { keyword: `%${keyword}%` })
      .offset(skip) // 페이지에 따라 스킵하는 수 계산
      .limit(take) // 페이지당 아이템 수 설정
      .getRawMany();

    return collections;
  }

  async searchFromAuthors(keyword: string, user, page: number, take: number) {
    let authors = await this.elasticSearchService.search(
      'web*',
      keyword,
      'author',
      page,
      take,
    );
    authors = this.blindAdultImage(user, authors);
    return authors;
  }

  async searchFromKeywordCategory(
    keyword: string,
    user,
    page: number,
    take: number,
  ) {
    let ck = await this.elasticSearchService.searchMultipleField(
      'web*',
      keyword,
      'category',
      'keyword',
      page,
      take,
    );
    ck = this.blindAdultImage(user, ck);

    return ck;
  }

  async searchFromWebContents(
    keyword: string,
    user,
    page: number,
    take: number,
  ) {
    const webnovels = await this.elasticSearchService.search(
      'webnovels',
      keyword,
      'title',
      page,
      take,
    );
    console.log('웹소설:', webnovels);
    const webtoons = await this.elasticSearchService.search(
      'webtoons',
      keyword,
      'title',
      page,
      take,
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
  async getBestLikesContents(type: string, user) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    let contents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .leftJoinAndSelect('webContents.likes', 'likes')
      .where('likes.createdAt > :yesterday', { yesterday })
      .andWhere('webContents.contentType = :type', { type })
      .groupBy('webContents.id')
      .orderBy('COUNT(likes.id)', 'DESC')
      .select([
        'webContents.id AS id',
        'webContents.title AS title',
        'webContents.image AS image',
        'webContents.category AS category',
        'webContents.isAdult AS isAdult',
        'webContents.author AS author',
      ])
      .addSelect('COUNT(likes.id)', 'likeCount')
      .limit(20)
      .getRawMany();
    contents =
      contents.length === 0 || _.isNil(contents)
        ? []
        : this.blindAdultImage(
            user,
            contents.map((content, idx) => {
              return { ...content, ranking: idx + 1 };
            }),
          );

    return contents;
  }

  async getBestReviewCountContents(type: string, user) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    let contents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .leftJoinAndSelect('webContents.cReviews', 'reviews')
      .where('reviews.createdAt > :yesterday', { yesterday })
      .andWhere('webContents.contentType = :type', { type })
      .groupBy('webContents.id')
      .orderBy('COUNT(reviews.id)', 'DESC')
      .select([
        'webContents.id AS id',
        'webContents.title AS title',
        'webContents.image AS image',
        'webContents.category AS category',
        'webContents.isAdult AS isAdult',
        'webContents.author AS author',
      ])
      .addSelect('COUNT(reviews.id)', 'reviewCount')
      .limit(20)
      .getRawMany();

    contents =
      contents.length === 0 || _.isNil(contents)
        ? []
        : this.blindAdultImage(
            user,
            contents.map((content, idx) => {
              return { ...content, ranking: idx + 1 };
            }),
          );
    return contents;
  }

  // 컬렉션에 많이 들어간 작품
  async getBestCollectionContents(type: string, user) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    let contents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .leftJoinAndSelect('webContents.contentCollections', 'cols')
      .where('cols.createdAt > :yesterday', { yesterday })
      .andWhere('webContents.contentType = :type', { type })
      .groupBy('webContents.id')
      .orderBy('COUNT(cols.id)', 'DESC')
      .select([
        'webContents.id AS id',
        'webContents.title AS title',
        'webContents.image AS image',
        'webContents.category AS category',
        'webContents.isAdult AS isAdult',
        'webContents.author AS author',
      ])
      .addSelect('COUNT(cols.id)', 'colCount')
      .limit(20)
      .getRawMany();

    contents =
      contents.length === 0 || _.isNil(contents)
        ? []
        : this.blindAdultImage(
            user,
            contents.map((content, idx) => {
              return { ...content, ranking: idx + 1 };
            }),
          );

    return contents;
  }

  async getContentCategory(
    user: Users,
    type: string,
    query: string,
    orderBy: string,
    page: number,
  ) {
    page = page ? page : 1;
    let contentType =
      type === 'webtoon' ? ContentType.WEBTOON : ContentType.WEBNOVEL;

    const take = 30;
    const skip = (page - 1) * take;

    if (query === '일반') {
      const totalContents = await this.webContentRepository
        .createQueryBuilder('webContents')
        .where('webContents.contentType = :contentType', { contentType })
        .andWhere(
          new Brackets((qb) => {
            qb.where('webContents.category LIKE :boy', { boy: `%소년%` })
              .orWhere('webContents.category LIKE :drama', {
                drama: `%드라마%`,
              })
              .orWhere('webContents.category LIKE :mystery', {
                mystery: `%추리%`,
              });
          }),
        )
        .getMany();
      const totalCount = totalContents.length;
      const maxPage = Math.ceil(totalCount / take);

      const contents = await this.webContentRepository
        .createQueryBuilder('webContents')
        .where('webContents.contentType = :contentType', { contentType })
        .andWhere(
          new Brackets((qb) => {
            qb.where('webContents.category LIKE :boy', { boy: `%소년%` })
              .orWhere('webContents.category LIKE :drama', {
                drama: `%드라마%`,
              })
              .orWhere('webContents.category LIKE :mystery', {
                mystery: `%추리%`,
              });
          }),
        )
        .take(take)
        .skip(skip)
        .orderBy(
          orderBy === 'recent' ? 'webContents.pubDate' : 'webContents.starRate',
          'DESC',
        )
        .getMany();

      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        userInfo: this.isAdult(user),
      };
    } else {
      const totalCount = await this.webContentRepository.count({
        where: {
          contentType,
          category: Like(`%${query}%`), // 'query'가 포함된 'category' 필드를 검색
        },
      });
      const maxPage = Math.ceil(totalCount / take);

      let contents = await this.webContentRepository.find({
        where: {
          contentType,
          category: Like(`%${query}%`), // 'query'가 포함된 'category' 필드를 검색
        },
        take: take,
        skip: skip,
        order:
          orderBy === 'recent' ? { pubDate: 'DESC' } : { starRate: 'DESC' },
      });
      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        userInfo: this.isAdult(user),
      };
    }
  }
}
