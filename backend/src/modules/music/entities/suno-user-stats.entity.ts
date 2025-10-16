import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('suno_user_stats')
export class SunoUserStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  success_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  failed_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total_credits_used: number;

  @Column({ nullable: true })
  last_call_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
