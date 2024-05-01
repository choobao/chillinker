import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Collections } from './entities/collections.entity';
import { WebContents } from '../web-content/entities/webContents.entity';
import { ContentCollection } from './entities/content-collections.entity';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';

import { StorageService } from '../storage/storage.service';
import { result } from 'lodash';
import { Users } from '../user/entities/user.entity';
import _ from 'lodash';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collections)
    private colRepository: Repository<Collections>,
    @InjectRepository(WebContents)
    private webContentRepository: Repository<WebContents>,
    @InjectRepository(ContentCollection)
    private contentCollectionRepository: Repository<ContentCollection>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(CollectionBookmark)
    private colBookRepository: Repository<CollectionBookmark>,
    private readonly redisService: RedisService,
    private readonly storageService: StorageService,
  ) {}

  async getTitles(collectionId: number) {
    const data = await this.getMyCol(collectionId);
    return data.contentCollections.map((contentCol) => {
      return {
        title: contentCol.webContent.title,
        id: contentCol.webContent.id,
      };
    });
  }

  // 내 컬렉션 목록 조회
  async getMyColList(userId: number) {
    const collections = await this.colRepository.find({
      where: { userId },
      relations: [
        'contentCollections',
        'contentCollections.webContent',
        'collectionBookmarks',
      ],
      select: [
        'id',
        'title',
        'desc',
        'coverImage',
        'bookmarkCount',
        'viewCount',
        'contentCollections',
      ],
    });
    return collections.map((collection) => {
      const id = collection.id;
      const title = collection.title;
      const desc = collection.desc;
      const coverImage = collection.coverImage;
      const viewCount = collection.viewCount;
      const bookmarkCount = collection.collectionBookmarks.length;
      const webContents = collection.contentCollections.map(
        (contentCollection) => {
          const webContentId = contentCollection.webContentId;
          const webContentTitle = contentCollection.webContent.title;
          return { webContentId, webContentTitle };
        },
      );

      return {
        id,
        title,
        desc,
        viewCount,
        coverImage,
        bookmarkCount,
        webContents,
      };
    });
  }

  // 타 유저 컬렉션 목록 조회
  async getUserColList(userId: number) {
    const existUser = await this.userRepository.findOneBy({ id: userId });
    if (!existUser)
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    const collections = await this.colRepository.find({
      where: { userId },
      relations: ['contentCollections', 'collectionBookmarks'],
      select: [
        'id',
        'title',
        'desc',
        'coverImage',
        'viewCount',
        'bookmarkCount',
        'userId',
        'contentCollections',
      ],
    });
    return collections.map((collection) => {
      const id = collection.id;
      const title = collection.title;
      const desc = collection.desc;
      const viewCount = collection.viewCount;
      const coverImage = collection.coverImage;
      const bookmarkCount = collection.collectionBookmarks.length;
      const webContentNumber = collection.contentCollections.length;
      const userId = collection.userId;

      return {
        id,
        title,
        desc,
        coverImage,
        viewCount,
        userId,
        bookmarkCount,
        webContentNumber,
      };
    });
  }

  // 컬렉션 상세 조회
  async getMyCol(collectionId: number) {
    // return await this.contentCollectionRepository.find({
    //   where: { collectionId },
    //   relations: { webContent: true },
    //   // select: ['contentCollections.webcontent'],
    // });
    return await this.colRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.contentCollections', 'contentCollection')
      .leftJoinAndSelect('contentCollection.webContent', 'webContent')
      .leftJoinAndSelect('collections.user', 'user')
      .leftJoinAndSelect(
        'collections.collectionBookmarks',
        'collectionBooknmarks',
      )
      .where('collections.id = :id', { id: collectionId })
      .getOne();
  }

  // 컬렉션 생성
  async createCol(
    file: Express.Multer.File,
    createColDto: CreateColDto,
    userId: number,
  ): Promise<Collections> {
    // let coverImage = createColDto.coverImage;
    // if (file) {
    //   //이미지 업로드
    //   coverImage = await this.storageService.upload(file);
    //   if (createColDto.coverImage) {
    //     await this.storageService.delete(createColDto.coverImage);
    //   }
    // }
    // const collection = this.colRepository.create({ ...createColDto, userId });
    // return await this.colRepository.save(collection);
    let coverImage: string;
    if (file) {
      // 이미지 업로드
      coverImage = await this.storageService.upload(file);
    }

    // 컬렉션 생성
    const collection = this.colRepository.create({
      ...createColDto,
      userId,
      coverImage, // 커버 이미지 추가
    });

    // 컬렉션 저장
    return await this.colRepository.save(collection);
  }

  // 컬렉션 수정 _컬렉션 정보 수정
  async updateCol(
    file: Express.Multer.File,
    collectionId: number,
    updateColDto: UpdateColDto,
  ): Promise<Collections> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });
    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }
    let coverImage: string = collection.coverImage || null;
    if (file) {
      // 이미지 업로드
      coverImage = await this.storageService.upload(file);
    }
    collection.coverImage = coverImage;
    collection.title = updateColDto.title;
    collection.desc = updateColDto.desc;

    return await this.colRepository.save(collection);
  }

  // 컬렉션 삭제
  async deleteCol(userId: number, collectionId: number): Promise<void> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });

    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션만 삭제가 가능합니다.');
    }

    await this.colRepository.remove(collection);
  }

  // 컨텐츠 추가
  async addContentToCollection(
    userId: number,
    collectionId: number,
    webContentId: number,
  ): Promise<void> {
    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션에만 컨텐츠 추가가 가능합니다.');
    }

    const webContent = await this.webContentRepository.findOne({
      where: { id: webContentId },
    });
    if (!webContent) {
      throw new NotFoundException('작품이 존재하지 않습니다.');
    }

    const contentCollection = new ContentCollection();
    contentCollection.collection = collection;
    contentCollection.webContent = webContent;
    await this.contentCollectionRepository.save(contentCollection);
  }

  async isContentExistInCollection(
    userId: number,
    collectionId: number,
    contentId: number,
  ): Promise<boolean> {
    const contentCollection = await this.contentCollectionRepository.findOne({
      where: {
        collection: { id: collectionId },
        webContent: { id: contentId },
      },
      relations: ['collection', 'webContent'],
    });
    return !!contentCollection;
  }

  // 컨텐츠 삭제
  async removeContentFromCollection(
    userId: number,
    collectionId: number,
    webContentId: number,
  ): Promise<void> {
    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });

    if (collection.userId !== userId) {
      throw new ForbiddenException('내 컬렉션에서만 컨텐츠 삭제가 가능합니다.');
    }

    const contentCollection = await this.contentCollectionRepository.findOne({
      where: {
        collection: { id: collectionId },
        webContent: { id: webContentId },
      },
    });

    if (!contentCollection) {
      throw new NotFoundException('컨텐츠가 컬렉션에 존재하지 않습니다.');
    }

    await this.contentCollectionRepository.remove(contentCollection);
  }

  async getMyColsTitle(userId: number) {
    console.log('유저아이디: ', userId);
    const collections = await this.colRepository.find({
      where: {
        userId,
      },
    });
    console.log('컬렉션: ', collections);
    return collections;
  }

  async getMyColBlind(collectionId: number, user) {
    const collectionInfo = await this.colRepository
      .createQueryBuilder('collections')
      .leftJoinAndSelect('collections.contentCollections', 'contentCollection')
      .leftJoinAndSelect('contentCollection.webContent', 'webContent')
      .leftJoinAndSelect('collections.user', 'user')
      .leftJoinAndSelect(
        'collections.collectionBookmarks',
        'collectionBooknmarks',
      )
      .where('collections.id = :id', { id: collectionId })
      .getOne();

    const webContents = collectionInfo.contentCollections.map((item) => {
      return item.webContent;
    });

    const blindWebContents = this.blindAdultImage(user, webContents);
    const isAdult = this.isAdult(user);

    let userId = user.id;

    if (!userId) {
      userId = user.ip;
    }

    const key = `user:${userId}:collectionViews`;

    const existingViews = await this.redisService.isExistingViews(
      key,
      collectionId,
    );

    if (existingViews) {
      return { collectionInfo, blindWebContents, isAdult };
    } else {
      await this.redisService.firstViews(key, collectionId);

      await this.colRepository.update(collectionId, {
        viewCount: collectionInfo.viewCount + 1,
      });
      return { collectionInfo, blindWebContents, isAdult };
    }
  }

  isOver19(birthDate: Date) {
    const today = new Date();
    const date19YearsAgo = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate(),
    );
    return birthDate <= date19YearsAgo;
  }

  blindAdultImage(user, contents: WebContents[]) {
    if (
      user === false ||
      _.isNil(user) ||
      _.isNil(user.birthDate) ||
      !this.isOver19(new Date(user.birthDate))
    ) {
      const adult_image =
        'https://ssl.pstatic.net/static/m/nstore/thumb/19/home_book_4.png';
      contents.map((content) => {
        if (content.isAdult) {
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

  // @Cron(CronExpression.EVERY_3_DAYS)
  // async updateTopBookmarkedCollections() {
  //   // 여기서는 단순히 콘솔에 로깅을 합니다만, 실제로는 DB에 저장하거나 캐시를 업데이트할 수 있습니다.
  //   const topCollections = await this.getTopBookmarkedCollections();
  //   console.log(topCollections);
  //   // 추가적인 로직...
  // }

  async getTopBookmarkedCollections(): Promise<Collections[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const topBookmarkedCollections = await this.colRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.user', 'user')
      .leftJoin('collection.bookmarks', 'bookmark') // 'bookmarks'는 컬렉션 엔티티 내 북마크 관계를 나타냅니다.
      .addSelect('COUNT(bookmark.id)', 'bookmarkCount')
      .where('bookmark.createdAt > :threeDaysAgo', { threeDaysAgo })
      .groupBy('collection.id')
      .orderBy('bookmarkCount', 'DESC')
      .limit(100)
      .getMany();

    return topBookmarkedCollections;
  }

  async getPopularCollections(page?: number, order?: string) {
    // 페이지당 항목 수 설정
    const perPage = 10;

    // 페이지 번호 설정 (기본값은 1)
    page = page ? page : 1;
    let skip = (page - 1) * perPage;

    // 현재 날짜와 3일 전 날짜 계산
    var today = new Date();
    var threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    // 지난 3일간 생성된 컬렉션 북마크 정보 조회
    // 컬렉션 ID를 기준으로 선택
    const bookmarksCount = await this.colBookRepository
      .createQueryBuilder('collectionBookmarks')
      .select('collectionBookmarks.collectionId')
      .innerJoin('collectionBookmarks.collection', 'collection')
      .where('collectionBookmarks.createdAt >= :threeDaysAgo', { threeDaysAgo })
      .getRawMany();

    // 조회된 북마크들 중에서 고유한 컬렉션의 수 계산
    const uniqueCollectionsCount = new Set(
      bookmarksCount.map((item) => item.collectionBookmarks_collection_id),
    ).size;

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(uniqueCollectionsCount / perPage);

    // 'recent'인 경우 최근 생성된 컬렉션 순으로 정렬, 그렇지 않으면 북마크 수가 많은 순으로 정렬
    if (order === 'recent') {
      // 최근 생성된 컬렉션 조회
      const collections = await this.colBookRepository
        .createQueryBuilder('collectionBookmark')
        .select([
          'collectionBookmark.collectionId',
          'COUNT(*) as count',
          'collection', // 컬렉션 엔티티의 필드들
          'user.id AS userId', // 유저 엔티티의 필드들
          'user.nickname AS userNickname',
          'user.profileImage AS userProfileImage',
        ])
        .innerJoin('collectionBookmark.collection', 'collection')
        .innerJoinAndSelect('collection.user', 'user')
        .where('collectionBookmark.createdAt >= :threeDaysAgo', {
          threeDaysAgo,
        })
        .groupBy('collectionBookmark.collectionId')
        .orderBy('collection.createdAt', 'DESC') // 최근 생성 순으로 정렬
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      return { collections, totalPages };
    } else {
      // 북마크 수가 많은 컬렉션 조회
      const collections = await this.colBookRepository
        .createQueryBuilder('collectionBookmark')
        .select([
          'collectionBookmark.collectionId',
          'COUNT(*) as count',
          'collection', // 컬렉션 엔티티의 필드들
          'user.id AS userId', // 유저 엔티티의 필드들
          'user.nickname AS userNickname',
          'user.profileImage AS userProfileImage',
        ])
        .innerJoin('collectionBookmark.collection', 'collection')
        .innerJoinAndSelect('collection.user', 'user')
        .where('collectionBookmark.createdAt >= :threeDaysAgo', {
          threeDaysAgo,
        })
        .groupBy('collectionBookmark.collectionId')
        .orderBy('count', 'DESC') // 북마크 수가 많은 순으로 정렬
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      return { collections, totalPages };
    }
  }
}
