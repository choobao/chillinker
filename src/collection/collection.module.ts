import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collections } from './entities/collections.entity';
import { Collection_likes } from './entities/collection.likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collections, Collection_likes])],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}
