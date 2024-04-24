import puppeteer, { Page } from 'puppeteer';
import {
  mrblue_login_page_url,
  mrblue_main_url,
  mrblue_webnovel_allgenre_sortbyreview_frontpart,
  mrblue_webnovel_allgenre_sortbyreview_backpart,
  mrblue_webnovel_daily_toprank_120,
  mrblue_webtoon_daily_toprank_120,
  mrblue_webtoon_allgenre_sortbyreview_frontpart,
  mrblue_webtoon_allgenre_sortbyreview_backpart,
} from '../utils/mrblue.constants';
import { setTimeout } from 'timers/promises';
import { ConfigService } from '@nestjs/config';
import { ContentType } from '../../web-content/webContent.type';

export default class MrbluePuppeteer {
  constructor(private readonly configService: ConfigService) {}

  //웹소설 크롤링(페이지네이션있음)
  async crawlWebnovels(mbWebnovelCurPage: number, mbWebnovelMaxPage: number) {
    try {
      const result = await this.startCrawling();

      let data: any[] = [];
      while (mbWebnovelCurPage < mbWebnovelMaxPage) {
        const newdata = await this.getWebnovels(result.page, mbWebnovelCurPage);
        data = [...data, ...newdata];
        mbWebnovelCurPage += 1;
      }
      await result.browser.close();
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getWebnovels(page: Page, currentPage: number) {
    try {
      await page.goto(
        mrblue_webnovel_allgenre_sortbyreview_frontpart +
          currentPage +
          mrblue_webnovel_allgenre_sortbyreview_backpart,
        {
          waitUntil: 'networkidle2',
        },
      );

      const linkList = await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll('#listBox > div > div > ul> li'),
        );
        return items.map((item) => {
          const title = item.querySelector(
            'div.txt-box > span.tit > a',
          )?.textContent;
          const genre = item.querySelector(
            'div.txt-box > span.name > span > a',
          ).textContent;
          const link = item.querySelector('div.img > a')?.getAttribute('href');
          return { title, genre, link };
        });
      });

      const data: any[] = [];

      for (const work of linkList) {
        if (work.genre.includes('성인소설' || '라이트노벨')) continue;
        if (work.title.includes('[특가 세트]' || '% 세트 할인]')) continue;

        const realUrl = mrblue_main_url + work.link;
        const rank = null;
        await this.crawlWebnovelData(page, realUrl, rank, data);
      }
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  //웹소설 랭킹 크롤링
  async webnovelRank() {
    try {
      const result = await this.startCrawling();
      const data = await this.getWebnovelRank(result.page);
      await result.browser.close();
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getWebnovelRank(page: Page) {
    try {
      console.log('여기까진 됨: getWebnovelRank');
      let linkList: any[] = [];
      await page.goto(mrblue_webnovel_daily_toprank_120, {
        waitUntil: 'networkidle2',
      });
      console.log('1');
      const firstTo5th = await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll(
            '#contents > div.cover-section.best100 > div > div > div.list-box.top-rank > ul > li',
          ),
        );
        return items.map((item) => {
          return {
            rank: item.querySelector('p')?.textContent,
            link: item.querySelector('div.img > a')?.getAttribute('href'),
            title: item.querySelector('div.txt-box > span.tit > a')
              ?.textContent,
            genre: item.querySelector('div.txt-box > span.name > span > a')
              ?.textContent,
          };
        });
      });
      linkList = [...linkList, ...firstTo5th];

      console.log('2');
      const sixthTo20th = await page.evaluate(() => {
        let items = Array.from(
          document.querySelectorAll(
            '#contents > div:nth-child(2) > div > div > ul > li',
          ),
        );
        items = items.filter((_, index) => {
          return index < 15;
        });

        return items.map((item) => {
          return {
            rank: item.querySelector('p')?.textContent,
            link: item.querySelector('div.img > a')?.getAttribute('href'),
            title: item.querySelector('div.txt-box > span.tit > a')
              ?.textContent,
            genre: item.querySelector('div.txt-box > span.name > span > a')
              ?.textContent,
          };
        });
      });
      linkList = [...linkList, ...sixthTo20th];

      const data: any[] = [];
      console.log('3');
      for (const work of linkList) {
        if (work.genre.includes('성인소설' || '라이트노벨')) continue;
        if (work.title.includes('[특가 세트]' || '% 세트 할인]')) continue;

        const realUrl = mrblue_main_url + work.link;
        const rank = { mrblue: +work.rank };
        await this.crawlWebnovelData(page, realUrl, rank, data);
      }

      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  //웹툰 크롤링(페이지네이션 있음)
  async crawlWebtoons(mbWebtoonCurPage: number, mbWebtoonMaxPage: number) {
    try {
      const result = await this.startCrawling();
      let data: any[] = [];
      while (mbWebtoonCurPage < mbWebtoonMaxPage) {
        const newdata = await this.getWebtoons(result.page, mbWebtoonCurPage);
        data = [...data, ...newdata];
        mbWebtoonCurPage++;
      }
      await result.browser.close();
      return data;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  async getWebtoons(page: Page, currentPage: number) {
    try {
      await page.goto(
        mrblue_webtoon_allgenre_sortbyreview_frontpart +
          currentPage +
          mrblue_webtoon_allgenre_sortbyreview_backpart,
        {
          waitUntil: 'networkidle2',
        },
      );

      const linkList = await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll('#listBox > div > div > ul > li'),
        );
        return items.map((item) => {
          const title = item.querySelector(
            'div.txt-box > span.tit > a',
          )?.textContent;
          const genre = item.querySelector(
            'div.txt-box > span.name > span > a',
          )?.textContent;
          const link = item.querySelector('div.img > a')?.getAttribute('href');
          return { title, genre, link };
        });
      });

      const data: any[] = [];

      for (const work of linkList) {
        if (work.title.includes('[특가 세트]' || '% 세트 할인]')) continue;
        if (work.genre.includes('에로')) continue;

        const realUrl = mrblue_main_url + work.link;
        const rank = null;

        await this.crawlWebtoonData(page, realUrl, rank, data);
      }
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  //웹툰 랭킹 크롤링
  async webtoonRank() {
    try {
      const result = await this.startCrawling();

      const data = await this.getWebtoonRank(result.page);
      await result.browser.close();
      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getWebtoonRank(page: Page) {
    try {
      let linkList: any[] = [];
      await page.goto(mrblue_webtoon_daily_toprank_120, {
        waitUntil: 'networkidle2',
      });

      const firstTo5th = await page.evaluate(() => {
        const items = Array.from(
          document.querySelectorAll(
            '#contents > div:nth-child(1) > div > div > div.list-box.top-rank > ul > li',
          ),
        );
        return items.map((item) => {
          return {
            title: item.querySelector('div.txt-box > span.tit > a')
              ?.textContent,
            rank: item.querySelector('p')?.textContent,
            link: item.querySelector('div.img > a')?.getAttribute('href'),
          };
        });
      });
      linkList = [...linkList, ...firstTo5th];

      const sixthTo20th = await page.evaluate(() => {
        let items = Array.from(
          document.querySelectorAll(
            '#contents > div:nth-child(2) > div > div > ul > li',
          ),
        );
        items = items.filter((_, index) => {
          return index < 15;
        });
        return items.map((item) => {
          return {
            title: item.querySelector('div.txt-box > span.tit > a')
              ?.textContent,
            rank: item.querySelector('p')?.textContent,
            link: item.querySelector('div.img > a').getAttribute('href'),
          };
        });
      });
      linkList = [...linkList, ...sixthTo20th];
      const data: any[] = [];

      for (const work of linkList) {
        if (work.title.includes('[특가 세트]' || '% 세트 할인]')) continue;

        const realUrl = mrblue_main_url + work.link;
        const rank = { mrblue: +work.rank };

        await this.crawlWebtoonData(page, realUrl, rank, data);
      }

      return data;
    } catch (err) {
      throw new Error(err);
    }
  }

  //로그인
  async login(page: Page) {
    try {
      const mbEmail = this.configService.get<string>('MRBLUE_EMAIL');
      const mbPassword = this.configService.get<string>('MRBLUE_PASSWORD');
      await page.goto(mrblue_login_page_url, {
        waitUntil: 'networkidle2',
        timeout: 50000,
      }); //mrblue로그인 페이지로 이동

      await page.type('#pu-page-id', mbEmail); //이메일 입력창에 이메일 입력
      await page.type('#pu-page-pw', mbPassword); //비밀번호 입력창에 비밀번호 입력
      await page.click('#loginPageForm > div.in-value > a'); // 로그인 버튼 클릭
      await page.waitForNavigation(); //이거 없으면 로그인이 안됨;;
    } catch (err) {
      console.log('로그인 실패!');
      throw new Error(`${err}`);
    }
  }

  //퍼페티어로 크롤링 시작
  async startCrawling() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--window-size=1280,960'],
    }); // 브라우저 띄움

    const page = await browser.newPage(); // 페이지 창 생성
    await page.setViewport({ width: 1280, height: 960 });

    await this.login(page);
    return { browser, page };
  }

  //리뷰 가져오기
  async getReviews(page: Page) {
    try {
      let reviewList: any[] = [];
      if (
        (await page.$('#reviewContainer')) === null ||
        (await page.$('#reviewBox > li.no-review'))
      ) {
        return reviewList;
      }
      let maxPageCount = 0;
      try {
        maxPageCount = await page.$eval(
          'div#reviewPaging > a.btn-last',
          (el) => +el.getAttribute('data-page'),
        );
      } catch (err) {
        console.error(err);
        maxPageCount = 1;
      }

      if (maxPageCount >= 3) {
        for (let i = 1; i <= 3; i++) {
          if (reviewList.length > 30) {
            break;
          }
          const button = 'div#reviewPaging > a.btn-next';
          await setTimeout(1000);
          await page.click(button);
          const reviews = await page.evaluate(() => {
            const items = Array.from(
              document.querySelectorAll('#reviewBox > li'),
            );
            return items.map((item) => {
              return {
                writer: item.querySelector('p > strong')?.textContent,
                createDate: item
                  .querySelector('p.star-box > span.date')
                  ?.textContent.replace(/\./g, '-'),
                content: item.querySelector('p.txt')?.textContent,
                likeCount: item.querySelector('a > span.cnt')?.textContent,
              };
            });
          });
          reviewList = reviewList.concat(reviews);
        }
      } else if (maxPageCount < 3) {
        for (let i = 1; i <= maxPageCount; i++) {
          if (reviewList.length > 30) {
            break;
          }
          try {
            const button = 'div#reviewPaging > a.btn-next';
            await setTimeout(1000);
            await page.click(button);
          } catch (err) {
            console.error(err);
          }
          const reviews = await page.evaluate(() => {
            const items = Array.from(
              document.querySelectorAll('#reviewBox > li'),
            );
            return items.map((item) => {
              return {
                writer: item.querySelector('p > strong')?.textContent,
                createDate: item
                  .querySelector('p.star-box > span.date')
                  ?.textContent.replace(/\./g, '-'),
                content: item.querySelector('p.txt')?.textContent,
                likeCount: item.querySelector('a > span.cnt')?.textContent,
              };
            });
          });
          reviewList = reviewList.concat(reviews);
        }
      }
      return reviewList;
    } catch (err) {
      throw new Error(`${err}`);
    }
  }

  //웹소설 데이터 가져오기
  async crawlWebnovelData(page: Page, realUrl: string, rank, data: any[]) {
    console.log('4');
    await page.goto(realUrl, { waitUntil: 'networkidle2' });
    const reviews = await this.getReviews(page);

    await page.waitForSelector('#contents > div > div > div.detail-con', {
      visible: true,
    });
    console.log('5');
    const newData = await page.evaluate(
      async (realUrl, rank, type) => {
        const item = document.querySelector(
          '#contents > div > div > div.detail-con',
        );
        const platform = { mrblue: realUrl };
        const image = item
          .querySelector('div.info-box > div.img-box > p > img')
          ?.getAttribute('src');
        const genre = item.querySelector(
          'div.info-box > div.txt-info > div.genre-info > span:nth-child(1) > a:nth-child(3)',
        )?.textContent;
        const genreDetail = item.querySelector(
          'div.info-box > div.txt-info > div.genre-info > span:nth-child(1) > a:nth-child(5)',
        )?.textContent;
        const title = item.querySelector(
          'div.info-box > div.txt-info > p',
        )?.textContent;
        const author = item
          .querySelector('div.info-box > div.txt-info > div.txt > p')
          ?.textContent.replace('글 ', 'author/')
          .replace('삽화 ', ', illustrator/');
        const ageLimit = item.querySelector(
          'div.info-box > div.txt-info > div.txt > p:nth-child(2) > span:nth-child(1)',
        ).textContent;
        const isAdult = ageLimit === '19세 이용가' ? 1 : 0;
        const pubDate = item
          .querySelector(
            'div.info-box > div.txt-info > div.txt > p.mt10 > span:nth-child(1)',
          )
          ?.textContent.replace(/\./g, '-');
        const desc = item.querySelector('div > div.txt-box')?.textContent;
        const keywordList = Array.from(
          document.querySelectorAll(
            '#contents > div > div > div.detail-con > ul.additional-info-keyword > li > a.keyword',
          ),
        ).map((keyword) => keyword.textContent.replace('#', ''));
        let category = genre;

        if (genreDetail) {
          if (genre === '판타지/무협') {
            if (genreDetail.includes('무협')) {
              category = '무협';
            } else {
              category = '판타지';
            }
          } else if (genre === '로맨스') {
            if (genreDetail === 'GL') category = genreDetail;
          } else if (genre === '연재') category = genreDetail;
        }

        return {
          rank,
          platform,
          image,
          category,
          title,
          author,
          isAdult,
          pubDate,
          desc,
          keyword: keywordList,
          contentType: type,
        };
      },
      realUrl,
      rank,
      ContentType.WEBNOVEL,
    );
    console.log('6', reviews.length);
    data.push({ ...newData, pReviews: reviews });
  }

  //웹툰 데이터 가져오기
  async crawlWebtoonData(page: Page, realUrl: string, rank, data: any[]) {
    await page.goto(realUrl, { waitUntil: 'networkidle2' });
    const reviews = await this.getReviews(page);

    await page.waitForSelector('#contents', { visible: true });

    const newData = await page.evaluate(
      async (realUrl, rank, type) => {
        const item = document.querySelector('#contents');
        const platform = { mrblue: realUrl };
        const image = item
          .querySelector(
            'div.cover-section.webtoon-detail > div.img-box > p > img',
          )
          ?.getAttribute('src')
          .replace('/detail_original.jpg', '/cover_w480.jpg');
        const category = item.querySelector(
          'div.cover-section.webtoon-detail > div.cover-section-inner.detail-con > div > div > div.info > span:nth-child(1) > a',
        )?.textContent;
        const title = item.querySelector(
          'div.cover-section.webtoon-detail > div.cover-section-inner.detail-con > div > div > p',
        )?.textContent;

        const author = item
          .querySelector(
            'div.cover-section.webtoon-detail > div.cover-section-inner.detail-con > div > div > div.txt > p',
          )
          .textContent.replace('그림/글 ', 'Author/')
          .replace('그림 ', 'illustrator/')
          .replace('글 ', ', author/')
          .replace('(원작)', 'original_author/')
          .replace(/illustrator\/([^,]+), author\/\1/g, 'Author/$1');

        const ageLimit = item.querySelector(
          'div.cover-section.webtoon-detail > div.cover-section-inner.detail-con > div > div > div.txt > p:nth-child(2) > span:nth-child(1)',
        ).textContent;
        const isAdult = ageLimit === '19세 이용가' ? 1 : 0;
        const pubDate = item
          .querySelector(
            '#volList > li:nth-child(1) > div.vol-info > p.info-summary > span:nth-child(1)',
          )
          ?.textContent.replace(/\./g, '-');
        const desc = item.querySelector(
          'div:nth-child(2) > div > div.detail-con > div> div.txt-box',
        )?.textContent;
        const keywordList = Array.from(
          document.querySelectorAll(
            '#contents > div:nth-child(2) > div > div.detail-con > ul.additional-info-keyword > li > a.keyword',
          ),
        ).map((keyword) => keyword.textContent.replace('#', ''));

        return {
          rank,
          platform,
          image,
          category,
          title,
          author,
          ageLimit,
          isAdult,
          pubDate,
          desc,
          keyword: keywordList,
          contentType: type,
        };
      },
      realUrl,
      rank,
      ContentType.WEBTOON,
    );
    data.push({ ...newData, pReviews: reviews });
  }
}
