import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlService: CrawlerService) {}

  @Get('kakao')
  async getKakao() {
    return await this.crawlService.createKakaopages();
  }
}
