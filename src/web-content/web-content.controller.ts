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
    };
  }

  // @Get('search')
  // @Render('search')
  // async search(@Body() searchDto: SearchDto) {
  //   const keyword = searchDto.keyword;
  //   const users = await this.webContentService.searchFromUsers(keyword);
  //   const collections =
  //     await this.webContentService.searchFromCollections(keyword);
  //   const { webnovels, webtoons } =
  //     await this.webContentService.searchFromWebContents(keyword);
  //   const authors = await this.webContentService.searchFromAuthors(keyword);

  //   return { users, collections, webnovels, webtoons, authors };
  // }

  @UseGuards(OptionalAuthGuard)
  @Get('search')
  // @Render('search')
  async search(
    @Req() req,
    @Query('query') query: string,
    @Query('type') type: string,
  ) {
    const regex = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+$/;

    const keyword = regex.test(query)
      ? query
      : query.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, '') || 'chillinker';

    const { webtoons, webnovels, userInfo } =
      (await this.webContentService.searchFromWebContents(keyword, req.user)) ??
      {};

    if (type == 'webtoons') {
      return { type, keyword, webtoons, userInfo };
    } else if (type == 'authors') {
      const authors = await this.webContentService.searchFromAuthors(keyword);
      return { type, keyword, authors };
    } else if (type == 'users') {
      const users = await this.webContentService.searchFromUsers(keyword);
      return { type, keyword, users };
    } else if (type == 'collections') {
      const collections =
        await this.webContentService.searchFromCollections(keyword);
      return { type, keyword, collections };
    } else if (type == 'ck') {
      await this.webContentService.searchFromKeywordCategory(keyword, req.user);
    } else {
      return { type, keyword, webnovels, userInfo };
    }
  }
}
