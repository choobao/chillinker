import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty({ message: '비밀번호 확인을 입력해주세요.' })
  confirmPassword: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  nickname: string;

  @IsString()
  @IsOptional()
  intro: string;

  @IsString()
  @IsOptional()
  profileImage: string;
}
