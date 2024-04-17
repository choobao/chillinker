import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RedisService } from '../redis/redis.service';
import _ from 'lodash';

import { PReviews } from '../review/entities/platform.reviews.entity';

import { Type } from './utils/kakaopage.constants';

import {
  get20BestRanking,
  get60WebtoonRanking,
  getReviews10,
} from './platform/ridibooks';
import { GENRE, TYPE } from './utils/ridi.constants';
import {
  NaverSeriesAxios,
  NaverSeriesPuppeteer,
} from './platform/naver-series';

import {
  series_webnovel_top100_daily_url,
  series_webnovel_url,
  series_webtoon_top100_daily_url,
  series_webtoon_url,
} from './utils/naver-series.constants';
import KakaopageAxios from './platform/kakaopage';
import { ConfigService } from '@nestjs/config';

import MrbluePuppeteer from './platform/mr.blue';
import { ContentType } from '../web-content/webContent.type';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(WebContents)
    private readonly contentRepository: Repository<WebContents>,
    @InjectRepository(PReviews)
    private readonly reviewRepository: Repository<PReviews>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  naverSeriesPuppeteer: NaverSeriesPuppeteer = new NaverSeriesPuppeteer(
    this.configService,
  );

  async createNaverSeries(
    currNumWebnovel: number,
    currNumWebtoon: number,
    n: number,
  ) {
    const params: object[] = [
      { link: series_webtoon_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webnovel_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webtoon_url, currNum: currNumWebtoon, n },
      { link: series_webnovel_url, currNum: currNumWebnovel, n },
    ];

    try {
      return await this.naverSeriesPuppeteer.crawlNaverSeriesParallel(params);
    } catch (err) {
      throw new Error(`크롤링 실패: ${err.message}`);
    }
  }

  ////////////////////////////////////////////////////////////////////////////

  kakaopageAxios: KakaopageAxios = new KakaopageAxios();

  async createKakaopages(currPageWebnovel: number, currPageWebtoon: number) {
    try {
      const rankingWebnovels =
        await this.kakaopageAxios.getDailyRank_20_WebContents(Type.WEBNOVEL);

      const rankingWebtoons =
        await this.kakaopageAxios.getDailyRank_20_WebContents(Type.WEBTOON);

      const allWebnovels = await this.kakaopageAxios.getAll_96_WebContents(
        Type.WEBNOVEL,
        currPageWebnovel,
      );

      const allWebtoons = await this.kakaopageAxios.getAll_96_WebContents(
        Type.WEBTOON,
        currPageWebtoon,
      );

      return [].concat(
        rankingWebnovels,
        rankingWebtoons,
        allWebnovels,
        allWebtoons,
      );
    } catch (err) {
      throw err;
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  async createRidibooks(
    currRnovels: number,
    currRFnovels: number,
    currFnovels: number,
    currBnovels: number,
    currWebtoons: number,
  ) {
    try {
      const rankingRnovels = await get20BestRanking(GENRE.R);

      const rankingRFnovels = await get20BestRanking(GENRE.RF);

      // console.log('start!');
      // const rankingFnovels = await get20BestRanking(GENRE.F);
      // await this.save20Db(rankingFnovels);
      // console.log('done!');

      const rankingBnovels = await get20BestRanking(GENRE.B);

      const rankingWebtoons = await get20BestRanking(GENRE.WB);

      //전체랭킹
      // const change = await this.redisService.save(`ridi_curr1650`, 2);

      // const test = await this.redisService.getValue('ridi_curr1650');

      const Rnovels = await get60WebtoonRanking(TYPE.R, currRnovels);

      const RFnovels = await get60WebtoonRanking(TYPE.RF, currRFnovels);

      const Fnovels = await get60WebtoonRanking(TYPE.F, currFnovels);

      const Bnovels = await get60WebtoonRanking(TYPE.B, currBnovels);

      const Webtoons = await get60WebtoonRanking(TYPE.WB, currWebtoons);

      return [].concat(
        rankingRnovels,
        rankingRFnovels,
        rankingBnovels,
        rankingWebtoons,
        Rnovels,
        RFnovels,
        Fnovels,
        Bnovels,
        Webtoons,
      );
    } catch (err) {
      throw err;
    }
  }

  // 랭킹 달려있는 것들 싹 다 제거
  async rankUpdet() {
    const resetRank = await this.contentRepository
      .createQueryBuilder()
      .update(WebContents)
      .set({ rank: null })
      .execute();

    console.log('Rank 업데이트 완료');
  }

  ////////////////////////////////////////////////////////

  mrbluePuppeteer: MrbluePuppeteer = new MrbluePuppeteer(this.configService);

  async saveReviews(title: string, author: string, reviews: any[]) {
    if (reviews.length >= 1) {
      const contents = await this.contentRepository.findOneBy({
        title,
        author,
      });
      for (let j = 0; j < reviews.length; j++) {
        const { content, writerId, createDate, likeCount } = reviews[j];

        const review = await this.reviewRepository.findOneBy({
          webContentId: contents.id,
          writer: writerId,
          content,
        });

        if (review) {
          continue;
        }
        await this.reviewRepository.save({
          webContentId: +contents.id,
          content,
          likeCount,
          writer: writerId,
          createDate,
        });
      }
    }
  }

  async saveWebContentsData(contentType: ContentType, data: any[]) {
    for (let i = 0; i < data.length; i++) {
      const {
        platform,
        image,
        category,
        title,
        author,
        isAdult,
        pubDate,
        desc,
        keywordList,
        reviews,
      } = data[i];

      if (contentType === '웹툰') {
        if (category.includes('에로')) continue;
      }
      if (contentType === '웹소설') {
        if (category === '일반') continue;
      }

      const existedContents = await this.contentRepository.findOneBy({
        title,
        author,
      });

      if (existedContents) {
        const existPlatform = existedContents.platform;
        if (!existPlatform['mrblue']) {
          const newPlatform = { ...existPlatform, ...platform };
          await this.contentRepository.update(existedContents.id, {
            platform: newPlatform,
          });
        }

        if (keywordList) {
          let existKeyword = existedContents.keyword;
          if (existKeyword) {
            for (let keyword of keywordList) {
              if (!existKeyword.includes(keyword)) {
                existKeyword = existKeyword + keyword;
              }
            }
            await this.contentRepository.update(existedContents.id, {
              keyword: existKeyword,
            });
          } else if (!existKeyword) {
            await this.contentRepository.update(existedContents.id, {
              keyword: keywordList.join(', '),
            });
          }
        }
      } else {
        await this.contentRepository.save({
          contentType: ContentType.WEBNOVEL,
          title,
          desc,
          image,
          author,
          isAdult,
          keyword: keywordList.join(', '),
          category,
          platform,
          pubDate,
        });
      }

      await this.saveReviews(title, author, reviews);
    }
    console.log('저장완료');
  }

  //웹소설, 웹툰 랭킹 저장
  async saveWebContentsRank(contentType: ContentType, data: any[]) {
    for (let i = 0; i < data.length; i++) {
      const {
        rank,
        platform,
        image,
        category,
        title,
        author,
        isAdult,
        pubDate,
        desc,
        keywordList,
        reviews,
      } = data[i];

      if (contentType === '웹툰') {
        if (category.includes('에로')) continue;
      }
      if (contentType === '웹소설') {
        if (category === '일반') continue;
      }

      const existedContents = await this.contentRepository.findOneBy({
        title,
        author,
      });

      if (existedContents) {
        const existPlatform = existedContents.platform;
        if (!existPlatform['mrblue']) {
          const newPlatform = { ...existPlatform, ...platform };
          await this.contentRepository.update(existedContents.id, {
            platform: newPlatform,
          });
        }

        if (keywordList) {
          let existKeyword = existedContents.keyword;
          if (existKeyword) {
            for (let keyword of keywordList) {
              if (!existKeyword.includes(keyword)) {
                existKeyword = existKeyword + keyword;
              }
            }
            await this.contentRepository.update(existedContents.id, {
              keyword: existKeyword,
            });
          } else if (!existKeyword) {
            await this.contentRepository.update(existedContents.id, {
              keyword: keywordList.join(', '),
            });
          }
        }

        if (existedContents.rank) {
          const existRank = existedContents.rank;
          const newRank = { ...existRank, ...rank };
          await this.contentRepository.update(existedContents.id, {
            rank: newRank,
          });
        } else {
          await this.contentRepository.update(existedContents.id, {
            rank,
          });
        }
      } else {
        await this.contentRepository.save({
          rank,
          platform,
          contentType,
          title,
          desc,
          image,
          author,
          isAdult,
          keyword: keywordList.join(', '),
          category,
          pubDate,
        });
      }
      await this.saveReviews(title, author, reviews);
    }
    console.log('저장완료');
  }

  async createMrblue() {
    const crawlWebnovelAll = await this.mrbluePuppeteer.crawlWebnovels();
    await this.saveWebContentsData(ContentType.WEBNOVEL, crawlWebnovelAll);

    const crawlWebtoonAll = await this.mrbluePuppeteer.crawlWebtoons();
    await this.saveWebContentsData(ContentType.WEBTOON, crawlWebtoonAll);

    const crawlWebnovelRank = await this.mrbluePuppeteer.webnovelRank();
    await this.saveWebContentsRank(ContentType.WEBNOVEL, crawlWebnovelRank);

    const crawlWebtoonRank = await this.mrbluePuppeteer.webtoonRank();
    await this.saveWebContentsRank(ContentType.WEBTOON, crawlWebtoonRank);
  }

  ////

  async createContentDtos(data: any[]) {
    try {
      // 데이터 유효성 검사
      for (const webContent of data) {
        if (
          _.isNil(webContent.title) ||
          _.isNil(webContent.desc) ||
          _.isNil(webContent.image) ||
          _.isNil(webContent.author) ||
          _.isNil(webContent.category) ||
          _.isNil(webContent.isAdult) ||
          _.isNil(webContent.platform) ||
          _.isNil(webContent.pubDate) ||
          _.isNil(webContent.keyword) ||
          _.isNil(webContent.contentType) ||
          _.isNil(webContent.pReviews)
        ) {
          throw new Error(`필수 컬럼 누락`);
        }
      }

      return data.map((content) => {
        const webContent = new WebContents();

        webContent.title = content.title;
        webContent.desc = content.desc;
        webContent.image = content.image;
        webContent.author = content.author;
        webContent.category = content.category;
        webContent.isAdult = content.isAdult;
        webContent.platform = content.platform;
        webContent.pubDate = content.pubDate;
        webContent.keyword = content.keyword;
        webContent.rank = content.rank;
        webContent.contentType = content.contentType;

        if (content.pReviews.length !== 0) {
          webContent.pReviews = content.pReviews;
        }

        return webContent;
      });
    } catch (err) {
      throw err;
    }
  }

  // 전부 호출해서 -> 배열로 만들어서 -> 중복 데이터 처리 후 -> DB에 넣는다
  @Cron('26 11 * * *')
  async saveAllTogether() {
    const startTime = new Date().getTime();

    const naverCurrNumWebnovel =
      +(await this.redisService.getValue('naver_webnovel')) || 0;
    const naverCurrNumWebtoon =
      +(await this.redisService.getValue('naver_webtoon')) || 0;

    const kakaoCurrPageWebnovel =
      +(await this.redisService.getValue('kakao_webnovel')) || 0;
    const kakaoCurrPageWebtoon =
      +(await this.redisService.getValue('kakao_webtoon')) || 0;

    const ridiCurrRnovels =
      +(await this.redisService.getValue('ridi_curr1650')) || 1;
    const ridiCurrRFnovels =
      +(await this.redisService.getValue('ridi_curr6050')) || 1;
    const ridiCurrFnovels =
      +(await this.redisService.getValue('ridi_curr1750')) || 1;
    const ridiCurrBnovels =
      +(await this.redisService.getValue('ridi_curr4150')) || 1;
    const ridiCurrWebtoons =
      +(await this.redisService.getValue('ridi_curr1600')) || 1;

    const naverData = await this.createNaverSeries(
      naverCurrNumWebnovel,
      naverCurrNumWebtoon,
      100,
    );

    const kakaoData = await this.createKakaopages(
      kakaoCurrPageWebnovel,
      kakaoCurrPageWebtoon,
    );

    const ridiData = await this.createRidibooks(
      ridiCurrRnovels,
      ridiCurrRFnovels,
      ridiCurrFnovels,
      ridiCurrBnovels,
      ridiCurrWebtoons,
    );

    // 랭킹 제거
    // await this.rankUpdet();

    // DB에 저장
    //await this.contentRepository.save();

    // redis 업데이트
    await this.redisService.save('naver_webnovel', naverCurrNumWebnovel + 100);
    await this.redisService.save('naver_webtoon', naverCurrNumWebtoon + 100);
    await this.redisService.save('kakao_webnovel', kakaoCurrPageWebnovel + 4);
    await this.redisService.save('kakao_webtoon', kakaoCurrPageWebtoon + 4);

    await this.redisService.save(`ridi_curr${TYPE.R}`, ridiCurrRnovels + 1);
    await this.redisService.save(`ridi_curr${TYPE.RF}`, ridiCurrRFnovels + 1);
    await this.redisService.save(`ridi_curr${TYPE.F}`, ridiCurrFnovels + 1);
    await this.redisService.save(`ridi_curr${TYPE.B}`, ridiCurrBnovels + 1);
    await this.redisService.save(`ridi_curr${TYPE.WB}`, ridiCurrWebtoons + 1);

    console.log('총 걸린 시간 : ', new Date().getTime() - startTime, 'ms');
  }
}
