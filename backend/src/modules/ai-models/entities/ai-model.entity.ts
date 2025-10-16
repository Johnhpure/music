import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AIProvider } from './ai-provider.entity';

/**
 * AI模型实体
 */
@Entity('t_ai_models')
export class AIModel {
  @PrimaryGeneratedColumn({ comment: '模型ID' })
  id: number;

  @Column({ type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ length: 100, comment: '模型代码' })
  modelCode: string;

  @Column({ length: 100, comment: '模型显示名称' })
  modelName: string;

  @Column({
    type: 'enum',
    enum: ['chat', 'completion', 'embedding', 'image'],
    default: 'chat',
    comment: '模型类型',
  })
  modelType: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '最大输入Token数',
  })
  maxInputTokens: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '最大输出Token数',
  })
  maxOutputTokens: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否支持流式输出' })
  supportsStreaming: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否支持函数调用' })
  supportsFunctionCall: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否支持视觉' })
  supportsVision: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'Prompt成本(每1K tokens)',
  })
  costPer1kPromptTokens: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '完成成本(每1K tokens)',
  })
  costPer1kCompletionTokens: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '是否为默认模型' })
  isDefault: boolean;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'json', nullable: true, comment: '额外配置(JSON格式)' })
  configJson: any;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => AIProvider, (provider) => provider.models)
  @JoinColumn({ name: 'provider_id' })
  provider: AIProvider;
}
