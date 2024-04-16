import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebContents } from '../../web-content/entities/webContents.entity';
import { Users } from '../../user/entities/user.entity';

@Entity('likes')
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.likes)
  user: Users;

  @Column()
  userId: number;

  @ManyToOne(() => WebContents, (webContent) => webContent.likes)
  webContent: WebContents;

  @Column()
  webContentId: number;

  @CreateDateColumn()
  createdAt: Date;
}
