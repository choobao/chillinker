import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminGuard } from '../auth/admin.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../user/entities/user.entity';
import { UserAdultVerifyRequest } from '../user/entities/user.adult-verify.entity';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserAdultVerifyRequest])],
  providers: [AdminService, AdminGuard, StorageService],
  controllers: [AdminController],
})
export class AdminModule {}
