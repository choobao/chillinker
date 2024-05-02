import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follows } from '../../follow/entities/follow.entity';
import { ReviewLikes } from '../../review/entities/review.likes.entity';
import { CReviews } from '../../review/entities/chillinker.reviews.entity';
import { Collections } from '../../collection/entities/collections.entity';
import { Likes } from '../../like/entities/likes.entity';

@Entity({
  name: 'users',
})
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  intro?: string;

  @Column({ type: 'varchar', nullable: true })
  profileImage?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', select: false, nullable: true })
  deletedAt?: Date;

  @Column({ type: 'smallint', default: 0 })
  isAdmin: number;

  @OneToMany(() => Follows, (following) => following.followings)
  followings: Follows[];

  @OneToMany(() => Follows, (follower) => follower.followers)
  followers: Follows[];

  @OneToMany(() => CReviews, (cReviews) => cReviews.users)
  cReviews: CReviews[];

  @OneToMany(() => ReviewLikes, (reviewLikes) => reviewLikes.users)
  reviewLikes: ReviewLikes[];

  @OneToMany(() => Collections, (collection) => collection.user)
  collections: Collections[];

  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];
}
