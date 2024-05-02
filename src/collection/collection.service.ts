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

  async getMyCol(collectionId: number) {
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

  async createCol(
    file: Express.Multer.File,
    createColDto: CreateColDto,
    userId: number,
  ): Promise<Collections> {
    let coverImage: string;
    if (file) {
      coverImage = await this.storageService.upload(file);
    }

    const collection = this.colRepository.create({
      ...createColDto,
      userId,
      coverImage,
    });

    return await this.colRepository.save(collection);
  }

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
      coverImage = await this.storageService.upload(file);
    }
    collection.coverImage = coverImage;
    collection.title = updateColDto.title;
    collection.desc = updateColDto.desc;

    return await this.colRepository.save(collection);
  }

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

  async getTopBookmarkedCollections(): Promise<Collections[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const topBookmarkedCollections = await this.colRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.user', 'user')
      .leftJoin('collection.bookmarks', 'bookmark')
      .addSelect('COUNT(bookmark.id)', 'bookmarkCount')
      .where('bookmark.createdAt > :threeDaysAgo', { threeDaysAgo })
      .groupBy('collection.id')
      .orderBy('bookmarkCount', 'DESC')
      .limit(100)
      .getMany();

    return topBookmarkedCollections;
  }

  async getPopularCollections(page?: number, order?: string) {
    const perPage = 10;

    page = page ? page : 1;
    let skip = (page - 1) * perPage;

    var today = new Date();
    var threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const bookmarksCount = await this.colBookRepository
      .createQueryBuilder('collectionBookmarks')
      .select('collectionBookmarks.collectionId')
      .innerJoin('collectionBookmarks.collection', 'collection')
      .where('collectionBookmarks.createdAt >= :threeDaysAgo', { threeDaysAgo })
      .getRawMany();

    const uniqueCollectionsCount = new Set(
      bookmarksCount.map((item) => item.collectionBookmarks_collection_id),
    ).size;

    const totalPages = Math.ceil(uniqueCollectionsCount / perPage);

    if (order === 'recent') {
      const collections = await this.colBookRepository
        .createQueryBuilder('collectionBookmark')
        .innerJoin('collectionBookmark.collection', 'collection')
        .innerJoin('collection.user', 'user')
        .select([
          'collectionBookmark.collectionId',
          'COUNT(*) as count',
          'collection',
          'user.id',
          'user.nickname',
          'user.profileImage',
        ])
        .where('collectionBookmark.createdAt >= :threeDaysAgo', {
          threeDaysAgo,
        })
        .groupBy('collectionBookmark.collectionId')
        .orderBy('collection.createdAt', 'DESC')
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      return { collections, totalPages };
    } else {
      const collections = await this.colBookRepository
        .createQueryBuilder('collectionBookmark')
        .innerJoin('collectionBookmark.collection', 'collection')
        .innerJoin('collection.user', 'user')
        .select([
          'collectionBookmark.collectionId',
          'COUNT(*) as count',
          'collection',
          'user.id',
          'user.nickname',
          'user.profileImage',
        ])
        .where('collectionBookmark.createdAt >= :threeDaysAgo', {
          threeDaysAgo,
        })
        .groupBy('collectionBookmark.collectionId')
        .orderBy('count', 'DESC')
        .offset(skip)
        .limit(perPage)
        .getRawMany();

      return { collections, totalPages };
    }
  }
}
