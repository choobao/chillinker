import axios from 'axios';
import { load } from 'cheerio';
import _ from 'lodash';
import { Page } from 'puppeteer';
import { Cluster } from 'puppeteer-cluster';
import { setTimeout } from 'timers/promises';
import { PReviews } from '../../review/entities/platform.reviews.entity';
import { WebContents } from '../../web-content/entities/webContents.entity';
import { ContentType } from '../../web-content/webContent.type';
import {
  login_page_btn,
  login_submit_btn,
  naver_home_url,
  naver_series_url,
  review_content,
  review_createdAt,
  review_likeCount,
  review_writer_nickname,
  series_adult_icon,
  series_all_review_btn,
  series_author,
  series_best_review_btn,
  series_category,
  series_desc,
  series_detail,
  series_epi_asc_btn,
  series_hd_icon,
  series_image,
  series_item,
  series_next_btn,
  series_not_detail_author,
  series_pubDate,
  series_review_all_more_btn,
  series_review_btn,
  series_review_count,
  series_review_item,
  series_title,
} from '../utils/naver-series.constants';
import { ConfigService } from '@nestjs/config';

export class NaverSeriesAxios {
  host: string = 'https://series.naver.com';
  series_item: string = '#productList > li';

  getUrlsForBest = async (url: string, n: number, currentPage: number = 1) => {
    const result: any[] = [];

    const { data } = await axios({
      method: 'get',
      headers: {
        Referer: this.host,
      },
      url: `${url}&page=${currentPage++}`,
    });

    const $ = load(data);
    $(this.series_item).each((idx, el) => {
      const link = $(el).find('a').attr('href');
      result.push({ url: this.host + link, id: link.split('=')[1] });
    });

    return result;
  };

  getUrlsForAll = async (url: string, n: number, currentPage: number = 0) => {
    const result: any[] = [];
    let crawledNum = 0;

    while (crawledNum < n) {
      const { data } = await axios({
        method: 'get',
        headers: {
          Referer: this.host,
        },
        url: `${url}&start=${currentPage + crawledNum}`,
      });

      const $ = load(data);
      $(this.series_item).each((idx, el) => {
        const link = $(el).find('a').attr('href');
        result.push({ url: this.host + link, id: link.split('=')[1] });
        crawledNum += 1;
        if (crawledNum >= n) {
          return false;
        }
      });
    }

    return result;
  };

  detail_api_url: string = 'https://series.naver.com/novel/volumeList.series';

