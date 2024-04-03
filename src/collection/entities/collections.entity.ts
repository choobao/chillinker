import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CollectionBookmark } from './collection.bookmark.entity';
import { Users } from 'src/user/entities/user.entity';

@Entity({
  name: 'collections',
})
export class Collections {
  @PrimaryGeneratedColumn({ name: 'collection_id' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  desc: string;

  @Column({ type: 'boolean', default: false })
  isBookmarked: boolean;

  @Column({ type: 'int', nullable: true })
  bookmarkCount: number;

  @CreateDateColumn()
  createdAt: Date;

  // 관계 설정

  // 컬렉션 - 컬렉션 북마크
  @OneToMany(
    () => CollectionBookmark,
    (collectionBookmark) => collectionBookmark.collections,
  )
  collectionBookmark: CollectionBookmark[];

  @Column('int', { name: 'collection_bookmark_id', nullable: true })
  collectionBookmarkId: number;

  // 컬렉션 - 웹컨텐츠
  //   @OneToMany(() => WebContents, (webContents) => webContents.collections)
  //   webContents: WebContents[];

  //   @Column('int', { name: 'webContentsId', nullable: false })
  //   webContentsId: number;

  // 컬렉션 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;
}
