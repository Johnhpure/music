import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('t_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  openid: string;

  @Column({ nullable: true })
  unionid?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'nick_name' })
  nickname: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatar?: string;

  @Column({ name: 'credit_balance', type: 'int', unsigned: true, default: 100 })
  credit: number;

  @Column({ name: 'is_banned', type: 'tinyint', width: 1, default: 0 })
  is_banned: boolean;

  @Column({ name: 'is_admin', type: 'tinyint', width: 1, default: 0 })
  is_admin: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 虚拟属性：用于向后兼容
  get role(): UserRole {
    return this.is_admin ? UserRole.ADMIN : UserRole.USER;
  }

  get is_active(): boolean {
    return !this.is_banned;
  }
}
