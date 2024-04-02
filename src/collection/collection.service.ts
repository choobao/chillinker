import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collections } from './entities/collections.entity';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collections)
    private colRepository: Repository<Collections>,
  ) {}

  // 내 컬렉션 목록 조회
  async getMyColList(userId: number) {
    return await this.colRepository.find({
      where: { userId },
      // select: ['title'],
    });
  }

  // 내 컬렉션 상세 조회
  async getMyCol(collection_id: number) {
    return await this.colRepository.findOne({
      where: {
        id: collection_id,
      },
    });
  }

  // 컬렉션 생성
  async createCol(
    createColDto: CreateColDto,
    userId: number,
  ): Promise<Collections> {
    const collection = this.colRepository.create({ ...createColDto, userId });
    return await this.colRepository.save(collection);
  }

  // 컬렉션 수정 _작품 추가, 작품 삭제, 컬렉션 정보 수정
  async updateCol(
    collectionId: number,
    updateColDto: UpdateColDto,
  ): Promise<Collections> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });
    if (!collection) {
      throw new NotFoundException('유효한 컬렉션이 아닙니다.');
    }

    collection.title = updateColDto.title;
    collection.desc = updateColDto.desc;
    // 추후 웹컨텐츠 로직 추가 예정

    return await this.colRepository.save(collection);
  }

  //   컬렉션 삭제 _북마크한 컬렉션에서는 북마크 버튼을 다시 누르면 취소되는걸로(라디오버튼 느낌?) 추가 로직 필요 -> 이건 추후에 고려
  async deleteCol(collectionId: number): Promise<void> {
    const collection = await this.colRepository.findOneBy({
      id: collectionId,
    });

    if (!collection) {
      throw new NotFoundException('유효한 컬렉션이 아닙니다.');
    }

    await this.colRepository.remove(collection);
  }

  // 북마크 컬렉션 목록 조회
  async getBookmarkColList(userId: number) {
    return this.colRepository.find({
      where: {
        isBookmarked: true,
        userId,
      },
    });
  }
  //   async getBookmarkCol() {} // 북마크 컬렉션 상세 조회

  //   async addCol() {} // webContents의 작품 페이지에서 컬렉션 추가 가능한 기능 -> 나중에 작성
}
