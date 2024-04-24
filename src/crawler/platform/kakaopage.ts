import axios from 'axios';
import { ContentType } from '../../web-content/webContent.type';
import {
  ReviewSortType,
  Type,
  kakao_api_url,
  webContent_all_query,
  webcontent_keyword_query,
  webcontent_query,
  webcontent_ranking_daily_query,
  webcontent_review_query,
} from '../utils/kakaopage.constants';

class KakaopageAxios {
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
      const desc = webContent.description;
      const image = `https:${webContent.thumbnail}`;
      const contentType =
        webContent.category === '웹툰'
          ? ContentType.WEBTOON
          : ContentType.WEBNOVEL;
      const category = webContent.subcategory;
      //const author = webContent.authors;
      const isAdult = webContent.ageGrade === 'Nineteen' ? 1 : 0;
      const pubDate = new Date(webContent.startSaleDt);

      const { author, keyword } =
        await this.requestWebContentKeywordsAndRecommends(id);

      let reviewCount = webContent.serviceProperty.commentCount;
      reviewCount = reviewCount > 30 ? 30 : reviewCount;

      let reviewList = [];
      const pageCount = Math.ceil(reviewCount / 25); // 한 페이지당 25개 리뷰 존재할때 필요한 페이지 수
      for (let i = 1; i <= pageCount; i++) {
        const reviews = await this.requestWebContentReviews(id, i);
        reviewList = reviewList.concat(reviews);
      }

      const reviewMap = new Map();
      reviewList.forEach((review) => {
        const uniqueKey = `${review.writer}_${review.createDate}_${review.likeCount}`;
        if (!reviewMap.has(uniqueKey)) {
          reviewMap.set(uniqueKey, review);
        }
      });

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
        pReviews: Array.from(reviewMap.values()),
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
      const authors = data.data.contentHomeInfo.about.authorList.map(
        (author) => {
          if (author.role === 'writer') {
            return `author/${author.name}`;
          } else {
            return `${author.role}/${author.name}`;
          }
        },
      );

      const author = JSON.stringify(authors)
        .replace(/\[|\]|\"|\"/g, '')
        .replace(/author\/([^,]+),illustrator\/\1/g, 'Author/$1');

      const keyword = data.data.contentHomeInfo.about.themeKeywordList.map(
        (item) => item.title,
      );

      // const keyword = JSON.stringify(keywords)
      //   .replace(/\[|\]|\"|\"/g, '')
      //   .replace(/\,/g, ', ');

      // const recommends = data.data.contentHomeInfo.recommend.list.items; // 나중에 쓰일지도
      return { keyword, author };
    } catch (err) {
      throw err;
    }
  }

  // 작품의 댓글 정보 요청(한 페이지당 25개씩)
  async requestWebContentReviews(
    id: number,
    page: number,
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
        createDate: comment.createDt,
      }));
      return reviews;
    } catch (err) {
      throw err;
    }
  }

  async getDailyRank_20_WebContents(contentType: Type) {
    const items = await this.requestDailyRanking(contentType);
    const ids = items.slice(0, 20).map((item) => ({
      id: +item.eventLog.eventMeta.series_id,
      rank: +item.rank,
    }));

    const webContentList = [];
    for (const { id, rank } of ids) {
      const webContent = await this.requestWebContent(id);
      webContentList.push({ ...webContent, rank: { kakao: rank } });
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
}

export default KakaopageAxios;
