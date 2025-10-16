import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/entities/user.entity';

export enum CreditType {
  CONSUME = 'consume',
  REWARD = 'reward',
  PURCHASE = 'purchase',
  REFUND = 'refund',
}

@Entity('t_credit_logs')
export class CreditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: CreditType })
  type: CreditType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_after: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  related_id: number;

  @Column({ nullable: true })
  related_type: string;

  @CreateDateColumn()
  created_at: Date;
}
