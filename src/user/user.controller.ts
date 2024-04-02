import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { UserInfo } from 'utils/userinfo.decorator';
import { Users } from './entities/user.entity';

@ApiTags('USER')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post('register')
  @HttpCode(201)
  async register(@Body() createUserDto: CreateUserDto) {
    const { password, confirmPassword } = createUserDto;
    if (password !== confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호확인이 다릅니다.');
    }

    return await this.userService.register(createUserDto);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const tokens = await this.userService.login(loginDto);
    return res
      .cookie('accessToken', `Bearer ${tokens.accessToken}`)
      .cookie('refreshToken', `Bearer ${tokens.refreshToken}`)
      .end();
  }

  @ApiOperation({ summary: 'AccessToken 재발급' })
  @Post('refresh')
  async renewAccessToken(@Req() req, @Res() res) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    const [tokenType, token] = refreshToken.split(' ');
    const newToken = (await this.userService.renewAccessToken(token))
      .accessToken;
    return res.cookie('accessToken', `Bearer ${newToken}`).end();
  }

  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Res() res) {
    return res.clearCookie('accessToken').clearCookie('refreshToken').end();
  }

  @ApiOperation({ summary: '마이페이지 조회' })
  @UseGuards(AuthGuard('jwt'))
  @Get('mypage')
  async getMyInfo(@UserInfo() user: Users) {
    const { id } = user;
    return await this.userService.getUserInfoById(id);
  }

  @ApiOperation({ summary: '회원 정보 수정' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('mypage/update')
  async updateMyInfo(
    @Body() updateUserDto: UpdateUserDto,
    @UserInfo() user: Users,
  ) {
    const { id } = user;
    await this.userService.updateMyInfo(id, updateUserDto);
  }

  @ApiOperation({ summary: '회원탈퇴' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('mypage/leave')
  @HttpCode(204)
  async leave(
    @Body() deleteUserDto: DeleteUserDto,
    @UserInfo() user: Users,
    @Res() res,
  ) {
    const { id } = user;

    await this.userService.leave(id, deleteUserDto);
    return res.clearCookie('accessToken').clearCookie('refreshToken').end();
  }

  @ApiOperation({ summary: '타 유저 페이지 조회' })
  @Get(':id')
  async getUserInfo(@Param('id') id: number) {
    return await this.userService.getUserInfoById(id);
  }
}
