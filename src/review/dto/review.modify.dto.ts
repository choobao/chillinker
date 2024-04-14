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

export class ModifyCReviewsDto {
  @IsString()
  @IsNotEmpty({ message: '수정할 댓글내용을 입력해주세요.' })
  @ApiProperty({ example: '생각해보니 별로네요.', description: '댓글 내용' })
  content: string;

  @IsInt({ message: '별점은 정수로 입력해주세요.' })
  @Min(1, { message: '별점은 1 이상부터 입력 가능합니다.' })
  @Max(5, { message: '별점은 5 이하까지 입력 가능합니다.' })
  @IsNotEmpty({ message: '수정할 별점을 입력해주세요.' })
  @ApiProperty({ example: '1', description: '별점' })
  rate: number;

  @IsBoolean()
  @ApiProperty({ example: false, description: '스포일러 체크' })
  isSpoiler?: boolean;
}
