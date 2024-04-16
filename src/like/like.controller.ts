import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from '../user/entities/user.entity';
import _ from 'lodash';
import { LikeService } from './like.service';

@ApiTags('LIKE')
@Controller()
@UseGuards(AuthGuard('jwt'))
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({ summary: '보고싶어요 에 작품 추가' })
  @Post('likes/add')
  @HttpCode(201)
  async addContent(
    @UserInfo() user: Users,
    @Query('contentId') contentId: number,
  ) {
    return await this.likeService.addContent(user.id, contentId);
  }

  @ApiOperation({ summary: '보고싶어요 에서 작품 삭제' })
  @Delete('likes/delete')
  @HttpCode(200)
  async deleteContent(
    @UserInfo() user: Users,
    @Query('contentId') contentId: number,
  ) {
    return await this.likeService.deleteContent(user.id, contentId);
  }

  @ApiOperation({ summary: '보고싶어요 조회(타인)' })
  @Get('likes')
  @HttpCode(200)
  @Render('liked_list.ejs')
  async getLikes(
    @Query('userId') userId: number,
    @Query('sortType') sortType: string,
  ) {
    const content = await this.likeService.findContents(userId, sortType);
    return { content };
  }

  @ApiOperation({ summary: '보고싶어요 조회(본인)' })
  @Get('user/likes')
  @HttpCode(200)
  @Render('liked_list.ejs')
  async getMyLikes(
    @UserInfo() user: Users,
    @Query('sortType') sortType: string = 'ADD_DT',
  ) {
    const content = await this.likeService.findContents(user.id, sortType);
    return { content };
  }
}