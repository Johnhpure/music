import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { MusicStyle, Mood } from '../ai.types';

@Entity('t_lyrics_generation')
export class LyricsGeneration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  theme: string;

  @Column({ type: 'enum', enum: MusicStyle, nullable: true })
  style?: MusicStyle;

  @Column({ type: 'enum', enum: Mood, nullable: true })
  mood?: Mood;

  @Column({ default: 'zh' })
  language: string;

  @Column({ type: 'text', nullable: true })
  custom_prompt?: string;

  @Column({ type: 'text' })
  lyrics: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  structure?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  credit_cost: number;

  @CreateDateColumn()
  created_at: Date;
}
