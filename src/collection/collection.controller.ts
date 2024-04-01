import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { AuthGuard } from '@nestjs/passport';
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

  @Post('/')
  async addCollection() {
    const addCol = await this.collectionService.createCol();
    return addCol;
  }

  @Get('/bookmark/collections')
  async bookmarkCollections() {}

  @Get('/bookmark/collections/:collectionId')
  async bookmarkCollection() {}
}
