import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['nickname', 'intro']),
) {
  // @IsString()
  // @MinLength(6)
  // @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  // password: string;
}
