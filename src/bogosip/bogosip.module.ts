import { Module } from '@nestjs/common';
import { BogosipService } from './bogosip.service';
import { BogosipController } from './bogosip.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bogosips } from './entities/bogosips.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bogosips])],
  providers: [BogosipService],
  controllers: [BogosipController],
})
export class BogosipModule {}
