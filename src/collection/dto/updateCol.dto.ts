import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateColDto {
  @IsString()
  @IsNotEmpty({ message: '컬렉션 제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '컬렉션 설명을 입력해주세요.' })
  desc: string;

  // 추후 웹컨텐츠 코드 보고 관련 내용 추가(웹컨텐츠 추가, 삭제 등)
}
