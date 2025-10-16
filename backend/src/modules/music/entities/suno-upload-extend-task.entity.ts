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
import { MusicModel, TaskStatus } from '../music.types';

@Entity('suno_upload_extend_tasks')
export class SunoUploadExtendTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  task_id: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 500 })
  upload_url: string;

  @Column({ type: 'tinyint', default: 1 })
  default_param_flag: boolean;

  @Column({ type: 'tinyint', default: 0 })
  instrumental: boolean;

  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @Column({ length: 200, nullable: true })
  style?: string;

  @Column({ length: 200, nullable: true })
  title?: string;

  @Column({ type: 'int', nullable: true })
  continue_at?: number;

  @Column({ length: 500, nullable: true })
  negative_tags?: string;

  @Column({ type: 'enum', enum: ['m', 'f'], nullable: true })
  vocal_gender?: 'm' | 'f';

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  style_weight?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  weirdness_constraint?: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  audio_weight?: number;

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

  @Column({ type: 'int', unsigned: true, default: 20 })
  credit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at?: Date;
}
