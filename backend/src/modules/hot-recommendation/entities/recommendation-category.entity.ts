import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_recommendation_categories')
export class RecommendationCategory {
  @PrimaryGeneratedColumn({ comment: '分类ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '分类代码' })
  code: string;

  @Column({ type: 'varchar', length: 50, comment: '分类名称' })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '图标' })
  icon: string;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({
    type: 'tinyint',
    name: 'is_active',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;
}
