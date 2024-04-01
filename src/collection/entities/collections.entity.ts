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

@Entity({
  name: 'collections',
})
export class Collections {
  @PrimaryGeneratedColumn({ name: 'collection_id' })
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false }) // false 맞는지 따로 확인
  desc: string;

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

  //   // 컬렉션 - 웹컨텐츠
  //   @OneToMany(() => Web_contents, (web_contents) => web_contents.collections)
  //   web_contents: Web_contents[];

  //   @Column('int', { name: 'web_contents_id', nullable: false })
  //   web_contents_id: number;

  //   // 컬렉션 - 유저
  //   @ManyToOne(() => Users, (users) => users.collections)
  //   users: Users;

  //   @Column('int', { name: 'user_id', nullable: false })
  //   user_id: number;
}
