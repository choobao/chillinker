import { Test, TestingModule } from '@nestjs/testing';
import { WebContentService } from './web-content.service';
import { Repository } from 'typeorm';
import { WebContents } from './entities/webContents.entity';
import { Users } from '../user/entities/user.entity';
import { Collections } from '../collection/entities/collections.entity';

describe('WebContentService', () => {
  let service: WebContentService;
  let webContentRepository: Partial<Record<keyof Repository<WebContents>, jest.Mock>>;
  let userRepository: Partial<Record<keyof Repository<Users>, jest.Mock>>;
  let collectionRepository: Partial<Record<keyof Repository<Collections>, jest.Mock>>;  

  beforeEach(async () => {
    webContentRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect:jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockReturnValue([]),
        getMany: jest.fn().mockReturnValue([])
      })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [WebContentService],
    }).compile();

    service = module.get<WebContentService>(WebContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
