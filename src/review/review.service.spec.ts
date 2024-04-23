import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { DataSource, Repository } from 'typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Users } from '../user/entities/user.entity';
import { CReviews } from './entities/chillinker.reviews.entity';
import { ReviewLikes } from './entities/review.likes.entity';
import { ModifyOptions } from 'joi';
import { ModifyCReviewsDto } from './dto/review.modify.dto';
import { CreateCReviewsDto } from './dto/review.create.dto';

describe('ReviewService', () => {
  let cReviewRepository: Partial<Record<keyof Repository<CReviews>, jest.Mock>>;
  let userRepository: Partial<Record<keyof Repository<Users>, jest.Mock>>;
  let pReviewRepository: Partial<Record<keyof Repository<PReviews>, jest.Mock>>;
  let reviewLikesRepository: Partial<
    Record<keyof Repository<ReviewLikes>, jest.Mock>
  >;
  let contentRepository: Partial<
    Record<keyof Repository<WebContents>, jest.Mock>
  >;

  let service: ReviewService;

  interface DataSource {
    createQueryRunner: () => any;
  }

  let dataSourceMock: DataSource;

  beforeEach(async () => {
    dataSourceMock = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        manager: {
          save: jest.fn(),
        },
      })),
    };

    cReviewRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnThis(),
      }),
    };

    contentRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };

    reviewLikesRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(CReviews),
          useValue: cReviewRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(PReviews),
          useValue: pReviewRepository,
        },
        {
          provide: getRepositoryToken(ReviewLikes),
          useValue: reviewLikesRepository,
        },
        {
          provide: getRepositoryToken(WebContents),
          useValue: contentRepository,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<ReviewService>(ReviewService);
  });

  describe('deleteReview', () => {
    const mockUser = {
      id: 1,
      email: 'test@naver.com',
      password: 'dummyPassword',
      nickname: '테스트',
      intro: '잘살아보세',
      profileImage: null,
      createdAt: new Date('2024-04-17T23:09:37.423Z'),
    } as unknown as Users;

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

    const mockReview = {
      id: 1,
      content: '테스트 리뷰.',
      likeCount: 0,
      rate: 5,
      userId: 1,
      isSpoiler: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      webContentId: 1,
      users: mockUser,
      webContent: mockWebContent,
      reviewLike: [],
    } as unknown as CReviews;

    it('should throw error if reivew does not exist', async () => {
      cReviewRepository.findOne.mockResolvedValue(null);

      expect(service.deleteReview(mockUser, 1, 1)).rejects.toThrow();
    });

    it('should thorw error if user is not the writer of the review', async () => {
      cReviewRepository.findOne.mockResolvedValue({ userId: 9 });

      expect(service.deleteReview(mockUser, 1, 3)).rejects.toThrow();
    });

    it('should delete the review and confirm delete from the database', async () => {
      const mockGetRate = { starRate: 5 };
      const mockTotalUser = 1;

      cReviewRepository.findOne.mockResolvedValue(mockReview);
      cReviewRepository.delete.mockResolvedValue(undefined);
      contentRepository.findOne.mockResolvedValue(mockGetRate);
      contentRepository.count.mockResolvedValue(mockTotalUser);

      await service.deleteReview(mockUser, mockWebContent.id, mockReview.id);

      const mockScore = 5;

      contentRepository.update(
        { id: mockWebContent.id },
        { starRate: mockScore },
      );

      expect(cReviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReview.id },
      });
      expect(cReviewRepository.delete).toHaveBeenCalledWith({
        id: mockReview.id,
      });
      cReviewRepository.findOne.mockRejectedValue(null);
    });
  });

  describe('modifyReivew', () => {
    const mockUser = {
      id: 1,
      email: 'test@naver.com',
      password: 'dummyPassword',
      nickname: '테스트',
      intro: '잘살아보세',
      profileImage: null,
      createdAt: new Date('2024-04-17T23:09:37.423Z'),
    } as unknown as Users;

    const mockReivew = {
      id: 1,
      content: '테스트 리뷰.',
      likeCount: 0,
      rate: 5,
      userId: 1,
      isSpoiler: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      webContentId: 1,
    } as unknown as CReviews;

    const mockModifyReviewDto = {
      content: '수정할게요',
      rate: 3,
      isSpoiler: true,
    } as unknown as ModifyCReviewsDto;

    const mockModifyReview = {
      id: 1,
      content: '수정할게요',
      likeCount: 0,
      rate: 3,
      userId: 1,
      isSpoiler: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      webContentId: 1,
    } as unknown as CReviews;

    it('should throw error if reivew does not exist', async () => {
      cReviewRepository.findOne.mockResolvedValue(null);

      expect(
        service.modifyReivew(mockUser, 7, 6, mockModifyReviewDto),
      ).rejects.toThrow();
    });

    it('should thorw error if user is not the writer of the review', async () => {
      cReviewRepository.findOne.mockResolvedValue({ userId: 9 });

      expect(
        service.modifyReivew(mockUser, 1, 3, mockModifyReviewDto),
      ).rejects.toThrow();
    });

    it('should modify the review and confirm modify from the database', async () => {
      const formattedScore = 9;
      const mockGetRate = { starRate: 5 };
      const mockTotalUser = 1;

      cReviewRepository.findOne.mockResolvedValue(mockReivew);
      cReviewRepository.findOne.mockResolvedValue({ userId: 1 });
      contentRepository.findOne.mockResolvedValue(mockGetRate);
      contentRepository.count.mockResolvedValue(mockTotalUser);
      cReviewRepository.update.mockResolvedValue(mockModifyReviewDto);

      await service.modifyReivew(
        mockUser,
        mockReivew.webContentId,
        mockReivew.id,
        mockModifyReviewDto,
      );

      contentRepository.update(
        { id: mockReivew.webContentId },
        { starRate: formattedScore },
      );

      expect(cReviewRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockReivew.id },
      });
      expect(cReviewRepository.update).toHaveBeenCalledWith(
        { id: mockReivew.id },
        mockModifyReviewDto,
      );
      cReviewRepository.findOne.mockResolvedValue(mockModifyReview);
    });
  });

  describe('likeReview', () => {
    const mockUser = {
      id: 7,
      email: 'test@naver.com',
      password: 'dummyPassword',
      nickname: '테스트',
      intro: '잘살아보세',
      profileImage: null,
      createdAt: new Date('2024-04-17T23:09:37.423Z'),
    } as unknown as Users;

    const mockReview = {
      id: 1,
      content: '테스트 리뷰.',
      likeCount: 3,
      rate: 5,
      userId: 3,
      isSpoiler: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      webContentId: 1,
    } as unknown as CReviews;

    const mocklikeReview = {
      id: 1,
      content: '테스트 리뷰.',
      likeCount: 4,
      rate: 5,
      userId: 3,
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

    it('should throw error if reivew does not exist,', async () => {
      cReviewRepository.findOne.mockResolvedValue(null);

      expect(service.likeReview(mockUser, mockReview.id)).rejects.toThrow();
    });

    it('should throw error if user is equeal of the reivew wirter,', async () => {
      cReviewRepository.findOne.mockResolvedValue({ userId: 1 });

      expect(service.likeReview(mockUser, mockReview.id)).rejects.toThrow();
    });

    it('should throw BadRequestException when liking a review fails', async () => {
      await expect(
        service.likeReview(mockUser, mockReview.id),
      ).rejects.toThrow();
    });

    // it('should decrement the likeCount column in the database by 1 if there is a entry in the database', async () => {
    //   cReviewRepository.findOne.mockResolvedValue(mockReview);
    //   reviewLikesRepository.findOne.mockResolvedValue(undefined);

    //   reviewLikesRepository.save.mockResolvedValue({});
    //   const expectedResult = '해당 리뷰에 좋아요를 등록했습니다.';

    //   // cReviewRepository.save.mockResolvedValue(mockReview);

    //   const result = await service.likeReview(mockUser, mockReview.id);

    //   expect(result).toEqual(expectedResult);
    //   expect(mockReview.likeCount).toEqual(4);

    //   expect(cReviewRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: mockReview.id },
    //   });
    //   expect(reviewLikesRepository.findOne).toHaveBeenCalledWith({
    //     where: { userId: mockLikeReivew.id, cReviewId: mockLikeReivew.id },
    //   });
    //   expect(reviewLikesRepository.save).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       userId: mockUser.id,
    //       cReviewId: mockReview.id,
    //     }),
    //   );
  });

  //   it('should like a review if user has not liked it before', async () => {
  //     const mockUser: Users = { id: 1 } as any;
  //     const mockReviewId = 1;
  //     const mockReview: CReviews = { id: 1, userId: 2, likeCount: 0 } as any;
  //     const mockLike = null;
  //     cReviewRepository.findOne.mockResolvedValue(mockReview);
  //     reviewLikesRepository.findOne.mockResolvedValue(mockLike);
  //     reviewLikesRepository.save.mockResolvedValue({});
  //     const expectedResult = '해당 리뷰에 좋아요를 등록했습니다.';

  //     const result = await service.likeReview(mockUser, mockReviewId);

  //     expect(result).toEqual(expectedResult);
  //     expect(mockReview.likeCount).toEqual(1);
  //   });
  // });

  describe('createReview', () => {
    const mockUser = {
      id: 1,
      email: 'test@naver.com',
      password: 'dummyPassword',
      nickname: '테스트',
      intro: '잘살아보세',
      profileImage: null,
      createdAt: new Date('2024-04-17T23:09:37.423Z'),
    } as unknown as Users;

    const mockCreateReviewDto = {
      content: '테스트 리뷰',
      rate: 3,
      isSpoiler: true,
    } as unknown as CreateCReviewsDto;

    const mockReview = {
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

    const webContentId = 1;

    //해당 아이디로 리뷰 db에 리뷰가 존재하면 오류
    it('should be error if user already create review before same content', async () => {
      cReviewRepository.findOne.mockResolvedValue(mockReview);

      expect(
        service.createReivew(mockUser, webContentId, mockCreateReviewDto),
      ).rejects.toThrow();
    });

    //없을경우 디비에 저장
    it('should be save if user does not create review before same content', async () => {
      const mockGetRate = { starRate: 5 };
      const mockTotalUser = 1;
      const mockScore = 5;

      cReviewRepository.findOne.mockResolvedValue(null);
      cReviewRepository.save.mockResolvedValue(mockReview);
      contentRepository.findOne.mockResolvedValue(mockGetRate);
      contentRepository.count.mockResolvedValue(mockTotalUser);

      const result = await service.createReivew(
        mockUser,
        webContentId,
        mockCreateReviewDto,
      );

      contentRepository.update({ id: webContentId }, { starRate: mockScore });

      expect(result).toBe(mockReview);
    });
  });

  describe('calculateScore', () => {
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
    const totalUser = 70;
    const webContentId = mockWebContent.id;

    it('should have return getRate, totalUser', async () => {
      contentRepository.findOne.mockResolvedValue(mockWebContent);
      cReviewRepository.count.mockResolvedValue(totalUser);

      const result = await service.calculateScore(webContentId);

      expect(result).toEqual({ getRate: mockWebContent, totalUser });
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: webContentId },
      });
      expect(cReviewRepository.count).toHaveBeenCalledWith({
        where: { webContentId },
      });
    });
  });

  describe('getCReviews', () => {
    const webContentId = 1;

    const webContent = {
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

    const reviews = [{ reviewOne }, { reviewTwo }, { reviewThree }];

    //웹컨텐츠가 존재하지않으면 오류
    it('if exist webContent, throw error', async () => {
      contentRepository.findOne.mockResolvedValue(null);

      expect(service.getCReviews(webContentId)).rejects.toThrow();
    });

    //옵션=c 이고 order=recent일 경우 리뷰 출력
    it('if option = c and order = recent return correct reviews', async () => {
      contentRepository.findOne.mockResolvedValue(webContent);
      cReviewRepository.findOne.mockResolvedValue(reviews);
      cReviewRepository.count.mockResolvedValue(3);

      cReviewRepository.createQueryBuilder().getMany.mockResolvedValue([]);

      const result = await service.getCReviews(webContent.id, 1, 'recent', 'c');

      expect(
        cReviewRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        content: webContent,
        reviewList: [],
        totalPages: 1,
      });
    });
    //옵션=c 아니고 order-recent일 경우 리뷰 출력
  });
});
