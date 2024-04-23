import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['nickname', 'intro', 'birthDate']),
) {
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @ApiProperty({ example: 'Aaaa@1234', description: '비밀번호' })
  password: string;
}
