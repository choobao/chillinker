import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateColDto } from './dto/createCol.dto';
import { UpdateColDto } from './dto/updateCol.dto';
import { UserInfo } from '../utils/userinfo.decorator';
import { Users } from '../user/entities/user.entity';

// import { Collections } from './entities/collections.entity';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  //   내 컬렉션 목록 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async myCollections(@UserInfo() user: Users) {
    const myColList = await this.collectionService.getMyColList(user.id);
    return await myColList;
  }

  // 내 컬렉션 상세 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('/:collectionId')
  async myCollection(@Param('collectionId') collectionId: number) {
    const myCol = await this.collectionService.getMyCol(collectionId);
    return myCol;
  }

  // 컬렉션 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async addCollection(
    @Body() createColDto: CreateColDto,
    @UserInfo() user: Users,
  ) {
    return await this.collectionService.createCol(createColDto, user.id);
  }

  // 컬렉션 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('/:collectionId')
  async updateCollection(
    @Param('collectionId') collectionId: number,
    @Body() updateColDto: UpdateColDto,
  ) {
    return await this.collectionService.updateCol(collectionId, updateColDto);
  }

  // 컬렉션 삭제
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  @Delete('/:collectionId')
  async deleteCollection(collectionId: number) {
    return await this.collectionService.deleteCol(collectionId);
  }

  // 컨텐츠 추가
  @UseGuards(AuthGuard('jwt'))
  @Post('/:collectionId/add-content')
  async addContentToCollection(
    @Param('collectionId') collectionId: number,
    @Body() { webContentId }: { webContentId: number },
  ) {
    return await this.collectionService.addContentToCollection(
      collectionId,
      webContentId,
    );
  }

  // 컨텐츠 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:collectionId/remove-content/:webContentId')
  async removeContentFromCollection(
    @Param('collectionId') collectionId: number,
    @Param('webContentId') webContentId: number,
  ) {
    return await this.collectionService.removeContentFromCollection(
      collectionId,
      webContentId,
    );
  }
}
