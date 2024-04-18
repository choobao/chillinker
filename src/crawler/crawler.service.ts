import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { DataSource, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
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

  ////////////////////////////////////////////////////////

  mrbluePuppeteer: MrbluePuppeteer = new MrbluePuppeteer(this.configService);

  async saveReviews(title: string, contentType: ContentType, reviews: any[]) {
    if (reviews.length >= 1) {
      const contents = await this.contentRepository.findOneBy({
        title,
        contentType,
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

      const existedContents = await this.contentRepository.findOneBy({
        title,
        contentType,
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
          contentType,
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

      await this.saveReviews(title, contentType, reviews);
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

      const existedContents = await this.contentRepository.findOneBy({
        title,
        contentType,
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
      await this.saveReviews(title, contentType, reviews);
    }
    console.log('저장완료');
  }

  async createMrblue() {
    const crawlWebnovelRank = await this.mrbluePuppeteer.webnovelRank();
    await this.saveWebContentsRank(ContentType.WEBNOVEL, crawlWebnovelRank);

    const crawlWebtoonRank = await this.mrbluePuppeteer.webtoonRank();
    await this.saveWebContentsRank(ContentType.WEBTOON, crawlWebtoonRank);

    const mbWebnovelCurPage =
      +(await this.redisService.getValue('mrblueWebnovelCur')) || 1;
    const mbWebnovelMaxPage = +mbWebnovelCurPage + 1 || 2;

    const crawlWebnovelAll = await this.mrbluePuppeteer.crawlWebnovels(
      mbWebnovelCurPage,
      mbWebnovelMaxPage,
    );
    await this.saveWebContentsData(ContentType.WEBNOVEL, crawlWebnovelAll);
    await this.redisService.save('mrblueWebnovelCur', mbWebnovelMaxPage);

    const mbWebtoonCurPage =
      +(await this.redisService.getValue('mrblueWebtoonCur')) || 1;
    const mbWebtoonMaxPage = mbWebtoonCurPage + 1 || 2;
    const crawlWebtoonAll = await this.mrbluePuppeteer.crawlWebtoons(
      mbWebtoonCurPage,
      mbWebtoonMaxPage,
    );
    await this.saveWebContentsData(ContentType.WEBTOON, crawlWebtoonAll);
    await this.redisService.save('mrblueWebtoonCur', mbWebtoonMaxPage);
  }

  ////////////////////////////////////////////////////////////////////////

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
          const pReviews = content.pReviews.map((review) => {
            const pReview = new PReviews();
            pReview.content = review.content;
            pReview.createDate = new Date(review.createDate);
            pReview.likeCount = review.likeCount;
            pReview.writer = review.writer;
            return pReview;
          });
          webContent.pReviews = pReviews;
        }

        return webContent;
      });
    } catch (err) {
      throw err;
    }
  }

  async removeDuplicate(data: WebContents[]) {
    const uniqueMap = new Map();

    data.forEach((item) => {
      const key = `${item.title.replace(/\s/g, '')}_${item.contentType}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    return Array.from(uniqueMap.values());
  }

  // 전부 호출해서 -> 배열로 만들어서 -> 중복 데이터 처리 후 -> DB에 넣는다
  @Cron('46 16 * * *')
  async saveAllTogether() {
    try {
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

      let begin_time = new Date().getTime();
      console.log('네이버 크롤링 시작');
      let naverData = await this.createNaverSeries(
        naverCurrNumWebnovel,
        naverCurrNumWebtoon,
        50,
      );

      console.log(
        '네이버 크롤링 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );

      begin_time = new Date().getTime();
      console.log('카카오 크롤링 시작');

      let kakaoData = await this.createKakaopages(
        kakaoCurrPageWebnovel,
        kakaoCurrPageWebtoon,
      );

      console.log(
        '카카오 크롤링 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );

      begin_time = new Date().getTime();
      console.log('리디북스 크롤링 시작');

      let ridiData = await this.createRidibooks(
        ridiCurrRnovels,
        ridiCurrRFnovels,
        ridiCurrFnovels,
        ridiCurrBnovels,
        ridiCurrWebtoons,
      );

      console.log(
        '리디 크롤링 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );

      console.log('데이터 합치기 & 가공 시작~~~');
      begin_time = new Date().getTime();

      // title, contentType이 중복되는 요소 제거

      const data = [].concat(
        await this.removeDuplicate(ridiData),
        await this.removeDuplicate(kakaoData),
        await this.removeDuplicate(naverData),
      );

      let grouped = new Map();
      let result = [];

      data.forEach((webContent) => {
        const key = `${webContent.title.replace(/\s/g, '')}_${webContent.contentType}`;

        if (!grouped.has(key)) {
          console.log('존재하지 않아 키 생성: ', key);
          grouped.set(key, {
            ...webContent,
            keyword: webContent.keyword ? [...new Set(webContent.keyword)] : [],
            platform: webContent.platform ? { ...webContent.platform } : {},
            pReviews: webContent.pReviews ? [...webContent.pReviews] : [],
            rank: webContent.rank ? { ...webContent.rank } : null,
          });

          // Map에 추가된 새 요소를 result에 추가
          result.push(grouped.get(key));
        } else {
          // 기존 키에 대한 값 업데이트
          let existingContent = grouped.get(key);
          console.log('기존 키는 ', key, existingContent);

          if (webContent.keyword) {
            existingContent.keyword = [
              ...new Set([...existingContent.keyword, ...webContent.keyword]),
            ];
          }

          existingContent.platform = {
            ...existingContent.platform,
            ...webContent.platform,
          };

          if (webContent.rank) {
            existingContent.rank = {
              ...existingContent.rank,
              ...webContent.rank,
            };
          }

          if (webContent.pReviews) {
            existingContent.pReviews = [
              ...existingContent.pReviews,
              ...webContent.pReviews,
            ];
          }

          console.log(
            '존재해서 업데이트~~~~~~: ',
            existingContent.platform,
            existingContent.rank,
          );

          // 업데이트된 값을 다시 Map에 저장
          grouped.set(key, existingContent);
        }
      });

      // keyword 배열을 문자열로 변환하고 포맷팅
      result.forEach((webContent) => {
        if (webContent.keyword.length > 0) {
          webContent.keyword = JSON.stringify(webContent.keyword)
            .replace(/\[|\]|\"|\"/g, '')
            .replace(/\,/g, ', ');
        } else {
          webContent.keyword = null;
        }
      });

      console.log(
        result.length,
        '개 데이터 합치기 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );
      console.log('디비 작업 시작.');
      begin_time = new Date().getTime();

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 랭킹 제거
        await queryRunner.manager
          .createQueryBuilder()
          .update(WebContents)
          .set({ rank: null })
          .execute();

        console.log('Rank 업데이트 완료');

        // DB에 저장
        for (const webContent of result) {
          const insertResult = await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(WebContents)
            .values(webContent)
            .orUpdate(['title', 'content_type'], ['rank', 'image'])
            .execute();

          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(PReviews)
            .values(
              webContent.pReviews.map((review) => {
                const pReview = new PReviews();
                pReview.writer = review.writer;
                pReview.content = review.content;
                pReview.createDate = review.createDate;
                pReview.likeCount = review.likeCount;
                pReview.webContentId = insertResult.identifiers[0].id;
                return pReview;
              }),
            )
            .orIgnore()
            .execute();
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }

      // redis 업데이트
      await this.redisService.save('naver_webnovel', naverCurrNumWebnovel + 50);
      await this.redisService.save('naver_webtoon', naverCurrNumWebtoon + 50);
      await this.redisService.save('kakao_webnovel', kakaoCurrPageWebnovel + 4);
      await this.redisService.save('kakao_webtoon', kakaoCurrPageWebtoon + 4);

      await this.redisService.save(`ridi_curr${TYPE.R}`, ridiCurrRnovels + 1);
      await this.redisService.save(`ridi_curr${TYPE.RF}`, ridiCurrRFnovels + 1);
      await this.redisService.save(`ridi_curr${TYPE.F}`, ridiCurrFnovels + 1);
      await this.redisService.save(`ridi_curr${TYPE.B}`, ridiCurrBnovels + 1);
      await this.redisService.save(`ridi_curr${TYPE.WB}`, ridiCurrWebtoons + 1);

      console.log(
        '디비 작업 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );
      // console.log('미스터 블루 작업 시작.');
      // begin_time = new Date().getTime();

      // await this.createMrblue();

      // console.log(
      //   '미스터 블루 크롤링+디비 작업 끝. 총 걸린 시간은 ',
      //   new Date().getTime() - begin_time,
      // );

      console.log('총 걸린 시간 : ', new Date().getTime() - startTime, 'ms');
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
