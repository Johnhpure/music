import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_gemini_models')
export class GeminiModel {
  @PrimaryGeneratedColumn({ comment: '模型ID' })
  id: number;

  @Column({ length: 100, unique: true, comment: '模型名称' })
  modelName: string;

  @Column({ length: 100, comment: '显示名称' })
  displayName: string;

  @Column({ type: 'text', nullable: true, comment: '模型描述' })
  description: string;

  @Column({ length: 50, nullable: true, comment: '版本' })
  version: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 30720,
    comment: '最大输入Token数',
  })
  maxInputTokens: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 2048,
    comment: '最大输出Token数',
  })
  maxOutputTokens: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否支持流式输出' })
  supportStreaming: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否支持图像输入' })
  supportVision: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否支持音频输入' })
  supportAudio: boolean;

  @Column({ type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否为默认模型' })
  isDefault: boolean;

  @Column({ default: 0, comment: '排序' })
  sortOrder: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 0,
    comment: 'Prompt成本(每1000 tokens)',
  })
  costPer1kPromptTokens: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 0,
    comment: '完成成本(每1000 tokens)',
  })
  costPer1kCompletionTokens: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
