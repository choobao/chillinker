import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BogosipService } from './bogosip.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from '../user/entities/user.entity';
import _ from 'lodash';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class BogosipController {
  constructor(private readonly bogosipService: BogosipService) {}

  @ApiOperation({ summary: '보는중/보고싶어요 에 작품 추가' })
  @Post('bogosips/add/:type')
  @HttpCode(201)
  async addContent(
    @UserInfo() user: Users,
    @Param('type') type: string,
    @Query('contentId') contentId: number,
  ) {
    return await this.bogosipService.addContent(user.id, contentId, type);
  }

  @ApiOperation({ summary: '보는중/보고싶어요 에서 작품 삭제' })
  @Delete('bogosips/delete/:type')
  @HttpCode(200)
  async deleteContent(
    @UserInfo() user: Users,
    @Param('type') type: string,
    @Query('contentId') contentId: number,
  ) {
    return await this.bogosipService.deleteContent(user.id, contentId, type);
  }

  @ApiOperation({ summary: '보는중/보고싶어요 조회(타인)' })
  @Get('bogosips/:type')
  @HttpCode(200)
  async getBogosips(
    @Param('type') type: string,
    @Query('userId') userId: number,
    @Query('sortType') sortType: string,
  ) {
    return await this.bogosipService.findContents(userId, type, sortType);
  }

  @ApiOperation({ summary: '보는중/보고싶어요 조회(본인)' })
  @Get('user/bogosips/:type')
  @HttpCode(200)
  async getMyBogosips(
    @UserInfo() user: Users,
    @Param('type') type: string,
    @Query('sortType') sortType: string = 'ADD_DT',
  ) {
    return await this.bogosipService.findContents(user.id, type, sortType);
  }
}
