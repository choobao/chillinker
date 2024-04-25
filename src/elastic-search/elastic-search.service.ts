import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticSearchService {
  private readonly client: Client;
  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.get<string>('ELASTIC_NODE'),
      auth: {
        apiKey: this.configService.get<string>('ELASTIC_API_KEY'),
      },
    });
  }

  getClient(): Client {
    return this.client;
  }

  async getInfo() {
    const resp = await this.client.info();
    console.log(resp);
  }
}
