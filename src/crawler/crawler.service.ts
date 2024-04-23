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

  async createMrblue(
    mbWebnovelCurPage: number,
    mbWebnovelMaxPage: number,
    mbWebtoonCurPage: number,
    mbWebtoonMaxPage: number,
  ) {
    const crawlWebnovelRank = await this.mrbluePuppeteer.webnovelRank();

    const crawlWebtoonRank = await this.mrbluePuppeteer.webtoonRank();

    const crawlWebnovelAll = await this.mrbluePuppeteer.crawlWebnovels(
      mbWebnovelCurPage,
      mbWebnovelMaxPage,
    );

    const crawlWebtoonAll = await this.mrbluePuppeteer.crawlWebtoons(
      mbWebtoonCurPage,
      mbWebtoonMaxPage,
    );

    return [].concat(
      crawlWebnovelRank,
      crawlWebtoonRank,
      crawlWebnovelAll,
      crawlWebtoonAll,
    );
  }

  ////////////////////////////////////////////////////////////////////////

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
  @Cron('50 14 * * *')
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

      const mbWebnovelCurPage =
        +(await this.redisService.getValue('mrblueWebnovelCur')) || 1;
      const mbWebnovelMaxPage = +mbWebnovelCurPage + 1 || 2;
      const mbWebtoonCurPage =
        +(await this.redisService.getValue('mrblueWebtoonCur')) || 1;
      const mbWebtoonMaxPage = mbWebtoonCurPage + 1 || 2;

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

      console.log('미스터 블루 작업 시작.');
      begin_time = new Date().getTime();

      let mrblueData = await this.createMrblue(
        mbWebnovelCurPage,
        mbWebnovelMaxPage,
        mbWebtoonCurPage,
        mbWebtoonMaxPage,
      );

      console.log(
        '미스터 블루 크롤링 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );

      // title, contentType이 중복되는 요소 제거
      const data = [].concat(
        await this.removeDuplicate(ridiData),
        await this.removeDuplicate(kakaoData),
        await this.removeDuplicate(naverData),
        await this.removeDuplicate(mrblueData),
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
        for (const webContent of data) {
          const existingContent = await this.contentRepository.findOne({
            where: {
              title: webContent.title,
              contentType: webContent.contentType,
            },
          });

          let contentId: number;
          if (!_.isNil(existingContent)) {
            console.log(
              '이미 DB에 존재하는 데이터: ',
              existingContent.title,
              existingContent.rank,
              existingContent.keyword,
              existingContent.platform,
            );
            contentId = existingContent.id;

            let updateRank = {
              ...existingContent.rank,
              ...webContent.rank,
            };

            updateRank =
              Object.keys(updateRank).length === 0 ? null : updateRank;

            if (
              Object.keys(webContent.platform)[0] in existingContent.platform
            ) {
              if (webContent.rank !== null) {
                await queryRunner.manager
                  .createQueryBuilder()
                  .update(WebContents)
                  .set({
                    rank: updateRank,
                  })
                  .where('id = :id', { id: contentId })
                  .execute();

                console.log(
                  '이미 플랫폼 정보가 DB에 존재해서 랭크만 업데이트시켜주면 되는 경우',
                );
              }

              console.log(
                '이미 플랫폼 정보가 DB에 존재하고 랭크도 업데이트안해도 되는 경우',
              );
              continue;
            }

            const updateKeyword =
              webContent.keyword.length === 0
                ? existingContent.keyword
                : [
                    ...new Set([
                      ...existingContent.keyword.split(', '),
                      ...webContent.keyword,
                    ]),
                  ].join(', ');

            const updatePlatform = {
              ...existingContent.platform,
              ...webContent.platform,
            };

            await queryRunner.manager
              .createQueryBuilder()
              .update(WebContents)
              .set({
                keyword: updateKeyword,
                rank: updateRank,
                platform: updatePlatform,
              })
              .where('id = :id', { id: contentId })
              .execute();

            console.log(
              '이미 DB에 존재하는데 플랫폼이 달라서 키워드, 랭크, 플랫폼 업데이트',
              updateKeyword,
              updateRank,
              updatePlatform,
            );
          } else {
            console.log('새로 생성');
            const insertResult = await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(WebContents)
              .values({
                ...webContent,
                keyword: webContent.keyword.join(', '),
              })
              .execute();

            contentId = insertResult.identifiers[0].id;
          }

          console.log('리뷰 넣기');
          const reviews = webContent.pReviews
            .filter(
              (review) => review.content.replace(/(이모티콘)/g, '') !== '',
            )
            .map((review) => {
              const pReview = new PReviews();
              pReview.content = review.content.replace(/(이모티콘)/g, '');
              pReview.writer = review.writer;
              pReview.createDate = review.createDate;
              pReview.likeCount = review.likeCount;
              pReview.webContentId = contentId;
              return pReview;
            });

          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into(PReviews)
            .values(reviews)
            .orIgnore()
            .execute();
        }

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
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

      await this.redisService.save('mrblueWebnovelCur', mbWebnovelMaxPage);
      await this.redisService.save('mrblueWebtoonCur', mbWebtoonMaxPage);

      console.log(
        '디비 작업 끝. 총 걸린 시간은 ',
        new Date().getTime() - begin_time,
      );

      console.log('총 걸린 시간 : ', new Date().getTime() - startTime, 'ms');
    } catch (err) {
      //throw err;
      throw new InternalServerErrorException(err.message);
    }
  }
}
