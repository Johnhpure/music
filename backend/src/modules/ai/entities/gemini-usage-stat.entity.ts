import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_gemini_usage_stats')
export class GeminiUsageStat {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '统计ID' })
  id: number;

  @Column({ type: 'int', unsigned: true, comment: '密钥ID' })
  keyId: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: string;

  @Column({ length: 100, nullable: true, comment: '模型名称' })
  modelName: string;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '总请求数' })
  totalRequests: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '成功次数' })
  successCount: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '错误次数' })
  errorCount: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '限流次数' })
  rateLimitedCount: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总Prompt Token',
  })
  totalPromptTokens: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总完成Token',
  })
  totalCompletionTokens: number;

  @Column({ type: 'bigint', unsigned: true, default: 0, comment: '总Token数' })
  totalTokens: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '平均延迟(毫秒)',
  })
  avgLatencyMs: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '最大延迟(毫秒)',
  })
  maxLatencyMs: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: '最小延迟(毫秒)',
  })
  minLatencyMs: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    comment: '预估成本(USD)',
  })
  estimatedCost: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
