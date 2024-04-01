import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follows } from '../../follow/entities/follow.entity';

@Entity({
  name: 'users',
})
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  intro?: string;

  @Column({ type: 'varchar', nullable: true })
  profile_image?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamp', select: false, nullable: true })
  deleted_at?: Date;

  //내가 팔로잉 한 사람 목록
  @OneToMany(() => Follows, (following) => following.followings)
  followings: Follows[];

  //나를 팔로잉 한 사람 목록
  @OneToMany(() => Follows, (follower) => follower.followers)
  followers: Follows[];
}
