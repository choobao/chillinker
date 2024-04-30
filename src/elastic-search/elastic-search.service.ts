import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Repository } from 'typeorm';
import { ContentType } from '../web-content/webContent.type';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ElasticSearchService {
  private readonly client: Client;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(WebContents)
    private readonly contentRepository: Repository<WebContents>,
  ) {
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

  async indexContents(contents, indexName: string) {
    contents.forEach(async (content) => {
      await this.client.index({
        index: indexName,
        id: String(content.id),
        body: content,
      });
    });
  }

  @Cron('34 11 * * *')
  async indexWebContentsToElasticSearch() {
    const webContents = await this.contentRepository.find();

    try {
      const startTime = new Date().getTime();
      console.log('시작!');

      await this.indexContents(webContents, 'webcontents');

      console.log(new Date().getTime() - startTime, ' ms');
    } catch (err) {
      console.error('인덱싱 중 오류 발생: ', err);
      throw err;
    }
  }

  async search(
    indexName: string = 'webcontents',
    keyword: string,
    fieldName: string,
    page: number,
    take: number,
  ) {
    try {
      const from = (page - 1) * take;

      const query = {
        query: {
          match: {
            [fieldName]: {
              query: keyword,
            },
          },
        },
        _source: ['id', 'title', 'author', 'starRate', 'image', 'contentType', 'isAdult'],
      };
      const result = await this.client.search({
        track_total_hits: true,
        index: indexName,
        body: query,
        size: take,
        from: from,
      });

    
      return result.hits.hits.length !== 0
        ? result.hits.hits.map((item) => item._source)
        : [];
    } catch (err) {
      console.error('검색 중 오류 발생: ', err);
      throw err;
    }
  }

  async searchMultipleField(
    indexName: string,
    keyword: string,
    fieldName1: string,
    fieldName2: string,
    page: number,
    take: number,
  ) {
    try {
      const from = (page - 1) * take;

      const result = await this.client.search({
        index: indexName,
        size: take,
        from: from,
        body: {
          query: {
            bool: {
              should: [
                {
                  match: {
                    [fieldName1]: `*${keyword}*`,
                  },
                },
                {
                  match: {
                    [fieldName2]: `*${keyword}*`,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
          _source: ['id', 'title', 'author', 'starRate', 'image', 'contentType', 'isAdult'],
        },
      });

      return result.hits.hits.length !== 0
        ? result.hits.hits.map((item) => item._source)
        : [];
    } catch (err) {
      console.error('멀티검색 중 에러 발생: ', err);
      throw err;
    }
  }
}
