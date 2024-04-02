import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collections } from './entities/collections.entity';
import { CollectionLikes } from './entities/collection.likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collections, CollectionLikes])],
  exports: [CollectionService],
  providers: [CollectionService],
  controllers: [CollectionController],
})
export class CollectionModule {}
