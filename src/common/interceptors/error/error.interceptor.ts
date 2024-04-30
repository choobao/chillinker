import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const err = { message: error.message, code: error.getStatus() };
        response.render('error.ejs', { err });
        return throwError(() => new Error('handled by error interceptor!'));
      }),
    );
  }
}
