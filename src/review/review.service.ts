import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCReviewsDto } from './dto/review.create.dto';
import { DataSource, Repository } from 'typeorm';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { Users } from 'src/user/entities/user.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { CReviews } from './entities/chillinker.reviews.entity';
import { PReviews } from './entities/platform.reviews.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CReviews)
    private readonly chillinkerReviewsRepository: Repository<CReviews>,
    @InjectRepository(PReviews)
    private readonly platformReviewsRepository: Repository<PReviews>,
    @InjectRepository(ReviewLikes)
    private readonly reveiewLikesRepository: Repository<ReviewLikes>,
    private readonly dataSource: DataSource,
  ) {}

  async getCReviews(
    webContentId: number,
    page?: number,
    order?: string,
    option?: string,
  ) {
    //option = c, p
    //order은 등록순(recent,만들어진 최신순), 인기순(popular,좋아요순)필요
    if (option == 'c') {
      if (order == 'recent') {
        const reviews = await this.chillinkerReviewsRepository.findOne({
          where: { webContentId },
        });
        if (!reviews) {
          throw new NotFoundException(
            '작품에 작성된 리뷰가 존재하지 않습니다.',
          );
        }
        const recentReviews = await this.chillinkerReviewsRepository.find({
          where: { webContentId },
          order: { createdAt: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });

        return recentReviews;
      } else {
        const reviews = await this.chillinkerReviewsRepository.findOne({
          where: { webContentId },
        });
        if (!reviews) {
          throw new NotFoundException(
            '작품에 작성된 리뷰가 존재하지 않습니다.',
          );
        }
        const defaultReivews = await this.chillinkerReviewsRepository.find({
          where: { webContentId },
          order: { likeCount: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });
        return defaultReivews;
      }
    } else {
      const reviews = await this.platformReviewsRepository.findOne({
        where: { webContentId },
      });
      if (!reviews) {
        throw new NotFoundException('작품에 작성된 리뷰가 존재하지 않습니다.');
      }
      if (order == 'recent') {
        const recentReviews = await this.platformReviewsRepository.find({
          where: { webContentId },
          order: { createDate: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });

        return recentReviews;
      } else {
        const reviews = await this.platformReviewsRepository.findOne({
          where: { webContentId },
        });
        if (!reviews) {
          throw new NotFoundException(
            '작품에 작성된 리뷰가 존재하지 않습니다.',
          );
        }
        const defaultReivews = await this.platformReviewsRepository.find({
          where: { webContentId },
          order: { likeCount: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });
        return defaultReivews;
      }
    }
  }

  async createReivew(
    user: Users,
    webContentId: number,
    createReviewDto: CreateCReviewsDto,
  ) {
    const userId = user.id;
    const { content, rate, isSpoiler } = createReviewDto;

    const findUserReiew = await this.chillinkerReviewsRepository.findOne({
      where: { userId, webContentId },
    });

    if (findUserReiew) {
      throw new ConflictException('작품에 한개의 리뷰만 작성할 수 있습니다.');
    }

    const createReview = await this.chillinkerReviewsRepository.save({
      userId: userId,
      webContentId,
      content: content,
      rate: rate,
      isSpoiler,
    });

    return createReview;
  }

  async modifyReivew(
    user: Users,
    reviewId: number,
    modifyCReivewDto: ModifyCReviewsDto,
  ) {
    const userId = user.id;
    const { content, rate, isSpoiler } = modifyCReivewDto;

    const findReivew = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!findReivew) {
      throw new ForbiddenException('해당 리뷰가 존재하지 않습니다.');
    }

    if (findReivew.userId !== userId) {
      throw new ForbiddenException('작성자만 리뷰를 수정할 수 있습니다.');
    }

    //수정정보 업데이트
    const modifyReivew = await this.chillinkerReviewsRepository.update(
      { id: reviewId },
      modifyCReivewDto,
    );
  }

  async deleteReivew(user: Users, reviewId: number) {
    const userId = user.id;
    const findReivew = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!findReivew) {
      throw new ForbiddenException('해당 리뷰가 존재하지 않습니다.');
    }

    if (findReivew.userId !== userId) {
      throw new ForbiddenException('작성자만 리뷰를 삭제할 수 있습니다.');
    }

    const deleteReivew = await this.chillinkerReviewsRepository.delete({
      id: reviewId,
    });
  }

  async likeReivew(user: Users, reviewId: number) {
    const userId = user.id;

    const queryRunner = this.dataSource.createQueryRunner();

    const findReview = await this.chillinkerReviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!findReview) {
      throw new NotFoundException('해당 리뷰를 찾을 수 없습니다.');
    }

    if (findReview.userId == userId) {
      throw new ForbiddenException(
        '본인이 쓴 리뷰에는 좋아요를 누를 수 없습니다.',
      );
    }

    try {
      queryRunner.connect();
      queryRunner.startTransaction();

      const like = await this.reveiewLikesRepository.findOne({
        where: {
          userId: userId,
          cReviewId: reviewId,
        },
      });

      if (!like) {
        await this.reveiewLikesRepository.save({
          like: 1,
          userId: userId,
          cReviewId: reviewId,
        });

        findReview.likeCount += 1;
      } else {
        await this.reveiewLikesRepository.delete({
          userId: userId,
          cReviewId: reviewId,
        });

        findReview.likeCount -= 1;
      }
      await this.chillinkerReviewsRepository.save(findReview);

      await queryRunner.commitTransaction();

      return like
        ? '해당 리뷰에 좋아요를 취소했습니다.'
        : '해당 리뷰에 좋아요를 등록했습니다.';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('리뷰 좋아요에 실패하였습니다.');
    } finally {
      await queryRunner.release();
    }
  }
}
