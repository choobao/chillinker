import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { Likes } from './entities/likes.entity';
import { WebContents } from '../web-content/entities/webContents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Likes, WebContents])],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
