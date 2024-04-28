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

  async save(key: string, value: any, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value, 'EX', 25 * 3600); // 25h expire
    }
  }

  async getValue(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    return value;
  }

  async delete(key: string) {
    try {
      await this.client.del(key);
    } catch (err) {
      throw err;
    }
  }

  async cacheData(key: string, value: any, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    console.log('success caching ', key);
  }

  async getCachedData(key: string): Promise<any> {
    const data = await this.client.get(key);
    console.log('cache hit!');
    return data ? JSON.parse(data) : null;
  }
}
