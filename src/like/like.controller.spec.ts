import { Test, TestingModule } from '@nestjs/testing';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Users } from '../user/entities/user.entity';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Likes } from './entities/likes.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('LikeController', () => {
  let controller: LikeController;

  const likeService = {
    changeContent: jest.fn(),
    findContents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeController],
      providers: [
        {
          provide: LikeService,
          useValue: likeService,
        },
      ],
    }).compile();

    controller = module.get<LikeController>(LikeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /////////////////// variables ////////////////////////

  const user = {
    id: 1,
    nickname: 'test',
    email: 'test@test.com',
  } as Users;

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

  const thirdLike = {
    id: 3,
    userId: 3,
    webContentId: 1,
    createdAt: new Date('2024-04-18'),
    webContent: firstWebContent,
  } as Likes;

  /////////////////////////////////////////////////////

  describe('changeContent test', () => {
    it("should add webContent to user's like if not exists", async () => {
      const contentId = 999;

      const successMessage = { message: '성공적으로 추가되었습니다.' };
      likeService.changeContent.mockResolvedValue(successMessage);

      // act
      const result = await controller.changeContent(user, contentId);

      // assert
      expect(likeService.changeContent).toHaveBeenCalledTimes(1);
      expect(likeService.changeContent).toHaveBeenCalledWith(
        user.id,
        contentId,
      );
      expect(result).toEqual(successMessage);
    });

    it("should delete webContent from user's like if already exists", async () => {
      const contentId = 11;

      const successMessage = { message: '성공적으로 삭제되었습니다.' };
      likeService.changeContent.mockResolvedValue(successMessage);

      // act
      const result = await controller.changeContent(user, contentId);

      // assert
      expect(likeService.changeContent).toHaveBeenCalledTimes(1);
      expect(likeService.changeContent).toHaveBeenCalledWith(
        user.id,
        contentId,
      );
      expect(result).toEqual(successMessage);
    });
  });

  describe('getLikes test', () => {
    it("should return certain user's likes and related webContents with given userId and sort by given sortType", async () => {
      const userId = 3;
      const sortType = 'ADD_DT';
      const likes: Likes[] = [thirdLike];

      likeService.findContents.mockResolvedValue(likes);

      // act
      const result = await controller.getLikes(userId, sortType);

      // assert
      expect(likeService.findContents).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: likes });
    });

    it('should return sorted result by ADD_DT if given sortType is invalid', async () => {
      const userId = 3;
      const sortType = 'fake-sort-type';
      const likes: Likes[] = [thirdLike];

      likeService.findContents.mockResolvedValue(likes);

      // act
      const result = await controller.getLikes(userId, sortType);

      // assert
      expect(likeService.findContents).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: likes });
    });
  });

  describe('getMyLikes test', () => {
    it("should return user's likes and related webContents and sort by given sortType", async () => {
      const sortType = 'NEW';
      const likes: Likes[] = [secondLike, firstLike];

      likeService.findContents.mockResolvedValue(likes);

      // act
      const result = await controller.getMyLikes(user, sortType);

      // assert
      expect(likeService.findContents).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: likes });
    });

    it('should return sorted result by ADD_DT if given sortType is invalid', async () => {
      const sortType = 'fake-sort-type';
      const likes: Likes[] = [firstLike, secondLike];

      likeService.findContents.mockResolvedValue(likes);

      // act
      const result = await controller.getMyLikes(user, sortType);

      // assert
      expect(likeService.findContents).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ content: likes });
    });

    // it('should return UnauthorizedException if not logined', async () => {
    //   const user = null;
    //   const sortType = 'ADD_DT';

    //   likeService.findContents.mockImplementation(() => {
    //     throw new UnauthorizedException();
    //   });

    //   await expect(controller.getMyLikes(user, sortType)).rejects.toThrow(
    //     UnauthorizedException,
    //   );
    // });
  });
});
