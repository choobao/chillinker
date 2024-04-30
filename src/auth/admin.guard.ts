import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import _ from 'lodash';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context, status) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          '이 기능을 사용하기 위해서 로그인이 필요합니다.',
        )
      );
    } else if (!user.isAdmin) {
      throw new UnauthorizedException('관리자만 이용할 수 있는 기능입니다.');
    }
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
