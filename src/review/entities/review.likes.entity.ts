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
import { Users } from 'src/user/entities/user.entity';
import { CReviews } from './chillinker.reivews.entity';

@Entity({
  name: 'review_likes',
})
export class ReviewLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  like: number;

  //**Users와 Review_likes는 1:N
  @ManyToOne(() => Users, (users) => users.reviewLikes)
  @JoinColumn({ name: 'user_id' })
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;

  // **C_reviews와 Review_likes는 1:N
  @ManyToOne(() => CReviews, (cReviews) => cReviews.reviewLike)
  @JoinColumn({ name: 'c_reveiw_id' })
  cReviews: CReviews;

  @Column('int', { name: 'c_reveiw_id', nullable: false })
  cReviewId: number;
}
