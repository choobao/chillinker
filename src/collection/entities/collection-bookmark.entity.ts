import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collections } from './collections.entity';
import { CollectionBookmarkUser } from './collection-bookmark-user.entity';
import { Users } from 'src/user/entities/user.entity';

@Entity({
  name: 'collection_bookmark',
})
export class CollectionBookmark {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  // 컬렉션 북마크 - 컬렉션
  @ManyToOne(() => Collections, (collection) => collection.collectionBookmarks)
  @JoinColumn({ name: 'collection_id' })
  collection: Collections;

  @Column('int', { name: 'collection_id', nullable: false })
  collectionId: number;

  // 컬렉션 북마크 - 컬렉션 북마크 유저
  @OneToMany(
    () => CollectionBookmarkUser,
    (bookmarkUser) => bookmarkUser.bookmark,
  )
  bookmarkUsers: CollectionBookmarkUser[];

  // // 컬렉션 좋아요 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;
}
