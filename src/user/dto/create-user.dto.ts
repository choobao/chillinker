import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @IsString()
  @IsStrongPassword(
    {},
    {
      message:
        '비밀번호는 영문 알파벳 대,소문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.',
    },
  )
  @MinLength(8, { message: '비밀번호는 6글자 이상이어야합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password: string;

  @IsString()
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
