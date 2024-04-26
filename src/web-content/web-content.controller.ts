import {
  Controller,
  Get,
  Query,
  Render,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { ApiOperation } from '@nestjs/swagger';
import { ContentType } from './webContent.type';
import { OptionalAuthGuard } from '../auth/optinal.authguard';

@Controller()
export class WebContentController {
  constructor(private readonly webContentService: WebContentService) {}

  @ApiOperation({ summary: '메인' })
  @UseGuards(OptionalAuthGuard)
  @Get('main')
  @Render('main')
  async getBestWebContents(@Req() req) {
    const naverWebtoons = await this.webContentService.findBestWebContents(
      'naver',
      ContentType.WEBTOON,
      req.user,
    );
    const naverWebnovels = await this.webContentService.findBestWebContents(
      'naver',
      ContentType.WEBNOVEL,
      req.user,
    );
    const ridiWebtoons = await this.webContentService.findBestWebContents(
      'ridibooks',
      ContentType.WEBTOON,
      req.user,
    );
    const ridiWebnovels = await this.webContentService.findBestWebContents(
      'ridibooks',
      ContentType.WEBNOVEL,
      req.user,
    );
    const mrblueWebtoons = await this.webContentService.findBestWebContents(
      'mrblue',
      ContentType.WEBTOON,
      req.user,
    );
    const mrblueWebnovels = await this.webContentService.findBestWebContents(
      'mrblue',
      ContentType.WEBNOVEL,
      req.user,
    );
    const kakaoWebtoons = await this.webContentService.findBestWebContents(
      'kakao',
      ContentType.WEBTOON,
      req.user,
    );
    const kakaoWebnovels = await this.webContentService.findBestWebContents(
      'kakao',
      ContentType.WEBNOVEL,
      req.user,
    );

    const bestlikeWebnovels = await this.webContentService.getBestLikesContents(
      '웹소설',
      req.user,
    );
    const bestlikeWebtoons = await this.webContentService.getBestLikesContents(
      '웹툰',
      req.user,
    );
    const bestReviewedWebnovels =
      await this.webContentService.getBestReviewCountContents(
        '웹소설',
        req.user,
      );
    const bestReviewedWebtoons =
      await this.webContentService.getBestReviewCountContents('웹툰', req.user);
    const bestCollectionedWebnovels =
      await this.webContentService.getBestCollectionContents(
        '웹소설',
        req.user,
      );
    const bestCollectionedWebtoons =
      await this.webContentService.getBestCollectionContents('웹툰', req.user);
    return {
      naverWebtoons,
      naverWebnovels,
      ridiWebtoons,
      ridiWebnovels,
      mrblueWebtoons,
      mrblueWebnovels,
      kakaoWebtoons,
      kakaoWebnovels,
      userInfo: this.webContentService.isAdult(req.user),
      bestlikeWebnovels,
      bestlikeWebtoons,
      bestReviewedWebnovels,
      bestReviewedWebtoons,
      bestCollectionedWebnovels,
      bestCollectionedWebtoons,
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get('search')
  @Render('search')
  async search(
    @Req() req,
    @Query('query') query: string,
    @Query('type') type: string,
  ) {
    const keyword = query.trim() === '' ? 'chillinker' : query.trim();

    const { webtoons, webnovels, userInfo } =
      (await this.webContentService.searchFromWebContents(keyword, req.user)) ??
      {};

    if (type == 'webtoons') {
      return { type, keyword, webtoons, userInfo };
    } else if (type == 'authors') {
      const authors = await this.webContentService.searchFromAuthors(
        keyword,
        req.user,
      );
      return { type, keyword, authors, userInfo };
    } else if (type == 'users') {
      const users = await this.webContentService.searchFromUsers(keyword);
      return { type, keyword, users };
    } else if (type == 'collections') {
      const collections =
        await this.webContentService.searchFromCollections(keyword);
      return { type, keyword, collections };
    } else if (type == 'ck') {
      const ck = await this.webContentService.searchFromKeywordCategory(
        keyword,
        req.user,
      );
      return { type, keyword, ck, userInfo };
    } else {
      return { type, keyword, webnovels, userInfo };
    }
  }
}
