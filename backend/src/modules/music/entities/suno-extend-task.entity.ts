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
import { MusicTask } from './music-task.entity';
import { MusicModel, TaskStatus } from '../music.types';

@Entity('suno_extend_tasks')
export class SunoExtendTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  task_id: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  original_music_task_id: number;

  @ManyToOne(() => MusicTask)
  @JoinColumn({ name: 'original_music_task_id' })
  originalMusicTask: MusicTask;

  @Column({ length: 50 })
  audio_id: string;

  @Column({ type: 'int', nullable: true })
  continue_at?: number;

  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @Column({ type: 'tinyint', default: 1 })
  default_param_flag: boolean;

  @Column({ type: 'enum', enum: MusicModel })
  model: MusicModel;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ length: 500, nullable: true })
  callback_url?: string;

  @Column({ type: 'json', nullable: true })
  result_data?: any;

  @Column({ length: 500, nullable: true })
  audio_url?: string;

  @Column({ type: 'float', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'int', unsigned: true, default: 15 })
  credit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at?: Date;
}
