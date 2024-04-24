import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from './like.service';
import { Repository } from 'typeorm';
import { Likes } from './entities/likes.entity';
import { WebContents } from '../web-content/entities/webContents.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { error } from 'console';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('LikesService', () => {
  let service: LikeService;
  let likeRepository: Partial<Record<keyof Repository<Likes>, jest.Mock>>;
  let webContentRepository: Partial<
    Record<keyof Repository<WebContents>, jest.Mock>
  >;

  beforeEach(async () => {
    likeRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    webContentRepository = {
      increment: jest.fn(),
      decrement: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: getRepositoryToken(Likes),
          useValue: likeRepository,
        },
        {
          provide: getRepositoryToken(WebContents),
          useValue: webContentRepository,
        },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findContent test', () => {
    const userId = 1;
    const contentId = 11;

    const like = {
      id: 1,
      userId: 1,
      webContentId: 11,
      createdAt: new Date('2024-04-17'),
    } as Likes;

    it('should find a like if exists', async () => {
      likeRepository.findOne.mockResolvedValue(like);

      // act
      const result = await service.findContent(userId, contentId);

      // assert
      expect(likeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: {
          webContentId: contentId,
          userId,
        },
      });
      expect(result).toBe(like);
    });

    it('should return null if not exist', async () => {
      likeRepository.findOne.mockResolvedValue(null);

      // act
      const result = await service.findContent(1, 0);

      // assert
      expect(likeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: {
          webContentId: 0,
          userId,
        },
      });
      expect(result).toBe(null);
    });
  });

  describe('changeContent test', () => {
    const userId = 1;
    const contentId = 11;

    const like = {
      id: 1,
      userId: 1,
      webContentId: 11,
    } as Likes;

    const webContent = {
      id: 11,
      title: '화산귀환',
      author: 'author/비가',
      contentType: '웹소설',
      likeCount: 0,
    } as WebContents;

    it('should create a like and increase likeCount if like with given webContentId and userId not exists', async () => {
      likeRepository.findOne.mockResolvedValue(null);
      webContentRepository.increment.mockResolvedValue({
        ...webContent,
        likeCount: 1,
      });

      // act
      const result = await service.changeContent(1, 11);

      // assert
      expect(likeRepository.save).toHaveBeenCalledTimes(1);
      expect(likeRepository.save).toHaveBeenCalledWith({
        userId,
        webContentId: contentId,
      });
      expect(webContentRepository.increment).toHaveBeenCalledTimes(1);
      expect(webContentRepository.increment).toHaveBeenCalledWith(
        {
          id: contentId,
        },
        'likeCount',
        1,
      );
      expect(result).toEqual({ message: '성공적으로 추가되었습니다.' });
    });

    it('should delete a like decrease likeCount if like with given webContentId and userId already exists', async () => {
      likeRepository.findOne.mockResolvedValue(like);
      webContentRepository.decrement.mockResolvedValue(webContent);

      // act
      const result = await service.changeContent(1, 11);

      // assert
      expect(likeRepository.delete).toHaveBeenCalledTimes(1);
      expect(likeRepository.delete).toHaveBeenCalledWith(like.id);
      expect(webContentRepository.decrement).toHaveBeenCalledTimes(1);
      expect(webContentRepository.decrement).toHaveBeenCalledWith(
        {
          id: contentId,
        },
        'likeCount',
        1,
      );
      expect(result).toEqual({ message: '성공적으로 삭제되었습니다.' });
    });

    it('should throw ConflictException if err occur', async () => {
      likeRepository.save.mockImplementation(() => {
        throw new ConflictException();
      });

      await expect(service.changeContent).rejects.toThrow(ConflictException);
    });
  });

  describe('findContents test', () => {
    const firstWebContent = {
      id: 11,
      title: '화산귀환',
      author: 'author/비가',
      contentType: '웹소설',
      likeCount: 1,
      pubDate: new Date('2024-03-17'),
    } as WebContents;
    const secondWebContent = {
      id: 22,
      title: '화산귀환',
      author: 'Author/LICO, original_author/비가',
      contentType: '웹툰',
      likeCount: 1,
      pubDate: new Date('2024-04-17'),
    } as WebContents;

    const firstLike = {
      id: 1,
      userId: 1,
      webContentId: 11,
      createdAt: new Date('2024-03-17'),
      webContent: firstWebContent,
    } as Likes;
    const secondLike = {
      id: 2,
      userId: 1,
      webContentId: 22,
      createdAt: new Date('2024-04-17'),
      webContent: secondWebContent,
    } as Likes;

    const likes = [firstLike, secondLike] as Likes[];

    const userId = 1;

    it('should find all likes with webContents using given userId and order by given sortType', async () => {
      const sortType = 'OLD';

      likeRepository.find.mockResolvedValue(likes);

      // act
      const result = await service.findContents(userId, sortType);

      // assert
      expect(likeRepository.find).toHaveBeenCalledTimes(1);
      expect(likeRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
        },
        relations: ['webContent'],
        order: {
          webContent: {
            pubDate: 'ASC',
          },
        },
      });
      expect(result).toBe(likes);
    });

    it('should find all likes with webContents using given userId and order by given sortType', async () => {
      const sortType = 'ADD_DT_DESC';
      const sortedLikes = likes.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      likeRepository.find.mockResolvedValue(sortedLikes);

      // act
      const result = await service.findContents(userId, sortType);

      // assert
      expect(likeRepository.find).toHaveBeenCalledTimes(1);
      expect(likeRepository.find).toHaveBeenCalledWith({
        where: {
          userId,
        },
        relations: ['webContent'],
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toBe(likes);
    });

    it('should return undefined if sortType is neither ADD_DT nor ADD_DT_DESC nor OLD nor NEW', async () => {
      const sortType = 'fake_sort_type';
      const result = await service.findContents(userId, sortType);

      expect(likeRepository.find).toHaveBeenCalledTimes(0);

      expect(result).toBe(undefined);
    });

    it('should throw BadRequestException if error occurs', async () => {
      likeRepository.find.mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(service.findContents).rejects.toThrow(BadRequestException);
    });
  });
});
