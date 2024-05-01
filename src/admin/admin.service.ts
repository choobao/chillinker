import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageService } from '../storage/storage.service';
import { UserAdultVerifyRequest } from '../user/entities/user.adult-verify.entity';
import { Users } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class AdminService {
  constructor(
    private readonly storageService: StorageService,
    @InjectRepository(UserAdultVerifyRequest)
    private userAdultVerifyRepository: Repository<UserAdultVerifyRequest>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async getAllAdultVerifyRequest() {
    return { requests: await this.userAdultVerifyRepository.find() };
  }

  async acceptAdultVerifyRequest(id: number) {
    try {
      const request = await this.userAdultVerifyRepository.findOneBy({ id });
      if (_.isNil(request)) {
        throw new ConflictException('존재하지 않는 요청입니다.');
      }

      const user = await this.userRepository.findOneBy({ id: request.userId });
      if (_.isNil(user)) {
        throw new ConflictException('존재하지 않는 사용자입니다.');
      }

      await this.userRepository.update(
        { id: request.userId },
        { birthDate: request.birthDate },
      );

      await this.storageService.delete(request.registrationCardImage);

      await this.userAdultVerifyRepository.delete(id);

      return { message: '성공적으로 성인 인증 처리 되었습니다.' };
    } catch (err) {
      throw err;
    }
  }
}
