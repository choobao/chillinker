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
import { Users } from 'src/user/entities/user.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

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

  @Column({ type: 'int', nullable: true })
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
  )
  collectionBookmarks: CollectionBookmark[];

  @Column('int', { name: 'collection_bookmark_id', nullable: true })
  collectionBookmarkId: number;

  // 컬렉션 - 유저
  @ManyToOne(() => Users, (user) => user.collections)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: Users;

  // 컬렉션 - 웹컨텐츠
  @OneToMany(() => WebContents, (webContents) => webContents.collection)
  webContent: WebContents[];

  @Column('int', { name: 'web_contents_id', nullable: false })
  webContentsId: number;
}
