import { Test, TestingModule } from '@nestjs/testing';
import { BogosipService } from './bogosip.service';

describe('BogosipService', () => {
  let service: BogosipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BogosipService],
    }).compile();

    service = module.get<BogosipService>(BogosipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
