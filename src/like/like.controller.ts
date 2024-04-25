import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Render,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from '../user/entities/user.entity';
import _ from 'lodash';
import { LikeService } from './like.service';
import { ErrorInterceptor } from '../common/interceptors/error/error.interceptor';

@ApiTags('LIKE')
@Controller()
@UseInterceptors(ErrorInterceptor)
@UseGuards(AuthGuard('jwt'))
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({ summary: '보고싶어요 에 작품 추가/삭제' })
  @Post('likes/change')
  @HttpCode(201)
  async changeContent(
    @UserInfo() user: Users,
    @Query('contentId') contentId: number,
  ) {
    return await this.likeService.changeContent(user.id, contentId);
  }

  @ApiOperation({ summary: '보고싶어요 조회(타인)' })
  @Get('likes')
  @HttpCode(200)
  @Render('liked_list')
  async getLikes(
    @Query('userId') userId: number,
    @Query('sortType') sortType: string,
  ) {
    if (
      sortType !== 'ADD_DT' &&
      sortType !== 'ADD_DT_DESC' &&
      sortType !== 'OLD' &&
      sortType !== 'NEW'
    ) {
      sortType = 'ADD_DT';
    }
    const content = await this.likeService.findContents(userId, sortType);
    return { content };
  }

  @ApiOperation({ summary: '보고싶어요 조회(본인)' })
  @Get('user/likes')
  @HttpCode(200)
  @Render('liked_list')
  async getMyLikes(
    @UserInfo() user: Users,
    @Query('sortType') sortType: string = 'ADD_DT',
  ) {
    if (
      sortType !== 'ADD_DT' &&
      sortType !== 'ADD_DT_DESC' &&
      sortType !== 'OLD' &&
      sortType !== 'NEW'
    ) {
      sortType = 'ADD_DT';
    }
    const content = await this.likeService.findContents(user.id, sortType);
    return { content };
  }
}
