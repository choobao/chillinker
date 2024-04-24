import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collections } from './entities/collections.entity';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { CollectionBookmarkService } from './collection-bookmark.service';
import { CollectionBookmarkController } from './collection-bookmark.controller';

// import { CollectionBookmarkUser } from './entities/collection-bookmark-user.entity';

import { WebContents } from '../web-content/entities/webContents.entity';
import { ContentCollection } from './entities/content-collections.entity';
import { StorageService } from '../storage/storage.service';
import { Users } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collections,
      CollectionBookmark,
      // CollectionBookmarkUser,
      ContentCollection,
      WebContents,
      StorageService,
      Users,
    ]),
  ],
  exports: [CollectionService, CollectionBookmarkService],
  providers: [CollectionService, CollectionBookmarkService, StorageService],
  controllers: [CollectionController, CollectionBookmarkController],
})
export class CollectionModule {}
