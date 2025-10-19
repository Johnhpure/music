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

  @Column({ name: 'provider_id', type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ name: 'model_code', length: 100, comment: '模型代码' })
  modelCode: string;

  @Column({ name: 'model_name', length: 100, comment: '模型显示名称' })
  modelName: string;

  @Column({
    name: 'model_type',
    type: 'enum',
    enum: ['chat', 'completion', 'embedding', 'image'],
    default: 'chat',
    comment: '模型类型',
  })
  modelType: string;

  @Column({
    name: 'max_input_tokens',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '最大输入Token数',
  })
  maxInputTokens: number;

  @Column({
    name: 'max_output_tokens',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '最大输出Token数',
  })
  maxOutputTokens: number;

  @Column({ name: 'supports_streaming', type: 'tinyint', default: 1, comment: '是否支持流式输出' })
  supportsStreaming: boolean;

  @Column({ name: 'supports_function_call', type: 'tinyint', default: 0, comment: '是否支持函数调用' })
  supportsFunctionCall: boolean;

  @Column({ name: 'supports_vision', type: 'tinyint', default: 0, comment: '是否支持视觉' })
  supportsVision: boolean;

  @Column({
    name: 'cost_per_1k_prompt_tokens',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'Prompt成本(每1K tokens)',
  })
  costPer1kPromptTokens: number;

  @Column({
    name: 'cost_per_1k_completion_tokens',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: '完成成本(每1K tokens)',
  })
  costPer1kCompletionTokens: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean;

  @Column({ name: 'is_default', type: 'tinyint', default: 0, comment: '是否为默认模型' })
  isDefault: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'config_json', type: 'json', nullable: true, comment: '额外配置(JSON格式)' })
  configJson: any;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => AIProvider, (provider) => provider.models)
  @JoinColumn({ name: 'provider_id' })
  provider: AIProvider;
}
