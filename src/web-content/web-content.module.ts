import { Module } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { WebContentController } from './web-content.controller';

@Module({
  providers: [WebContentService],
  controllers: [WebContentController]
})
export class WebContentModule {}
