import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearchController } from './elastic-search.controller';

describe('ElasticSearchController', () => {
  let controller: ElasticSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElasticSearchController],
    }).compile();

    controller = module.get<ElasticSearchController>(ElasticSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
