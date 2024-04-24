import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search.service';
import { ConfigService } from '@nestjs/config';
import { ElasticSearchController } from './elastic-search.controller';

@Module({
  providers: [ElasticSearchService, ConfigService],
  controllers: [ElasticSearchController],
})
export class ElasticSearchModule {}
