import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { CReviews } from './entities/chillinker.reviews.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { CreateCReviewsDto } from './dto/review.create.dto';

describe('ReviewController', () => {
  let controller: ReviewController;

  const reviewService = {
    getCReivew: jest.fn(),
    likeReview: jest.fn(),
    getTitlesWithReviews: jest.fn(),
    createReview: jest.fn(),
    modifyReview: jest.fn(),
    deleteReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: reviewService,
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  ///////////
  const webContentId = 1;

  const mockWebContent = {
    id: 3,
    title: '화산귀환',
    contentType: '웹툰',
    isAdult: 0,
    author: 'Author/LICO, original_author/비가',
    platform: { naver: 'url' },
    category: '무협',
    image: 'image-url',
    pReviews: [],
    cReviews: [],
  } as unknown as WebContents;

  const mockUser = {
    id: 1,
    email: 'test@naver.com',
    password: 'dummyPassword',
    nickname: '테스트',
    intro: '잘살아보세',
    profileImage: null,
    createdAt: new Date('2024-04-17T23:09:37.423Z'),
  } as unknown as Users;

  const reviewOne = {
    id: 1,
    content: '테스트 리뷰.',
    likeCount: 0,
    rate: 3,
    userId: 1,
    isSpoiler: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    webContentId: 1,
  } as unknown as CReviews;

  const reviewTwo = {
    id: 2,
    content: '두번째 테스트.',
    likeCount: 2,
    rate: 3,
    userId: 2,
    isSpoiler: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    webContentId: 1,
  } as unknown as CReviews;

  const reviewThree = {
    id: 3,
    content: '세번째 테스트.',
    likeCount: 2,
    rate: 3,
    userId: 3,
    isSpoiler: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    webContentId: 1,
  } as unknown as CReviews;

  const reviewList = [reviewOne, reviewTwo, reviewThree];

  const modifyReview = {
    id: 1,
    content: '수정할게요.',
    likeCount: 0,
    rate: 3,
    userId: 1,
    isSpoiler: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    webContentId: 1,
  } as unknown as CReviews;

  const mockLikeReivew = {
    id: 1,
    userId: 7,
    webContentId: 1,
    cReviewId: 1,
  } as unknown as ReviewLikes;

  const mockModifyReviewDto = {
    content: '수정할게요',
    rate: 3,
    isSpoiler: true,
  } as unknown as ModifyCReviewsDto;

  const mockCreateReviewDto = {
    content: '테스트 리뷰',
    rate: 3,
    isSpoiler: true,
  } as unknown as CreateCReviewsDto;

  // it('should be return correct reviewList', async () => {
  //   const totalPage = 1;
  //   const option = 'c';
  //   const order = 'recent';
  //   const result = { mockWebContent, reviewList, totalPage };
  //   reviewService.getCReivew.mockResolvedValue(result);

  //   const act = await controller.getCReivew(webContentId, 1, order, option);

  //   expect(reviewService.getCReivew).toHaveBeenCalledTimes(1);
  //   expect(reviewService.getCReivew).toHaveBeenCalledWith(
  //     webContentId,
  //     1,
  //     order,
  //     option,
  //   );
  //   expect(act).toEqual({
  //     mockWebContent,
  //     reviewList,
  //     totalPage,
  //     page: 1,
  //     order,
  //     option,
  //   });
  // });

  it('should call likeReview method of reviewService with correct parameters', async () => {
    reviewService.likeReview.mockResolvedValue(mockLikeReivew);

    const result = await controller.likeReview(mockUser, reviewOne.id);

    expect(result).toEqual(mockLikeReivew);
    expect(reviewService.likeReview).toHaveBeenCalledWith(
      mockUser,
      reviewOne.id,
    );
  });

  // it('should create a review when user is authenticated', async () => {
  //   const webContentsId = 1;

  //   reviewService.createReview.mockResolvedValue(reviewOne);

  //   const result = await controller.createReview(
  //     webContentsId,
  //     mockUser,
  //     mockCreateReviewDto,
  //   );

  //   expect(result).toEqual(reviewOne);
  //   expect(reviewService.createReview).toHaveBeenCalledWith(
  //     mockUser,
  //     webContentsId,
  //     mockCreateReviewDto,
  //   );
  // });

  it('should throw an error if user is not authenticated', async () => {
    const user = null;
    const webContentsId = 1;

    await expect(
      controller.createReview(webContentsId, user, mockCreateReviewDto),
    ).rejects.toThrow();
  });

  // it('should modify a review when user is authenticated', async () => {
  //   const webContentsId = 1;
  //   const reviewId = 1;

  //   reviewService.modifyReview.mockResolvedValue(modifyReview);

  //   const result = await controller.modifyReview(
  //     mockUser,
  //     webContentsId,
  //     reviewId,
  //     mockModifyReviewDto,
  //   );

  //   expect(result).toEqual(modifyReview);
  //   expect(reviewService.modifyReview).toHaveBeenCalledWith(
  //     mockUser,
  //     webContentsId,
  //     reviewId,
  //     mockModifyReviewDto,
  //   );
  // });

  it('should delete a review when user is authenticated', async () => {
    const webContentsId = 1;
    const reviewId = 1;

    reviewService.deleteReview.mockResolvedValue(undefined);

    await controller.deleteReview(mockUser, webContentsId, reviewId);

    expect(reviewService.deleteReview).toHaveBeenCalledWith(
      mockUser,
      webContentsId,
      reviewId,
    );
  });
});
