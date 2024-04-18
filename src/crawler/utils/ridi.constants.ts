export const ridi_url = 'https://ridibooks.com/';

export const adult_exclude = '&adult_exclude=y';

export enum GENRE {
  R = 'romance_serial',
  RF = 'romance_fantasy_serial',
  F = 'fantasy_serial',
  B = 'bl-webnovel',
  WB = 'webtoon',
}

export enum TYPE {
  R = '1650',
  RF = '6050',
  F = '1750',
  B = '4150',
  WB = '1600',
}

export enum Writer_Type {
  a = 'author',
  A = 'Author',
  i = 'illustrator',
  o = 'original_author',
}

// 베스트 20 리디 웹툰 & 웹소설
export const ridi_best20_rank_webToon =
  'https://ridibooks.com/_next/data/3.8.176-8c469fa/bestsellers/webtoon.json?page=1&genre=webtoon';
//   https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/${gerne}.json?page=1&genre=${gerne}

// https://ridibooks.com/_next/data/3.8.174-366d22f/bestsellers/webtoon.json?genre=webtoon
//   https://ridibooks.com/_next/data/3.8.174-366d22f/bestsellers/romance_serial.json?genre=romance_serial&page=1
export const ridi_best20_rank_R_webNovel =
  'https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/romance_serial.json?genre=romance_serial&page=1';

export const ridi_best20_rank_RF_webNovel =
  'https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/romance_fantasy_serial.json?genre=romance_fantasy_serial&page=1';

export const ridi_best20_rank_F_webNovel =
  ' https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/fantasy_serial.json?genre=fantasy_serial&page=1';

export const ridi_best20_rank_BL_webNovel =
  'https://ridibooks.com/_next/data/3.8.172-ecfb8c7/bestsellers/bl-webnovel.json?genre=bl-webnovel&page=1';

// 베스트 100 리디 웹툰 & 웹소설
export const ridi_best100_rank_webToon =
  ' https://api.ridibooks.com/v2/category/books?category_id=1600&tab=books&limit=60&platform=web&offset=0&order_by=review';

export const ridi_best100_rank_webNovel =
  'https://api.ridibooks.com/v2/category/books?category_id=1650&tab=books&limit=60&platform=web&offset=0&order_by=review';

//리뷰 공감순(10개)
export const get_reviews = 'https://ridibooks.com/books/load-reviews';

export const get_reviews20 =
  'https://ridibooks.com/books/load-reviews?book_id=3885025236&order=like&offset=10&buyer_only=true';
