import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collections } from './entities/collections.entity';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { CollectionBookmarkService } from './collection-bookmark.service';
import { CollectionBookmarkController } from './collection-bookmark.controller';

import { CollectionBookmarkUser } from './entities/collection-bookmark-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collections,
      CollectionBookmark,
      CollectionBookmarkUser,
    ]),
  ],
  exports: [CollectionService, CollectionBookmarkService],
  providers: [CollectionService, CollectionBookmarkService],
  controllers: [CollectionController, CollectionBookmarkController],
})
export class CollectionModule {}
