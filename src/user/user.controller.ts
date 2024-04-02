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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //회원가입
  @ApiOperation({ summary: '회원가입' })
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
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    try {
      const tokens = await this.userService.login(loginDto);
      return res
        .status(201)
        .cookie('accessToken', `Bearer ${tokens.accessToken}`)
        .cookie('refreshToken', `Bearer ${tokens.refreshToken}`)
        .send('로그인되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //AccessToken 재발급
  @ApiOperation({ summary: 'AccessToken 재발급' })
  @Post('refresh')
  async renewAccessToken(@Req() req, @Res() res) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        throw new UnauthorizedException('로그인이 필요합니다.');
      }

      const [tokenType, token] = refreshToken.split(' ');
      const newToken = (await this.userService.renewAccessToken(token))
        .accessToken;
      return res
        .status(200)
        .cookie('accessToken', `Bearer ${newToken}`)
        .send('accessToken이 성공적으로 갱신되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //로그아웃
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(AuthGuard('jwt')) //필요할까요? 이미 지난 AT나 RT를 가지고있을텐데...
  @Post('logout')
  async logout(@Res() res) {
    try {
      return res
        .status(200)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .send('로그아웃되었습니다.');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //마이페이지 조회
  @ApiOperation({ summary: '마이페이지 조회' })
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

  //회원 정보 수정
  @ApiOperation({ summary: '회원 정보 수정' })
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

  //회원탈퇴
  @ApiOperation({ summary: '회원탈퇴' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('mypage/leave')
  async leave(@Body() deleteUserDto: DeleteUserDto, @Req() req, @Res() res) {
    try {
      const { id } = req.user;

      await this.userService.leave(id, deleteUserDto);
      return res
        .status(200)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .send('회원탈퇴되었습니다. GoodBye!');
    } catch (err) {
      console.error(err);
      return res.status(err.status).send(`${err}`);
    }
  }

  //타 유저 페이지 조회
  @ApiOperation({ summary: '타 유저 페이지 조회' })
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
