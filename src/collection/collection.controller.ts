import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';
// import { Collections } from './entities/collections.entity';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  //   내 컬렉션 목록 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async myCollections(@Param('userId', ParseIntPipe) userId: number) {
    const myColList = await this.collectionService.getMyColList(userId);
    return await myColList;
  }

  // 내 컬렉션 상세 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/:collectionId')
  async myCollection(
    @Param('collectionId', ParseIntPipe) collectionId: number,
  ) {
    const myCol = await this.collectionService.getMyCol(collectionId);
    return myCol;
  }

  // 컬렉션 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async addCollection(@Body() createColDto: CreateColDto) {
    return await this.collectionService.createCol(createColDto);
  }

  // 컬렉션 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:collectionId')
  async updateCollection(
    @Param('collection_id', ParseIntPipe) collectionId: number,
    @Body() updateColDto: UpdateColDto,
  ) {
    return await this.collectionService.updateCol(collectionId, updateColDto);
  }

  // 컬렉션 삭제
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Delete('/:collectionId')
  async deleteCollection(
    @Param('collection_id', ParseIntPipe) collectionId: number,
  ) {
    return await this.collectionService.deleteCol(collectionId);
  }

  //   @Get('/bookmark/collections')
  //   async bookmarkCollections() {}
  //   @Get('/bookmark/collections/:collectionId')
  //   async bookmarkCollection() {}
}
