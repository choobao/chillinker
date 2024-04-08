import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collection_likes } from './collection.likes.entity';
import { Users } from 'src/user/entities/user.entity';
import { WebContents } from 'src/web-content/entities/webContents.entity';

@Entity({
  name: 'collections',
})
export class Collections {
  @PrimaryGeneratedColumn({ name: 'collection_id' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false }) // false 맞는지 따로 확인
  desc: string;

  @Column({ type: 'boolean', default: false }) // 북마크 컬렉션과 구분하기 위해 만들었습니다
  is_bookmarked: boolean;

  @CreateDateColumn() // 만든 순서대로 쌓이면 필요하지 않을까 하여 일단 넣음
  created_at: Date;

  // 관계 설정

  // 컬렉션 - 컬렉션 좋아요
  @OneToMany(
    () => Collection_likes,
    (collection_likes) => collection_likes.collections,
  )
  collection_likes: Collection_likes[];

  @Column('int', { name: 'collection_likes_id', nullable: false })
  collection_likes_id: number;

  // 컬렉션 - 웹컨텐츠
  // @OneToMany(() => WebContents, (webContents) => webContents.collection)
  // webContent: WebContents[];

  // @Column('int', { name: 'web_contents_id', nullable: false })
  // webContentsId: number;

  // 컬렉션 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  user: Users;

  @Column('int', { name: 'user_id', nullable: false })
  user_id: number;
}
