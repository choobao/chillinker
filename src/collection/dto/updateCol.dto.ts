import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateColDto {
  @IsString()
  @IsNotEmpty({ message: '컬렉션 제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '컬렉션 설명을 입력해주세요.' })
  desc: string;

  @IsOptional()
  @IsInt({ message: '컨텐츠 아이디를 숫자로 입력해주세요.' })
  webContentId?: number;

  @IsOptional()
  @IsInt({ message: '컨텐츠 아이디를 숫자로 입력해주세요.' })
  removeWebContentId?: number;
}
