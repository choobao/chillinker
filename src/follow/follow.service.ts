import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follows } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { Users } from '../user/entities/user.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follows)
    private followRepository: Repository<Follows>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async follow(followingId: number, followerId: number) {
    const followingUser = await this.userRepository.findOneBy({
      id: followingId,
    });

    if (!followingUser) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다');
    }

    const followRelation = { followingId: followingId, followerId: followerId };

    const isExistingFollowing = await this.followRepository.findOne({
      where: followRelation,
    });

    isExistingFollowing
      ? await this.followRepository.delete(followRelation)
      : await this.followRepository.save(followRelation);
  }

  async getFollowingList(followerId: number) {
    const followingUser = await this.userRepository.findOneBy({
      id: followerId,
    });

    if (!followingUser) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다');
    }

    const followingList = await this.followRepository
      .createQueryBuilder('follows')
      .leftJoinAndSelect('follows.followings', 'followings')
      .select([
        'followings.id',
        'followings.email',
        'followings.nickname',
        'followings.intro',
        'followings.profileImage',
      ])
      .where('follows.followerId = :followerId', { followerId })
      .getRawMany();

    return followingList;
  }

  async getFollowerList(followingId: number) {
    const followingUser = await this.userRepository.findOneBy({
      id: followingId,
    });

    if (!followingUser) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다');
    }

    const followerList = await this.followRepository
      .createQueryBuilder('follows')
      .leftJoinAndSelect('follows.followers', 'followers')
      .select([
        'followers.id',
        'followers.email',
        'followers.nickname',
        'followers.intro',
        'followers.profileImage',
      ])
      .where('follows.followingId = :followingId', { followingId })
      .getRawMany();

    return followerList;
  }

  async isFollowing(followingId: number, followerId: number): Promise<boolean> {
    const followRelation = { followingId, followerId };
    const existingFollow = await this.followRepository.findOne({
      where: followRelation,
    });
    return !!existingFollow; // 반환값으로 팔로우 여부를 불리언 값으로 반환
  }
}
