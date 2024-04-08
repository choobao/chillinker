import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export enum PaginationDefault {
  PAGE_DEFAULT = 1,
  TAKE_DEFAULT = 10,
  SKIP_DEFAULT = 0,
}

//컨트롤러에서 쓸 놈
export class PaginationRequest {
  @Type(() => Number)
  @IsOptional()
  page?: number = PaginationDefault.PAGE_DEFAULT;

  @Type(() => Number)
  @IsOptional()
  take?: number = PaginationDefault.TAKE_DEFAULT;

  getSkip() {
    return (this.page - 1) * this.take || PaginationDefault.SKIP_DEFAULT;
  }

  getPage() {
    return this.page;
  }

  getTake() {
    return this.take;
  }
}

export class CReviewDto extends PaginationRequest {
  @Type(() => Number)
  web_contents_id: number;

  getContentsId() {
    return this.web_contents_id;
  }
}

//응답값은 이렇게 줄거임
export class PaginationResponse<T> {
  data: T[];
  meta: {
    page: number;
    take: number;
    totalCount: number;
    totalPage: number;
    hasNextPage: boolean;
  };

  constructor(pagenationBuilder: PaginationBuilder<T>) {
    this.data = pagenationBuilder._data;
    this.meta = {
      page: pagenationBuilder._page,
      take: pagenationBuilder._take,
      totalCount: pagenationBuilder._totalCount,
      totalPage: this.getTotalPage(
        pagenationBuilder._totalCount,
        pagenationBuilder._take,
      ),
      hasNextPage: this.getHasNextPage(
        pagenationBuilder._page,
        this.getTotalPage(
          pagenationBuilder._totalCount,
          pagenationBuilder._take,
        ),
      ),
    };
  }

  private getTotalPage(totalCount: number, take: number): number {
    return Math.ceil(totalCount / take);
  }

  private getHasNextPage(page: number, totalPage: number): boolean {
    return page < totalPage;
  }
}

export class PaginationBuilder<T> {
  //빌더패턴: 선택적으로 변수를 받아들이고 마지막에 통합 빌드해서 객체를 생성
  _data: T[];
  _page: number;
  _take: number;
  _totalCount: number;

  setData(data: T[]) {
    this._data = data;
    return this;
  }

  setPage(page: number) {
    this._page = page;
    return this;
  }

  setTake(take: number) {
    this._take = take;
    return this;
  }

  setTotalCount(totalCount: number) {
    this._totalCount = totalCount;
    return this;
  }

  build() {
    return new PaginationResponse(this);
  }
}

//reveiwService code
// async findAll(
//   pagenation: PaginationRequest,
// ): Promise<PaginationResponse<any>> {
//   const [data, count] = await this.chillinkerReviewsRepository.findAndCount({
//     skip: pagenation.getSkip(),
//     take: pagenation.getTake(),
//   });

//   return new PaginationBuilder()
//     .setData(data)
//     .setPage(pagenation.page)
//     .setTake(pagenation.take)
//     .setTotalCount(count)
//     .build();
// }

// async getCReviews(
//   pagenation: CReviewDto,
// ): Promise<PaginationResponse<C_reviews>> {
//   const reviews = await this.chillinkerReviewsRepository.findAndCount({
//     web_contents_id: pagenation.getContentsId(),
//     skip: pagenation.getSkip(),
//     take: pagenation.getTake(),
//   });
//   if (!reviews) {
//     throw new NotFoundException('작품에 작성된 리뷰가 존재하지 않습니다.');
//   }

//   const [data, count] = await this.chillinkerReviewsRepository.findAndCount({
//     skip: pagenation.getSkip(),
//     take: pagenation.getTake(),
//   });

//   //order은 등록순(recent,만들어진 최신순), 인기순(popular,좋아요순)필요
//   if (order == 'recent') {
//     const data = await this.chillinkerReviewsRepository.find({
//       where: { web_contents_id: webContentsId },
//       order: { created_at: 'desc' },
//       take: 10,
//       skip: (page - 1) * 10,
//     });

//     return new PaginationBuilder()
//       .setData(data)
//       .setPage(pagenation.page)
//       .setTake(pagenation.take)
//       .setTotalCount(count)
//       .build();

//     return {
//       data: [recentReviews],
//       meta: {
//         page, //현재페이지
//         take: 10, //한번에 가져올 데이터의 수
//         totalPage: 10, //총 페이지
//         hasNextPage: true, //다음 페이지가 존재하는가
//       },
//     };
//   } else {
//     const defaultReivews = await this.chillinkerReviewsRepository.find({
//       where: { web_contents_id: webContentsId },
//       order: { like_count: 'desc' },
//       take: 10,
//       skip: (page - 1) * 10,
//     });
//     return defaultReivews;
//   }
// }
