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

  //유저 팔로우
  async follow(followingId: number, followerId: number) {
    const followingUser = await this.userRepository.findOneBy({
      id: followingId,
    });

    if (!followingUser) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다');
    }

    const isExistingFollowing = await this.followRepository.findOne({
      where: { following_id: followingId, follower_id: followerId },
    });

    if (isExistingFollowing) {
      await this.followRepository.delete({
        following_id: followingId,
        follower_id: followerId,
      });

      return {
        status: 200,
        message: `${followingUser.nickname}님을 언팔로우했습니다.`,
      };
    }

    await this.followRepository.save({
      following_id: followingId,
      follower_id: followerId,
    });
    return {
      status: 200,
      message: `${followingUser.nickname}님을 팔로우했습니다.`,
    };
  }

  //이 유저의 팔로잉 목록 조회
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
        'followings.profile_image',
      ])
      .where('follows.follower_id = follower_id', { follower_id: followerId })
      .getRawMany();

    return followingList;
  }

  //이 유저의 팔로워 목록 조회
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
        'followers.profile_image',
      ])
      .where('follows.following_id = following_id', {
        following_id: followingId,
      })
      .getRawMany();
    return followerList;
  }
}
