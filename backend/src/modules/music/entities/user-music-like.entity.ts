import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { MusicTask } from './music-task.entity';

@Entity('user_music_likes')
export class UserMusicLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  music_task_id: number;

  @ManyToOne(() => MusicTask)
  @JoinColumn({ name: 'music_task_id' })
  musicTask: MusicTask;

  @CreateDateColumn()
  created_at: Date;
}
