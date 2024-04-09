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
import { RedisService } from '../redis/redis.service';
import _ from 'lodash';
import { ContentType } from '../web-content/webContent.type';
import { PReviews } from '../review/entities/platform.reviews.entity';
import { Cluster } from 'puppeteer-cluster';

@Injectable()
export class CrawlerService {
  constructor(
    @InjectRepository(WebContents)
    private readonly contentRepository: Repository<WebContents>,
    private readonly redisService: RedisService,
  ) {}
  @Cron('59 9 * * *')
  async createNaverSeries() {
    const currNumWebnovel =
      +(await this.redisService.getValue('naver_webnovel')) || 0;
    const currNumWebtoon =
      +(await this.redisService.getValue('naver_webtoon')) || 0;

    const params = [
      { link: series_webtoon_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webnovel_top100_daily_url, currNum: 1, n: 20 },
      { link: series_webtoon_url, currNum: currNumWebtoon, n: 100 },
      { link: series_webnovel_url, currNum: currNumWebnovel, n: 100 },
    ];

    const startTime = new Date().getTime();

    let webContentList;
    try {
      webContentList = await this.crawlNaverSeriesParallel(params);
      console.log(
        '결과확인: ',
        webContentList[0],
        '길이는 ',
        webContentList.length,
      );
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
        const pReviewDtos = JSON.parse(content.reviewList).map((review) => {
          const reviewEntity = new PReviews();
          reviewEntity.content = review.content;
          reviewEntity.likeCount = review.likeCount;
          reviewEntity.writer = review.writer;
          reviewEntity.createdAt = new Date(review.createdAt);
          return reviewEntity;
        });

        return {
          title: content.title,
          desc: content.desc,
          image: content.image,
          author: content.author,
          category: content.category,
          isAdult: content.isAdult,
          platform: { naver: content.url },
          pubDate: new Date(content.pubDate),
          rank: content.rank,
          contentType: content.contentType,
          pReviews: pReviewDtos,
        };
      });

      // DB에 저장
      await this.contentRepository.save(createContentDtos);

      // redis 업데이트
      await this.redisService.save('naver_webnovel', currNumWebnovel + 100);
      await this.redisService.save('naver_webtoon', currNumWebtoon + 100);

