import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Gemini API密钥组实体
 * 支持多KEY轮询策略
 */
@Entity('t_gemini_key_groups')
export class GeminiKeyGroup {
  @PrimaryGeneratedColumn({ comment: '密钥组ID' })
  id: number;

  @Column({ name: 'group_name', length: 100, comment: '密钥组名称' })
  groupName: string;

  @Column({
    name: 'rotation_strategy',
    type: 'enum',
    enum: ['sequential', 'failover'],
    default: 'sequential',
    comment: '轮询策略: sequential=顺序轮询, failover=故障切换',
  })
  rotationStrategy: 'sequential' | 'failover';

  @Column({
    name: 'api_keys',
    type: 'json',
    comment:
      'API密钥数组，格式: [{key: string, status: string, errorCount: number, lastUsedAt: Date}]',
  })
  apiKeys: Array<{
    key: string;
    status: 'active' | 'error' | 'exhausted';
    errorCount: number;
    lastUsedAt: Date | null;
    lastErrorMsg: string | null;
  }>;

  @Column({
    name: 'current_key_index',
    type: 'int',
    default: 0,
    comment: '当前使用的KEY索引（用于顺序轮询）',
  })
  currentKeyIndex: number;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 1,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    name: 'base_url',
    length: 200,
    nullable: true,
    comment: 'API基础URL（可选）',
  })
  baseUrl: string;

  @Column({
    name: 'requests_count_total',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '总请求次数',
  })
  requestsCountTotal: number;

  @Column({
    name: 'success_count_total',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '成功请求次数',
  })
  successCountTotal: number;

  @Column({
    name: 'error_count_total',
    type: 'bigint',
    unsigned: true,
    default: 0,
    comment: '错误请求次数',
  })
  errorCountTotal: number;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
