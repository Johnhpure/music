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

  @Column({ type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ type: 'int', unsigned: true, comment: '密钥ID' })
  keyId: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: Date;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '总请求数' })
  totalRequests: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '成功次数' })
  successCount: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '错误次数' })
  errorCount: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '限流次数' })
  rateLimitedCount: number;

  @Column({ type: 'bigint', unsigned: true, default: 0, comment: '总Token数' })
  totalTokens: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: 'Prompt Token总数',
  })
  promptTokens: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '完成Token总数',
  })
  completionTokens: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 6,
    default: 0,
    comment: '总成本(美元)',
  })
  totalCost: number;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '平均延迟(毫秒)',
  })
  avgLatencyMs: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