      console.log('시간 : ', new Date().getTime() - startTime, 'ms');
    } catch (err) {
      throw new Error(`크롤링 실패: ${err.message}`);
    }
  }

  async crawlNaverSeriesParallel(params: object[]) {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: 4,
      timeout: 40000000,
      monitor: true,
      retryLimit: 5,
      puppeteerOptions: {
        headless: true,
        userDataDir: './tmp',
      },
    });

    cluster.on('taskerror', (err, data) => {
      console.log(`Error crawling ${data.link}: ${err.message}`);
    });

    let result = [];

    await cluster.task(async ({ page, data: { link, currNum, n } }) => {
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (['font'].includes(request.resourceType())) {
          request.abort();
        } else {
          request.continue();
        }
      });

      const webContentList: any[] = [];
      let crawledNum = 0; // 현재까지 크롤링한 웹툰의 개수를 추적

      while (crawledNum < n) {
        await page.goto(link + `&start=${currNum + crawledNum}`, {
          waitUntil: 'networkidle0',
          timeout: 120000,
        });

        const webContents = await page.$$(series_item);
        for (const webContent of webContents) {
          if (crawledNum >= n) break; // n개를 초과하여 크롤링하지 않도록 확인
          const url =
            naver_series_url +
            (await webContent.$eval('a', (el) => el.getAttribute('href')));
          webContentList.push({ url });
          crawledNum += 1; // 크롤링한 웹툰 개수 증가
        }

        // 첫 페이지가 아닌데도 '다음' 버튼 없으면 while문 탈출
        if (crawledNum > 25 && (await page.$(series_next_btn)) === null) {
          break;
        }
      }
      console.log('개수는? ', webContentList.length);

      // 로그인
      await login(page);

      let i = 1; // index for rank
      let contentType = link.includes('novel')
        ? ContentType.WEBNOVEL
        : ContentType.WEBTOON;
      for (const webContent of webContentList) {
        if (webContent.url) {
          await page.goto(webContent.url, { waitUntil: 'networkidle0' });

          // const rate = await page.$eval(
          //   series_rate,
          //   (el) => el.textContent
          // );

          const category = await page.$eval(
            series_category,
            (el) => el.textContent,
          );

          const image = await page.$eval(series_image, (el) =>
            el.getAttribute('src'),
          );

          let title = await page.$eval(
            series_title,
            (el) => el.textContent || 'NULL',
          );

          let isAdult = 0;
          const is_adult_icon_exist = await page.$(series_adult_icon);
          const is_hd_icon_exist = await page.$(series_hd_icon);

          if (is_adult_icon_exist !== null) {
            const adultIconText =
              (await page.$eval(series_adult_icon, (el) => el.textContent)) ||
              'NULL';
            if (adultIconText !== 'NULL') {
              title = title.replace(adultIconText, '');
              isAdult = 1;
            }
          }

          if (is_hd_icon_exist !== null) {
            const hdIconText =
              (await page.$eval(series_hd_icon, (el) => el.textContent)) ||
              'NULL';
            if (hdIconText !== 'NULL') {
              title = title.replace(hdIconText, '');
            }
          }

          await setTimeout(1000);
          await page.click(series_epi_asc_btn);
          await setTimeout(1000);

          const pubDate = await page.$eval(
            series_pubDate,
            (el) => el.textContent,
          );

          const reviewCount = await page.$eval(
            series_review_count,
            (el) => el.textContent,
          );

          // 디테일 페이지로 이동
          // 그 전에 디테일 페이지가 존재하는지 체크
          const detail_page = await page.$(series_detail);

          let desc = title;
          let author =
            detail_page === null
              ? await page.$eval(series_not_detail_author, (el) =>
                  el.textContent?.replace(/작가|\||\s/g, ''),
                )
              : 'NULL';

          if (detail_page !== null) {
            const detail_page_url =
              naver_series_url +
              (await detail_page.$eval('dd > a', (el) =>
                el.getAttribute('href'),
              ));

            await setTimeout(1000);
            await page.goto(detail_page_url, { waitUntil: 'networkidle0' });

            await page.waitForSelector(series_desc, { timeout: 1000 });
            desc = await page.$eval(
              series_desc,
              (el) => el.textContent || title,
            );

            author = await page.$eval(
              series_author,
              (el) => el.textContent || 'NULL',
            );

            await page.goBack();
          }

          let reviewList: any[] = [];
          // 리뷰가 존재하면,
          if (reviewCount !== '0') {
            await setTimeout(1000);
            await page.click(series_review_btn); // 리뷰 버튼 클릭

            // 무엇이 selected 된지 확인
            await page.waitForSelector(series_best_review_btn);
            const is_best_selected = await page.$eval(
              series_best_review_btn,
              (el) => el.getAttribute('aria-selected'),
            );

            if (is_best_selected === 'true') {
              reviewList = await this.crawlReviews(page, 100);

              if ((await page.$(series_all_review_btn)) !== null) {
                await page.click(series_all_review_btn);

                await setTimeout(1000);
              }
            }

            const allReviewList = await this.crawlReviews(
              page,
              100 - reviewList.length,
            );

            reviewList = reviewList.concat(allReviewList);
          }

          let rank = link.includes('top100') ? { naver: i++ } : null;
          console.log(title, reviewList.length, rank, contentType);

          // csv string에 추가할 데이터
          const data = {
            title,
            author,
            image,
            category,
            desc,
            reviewList: JSON.stringify(reviewList),
            pubDate,
            isAdult,
            rank,
            contentType,
          };
          Object.assign(webContent, data);
        }
      }

      result = result.concat(webContentList);
    });

    for (const param of params) {
      await cluster.queue(param);
    }

    await cluster.idle();
    await cluster.close();

    return result;
  }

  async crawlReviews(page: Page, n: number) {
    await page.waitForSelector(series_review_item);

    const reviewList: any[] = [];

    let reviewCount = 0;

    while (reviewCount < n) {
      const reviews = await page.$$(series_review_item);
      for (const review of reviews.slice(reviewCount)) {
        // 이미 확인한 리뷰는 스킵
        if ((await review.$(review_content)) === null) {
          // 차단된 댓글 스킵
          continue;
        }
        const content = await review.$eval(
          review_content,
          (el) => el.textContent,
        );

        const writer_nickname = await review.$eval(
          review_writer_nickname,
          (el) => el.textContent,
        );

        const writer_id = await review.$eval(
          review_writer_id,
          (el) => el.textContent,
        );

        const createdAt = await review.$eval(review_createdAt, (el) =>
          el.getAttribute('data-value'),
        );
        const likeCount = await review.$eval(
          review_likeCount,
          (el) => el.textContent,
        );

        reviewList.push({
          writer: writer_nickname + writer_id,
          content,
          createdAt: new Date(createdAt),
          likeCount,
        });

        reviewCount += 1;
        if (reviewCount === n) {
          // 목표한 리뷰 개수에 도달하면 반복 중단
          return reviewList;
        }
      }

      // 더보기 버튼 클릭
      // 페이지 끝에 도달했는지 체크하고, 끝에 도달했다면 반복 중단
      const is_more_btn_exist =
        (await page.$eval('div.u_cbox_paginate', (el) =>
          el.getAttribute('style'),
        )) || 'NULL';

      if (is_more_btn_exist !== 'display: none;') {
        await page.click(series_review_all_more_btn);
        // 더보기 이후에 새로운 리뷰들이 로드될 때까지 대기
        await setTimeout(1000);
      } else {
        // 더 이상 로드할 리뷰가 없을 경우
        break;
      }
    }
    return reviewList;
  }
}
