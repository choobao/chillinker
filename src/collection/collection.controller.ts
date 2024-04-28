import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Render,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from '../user/entities/user.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuthGuard } from '../auth/optinal.authguard';

// import { Collections } from './entities/collections.entity';

@ApiTags('COLLECTION')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @ApiOperation({ summary: '인기 컬렉션 조회' })
  @Get('/popular')
  async getPopularCols(
    @Query('page') page?: string,
    @Query('order') order?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;

    // getTopCollections 함수에 변환된 pageNumber와 order를 전달
    return this.collectionService.getPopularCollections(pageNumber, order);
  }

  @ApiOperation({ summary: '내 컬렉션 목록 조회' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/collections')
  @Render('collection/my_collection_list')
  async myCollections(@UserInfo() user: Users) {
    const myColList = await this.collectionService.getMyColList(user.id);
    return { collection: myColList, users: user };
  }

  @Post('/collections/info/:collectionId')
  async getTitles(@Param('collectionId') collectionId: number) {
    const myCol = await this.collectionService.getTitles(collectionId);
    return myCol;
  }

  @Get('/collections/col-list/info/:collectionId')
  async Collection(@Param('collectionId') collectionId: number) {
    const myCol = await this.collectionService.getMyCol(collectionId);
    return myCol;
  }

  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '컬렉션 상세 조회' })
  @Get('/collections/info/:collectionId')
  @Render('collection/collection_detail')
  async myCollection(@Param('collectionId') collectionId: number, @Req() req) {
    return await this.collectionService.getMyColBlind(collectionId, req.user);
  }

  @ApiOperation({ summary: '컬렉션 컨텐츠 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/collections/:collectionId/content/:webContentId')
  async removeContentFromCollection(
    @UserInfo() user: Users,
    @Param('collectionId') collectionId: number,
    @Param('webContentId') webContentId: number,
  ) {
    const userId = user.id;
    return await this.collectionService.removeContentFromCollection(
      userId,
      collectionId,
      webContentId,
    );
  }

  @ApiOperation({ summary: '타 유저 컬렉션 목록 조회' })
  @Get('/collections/:userId')
  @Render('collection/user_collection_list')
  async userCollections(@Param('userId') userId: number) {
    const collections = await this.collectionService.getUserColList(userId);
    return { collections };
  }

  @ApiOperation({ summary: '컬렉션 생성' })
  @UseInterceptors(FileInterceptor('coverImage'))
  @UseGuards(AuthGuard('jwt'))
  @Post('/collections')
  async addCollection(
    @UploadedFile() file: Express.Multer.File,
    @Body() createColDto: CreateColDto,
    @UserInfo() user: Users,
  ) {
    // return await this.collectionService.createCol(file, createColDto, user.id);
    const createdCollection = await this.collectionService.createCol(
      file,
      createColDto,
      user.id,
    );
    return { collections: createdCollection };
  }

  @ApiOperation({ summary: '컬렉션 수정' })
  @UseInterceptors(FileInterceptor('coverImage'))
  @UseGuards(AuthGuard('jwt'))
  @Patch('/collections/:collectionId')
  async updateCollection(
    @UploadedFile() file: Express.Multer.File,
    @UserInfo() user: Users,
    @Param('collectionId') collectionId: number,
    @Body() updateColDto: UpdateColDto,
  ) {
    return await this.collectionService.updateCol(
      file,
      collectionId,
      updateColDto,
    );
  }

  @ApiOperation({ summary: '컬렉션 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Delete('/collections/:collectionId')
  async deleteCollection(
    @UserInfo() user: Users,
    @Param('collectionId') collectionId: number,
  ) {
    const userId = user.id;
    return await this.collectionService.deleteCol(userId, collectionId);
  }

  @ApiOperation({ summary: '컬렉션 컨텐츠 추가' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/collections/:collectionId/content/:webContentId')
  async addContentToCollection(
    @UserInfo() user: Users,
    @Param('collectionId') collectionId: number,
    @Param('webContentId') webContentId: number,
  ) {
    const userId = user.id;

    const isContentExist =
      await this.collectionService.isContentExistInCollection(
        userId,
        collectionId,
        webContentId,
      );
    if (isContentExist) {
      throw new BadRequestException('이미 존재하는 컨텐츠입니다.');
    }

    return await this.collectionService.addContentToCollection(
      userId,
      collectionId,
      webContentId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/collections/title/:userId')
  async getMyColsTitle(@UserInfo() user: Users) {
    const userId = user.id;
    return await this.collectionService.getMyColsTitle(userId);
  }
}
