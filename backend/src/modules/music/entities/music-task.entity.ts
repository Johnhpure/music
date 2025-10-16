import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { TaskStatus, MusicModel } from '../music.types';

@Entity('t_music_tasks')
export class MusicTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  lyrics?: string;

  @Column({ nullable: true })
  style?: string;

  @Column({ type: 'text', nullable: true })
  prompt?: string;

  @Column({ type: 'boolean', default: false })
  instrumental: boolean;

  @Column({ type: 'enum', enum: MusicModel, default: MusicModel.V3_5 })
  model: MusicModel;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ nullable: true })
  suno_task_id?: string;

  @Column({ type: 'json', nullable: true })
  suno_response?: any;

  @Column({ nullable: true })
  audio_url?: string;

  @Column({ nullable: true })
  video_url?: string;

  @Column({ nullable: true })
  image_url?: string;

  @Column({ type: 'float', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 20 })
  credit_cost: number;

  // Phase 3.3: 作品管理新增字段
  @Column({ nullable: true })
  share_url?: string;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ type: 'int', default: 0 })
  download_count: number;

  @Column({ nullable: true })
  local_audio_path?: string;

  // Phase 4: 用户互动字段
  @Column({ type: 'int', default: 0 })
  like_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at?: Date;
}
