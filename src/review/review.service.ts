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
import _ from 'lodash';
import { WebContentService } from '../web-content/web-content.service';
import { RedisService } from '../redis/redis.service';

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
    private readonly redisService: RedisService,
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
          .leftJoinAndSelect('review.users', 'user')
          .select(['review', 'user.nickname', 'user.profileImage', 'user.id'])
          .where('review.webContentId = :webContentId', { webContentId })
          .orderBy('review.createdAt', 'DESC')
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
          .leftJoinAndSelect('review.users', 'user')
          .select(['review', 'user.nickname', 'user.profileImage', 'user.id'])
          .where('review.webContentId = :webContentId', { webContentId })
          .orderBy('review.likeCount', 'DESC')
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

  async getTitlesWithReviews(userId: number): Promise<ReviewSummaryDto[]> {
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

    const reviewSummaries = reviews.map((review) => ({
      image: review.webContent_image,
      title: review.webContent_title,
      rate: review.review_rate,
      id: review.webContent_id,
    }));

    return reviewSummaries;
  }

  async getAllReviewedWorks(userId: number): Promise<CReviews[]> {
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

  async getTopReviews(
    user: Users | boolean | null,
    page?: number,
    order?: string,
  ) {
    const perPage = 10;

    page = page ? page : 1;

    let skip = (page - 1) * perPage;

    var today = new Date();
    var threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const reviewsCount = await this.reviewLikesRepository
      .createQueryBuilder('reviewLikes')
      .select('reviewLikes.cReviewId')
      .innerJoin('reviewLikes.cReviews', 'cReviews')
      .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo })
      .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false })
      .getRawMany();

    const uniqueReviewsCount = new Set(
      reviewsCount.map((item) => item.reviewLikes_c_review_id),
    ).size;

    console.log(uniqueReviewsCount);
    const totalPages = Math.ceil(uniqueReviewsCount / perPage);

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
        .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo })
        .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false })
        .groupBy('reviewLikes.cReviewId')
        .orderBy('cReviews.createdAt', 'DESC')
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      return { reviews: this.blindAdultImage(user, reviews), totalPages };
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
        .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo })
        .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false })
        .groupBy('reviewLikes.cReviewId')
        .orderBy('cReviews.likeCount', 'DESC')
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      console.log(reviews.length);

      return { reviews: this.blindAdultImage(user, reviews), totalPages };
    }
  }

  async top10Reviews(user: Users | boolean | null) {
    try {
      let reviews = await this.redisService.getCachedData('top10Reviews');
      if (_.isNil(reviews)) {
        var today = new Date();
        var threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        reviews = await this.reviewLikesRepository
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
          .where('reviewLikes.createdAt >= :threeDaysAgo', { threeDaysAgo })
          .andWhere('cReviews.isSpoiler = :isSpoiler', { isSpoiler: false })
          .groupBy('reviewLikes.cReviewId')
          .orderBy('cReviews.likeCount', 'DESC')
          .limit(10)
          .getRawMany();

        await this.redisService.cacheData('top10Reviews', reviews, 3 * 3600);
      }

      reviews = this.blindAdultImage(user, reviews);

      return reviews;
    } catch (err) {
      throw err;
    }
  }

  blindAdultImage(user, contents) {
    if (
      user === false ||
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      const adult_image =
        'https://ssl.pstatic.net/static/m/nstore/thumb/19/home_book_4.png';
      contents.map((content) => {
        if (content.is_adult === 1) {
          content.image = adult_image;
        }
        return content;
      });
    }
    return contents;
  }

  isAdult(user) {
    const userInfo = { isAdult: 1 };
    if (
      user === false ||
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      userInfo.isAdult = 0;
    }
    return userInfo;
  }
}