  getWebContentInfo = async (id: string) => {
    const { data } = await axios({
      method: 'get',
      headers: {
        Referer: this.host,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36`,
      },
      url: `${this.detail_api_url}?productNo=${id}`,
    });

    const item = data.resultData[0];
    const contentType =
      item.productTypeCode === 'NOVEL'
        ? ContentType.WEBNOVEL
        : ContentType.WEBTOON;
    const title = item.productName;
    const writingAuthorName = item.writingAuthorName;
    const prictureAuthorName = item.prictureAuthorName;
    const isAdult = item.seeingGradeTypeCode === 'G19' ? 1 : 0;
    return {
      contentType,
      title,
      isAdult,
      author: this.setAuthorName(writingAuthorName, prictureAuthorName),
    };
  };

  getWebContent = async (id: string, url: string, page: Page) => {
    const { data } = await axios({
      method: 'get',
      headers: {
        Referer: this.host,
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36`,
      },
      url: `${this.detail_api_url}?productNo=${id}`,
    });

    const item = data.resultData[0];
    const contentType =
      item.productTypeCode === 'NOVEL'
        ? ContentType.WEBNOVEL
        : ContentType.WEBTOON;
    const title = item.productName;
    const writingAuthorName = item.writingAuthorName;
    const prictureAuthorName = item.prictureAuthorName;
    const isAdult = item.seeingGradeTypeCode === 'G19' ? 1 : 0;
    //const mobile_url = item.detailPageUrlByNstoreKey;

    // 나머지 가져오기
    await page.goto(`${url}&sortOrder=ASC`, { waitUntil: 'networkidle0' });

    const $ = load(await page.content());

    const desc_tag = '#content > div.end_dsc > div:nth-child(2)';
    const desc = $(desc_tag).first().text();

    const image = $($('img').toArray()[3]).attr('src').split('?type')[0];
    console.log('이미지: ', image);

    // const rate_tag = '#content > div.end_head > div.score_area > em';
    // const rate = +$(rate_tag).first().text();

    const pubDate_tag = '#volumeList > tr._volume_row_1 > td.subj > em';
    const pubDate = new Date(
      $(pubDate_tag).text().replace(/\(|\)/g, '').slice(0, -1),
    );
    console.log('등록일: ', pubDate);

    const category_tag = '#content > ul > li > ul > li:nth-child(2) > span > a';
    const category = $(category_tag).first().text();
    console.log(category);

    const review_div_tag = 'ul.u_cbox_list';
    const review_tag = 'li > div.u_cbox_comment_box > div.u_cbox_area';
    const reviews: PReviews[] = [];
    if ($(review_div_tag).attr('style') !== 'display: none;') {
      $(review_tag).each((idx, el) => {
        const writer = $(el).find('span.u_cbox_nick').text();
        console.log('작가: ', writer);
        const content = $(el).find('span.u_cbox_contents').text();
        console.log('내용: ', content);
        const likeCount = +$(el).find('em.u_cbox_cnt_recomm').text();
        console.log('리뷰 좋아요 개수: ', likeCount);
        const createDate = new Date(
          $(el).find('span.u_cbox_date').first().attr('data-value'),
        );
        console.log('작성날짜: ', createDate);
        const pReview = new PReviews();
        pReview.writer = writer;
        pReview.content = content;
        pReview.createDate = createDate;
        pReview.likeCount = likeCount;
        reviews.push(pReview);
      });
    }

    const webContent = new WebContents();
    webContent.title = title;
    webContent.author = this.setAuthorName(
      writingAuthorName,
      prictureAuthorName,
    );
    webContent.contentType = contentType;
    webContent.desc = desc;
    webContent.image = image;
    webContent.isAdult = isAdult;
    webContent.category = category;
    webContent.pubDate = pubDate;
    webContent.pReviews = reviews;
    webContent.platform = { naver: url } as any;

    return webContent;
  };

  ////////////////////////////////////////////////////////////////////////////////
  setAuthorName = (
    writingAuthorName: string | null | undefined,
    pictureAuthorName: string | null | undefined,
  ) => {
    let author;

    // writingAuthorName만 null이 아닌 경우
    if (!_.isNil(writingAuthorName) && _.isNil(pictureAuthorName)) {
      author = `author/${writingAuthorName}`;
    }
    // pictureAuthorName만 null이 아닌 경우
    else if (_.isNil(writingAuthorName) && !_.isNil(pictureAuthorName)) {
      author = `illustrator/${pictureAuthorName}`;
    }
    // 둘 다 null이 아니고 값이 같은 경우
    else if (
      !_.isNil(writingAuthorName) &&
      !_.isNil(pictureAuthorName) &&
      writingAuthorName == pictureAuthorName
    ) {
      author = `Author/${writingAuthorName}`;
    }
    // 둘 다 null이 아니고 값이 다른 경우
    else if (
      !_.isNil(writingAuthorName) &&
      !_.isNil(pictureAuthorName) &&
      writingAuthorName != pictureAuthorName
    ) {
      author = `author/${writingAuthorName}, illustrator/${pictureAuthorName}`;
    }
    // 둘 다 null인 경우
    else {
      author = null;
    }

    return author;
  };
}

export class NaverSeriesPuppeteer {
  constructor(private readonly configService: ConfigService) {}

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

