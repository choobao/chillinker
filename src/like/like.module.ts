import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';

@Module({
  providers: [LikeService],
  controllers: [LikeController]
})
export class LikeModule {}
