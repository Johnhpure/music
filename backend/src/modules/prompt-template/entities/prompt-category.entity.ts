import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PromptTemplate } from './prompt-template.entity';

@Entity('t_prompt_categories')
export class PromptCategory {
  @PrimaryGeneratedColumn({ comment: '分类ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '分类名称' })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '分类描述' })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '图标' })
  icon: string;

  @Column({ type: 'int', name: 'sort_order', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({
    type: 'tinyint',
    name: 'is_active',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @OneToMany(() => PromptTemplate, (template) => template.promptCategory)
  templates: PromptTemplate[];

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
}
