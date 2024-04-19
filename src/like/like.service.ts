import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Likes } from './entities/likes.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { WebContents } from '../web-content/entities/webContents.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
    @InjectRepository(WebContents)
    private readonly webContentRepository: Repository<WebContents>,
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

  async changeContent(userId: number, contentId: number) {
    try {
      const existingContent = await this.findContent(userId, contentId);

      if (_.isNil(existingContent)) {
        // 추가
        await this.likesRepository.save({
          userId,
          webContentId: contentId,
        });

        // 카운트 증가
        await this.webContentRepository.increment(
          { id: contentId },
          'likeCount',
          1,
        );

        return { message: '성공적으로 추가되었습니다.' };
      } else {
        // 삭제
        await this.likesRepository.delete(existingContent.id);

        // 카운트 감소
        await this.webContentRepository.decrement(
          { id: contentId },
          'likeCount',
          1,
        );

        return { message: '성공적으로 삭제되었습니다.' };
      }
    } catch (err) {
      throw new ConflictException(err.message);
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
      throw new BadRequestException(err.message);
    }
  }
}
