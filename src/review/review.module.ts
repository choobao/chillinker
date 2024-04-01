import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { C_revies } from './entities/chillinker.reivews.entity';
import { P_revies } from './entities/platform.reviews.entity';
import { Review_likes } from './entities/review.likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([C_revies, P_revies, Review_likes])],
  controllers: [ReviewController],
  exports: [ReviewService],
  providers: [ReviewService],
})
export class ReviewModule {}
