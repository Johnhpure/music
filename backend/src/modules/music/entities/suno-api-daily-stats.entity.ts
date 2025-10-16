import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SunoStatsTaskType {
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
  ALL = 'all',
}

@Entity('suno_api_daily_stats')
export class SunoApiDailyStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  stat_date: Date;

  @Column({ type: 'enum', enum: SunoStatsTaskType })
  task_type: SunoStatsTaskType;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  success_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  failed_calls: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total_credits_used: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  avg_response_time?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
