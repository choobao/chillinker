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
  let dataSource: DataSource;
  let service: ReviewService;

  beforeEach(async () => {
    cReviewRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

    const dataSourceMock = {
      transaction: jest.fn().mockImplementation(async (runInTransaction) => {
        return await runInTransaction();
      }),
    };

    //레디스와 configService도 넣기?
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

    const mockLikeReivew = {
      id: 1,
      like: 1,
      userId: 7,
      webContentId: 1,
    } as unknown as ReviewLikes;
    it('should throw error if reivew does not exist,', async () => {
      cReviewRepository.findOne.mockResolvedValue(null);

      expect(service.likeReview(mockUser, mockReivew.id)).rejects.toThrow();
    });

    it('should throw error if user is equeal of the reivew wirter,', async () => {
      cReviewRepository.findOne.mockResolvedValue({ userId: 1 });

      expect(service.likeReview(mockUser, mockReivew.id)).rejects.toThrow();
    });

    it('should increment the likeCount column in the database by 1 if there is no existing entry in the database,', async () => {
      //트랜잭션은 테코 어케하즤?
      //리뷰를 정상적으로 찾고, 본인이 쓴것이 아님을 확인했다는조건에서
      //리뷰라이크테이블에 같은게 존재하지않는다면 저장하고 해당 리뷰 좋아요카운트 +1한다
      //리뷰라이크테이블에 같은게 존재한다면 삭제하고 해당 리뷰 좋아요카운트 -1한다
      cReviewRepository.findOne.mockResolvedValue(mockLikeReivew);
      cReviewRepository.findOne.mockResolvedValue({ userId: 7 });
      reviewLikesRepository.findOne(mockLikeReivew);
    });
  });
});
