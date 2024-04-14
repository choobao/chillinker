import axios from 'axios';
import {
  GENRE,
  TYPE,
  ridi_best100_rank_webToon,
  ridi_url,
} from '../utils/ridi.constants';
import { ContentType } from 'src/web-content/webContent.type';
import { HTMLToJSON } from 'html-to-json-parser';
import * as cheerio from 'cheerio';

export async function get60WebtoonRanking(type: TYPE, page: number) {
  try {
    const { data } = await axios({
      method: 'get',
      url: `https://ridibooks.com/_next/data/3.8.172-ecfb8c7/category/books/${type}.json?tab=books&category=${type}&page=${page}&order=review`,
    });
    const books = data.pageProps.dehydratedState.queries[2].state.data;

    const data60ranking = await Promise.all(
      books.map(async (bookData) => {
        const book = bookData.book;
        const bookId = book.bookId;
        const title = book.serial.title;
        const desc = book.introduction.description;
        const imageSmall = book.cover.small;
        const image = imageSmall.replace('/small', '');
        const isAdult = book.adultsOnly;
        const authorArr = book.authors;
        let authors = [];
        for (let i = 0; i < authorArr.length; i++) {
          const name = authorArr[i].name;
          const role = authorArr[i].role;
          const author = `${name}/${role}`;
          authors.push(author);
        }
        const categoryArr = book.categories;
        const category = [];
        for (let i = 0; i < categoryArr.length; i++) {
          category.push(categoryArr[i].name);
        }
        const url = `https://ridibooks.com/books/${bookId}`;
        const pubDate = book.publicationDate;
        let contentType;

        if (type == '1600') {
          contentType = ContentType.WEBTOON;
        } else {
          contentType = ContentType.WEBNOVEL;
        }

        let reviewList = [];

        const reviews10 = await getReviews10(bookId);
        const reviews20 = await getReviews20(bookId);
        reviewList = reviewList.concat(reviews10, reviews20);

        const platform = { ridibooks: url };
        return {
          contentType,
          bookId,
          platform,
          title,
          desc,
          image,
          isAdult,
          author: authors.join(', '),
          category: category.join(', '),
          url,
          pubDate,
          pReviews: reviewList,
        };
      }),
    );

    return data60ranking;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export async function get20BestRanking(gerne: GENRE) {
  try {
    const { data } = await axios({
      method: 'get',
      url: `https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/${gerne}.json?page=1&genre=${gerne}`,
    });

    const items =
      data.pageProps.dehydratedState.queries[0].state.data.bestsellers.items;

    const data20ranking = await Promise.all(
      items.slice(0, 20).map(async (bookData, index) => {
        const book = bookData.book;
        const title = book.series.title;
        const desc = book.introduction.description;
        const imageSmall = book.series.thumbnail.small;
        const image = imageSmall.replace(/\/small#1$/, '');
        const bookId = book.id;
        const isAdult = book.adultsOnly;
        const authorArr = book.authors;
        let authors = [];
        for (let i = 0; i < authorArr.length; i++) {
          const name = authorArr[i].name;
          const role = authorArr[i].role;
          const author = `${name}/${role}`;
          authors.push(author);
        }
        const categoryArr = book.categories;
        const category = [];
        for (let i = 0; i < categoryArr.length; i++) {
          category.push(categoryArr[i].name);
        }
        const url = `https://ridibooks.com/books/${bookId}`;
        const pubDate = book.publicationDate;

        let contentType;

        if (gerne == 'webtoon') {
          contentType = ContentType.WEBTOON;
        } else {
          contentType = ContentType.WEBNOVEL;
        }

        let reviewList = [];

        const rank = { ridibooks: index + 1, gerne };

        const platform = { ridibooks: url };

        const reviews10 = await getReviews10(bookId);
        const reviews20 = await getReviews20(bookId);
        reviewList = reviewList.concat(reviews10, reviews20);

        return {
          rank,
          contentType,
          bookId,
          platform,
          title,
          desc,
          image,
          isAdult,
          author: authors.join(', '),
          category: category.join(', '),
          url,
          pubDate,
          pReviews: reviewList,
        };
      }),
    );

    return data20ranking;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export async function getReviews10(booksId) {
  let offset = 0;
  const { data } = await axios({
    method: 'get',
    url: `https://ridibooks.com/books/load-reviews?book_id=${booksId}&order=like&offset=0&buyer_only=true`,
  });

  const $ = cheerio.load(data);

  const reviews = [];

  $('ul > li.review_list').each((index, element) => {
    const writer = $(element)
      .find('.list_left.js_review_info_wrapper > div > p > span.reviewer_id')
      .text()
      .trim();
    const content = $(element)
      .find('.list_right.js_review_wrapper > p')
      .text()
      .trim();
    const likeCount = $(element)
      .find(
        '.list_right.js_review_wrapper > div.review_status > div > button.rui_button_white_25.like_button.js_like_button > span > span.rui_button_text > span.like_count.js_like_count',
      )
      .text()
      .trim();
    const isSpoiler = $(element)
      .find(
        '.list_right.js_review_wrapper > div.rui_full_alert_4.spoiler_alert.js_spoiler_alert > article > p',
      )
      .text()
      .trim();
    const dateString = $(element)
      .find('.list_left.js_review_info_wrapper > div > div > div')
      .text()
      .trim();
    const trimmedDateString = dateString.replace(/\.$/, '');
    const parts = trimmedDateString.split('.');

    const yyyy = parts[0];
    const mm = parts[1];
    const dd = parts[2];

    const isoDateString = `${yyyy}-${mm}-${dd}`;

    const createdDate = new Date(isoDateString);

    console.log(trimmedDateString, isoDateString, createdDate);

    if (likeCount === '') {
      console.log('Skipping review due to empty likeCount.');
      return; // 현재 반복을 중지하고 다음 반복으로 넘어갑니다.
    }

    reviews.push({
      writer,
      content,
      likeCount,
      isSpoiler: isSpoiler ? true : false,
      createDate: createdDate,
    });
  });

  return reviews;
}

export async function getReviews20(booksId) {
  const { data } = await axios({
    method: 'get',
    url: `https://ridibooks.com/books/load-reviews?book_id=${booksId}&order=like&offset=10&buyer_only=true`,
  });

  const $ = cheerio.load(data);

  const reviews = [];

  $('ul > li.review_list').each((index, element) => {
    const writer = $(element)
      .find('.list_left.js_review_info_wrapper > div > p > span.reviewer_id')
      .text()
      .trim();
    const content = $(element)
      .find('.list_right.js_review_wrapper > p')
      .text()
      .trim();
    const likeCount = $(element)
      .find(
        '.list_right.js_review_wrapper > div.review_status > div > button.rui_button_white_25.like_button.js_like_button > span > span.rui_button_text > span.like_count.js_like_count',
      )
      .text()
      .trim();
    const isSpoiler = $(element)
      .find(
        '.list_right.js_review_wrapper > div.rui_full_alert_4.spoiler_alert.js_spoiler_alert > article > p',
      )
      .text()
      .trim();
    const dateString = $(element)
      .find('.list_left.js_review_info_wrapper > div > div > div')
      .text()
      .trim();
    const trimmedDateString = dateString.replace(/\.$/, '');
    const parts = trimmedDateString.split('.');

    const yyyy = parts[0];
    const mm = parts[1];
    const dd = parts[2];

    const isoDateString = `${yyyy}-${mm}-${dd}`;

    // Date 객체로 변환합니다.
    const createdDate = new Date(isoDateString);

    console.log(trimmedDateString, isoDateString, createdDate);

    // const formattedDateString = date.replace(/\./g, '-');

    reviews.push({
      writer,
      content,
      likeCount,
      isSpoiler: isSpoiler ? true : false,
      createDate: createdDate,
    });
  });

  return reviews;
}
