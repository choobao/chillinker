import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentType } from '../webContent.type';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { Collections } from '../../collection/entities/collections.entity';
import { C_reviews } from '../../review/entities/chillinker.reivews.entity';
import { P_reviews } from '../../review/entities/platform.reviews.entity';
import { Bogosips } from './bogosips.entity';

@Entity('webContents')
export class WebContents {
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @IsEnum(ContentType)
  @Column({ type: 'enum', enum: ContentType })
  contentType: ContentType;

  @IsString()
  @Column({ type: 'varchar', length: 30 })
  title: string;

  @Column({ type: 'varchar', length: 200 })
  desc?: string;

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'int' })
  bogosipCount: number;

  @Column({ type: 'float' })
  rate: number;

  @Column({ type: 'varchar', length: 10 })
  ageLimit: string;

  @Column({ type: 'varchar', length: 20 })
  author: string;

  @Column({ type: 'varchar', length: 10 })
  status: string;

  @Column({ type: 'json', nullable: true })
  keyword?: JSON;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @Column({ type: 'varchar', length: 70 })
  term?: string;

  @Column({ type: 'json' })
  platform: JSON;

  @Column({ type: 'date' })
  pubDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bogosips, (bogosip) => bogosip.webContent)
  bogosips: Bogosips[];

  @OneToMany(() => P_reviews, (pReview) => pReview.webContent)
  pReviews: P_reviews[];

  @OneToMany(() => C_reviews, (cReview) => cReview.webContent)
  cReviews: C_reviews[];

  @ManyToOne(() => Collections, (collection) => collection.webContents, {
    onDelete: 'CASCADE',
  })
  collection: Collections;
}
