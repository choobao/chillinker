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
import { WebContents } from 'src/web-content/entities/webContents.entity';
import { ReviewSummaryDto } from './dto/review.summary.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CReviews)
    private readonly chillinkerReviewsRepository: Repository<CReviews>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(PReviews)
    private readonly platformReviewsRepository: Repository<PReviews>,
    @InjectRepository(ReviewLikes)
    private readonly reveiewLikesRepository: Repository<ReviewLikes>,
    private readonly dataSource: DataSource,
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
  ) {}

  async getCReviews(
    webContentId: number,
    page?: number,
    order?: string,
    option?: string,
  ) {
    const take = 10;

    const content = await this.webContentRepository.findOne({
      where: { id: webContentId },
    });

    if (!content) {
      throw new NotFoundException('해당 작품 페이지가 존재하지 않습니다!');
    }

    if (option == 'c') {
      if (order == 'recent') {
        const reviews = await this.chillinkerReviewsRepository.findOne({
          where: { webContentId },
        });

        const totalCount = await this.chillinkerReviewsRepository.count({
          where: { webContentId },
        });
        const totalPages = Math.ceil(totalCount / take);

        const reviewList = await this.chillinkerReviewsRepository
          .createQueryBuilder('review')
          .leftJoinAndSelect('review.users', 'user') // "users"와의 관계를 기반으로 조인
          .select(['review', 'user.nickname', 'user.profileImage']) // "review"와 "user.nickname" 선택
          .where('review.webContentId = :webContentId', { webContentId }) // 조건 지정
          .orderBy('review.createdAt', 'DESC') // 정렬 조건
          .take(take)
          .skip((page - 1) * take)
          .getMany();

        return { content, reviewList, totalPages };
      } else {
        const reviews = await this.chillinkerReviewsRepository.findOne({
          where: { webContentId },
        });

        const totalCount = await this.chillinkerReviewsRepository.count({
          where: { webContentId },
        });
        const totalPages = Math.ceil(totalCount / take);

        const reviewList = await this.chillinkerReviewsRepository
          .createQueryBuilder('review')
          .leftJoinAndSelect('review.users', 'user') // "users"와의 관계를 기반으로 조인
          .select(['review', 'user.nickname', 'user.profileImage'])
          .where('review.webContentId = :webContentId', { webContentId }) // 조건 지정
          .orderBy('review.rate', 'DESC') // 정렬 조건
          .take(take)
          .skip((page - 1) * take)
          .getMany();

        return { content, reviewList, totalPages };
      }
    } else {
      const reviews = await this.platformReviewsRepository.findOne({
        where: { webContentId },
      });

      const totalCount = await this.platformReviewsRepository.count({
        where: { webContentId },
      });
      const totalPages = Math.ceil(totalCount / take);
      if (order == 'recent') {
        const reviewList = await this.platformReviewsRepository.find({
          where: { webContentId },
          order: { createDate: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });

        return { content, reviewList, totalPages };
      } else {
        const reviews = await this.platformReviewsRepository.findOne({
          where: { webContentId },
        });

        const totalCount = await this.platformReviewsRepository.count({
          where: { webContentId },
        });
        const totalPages = Math.ceil(totalCount / take);
        const reviewList = await this.platformReviewsRepository.find({
          where: { webContentId },
          order: { likeCount: 'desc' },
          take: 10,
          skip: (page - 1) * 10,
        });
        return { content, reviewList, totalPages };
      }
    }
  }

  // async getTitlesWithReviews(userId: number) {
  //   const reviews = await this.webContentRepository
  //     .createQueryBuilder('webContent')
  //     .leftJoinAndSelect('webContent.cReviews', 'review')
  //     .select(['webContent.image', 'webContent.title', 'review.rate'])
  //     .where('review.userId = :userId', { userId })
  //     .getRawMany();

  //   const reviewSummaries = reviews.map((review) => ({
  //     image: review.webContent_image,
  //     title: review.webContent_title,
  //     rate: review.review_rate,
  //   }));

  //   return reviewSummaries;
  // }

  // async getAllReviewedWorks(userId: number): Promise<CReviews[]> {
  //   // Assuming you have a method to retrieve all reviewed works
  //   return await this.chillinkerReviewsRepository.find({ where: { userId } });
  // }

  async getTitlesWithReviews(userId: number): Promise<ReviewSummaryDto[]> {
    // Fetch reviews along with necessary data (thumbnail, title, rate)
    const reviews = await this.chillinkerReviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.webContent', 'webContent')
      .select(['webContent.image', 'webContent.title', 'review.rate'])
      .where('review.userId = :userId', { userId })
      .getRawMany();

    // Map the retrieved data to objects containing thumbnail, title, and rate
    const reviewSummaries = reviews.map((review) => ({
      image: review.webContent_image,
      title: review.webContent_title,
      rate: review.review_rate,
    }));

    return reviewSummaries;
  }

  async getAllReviewedWorks(userId: number): Promise<CReviews[]> {
    // Assuming you have a method to retrieve all reviewed works
    return await this.chillinkerReviewsRepository.find({ where: { userId } });
  }

  async calculateScore(webContentId: number, rate: number) {
    const getRate = await this.webContentRepository.findOne({
      where: { id: webContentId },
    });

    const totalUser = await this.chillinkerReviewsRepository.findAndCount({
      where: { webContentId },
    });

    const score = (rate + getRate.starRate * +totalUser) / (+totalUser + 1);

    await this.webContentRepository.update(
      { id: webContentId },
      { starRate: score },
    );
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

    await this.calculateScore(webContentId, rate);

    const createReview = await this.chillinkerReviewsRepository.save({
      userId: userId,
      webContentId,
      content: content,
      rate: rate,
      isSpoiler,
    });

    //가져온 평점

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
