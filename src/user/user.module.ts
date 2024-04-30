import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { UserGuard } from '../auth/user.guard';
import { UnauthorizedExceptionFilter } from '../unauthorized-exception/unauthorized-exception.filter';
import { UserAdultVerifyRequest } from './entities/user.adult-verify.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        signOptions: { expiresIn: '1h' },
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Users, UserAdultVerifyRequest]),
  ],
  providers: [
    UserService,
    StorageService,
    UserGuard,
    //UnauthorizedExceptionFilter,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
