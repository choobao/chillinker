import { Module } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { WebContentController } from './web-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebContents } from './entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';
import { Likes } from '../like/entities/likes.entity';
import { OptionalAuthGuard } from '../auth/optinal.authguard';

@Module({
  imports: [TypeOrmModule.forFeature([Likes, WebContents, Users, Collections])],
  providers: [WebContentService, OptionalAuthGuard],
  controllers: [WebContentController],
  exports: [WebContentService],
})
export class WebContentModule {}
