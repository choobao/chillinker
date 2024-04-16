import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColDto {
  @IsString()
  @IsNotEmpty({ message: '컬렉션 제목을 입력해주세요.' })
  @ApiProperty({ example: '회빙환 컬렉션', description: '컬렉션 제목' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '컬렉션 설명을 입력해주세요.' })
  @ApiProperty({
    example: '회빙환의 첫번째 컬렉션입니다.',
    description: '컬렉션 설명',
  })
  desc: string;
}
