import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * AI API调用日志实体
 */
@Entity('t_ai_api_logs')
export class AIApiLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '日志ID' })
  id: number;

  @Column({ name: 'provider_id', type: 'int', unsigned: true, comment: '供应商ID' })
  providerId: number;

  @Column({ name: 'model_id', type: 'int', unsigned: true, nullable: true, comment: '模型ID' })
  modelId: number;

  @Column({ name: 'key_id', type: 'int', unsigned: true, comment: '使用的密钥ID' })
  keyId: number;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true, comment: '用户ID' })
  userId: number;

  @Column({ name: 'request_type', length: 50, comment: '请求类型' })
  requestType: string;

  @Column({ name: 'model_code', length: 100, comment: '使用的模型代码' })
  modelCode: string;

  @Column({
    name: 'prompt_tokens',
    type: 'int',
    unsigned: true,
    default: 0,
    comment: 'Prompt Token数量',
  })
  promptTokens: number;

  @Column({ name: 'completion_tokens', type: 'int', unsigned: true, default: 0, comment: '完成Token数量' })
  completionTokens: number;

  @Column({ name: 'total_tokens', type: 'int', unsigned: true, default: 0, comment: '总Token数量' })
  totalTokens: number;

  @Column({ name: 'request_payload', type: 'json', nullable: true, comment: '请求参数(仅保存关键信息)' })
  requestPayload: any;

  @Column({ name: 'response_summary', type: 'text', nullable: true, comment: '响应摘要' })
  responseSummary: string;

  @Column({ name: 'error_code', length: 50, nullable: true, comment: '错误码' })
  errorCode: string;

  @Column({ name: 'error_message', type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;

  @Column({
    name: 'latency_ms',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '响应延迟(毫秒)',
  })
  latencyMs: number;

  @Column({
    type: 'enum',
    enum: ['success', 'error', 'rate_limited', 'timeout'],
    comment: '调用状态',
  })
  status: string;

  @Column({ name: 'ip_address', length: 50, nullable: true, comment: '请求IP' })
  ipAddress: string;

  @Column({ name: 'user_agent', length: 500, nullable: true, comment: 'User Agent' })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
