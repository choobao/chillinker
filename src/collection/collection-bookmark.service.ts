import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collections } from './entities/collections.entity';
import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { CollectionBookmarkUser } from './entities/collection-bookmark-user.entity';

@Injectable()
export class CollectionBookmarkService {
  constructor(
    @InjectRepository(Collections)
    private colRepository: Repository<Collections>,
    @InjectRepository(CollectionBookmarkUser)
    private colBookUserRepository: Repository<CollectionBookmarkUser>,
    @InjectRepository(CollectionBookmark)
    private colBookRepository: Repository<CollectionBookmark>,
  ) {}

  // 북마크 컬렉션 목록 조회
  async getBookmarkColList(userId: number) {
    const bookmarkedCollections = await this.colBookUserRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['collection'],
    });

    if (!bookmarkedCollections || bookmarkedCollections.length === 0) {
      throw new NotFoundException('북마크된 컬렉션이 존재하지 않습니다.');
    }

    return bookmarkedCollections.map((bookmark) => bookmark.collection);
  }

  // 컬렉션 북마크 추가
  async addBookmark(collectionId: number, userId: number): Promise<void> {
    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException('컬렉션이 존재하지 않습니다.');
    }

    const existingBookmark = await this.colBookUserRepository.findOne({
      where: { user: { id: userId }, collection: { id: collectionId } },
    });

    if (existingBookmark) {
      throw new BadRequestException('이미 북마크된 컬렉션입니다.');
    }

    const bookmark = this.colBookRepository.create({
      collection,
      userId,
    });
    await this.colBookRepository.save(bookmark);

    collection.bookmarkCount += 1;
    await this.colRepository.save(collection);

    const bookmarkUser = this.colBookUserRepository.create({
      collection,
      user: { id: userId },
      bookmark,
    });

    await this.colBookUserRepository.save(bookmarkUser);
  }

  // 컬렉션 북마크 해제(삭제)
  async deleteBookmark(collectionId: number, userId: number): Promise<void> {
    const bookmark = await this.colBookUserRepository.findOne({
      where: { collection: { id: collectionId }, user: { id: userId } },
    });
    if (!bookmark) {
      throw new NotFoundException('북마크를 찾을 수 없습니다.');
    }

    const collection = await this.colRepository.findOne({
      where: { id: collectionId },
    });

    if (collection && collection.bookmarkCount > 0) {
      collection.bookmarkCount -= 1;
      await this.colRepository.save(collection);
    }

    await this.colBookUserRepository.delete(bookmark.id);
  }
}
