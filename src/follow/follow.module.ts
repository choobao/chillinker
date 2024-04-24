import { Follows } from './entities/follow.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Module } from '@nestjs/common';
import { Users } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Follows])],
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule {}
