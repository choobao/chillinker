import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from './review/review.module';
import { CollectionModule } from './collection/collection.module';
import { FollowModule } from './follow/follow.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WebContentModule } from './web-content/web-content.module';
import { RedisModule } from './redis/redis.module';
import { CrawlerModule } from './crawler/crawler.module';
import { StorageModule } from './storage/storage.module';
import { LikeModule } from './like/like.module';
import { SseModule } from './sse/sse.module';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: configService.get('DB_SYNC'),
    logging: true,
    charset: 'utf8mb4',
  }),
  inject: [ConfigService],
};

const cacheModuleOptions: CacheModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
    username: configService.get<string>('REDIS_USERNAME'),
    password: configService.get<string>('REDIS_PASSWORD'),
    no_ready_check: true,
  }),
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validationSchema: Joi.object({
      //   JWT_SECRET_KEY: Joi.string().required(),
      //   JWT_REFRESH_KEY: Joi.string().required(),
      //   DB_USERNAME: Joi.string().required(),
      //   DB_PASSWORD: Joi.string().required(),
      //   DB_HOST: Joi.string().required(),
      //   DB_PORT: Joi.number().required(),
      //   DB_NAME: Joi.string().required(),
      //   DB_SYNC: Joi.boolean().required(),
      // }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    CacheModule.registerAsync({ isGlobal: true, ...cacheModuleOptions }),
    AuthModule,
    UserModule,
    FollowModule,
    ReviewModule,
    CollectionModule,
    WebContentModule,
    RedisModule,
    ScheduleModule.forRoot(),
    CrawlerModule,
    LikeModule,
    StorageModule,
    SseModule,
  ],
  controllers: [ReviewController],
  providers: [],
})
export class AppModule {}
