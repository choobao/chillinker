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
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { Users } from '../user/entities/user.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { CReviews } from './entities/chillinker.reviews.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { WebContents } from '../web-content/entities/webContents.entity';
import { ReviewSummaryDto } from './dto/review.summary.dto';
import { SseService } from 'src/sse/sse.service';
import _ from 'lodash';
import { WebContentService } from 'src/web-content/web-content.service';

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
    private readonly reviewLikesRepository: Repository<ReviewLikes>,
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
    private readonly dataSource: DataSource,
    private readonly webContentService: WebContentService,
  ) {}

  isOver19(birthDate: Date) {
    const today = new Date();
    const date19YearsAgo = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate(),
    );
    return birthDate <= date19YearsAgo;
  }

  async getCReviews(
    webContentId: number,
    user,
    page?: number,
    order?: string,
    option?: string,
  ) {
    const take = 10;

    const content = await this.webContentService.getOneWebContent(
      user,
      webContentId,
    );

    if (
      content.isAdult &&
      (_.isNil(user) ||
        _.isNil(user.birthDate) ||
        !this.isOver19(new Date(user.birthDate)))
    ) {
      throw new UnauthorizedException('19세 이상만 이용가능한 작품입니다.');
    }

    let myReview = {};

    if (user !== false) {
      myReview = await this.chillinkerReviewsRepository.findOne({
        where: { userId: user.id, webContentId },
      });
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
          .select(['review', 'user.nickname', 'user.profileImage', 'user.id']) // "review"와 "user.nickname" 선택
          .where('review.webContentId = :webContentId', { webContentId }) // 조건 지정
          .orderBy('review.createdAt', 'DESC') // 정렬 조건
          .take(take)
          .skip((page - 1) * take)
          .getMany();

        return { content, reviewList, totalPages, myReview };
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
          .select(['review', 'user.nickname', 'user.profileImage', 'user.id'])
          .where('review.webContentId = :webContentId', { webContentId }) // 조건 지정
          .orderBy('review.likeCount', 'DESC') // 정렬 조건
          .take(take)
          .skip((page - 1) * take)
          .getMany();

        return { content, reviewList, totalPages, myReview };
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

        return { content, reviewList, totalPages, myReview };
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
        return { content, reviewList, totalPages, myReview };
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
      .select([
        'webContent.image',
        'webContent.title',
        'review.rate',
        'webContent.id',
      ])
      .where('review.userId = :userId', { userId })
      .getRawMany();

    // Map the retrieved data to objects containing thumbnail, title, and rate
    const reviewSummaries = reviews.map((review) => ({
      image: review.webContent_image,
      title: review.webContent_title,
      rate: review.review_rate,
      id: review.webContent_id,
    }));

    return reviewSummaries;
  }

  async getAllReviewedWorks(userId: number): Promise<CReviews[]> {
    // Assuming you have a method to retrieve all reviewed works
    return await this.chillinkerReviewsRepository.find({ where: { userId } });
  }

  async calculateScore(webContentId: number) {
    const getRate = await this.webContentRepository.findOne({
      where: { id: webContentId },
    });

    const totalUser = await this.chillinkerReviewsRepository.count({
      where: { webContentId },
    });

    return { getRate, totalUser };
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

    const { getRate, totalUser } = await this.calculateScore(webContentId);

    const score = (rate + getRate.starRate * +totalUser) / (+totalUser + 1);

    const formattedScore = parseFloat(score.toFixed(1));

    await this.webContentRepository.update(
      { id: webContentId },
      { starRate: formattedScore },
    );

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
    webContentId: number,
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

    const { getRate, totalUser } = await this.calculateScore(webContentId);

    const score =
      (getRate.starRate * +totalUser - findReivew.rate + rate) / totalUser;

    const formattedScore = parseFloat(score.toFixed(1));

    await this.webContentRepository.update(
      { id: webContentId },
      { starRate: formattedScore },
    );

    //수정정보 업데이트
    const modifyReivew = await this.chillinkerReviewsRepository.update(
      { id: reviewId },
      modifyCReivewDto,
    );
  }

  async deleteReview(user: Users, webContentId: number, reviewId: number) {
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

    const { getRate, totalUser } = await this.calculateScore(webContentId);

    if (totalUser === 1) {
      await this.webContentRepository.update(
        { id: webContentId },
        { starRate: 0 },
      );
    } else {
      const score =
        (getRate.starRate * +totalUser - findReivew.rate) / (totalUser - 1);

      const formattedScore = parseFloat(score.toFixed(1));

      await this.webContentRepository.update(
        { id: webContentId },
        { starRate: formattedScore },
      );
    }

    const deleteReivew = await this.chillinkerReviewsRepository.delete({
      id: reviewId,
    });
  }

  async likeReview(user: Users, reviewId: number) {
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

      const like = await this.reviewLikesRepository.findOne({
        where: {
          userId: userId,
          cReviewId: reviewId,
        },
      });

      if (!like) {
        await this.reviewLikesRepository.save({
          userId: userId,
          cReviewId: reviewId,
        });

        findReview.likeCount += 1;
      } else {
        await this.reviewLikesRepository.delete({
          userId: userId,
          cReviewId: reviewId,
        });

        findReview.likeCount -= 1;
      }
      await this.chillinkerReviewsRepository.save(findReview);

      // //테스트용
      // this.sseEvent(
      //   findReview.webContentId,
      //   findReview.userId,
      //   findReview.likeCount,
      // );

      // if (findReview.likeCount <= 100) {
      //   if (findReview.likeCount % 20 == 0) {
      //     this.sseEvent(
      //       findReview.webContentId,
      //       findReview.userId,
      //       findReview.likeCount,
      //     );
      //   }
      // } else {
      //   if (findReview.likeCount % 50 == 0) {
      //     this.sseEvent(
      //       findReview.webContentId,
      //       findReview.userId,
      //       findReview.likeCount,
      //     );
      //   }
      // }

      await queryRunner.commitTransaction();

      return like
        ? '해당 리뷰에 좋아요를 취소했습니다.'
        : '해당 리뷰에 좋아요를 등록했습니다.';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err);
      throw new BadRequestException('리뷰 좋아요에 실패하였습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  // async sseEvent(webContentId: number, userId: number, likeCount: number) {
  //   const webContent = await this.webContentRepository.findOne({
  //     where: { id: webContentId },
  //   });
  //   this.sseService.emitReviewLikeCountEvent(
  //     webContent.title,
  //     userId,
  //     likeCount,
  //   );
  // }

  async getTopReviews(page?: number, order?: string) {
    const perPage = 10;

    page = page ? page : 1;

    let skip = (page - 1) * perPage;
    // skip = isNaN(skip) ? 0 : skip;

    //오늘 날짜와 이전 날짜 계산
    var today = new Date();
    var threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const reviewsCount = await this.reviewLikesRepository
      .createQueryBuilder('reviewLikes')
      .select('reviewLikes.cReviewId')
      .innerJoin('reviewLikes.cReviews', 'cReviews')
      .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo }) // createdAt이 오늘로부터 3일 이후인 경우
      .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false }) // isSpoiler가 false인 경우만 포함
      .getRawMany();

    const uniqueReviewsCount = new Set(
      reviewsCount.map((item) => item.reviewLikes_c_review_id),
    ).size;

    console.log(uniqueReviewsCount);
    const totalPages = Math.ceil(uniqueReviewsCount / perPage);

    //리뷰라잌스 테이블에서 최신(createdAt 3일이내) 최대 100개 뽑아옴

    //성인작품 가져올까말까 고민..
    if (order === 'recent') {
      const reviews = await this.reviewLikesRepository
        .createQueryBuilder('reviewLikes')
        .select('reviewLikes.cReviewId, COUNT(*) as count')
        .addSelect('cReviews')
        .addSelect('users')
        .addSelect(
          'webContents.id, webContents.title, webContents.image, webContents.likeCount, webContents.starRate, webContents.isAdult, webContents.author',
        )
        .innerJoin('reviewLikes.cReviews', 'cReviews')
        .innerJoin('cReviews.users', 'users')
        .innerJoin('cReviews.webContent', 'webContents')
        .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo }) // createdAt이 오늘로부터 3일 이후인 경우
        .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false }) // isSpoiler가 false인 경우만 포함
        .groupBy('reviewLikes.cReviewId')
        .orderBy('cReviews.createdAt', 'DESC')
        .offset(skip) // 페이지에 따라 스킵하는 수 계산
        .limit(perPage) // 페이지당 아이템 수 설정
        .getRawMany();

      return { reviews, totalPages };
    } else {
      const reviews = await this.reviewLikesRepository
        .createQueryBuilder('reviewLikes')
        .select('reviewLikes.cReviewId, COUNT(*) as count')
        .addSelect('cReviews')
        .addSelect('users')
        .addSelect(
          'webContents.id, webContents.title, webContents.image, webContents.likeCount, webContents.starRate, webContents.isAdult, webContents.author',
        )
        .innerJoin('reviewLikes.cReviews', 'cReviews')
        .innerJoin('cReviews.users', 'users')
        .innerJoin('cReviews.webContent', 'webContents')
        .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo }) // createdAt이 오늘로부터 3일 이후인 경우
        .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false }) // isSpoiler가 false인 경우만 포함
        .groupBy('reviewLikes.cReviewId')
        .orderBy('count', 'DESC')
        .offset(skip) // 페이지에 따라 스킵하는 수 계산
        .limit(perPage) // 페이지당 아이템 수 설정
        .getRawMany();

      console.log(reviews.length);

      return { reviews, totalPages };
    }
  }

  async top10Reviews() {
    var today = new Date();
    var threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const reviews = await this.reviewLikesRepository
      .createQueryBuilder('reviewLikes')
      .select('reviewLikes.cReviewId, COUNT(*) as count')
      .addSelect('cReviews')
      .addSelect('users')
      .addSelect(
        'webContents.id, webContents.title, webContents.image, webContents.likeCount, webContents.starRate, webContents.isAdult, webContents.author',
      )
      .innerJoin('reviewLikes.cReviews', 'cReviews')
      .innerJoin('cReviews.users', 'users')
      .innerJoin('cReviews.webContent', 'webContents')
      .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo }) // createdAt이 오늘로부터 3일 이후인 경우
      .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false }) // isSpoiler가 false인 경우만 포함
      .groupBy('reviewLikes.cReviewId')
      .orderBy('count', 'DESC')
      .limit(10) // 페이지당 아이템 수 설정
      .getRawMany();

    return reviews;
  }
}
