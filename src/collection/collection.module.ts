import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collections } from './entities/collections.entity';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { CollectionBookmarkService } from './collection-bookmark.service';
import { CollectionBookmarkController } from './collection-bookmark.controller';

import { CollectionBookmarkUser } from './entities/collection-bookmark-user.entity';

import { WebContents } from 'src/web-content/entities/webContents.entity';
import { ContentCollection } from './entities/content-collections.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collections,
      CollectionBookmark,
      CollectionBookmarkUser,
      ContentCollection,
      WebContents,
    ]),
  ],
  exports: [CollectionService, CollectionBookmarkService],
  providers: [CollectionService, CollectionBookmarkService],
  controllers: [CollectionController, CollectionBookmarkController],
})
export class CollectionModule {}
