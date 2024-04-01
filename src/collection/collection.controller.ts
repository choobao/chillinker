import {
  Body,
  Controller,
  Get,
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
  async myCollections(@Param('user_id', ParseIntPipe) user_id: number) {
    const myColList = await this.collectionService.getMyColList(user_id);
    return await myColList;
  }

  // 내 컬렉션 상세 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/:collectionId')
  async myCollection(
    @Param('collection_id', ParseIntPipe) collection_id: number,
  ) {
    const myCol = await this.collectionService.getMyCol(collection_id);
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
  async updateCollection()

  @Get('/bookmark/collections')
  async bookmarkCollections(
    @Param('collection_id', ParseIntPipe) collection_id: number,
    @Body() updateColDto: UpdateColDto
  ) {
    return await this.collectionService.updateCol(collection_id, updateColDto);
  }

  @Get('/bookmark/collections/:collectionId')
  async bookmarkCollection() {}
}
