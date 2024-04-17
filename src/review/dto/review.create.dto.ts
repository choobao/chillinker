import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCReviewsDto {
  @IsString()
  @IsNotEmpty({ message: '댓글내용을 입력해주세요.' })
  @ApiProperty({ example: '갓작입니다.', description: '댓글 내용' })
  content: string;

  @IsNotEmpty({ message: '별점을 입력해주세요.' })
  @ApiProperty({ example: '5', description: '별점' })
  rate: number;

  @IsBoolean()
  @ApiProperty({ example: 'true', description: '스포일러 체크' })
  isSpoiler?: boolean;
}
