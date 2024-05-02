import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CollectionBookmark } from './collection-bookmark.entity';
import { Users } from '../../user/entities/user.entity';
import { ContentCollection } from './content-collections.entity';

@Entity({
  name: 'collections',
})
export class Collections {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  desc: string;

  @Column({ type: 'varchar', nullable: true })
  coverImage?: string;

  @Column({ type: 'int', default: 0 })
  bookmarkCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @OneToMany(
    () => CollectionBookmark,
    (collectionBookmark) => collectionBookmark.collection,
    { cascade: true },
  )
  collectionBookmarks: CollectionBookmark[];

  @ManyToOne(() => Users, (user) => user.collections)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;

  @OneToMany(
    () => ContentCollection,
    (contentCollection) => contentCollection.collection,
  )
  contentCollections: ContentCollection[];
}
