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
      url: `https://ridibooks.com/_next/data/3.8.176-8c469fa/category/books/${type}.json?tab=books&category=${type}&page=${page}&order=review`,
    });
    const books = data.pageProps.dehydratedState.queries[2].state.data;

    const data60ranking = await Promise.all(
      books.map(async (bookData) => {
        const book = bookData.book;
        const bookId = book.bookId;
        const title = book.serial.title;
        const desc = book.introduction.description;
        const image = book.cover.xxlarge;
        // const image = imageSmall.replace('/small', '');
        const isAdult = book.adultsOnly;
        const authorArr = book.authors;
        let authors = [];
        for (let i = 0; i < authorArr.length; i++) {
          let name = authorArr[i].name;
          let role = authorArr[i].role;

          if (
            role == 'planner' ||
            role == 'EDITOR' ||
            role == 'PLANNER' ||
            role == 'editor'
          ) {
            continue;
          }

          if (type !== TYPE.WB && role == 'Author') {
            role = 'author';
          }

          if (role == 'story_writer' || role == 'STORY_WRITER') {
            role = 'author';
          }

          if (role !== 'Author') {
            role = role.toLowerCase();
          }

          const author = `${role}/${name}`;
          authors.push(author);
        }
        const categoryArr = book.categories;
        const category = [];
        for (let i = 0; i < categoryArr.length; i++) {
          category.push(categoryArr[i].name);
        }
        const url = `https://ridibooks.com/books/${bookId}`;
        // const pubDate = book.publicationDate;

        const { keywords, pubDate } = await getKeywordPubDate(bookId);
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
          author: authors.join(','),
          category: category.join(','),
          url,
          pubDate,
          keyword: keywords,
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
  console.log(`${gerne} 크롤링 시작`);
  try {
    const { data } = await axios({
      method: 'get',
      url: `https://ridibooks.com/_next/data/3.8.176-8c469fa/bestsellers/${gerne}.json?genre=${gerne}`,
    });

    const items =
      data.pageProps.dehydratedState.queries[0].state.data.bestsellers.items;

    let data20ranking = await Promise.all(
      items.slice(0, 20).map(async (bookData, index) => {
        console.log(index);
        const book = bookData.book;
        let title = book.series.title;
        if (!title) {
          title = book.title;
        }
        console.log(title);
        const desc = book.introduction.description;
        const image = book.series.thumbnail.xxlarge;
        // const image = imageSmall.replace(/\/small#1$/, '');
        const bookId = book.id;
        const isAdult = book.isAdultOnly;
        const authorArr = book.authors;
        let authors = [];
        for (let i = 0; i < authorArr.length; i++) {
          let name = authorArr[i].name;
          let role = authorArr[i].role;

          if (
            role == 'planner' ||
            role == 'EDITOR' ||
            role == 'PLANNER' ||
            role == 'editor'
          ) {
            continue;
          }

          if (role == 'story_writer' || role == 'STORY_WRITER') {
            role = 'author';
          }

          if (gerne !== GENRE.WB && role == 'Author') {
            role = 'author';
          }

          if (role !== 'Author') {
            role = role.toLowerCase();
          }

          const author = `${role}/${name}`;
          authors.push(author);
        }
        const categoryArr = book.categories;
        const category = [];
        for (let i = 0; i < categoryArr.length; i++) {
          category.push(categoryArr[i].name);
        }
        const url = `https://ridibooks.com/books/${bookId}`;

        let contentType;

        if (gerne == 'webtoon') {
          contentType = ContentType.WEBTOON;
        } else {
          contentType = ContentType.WEBNOVEL;
        }

        let reviewList = [];

        const rank = { ridibooks: index + 1, gerne };

        const platform = { ridibooks: url };

        const { keywords, pubDate } = await getKeywordPubDate(bookId);

        const reviews10 = await getReviews10(bookId);
        const reviews20 = await getReviews20(bookId);
        // console.log('리뷰10', reviews10);
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
          author: authors.join(','),
          category: category.join(','),
          url,
          pubDate,
          pReviews: reviewList,
          keyword: keywords,
        };
      }),
    );
    console.log(data20ranking[15].title);

    // if (data20ranking == undefined) {
    //   data20ranking = await Promise.all(
    //     items.slice(0, 20).map(async (bookData, index) => {
    //       const book = bookData.book;
    //       let title = book.series.title;
    //       const desc = book.introduction.description;
    //       const image = book.series.thumbnail.xxlarge;
    //       // const image = imageSmall.replace(/\/small#1$/, '');
    //       const bookId = book.id;
    //       const isAdult = book.isAdultOnly;
    //       const authorArr = book.authors;
    //       let authors = [];
    //       for (let i = 0; i < authorArr.length; i++) {
    //         let name = authorArr[i].name;
    //         let role = authorArr[i].role;

    //         if (
    //           role == 'planner' ||
    //           role == 'EDITOR' ||
    //           role == 'PLANNER' ||
    //           role == 'editor'
    //         ) {
    //           return;
    //         }

    //         if (gerne !== GENRE.WB && role == 'Author') {
    //           role = 'author';
    //         }

    //         if (role !== 'Author') {
    //           role = role.toLowerCase();
    //         }

    //         const author = `${role}/${name}`;
    //         authors.push(author);
    //       }
    //       const categoryArr = book.categories;
    //       const category = [];
    //       for (let i = 0; i < categoryArr.length; i++) {
    //         category.push(categoryArr[i].name);
    //       }
    //       const url = `https://ridibooks.com/books/${bookId}`;

    //       let contentType;

    //       if (gerne == 'webtoon') {
    //         contentType = ContentType.WEBTOON;
    //       } else {
    //         contentType = ContentType.WEBNOVEL;
    //       }

    //       let reviewList = [];

    //       const rank = { ridibooks: index + 1, gerne };

    //       const platform = { ridibooks: url };

    //       const { keywords, pubDate } = await getKeywordPubDate(bookId);

    //       const reviews10 = await getReviews10(bookId);
    //       const reviews20 = await getReviews20(bookId);
    //       // console.log('리뷰10', reviews10);
    //       reviewList = reviewList.concat(reviews10, reviews20);

    //       return {
    //         rank,
    //         contentType,
    //         bookId,
    //         platform,
    //         title,
    //         desc,
    //         image,
    //         isAdult,
    //         author: authors.join(','),
    //         category: category.join(','),
    //         url,
    //         pubDate,
    //         pReviews: reviewList,
    //         keyword: keywords,
    //       };
    //     }),
    //   );
    // }

    return data20ranking;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export async function getKeywordPubDate(bookId: number) {
  const { data } = await axios({
    method: 'get',
    url: `https://ridibooks.com/books/${bookId}`,
  });

  const $ = cheerio.load(data);

  const keywordArr = [];
  const excludedKeywords = ['기다리면무료', '리뷰', '별점', '평점'];

  $(
    '#page_detail > div.detail_wrap > div.detail_body_wrap > section > article.detail_box_module.detail_keyword.js_detail_keyword_module > ul > li > button',
  ).each((index, element) => {
    const keyword = $(element).attr('data-tag-name').trim();
    if (
      // !excludedKeywords.includes(keyword) &&
      !keyword.includes('리뷰') &&
      !keyword.includes('별점') &&
      !keyword.includes('평점') &&
      !keyword.includes('기다리면무료') &&
      !keyword.includes('RIDI') &&
      !keyword.includes('리다무') &&
      !keyword.includes('연재완결')
    ) {
      keywordArr.push(keyword);
    }
  });

  // const keywordsq = keywordArr.join(', ');
  //const keywords = keywordArr.join(', ');
  // keywordsq.replace(/'/g, '');

  const dateStringWithSuffix = $(
    '#page_detail > div.detail_wrap > div.detail_body_wrap > section > article.detail_header.trackable > div.Header_Metadata_Block > ul:nth-child(2) > li.Header_Metadata_Item.book_info.published_date_info > ul > li',
  )
    .text()
    .trim();

  const dateString = dateStringWithSuffix.replace('. 출간', '');

  const [year, month, day] = dateString
    .split('.')
    .map((part) => parseInt(part));

  const isoDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  const pubDate = new Date(isoDateString);

  return { keywords: keywordArr, pubDate };
}

export async function getReviews10(bookId: number) {
  let offset = 0;
  const { data } = await axios({
    method: 'get',
    url: `https://ridibooks.com/books/load-reviews?book_id=${bookId}&order=like&offset=0&buyer_only=true`,
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

export async function getReviews20(bookId: number) {
  const { data } = await axios({
    method: 'get',
    url: `https://ridibooks.com/books/load-reviews?book_id=${bookId}&order=like&offset=10&buyer_only=true`,
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
