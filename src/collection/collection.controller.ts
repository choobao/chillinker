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

@ApiTags('COLLECTION')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @ApiOperation({ summary: '인기 컬렉션 조회' })
  @Get('/popular')
  @Render('collectionTop')
  async showPopularCollections(
    @Query('page') page?: number,
    @Query('order') order?: string,
  ) {
    const { collections, totalPages } =
      await this.collectionService.getPopularCollections(page, order);

    return {
      collections,
      totalPages,
      order,
      page,
    };
  }

  @ApiOperation({ summary: '내 컬렉션 목록 조회' })
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  @Render('collection/my_collection_list')
  async myCollections(@UserInfo() user: Users) {
    const myColList = await this.collectionService.getMyColList(user.id);
    return { collection: myColList, users: user };
  }

  @Post('/info/:collectionId')
  async getTitles(@Param('collectionId') collectionId: number) {
    const myCol = await this.collectionService.getTitles(collectionId);
    return myCol;
  }

  @Get('/col-list/info/:collectionId')
  async Collection(@Param('collectionId') collectionId: number) {
    const myCol = await this.collectionService.getMyCol(collectionId);
    return myCol;
  }

  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '컬렉션 상세 조회' })
  @Get('/info/:collectionId')
  @Render('collection/collection_detail')
  async myCollection(@Param('collectionId') collectionId: number, @Req() req) {
    return await this.collectionService.getMyColBlind(collectionId, req.user);
  }

  @ApiOperation({ summary: '컬렉션 컨텐츠 삭제' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:collectionId/content/:webContentId')
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
  @Get('/:userId')
  @Render('collection/user_collection_list')
  async userCollections(@Param('userId') userId: number) {
    const collections = await this.collectionService.getUserColList(userId);
    return { collections };
  }

  @ApiOperation({ summary: '컬렉션 생성' })
  @UseInterceptors(FileInterceptor('coverImage'))
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async addCollection(
    @UploadedFile() file: Express.Multer.File,
    @Body() createColDto: CreateColDto,
    @UserInfo() user: Users,
  ) {
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
  @Patch('/:collectionId')
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
  @Delete('/:collectionId')
  async deleteCollection(
    @UserInfo() user: Users,
    @Param('collectionId') collectionId: number,
  ) {
    const userId = user.id;
    return await this.collectionService.deleteCol(userId, collectionId);
  }

  @ApiOperation({ summary: '컬렉션 컨텐츠 추가' })
  @UseGuards(AuthGuard('jwt'))
  @Post('/:collectionId/content/:webContentId')
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
  @Get('/title/:userId')
  async getMyColsTitle(@UserInfo() user: Users) {
    const userId = user.id;
    return await this.collectionService.getMyColsTitle(userId);
  }
}
