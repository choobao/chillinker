import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { GoogleGuard } from './guard/google.guard';
import { NaverGuard } from './guard/naver.guard';
import { KakaoGuard } from './guard/kakao.guard';

// interface IOAuthUser {
//   user: {
//     nickname: string;
//     email: string;
//     password: string;
//   };
// }

@Controller('oauth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  //구글 로그인
  @Get('/google') //엔드포인트는 /login/google
  @UseGuards(GoogleGuard) //인증과정을 거쳐야하기때문에 UseGuards를 써주고 passport인증으로 AuthGuard를 써준다. 이름은 google로
  redirectToGoogleAuth(@Res() res) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleRedirectUri = process.env.GOOGLE_CALLBACK_URL;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${googleRedirectUri}`;
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, googleAuthUrl);
  }

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleCallbacks(@Req() req, @Res() res) {
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;
    res
      .cookie('accessToken', `Bearer ${accessToken}`)
      .cookie('refreshToken', `Bearer ${refreshToken}`)
      .redirect('/main');
  }

  //   async loginGoogle(@Req() req: Request & IOAuthUser, @Res() res: Response) {
  //     //프로필을 받아온 다음, 로그인 처리해야하는 곳(auth.service.ts에서 선언해준다)
  //     this.authService.OAuthLogin({ req, res });
  //   }

  //네이버 로그인
  @Get('/naver')
  @UseGuards(NaverGuard)
  redirectToNaverAuth(@Res() res) {
    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverRedirectUri = process.env.NAVER_CALLBACK_URL;
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverRedirectUri}&state=hLiDdL2uhPtsftcU`;
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, naverAuthUrl);
  }

  @UseGuards(NaverGuard)
  @Get('/naver/callback')
  async naverCallbacks(@Req() req, @Res() res) {
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;
    res
      .cookie('accessToken', `Bearer ${accessToken}`)
      .cookie('refreshToken', `Bearer ${refreshToken}`)
      .redirect('/main');
  }

  //   async loginNaver(@Req() req: Request & IOAuthUser, @Res() res: Response) {
  //     this.authService.OAuthLogin({ req, res });
  //   }

  //카카오 로그인
  @Get('/kakao')
  @UseGuards(KakaoGuard)
  redirectToKakaoAuth(@Res() res) {
    const kakaoClientId = process.env.KAKAO_CLIENT_ID;
    const kakaoRedirectUri = process.env.KAKAO_CALLBACK_URL;
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${kakaoRedirectUri}`;
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, kakaoAuthUrl);
  }

  @UseGuards(KakaoGuard)
  @Get('/kakao/callback')
  async kakaoCallbacks(@Req() req, @Res() res) {
    const accessToken = req.user.accessToken;
    const refreshToken = req.user.refreshToken;
    res
      .cookie('accessToken', `Bearer ${accessToken}`)
      .cookie('refreshToken', `Bearer ${refreshToken}`)
      .redirect('/main');
  }
  //   async loginKakao(@Req() req: Request & IOAuthUser, @Res() res: Response) {
  //     this.authService.OAuthLogin({ req, res });
  //   }
}
