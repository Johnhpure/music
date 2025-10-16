import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_user_music_likes')
export class UserMusicLike {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '点赞ID' })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'user_id', comment: '用户ID' })
  userId: number;

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

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;
}
