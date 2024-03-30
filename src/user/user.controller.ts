import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //회원가입
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      const { password, confirmPassword } = createUserDto;
      if (password !== confirmPassword) {
        throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다.');
      }

      await this.userService.register(createUserDto);
      return res.status(201).send('회원가입되었습니다. 로그인해주세요.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //로그인
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    try {
      const token = await this.userService.login(loginDto);
      return res
        .status(201)
        .cookie('authorization', `Bearer ${token.accessToken}`)
        .send('로그인되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //로그아웃
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Res() res) {
    try {
      return res
        .status(200)
        .clearCookie('authorization')
        .send('로그아웃되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //마이페이지 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  async getMyInfo(@Req() req, @Res() res) {
    try {
      const { id } = req.user;
      const myInfo = await this.userService.getUserInfoById(id);
      return res.status(200).json({ data: myInfo });
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //회원정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('mypage/update')
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const { id } = req.user;
      await this.userService.updateMyInfo(id, updateUserDto);
      return res.status(201).send('회원정보 수정이 완료되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //회원 탈퇴
  @UseGuards(AuthGuard('jwt'))
  @Delete('mypage/leave')
  async leave(@Body() deleteUserDto: DeleteUserDto, @Req() req, @Res() res) {
    try {
      const { id } = req.user;

      await this.userService.leave(id, deleteUserDto);
      return res
        .status(200)
        .clearCookie('authorization')
        .send('회원탈퇴되었습니다. GoodBye!');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //타 유저 페이지 보기
  @Get(':id')
  async getUserInfo(@Param('id') id: number, @Res() res) {
    try {
      const userInfo = await this.userService.getUserInfoById(id);
      return res.status(200).json({ data: userInfo });
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }
}
