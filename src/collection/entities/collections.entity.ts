import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CollectionLikes } from './collection.likes.entity';
import { Users } from 'src/user/entities/user.entity';

@Entity({
  name: 'collections',
})
export class Collections {
  @PrimaryGeneratedColumn({ name: 'collectionId' })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  desc: string;

  @Column({ type: 'boolean', default: false })
  isBookmarked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // 관계 설정

  // 컬렉션 - 컬렉션 좋아요
  @OneToMany(
    () => CollectionLikes,
    (collectionLikes) => collectionLikes.collections,
  )
  collectionLikes: CollectionLikes[];

  @Column('int', { name: 'collectionLikesId', nullable: false })
  collectionLikesId: number;

  // 컬렉션 - 웹컨텐츠
  //   @OneToMany(() => WebContents, (webContents) => webContents.collections)
  //   webContents: WebContents[];

  //   @Column('int', { name: 'webContentsId', nullable: false })
  //   webContentsId: number;

  // 컬렉션 - 유저
  @ManyToOne(() => Users, (users) => users.collections)
  users: Users;

  @Column('int', { name: 'userId', nullable: false })
  userId: number;
}
