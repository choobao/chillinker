import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateColDto {
  @IsString()
  @IsNotEmpty({ message: '컬렉션 제목을 입력해주세요.' })
  @ApiProperty({ example: '칠링커 컬렉션', description: '컬렉션 제목' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '컬렉션 설명을 입력해주세요.' })
  @ApiProperty({
    example: '칠링커의 두번째 컬렉션입니다.',
    description: '컬렉션 설명',
  })
  desc: string;

  @IsOptional()
  @IsInt({ message: '컨텐츠 아이디를 숫자로 입력해주세요.' })
  @ApiProperty({ example: '1', description: '웹컨텐츠 아이디' })
  webContentId?: number;
}
