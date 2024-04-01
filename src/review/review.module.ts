import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { C_reviews } from './entities/chillinker.reivews.entity';
import { P_reviews } from './entities/platform.reviews.entity';
import { Review_likes } from './entities/review.likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([C_reviews, P_reviews, Review_likes])],
  controllers: [ReviewController],
  exports: [ReviewService],
  providers: [ReviewService],
})
export class ReviewModule {}
