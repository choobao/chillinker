import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CReviews } from './entities/chillinker.reviews.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';
import { Users } from 'src/user/entities/user.entity';
import { SseService } from 'src/sse/sse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CReviews,
      PReviews,
      ReviewLikes,
      WebContents,
      Users,
    ]),
  ],
  controllers: [ReviewController],
  exports: [ReviewService],
  providers: [ReviewService, SseService],
})
export class ReviewModule {}
