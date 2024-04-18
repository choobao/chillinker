import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { ContentType } from '../webContent.type';
import { PReviews } from '../../review/entities/platform.reviews.entity';
import { CReviews } from '../../review/entities/chillinker.reviews.entity';
import { ContentCollection } from '../../collection/entities/content-collections.entity';
import { Likes } from '../../like/entities/likes.entity';

@Entity('web_contents')
export class WebContents {
  /**
   * id
   * @example 1
   */
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * contentType
   * @example "웹소설"
   */
  @IsEnum(ContentType)
  @Column({ type: 'enum', enum: ContentType })
  contentType: ContentType;

  /**
   * title
   * @example "화산귀환"
   */
  @IsString()
  @Column({ type: 'varchar', length: 100 })
  title: string;

  /**
   * desc
   * @example "대 화산파 13대 제자. 천하삼대검수(天下三代劍手). 매화검존(梅花劍尊) 청명(靑明) 천하를 혼란에 빠뜨린 고금제일마 천마(天魔)의 목을 치고 십만대산의 정상에서 영면. 백 년의 시간을 뛰어넘어 아이의 몸으로 다시 살아나다."
   */
  @Column({ type: 'text' })
  desc: string;

  /**
   * image
   * @example "https://comicthumb-phinf.pstatic.net/20230619_210/pocket_1687157855027BFTVg_JPEG/%C8%AD%BB%EA%BC%F6%C1%A4.jpg"
   */
  @Column({ type: 'varchar' })
  image: string;

  /**
   * likeCount
   * @example 0
   */
  @Column({ type: 'int', default: 0 })
  likeCount: number;

  /**
   * rate
   * @example 0
   */
  @Column({ type: 'float', default: 0 })
  starRate: number;

  /**
   * isAdult
   * @example 0
   */
  @Column({ type: 'tinyint', default: 0 })
  isAdult: number;

  /**
   * rank
   * @example {"naver": 1}
   */
  @Column({ type: 'json', nullable: true })
  rank?: JSON;

  /**
   * author
   * @example "비가"
   */
  @Column({ type: 'varchar', length: 200 })
  author: string;

  /**
   * keyword
   * @example "['무협', '스토리']"
   */
  @Column({ type: 'varchar', nullable: true, length: 500 })
  keyword?: string;

  /**
   * category
   * @example "무협"
   */
  @Column({ type: 'varchar', length: 30 })
  category: string;

  /**
   * platform
   * @example {"naver": "https://m.series.naver.com/novel/detail.series?productNo=4130558"}
   */
  @Column({ type: 'json' })
  platform: JSON;

  /**
   * pubDate
   * @example "2019-04-25"
   */
  @Column({ type: 'date' })
  pubDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PReviews, (pReview) => pReview.webContent, {
    cascade: true,
  })
  pReviews: PReviews[];

  @OneToMany(() => CReviews, (cReviews) => cReviews.webContent, {
    cascade: true,
  })
  cReviews: CReviews[];

  @OneToMany(() => Likes, (like) => like.webContent)
  likes: Likes[];

  //collection
  @OneToMany(
    () => ContentCollection,
    (contentCollection) => contentCollection.webContent,
  )
  contentCollections: ContentCollection[];
}
