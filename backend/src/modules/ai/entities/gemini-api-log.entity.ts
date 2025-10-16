import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('t_gemini_api_logs')
export class GeminiApiLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '日志ID' })
  id: number;

  @Column({ type: 'int', unsigned: true, comment: '使用的密钥ID' })
  keyId: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '用户ID' })
  userId: number;

  @Column({ length: 100, comment: '使用的模型名称' })
  modelName: string;

  @Column({ length: 50, comment: '请求类型' })
  requestType: string;

  @Column({
    type: 'int',
    unsigned: true,
    default: 0,
    comment: 'Prompt Token数量',
  })
  promptTokens: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '完成Token数量' })
  completionTokens: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '总Token数量' })
  totalTokens: number;

  @Column({ type: 'json', nullable: true, comment: '请求参数(仅保存关键信息)' })
  requestPayload: any;

  @Column({ type: 'text', nullable: true, comment: '响应摘要' })
  responseSummary: string;

  @Column({ length: 50, nullable: true, comment: '错误码' })
  errorCode: string;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;

  @Column({
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '响应延迟(毫秒)',
  })
  latencyMs: number;

  @Column({
    type: 'enum',
    enum: ['success', 'error', 'rate_limited'],
    comment: '调用状态',
  })
  status: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
