import { Controller, Get } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search.service';

@Controller('elastic-search')
export class ElasticSearchController {
  constructor(private readonly elasticService: ElasticSearchService) {}

  @Get()
  async test() {
    return await this.elasticService.getInfo();
  }
}
