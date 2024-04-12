import { Test, TestingModule } from '@nestjs/testing';
import { BogosipController } from './bogosip.controller';

describe('BogosipController', () => {
  let controller: BogosipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BogosipController],
    }).compile();

    controller = module.get<BogosipController>(BogosipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
