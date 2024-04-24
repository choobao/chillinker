import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearchService } from './elastic-search.service';

describe('ElasticSearchService', () => {
  let service: ElasticSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticSearchService],
    }).compile();

    service = module.get<ElasticSearchService>(ElasticSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
