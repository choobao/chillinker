import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateCReviewsDto } from './dto/review.create.dto';
import { ModifyCReviewsDto } from './dto/review.modify.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  async getReivew() {}

  @Post()
  async createReview(
    // @userInfo() user:User,
    @Body() createCReviewsDto: CreateCReviewsDto,
  ) {
    return await this.reviewService.createReivew(
      // user,
      createCReviewsDto,
    );
  }

  @Patch('/:reviewId')
  async modifyReview(
    // @userInfo() user:User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() modifyCReviewsDto: ModifyCReviewsDto,
  ) {
    return await this.reviewService.modifyReivew(
      // user,
      reviewId,
      modifyCReviewsDto,
    );
  }

  @Delete('/:reviewId')
  @HttpCode(204)
  async deleteReivew(
    // @userInfo() user:User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    await this.reviewService.deleteReivew(
      // user,
      reviewId,
    );
  }

  @Post('/:reviewId/likes')
  async likeReview(
    // @userInfo() user:User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return await this.reviewService.likeReivew(
      // user,
      reviewId,
    );
  }
}
