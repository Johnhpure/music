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

  // Email authentication is not supported in current database schema
  // async findByEmail(email: string): Promise<User | null> {
  //   return null;
  // }

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

  // Password authentication is not supported in current database schema
  // async validatePassword(user: User, password: string): Promise<boolean> {
  //   return false;
  // }

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
}
