import {
  Inject,
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
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WebContentService {
  constructor(
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Collections)
    private readonly collectionRepository: Repository<Collections>,
    private readonly redisService: RedisService,
  ) {}

  async findBestWebContents(platform: string, type: ContentType, user) {
    try {
      // let bestWebContents = await this.redisService.getCachedData(
      //   `bestWebContents_${platform}_${type}`,
      // );
      let bestWebContents = null;

      if (_.isNil(bestWebContents)) {
        bestWebContents = await this.webContentRepository
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
            'webContents.viewCount AS viewCount',
            'webContents.isAdult AS isAdult',
          ])
          .addSelect('COUNT(pReview.id)', 'pReviewCount')
          .addSelect('COUNT(cReview.id)', 'cReviewCount')
          .addSelect(
            `JSON_EXTRACT(webContents.rank, '$.${platform}')`,
            'ranking',
          )
          .orderBy('ranking', 'ASC')
          .getRawMany();

        await this.redisService.cacheData(
          `bestWebContents_${platform}_${type}`,
          bestWebContents,
          3600,
        );
      }

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
      .offset(skip)
      .limit(take)
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
      .offset(skip)
      .limit(take)
      .getRawMany();

    return collections;
  }

  async searchFromAuthors(keyword: string, user, page: number, take: number) {
    const keywordWithoutSpace = keyword.replace(/ /g, '');
    let authors = await this.webContentRepository
      .createQueryBuilder('webContents')
      .where("REPLACE(webContents.author, ' ', '') LIKE :keyword", {
        keyword: `%${keywordWithoutSpace}%`,
      })
      .select([
        'webContents.id',
        'webContents.title',
        'webContents.author',
        'webContents.starRate',
        'webContents.image',
        'webContents.isAdult',
        'webContents.contentType',
      ])
      .take(take)
      .skip((page - 1) * take)
      .getMany();

    authors = this.blindAdultImage(user, authors);
    return authors;
  }

  async searchFromKeywordCategory(
    keyword: string,
    user,
    page: number,
    take: number,
  ) {
    const keywordWithoutSpace = keyword.replace(/ /g, '');
    let ck = await this.webContentRepository
      .createQueryBuilder('webContents')
      .where("REPLACE(webContents.category, ' ', '') LIKE :keyword", {
        keyword: `%${keywordWithoutSpace}%`,
      })
      .orWhere("REPLACE(webContents.keyword, ' ', '') LIKE :keyword", {
        keyword: `%${keywordWithoutSpace}%`,
      })
      .select([
        'webContents.id',
        'webContents.title',
        'webContents.author',
        'webContents.starRate',
        'webContents.image',
        'webContents.isAdult',
        'webContents.contentType',
      ])
      .take(take)
      .skip((page - 1) * take)
      .getMany();
    console.log(ck);
    ck = this.blindAdultImage(user, ck);

    return ck;
  }

  async searchFromWebContents(
    keyword: string,
    user,
    page: number,
    take: number,
  ) {
    const keywordWithoutSpace = keyword.replace(/ /g, '');
    const webcontents = await this.webContentRepository
      .createQueryBuilder('webContents')
      .where("REPLACE(webContents.title, ' ', '') LIKE :keyword", {
        keyword: `%${keywordWithoutSpace}%`,
      })
      .select([
        'webContents.id',
        'webContents.title',
        'webContents.author',
        'webContents.starRate',
        'webContents.image',
        'webContents.isAdult',
        'webContents.contentType',
      ])
      .take(take)
      .skip((page - 1) * take)
      .getMany();

    const webnovels = webcontents.filter(
      (webContent) => webContent.contentType === '웹소설',
    );

    const webtoons = webcontents.filter(
      (webContent) => webContent.contentType === '웹툰',
    );
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

  async getBestLikesContents(type: string, user: Users | boolean | null) {
    try {
      // let contents = await this.redisService.getCachedData(
      //   `bestLikesContents_${type}`,
      // );
      let contents = null;

      if (_.isNil(contents)) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        contents = await this.webContentRepository
          .createQueryBuilder('webContents')
          .leftJoinAndSelect('webContents.likes', 'likes')
          .where('likes.createdAt > :threeDaysAgo', { threeDaysAgo })
          .andWhere('webContents.contentType = :type', { type })
          .groupBy('webContents.id')
          .orderBy('COUNT(likes.id)', 'DESC')
          .select([
            'webContents.id AS id',
            'webContents.title AS title',
            'webContents.image AS image',
            'webContents.category AS category',
            'webContents.viewCount AS viewCount',
            'webContents.isAdult AS isAdult',
            'webContents.author AS author',
          ])
          .addSelect('COUNT(likes.id)', 'likeCount')
          .limit(20)
          .getRawMany();

        await this.redisService.cacheData(
          `bestLikesContents_${type}`,
          contents,
          3 * 3600,
        );
      }
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
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getBestReviewCountContents(type: string, user: Users | boolean | null) {
    try {
      let contents = null;
      // let contents = await this.redisService.getCachedData(
      //   `bestReviewContents_${type}`,
      // );

      if (_.isNil(contents)) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        contents = await this.webContentRepository
          .createQueryBuilder('webContents')
          .leftJoinAndSelect('webContents.cReviews', 'reviews')
          .where('reviews.createdAt > :threeDaysAgo', { threeDaysAgo })
          .andWhere('webContents.contentType = :type', { type })
          .groupBy('webContents.id')
          .orderBy('COUNT(reviews.id)', 'DESC')
          .select([
            'webContents.id AS id',
            'webContents.title AS title',
            'webContents.image AS image',
            'webContents.category AS category',
            'webContents.viewCount AS viewCount',
            'webContents.isAdult AS isAdult',
            'webContents.author AS author',
          ])
          .addSelect('COUNT(reviews.id)', 'reviewCount')
          .limit(20)
          .getRawMany();

        await this.redisService.cacheData(
          `bestReviewContents_${type}`,
          contents,
          3 * 3600,
        );
      }

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
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async getBestCollectionContents(type: string, user: Users | boolean | null) {
    try {
      // let contents = await this.redisService.getCachedData(
      //   `bestCollectionContents_${type}`,
      // );
      let contents = null;

      if (_.isNil(contents)) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        contents = await this.webContentRepository
          .createQueryBuilder('webContents')
          .leftJoinAndSelect(
            'webContents.contentCollections',
            'contentCollections',
          )
          .where('contentCollections.createdAt > :threeDaysAgo', {
            threeDaysAgo,
          })
          .andWhere('webContents.contentType = :type', { type })
          .groupBy('webContents.id')
          .orderBy('COUNT(contentCollections.id)', 'DESC')
          .select([
            'webContents.id AS id',
            'webContents.title AS title',
            'webContents.image AS image',
            'webContents.category AS category',
            'webContents.viewCount AS viewCount',
            'webContents.isAdult AS isAdult',
            'webContents.author AS author',
          ])
          .addSelect('COUNT(contentCollections.id)', 'colCount')
          .limit(20)
          .getRawMany();

        await this.redisService.cacheData(
          `bestCollectionContents_${type}`,
          contents,
          3 * 3600,
        );
      }
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
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
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

    const orderType =
      !_.isNil(orderBy) && orderBy.trim() !== '' ? orderBy : 'star';

    let totalCount = +(await this.redisService.getValue(
      `totalCount_${query}_${contentType}`,
    ));

    let contents = await this.redisService.getCachedData(
      `contents_${query}_${contentType}_${page}_${orderType}`,
    );

    if (query === '일반') {
      if (totalCount === 0) {
        totalCount = await this.webContentRepository
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
                })
                .orWhere('webContents.category LIKE :action', {
                  action: `%액션%`,
                });
            }),
          )
          .getCount();

        await this.redisService.save(
          `totalCount_${query}_${contentType}`,
          totalCount,
        );
      }

      const maxPage = Math.ceil(totalCount / take);

      if (_.isNil(contents)) {
        contents = await this.webContentRepository
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
                })
                .orWhere('webContents.category LIKE :action', {
                  action: `%액션%`,
                });
            }),
          )
          .take(take)
          .skip(skip)
          .orderBy(
            orderBy === 'recent'
              ? 'webContents.pubDate'
              : 'webContents.starRate',
            'DESC',
          )
          .getMany();

        await this.redisService.cacheData(
          `contents_${query}_${contentType}_${page}_${orderType}`,
          contents,
          24 * 3600,
        );
      }

      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        totalCount,
        userInfo: this.isAdult(user),
      };
    } else if (query === '로맨스') {
      if (totalCount === 0) {
        totalCount = await this.webContentRepository
          .createQueryBuilder('webContents')
          .where('webContents.contentType = :contentType', { contentType })
          .andWhere(
            new Brackets((qb) => {
              qb.where('webContents.category LIKE :romance', {
                romance: `%로맨스%`,
              }).orWhere('webContents.category LIKE :roco', {
                roco: `%순정%`,
              });
            }),
          )
          .getCount();

        await this.redisService.save(
          `totalCount_${query}_${contentType}`,
          totalCount,
        );
      }
      const maxPage = Math.ceil(totalCount / take);

      if (_.isNil(contents)) {
        contents = await this.webContentRepository
          .createQueryBuilder('webContents')
          .where('webContents.contentType = :contentType', { contentType })
          .andWhere(
            new Brackets((qb) => {
              qb.where('webContents.category LIKE :romance', {
                romance: `%로맨스%`,
              }).orWhere('webContents.category LIKE :roco', {
                roco: `%순정%`,
              });
            }),
          )
          .take(take)
          .skip(skip)
          .orderBy(
            orderBy === 'recent'
              ? 'webContents.pubDate'
              : 'webContents.starRate',
            'DESC',
          )
          .getMany();

        await this.redisService.cacheData(
          `contents_${query}_${contentType}_${page}_${orderType}`,
          contents,
          24 * 3600,
        );
      }
      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        totalCount,
        userInfo: this.isAdult(user),
      };
    } else if (query === 'BL/GL') {
      if (totalCount === 0) {
        totalCount = await this.webContentRepository
          .createQueryBuilder('webContents')
          .where('webContents.contentType = :contentType', { contentType })
          .andWhere(
            new Brackets((qb) => {
              qb.where('webContents.category LIKE :BL', {
                BL: `%BL%`,
              }).orWhere('webContents.category LIKE :GL', {
                GL: `%GL%`,
              });
            }),
          )
          .getCount();

        await this.redisService.save(
          `totalCount_${query}_${contentType}`,
          totalCount,
        );
      }
      const maxPage = Math.ceil(totalCount / take);

      if (_.isNil(contents)) {
        contents = await this.webContentRepository
          .createQueryBuilder('webContents')
          .where('webContents.contentType = :contentType', { contentType })
          .andWhere(
            new Brackets((qb) => {
              qb.where('webContents.category LIKE :BL', {
                BL: `%BL%`,
              }).orWhere('webContents.category LIKE :GL', {
                GL: `%GL%`,
              });
            }),
          )
          .take(take)
          .skip(skip)
          .orderBy(
            orderBy === 'recent'
              ? 'webContents.pubDate'
              : 'webContents.starRate',
            'DESC',
          )
          .getMany();

        await this.redisService.cacheData(
          `contents_${query}_${contentType}_${page}_${orderType}`,
          contents,
          24 * 3600,
        );
      }
      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        totalCount,
        userInfo: this.isAdult(user),
      };
    } else {
      if (totalCount === 0) {
        totalCount = await this.webContentRepository.count({
          where: {
            contentType,
            category: Like(`%${query}%`),
          },
        });
        await this.redisService.save(
          `totalCount_${query}_${contentType}`,
          totalCount,
        );
      }
      const maxPage = Math.ceil(totalCount / take);
      if (_.isNil(contents)) {
        contents = await this.webContentRepository.find({
          where: {
            contentType,
            category: Like(`%${query}%`),
          },
          take: take,
          skip: skip,
          order:
            orderBy === 'recent' ? { pubDate: 'DESC' } : { starRate: 'DESC' },
        });

        await this.redisService.cacheData(
          `contents_${query}_${contentType}_${page}_${orderType}`,
          contents,
          24 * 3600,
        );
      }
      const result = this.blindAdultImage(user, contents);
      return {
        content: result,
        maxPage,
        page,
        orderBy,
        type,
        query,
        totalCount,
        userInfo: this.isAdult(user),
      };
    }
  }

  async getOneWebContent(user, id: number) {
    const content = await this.webContentRepository.findOne({
      where: { id },
    });

    if (!content) {
      throw new NotFoundException('해당 작품 페이지가 존재하지 않습니다!');
    }

    let userId = user.id;

    if (!userId) {
      userId = user.ip;
    }
    console.log('ip조회', user);

    console.log('false', userId);

    const key = `user:${userId}:postViews`;

    const existingViews = await this.redisService.isExistingViews(key, id);

    if (existingViews) {
      return content;
    } else {
      await this.redisService.firstViews(key, id);

      await this.webContentRepository.update(content.id, {
        viewCount: content.viewCount + 1,
      });

      return content;
    }
  }
}
