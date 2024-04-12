import { Module } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { WebContentController } from './web-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bogosips } from '../bogosip/entities/bogosips.entity';
import { WebContents } from './entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bogosips, WebContents, Users, Collections]),
  ],
  providers: [WebContentService],
  controllers: [WebContentController],
  exports: [WebContentService],
})
export class WebContentModule {}
