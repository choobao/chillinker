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
import { Users } from '../../user/entities/user.entity';
import { CReviews } from './chillinker.reviews.entity';

@Entity({
  name: 'review_likes',
})
export class ReviewLikes {
  @PrimaryGeneratedColumn()
  id: number;

  //**Users와 Review_likes는 1:N
  @ManyToOne(() => Users, (users) => users.reviewLikes)
  @JoinColumn({ name: 'user_id' })
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;

  // **C_reviews와 Review_likes는 1:N
  @ManyToOne(() => CReviews, (cReviews) => cReviews.reviewLike, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'c_review_id' })
  cReviews: CReviews;

  @Column('int', { name: 'c_review_id', nullable: false })
  cReviewId: number;
}
