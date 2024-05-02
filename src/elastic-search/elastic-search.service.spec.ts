import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearchService } from './elastic-search.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { Repository } from 'typeorm';

describe('ElasticSearchService', () => {
  let service: ElasticSearchService;
  let webContentRepository: Partial<
    Record<keyof Repository<WebContents>, jest.Mock>
  >;
  let client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticSearchService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WebContents),
          useValue: webContentRepository,
        },
      ],
    }).compile();

    service = module.get<ElasticSearchService>(ElasticSearchService);
    client = service.getClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getInfo test', async () => {
    
  })

});
