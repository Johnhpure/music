import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SunoTaskType } from '../music.types';

@Entity('suno_credit_usage_logs')
export class SunoCreditUsageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: SunoTaskType })
  task_type: SunoTaskType;

  @Column({ length: 50 })
  task_id: string;

  @Column({ type: 'int', unsigned: true })
  credits_used: number;

  @Column({ type: 'int', nullable: true })
  suno_remaining_credits?: number;

  @CreateDateColumn()
  created_at: Date;
}
