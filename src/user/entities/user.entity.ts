import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follows } from '../../follow/entities/follow.entity';
import { ReviewLikes } from 'src/review/entities/review.likes.entity';
import { CReviews } from 'src/review/entities/chillinker.reivews.entity';
import { Collections } from 'src/collection/entities/collections.entity';
import { CollectionBookmarkUser } from 'src/collection/entities/collection-bookmark-user.entity';

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

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', select: false, nullable: true })
  deletedAt?: Date;

  //내가 팔로잉 한 사람 목록
  @OneToMany(() => Follows, (following) => following.followings)
  followings: Follows[];

  //나를 팔로잉 한 사람 목록
  @OneToMany(() => Follows, (follower) => follower.followers)
  followers: Follows[];

  @OneToMany(() => CReviews, (cReviews) => cReviews.users)
  cReviews: CReviews[];

  @OneToMany(() => ReviewLikes, (reviewLikes) => reviewLikes.users)
  reviewLikes: ReviewLikes[];

  @OneToMany(() => Collections, (collection) => collection.user)
  collections: Collections[];

  @OneToMany(() => CollectionBookmarkUser, (bookmarkUser) => bookmarkUser.user)
  collectionBookmarks: CollectionBookmarkUser[];
}
