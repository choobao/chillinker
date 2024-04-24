import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AxiosResInterceptor {
  private readonly appClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.appClient = axios.create({
      baseURL: this.configService.get<string>('BASE_URL'),
    });

    this.initializeResponseInterceptor();
  }

  private initializeResponseInterceptor() {
    this.appClient.interceptors.response.use(
      (response) => {
        // 응답 데이터를 가공하여 반환
        return response;
      },
      (error) => {
        // 오류 응답을 처리
        if (
          error.response &&
          (error.response.status === 401 || error.message === 'jwt expired')
        ) {
          return Promise.reject({
            message: 'Unauthorized - Please log out',
            logout: true,
          });
        }
        // 오류를 반드시 반환하거나 또는 Promise.reject를 사용하여 처리
        return Promise.reject(error);
      },
    );
  }
}
