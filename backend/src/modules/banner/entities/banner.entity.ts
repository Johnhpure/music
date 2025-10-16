import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_banners')
export class Banner {
  @PrimaryGeneratedColumn({ comment: 'BannerID' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '标题' })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'image_url',
    comment: '图片URL',
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'link_url',
    nullable: true,
    comment: '跳转链接',
  })
  linkUrl: string;

  @Column({
    type: 'enum',
    enum: ['none', 'internal', 'external', 'miniprogram'],
    name: 'link_type',
    default: 'none',
    comment: '链接类型',
  })
  linkType: string;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({
    type: 'tinyint',
    name: 'is_active',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    type: 'timestamp',
    name: 'start_time',
    nullable: true,
    comment: '开始时间',
  })
  startTime: Date;

  @Column({
    type: 'timestamp',
    name: 'end_time',
    nullable: true,
    comment: '结束时间',
  })
  endTime: Date;

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