      const urlList: string[] = [];
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
          urlList.push(url);
          crawledNum += 1; // 크롤링한 웹툰 개수 증가
        }

        // 첫 페이지가 아닌데도 '다음' 버튼 없으면 while문 탈출
        if (crawledNum > 25 && (await page.$(series_next_btn)) === null) {
          break;
        }
      }
      console.log('개수는? ', urlList.length);

      // 로그인
      await this.login(page);

      let i = 1; // index for rank
      const contentType = link.includes('novel')
        ? ContentType.WEBNOVEL
        : ContentType.WEBTOON;

      const webContentList: any[] = [];
      for (const url of urlList) {
        await page.goto(url, { waitUntil: 'networkidle0' });

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
        const author_str =
          detail_page === null
            ? await page.$eval(series_not_detail_author, (el) =>
                el.innerText?.replace(/\s/g, ''),
              )
            : 'NULL';
        let author = `author/${author_str}`;

        if (detail_page !== null) {
          const detail_page_url =
            naver_series_url +
            (await detail_page.$eval('dd > a', (el) =>
              el.getAttribute('href'),
            ));

          await setTimeout(1000);
          await page.goto(detail_page_url, { waitUntil: 'networkidle0' });

          await page.waitForSelector(series_desc, { timeout: 1000 });
          desc = await page.$eval(series_desc, (el) => el.textContent || title);

          const authorList = (
            await page.$eval(series_author, (el) => el.textContent)
          ).split(', ');
          if (authorList.length === 1 && contentType === ContentType.WEBNOVEL) {
            author = `author/${authorList[0]}`;
          } else if (
            authorList.length === 1 &&
            contentType === ContentType.WEBTOON
          ) {
            author = `Author/${authorList[0]}`;
          } else {
            author = `author/${authorList[0]}, illustrator/${authorList[1]}`;
          }

          await page.goBack();
        }

        let pReviews: PReviews[] = [];
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
            pReviews = await this.crawlReviews(page, 30);

            if ((await page.$(series_all_review_btn)) !== null) {
              await page.click(series_all_review_btn);

              await setTimeout(1000);
            }
          }

          const allPReviews = await this.crawlReviews(
            page,
            30 - pReviews.length,
          );

          pReviews = pReviews.concat(allPReviews);
        }

        const rank = link.includes('top100') ? { naver: i++ } : null;

        // csv string에 추가할 데이터
        const webContent = {
          title,
          author,
          image,
          category,
          desc,
          pReviews,
          pubDate,
          isAdult,
          rank,
          contentType,
          platform: { naver: url },
          keyword: [category],
        };

        console.log(
          webContent.title,
          webContent.rank,
          webContent.pReviews.length,
        );

        webContentList.push(webContent);
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

        // const writer_id = await review.$eval(
        //   review_writer_id,
        //   (el) => el.textContent,
        // );

        const createDate = (
          await review.$eval(review_createdAt, (el) =>
            el.getAttribute('data-value'),
          )
        ).split('T')[0];
        // const createDate = await review.$eval(
        //   review_createdAt,
        //   (el) => el.textContent,
        // );

        const likeCount = await review.$eval(
          review_likeCount,
          (el) => el.textContent,
        );

        reviewList.push({
          writer: writer_nickname,
          content,
          createDate,
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

  async login(page: Page): Promise<boolean> {
    try {
      const id = this.configService.get<string>('NAVER_LOGIN_ID');
      const pw = this.configService.get<string>('NAVER_LOGIN_PW');

      await page.goto(naver_home_url);

      await page.waitForSelector(login_page_btn);
      await page.click(login_page_btn);
      await page.waitForSelector(login_submit_btn);

      await page.click('#id');
      await page.keyboard.type(id, { delay: 1000 });
      await page.click('#pw');
      await page.keyboard.type(pw, { delay: 1000 });

      await page.click(login_submit_btn);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      if (page.url() === naver_home_url) return true;
    } catch (err) {
      console.log('로그인 실패');
    }
    return false;
  }
}
