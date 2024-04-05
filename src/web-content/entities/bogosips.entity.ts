import { Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BogosipType } from '../../web-content/webContent.type';
import { WebContents } from './webContents.entity';
import { Users } from '../../user/entities/user.entity';

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
}
