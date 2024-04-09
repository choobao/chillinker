import { Page } from 'puppeteer';
import { login_page_btn, login_submit_btn, naver_home_url } from './constants';

export async function login(page: Page): Promise<boolean> {
  const id = 'tntncodus';
  const pw = 'E*bNnH6e7#&dRPr';

  try {
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
    //console.log('로그인 실패: ', err);
    console.log('로그인 실패');
  }
  return false;
}
