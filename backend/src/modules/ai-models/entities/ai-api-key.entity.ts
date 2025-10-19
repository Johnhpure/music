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

  @Column({
    name: 'provider_id',
    type: 'int',
    unsigned: true,
    comment: '供应商ID',
  })
  providerId: number;

  @Column({ name: 'key_name', length: 100, comment: '密钥名称' })
  keyName: string;

  @Column({ name: 'api_key', length: 500, comment: 'API密钥(加密存储)' })
  apiKey: string;

  @Column({
    name: 'base_url',
    length: 200,
    nullable: true,
    comment: 'API基础URL(可覆盖供应商默认值)',
  })
  baseUrl: string;

  @Column({ type: 'int', default: 0, comment: '优先级(数字越大优先级越高)' })
  priority: number;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ['normal', 'rate_limited', 'error', 'exhausted'],
    default: 'normal',
    comment: '密钥状态',
  })
  status: string;

  @Column({
    name: 'rate_limit_rpm',
    type: 'int',
    unsigned: true,
    default: 60,
    comment: '每分钟请求数限制',
  })
  rateLimitRpm: number;

  @Column({
    name: 'rate_limit_tpm',
    type: 'int',
    unsigned: true,
    default: 90000,
    comment: '每分钟Token数限制',
  })
  rateLimitTpm: number;

  @Column({
    name: 'rate_limit_rpd',
    type: 'int',
    unsigned: true,
    default: 10000,
    comment: '每天请求数限制',
  })
  rateLimitRpd: number;

  @Column({
    name: 'requests_count_today',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '今日请求次数',
  })
  requestsCountToday: number;

  @Column({
    name: 'tokens_count_today',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '今日Token使用量',
  })
  tokensCountToday: number;

  @Column({
    name: 'errors_count_today',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '今日错误次数',
  })
  errorsCountToday: number;

  @Column({
    name: 'requests_count_total',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总请求次数',
  })
  requestsCountTotal: number;

  @Column({
    name: 'tokens_count_total',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总Token使用量',
  })
  tokensCountTotal: number;

  @Column({
    name: 'last_used_at',
    type: 'timestamp',
    nullable: true,
    comment: '最后使用时间',
  })
  lastUsedAt: Date;

  @Column({
    name: 'last_error_at',
    type: 'timestamp',
    nullable: true,
    comment: '最后错误时间',
  })
  lastErrorAt: Date;

  @Column({
    name: 'last_error_msg',
    type: 'text',
    nullable: true,
    comment: '最后错误信息',
  })
  lastErrorMsg: string;

  @Column({
    name: 'stats_reset_at',
    type: 'date',
    nullable: true,
    comment: '统计重置日期',
  })
  statsResetAt: Date;

  @Column({
    name: 'config_json',
    type: 'json',
    nullable: true,
    comment: '额外配置(JSON格式)',
  })
  configJson: any;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => AIProvider, (provider) => provider.apiKeys)
  @JoinColumn({ name: 'provider_id' })
  provider: AIProvider;
}
