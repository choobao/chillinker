import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collections } from './entities/collections.entity';
import { CollectionBookmark } from './entities/collection.bookmark.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collections, CollectionBookmark])],
  exports: [CollectionService],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}
