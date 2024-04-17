import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Likes } from './entities/likes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Likes])],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
