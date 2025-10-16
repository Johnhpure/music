import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MusicTask } from './music-task.entity';

@Entity('suno_timestamped_lyrics')
export class SunoTimestampedLyrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  music_task_id: number;

  @ManyToOne(() => MusicTask)
  @JoinColumn({ name: 'music_task_id' })
  musicTask: MusicTask;

  @Column({ length: 50 })
  audio_id: string;

  @Column({ type: 'json' })
  lyrics_data: Array<{
    timestamp: number;
    text: string;
  }>;

  @CreateDateColumn()
  created_at: Date;
}
