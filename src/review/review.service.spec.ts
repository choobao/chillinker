import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { Repository } from 'typeorm';
import { WebContents } from '../web-content/entities/webContents.entity';
import { PReviews } from './entities/platform.reviews.entity';
import { RedisService } from '../redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ReviewService', () => {
  let reviewService: ReviewService;
  let contentRepository: Partial<
    Record<keyof Repository<WebContents>, jest.Mock>
  >;
  let reviewRepository: Partial<Record<keyof Repository<PReviews>, jest.Mock>>;
  let redisService: RedisService;
  let configService: ConfigService;
  let jwtServiceMock: Partial<JwtService>;

  beforeEach(async () => {
    contentRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('test_jwt_token'),
    };

    //레디스와 configService도 넣기?
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(PReviews),
          useValue: reviewRepository,
        },
        {
          provide: getRepositoryToken(WebContents),
          useValue: contentRepository,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    reviewService = moduleRef.get<ReviewService>(ReviewService);
  });

  //리뷰 삭제 테스트 코드짜고싶다!!
  describe('deleteReivew', () => {
    //해당 리뷰가 있는지 확인하고

    //리뷰가 없으면 오류 띄우고
    it('should throw error if reivew does not exist', async () => {
      jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(null);

      //expect();
    });

    //요청 보낸사람이 리뷰 쓴사람이 맞는지 확인하고

    //아니면 권한없음 오류 띄우고

    //삭제하고

    //디비에도 존재하지않음을 확인해야함
  });
});
