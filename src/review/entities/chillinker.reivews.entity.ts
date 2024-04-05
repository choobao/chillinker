import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewLikes } from './review.likes.entity';
import { Users } from 'src/user/entities/user.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

@Entity({
  name: 'cReviews',
})
export class CReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: false })
  likeCount: number;

  @Column({ type: 'int', nullable: false })
  rate: number;

  @CreateDateColumn()
  createdAt: Date;

  // **Users와 CReviews는 1:N
  @ManyToOne(() => Users, (users) => users.cReviews)
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;

  //**WebContents와 CReviews는 1:N
  @ManyToOne(() => WebContents, (webContent) => webContent.cReviews, {
    onDelete: 'CASCADE',
  })
  webContent: WebContents;

  @Column('int', { name: 'web_content_id', nullable: false })
  webContentId: number;

  //**CReviews와 ReviewLikes는 N:1
  @OneToMany(() => ReviewLikes, (reviewLikes) => reviewLikes.cReviews)
  reviewLike: ReviewLikes[];
}
