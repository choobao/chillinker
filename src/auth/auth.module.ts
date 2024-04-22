import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategy/jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/jwt.google.strategy';
import { KakaoStrategy } from './strategy/jwt.kakao.strategy';
import { NaverStrategy } from './strategy/jwt.naver.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Users]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy,
  ],
})
export class AuthModule {}
