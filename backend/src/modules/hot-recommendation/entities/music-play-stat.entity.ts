import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_music_play_stats')
export class MusicPlayStat {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '统计ID' })
  id: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'music_id',
    comment: '音乐ID',
  })
  musicId: number;

  @Column({
    type: 'enum',
    enum: ['work', 'recommendation'],
    name: 'music_type',
    comment: '音乐类型',
  })
  musicType: string;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'user_id',
    nullable: true,
    comment: '用户ID',
  })
  userId: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'play_duration',
    nullable: true,
    comment: '播放时长(秒)',
  })
  playDuration: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;
}
