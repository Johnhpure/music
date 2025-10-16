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
 * AI API密钥实体
 */
@Entity('t_ai_api_keys')
export class AIApiKey {
  @PrimaryGeneratedColumn({ comment: '密钥ID' })
  id: number;

  @Column({ type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ length: 100, comment: '密钥名称' })
  keyName: string;

  @Column({ length: 500, comment: 'API密钥(加密存储)' })
  apiKey: string;

  @Column({
    length: 200,
    nullable: true,
    comment: 'API基础URL(可覆盖供应商默认值)',
  })
  baseUrl: string;

  @Column({ type: 'int', default: 0, comment: '优先级(数字越大优先级越高)' })
  priority: number;

  @Column({ type: 'tinyint', default: 1, comment: '是否启用' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ['normal', 'rate_limited', 'error', 'exhausted'],
    default: 'normal',
    comment: '密钥状态',
  })
  status: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 60,
    comment: '每分钟请求数限制',
  })
  rateLimitRpm: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 90000,
    comment: '每分钟Token数限制',
  })
  rateLimitTpm: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 10000,
    comment: '每天请求数限制',
  })
  rateLimitRpd: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '今日请求次数' })
  requestsCountToday: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '今日Token使用量',
  })
  tokensCountToday: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '今日错误次数' })
  errorsCountToday: number;

  @Column({ type: 'bigint', unsigned: true, default: 0, comment: '总请求次数' })
  requestsCountTotal: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总Token使用量',
  })
  tokensCountTotal: number;

  @Column({ type: 'timestamp', nullable: true, comment: '最后使用时间' })
  lastUsedAt: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '最后错误时间' })
  lastErrorAt: Date;

  @Column({ type: 'text', nullable: true, comment: '最后错误信息' })
  lastErrorMsg: string;

  @Column({ type: 'date', nullable: true, comment: '统计重置日期' })
  statsResetAt: Date;

  @Column({ type: 'json', nullable: true, comment: '额外配置(JSON格式)' })
  configJson: any;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => AIProvider, (provider) => provider.apiKeys)
  @JoinColumn({ name: 'provider_id' })
  provider: AIProvider;
}
