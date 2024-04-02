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

  @Column({ name: 'followingId', type: 'int', nullable: false })
  followingId: number;

  @Column({ name: 'followerId', type: 'int', nullable: false })
  followerId: number;

  @ManyToOne(() => Users, (user) => user.followings, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'followingId', referencedColumnName: 'id' }])
  followings: Users;

  @ManyToOne(() => Users, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'followerId', referencedColumnName: 'id' }])
  followers: Users;
}
