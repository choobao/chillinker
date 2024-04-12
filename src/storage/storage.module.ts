import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [StorageService, ConfigService],
  exports: [StorageService],
})
export class StorageModule {}
