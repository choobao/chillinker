import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Likes } from './entities/likes.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
  ) {}

  orderType: object = {
    ADD_DT: { col: 'createdAt', order: 'ASC' },
    ADD_DT_DESC: { col: 'createdAt', order: 'DESC' },
    NEW: { col: 'pubDate', order: 'DESC' },
    OLD: { col: 'pubDate', order: 'ASC' },
  };

  async findContent(userId: number, contentId: number) {
    const like = await this.likesRepository.findOne({
      where: {
        webContentId: contentId,
        userId,
      },
    });
    return like;
  }

  async addContent(userId: number, contentId: number) {
    try {
      const existingContent = await this.findContent(userId, contentId);

      if (!_.isNil(existingContent)) {
        throw new ConflictException('이미 추가된 작품입니다.');
      }

      await this.likesRepository.save({
        userId,
        webContentId: contentId,
      });

      return { message: '성공적으로 추가되었습니다.' };
    } catch (err) {
      throw err;
    }
  }

  async deleteContent(userId: number, contentId: number) {
    try {
      const existingContent = await this.findContent(userId, contentId);

      if (_.isNil(existingContent)) {
        throw new ConflictException('이미 없는 작품입니다.');
      }

      await this.likesRepository.delete(existingContent.id);

      return { message: '성공적으로 삭제되었습니다.' };
    } catch (err) {
      throw err;
    }
  }

  async findContents(userId: number, sortType: string) {
    try {
      let orderMethod = this.orderType[sortType];

      let likes;
      if (sortType === 'NEW' || sortType === 'OLD') {
        likes = await this.likesRepository.find({
          where: {
            userId: userId,
          },
          relations: ['webContent'],
          order: {
            webContent: {
              [orderMethod.col]: orderMethod.order,
            },
          },
        });
      } else if (sortType === 'ADD_DT' || sortType === 'ADD_DT_DESC') {
        likes = await this.likesRepository.find({
          where: {
            userId: userId,
          },
          relations: ['webContent'],
          order: {
            [orderMethod.col]: orderMethod.order,
          },
        });
      }

      return likes;
    } catch (err) {
      throw err;
    }
  }
}
