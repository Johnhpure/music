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

@Entity('suno_cover_tasks')
export class SunoCoverTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  task_id: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 500, nullable: true })
  upload_url?: string;

  @Column({ length: 500, nullable: true })
  local_file_path?: string;

  @Column({ type: 'tinyint', default: 0 })
  custom_mode: boolean;

  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @Column({ length: 200, nullable: true })
  style?: string;

  @Column({ length: 200, nullable: true })
  title?: string;

  @Column({ type: 'enum', enum: MusicModel, default: MusicModel.V4 })
  model: MusicModel;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ length: 500, nullable: true })
  callback_url?: string;

  @Column({ type: 'json', nullable: true })
  result_data?: any;

  @Column({ length: 500, nullable: true })
  cover_audio_url?: string;

  @Column({ length: 500, nullable: true })
  cover_image_url?: string;

  @Column({ type: 'float', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'int', unsigned: true, default: 30 })
  credit_cost: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at?: Date;
}
