import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage/storage.service';
import { AdultVerifyDto } from './dto/adult-verify.dto';
import { UserAdultVerifyRequest } from './entities/user.adult-verify.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(UserAdultVerifyRequest)
    private userAdultVerifyRepository: Repository<UserAdultVerifyRequest>,
  ) {}

  async register(file: Express.Multer.File, createUserDto: CreateUserDto) {
    const { email, password, nickname, intro, birthDate } = createUserDto;

    const existingtUser = await this.findUserByEmail(email);
    if (existingtUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입한 사용자가 있습니다.',
      );
    }

    const hashedPassword = await hash(password, 10);

    let profileImage = null;
    if (file) {
      //이미지 업로드
      profileImage = await this.storageService.upload(file);
    }

    await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
      intro,
      profileImage,
      birthDate,
    });

    return { message: '회원가입되었습니다. 로그인해주세요!' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });

    if (_.isNil(user)) {
      throw new NotFoundException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const payload = { email, id: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(
        { email: payload.email, id: payload.id },
        {
          secret: this.configService.get<string>('JWT_REFRESH_KEY'),
          expiresIn: '7d',
        },
      ),
    };
  }

  async renewAccessToken(token: string) {
    const refreshTokenData = await this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_REFRESH_KEY'),
    });
    const payload = { email: refreshTokenData.email, id: refreshTokenData.id };
    const newAccessToken = this.jwtService.sign(payload);
    return { accessToken: newAccessToken };
  }

  async getUserInfoById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['followings', 'followers'],
    });

    if (!user) {
      throw new NotFoundException('해당회원을 찾을 수 없습니다.');
    }
    return { user };
  }

  async updateMyInfo(
    file: Express.Multer.File,
    id: number,
    updateUserDto: UpdateUserDto,
  ) {
    const { nickname, intro, birthDate } = updateUserDto;

    if (!nickname && !intro) {
      throw new BadRequestException('수정할 것을 입력해주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['profileImage', 'birthDate'],
    });

    let profileImage = user.profileImage;
    if (file) {
      //이미지 업로드
      profileImage = await this.storageService.upload(file);
      if (user.profileImage) {
        await this.storageService.delete(user.profileImage);
      }
    }

    await this.userRepository.update(id, {
      nickname,
      intro,
      profileImage,
      birthDate,
    });
  }

  async leave(id: number, deleteUserDto: DeleteUserDto) {
    const { password } = deleteUserDto;

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['email', 'password', 'profileImage'],
    });

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const deletedUserEmail = `${user.email}_deleted_${Date.now()}`;

      if (user.profileImage) {
        await this.storageService.delete(user.profileImage);
      }

      await queryRunner.manager.update(Users, id, { email: deletedUserEmail });
      await queryRunner.manager.softDelete(Users, { id });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('트랜잭션 중 오류발생');
    } finally {
      await queryRunner.release();
    }
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async sendAdultVerifyRequest(
    userId: number,
    file: Express.Multer.File,
    adultVerifyDto: AdultVerifyDto,
  ) {
    try {
      if (_.isNil(file)) {
        throw new BadRequestException('사진을 첨부해주세요.');
      }
      const existingVerifyRequest =
        await this.userAdultVerifyRepository.findOneBy({ userId });
      if (!_.isNil(existingVerifyRequest)) {
        throw new ConflictException('이미 성인인증을 요청하셨습니다.');
      }

      const { birthDate } = adultVerifyDto;
      const registrationCardImage = await this.storageService.upload(file);
      await this.userAdultVerifyRepository.save({
        userId,
        registrationCardImage,
        birthDate,
      });
    } catch (err) {
      throw err;
    }
  }
}
