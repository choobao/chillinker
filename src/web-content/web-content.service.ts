import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { WebContents } from './entities/webContents.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType } from './webContent.type';
import { Users } from 'src/user/entities/user.entity';
import { Collections } from 'src/collection/entities/collections.entity';

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

  async findBestWebContents(platform: string, type: ContentType) {
    try {
      const bestWebContents = await this.webContentRepository
        .createQueryBuilder('webContents')
        .leftJoinAndSelect('webContents.cReviews', 'cReview')
        .leftJoinAndSelect('webContents.pReviews', 'pReview')
        .where(
          `JSON_EXTRACT(webContents.platform, '$.${platform}') IS NOT NULL`,
        )
        .andWhere('webContents.contentType = :type', { type })
        .andWhere('webContents.rank IS NOT NULL')
        .groupBy('webContents.id')
        .select([
          'webContents.id AS id',
          'webContents.category AS category',
          'webContents.title AS title',
          'webContents.image AS image',
        ])
        .addSelect('COUNT(pReview.id)', 'pReviewCount')
        .addSelect('COUNT(cReview.id)', 'cReviewCount')
        .addSelect(`JSON_EXTRACT(webContents.rank, '$.${platform}')`, 'ranking') // 플랫폼 별 랭킹
        .orderBy('ranking', 'ASC') // ranking에 따라 정렬
        .getRawMany();

      return bestWebContents;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
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

  async searchFromWebContents(keyword: string) {
    const webContents = await this.webContentRepository
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

    const webnovels = webContents.filter(
      (webContent) => webContent.contentType === ContentType.WEBNOVEL,
    );
    const webtoons = webContents.filter(
      (webContent) => webContent.contentType === ContentType.WEBTOON,
    );

    return {
      webnovels,
      webtoons,
    };
  }
}
