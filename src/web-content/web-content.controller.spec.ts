import { Test, TestingModule } from '@nestjs/testing';
import { WebContentController } from './web-content.controller';

describe('WebContentController', () => {
  let controller: WebContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebContentController],
    }).compile();

    controller = module.get<WebContentController>(WebContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
