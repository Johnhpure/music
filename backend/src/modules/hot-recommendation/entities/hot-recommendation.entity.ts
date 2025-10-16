import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_hot_recommendations')
export class HotRecommendation {
  @PrimaryGeneratedColumn({ comment: '推荐ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '分类' })
  category: string;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'cover_url',
    comment: '封面URL',
  })
  coverUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'audio_url',
    comment: '音频URL',
  })
  audioUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '艺术家' })
  artist: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '时长' })
  duration: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'play_count',
    default: 0,
    comment: '播放次数',
  })
  playCount: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'like_count',
    default: 0,
    comment: '点赞数',
  })
  likeCount: number;

  @Column({
    type: 'tinyint',
    name: 'is_active',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: '更新时间',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
    comment: '删除时间',
  })
  deletedAt: Date;
}
