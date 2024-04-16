import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
@Injectable()
export class RedisService {
  private readonly client: Redis;
  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      username: this.configService.get<string>('REDIS_USERNAME'),
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async save(key: string, value: any, expiresInSec?: number) {
    if (expiresInSec) {
      await this.client.setex(key, expiresInSec, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async getValue(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    return value;
  }
}
