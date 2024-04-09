import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from 'src/user/entities/user.entity';
import { CollectionBookmarkService } from './collection-bookmark.service';
import { UserInfo } from 'src/utils/userinfo.decorator';

@Controller('bookmark')
export class CollectionBookmarkController {
  constructor(
    private readonly collectionBookmarkService: CollectionBookmarkService,
  ) {}

  // 컬렉션 북마크 목록 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getBookmarkCollections(@UserInfo() user: Users) {
    const myBookmarkList =
      await this.collectionBookmarkService.getBookmarkColList(user.id);
    return myBookmarkList;
  }

  // 컬렉션 북마크 추가
  @UseGuards(AuthGuard('jwt'))
  @Post('/:collectionId')
  async addBookmarkCollection(
    @Param('collectionId') collectionId: number,
    @UserInfo() user: Users,
  ) {
    return await this.collectionBookmarkService.addBookmark(
      collectionId,
      user.id,
    );
  }

  // 컬렉션 북마크 취소
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:collectionId')
  async deleteBookmarkCollection(
    @Param('collectionId') collectionId: number,
    @UserInfo() user: Users,
  ) {
    await this.collectionBookmarkService.deleteBookmark(collectionId, user.id);
  }
}
