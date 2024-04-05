import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CollectionBookmark } from './collection-bookmark.entity';
import { Users } from 'src/user/entities/user.entity';
import { Collections } from './collections.entity';

@Entity({
  name: 'collection_bookmark_user',
})
export class CollectionBookmarkUser {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Collections, { eager: true })
  @JoinColumn({ name: 'collection_id' })
  collection: Collections;

  @ManyToOne(() => CollectionBookmark, (bookmark) => bookmark.bookmarkUsers)
  @JoinColumn({ name: 'bookmark_id' })
  bookmark: CollectionBookmark;

  @ManyToOne(() => Users, (user) => user.collectionBookmarks)
  @JoinColumn({ name: 'user_id' })
  user: Users;
}
