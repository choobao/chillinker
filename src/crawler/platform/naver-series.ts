import axios from 'axios';
import { load } from 'cheerio';

const naver_home_url = 'https://series.naver.com';
const naver_webnovel_top100_url =
  'https://series.naver.com/novel/top100List.series?rankingTypeCode=DAILY&categoryCode=ALL';

const getLinks = async (url: string, n: number, currentNum: number = 0) => {
  try {
    const webContents = [];

    let i = 1;
    let crawledNum = 0;
    let finished = false; // while 문을 탈출하기 위한 플래그 추가

    while (webContents.length < n && !finished) {
      const { data } = await axios(`${url}&page=${i++}`);

      const $ = load(data);
    
      const webContent_item = '#content > div > ul > li';
      const items = $(webContent_item);
      console.log(items);
      for (let el of items) {
        if (crawledNum >= n) {
          finished = true; // 조건을 만족하면 완료 플래그를 true로 설정하고 루프 탈출
          break;
        }
        const href = $(el).find('a').attr('href');
        console.log(href);
        if (href) {
          webContents.push({ url: naver_home_url + href }); // 절대 경로/상대 경로 확인 필요
          crawledNum += 1;
          console.log(href, crawledNum);
        }
      }
    }

    return webContents;
  } catch (err) {
    throw err;
  }
};

getLinks(naver_webnovel_top100_url, 30)
  .then((webContents) => {
    console.log(webContents);
  })
  .catch((err) => {
    console.error(err);
  });
