import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collections } from './entities/collections.entity';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

import { CollectionBookmark } from './entities/collection-bookmark.entity';
import { CollectionBookmarkService } from './collection-bookmark.service';
import { CollectionBookmarkController } from './collection-bookmark.controller';

import { WebContents } from '../web-content/entities/webContents.entity';
import { ContentCollection } from './entities/content-collections.entity';
import { StorageService } from '../storage/storage.service';
import { Users } from '../user/entities/user.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collections,
      CollectionBookmark,

      ContentCollection,
      WebContents,
      StorageService,
      Users,
    ]),
  ],
  exports: [CollectionService, CollectionBookmarkService],
  providers: [
    CollectionService,
    CollectionBookmarkService,
    StorageService,
    RedisService,
  ],
  controllers: [CollectionController, CollectionBookmarkController],
})
export class CollectionModule {}
