// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { RedisClient } from 'ioredis/built/connectors/SentinelConnector/types';
// //import { Redis } from 'ioredis';
// import { RedisClientType, createClient } from 'redis';
// @Injectable()
// export class RedisService implements OnModuleInit {
//   private readonly client: RedisClientType;
//   constructor(private readonly configService: ConfigService) {
//     this.client = createClient({
//       password: this.configService.get<string>('REDIS_PASSWORD'),
//       socket: {
//         host: this.configService.get<string>('REDIS_HOST'),
//         port: this.configService.get<number>('REDIS_PORT'),
//       },
//       legacyMode: true,
//     });
//     this.client.on('error', (err) => console.log('Redis Client Error', err));
//   }

//   async onModuleInit() {
//     await this.client.connect();
//   }

//   async save(key: string, value: any, expiresInSec?: number) {
//     if (expiresInSec) {
//       await this.client.setEx(key, expiresInSec, value);
//     } else {
//       await this.client.setEx(key, 24 * 3600, value); // 24h expire
//     }
//   }

//   async getValue(key: string): Promise<string | null> {
//     const value = await this.client.get(key);
//     return value;
//   }
// }
