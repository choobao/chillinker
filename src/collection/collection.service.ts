import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Collections } from './entities/collections.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collections)
    private colRepository: Repository<Collections>,
  ) {}

  // 내 컬렉션 목록 조회
  async getMyColList(user_id: number) {
    try {
      return await this.colRepository.find({
        where: { user_id },
        // select: ['title'],
      });
    } catch (error) {
      throw new NotFoundException({ message: '유효한 컬렉션이 아닙니다.' });
    }
  }

  // 내 컬렉션 상세 조회
  async getMyCol(collection_id: number) {
    try {
      return await this.colRepository.findOne({
        where: {
          id: collection_id,
        },
      });
    } catch (error) {
      throw new NotFoundException({ message: '유효한 컬렉션이 아닙니다.' });
    }
  }
  async createCol() {} // 컬렉션 생성
  async updateCol() {} // 컬렉션 수정 _작품 추가, 작품 삭제, 컬렉션 정보 수정
  async deleteCol() {} // 컬렉션 삭제 _북마크한 컬렉션에서는 북마크 버튼을 다시 누르면 취소되는걸로(라디오버튼 느낌?) 추가 로직 필요 -> 이건 추후에 고려

  // 북마크 컬렉션 목록 조회
  async getBookmarkColList(user_id: number) {
    try {
      return this.colRepository.find({
        where: {
          is_bookmarked: true,
          user_id,
        },
      });
    } catch (error) {
      throw new NotFoundException({ message: '유효한 컬렉션이 아닙니다.' });
    }
  }
  async getBookmarkCol() {} // 북마크 컬렉션 상세 조회

  async addCol() {} // webContents의 작품 페이지에서 컬렉션 추가 가능한 기능 -> 나중에 작성
}
