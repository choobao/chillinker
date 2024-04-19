import { Test, TestingModule } from '@nestjs/testing';
import { WebContentService } from './web-content.service';
import { Repository } from 'typeorm';
import { WebContents } from './entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentType } from './webContent.type';
import { InternalServerErrorException } from '@nestjs/common';

describe('WebContentService', () => {
  let service: WebContentService;
  let webContentRepository: Partial<
    Record<keyof Repository<WebContents>, jest.Mock>
  >;
  let userRepository: Partial<Record<keyof Repository<Users>, jest.Mock>>;
  let collectionRepository: Partial<
    Record<keyof Repository<Collections>, jest.Mock>
  >;

  beforeEach(async () => {
    webContentRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockReturnValue([]),
        getMany: jest.fn().mockReturnValue([]),
      }),
      findOne: jest.fn(),
    };

    userRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockReturnValue([]),
      }),
    };

    collectionRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockReturnValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebContentService,
        {
          provide: getRepositoryToken(WebContents),
          useValue: webContentRepository,
        },
        {
          provide: getRepositoryToken(Users),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Collections),
          useValue: collectionRepository,
        },
      ],
    }).compile();

    service = module.get<WebContentService>(WebContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /////

  const firstWebContent = {
    id: 1,
    title: '화산귀환[독점]',
    contentType: '웹소설',
    isAdult: 0,
    author: 'author/비가',
    platform: { naver: 'url' },
    category: '무협',
    image: 'image-url',
    pReviews: [],
    cReviews: [],
  } as unknown as WebContents;

  const secondWebContent = {
    id: 1,
    title: '전지적 독자 시점',
    contentType: '웹소설',
    isAdult: 0,
    author: 'author/싱숑',
    platform: { naver: 'url' },
    category: '현판',
    image: 'image-url',
    pReviews: [],
    cReviews: [],
  } as unknown as WebContents;

  const thirdWebContent = {
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

  /////

  describe('findBestWebContents test', () => {
    const bestWebContents = [
      { ...firstWebContent, pReviewCount: 0, cReviewCount: 0, ranking: 1 },
      { ...secondWebContent, pReviewCount: 0, cReviewCount: 0, ranking: 1 },
    ];

    it('should find best ranking webContents by given platform and contentType', async () => {
      const platform = 'naver';
      const type = ContentType.WEBNOVEL;

      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue(bestWebContents);

      // act
      const result = await service.findBestWebContents(platform, type);

      // assert
      expect(
        webContentRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(bestWebContents);
    });

    it('should throw InternalServierErrorException if query failed', async () => {
      const platform = 'fake-platform';
      const type = ContentType.WEBNOVEL;

      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockImplementation(() => {
          throw new Error('Query Failed');
        });

      await expect(service.findBestWebContents(platform, type)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('searchFromUsers test', () => {
    const user1 = {
      id: 1,
      nickname: 'test',
      email: 'test@test.com',
      intro: null,
    } as Users;
    const user2 = {
      id: 2,
      nickname: '테스트',
      email: 'second@second.com',
      intro: 'test',
    } as Users;

    const users: Users[] = [user1, user2];

    it('should return users with given keyword where nickname or intro includes keyword', async () => {
      const keyword = 'test';
      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue(users);

      // act
      const result = await service.searchFromUsers(keyword);

      // assert
      expect(
        webContentRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toBe(users);
    });

    it('should return empty array if data matches keyword not exists', async () => {
      const keyword = 'fake-keyword';
      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue([]);

      // act
      const result = await service.searchFromUsers(keyword);

      // assert
      expect(
        webContentRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toBe([]);
    });
  });

  describe('searchFromCollections test', () => {
    const user1 = {
      id: 1,
      nickname: 'test',
      email: 'test@test.com',
      intro: null,
    } as Users;
    const user2 = {
      id: 2,
      nickname: '테스트',
      email: 'second@second.com',
      intro: 'test',
    } as Users;

    const users: Users[] = [user1, user2];

    it('should return users with given keyword where nickname or intro includes keyword', async () => {
      const keyword = 'test';
      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue(users);

      // act
      const result = await service.searchFromUsers(keyword);

      // assert
      expect(
        webContentRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toBe(users);
    });

    it('should return empty array if data matches keyword not exists', async () => {
      const keyword = 'fake-keyword';
      webContentRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue([]);

      // act
      const result = await service.searchFromUsers(keyword);

      // assert
      expect(
        webContentRepository.createQueryBuilder().getRawMany,
      ).toHaveBeenCalledTimes(1);
      expect(result).toBe([]);
    });
  });
});
