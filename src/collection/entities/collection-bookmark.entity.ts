import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Collections } from './collections.entity';
import { Users } from '../../user/entities/user.entity';

@Entity({
  name: 'collection_bookmark',
})
export class CollectionBookmark {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index('idx_created_at', ['createdAt'])
  @CreateDateColumn()
  createdAt: Date;

  // 컬렉션 북마크 - 컬렉션
  @ManyToOne(() => Collections, (collection) => collection.collectionBookmarks)
  @JoinColumn({ name: 'collection_id' })
  collection: Collections;

  @Column('int', { name: 'collection_id', nullable: false })
  collectionId: number;

  // 컬렉션 좋아요 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  @JoinColumn({ name: 'user_id' })
  users: Users;

  @Column('int', { name: 'user_id', nullable: false })
  userId: number;

  @Column('varchar', { name: 'user_nickname', nullable: false })
  nickname: string;

  @Column('varchar', { name: 'user_profile_image', nullable: true })
  profileImage: string;
}
