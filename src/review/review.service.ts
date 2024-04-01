import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { P_reviews } from './entities/platform.reviews.entity';
import { Review_likes } from './entities/review.likes.entity';
import { CreateCReviewsDto } from './dto/review.create.dto';
import { Repository } from 'typeorm';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { C_reviews } from './entities/chillinker.reivews.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(C_reviews)
    private readonly chillinkerReviewsRepository: Repository<C_reviews>,
    @InjectRepository(P_reviews)
    private readonly platformReviewsRepository: Repository<P_reviews>,
    @InjectRepository(Review_likes)
    private readonly reveiewLikesRepository: Repository<Review_likes>,
  ) {}

  async getReivew() {}

  //이 아래로는 유저정보 받아오는 로직 필요
  async createReivew(
    // user:User,
    // webContentsId:webContentsId,
    createReviewDto: CreateCReviewsDto,
  ) {
    //작품 아이디, 유저아이디, dto, reviewLikes는 default니까 필요없을듯?

    //리뷰 dto에서 받아온것을 유저 아이디와 함께 레파지토리에 저장
    const { content, rate } = createReviewDto;

    //작품당 리뷰는 한개만 가능, 리뷰 레파지토리에서 작품아이디와 유저아이디가 일치하는게 있는지 확인
    // const findUserReivew = await this.chillinkerReviewsRepository.findOne({
    //   where: { userId: user.Id, webContentsId: webContentsId },
    // });

    // if(!findUserReview){
    //     throw new ConflictException('작품에 한개의 리뷰만 작성할 수 있습니다.')
    // }

    const createReview = await this.chillinkerReviewsRepository.save({
      // userId:user.Id,
      // webContentsId:webContentsId,
      content: content,
      rate: rate,
    });

    return createReview;
  }

  async modifyReivew(
    // user:User,
    reviewId: number,
    modifyCReivewDto: ModifyCReviewsDto,
  ) {
    //리뷰 아이디, 유저 아이디, 수정dto 정보 받아오기
    // const { userId } = user;
    const { content, rate } = modifyCReivewDto;
    //레포지토리에서 리뷰를 찾아서 작성된 유저와 같다면 통과, 아니라면 안됨

    const findReivew = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    // if (findReivew.user_id !== userId) {
    //   throw new ForbiddenException('작성자만 리뷰를 수정할 수 있습니다.');
    // }

    //수정정보 업데이트
    const modifyReivew = await this.chillinkerReviewsRepository.update(
      { id: reviewId },
      modifyCReivewDto,
    );

    return modifyReivew;
  }

  async deleteReivew(
    // user:User,
    reviewId: number,
  ) {
    // const { userId } = user;
    const findReivew = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    // if (findReivew.user_id !== userId) {
    //   throw new ForbiddenException('작성자만 리뷰를 삭제할 수 있습니다.');
    // }

    const modifyReivew = await this.chillinkerReviewsRepository.delete({
      id: reviewId,
    });
  }

  async likeReivew(
    // user:User,
    reviewId: number,
  ) {
    // const { userId } = user;
    const findReivew = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    // if (findReivew.user_id == userId) {
    //   throw new ForbiddenException('본인이 쓴 리뷰에는 좋아요를 누를 수 없습니다.');
    // }

    const like = await this.reveiewLikesRepository.findOne({
      where: {
        // user_id:user.id,
        c_reveiw_id: reviewId,
      },
    });

    if (!like) {
      await this.reveiewLikesRepository.save({
        like: 1,
        // user_id: user.id,
        c_reveiw_id: reviewId,
      });

      return '해당 리뷰에 좋아요를 등록했습니다.';
    } else {
      await this.reveiewLikesRepository.update(
        {
          // user_id:user.id,
          c_reveiw_id: reviewId,
        },
        { like: 0 },
      );

      return '해당 리뷰에 좋아요를 취소했습니다.';
    }
  }
}
