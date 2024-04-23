import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Users } from '../user/entities/user.entity';
import { UserInfo } from '../utils/userinfo.decorator';

@ApiTags('FOLLOWS')
@Controller()
export class FollowController {
  constructor(private followService: FollowService) {}

  @ApiOperation({ summary: '내 팔로워 목록 조회' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/user/follower')
  @Render('follower')
  async getMyFollower(@UserInfo() user: Users) {
    const followerList = await this.followService.getFollowerList(user.id);

    for (const follower of followerList) {
      follower.isFollowing = await this.followService.isFollowing(
        follower.id,
        user.id,
      );
    }

    return { followerList };
  }

  @ApiOperation({ summary: '내 팔로잉 목록 조회' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/user/following')
  @Render('following')
  async getMyFollowing(@UserInfo() user: Users) {
    const followingList = await this.followService.getFollowingList(user.id);
    return { followingList };
  }

  @ApiOperation({ summary: '팔로우/언팔로우' })
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @Post('users/:id/follows/follow')
  async follow(@Param('id') followingId: number, @UserInfo() user: Users) {
    const followerId = user.id;

    if (followingId === followerId) {
      throw new BadRequestException('스스로를 팔로우 할 수는 없습니다');
    }
    await this.followService.follow(followingId, followerId);
  }

  @ApiOperation({ summary: '팔로잉 목록 조회' })
  @Get('users/:id/follows/followingList')
  @Render('following.ejs')
  async getFollowingList(@Param('id') followerId: number) {
    // return await this.followService.getFollowingList(followerId);
    const followingList = await this.followService.getFollowingList(followerId);
    return { followingList };
  }

  @ApiOperation({ summary: '팔로워 목록 조회' })
  @Get('users/:id/follows/followerList')
  // @Render('follower.ejs')
  async getFollowerList(@Param('id') followingId: number) {
    // return await this.followService.getFollowerList(followingId);
    const followerList = await this.followService.getFollowerList(followingId);
    return { followerList };
  }
}
