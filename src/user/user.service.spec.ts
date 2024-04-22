import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Users } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StorageService } from '../storage/storage.service';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserService', () => {
  let userRepository: Partial<Record<keyof Repository<Users>, jest.Mock>>;
  let userService: UserService;
  let configService: ConfigService;
  let jwtService: JwtService;
  let storageService: StorageService;

  interface DataSource {
    createQueryRunner: () => any;
  }

  let dataSourceMock: DataSource;

  beforeEach(async () => {
    dataSourceMock = {
      createQueryRunner: jest.fn().mockImplementation(() => ({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        release: jest.fn(),
        rollbackTransaction: jest.fn(),
        manager: {
          SoftDelete: jest.fn(),
          update: jest.fn(),
        },
      })),
    };

    userRepository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(Users), useValue: userRepository },
      ],
    }).compile();
    userService = moduleRef.get<UserService>(UserService);
  });

  describe('유저 정보 변경', () => {
    const mockUser = {
      id: 1,
      email: 'aaaa1234@gmail.com',
      password: 'hashedPassword',
      nickname: '오이',
      intro: '오이샌드위치',
      profileimage: 'https://www.wonder.jpg',
    } as unknown as Users;

    const updateUserDto = {
      password: 'hashedPassword',
      nickname: '파인애플',
      intro: '파인애플피자',
    } as unknown as UpdateUserDto;

    const updatedUser = {
      id: 1,
      email: 'aaaa1234@gmail.com',
      password: 'hashedPassword',
      nickname: '파인애플',
      intro: '파인애플피자',
      profileimage: 'https://www.wonder.jpg',
    } as unknown as Users;

    it('수정정보를 입력하면 유저정보를 수정해줌.', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updateUserDto);

      await userService.updateMyInfo(null, mockUser.id, updateUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        {
          nickname: mockUser.nickname,
          intro: mockUser.intro,
          profileImage: null,
        },
      );

      userRepository.findOne.mockResolvedValue(updatedUser);
    });
  });

  describe('이메일로 유저 조회', () => {
    const user = {
      id: 1,
      email: 'aaaa1234@gmail.com',
      nickname: '오이',
      intro: '오이샌드위치',
      profileimage: 'https://www.wonder.jpg',
    } as unknown as Users;

    //유저가 존재하지 않으면 오류
    // it('유저가 존재하지 않으면 오류남.', async () => {
    //   userRepository.findOneBy.mockRejectedValue(null);
    //   expect(userService.findUserByEmail(email: user.email)).rejects.toThrow();
    // });

    it('성공적 조회', async () => {
      userRepository.findOneBy.mockResolvedValue({ email: user.email });

      const result = await userService.findUserByEmail(user.email);

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(result).toEqual(user);
    });
  });

  describe('아이디로 유저정보 조회', () => {
    const user = {
      id: 1,
      email: 'aaaa1234@gmail.com',
      nickname: '오이',
      intro: '오이샌드위치',
      profileimage: 'https://www.wonder.jpg',
    } as unknown as Users;

    //유저가 존재하지 않으면 오류
    // it('유저가 존재하지 않으면 오류남.', async () => {
    //   userRepository.findOneBy.mockRejectedValue(null);
    //   expect(userService.getUserInfoById(id: user.id)).rejects.toThrow();
    // });

    it('유저정보 성공적 조회', async () => {
      userRepository.findOneBy.mockResolvedValue({ id: user.id });

      const result = await userService.getUserInfoById(user.id);

      expect(userRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
      expect(result).toEqual(user);
    });
  });

  // describe('유저 삭제', () => {
  //   const user = {
  //     id: 1,
  //     email: 'aaaa1234@gmail.com',
  //     nickname: '오이',
  //     intro: '오이샌드위치',
  //     profileimage: 'https://www.sdjfd.jpg',
  //   } as unknown as Users;

  //   it('삭제 성공함', async () => {
  //     userRepository.findOneBy.mockResolvedValue(user.id);
  //   });
  // });

  // describe('회원가입', () => {});

  // describe('로그인', () => {});

  // describe('리프레시토큰으로 엑세스토큰 갱신', () => {});
});
