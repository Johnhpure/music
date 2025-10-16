import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  AfterLoad,
} from 'typeorm';

@Entity('t_prompt_templates')
export class PromptTemplate {
  @PrimaryGeneratedColumn({ comment: '模板ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '分类(风格/情绪/主题)' })
  category: string;

  @Column({ type: 'varchar', length: 100, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '模板内容' })
  content: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '标签(逗号分隔)',
  })
  tags: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '图标',
  })
  icon: string;

  tagsArray?: string[];

  @AfterLoad()
  convertTagsToArray() {
    if (this.tags) {
      this.tagsArray = this.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    } else {
      this.tagsArray = [];
    }
  }

  @Column({
    type: 'int',
    unsigned: true,
    name: 'usage_count',
    default: 0,
    comment: '使用次数',
  })
  usageCount: number;

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
