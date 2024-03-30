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
  name: 'p_revies',
})
export class P_revies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'integer', default: 0, nullable: false })
  like_count: number;

  @Column({ type: 'varchar', nullable: false })
  writer: string;

  @Column({ type: 'integer', nullable: false })
  rate: number;

  @CreateDateColumn()
  created_at: Date;

  //**WebContents와 P_revies는 1:N
  //   @ManyToOne(() => Web_contents, (web_contents) => web_contents.p_revies)
  //   web_contents: Web_contents;

  // @Column('int', { name: 'web_contents_id', nullable: false })
  // web_contents_id: number;
}
