import { IsInt, IsString, Length, Min, Max, Matches } from 'class-validator';

export class SearchDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]+$/, {
    message: '검색어는 숫자, 영문, 한글만 포함할 수 있습니다.',
  })
  @Length(1, 50)
  keyword: string;
}
