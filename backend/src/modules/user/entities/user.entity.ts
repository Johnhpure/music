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

  @Column({ unique: true, nullable: true })
  openid?: string;

  @Column({ nullable: true })
  unionid?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true, select: false })
  password?: string;

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

  @Column({ 
    name: 'last_login_at', 
    type: 'timestamp', 
    nullable: true,
    comment: '最后登录时间'
  })
  last_login_at?: Date;

  @Column({ 
    name: 'registration_source',
    type: 'enum',
    enum: ['wechat', 'web', 'mobile', 'unknown'],
    default: 'unknown',
    comment: '注册来源'
  })
  registration_source: 'wechat' | 'web' | 'mobile' | 'unknown';

  @Column({ 
    name: 'user_type',
    type: 'enum',
    enum: ['free', 'vip', 'admin'],
    default: 'free',
    comment: '用户类型'
  })
  user_type: 'free' | 'vip' | 'admin';

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

  // 新增虚拟属性：用户状态
  get status(): 'active' | 'inactive' | 'banned' | 'pending' {
    if (this.is_banned) return 'banned';
    if (this.last_login_at) {
      const daysSinceLogin = (Date.now() - this.last_login_at.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin > 30 ? 'inactive' : 'active';
    }
    return 'pending';
  }

  // 总积分（别名，前端兼容性）
  get totalCredits(): number {
    return this.credit;
  }
}
