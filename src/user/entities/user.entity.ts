import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
  profileImage?: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamp', select: false, nullable: true })
  deletedAt?: Date;
}
