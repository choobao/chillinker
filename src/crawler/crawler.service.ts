import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import puppeteer, { Page } from 'puppeteer';
import { setTimeout } from 'timers/promises';
import {
  series_item,
  naver_series_url,
  series_next_btn,
  series_category,
  series_image,
  series_title,
  series_adult_icon,
  series_hd_icon,
  series_epi_asc_btn,
  series_pubDate,
  series_review_count,
  series_detail,
  series_not_detail_author,
  series_desc,
  series_author,
  series_review_btn,
  series_best_review_btn,
  series_all_review_btn,
  series_review_all_more_btn,
  review_content,
  review_createdAt,
  review_likeCount,
  review_writer_id,
  review_writer_nickname,
  series_review_item,
  series_webnovel_top100_daily_url,
  series_webtoon_top100_daily_url,
  series_webtoon_url,
  series_webnovel_url,
  series_first_page_next_btn,
} from './utils/constants';
import { login } from './utils/login';
// import { RedisService } from '../redis/redis.service';
import _ from 'lodash';
import { ContentType } from '../web-content/webContent.type';
import { PReviews } from '../review/entities/platform.reviews.entity';
import { Cluster } from 'puppeteer-cluster';
import {
  ReviewSortType,
  Type,
  kakao_api_url,
  webContent_all_query,
  webcontent_keyword_query,
  webcontent_query,
  webcontent_ranking_daily_query,
  webcontent_review_query,
} from './utils/kakaopage';
import axios from 'axios';
import {
  get20BestRanking,
  get60WebtoonRanking,
  getContentsData,
} from './platform/ridibooks';
import { GENRE, TYPE } from './utils/ridi.constants';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(WebContents)
    private readonly contentRepository: Repository<WebContents>,
    //private readonly redisService: RedisService,
  ) {}

  // 50위까지의 랭킹 정보 요청
  async requestDailyRanking(contentType: Type) {
    try {
      const { data } = await axios({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://page.kakao.com',
        },
        url: kakao_api_url,
        data: {
          query: webcontent_ranking_daily_query,
          variables: {
            sectionId: `static-landing-Ranking-section-Landing-${contentType}-0-daily`,
            param: {
              categoryUid: contentType,
              rankingType: 'daily',
              subcategoryUid: '0',
              screenUid: null,
              page: 0,
            },
          },
        },
      });
      return data.data.staticLandingRankingSection.groups[0].items;
    } catch (err) {
      throw err;
    }
  }

  async requestWebContent(id: number) {
    try {
      const { data } = await axios({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://page.kakao.com',
        },
        url: kakao_api_url,
        data: {
          query: webcontent_query,
          operationName: 'contentHomeOverview',
          variables: { seriesId: id },
        },
      });
      const webContent = data.data.contentHomeOverview.content;
      const url = `https://page.kakao.com/content/${id}`;
      const title = webContent.title;
      const desc = webContent.descriptionription;
      const image = `https:${webContent.thumbnail}`;
      const contentType =
        webContent.category === '웹툰'
          ? ContentType.WEBTOON
          : ContentType.WEBNOVEL;
      const category = webContent.subcategory;
      const author = webContent.authors;
      const isAdult = webContent.ageGrade === 'Nineteen' ? 1 : 0;
      const pubDate = new Date(webContent.startSaleDt);

      const keyword = await this.requestWebContentKeywordsAndRecommends(id);

      let reviewCount = webContent.serviceProperty.commentCount;
      reviewCount = reviewCount > 100 ? 100 : reviewCount;
      console.log('리뷰개수:', reviewCount);
      let reviewList = [];
      const pageCount = Math.ceil(reviewCount / 25); // 한 페이지당 25개 리뷰 존재할때 필요한 페이지 수
      for (let i = 1; i <= pageCount; i++) {
        const reviews = await this.requestWebContentReviews(id, i);
        reviewList = reviewList.concat(reviews);
      }

      console.log(title, author, contentType, reviewList.length);
      return {
        platform: { kakao: url },
        title,
        desc,
        image,
        contentType,
        category,
        author,
        isAdult,
        pubDate,
        keyword,
        pReviews: reviewList,
      };
    } catch (err) {
      throw err;
    }
  }

  // 작품의 키워드와 추천작 정보 요청
  async requestWebContentKeywordsAndRecommends(id: number) {
    try {
      const { data } = await axios({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://page.kakao.com',
        },
        url: kakao_api_url,
        data: {
          query: webcontent_keyword_query,
          variables: { seriesId: id },
        },
      });
      const keywords = data.data.contentHomeInfo.about.themeKeywordList.map(
        (keyword) => keyword.title,
      );
      const recommends = data.data.contentHomeInfo.recommend.list.items; // 나중에 쓰일지도
      return keywords;
    } catch (err) {
      throw err;
    }
  }

  // 작품의 댓글 정보 요청(한 페이지당 25개씩)
  async requestWebContentReviews(
    id: number,
    page: number = 1,
    sortType: ReviewSortType = ReviewSortType.LIKE,
  ) {
    try {
      const { data } = await axios({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://page.kakao.com',
        },
        url: kakao_api_url,
        data: {
          query: webcontent_review_query,
          variables: {
            commentListInput: { seriesId: id, page, sortType },
          },
        },
      });
      const reviews = data.data.commentList.commentList.map((comment) => ({
        writer: comment.userName,
        content: comment.comment,
        likeCount: comment.likeCount,
        createdAt: new Date(comment.createDt),
      }));
      return reviews;
    } catch (err) {
      throw err;
    }
  }

  async getDailyRank_20_WebContents(contentType: Type) {
    let items = await this.requestDailyRanking(contentType);
    const ids = items.slice(0, 20).map((item) => ({
      id: +item.eventLog.eventMeta.series_id,
      rank: +item.rank,
    })); // 20위까지

    const webContentList = [];
    for (const { id, rank } of ids) {
      const webContent = await this.requestWebContent(id);
      webContentList.push({ ...webContent, rank: { kakao: rank } });
      console.log('랭킹', rank);
    }

    return webContentList;
  }

  async requestAllLatestWebContents(contentType: Type, page: number = 1) {
    try {
      const { data } = await axios({
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'https://page.kakao.com',
        },
        url: kakao_api_url,
        data: {
          query: webContent_all_query,
          variables: {
            sectionId: `static-landing-Genre-section-Layout-${contentType}-0-latest-false-82`,
            param: {
              categoryUid: contentType,
              sortType: 'latest',
              isComplete: false,
              subcategoryUid: '0',
              screenUid: 82,
              page,
            },
          },
        },
      });
      return data.data.staticLandingGenreSection.groups[0].items;
    } catch (err) {
      throw err;
    }
  }

  async getAll_96_WebContents(contentType: Type, currPage: number = 0) {
    const webContentList = [];
    for (let i = 1; i <= 4; i++) {
      // 한 page당 24개 작품 존재
      const items = await this.requestAllLatestWebContents(
        contentType,
        currPage + i,
      );
      const ids = items.map((item) => item.seriesId);
      for (const id of ids) {
        const webContent = await this.requestWebContent(id);
        webContentList.push(webContent);
      }
    }

    return webContentList;
  }

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
        webContent.keyword = JSON.stringify(content.keyword);
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

  //@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @Cron('38 15 * * *')
  async createKakaopages() {
    const startTime = new Date().getTime();

    const currPageWebnovel = 0;
    //+(await this.redisService.getValue('kakao_webnovel')) || 0;
    const currPageWebtoon = 0;
    // +(await this.redisService.getValue('kakao_webtoon')) || 0;

    console.log(currPageWebnovel, currPageWebtoon);

    try {
      console.log('start!');
      const rankingWebnovels = await this.getDailyRank_20_WebContents(
        Type.WEBNOVEL,
      );
      await this.createDtosAndSave(rankingWebnovels);
      console.log('done!');

      console.log('start!');
      const rankingWebtoons = await this.getDailyRank_20_WebContents(
        Type.WEBTOON,
      );
      await this.createDtosAndSave(rankingWebtoons);
      console.log('done!');

      console.log('start!');
      const allWebnovels = await this.getAll_96_WebContents(
        Type.WEBNOVEL,
        currPageWebnovel,
      );
      await this.createDtosAndSave(allWebnovels);
      console.log('done!');

      // await this.redisService.save('kakao_webnovel', currPageWebnovel + 4);

      console.log('start!');
      const allWebtoons = await this.getAll_96_WebContents(
        Type.WEBTOON,
        currPageWebtoon,
      );
      await this.createDtosAndSave(allWebtoons);
      console.log('done!');

      //await this.redisService.save('kakao_webtoon', currPageWebtoon + 4);

      const endTime = new Date().getTime();
      console.log(`총 시간 : ${endTime - startTime}ms`);
    } catch (err) {
      throw err;
    }
  }

  // @Cron('59 9 * * *')
  // async createNaverSeries() {
  //   const currNumWebnovel =
  //     +(await this.redisService.getValue('naver_webnovel')) || 0;
  //   const currNumWebtoon =
  //     +(await this.redisService.getValue('naver_webtoon')) || 0;

  //   const params = [
  //     { link: series_webtoon_top100_daily_url, currNum: 1, n: 20 },
  //     { link: series_webnovel_top100_daily_url, currNum: 1, n: 20 },
  //     { link: series_webtoon_url, currNum: currNumWebtoon, n: 100 },
  //     { link: series_webnovel_url, currNum: currNumWebnovel, n: 100 },
  //   ];

  //   const startTime = new Date().getTime();

  //   let webContentList;
  //   try {
  //     webContentList = await this.crawlNaverSeriesParallel(params);
  //     console.log(
  //       '결과확인: ',
  //       webContentList[0],
  //       '길이는 ',
  //       webContentList.length,
  //     );
  //     // 데이터 유효성 검사
  //     for (const webContent of webContentList) {
  //       if (
  //         _.isNil(webContent.title) ||
  //         _.isNil(webContent.url) ||
  //         _.isNil(webContent.author) ||
  //         _.isNil(webContent.image) ||
  //         _.isNil(webContent.category) ||
  //         _.isNil(webContent.description) ||
  //         _.isNil(webContent.reviewList) ||
  //         _.isNil(webContent.pubDate) ||
  //         _.isNil(webContent.isAdult) ||
  //         _.isNil(webContent.contentType)
  //       ) {
  //         throw new Error(`필수 컬럼 누락`);
  //       }
  //     }

  //     // DTOs 생성
  //     const createContentDtos = webContentList.map((content) => {
  //       const pReviewDtos = JSON.parse(content.reviewList).map((review) => {
  //         const reviewEntity = new PReviews();
  //         reviewEntity.content = review.content;
  //         reviewEntity.likeCount = review.likeCount;
  //         reviewEntity.writer = review.writer;
  //         reviewEntity.createdAt = new Date(review.createdAt);
  //         return reviewEntity;
  //       });

  //       return {
  //         title: content.title,
  //         description: content.description,
  //         image: content.image,
  //         author: content.author,
  //         category: content.category,
  //         isAdult: content.isAdult,
  //         platform: { naver: content.url },
  //         pubDate: new Date(content.pubDate),
  //         rank: content.rank,
  //         contentType: content.contentType,
  //         pReviews: pReviewDtos,
  //       };
  //     });

  //     // DB에 저장
  //     await this.contentRepository.save(createContentDtos);

  //     // redis 업데이트
  //     await this.redisService.save('naver_webnovel', currNumWebnovel + 100);
  //     await this.redisService.save('naver_webtoon', currNumWebtoon + 100);

  //     console.log('시간 : ', new Date().getTime() - startTime, 'ms');
  //   } catch (err) {
  //     throw new Error(`크롤링 실패: ${err.message}`);
  //   }
  // }

  // async crawlNaverSeriesParallel(params: object[]) {
  //   const cluster = await Cluster.launch({
  //     concurrency: Cluster.CONCURRENCY_CONTEXT,
  //     maxConcurrency: 4,
  //     timeout: 40000000,
  //     monitor: true,
  //     retryLimit: 5,
  //     puppeteerOptions: {
  //       headless: true,
  //       userDataDir: './tmp',
  //     },
  //   });

  //   cluster.on('taskerror', (err, data) => {
  //     console.log(`Error crawling ${data.link}: ${err.message}`);
  //   });

  //   let result = [];

  //   await cluster.task(async ({ page, data: { link, currNum, n } }) => {
  //     await page.setRequestInterception(true);
  //     page.on('request', (request) => {
  //       if (['font'].includes(request.resourceType())) {
  //         request.abort();
  //       } else {
  //         request.continue();
  //       }
  //     });

  //     const webContentList: any[] = [];
  //     let crawledNum = 0; // 현재까지 크롤링한 웹툰의 개수를 추적

  //     while (crawledNum < n) {
  //       await page.goto(link + `&start=${currNum + crawledNum}`, {
  //         waitUntil: 'networkidle0',
  //         timeout: 120000,
  //       });

  //       const webContents = await page.$$(series_item);
  //       for (const webContent of webContents) {
  //         if (crawledNum >= n) break; // n개를 초과하여 크롤링하지 않도록 확인
  //         const url =
  //           naver_series_url +
  //           (await webContent.$eval('a', (el) => el.getAttribute('href')));
  //         webContentList.push({ url });
  //         crawledNum += 1; // 크롤링한 웹툰 개수 증가
  //       }

  //       // 첫 페이지가 아닌데도 '다음' 버튼 없으면 while문 탈출
  //       if (crawledNum > 25 && (await page.$(series_next_btn)) === null) {
  //         break;
  //       }
  //     }
  //     console.log('개수는? ', webContentList.length);

  //     // 로그인
  //     await login(page);

  //     let i = 1; // index for rank
  //     let contentType = link.includes('novel')
  //       ? ContentType.WEBNOVEL
  //       : ContentType.WEBTOON;
  //     for (const webContent of webContentList) {
  //       if (webContent.url) {
  //         await page.goto(webContent.url, { waitUntil: 'networkidle0' });

  //         // const rate = await page.$eval(
  //         //   series_rate,
  //         //   (el) => el.textContent
  //         // );

  //         const category = await page.$eval(
  //           series_category,
  //           (el) => el.textContent,
  //         );

  //         const image = await page.$eval(series_image, (el) =>
  //           el.getAttribute('src'),
  //         );

  //         let title = await page.$eval(
  //           series_title,
  //           (el) => el.textContent || 'NULL',
  //         );

  //         let isAdult = 0;
  //         const is_adult_icon_exist = await page.$(series_adult_icon);
  //         const is_hd_icon_exist = await page.$(series_hd_icon);

  //         if (is_adult_icon_exist !== null) {
  //           const adultIconText =
  //             (await page.$eval(series_adult_icon, (el) => el.textContent)) ||
  //             'NULL';
  //           if (adultIconText !== 'NULL') {
  //             title = title.replace(adultIconText, '');
  //             isAdult = 1;
  //           }
  //         }

  //         if (is_hd_icon_exist !== null) {
  //           const hdIconText =
  //             (await page.$eval(series_hd_icon, (el) => el.textContent)) ||
  //             'NULL';
  //           if (hdIconText !== 'NULL') {
  //             title = title.replace(hdIconText, '');
  //           }
  //         }

  //         await setTimeout(1000);
  //         await page.click(series_epi_asc_btn);
  //         await setTimeout(1000);

  //         const pubDate = await page.$eval(
  //           series_pubDate,
  //           (el) => el.textContent,
  //         );

  //         const reviewCount = await page.$eval(
  //           series_review_count,
  //           (el) => el.textContent,
  //         );

  //         // 디테일 페이지로 이동
  //         // 그 전에 디테일 페이지가 존재하는지 체크
  //         const detail_page = await page.$(series_detail);

  //         let description = title;
  //         let author =
  //           detail_page === null
  //             ? await page.$eval(series_not_detail_author, (el) =>
  //                 el.textContent?.replace(/작가|\||\s/g, ''),
  //               )
  //             : 'NULL';

  //         if (detail_page !== null) {
  //           const detail_page_url =
  //             naver_series_url +
  //             (await detail_page.$eval('dd > a', (el) =>
  //               el.getAttribute('href'),
  //             ));

  //           await setTimeout(1000);
  //           await page.goto(detail_page_url, { waitUntil: 'networkidle0' });

  //           await page.waitForSelector(series_description, { timeout: 1000 });
  //           description = await page.$eval(
  //             series_description,
  //             (el) => el.textContent || title,
  //           );

  //           author = await page.$eval(
  //             series_author,
  //             (el) => el.textContent || 'NULL',
  //           );

  //           await page.goBack();
  //         }

  //         let reviewList: any[] = [];
  //         // 리뷰가 존재하면,
  //         if (reviewCount !== '0') {
  //           await setTimeout(1000);
  //           await page.click(series_review_btn); // 리뷰 버튼 클릭

  //           // 무엇이 selected 된지 확인
  //           await page.waitForSelector(series_best_review_btn);
  //           const is_best_selected = await page.$eval(
  //             series_best_review_btn,
  //             (el) => el.getAttribute('aria-selected'),
  //           );

  //           if (is_best_selected === 'true') {
  //             reviewList = await this.crawlReviews(page, 100);

  //             if ((await page.$(series_all_review_btn)) !== null) {
  //               await page.click(series_all_review_btn);

  //               await setTimeout(1000);
  //             }
  //           }

  //           const allReviewList = await this.crawlReviews(
  //             page,
  //             100 - reviewList.length,
  //           );

  //           reviewList = reviewList.concat(allReviewList);
  //         }

  //         let rank = link.includes('top100') ? { naver: i++ } : null;
  //         console.log(title, reviewList.length, rank, contentType);

  //         // csv string에 추가할 데이터
  //         const data = {
  //           title,
  //           author,
  //           image,
  //           category,
  //           description,
  //           reviewList: JSON.stringify(reviewList),
  //           pubDate,
  //           isAdult,
  //           rank,
  //           contentType,
  //         };
  //         Object.assign(webContent, data);
  //       }
  //     }

  //     result = result.concat(webContentList);
  //   });

  //   for (const param of params) {
  //     await cluster.queue(param);
  //   }

  //   await cluster.idle();
  //   await cluster.close();

  //   return result;
  // }

  // async crawlReviews(page: Page, n: number) {
  //   await page.waitForSelector(series_review_item);

  //   const reviewList: any[] = [];

  //   let reviewCount = 0;

  //   while (reviewCount < n) {
  //     const reviews = await page.$$(series_review_item);
  //     for (const review of reviews.slice(reviewCount)) {
  //       // 이미 확인한 리뷰는 스킵
  //       if ((await review.$(review_content)) === null) {
  //         // 차단된 댓글 스킵
  //         continue;
  //       }
  //       const content = await review.$eval(
  //         review_content,
  //         (el) => el.textContent,
  //       );

  //       const writer_nickname = await review.$eval(
  //         review_writer_nickname,
  //         (el) => el.textContent,
  //       );

  //       const writer_id = await review.$eval(
  //         review_writer_id,
  //         (el) => el.textContent,
  //       );

  //       const createdAt = await review.$eval(review_createdAt, (el) =>
  //         el.getAttribute('data-value'),
  //       );
  //       const likeCount = await review.$eval(
  //         review_likeCount,
  //         (el) => el.textContent,
  //       );

  //       reviewList.push({
  //         writer: writer_nickname + writer_id,
  //         content,
  //         createdAt: new Date(createdAt),
  //         likeCount,
  //       });

  //       reviewCount += 1;
  //       if (reviewCount === n) {
  //         // 목표한 리뷰 개수에 도달하면 반복 중단
  //         return reviewList;
  //       }
  //     }

  //     // 더보기 버튼 클릭
  //     // 페이지 끝에 도달했는지 체크하고, 끝에 도달했다면 반복 중단
  //     const is_more_btn_exist =
  //       (await page.$eval('div.u_cbox_paginate', (el) =>
  //         el.getAttribute('style'),
  //       )) || 'NULL';

  //     if (is_more_btn_exist !== 'display: none;') {
  //       await page.click(series_review_all_more_btn);
  //       // 더보기 이후에 새로운 리뷰들이 로드될 때까지 대기
  //       await setTimeout(1000);
  //     } else {
  //       // 더 이상 로드할 리뷰가 없을 경우
  //       break;
  //     }
  //   }
  //   return reviewList;
  // }

  async createRidibooks() {
    const startTime = new Date().getTime();

    const currPage = 0;

    try {
      // 일간랭킹;
      await this.rankUpdet();

      console.log('start!');
      const rankingRnovels = await get20BestRanking(GENRE.R);
      await this.save20Db(rankingRnovels);
      console.log('done!');

      console.log('start!');
      const rankingRFnovels = await get20BestRanking(GENRE.RF);
      await this.save20Db(rankingRFnovels);
      console.log('done!');

      console.log('start!');
      const rankingFnovels = await get20BestRanking(GENRE.F);
      await this.save20Db(rankingFnovels);
      console.log('done!');

      console.log('start!');
      const rankingBnovels = await get20BestRanking(GENRE.B);
      await this.save20Db(rankingBnovels);
      console.log('done!');

      console.log('start!');
      const rankingWebtoons = await get20BestRanking(GENRE.WB);
      await this.save20Db(rankingWebtoons);
      console.log('done!');

      //전체랭킹
      console.log('start!');
      const Rnovels = await get60WebtoonRanking(TYPE.R, currPage);
      await this.save60Db(Rnovels);
      console.log('done!');

      console.log('start!');
      const RFnovels = await get60WebtoonRanking(TYPE.RF, currPage);
      await this.save60Db(RFnovels);
      console.log('done!');

      console.log('start!');
      const Fnovels = await get60WebtoonRanking(TYPE.F, currPage);
      await this.save60Db(Fnovels);
      console.log('done!');

      console.log('start!');
      const Bnovels = await get60WebtoonRanking(TYPE.B, currPage);
      await this.save60Db(Bnovels);
      console.log('done!');

      console.log('start!');
      const Webtoons = await get60WebtoonRanking(TYPE.WB, currPage);
      await this.save60Db(Webtoons);
      console.log('done!');

      const endTime = new Date().getTime();
      console.log(`총 시간 : ${endTime - startTime}ms`);
    } catch (err) {
      throw err;
    }
    // const crawlerData = await crawlerRidibooks();

    // const daily60DataWebtoon = await get60WebtoonRanking();
    // const daily60DataWeNovel = await get60WebtoonRanking();
    // const dailyBestId = await get20BestRanking();

    // await this.save60Db(daily60DataWebtoon);
    // await this.save60Db(daily60DataWeNovel);

    // const dataBest20 = await getContentsData(dailyBestId);

    // const reviews10 = await getReviews10(dailyBestId);
    // const reviews10Results = await Promise.all(
    //   daily60Id.map((dailyBestId) => getReviews10(dailyBestId)),
    // );
    // const reviews20 = await getReviews20(dailyBestId);
  }

  async save60Db(data: WebContents[]) {
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
        webContent.pubDate = new Date(content.pubDate);
        // webContent.keyword = JSON.stringify(content.keyword);
        // webContent.rank = content.rank;
        webContent.contentType = ContentType.WEBTOON;
        // webContent.pReviews = content.pReviews;
        return webContent;
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);
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

  async save20Db(data: WebContents[]) {
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
        webContent.pubDate = new Date();
        // webContent.keyword = JSON.stringify(content.keyword);
        webContent.rank = content.rank;
        webContent.contentType = content.contentType;
        // webContent.pReviews = content.pReviews;
        return webContent;
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);
    } catch (err) {
      throw err;
    }
  }
}
