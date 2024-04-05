import { WebContents } from 'src/web-content/entities/webContents.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'pReviews',
})
export class PReviews {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: false })
  likeCount: number;

  @Column({ type: 'varchar', nullable: false })
  writer: string;

  @Column({ type: 'int', nullable: false })
  rate: number;

  @CreateDateColumn()
  createdAt: Date;

  //**WebContents와 p_reviews는 1:N
  @ManyToOne(() => WebContents, (webContents) => webContents.pReviews, {
    onDelete: 'CASCADE',
  })
  webContents: WebContents;

  @Column('int', { name: 'web_contents_id', nullable: false })
  webContentsId: number;
}
