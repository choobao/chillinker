import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CReviews } from './entities/chillinker.reviews.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { SseService } from '../sse/sse.service';
import { OptionalAuthGuard } from '../auth/optinal.authguard';

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
  providers: [ReviewService, OptionalAuthGuard],
})
export class ReviewModule {}
