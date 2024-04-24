import { WebContents } from '../../web-content/entities/webContents.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'p_reviews',
})
export class PReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: false })
  likeCount: number;

  @Column({ type: 'varchar', nullable: false })
  writer: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isSpoiler: boolean;

  @Column({ type: 'datetime' })
  createDate: Date;

  //**WebContents와 p_reviews는 1:N
  @ManyToOne(() => WebContents, (webContent) => webContent.pReviews, {
    onDelete: 'CASCADE',
  })
  webContent: WebContents;

  @Column('int', { name: 'web_content_id', nullable: false })
  webContentId: number;
}
