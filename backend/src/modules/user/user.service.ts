import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { openid, phone } = createUserDto;

    // 检查唯一性
    if (openid) {
      const existingUser = await this.userRepository.findOne({
        where: { openid },
      });
      if (existingUser) {
        throw new ConflictException('用户已存在');
      }
    }

    if (phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone },
      });
      if (existingUser) {
        throw new ConflictException('手机号已被使用');
      }
    }

    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    this.logger.log(`用户创建成功: ${savedUser.id}`, 'UserService');
    return savedUser;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByOpenid(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'nickname', 'avatar', 'credit', 'is_admin', 'is_banned', 'openid'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'nickname', 'avatar', 'credit', 'is_admin', 'is_banned', 'openid'],
    });
  }

  async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :identifier OR user.email = :identifier', { identifier })
      .addSelect('user.password')
      .getOne();
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`用户更新成功: ${updatedUser.id}`, 'UserService');
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    this.logger.log(`用户删除成功: ${id}`, 'UserService');
  }

  async updateCredit(userId: number, amount: number): Promise<User> {
    const user = await this.findOne(userId);
    user.credit = Number(user.credit) + amount;

    if (user.credit < 0) {
      throw new ConflictException('点数不足');
    }

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(
      `用户点数更新: userId=${userId}, amount=${amount}, newCredit=${updatedUser.credit}`,
      'UserService',
    );
    return updatedUser;
  }

  // 获取用户统计信息
  async getUserStats(userId: number): Promise<any> {
    const user = await this.findOne(userId);

    // TODO: 实际应该从music_tasks表和credit_logs表聚合统计
    // 这里先返回基本信息
    return {
      totalWorks: 0, // 总作品数
      totalCredits: user.credit, // 当前点数
      consecutiveCheckin: 0, // 连续签到天数
      totalCheckins: 0, // 总签到次数
    };
  }

  // 每日签到
  async checkin(userId: number): Promise<any> {
    const user = await this.findOne(userId);

    // TODO: 实际应该检查今日是否已签到，从checkin_logs表查询
    // 这里简化处理，直接奖励5点
    const creditReward = 5;
    await this.updateCredit(userId, creditReward);

    const updatedUser = await this.findOne(userId);

    this.logger.log(
      `用户签到成功: userId=${userId}, reward=${creditReward}`,
      'UserService',
    );

    return {
      success: true,
      creditReward: creditReward,
      totalCredit: updatedUser.credit,
      consecutiveDays: 1, // TODO: 实际应该从签到记录计算
      message: '签到成功',
    };
  }

  // 获取签到历史
  async getCheckinHistory(userId: number): Promise<any> {
    // TODO: 实际应该从checkin_logs表查询
    // 这里先返回模拟数据
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11

    // 获取本月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 模拟本月的签到记录（实际应该从数据库查询）
    const checkedDays: number[] = [];
    const currentDay = now.getDate();

    // 假设用户本月每天都签到了
    for (let i = 1; i < currentDay; i++) {
      checkedDays.push(i);
    }

    // 检查今天是否已签到
    const todayChecked = false; // TODO: 从数据库查询

    this.logger.log(
      `获取签到历史: userId=${userId}, month=${month + 1}, checkedDays=${checkedDays.length}`,
      'UserService',
    );

    return {
      year,
      month: month + 1,
      daysInMonth,
      checkedDays,
      todayChecked,
      consecutiveDays: checkedDays.length, // TODO: 实际计算连续签到天数
    };
  }

  // ==================== 管理员专用方法 ====================

  // 高级筛选查询用户列表
  async findAllWithFilters(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'banned' | 'pending';
    userType?: 'free' | 'vip' | 'admin';
    registrationSource?: 'wechat' | 'web' | 'mobile' | 'unknown';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      userType,
      registrationSource,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = params;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // 搜索条件：用户名、邮箱、手机号
    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search OR user.phone LIKE :search OR user.nickname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 用户类型筛选
    if (userType) {
      queryBuilder.andWhere('user.user_type = :userType', { userType });
    }

    // 注册来源筛选
    if (registrationSource) {
      queryBuilder.andWhere('user.registration_source = :registrationSource', {
        registrationSource,
      });
    }

    // 状态筛选
    if (status) {
      if (status === 'banned') {
        queryBuilder.andWhere('user.is_banned = :is_banned', { is_banned: true });
      } else if (status === 'pending') {
        queryBuilder.andWhere('user.last_login_at IS NULL');
      } else if (status === 'inactive') {
        queryBuilder.andWhere('user.last_login_at IS NOT NULL');
        queryBuilder.andWhere('user.last_login_at < :thirtyDaysAgo', {
          thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        });
        queryBuilder.andWhere('user.is_banned = :is_banned', { is_banned: false });
      } else if (status === 'active') {
        queryBuilder.andWhere('user.last_login_at IS NOT NULL');
        queryBuilder.andWhere('user.last_login_at >= :thirtyDaysAgo', {
          thirtyDaysAgo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        });
        queryBuilder.andWhere('user.is_banned = :is_banned', { is_banned: false });
      }
    }

    // 排序
    const allowedSortFields = ['created_at', 'last_login_at', 'credit_balance', 'username'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    // 分页
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    this.logger.log(
      `管理员查询用户列表: page=${page}, limit=${limit}, total=${total}, filters=${JSON.stringify(params)}`,
      'UserService',
    );

    return { data, total, page, limit };
  }

  // 切换用户封禁状态
  async toggleBan(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    user.is_banned = !user.is_banned;
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `用户封禁状态切换: userId=${userId}, is_banned=${updatedUser.is_banned}`,
      'UserService',
    );

    return updatedUser;
  }

  // 批量封禁用户
  async batchBan(userIds: number[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const user = await this.findOne(userId);
        if (!user.is_banned) {
          user.is_banned = true;
          await this.userRepository.save(user);
          success++;
        }
      } catch (error) {
        this.logger.error(`批量封禁失败: userId=${userId}, error=${error.message}`, 'UserService');
        failed++;
      }
    }

    this.logger.log(`批量封禁完成: success=${success}, failed=${failed}`, 'UserService');
    return { success, failed };
  }

  // 批量激活用户
  async batchActivate(userIds: number[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        const user = await this.findOne(userId);
        if (user.is_banned) {
          user.is_banned = false;
          await this.userRepository.save(user);
          success++;
        }
      } catch (error) {
        this.logger.error(`批量激活失败: userId=${userId}, error=${error.message}`, 'UserService');
        failed++;
      }
    }

    this.logger.log(`批量激活完成: success=${success}, failed=${failed}`, 'UserService');
    return { success, failed };
  }

  // 批量删除用户
  async batchDelete(userIds: number[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.remove(userId);
        success++;
      } catch (error) {
        this.logger.error(`批量删除失败: userId=${userId}, error=${error.message}`, 'UserService');
        failed++;
      }
    }

    this.logger.log(`批量删除完成: success=${success}, failed=${failed}`, 'UserService');
    return { success, failed };
  }

  // 调整用户积分（管理员）
  async adjustCredit(
    userId: number,
    amount: number,
    reason?: string,
  ): Promise<User> {
    const user = await this.findOne(userId);
    const oldCredit = user.credit;
    user.credit = Number(user.credit) + amount;

    if (user.credit < 0) {
      user.credit = 0;
    }

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(
      `管理员调整用户积分: userId=${userId}, oldCredit=${oldCredit}, amount=${amount}, newCredit=${updatedUser.credit}, reason=${reason || 'N/A'}`,
      'UserService',
    );

    return updatedUser;
  }

  // 获取用户统计数据（管理员仪表板）
  async getAdminStats(): Promise<{
    total: number;
    active: number;
    newUsers: number;
    vipUsers: number;
    bannedUsers: number;
  }> {
    const total = await this.userRepository.count();
    const bannedUsers = await this.userRepository.count({
      where: { is_banned: true },
    });
    const vipUsers = await this.userRepository.count({
      where: { user_type: 'vip' },
    });

    // 活跃用户：30天内登录过
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const active = await this.userRepository
      .createQueryBuilder('user')
      .where('user.last_login_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('user.is_banned = :is_banned', { is_banned: false })
      .getCount();

    // 新用户：7天内注册
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    return {
      total,
      active,
      newUsers,
      vipUsers,
      bannedUsers,
    };
  }

  // 更新最后登录时间
  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      last_login_at: new Date(),
    });
  }
}
