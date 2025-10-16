import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum SunoApiTaskType {
  GENERATE = 'generate',
  EXTEND = 'extend',
  LYRICS = 'lyrics',
  VOCAL_SEPARATION = 'vocal_separation',
  WAV_CONVERSION = 'wav_conversion',
  MUSIC_VIDEO = 'music_video',
  COVER = 'cover',
  ADD_VOCALS = 'add_vocals',
  ADD_INSTRUMENTAL = 'add_instrumental',
  UPLOAD_EXTEND = 'upload_extend',
  COVER_SUNO = 'cover_suno',
  BOOST_STYLE = 'boost_style',
  GET_CREDITS = 'get_credits',
}

@Entity('suno_api_logs')
export class SunoApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: SunoApiTaskType })
  task_type: SunoApiTaskType;

  @Column({ length: 50, nullable: true })
  task_id?: string;

  @Column({ length: 200 })
  api_endpoint: string;

  @Column({ type: 'json', nullable: true })
  request_params?: any;

  @Column({ type: 'json', nullable: true })
  response_data?: any;

  @Column({ type: 'int' })
  status_code: number;

  @Column({ type: 'tinyint' })
  success: boolean;

  @Column({ type: 'int', unsigned: true, default: 0 })
  credits_used: number;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column({ type: 'int', unsigned: true, nullable: true })
  response_time?: number;

  @CreateDateColumn()
  created_at: Date;
}
