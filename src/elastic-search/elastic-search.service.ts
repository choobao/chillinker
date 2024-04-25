import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Repository } from 'typeorm';
import { ContentType } from '../web-content/webContent.type';
import { Cron } from '@nestjs/schedule';
import { bool } from 'joi';

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

  @Cron('25 23 * * *')
  async indexWebContentsToElasticSearch() {
    const webContents = await this.contentRepository.find();
    const webtoons = webContents.filter(
      (content) => content.contentType === ContentType.WEBTOON,
    );
    const webnovels = webContents.filter(
      (content) => content.contentType === ContentType.WEBNOVEL,
    );

    try {
      const startTime = new Date().getTime();
      console.log('시작!');

      await this.indexContents(webtoons, 'webtoons');
      await this.indexContents(webnovels, 'webnovels');
      console.log(new Date().getTime() - startTime, ' ms');
    } catch (err) {
      console.error('인덱싱 중 오류 발생: ', err);
      throw err;
    }
  }

  async search(indexName: string, keyword: string, fieldName: string) {
    try {
      const query = {
        query: {
          match: {
            [fieldName]: {
              query: keyword,
            },
          },
        },
      };
      const result = await this.client.search({
        index: indexName,
        body: query,
        size: 180,
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
  ) {
    try {
      const result = await this.client.search({
        index: indexName,
        body: {
          query: {
            bool: {
              should: [
                {
                  wildcard: {
                    [fieldName1]: `*${keyword}*`,
                  },
                },
                {
                  wildcard: {
                    [fieldName2]: `*${keyword}*`,
                  },
                },
              ],
              minimum_should_match: 1,
            },
          },
        },
        size: 180,
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
