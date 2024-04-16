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
  Render,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateCReviewsDto } from './dto/review.create.dto';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userinfo.decorator';
import { Users } from 'src/user/entities/user.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewSummaryDto } from './dto/review.summary.dto';

@ApiTags('REVIEW')
@Controller('webContents/:webContentsId/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @ApiOperation({ summary: '리뷰 조회' })
  // @Render('detailReview')
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

  // @ApiOperation({ summary: '리뷰 작성한 작품 조회' })
  // @Render('reviewed_list.ejs')
  // @Get('reviewedTitles/:userId')
  // async getTitlesWithReviews(@Param('userId') userId: number) {
  //   const reviews = await this.reviewService.getTitlesWithReviews(userId);

  //   const reviewSummaries: ReviewSummaryDto[] = reviews.map((review) => {
  //     return new ReviewSummaryDto(review.image, review.title, review.rate);
  //   });

  //   return { reviewedWorks: reviewSummaries };
  // }

  @ApiOperation({ summary: '리뷰 작성한 작품 조회' })
  @Render('reviewed_list.ejs')
  @Get('reviewedTitles/:userId')
  async getTitlesWithReviews(@Param('userId') userId: number) {
    const reviews = await this.reviewService.getTitlesWithReviews(userId);

    const reviewSummaries: ReviewSummaryDto[] = reviews.map((review) => {
      return new ReviewSummaryDto(review.image, review.title, review.rate);
    });

    return { reviewedWorks: reviewSummaries };
  }

  @ApiOperation({ summary: '리뷰 작성' })
  @UseGuards(AuthGuard('jwt'))
  // @Render('detailReview')
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

  @ApiOperation({ summary: '리뷰 수정' })
  @UseGuards(AuthGuard('jwt'))
  @Render('detailReview')
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

  @ApiOperation({ summary: '리뷰 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @Render('detailReview')
  @Delete('/:reviewId')
  @HttpCode(204)
  async deleteReivew(
    @UserInfo() user: Users,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    await this.reviewService.deleteReivew(user, reviewId);
  }

  @ApiOperation({ summary: '리뷰 좋아요/좋아요 취소' })
  @UseGuards(AuthGuard('jwt'))
  @Render('detailReview')
  @Post('/:reviewId/likes')
  async likeReview(
    @UserInfo() user: Users,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return await this.reviewService.likeReivew(user, reviewId);
  }
}
