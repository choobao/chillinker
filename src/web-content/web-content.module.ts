import { Module } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { WebContentController } from './web-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebContents } from './entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';
import { Likes } from '../like/entities/likes.entity';
import { OptionalAuthGuard } from '../auth/optinal.authguard';
import { ReviewService } from '../review/review.service';
import { CReviews } from '../review/entities/chillinker.reviews.entity';
import { PReviews } from '../review/entities/platform.reviews.entity';
import { ReviewLikes } from '../review/entities/review.likes.entity';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Likes,
      WebContents,
      Users,
      Collections,
      CReviews,
      PReviews,
      ReviewLikes,
    ]),
  ],
  providers: [
    WebContentService,
    OptionalAuthGuard,
    ReviewService,
    RedisService,
  ],
  controllers: [WebContentController],
  exports: [WebContentService],
})
export class WebContentModule {}
