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

@ApiTags('FOLLOWS')
@Controller('users/:id/follows')
export class FollowController {
  constructor(private followService: FollowService) {}

  @ApiOperation({ summary: '팔로우/언팔로우' })
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @Post('follow')
  async follow(@Param('id') followingId: number, @Req() req) {
    const followerId = req.user.id;

    if (followingId === followerId) {
      throw new BadRequestException('스스로를 팔로우 할 수는 없습니다');
    }
    await this.followService.follow(followingId, followerId);
  }

  @ApiOperation({ summary: '팔로잉 목록 조회' })
  @Get('followingList')
  async getFollowingList(@Param('id') followerId: number) {
    return await this.followService.getFollowingList(followerId);
  }

  @ApiOperation({ summary: '팔로워 목록 조회' })
  @Get('followerList')
  @Render('follower.ejs')
  async getFollowerList(@Param('id') followingId: number) {
    // 린님 기존 코드(json 데이터를 반환하고 있어서 렌더링에 사용될수 없다고 함)
    // return await this.followService.getFollowerList(followingId);
    const followerList = await this.followService.getFollowerList(followingId);
    return { followerList };
  }
}
