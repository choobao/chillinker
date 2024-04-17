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
import { ContentType } from 'src/web-content/webContent.type';

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

  @Cron('14 13 * * *')
  async createNaverSeries() {
    const currNumWebnovel =
      +(await this.redisService.getValue('naver_webnovel')) || 0;
    const currNumWebtoon =
      +(await this.redisService.getValue('naver_webtoon')) || 0;

    const params: object[] = [
      { link: series_webtoon_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webnovel_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webtoon_url, currNum: currNumWebtoon, n: 50 },
      { link: series_webnovel_url, currNum: currNumWebnovel, n: 50 },
    ];

    const startTime = new Date().getTime();

    let webContentList;
    try {
      webContentList =
        await this.naverSeriesPuppeteer.crawlNaverSeriesParallel(params);

      // 데이터 유효성 검사
      for (const webContent of webContentList) {
        if (
          _.isNil(webContent.title) ||
          _.isNil(webContent.url) ||
          _.isNil(webContent.author) ||
          _.isNil(webContent.image) ||
          _.isNil(webContent.category) ||
          _.isNil(webContent.desc) ||
          _.isNil(webContent.reviewList) ||
          _.isNil(webContent.pubDate) ||
          _.isNil(webContent.isAdult) ||
          _.isNil(webContent.contentType)
        ) {
          throw new Error(`필수 컬럼 누락`);
        }
      }

      // DTOs 생성
      const createContentDtos = webContentList.map((content) => {
        return {
          title: content.title,
          desc: content.desc,
          image: content.image,
          author: content.author,
          category: content.category,
          isAdult: content.isAdult,
          platform: { naver: content.url },
          pubDate: content.pubDate,
          rank: content.rank,
          contentType: content.contentType,
          pReviews: content.reviewList,
        };
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);

      // redis 업데이트
      await this.redisService.save('naver_webnovel', currNumWebnovel + 30);
      await this.redisService.save('naver_webtoon', currNumWebtoon + 30);

      console.log('시간 : ', new Date().getTime() - startTime, 'ms');
    } catch (err) {
      throw new Error(`크롤링 실패: ${err.message}`);
    }
  }

  ////////////////////////////////////////////////////////////////////////////

  kakaopageAxios: KakaopageAxios = new KakaopageAxios();

  async createDtosAndSave(data: WebContents[]) {
    try {
      const createContentDtos = data.map((content) => {
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
        webContent.pReviews = content.pReviews;
        return webContent;
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);
    } catch (err) {
      throw err;
    }
  }

  @Cron('8 0 * * *')
  async createKakaopages() {
    const startTime = new Date().getTime();

    const currPageWebnovel =
      +(await this.redisService.getValue('kakao_webnovel')) || 0;
    const currPageWebtoon =
      +(await this.redisService.getValue('kakao_webtoon')) || 0;

    try {
      console.log('start!');
      const rankingWebnovels =
        await this.kakaopageAxios.getDailyRank_20_WebContents(Type.WEBNOVEL);
      await this.createDtosAndSave(rankingWebnovels);
      console.log('done!');

      console.log('start!');
      const rankingWebtoons =
        await this.kakaopageAxios.getDailyRank_20_WebContents(Type.WEBTOON);
      await this.createDtosAndSave(rankingWebtoons);
      console.log('done!');

      console.log('start!');
      const allWebnovels = await this.kakaopageAxios.getAll_96_WebContents(
        Type.WEBNOVEL,
        currPageWebnovel,
      );
      await this.createDtosAndSave(allWebnovels);
      console.log('done!');

      await this.redisService.save('kakao_webnovel', currPageWebnovel + 4);

      console.log('start!');
      const allWebtoons = await this.kakaopageAxios.getAll_96_WebContents(
        Type.WEBTOON,
        currPageWebtoon,
      );
      await this.createDtosAndSave(allWebtoons);
      console.log('done!');

      await this.redisService.save('kakao_webtoon', currPageWebtoon + 4);

      const endTime = new Date().getTime();
      console.log(`총 시간 : ${endTime - startTime}ms`);
    } catch (err) {
      throw err;
    }
  }

  /////////////////////////////////////////////////////////////////////////////

  @Cron('26 11 * * *') //오후 다섯시 예약
  async createRidibooks() {
    const startTime = new Date().getTime();

    try {
      // 일간랭킹;
      // await this.rankUpdet();

      console.log('start!');
      const rankingRnovels = await get20BestRanking(GENRE.R);
      await this.save20Db(rankingRnovels);
      console.log('done!');

      console.log('start!');
      const rankingRFnovels = await get20BestRanking(GENRE.RF);
      await this.save20Db(rankingRFnovels);
      console.log('done!');

      // console.log('start!');
      // const rankingFnovels = await get20BestRanking(GENRE.F);
      // await this.save20Db(rankingFnovels);
      // console.log('done!');

      console.log('start!');
      const rankingBnovels = await get20BestRanking(GENRE.B);
      await this.save20Db(rankingBnovels);
      console.log('done!');

      console.log('start!');
      const rankingWebtoons = await get20BestRanking(GENRE.WB);
      await this.save20Db(rankingWebtoons);
      console.log('done!');

      //전체랭킹
      const change = await this.redisService.save(`ridi_curr1650`, 2);

      const currRnovels =
        +(await this.redisService.getValue('ridi_curr1650')) || 1;
      const currRFnovels =
        +(await this.redisService.getValue('ridi_curr6050')) || 1;
      const currFnovels =
        +(await this.redisService.getValue('ridi_curr1750')) || 1;
      const currBnovels =
        +(await this.redisService.getValue('ridi_curr4150')) || 1;
      const currWebtoons =
        +(await this.redisService.getValue('ridi_curr1600')) || 1;

      const test = await this.redisService.getValue('ridi_curr1650');

      console.log(test);
      console.log(
        '가져온정보',
        currRnovels,
        currRFnovels,
        currFnovels,
        currBnovels,
        currWebtoons,
      );

      console.log('start!');
      const Rnovels = await get60WebtoonRanking(TYPE.R, currRnovels);
      await this.save60Db(Rnovels, TYPE.R, currRnovels);
      console.log('done!');

      console.log('start!');
      const RFnovels = await get60WebtoonRanking(TYPE.RF, currRFnovels);
      await this.save60Db(RFnovels, TYPE.RF, currRFnovels);
      console.log('done!');

      console.log('start!');
      const Fnovels = await get60WebtoonRanking(TYPE.F, currFnovels);
      await this.save60Db(Fnovels, TYPE.F, currFnovels);
      console.log('done!');

      console.log('start!');
      const Bnovels = await get60WebtoonRanking(TYPE.B, currBnovels);
      await this.save60Db(Bnovels, TYPE.B, currBnovels);
      console.log('done!');

      console.log('start!');
      const Webtoons = await get60WebtoonRanking(TYPE.WB, currWebtoons);
      await this.save60Db(Webtoons, TYPE.WB, currWebtoons);
      console.log('done!');

      const endTime = new Date().getTime();
      console.log(`총 시간 : ${endTime - startTime}ms`);
    } catch (err) {
      throw err;
    }
  }

  async save60Db(data: WebContents[], type: TYPE, page: any) {
    try {
      console.log(page);
      const createContentDtos = data.map((content) => {
        const webContent = new WebContents();

        console.log(content);

        webContent.title = content.title;
        webContent.desc = content.desc;
        webContent.image = content.image;
        webContent.author = content.author;
        webContent.category = content.category;
        webContent.isAdult = content.isAdult;
        webContent.platform = content.platform;
        webContent.pubDate = content.pubDate;
        webContent.keyword = content.keyword;
        webContent.contentType = content.contentType;

        if (content.pReviews.length !== 0) {
          webContent.pReviews = content.pReviews;
        }

        return webContent;
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);

      const change = await this.redisService.save(`ridi_curr${type}`, page + 1);
      const currRnovels = await this.redisService.getValue('ridi_curr1650');
      console.log('들어온정보', type, page, currRnovels);
      console.log('저장할거', change);
    } catch (err) {
      throw err;
    }
  }

  async rankUpdet() {
    const resetRank = await this.contentRepository
      .createQueryBuilder()
      .update(WebContents)
      .set({ rank: null })
      .execute();

    console.log('Rank 업데이트 완료');
  }

  async save20Db(data) {
    try {
      const createContentDtos = data.map((content) => {
        const webContent = new WebContents();

        console.log(content);
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

      // DB에 저장
      await this.contentRepository.save(createContentDtos);
    } catch (err) {
      throw err;
    }
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
}
