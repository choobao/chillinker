import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bogosips } from './entities/bogosips.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { BogosipType, convertToEnum, orderType } from './types/bogosip.type';

@Injectable()
export class BogosipService {
  constructor(
    @InjectRepository(Bogosips)
    private readonly bogosipRepository: Repository<Bogosips>,
  ) {}

  async findContent(userId: number, contentId: number, type: string) {
    const bogosip = await this.bogosipRepository.findOne({
      where: {
        webContentId: contentId,
        userId,
        type: convertToEnum(type),
      },
    });
    return bogosip;
  }

  async addContent(userId: number, contentId: number, type: string) {
    try {
      const existingContent = await this.findContent(userId, contentId, type);

      if (!_.isNil(existingContent)) {
        throw new ConflictException('이미 추가된 작품입니다.');
      }

      await this.bogosipRepository.save({
        userId,
        webContentId: contentId,
        type: BogosipType[type],
      });

      return { message: '성공적으로 추가되었습니다.' };
    } catch (err) {
      throw err;
    }
  }

  async deleteContent(userId: number, contentId: number, type: string) {
    try {
      const existingContent = await this.findContent(userId, contentId, type);

      if (_.isNil(existingContent)) {
        throw new ConflictException('이미 없는 작품입니다.');
      }

      await this.bogosipRepository.delete(existingContent.id);

      return { message: '성공적으로 삭제되었습니다.' };
    } catch (err) {
      throw err;
    }
  }

  async findContents(userId: number, type: string, sortType: string) {
    try {
      let orderMethod = orderType[sortType];

      // const bogosips = await this.bogosipRepository
      //   .createQueryBuilder('bogosip')
      //   .leftJoinAndSelect('bogosip.webContent', 'webContent')
      //   .where('bogosip.userId = :userId', { userId })
      //   .andWhere('bogosip.type = :type', { type: BogosipType.BOGOSIP })
      //   .orderBy(order.col, order.order) // webContent의 pubDate 기준으로 오름차순 정렬
      //   .getMany();

      let bogosips;
      if (sortType === 'NEW' || sortType === 'OLD') {
        bogosips = await this.bogosipRepository.find({
          where: {
            userId: userId,
            type: convertToEnum(type),
          },
          relations: ['webContent'],
          order: {
            webContent: {
              [orderMethod.col]: orderMethod.order,
            },
          },
        });
      } else {
        bogosips = await this.bogosipRepository.find({
          where: {
            userId: userId,
            type: convertToEnum(type),
          },
          relations: ['webContent'],
          order: {
            [orderMethod.col]: orderMethod.order,
          },
        });
      }

      return bogosips;
    } catch (err) {
      throw err;
    }
  }
}
