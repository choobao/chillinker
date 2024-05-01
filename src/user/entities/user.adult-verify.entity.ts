import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity({
  name: 'adult_verify_request',
})
export class UserAdultVerifyRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  registrationCardImage?: string;

  @Column({ type: 'date' })
  birthDate?: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @Column()
  userId: number;

  @OneToOne(() => Users)
  user: Users;
}
