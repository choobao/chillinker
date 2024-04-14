import { Body, Controller, Get, Query, Render } from '@nestjs/common';
import { WebContentService } from './web-content.service';
import { ApiOperation } from '@nestjs/swagger';
import { ContentType } from './webContent.type';
import { SearchDto } from './dto/search.dto';
import { Response } from 'express';

@Controller()
export class WebContentController {
  constructor(private readonly webContentService: WebContentService) {}

  @ApiOperation({ summary: '메인' })
  @Get('main')
  @Render('main')
  async getBestWebContents() {
    const naverWebtoons = await this.webContentService.findBestWebContents(
      'naver',
      ContentType.WEBTOON,
    );
    const naverWebnovels = await this.webContentService.findBestWebContents(
      'naver',
      ContentType.WEBNOVEL,
    );
    const ridiWebtoons = await this.webContentService.findBestWebContents(
      'ridibooks',
      ContentType.WEBTOON,
    );
    const ridiWebnovels = await this.webContentService.findBestWebContents(
      'ridibooks',
      ContentType.WEBNOVEL,
    );
    const mrblueWebtoons = await this.webContentService.findBestWebContents(
      'mrblue',
      ContentType.WEBTOON,
    );
    const mrblueWebnovels = await this.webContentService.findBestWebContents(
      'mrblue',
      ContentType.WEBNOVEL,
    );
    const kakaoWebtoons = await this.webContentService.findBestWebContents(
      'kakao',
      ContentType.WEBTOON,
    );
    const kakaoWebnovels = await this.webContentService.findBestWebContents(
      'kakao',
      ContentType.WEBNOVEL,
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

  @Get('search')
  @Render('search')
  async search(@Query('query') query: string, @Query('type') type: string) {
    const keyword = query;
    const { webtoons, webnovels } =
      await this.webContentService.searchFromWebContents(keyword);
    const authors = await this.webContentService.searchFromAuthors(keyword);
    const users = await this.webContentService.searchFromUsers(keyword);
    const collections =
      await this.webContentService.searchFromCollections(keyword);
    // const collectionUser =
    //   await this.webContentService.collectionUser(collections);
    console.log(collections);
    if (type == 'webtoons') {
      return { type, keyword, webtoons };
    } else if (type == 'authors') {
      return { type, keyword, authors };
    } else if (type == 'users') {
      return { type, keyword, users };
    } else if (type == 'collections') {
      return { type, keyword, collections };
    } else {
      return { type, keyword, webnovels };
    }
  }
}
