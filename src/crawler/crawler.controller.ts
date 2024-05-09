import { Controller, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlService: CrawlerService) {}

  @Post()
  async crawling() {
    return await this.crawlService.saveAllTogether();
  }

}
