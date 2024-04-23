import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    try {
      console.log(profile);
      const email = profile._json && profile._json.kakao_account.email;
      const nickname = profile.displayName;
      const provider = profile.provider;
      let user = await this.userService.findUserByEmail(email);
      if (!user) {
        user = await this.userService.createProviderUser(
          email,
          nickname,
          provider,
        );
      }
      //createProviderUser
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

// export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
//   constructor() {
//     super({
//       clientID: process.env.KAKAO_CLIENT_ID, //.env파일에 들어있음
//       clientSecret: process.env.KAKAO_CLIENT_SECRET, //.env파일에 들어있음
//       callbackURL: process.env.KAKAO_CALLBACK_URL, //.env파일에 들어있음
//       scope: ['account_email', 'profile_nickname'],
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
