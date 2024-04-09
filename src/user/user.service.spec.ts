import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Users } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    UpdateQueryBuilder: jest.fn(),
    SoftDeleteQueryBuilder: jest.fn(),
  };

  const user = {
    id: 1,
    email: 'aaaa1234@gmail.com',
    password: 'hashedPassword',
    nickname: '오이',
    confirmPassword: 'hashedPassword',
    intro: '오이샌드위치',
    profileimage: 'https://www.sdjfd.jpg',
  };

  const update = {
    id: 2,
    email: 'aaaa1234@gmail.com',
    password: 'hashedPassword',
    nickname: '파인애플',
    intro: '파인애플피자',
    profileimage: 'https://www.sdjfd.jpg',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('유저 조회', () => {
    it('성공적 조회', async () => {
      const user = {
        id: 1,
        email: 'aaaa1234@gmail.com',
        nickname: '오이',
        intro: '오이샌드위치',
        profileimage: 'https://www.sdjfd.jpg',
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findUserByEmail(user.email);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(result).toEqual(user);
    });
  });

  describe('유저 업데이트', () => {
    it('업데이트 성공함', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user.id);
      mockUserRepository.update.mockResolvedValue(user);

      await expect(
        service.updateMyInfo(user.id, update),
      ).resolves.not.toThrow();

      expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, {
        nickname: update.nickname,
        intro: update.intro,
        profileImage: update.profileimage,
      });
    });
  });

  describe('유저 삭제', () => {
    it('삭제 성공함', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(user.id);
      mockUserRepository.SoftDeleteQueryBuilder.mockResolvedValue(user);

      await expect(service.leave(user.id, user)).resolves.not.toThrow();

      expect(mockUserRepository.SoftDeleteQueryBuilder).toHaveBeenCalledTimes(
        1,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
      expect(mockUserRepository.SoftDeleteQueryBuilder).toHaveBeenCalledWith(
        user.id,
        user,
      );
    });
  });
});
