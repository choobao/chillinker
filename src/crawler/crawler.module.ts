import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { WebContents } from '../web-content/entities/webContents.entity';
import { PReviews } from '../review/entities/platform.reviews.entity';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([WebContents, PReviews])],
  providers: [CrawlerService],
})
export class CrawlerModule {}
