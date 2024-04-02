import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review_likes } from './review.likes.entity';

@Entity({
  name: 'c_reviews',
})
export class C_reviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: false })
  like_count: number;

  @Column({ type: 'int', nullable: false })
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  //**Users와 CReviews는 1:N
  //   @ManyToOne(() => Users, (users) => users.c_reviews)
  //   users: Users;

  // @Column('int', { name: 'user_id', nullable: false })
  // user_id: number;

  //**WebContents와 CReviews는 1:N
  //   @ManyToOne(() => Web_contents, (web_contents) => web_contents.c_reviews)
  //   web_contents: Web_contents;

  // @Column('int', { name: 'web_contents_id', nullable: false })
  // web_contents_id: number;

  //**CReviews와 ReviewLikes는 N:1
  @OneToMany(() => Review_likes, (review_likes) => review_likes.c_reviews)
  review_likes: Review_likes[];
}