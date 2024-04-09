import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { WebContents } from './entities/webContents.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentType } from './webContent.type';

@Injectable()
export class WebContentService {
  constructor(
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
  ) {}

  async findBestWebContents(platform: string, type: ContentType) {
    try {
      const bestWebContents = await this.webContentRepository
        .createQueryBuilder('webContents')
        .leftJoinAndSelect('webContents.cReviews', 'review')
        .where(
          `JSON_EXTRACT(webContents.platform, '$.${platform}') IS NOT NULL`,
        )
        .andWhere('webContents.contentType = :type', { type })
        .andWhere('webContents.rank IS NOT NULL')
        .groupBy('webContents.id')
        .select(['webContents.id', 'webContents.category', 'webContents.title'])
        .addSelect('COUNT(review.id)', 'reviewCount')
        .addSelect(`JSON_EXTRACT(webContents.rank, '$.${platform}')`, 'ranking') // 플랫폼 별 랭킹
        .orderBy('ranking', 'ASC') // ranking에 따라 정렬
        .getRawMany();

      return bestWebContents;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
