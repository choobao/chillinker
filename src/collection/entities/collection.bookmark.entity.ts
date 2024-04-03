import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collections } from './collections.entity';
import { Users } from 'src/user/entities/user.entity';

@Entity({
  name: 'collection_bookmark',
})
export class CollectionBookmark {
  @PrimaryGeneratedColumn({ name: 'collection_bookmark_id' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  // 컬렉션 좋아요 - 컬렉션
  @ManyToOne(() => Collections, (collections) => collections.collectionBookmark)
  collections: Collections[];

  // 컬렉션 좋아요 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;
}
