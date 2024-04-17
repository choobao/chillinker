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

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: false })
  userId: number;

  // 관계 설정

  // 컬렉션 - 컬렉션 북마크
  @OneToMany(
    () => CollectionBookmark,
    (collectionBookmark) => collectionBookmark.collection,
    { cascade: true },
  )
  collectionBookmarks: CollectionBookmark[];

  // 컬렉션 - 유저
  @ManyToOne(() => Users, (user) => user.collections)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;

  //컬렉션 - 웹컨텐츠
  @OneToMany(
    () => ContentCollection,
    (contentCollection) => contentCollection.collection,
  )
  contentCollections: ContentCollection[];
}

