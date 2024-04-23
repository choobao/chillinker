import { Test, TestingModule } from '@nestjs/testing';

import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

import { Collections } from './entities/collections.entity';
import { Users } from 'src/user/entities/user.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';
import { BadRequestException } from '@nestjs/common';

describe('CollectionController', () => {
  let controller: CollectionController;

  const collectionService = {
    getMyColList: jest.fn(),
    getUserColList: jest.fn(),
    getMyCol: jest.fn(),
    createCol: jest.fn(),
    updateCol: jest.fn(),
    deleteCol: jest.fn(),
    addContentToCollection: jest.fn(),
    isContentExistInCollection: jest.fn(),
    removeContentFromCollection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: collectionService,
        },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockUser = {
    id: 1,
    email: 'sy@gmail.com',
    password: 'dummyPassword',
    nickname: '세영',
    intro: '안녕하세영',
    profileImage: null,
    createdAt: new Date('2024-04-17T23:09:37.423Z'),
  } as unknown as Users;

  const mockWebContent = {
    id: 3,
    title: '데뷔 못 하면 죽는 병 걸림',
    contentType: '웹소설',
    isAdult: 0,
    author: 'Author/백덕수',
    platform: { kakao: 'https://page.kakao.com/' },
    category: '현판',
    image:
      'https://page-images.kakaoentcdn.com/download/resource?kid=Du5oG/hzVqEy9QjX/lN2aZRgLz8pegvqODVjfE1&amp;filename=o1/dims/resize/384',
    pReviews: [],
    cReviews: [],
  } as unknown as WebContents;

  const mockFile = {
    fieldname: 'coverImage',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 12345,
    buffer: Buffer.from('mockFileContent'),
  } as Express.Multer.File;

  const mockCollection1 = {
    id: 1,
    title: '회빙환 컬렉션',
    desc: '회빙환 장르의 웹소설 모음',
    coverImage: 'test.jpg',
    bookmarkCount: 0,
    createdAt: new Date(),
    userId: 1,
    collectionBookmarks: [],
    contentCollections: [],
  } as unknown as Collections;

  const mockCollection2 = {
    id: 2,
    title: '카카페 베스트 컬렉션',
    desc: '카카오 페이지 베스트 웹소설 모음',
    coverImage: 'test.jpg',
    bookmarkCount: 0,
    createdAt: new Date(),
    userId: 1,
    collectionBookmarks: [],
    contentCollections: [],
  } as unknown as Collections;

  const mockCollection3 = {
    id: 3,
    title: '졸린 컬렉션',
    desc: '읽으면 졸려지는 웹소설 모음',
    coverImage: 'test.jpg',
    bookmarkCount: 0,
    createdAt: new Date(),
    userId: 1,
    collectionBookmarks: [],
    contentCollections: [],
  } as unknown as Collections;

  const mockCollectionList = [
    mockCollection1,
    mockCollection2,
    mockCollection3,
  ];

  // const modifyCollection = {
  //   id: 3,
  //   title: '(수정)안 졸린 컬렉션',
  //   desc: '읽으면 잠이 깨는 웹소설 모음',
  //   coverImage: 'test.jpg',
  //   bookmarkCount: 0,
  //   createdAt: new Date(),
  //   userId: 1,
  //   collectionBookmarks: [],
  //   contentCollections: [],
  // } as unknown as Collections;

  const mockCreateColDto = {
    title: '테스트 컬렉션 생성',
    desc: '테스트 컬렉션입니다.',
    coverImage: 'test.jpg',
  } as unknown as CreateColDto;

  const mockUpdateColDto = {
    title: '테스트 컬렉션 생성',
    desc: '테스트 컬렉션입니다.',
    coverImage: 'test.jpg',
    webContentId: 2,
  } as unknown as UpdateColDto;

  describe('myCollections test', () => {
    it('should get my collection list', async () => {
      collectionService.getMyColList.mockResolvedValue(mockCollectionList);

      const result = await controller.myCollections(mockUser);

      expect(result).toEqual(mockCollectionList);
    });
  });

  describe('myCollection test', () => {
    it('should get my collection', async () => {
      collectionService.getMyCol.mockResolvedValue(mockCollection1);

      const result = await controller.myCollection(1);

      expect(result).toEqual(mockCollection1);
    });
  });

  describe('userCollections test', () => {
    it('should get user collection list', async () => {
      collectionService.getUserColList.mockResolvedValue(mockCollectionList);

      const result = await controller.userCollections(mockUser.id);

      expect(result).toEqual(mockCollectionList);
    });
  });

  // describe('addCollection test', () => {
  //   // 컬렉션 추가 성공 확인
  //   it('should add a new collection', async () => {
  //     const createdCollection = {
  //       id: 4,
  //       title: '외과의사 어쩌고 컬렉션',
  //       desc: '작품 제목에 외과의사가 들어가는 리스트입니다.',
  //       coverImage: 'test.jpg',
  //       bookmarkCount: 0,
  //       createdAt: new Date(),
  //       userId: 1,
  //       collectionBookmarks: [],
  //       contentCollections: [],
  //     } as unknown as Collections;

  //     collectionService.createCol.mockRejectedValue(createdCollection);

  //     const result = await controller.addCollection(
  //       mockFile,
  //       mockCreateColDto,
  //       mockUser,
  //     );

  //     expect(result).toEqual({ collections: createdCollection });
  //   });

  //   // 컬렉션 추가 실패 확인
  //   it('should handle error when adding a new collection', async () => {
  //     const errorMessage = '컬렉션 생성에 실패했습니다.';
  //     collectionService.createCol.mockRejectedValue(new Error(errorMessage));

  //     await expect(
  //       controller.addCollection(mockFile, mockCreateColDto, mockUser),
  //     ).rejects.toThrow(errorMessage);
  //     expect(collectionService.createCol).toHaveBeenCalledWith(
  //       mockFile,
  //       mockUser.id,
  //       mockCreateColDto,
  //     );
  //   });
  // });

  // describe('updateCollection test', () => {
  //   // 컬렉션 수정 성공 확인
  //   it('should update an existing collection', async () => {
  //     const updatedCollection = {
  //       id: 2,
  //       title: '리디북스 베스트 컬렉션',
  //       desc: '리디북스 베스트 웹소설 모음',
  //       coverImage: 'test.jpg',
  //       bookmarkCount: 0,
  //       createdAt: new Date(),
  //       userId: 1,
  //       collectionBookmarks: [],
  //       contentCollections: [],
  //     } as unknown as Collections;

  //     collectionService.updateCol.mockRejectedValue(updatedCollection);

  //     const result = await controller.updateCollection(
  //       mockFile,
  //       mockUser,
  //       updatedCollection.id,
  //       mockUpdateColDto,
  //     );

  //     expect(result).toEqual({ collections: updatedCollection });
  //   });

  // 컬렉션 수정 실패 확인
  // it('should handle error when updating a collection', async () => {
  //   const errorMessage = '컬렉션 수정에 실패했습니다.';
  //   collectionService.updateCol.mockRejectedValue(new Error(errorMessage));

  //   await expect(
  //     controller.updateCollection(
  //       mockFile,
  //       mockUser,
  //       updatedCollection.id,
  //       mockUpdateColDto,
  //     ),
  //   ).rejects.toThrow(errorMessage);
  //   expect(collectionService.updateCol).toHaveBeenCalledWith(
  //     updatedCollection.id,
  //     mockUpdateColDto,
  //   );
  // });
  // });

  describe('deleteCollection test', () => {
    it('should delete an existing collection', async () => {
      collectionService.deleteCol.mockResolvedValue(true);

      const result = await controller.deleteCollection(
        mockUser,
        mockCollection2.id,
      );

      expect(result).toBeTruthy();
      expect(collectionService.deleteCol).toHaveBeenCalledWith(
        mockUser.id,
        mockCollection2.id,
      );
    });
  });

  describe('addContentToCollection test', () => {
    it('should add content to a collection', async () => {
      collectionService.isContentExistInCollection.mockResolvedValue(false); // 컨텐츠가 컬렉션에 존재x

      collectionService.addContentToCollection.mockResolvedValue(true); // 성공 값 반환

      const result = await controller.addContentToCollection(
        mockUser,
        mockCollection1.id,
        mockWebContent.id,
      );

      // 결과가 예상 값과 일치하는지 확인
      expect(result).toBeTruthy();

      expect(collectionService.isContentExistInCollection).toHaveBeenCalledWith(
        mockUser.id,
        mockCollection1.id,
        mockWebContent.id,
      );

      expect(collectionService.addContentToCollection).toHaveBeenCalledWith(
        mockUser.id,
        mockCollection1.id,
        mockWebContent.id,
      );
    });

    // 컨텐츠가 이미 컬렉션에 존재할 경우 오류 발생
    it('should throw error if content already exists in the collection', async () => {
      collectionService.isContentExistInCollection.mockResolvedValue(true);

      await expect(
        controller.addContentToCollection(
          mockUser,
          mockCollection1.id,
          mockWebContent.id,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(collectionService.isContentExistInCollection).toHaveBeenCalledWith(
        mockUser.id,
        mockCollection1.id,
        mockWebContent.id,
      );
      expect(collectionService.addContentToCollection).not.toHaveBeenCalled();
    });
  });
});
