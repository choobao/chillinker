import { Module } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { WebContentController } from './web-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bogosips } from './entities/bogosips.entity';
import { WebContents } from './entities/webContents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bogosips, WebContents])],
  providers: [WebContentService],
  controllers: [WebContentController],
  exports: [WebContentService],
})
export class WebContentModule {}
