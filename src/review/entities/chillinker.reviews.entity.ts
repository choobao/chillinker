import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewLikes } from './review.likes.entity';
import { Users } from '../../user/entities/user.entity';
import { WebContents } from '../../web-content/entities/webContents.entity';

@Entity({
  name: 'c_reviews',
})
export class CReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: false })
  likeCount: number;

  @Column({ type: 'int', nullable: false })
  rate: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  isSpoiler: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (users) => users.cReviews)
  @JoinColumn({ name: 'user_id' })
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => WebContents, (webContent) => webContent.cReviews, {
    onDelete: 'CASCADE',
  })
  webContent: WebContents;

  @Column('int', { name: 'web_content_id', nullable: false })
  webContentId: number;

  @OneToMany(() => ReviewLikes, (reviewLikes) => reviewLikes.cReviews)
  reviewLike: ReviewLikes[];
}
