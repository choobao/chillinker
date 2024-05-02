import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlService: CrawlerService) {}

  @Get('test')
  async test() {
    return await this.crawlService.saveAllTogether();
  }
}
