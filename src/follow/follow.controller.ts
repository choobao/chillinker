import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users/:id')
export class FollowController {
  constructor(private followService: FollowService) {}

  //이 유저 팔로우/언팔로우
  @UseGuards(AuthGuard('jwt'))
  @Post('follow')
  async follow(@Param('id') followingId: number, @Req() req, @Res() res) {
    try {
      const followerId = req.user.id;

      if (followingId === followerId) {
        throw new BadRequestException('스스로를 팔로우 할 수는 없습니다');
      }
      const result = await this.followService.follow(followingId, followerId);
      return res.status(result.status).send(`${result.message}`);
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //이 유저의 팔로잉 목록 조회
  @Get('followingList')
  async getFollowingList(@Param('id') followerId: number, @Res() res) {
    try {
      const followingList =
        await this.followService.getFollowingList(followerId);

      return res.status(200).json({ data: followingList });
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //이 유저의 팔로워 목록 조회
  @Get('followerList')
  async getFollowerList(@Param('id') followingId: number, @Res() res) {
    try {
      const followerList =
        await this.followService.getFollowerList(followingId);

      return res.status(200).json({ data: followerList });
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }
}
