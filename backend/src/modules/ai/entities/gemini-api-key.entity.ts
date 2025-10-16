import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_gemini_api_keys')
export class GeminiApiKey {
  @PrimaryGeneratedColumn({ comment: '密钥ID' })
  id: number;

  @Column({ length: 100, comment: '密钥名称' })
  keyName: string;

  @Column({ length: 500, comment: 'API密钥(加密存储)' })
  apiKey: string;

  @Column({
    length: 200,
    default: 'https://generativelanguage.googleapis.com',
    comment: 'API基础URL',
  })
  baseUrl: string;

  @Column({ default: 0, comment: '优先级(数字越大优先级越高)' })
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
    default: 15,
    comment: '每分钟请求数限制',
  })
  rateLimitRpm: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 32000,
    comment: '每分钟Token数限制',
  })
  rateLimitTpm: number;

  @Column({
    type: 'int',
    unsigned: true,
    default: 1500,
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

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
