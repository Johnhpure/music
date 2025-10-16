import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';

@Entity('t_admin_logs')
export class AdminLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id' })
  adminId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100 })
  resource: string;

  @Column({ name: 'resource_id', length: 50, nullable: true })
  resourceId?: string;

  @Column({ type: 'json', nullable: true })
  details?: any;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
