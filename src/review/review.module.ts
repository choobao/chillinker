import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CReviews } from './entities/chillinker.reviews.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { ReviewLikes } from './entities/review.likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CReviews, PReviews, ReviewLikes])],
  controllers: [ReviewController],
  exports: [ReviewService],
  providers: [ReviewService],
})
export class ReviewModule {}
