import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  @ApiProperty({ example: 'aaaa1234@gmail.com', description: '이메일' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/, {
    message:
      '비밀번호는 영어 알파벳과 숫자를 포함하며, 최소 8자 이상이어야 합니다.',
  })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @ApiProperty({ example: 'Aaaa@1234', description: '비밀번호' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  @ApiProperty({ example: 'Aaaa@1234', description: '비밀번호확인' })
  confirmPassword: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @ApiProperty({ example: '사과', description: '닉네임' })
  nickname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '갤럭시 씁니다.', description: '소개' })
  intro: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2000-01-01', description: '생년월일' })
  birthDate: string;
}
