import axios from 'axios';
import {
  GENRE,
  TYPE,
  ridi_best100_rank_webToon,
  ridi_url,
} from '../utils/ridi.constants';
import { ContentType } from 'src/web-content/webContent.type';

export async function get60WebtoonRanking(type: TYPE, page: number) {
  try {
    const { data } = await axios({
      method: 'get',
      url: `https://ridibooks.com/_next/data/3.8.172-ecfb8c7/category/books/${type}.json?tab=books&category=${type}&page=${type}&order=review`,
    });

    const books = data.pageProps.dehydratedState.queries[2].state.data;

    console.log(books);

    const data60ranking = books.map((bookData) => {
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
      };
    });

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

    const data20ranking = items.slice(0, 20).map((bookData, index) => {
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

      console.log(contentType);

      const rank = { ridibooks: index + 1, gerne };

      const platform = { ridibooks: url };
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
      };
    });

    return data20ranking;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

export async function getContentsData(idArr) {
  try {
    const data = await idArr.map((id) => {
      return axios({
        method: 'get',
        url: `https://api.ridibooks.com/v1/linked-contents/${id}`,
      });
    });

    const responseData = await Promise.all(data);

    const bookDataArr = responseData.map(
      (response) => response.data.data.linked_contents.books[0],
    );

    // const contentData = bookDataArr.map((book) => {
    //   const title = book.serial.title;
    //   const imageSmall = book.cover.small;
    //   const image = imageSmall.replace('/small', '');
    //   const contentType = ContentType.WEBNOVEL
    //   const desc =

    //   return {
    //     contentType,
    //     title,
    //     desc,
    //     image,
    //     isAdult,
    //     rank,
    //     author,
    //     keyword,
    //     category,
    //     platform,
    //     pubDate,
    //   };
    // });

    // return contentData;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// export async function getReviews10(booksId) {
//   let offset = 0;
//   const { data } = await axios({
//     method: 'get',
//     url: `https://ridibooks.com/books/load-reviews?book_id=${booksId}=like&offset=${offset}&buyer_only=true`,
//   });

//   console.log(data);
// }

// export async function getReviews20(booksId) {
//   const { data } = await axios({
//     method: 'get',
//     url: `https://ridibooks.com/books/load-reviews?book_id=${booksId}=like&offset=10&buyer_only=true`,
//   });
// }
