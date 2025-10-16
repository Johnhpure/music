import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AIModel } from './ai-model.entity';
import { AIApiKey } from './ai-api-key.entity';

/**
 * AI供应商实体
 * 支持: OpenAI, Claude, DeepSeek, Gemini 等
 */
@Entity('t_ai_providers')
export class AIProvider {
  @PrimaryGeneratedColumn({ comment: '供应商ID' })
  id: number;

  @Column({ length: 50, unique: true, comment: '供应商代码' })
  providerCode: string;

  @Column({ length: 100, comment: '供应商名称' })
  providerName: string;

  @Column({ length: 200, comment: '默认API基础URL' })
  baseUrl: string;

  @Column({ type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean;

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
  @OneToMany(() => AIModel, (model) => model.provider)
  models: AIModel[];

  @OneToMany(() => AIApiKey, (key) => key.provider)
  apiKeys: AIApiKey[];
}
