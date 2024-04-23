import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver-v2';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: any,
  ) {
    try {
      const email = profile.email;
      const nickname = profile.nickname;
      const provider = 'naver';

      let user = await this.userService.findUserByEmail(email);
      if (!user) {
        user = await this.userService.createProviderUser(
          email,
          nickname,
          provider,
        );
      }

      const token = await this.authService.createToken(email);
      const accessToken = token.accessToken;
      const refreshToken = token.refreshToken;

      done(null, { accessToken, refreshToken });
    } catch (error) {
      console.error('인증 처리 중 오류 발생:', error);
      done(error, false);
    }
  }
}

// export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
//   constructor() {
//     super({
//       clientID: process.env.NAVER_CLIENT_ID, //.env파일에 들어있음
//       clientSecret: process.env.NAVER_CLIENT_SECRET, //.env파일에 들어있음
//       callbackURL: process.env.NAVER_CALLBACK_URL, //.env파일에 들어있음
//       scope: ['email', 'profile'],
//     });
//   }

//   validate(accessToken, refreshToken, profile) {
//     return {
//       name: profile.displayName,
//       email: profile.email[0].value,
//       hashedPassword: '1234',
//     };
//   }
// }
