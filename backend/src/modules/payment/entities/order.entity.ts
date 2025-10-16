import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('t_orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  order_no: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int', nullable: true })
  package_id: number;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int', default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 20, default: 'wechat' })
  payment_method: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  transaction_id: string;

  @Column({ type: 'text', nullable: true })
  payment_data: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;
}
