import { Module } from '@nestjs/common';
import { BogosipService } from './bogosip.service';
import { BogosipController } from './bogosip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bogosips } from './entities/bogosips.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bogosips, WebContents])],
  providers: [BogosipService],
  controllers: [BogosipController],
})
export class BogosipModule {}
