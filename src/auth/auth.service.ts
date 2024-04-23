import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) return null;
    return user;
  }

  async createToken(email: string) {
    const user = await this.userService.findUserByEmail(email);

    const payload = { user };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '12h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_KEY,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  //   async OAuthLogin({ req, res }) {
  //     const url =
  //       'https://accounts.google.com/o/oauth2/v2/auth?client_id=' +
  //       process.env.GOOGLE_CLIENT_ID +
  //       '&redirect_uri=' +
  //       process.env.GOOGLE_CALLBACK_URL +
  //       '&response_type=code' +
  //       '&scope=email profile';

  //     let user = await this.userService.findUserByEmail(req.user.email);
  //     if (!user) {
  //       await this.userService.register(this.file, { ...req.user });
  //       user = await this.userService.findUserByEmail(req.user.email);
  //     }

  //     this.userService.login({ email: user.email, password: user.password });
  //     res.redirect();
  //   }
}
