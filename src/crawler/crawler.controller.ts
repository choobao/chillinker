import { Controller, Get } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlService: CrawlerService) {}

  @Get('test')
  async test() {
    return await this.crawlService.saveAllTogether();
  }

  // @Get('kakao')
  // async getKakao() {
  //   return await this.crawlService.createKakaopages();
  // }

  // @Get('ridibooks')
  // async getRidi() {
  //   return await this.crawlService.createRidibooks();
  // }

  // @Get('mrblue')
  // async getMrblue() {
  //   return await this.crawlService.createMrblue();
  // }
}
