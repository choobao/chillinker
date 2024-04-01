import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { C_reviews } from './chillinker.reivews.entity';

@Entity({
  name: 'review_likes',
})
export class Review_likes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  like: number;

  //**Users와 Review_likes는 1:N
  //   @ManyToOne(() => Users, (users) => users.review_likes)
  //   users: Users;

  // @Column('int', { name: 'user_id', nullable: false })
  // user_id: number;

  // **C_reviews와 Review_likes는 1:N
  @ManyToOne(() => C_reviews, (c_reviews) => c_reviews.review_likes)
  c_reviews: C_reviews;

  @Column('int', { name: 'c_reveiw_id', nullable: false })
  c_reveiw_id: number;
}
