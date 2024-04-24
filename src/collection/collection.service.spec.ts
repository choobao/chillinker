// import { Test, TestingModule } from '@nestjs/testing';
// import { Repository } from 'typeorm';
// import { getRepositoryToken } from '@nestjs/typeorm';

// import { CollectionService } from './collection.service';
// import { StorageService } from '../storage/storage.service';

// import { Collections } from './entities/collections.entity';
// import { ContentCollection } from './entities/content-collections.entity';
// import { WebContents } from '../web-content/entities/webContents.entity';
// import { CreateColDto } from './dto/createCol.dto';
// import { UpdateColDto } from './dto/updateCol.dto';

// describe('CollectionService', () => {
//   let service: CollectionService;
//   let storageService: StorageService;

//   let colRepository: Repository<Collections>;
//   let webContentRepository: Repository<WebContents>;
//   let contentCollectionRepository: Repository<ContentCollection>;
//   //   let colRepository: Partial<Record<keyof Repository<Collections>, jest.Mock>>;
//   //   let webContentRepository: Partial<
//   //     Record<keyof Repository<WebContents>, jest.Mock>
//   //   >;
//   //   let pReviewRepository: Partial<Record<keyof Repository<PReviews>, jest.Mock>>;
//   //   let contentCollectionRepository: Partial<
//   //     Record<keyof Repository<ContentCollection>, jest.Mock>
//   //   >;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         CollectionService,
//         {
//           provide: getRepositoryToken(Collections),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(WebContents),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(ContentCollection),
//           useClass: Repository,
//         },
//       ],
//     }).compile();

//     service = module.get<CollectionService>(CollectionService);

//     colRepository = module.get<Repository<Collections>>(
//       getRepositoryToken(Collections),
//     );
//     webContentRepository = module.get<Repository<WebContents>>(
//       getRepositoryToken(WebContents),
//     );
//     contentCollectionRepository = module.get<Repository<ContentCollection>>(
//       getRepositoryToken(ContentCollection),
//     );
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   const mockUser = {
//     id: 1,
//     email: 'sy@gmail.com',
//     password: 'dummyPassword',
//     nickname: '세영',
//     intro: '안녕하세영',
//     profileImage: null,
//     createdAt: new Date('2024-04-17T23:09:37.423Z'),
//   } as unknown as Users;

//   const mockWebContent = {
//     id: 3,
//     title: '데뷔 못 하면 죽는 병 걸림',
//     contentType: '웹소설',
//     isAdult: 0,
//     author: 'Author/백덕수',
//     platform: { kakao: 'https://page.kakao.com/' },
//     category: '현판',
//     image:
//       'https://page-images.kakaoentcdn.com/download/resource?kid=Du5oG/hzVqEy9QjX/lN2aZRgLz8pegvqODVjfE1&amp;filename=o1/dims/resize/384',
//     pReviews: [],
//     cReviews: [],
//   } as unknown as WebContents;

//   const mockFile = {
//     fieldname: 'coverImage',
//     originalname: 'test.jpg',
//     encoding: '7bit',
//     mimetype: 'image/jpeg',
//     size: 12345,
//     buffer: Buffer.from('mockFileContent'),
//   } as Express.Multer.File;

//   const mockCollection1 = {
//     id: 1,
//     title: '회빙환 컬렉션',
//     desc: '회빙환 장르의 웹소설 모음',
//     coverImage: 'test.jpg',
//     bookmarkCount: 0,
//     createdAt: new Date(),
//     userId: 1,
//     collectionBookmarks: [],
//     contentCollections: [],
//   } as unknown as Collections;

//   const mockCollection2 = {
//     id: 2,
//     title: '카카페 베스트 컬렉션',
//     desc: '카카오 페이지 베스트 웹소설 모음',
//     coverImage: 'test.jpg',
//     bookmarkCount: 0,
//     createdAt: new Date(),
//     userId: 1,
//     collectionBookmarks: [],
//     contentCollections: [],
//   } as unknown as Collections;

//   const mockCollection3 = {
//     id: 3,
//     title: '졸린 컬렉션',
//     desc: '읽으면 졸려지는 웹소설 모음',
//     coverImage: 'test.jpg',
//     bookmarkCount: 0,
//     createdAt: new Date(),
//     userId: 1,
//     collectionBookmarks: [],
//     contentCollections: [],
//   } as unknown as Collections;

//   const mockCollectionList = [
//     mockCollection1,
//     mockCollection2,
//     mockCollection3,
//   ];

//   const modifyCollection = {
//     id: 3,
//     title: '(수정)안 졸린 컬렉션',
//     desc: '읽으면 잠이 깨는 웹소설 모음',
//     coverImage: 'test.jpg',
//     bookmarkCount: 0,
//     createdAt: new Date(),
//     userId: 1,
//     collectionBookmarks: [],
//     contentCollections: [],
//   } as unknown as Collections;

//   const mockCreateColDto = {
//     title: '테스트 컬렉션 생성',
//     desc: '테스트 컬렉션입니다.',
//     coverImage: 'test.jpg',
//   } as unknown as CreateColDto;

//   const mockUpdateColDto = {
//     title: '테스트 컬렉션 생성',
//     desc: '테스트 컬렉션입니다.',
//     coverImage: 'test.jpg',
//     webContentId: 2,
//   } as unknown as UpdateColDto;

//   describe('getMyColList', () => {
//     it('should return collection list for a me', async () => {
//       jest.spyOn(colRepository, 'find').mockResolvedValue(mockCollectionList);

//       const result = await service.getMyColList(mockUser.id);

//       expect(result).toEqual(mockCollectionList);
//     });
//   });

//   describe('getUserColList', () => {
//     it('should return collection list for a given user', async () => {
//       jest.spyOn(colRepository, 'find').mockResolvedValue(mockCollectionList);

//       const result = await service.getMyColList(mockUser.id);

//       expect(result).toEqual(mockCollectionList);
//     });
//   });

//   describe('');
// });
