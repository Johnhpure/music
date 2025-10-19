import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * AI使用统计实体(按天汇总)
 */
@Entity('t_ai_usage_stats')
export class AIUsageStat {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '统计ID' })
  id: number;

  @Column({ name: 'provider_id', type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ name: 'key_id', type: 'int', unsigned: true, comment: '密钥ID' })
  keyId: number;

  @Column({ name: 'stat_date', type: 'date', comment: '统计日期' })
  statDate: Date;

  @Column({ name: 'total_requests', type: 'int', unsigned: true, default: 0, comment: '总请求数' })
  totalRequests: number;

  @Column({ name: 'success_count', type: 'int', unsigned: true, default: 0, comment: '成功次数' })
  successCount: number;

  @Column({ name: 'error_count', type: 'int', unsigned: true, default: 0, comment: '错误次数' })
  errorCount: number;

  @Column({ name: 'rate_limited_count', type: 'int', unsigned: true, default: 0, comment: '限流次数' })
  rateLimitedCount: number;

  @Column({ name: 'total_tokens', type: 'bigint', unsigned: true, default: 0, comment: '总Token数' })
  totalTokens: number;

  @Column({
    name: 'prompt_tokens',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: 'Prompt Token总数',
  })
  promptTokens: number;

  @Column({
    name: 'completion_tokens',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '完成Token总数',
  })
  completionTokens: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 0,
    comment: '总成本(美元)',
  })
  totalCost: number;

  @Column({
    name: 'avg_latency_ms',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '平均延迟(毫秒)',
  })
  avgLatencyMs: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
