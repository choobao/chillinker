import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { RedisModule } from '../redis/redis.module';
import { WebContents } from '../web-content/entities/webContents.entity';
import { PReviews } from '../review/entities/platform.reviews.entity';
import { CrawlerController } from './crawler.controller';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebContents, PReviews])],
  providers: [CrawlerService, RedisService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
