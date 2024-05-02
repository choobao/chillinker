import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search.service';
import { ConfigService } from '@nestjs/config';
import { ElasticSearchController } from './elastic-search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebContents])],
  providers: [ElasticSearchService, ConfigService],
  controllers: [ElasticSearchController],
  exports: [ElasticSearchService],
})
export class ElasticSearchModule {}
