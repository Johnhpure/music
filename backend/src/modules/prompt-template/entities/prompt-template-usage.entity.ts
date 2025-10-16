import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_prompt_template_usage')
export class PromptTemplateUsage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '记录ID' })
  id: number;

  @Column({
    type: 'int',
    unsigned: true,
    name: 'template_id',
    comment: '模板ID',
  })
  templateId: number;

  @Column({ type: 'int', unsigned: true, name: 'user_id', comment: '用户ID' })
  userId: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;
}
