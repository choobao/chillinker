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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateCReviewsDto } from './dto/review.create.dto';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userinfo.decorator';
import { Users } from 'src/user/entities/user.entity';

@Controller('webContents/:webContentsId/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  async getCReivew(
    @Param('webContentsId', ParseIntPipe) webContentsId: number,
    @Query('page', ParseIntPipe) page?: number,
    @Query('order') order?: string,
    @Query('option') option?: string,
  ) {
    return await this.reviewService.getCReviews(
      webContentsId,
      page,
      order,
      option,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createReview(
    @Param('webContentsId', ParseIntPipe) webContentsId: number,
    @UserInfo() user: Users,
    @Body() createCReviewsDto: CreateCReviewsDto,
  ) {
    console.log(user);
    return await this.reviewService.createReivew(
      user,
      webContentsId,
      createCReviewsDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:reviewId')
  async modifyReview(
    @UserInfo() user: Users,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() modifyCReviewsDto: ModifyCReviewsDto,
  ) {
    return await this.reviewService.modifyReivew(
      user,
      reviewId,
      modifyCReviewsDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:reviewId')
  @HttpCode(204)
  async deleteReivew(
    @UserInfo() user: Users,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    await this.reviewService.deleteReivew(user, reviewId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:reviewId/likes')
  async likeReview(
    @UserInfo() user: Users,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return await this.reviewService.likeReivew(user, reviewId);
  }
}
