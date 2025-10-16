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
import { TaskStatus } from '../music.types';

@Entity('suno_cover_suno_tasks')
export class SunoCoverSunoTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  task_id: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  parent_task_id: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ length: 500, nullable: true })
  callback_url?: string;

  @Column({ type: 'json', nullable: true })
  result_data?: any;

  @Column({ type: 'json', nullable: true })
  cover_images?: string[];

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'int', unsigned: true, default: 10 })
  credit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at?: Date;
}
