import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';

@Module({
  providers: [ReviewService]
})
export class ReviewModule {}
