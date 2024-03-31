import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../user/entities/user.entity';

@Entity({
  name: 'follows',
})
export class Follows {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'followingId', nullable: false })
  followingId: number;

  @Column({ type: 'int', name: 'followerId', nullable: false })
  followerId: number;

  @ManyToOne(() => Users, (user) => user.followings, { onDelete: 'CASCADE' }) //followers가 들어가야하나..?
  @JoinColumn([{ name: 'followingId', referencedColumnName: 'id' }])
  followings: Users;

  @ManyToOne(() => Users, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'followerId', referencedColumnName: 'id' }])
  followers: Users;
}
