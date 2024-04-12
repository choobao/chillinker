import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BogosipType } from '../types/bogosip.type';
import { WebContents } from '../../web-content/entities/webContents.entity';
import { Users } from '../../user/entities/user.entity';

@Entity('bogosips')
export class Bogosips {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.bogosips)
  user: Users;

  @Column()
  userId: number;

  @ManyToOne(() => WebContents, (webContent) => webContent.bogosips)
  webContent: WebContents;

  @Column()
  webContentId: number;

  @Column({ type: 'enum', enum: BogosipType })
  type: BogosipType;

  @CreateDateColumn()
  createdAt: Date;
}
