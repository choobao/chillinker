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
  name: 'collectionBookmark',
})
export class CollectionBookmark {
  @PrimaryGeneratedColumn({ name: 'collectionBookmarkId' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  // 컬렉션 좋아요 - 컬렉션
  @ManyToOne(() => Collections, (collections) => collections.collectionBookmark)
  collections: Collections[];

  // 컬렉션 좋아요 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  users: Users;

  @Column('int', { name: 'userId', nullable: false })
  userId: number;
}
