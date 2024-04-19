import { Test, TestingModule } from '@nestjs/testing';
import { WebContentController } from './web-content.controller';
import { WebContentService } from './web-content.service';
import { BadRequestException } from '@nestjs/common';

describe('WebContentController', () => {
  let controller: WebContentController;

  const webContentService = {
    findBestWebContents: jest.fn(),
    searchFromUsers: jest.fn(),
    searchFromCollections: jest.fn(),
    searchFromAuthors: jest.fn(),
    searchFromWebContents: jest.fn(),
    findContent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebContentController],
      providers: [
        {
          provide: WebContentService,
          useValue: webContentService,
        },
      ],
    }).compile();

    controller = module.get<WebContentController>(WebContentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  ///////////// variables //////////////////////////////////////

  const bestWebContents = Array(20)
    .fill(null)
    .map((item, idx) => {
      return {
        id: idx + 1,
        title: '화산귀환[독점]',
        category: '무협',
        image: 'image-url',
        pReviewCount: '0',
        cReviewCount: '0',
        ranking: idx + 1,
      };
    });

  const authorSearchResult = {
    type: 'authors',
    keyword: '비가',
    authors: [
      {
        webContents_id: 1,
        webContents_content_type: '웹소설',
        webContents_title: '화산귀환 [독점]',
        webContents_desc: '화산귀환',
        webContents_image: 'hwasan.jpg',
        webContents_like_count: 0,
        webContents_star_rate: 0,
        webContents_is_adult: 0,
        webContents_rank: {
          naver: 1,
        },
        webContents_author: 'author/비가',
        webContents_keyword: '무협',
        webContents_category: '무협',
        webContents_platform: {
          naver: 'url',
        },
        webContents_pub_date: '2019-04-24T15:00:00.000Z',
        webContents_created_at: '2024-04-18T17:23:33.412Z',
        webContents_updated_at: '2024-04-18T20:07:07.000Z',
      },
    ],
  };

  const webnovelSearchResult = {
    type: 'webnovels',
    keyword: '화산',
    webnovels: authorSearchResult.authors,
  };

  const chillinkerSearchResult = {
    type: 'authors',
    keyword: 'chillinker',
    authors: [],
  };

  const webtoonSearchResult = {
    type: 'webtoons',
    keyword: '화산',
    webtoons: [
      {
        webContents_id: 2,
        webContents_content_type: '웹툰',
        webContents_title: '화산귀환',
        webContents_desc: '화산귀환',
        webContents_image: 'hwasan.jpg',
        webContents_like_count: 0,
        webContents_star_rate: 0,
        webContents_is_adult: 0,
        webContents_rank: {
          naver: 3,
        },
        webContents_author: 'Author/LICO, original_author/비가',
        webContents_keyword: '무협',
        webContents_category: '무협',
        webContents_platform: {
          naver: 'url',
        },
        webContents_pub_date: '2023-04-24T15:00:00.000Z',
        webContents_created_at: '2024-04-18T17:23:33.412Z',
        webContents_updated_at: '2024-04-18T20:07:07.000Z',
      },
    ],
  };

  const userSearchResult = {
    type: 'users',
    keyword: 'test',
    users: [],
  };

  const collectionSearchResult = {
    type: 'collections',
    keyword: 'test',
    collections: [
      {
        collections_id: 2,
        collections_title: 'test1',
        collections_desc: 'testing',
        collections_cover_image: 'cover.jpg',
        collections_bookmark_count: 0,
        collections_created_at: '2024-04-19T04:22:29.556Z',
        collections_user_id: 1,
      },
    ],
  };

  ///////////////////////////////////////////////////////////////

  describe('getBestWebContents test', () => {
    it('should return best 20 ranking webContents from all platform with all types', async () => {
      webContentService.findBestWebContents.mockResolvedValue(bestWebContents);

      // act
      const result = await controller.getBestWebContents();

      // assert
      expect(webContentService.findBestWebContents).toHaveBeenCalledTimes(8);
      expect(Object.keys(result).length).toBe(8);
    });
  });

  describe('search test', () => {
    it('(authors) should return searched result by given keyword from webtoons, webnovels, authors, users, collections', async () => {
      const query = '비가';
      const type = 'authors';

      webContentService.searchFromAuthors.mockResolvedValue(
        authorSearchResult.authors,
      );

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(0);

      expect(result).toEqual(authorSearchResult);
    });

    it('(webtoons) should return searched result by given keyword even if keyword does not match regex', async () => {
      const query = '화@,산}';
      const type = 'webtoons';

      webContentService.searchFromWebContents.mockResolvedValue({
        webtoons: webtoonSearchResult.webtoons,
        webnovels: webnovelSearchResult.webnovels,
      });

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(0);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(0);

      expect(result).toEqual(webtoonSearchResult);
    });

    it('(users) should return searched result by given keyword even if keyword does not match regex', async () => {
      const query = 'test@,,,';
      const type = 'users';

      webContentService.searchFromUsers.mockResolvedValue(
        userSearchResult.users,
      );

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(0);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(1);

      expect(result).toEqual(userSearchResult);
    });

    it('(collections) should return searched result by given keyword even if keyword does not match regex', async () => {
      const query = 'test@,,,';
      const type = 'collections';

      webContentService.searchFromCollections.mockResolvedValue(
        collectionSearchResult.collections,
      );

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(0);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(0);
      expect(webContentService.searchFromCollections).toHaveBeenCalledTimes(1);

      expect(result).toEqual(collectionSearchResult);
    });

    it('should return searched result by keyword chillinker if given keyword completely not match regex', async () => {
      const query = ',,,...{]$';
      const type = 'authors';

      webContentService.searchFromAuthors.mockResolvedValue([]);

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(0);

      expect(result).toEqual(chillinkerSearchResult);
    });

    it('should return searched webnovels by default', async () => {
      const query = '화산';
      const type = 'fake-type';

      webContentService.searchFromWebContents.mockResolvedValue({
        webtoons: webtoonSearchResult.webtoons,
        webnovels: webnovelSearchResult.webnovels,
      });

      // act
      const result = await controller.search(query, type);

      // assert
      expect(webContentService.searchFromAuthors).toHaveBeenCalledTimes(0);
      expect(webContentService.searchFromWebContents).toHaveBeenCalledTimes(1);
      expect(webContentService.searchFromUsers).toHaveBeenCalledTimes(0);

      expect(result).toEqual({ ...webnovelSearchResult, type });
    });
  });
});
