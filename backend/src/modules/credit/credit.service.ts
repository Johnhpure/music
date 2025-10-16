import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreditLog, CreditType } from './entities/credit-log.entity';
import { CreditPackage } from './entities/credit-package.entity';
import { UserService } from '@modules/user/user.service';
import { ConsumeCreditDto } from './dto/consume-credit.dto';
import { RewardCreditDto } from './dto/reward-credit.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class CreditService {
  constructor(
    @InjectRepository(CreditLog)
    private readonly creditLogRepository: Repository<CreditLog>,
    @InjectRepository(CreditPackage)
    private readonly creditPackageRepository: Repository<CreditPackage>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async consumeCredit(
    userId: number,
    consumeDto: ConsumeCreditDto,
  ): Promise<CreditLog> {
    const { amount, description, related_id, related_type } = consumeDto;

    return await this.dataSource.transaction(async (manager) => {
      // 使用悲观锁获取用户记录，防止并发问题
      const user = await manager
        .createQueryBuilder()
        .select('user')
        .from('users', 'user')
        .where('user.id = :userId', { userId })
        .setLock('pessimistic_write')
        .getOne();

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      if (Number(user.credit) < amount) {
        throw new BadRequestException('点数不足');
      }

      // 原子性更新点数
      await manager
        .createQueryBuilder()
        .update('users')
        .set({ credit: () => `credit - ${amount}` })
        .where('id = :userId', { userId })
        .execute();

      const newBalance = Number(user.credit) - amount;

      const log = manager.create(CreditLog, {
        user_id: userId,
        type: CreditType.CONSUME,
        amount: -amount,
        balance_after: newBalance,
        description,
        related_id,
        related_type,
      });

      const savedLog = await manager.save(log);
      this.logger.log(
        `点数消费: userId=${userId}, amount=${amount}, balance=${newBalance}`,
        'CreditService',
      );
      return savedLog;
    });
  }

  async rewardCredit(
    userId: number,
    rewardDto: RewardCreditDto,
  ): Promise<CreditLog> {
    const { amount, description, related_id, related_type } = rewardDto;

    return await this.dataSource.transaction(async (manager) => {
      const updatedUser = await this.userService.updateCredit(userId, amount);

      const log = manager.create(CreditLog, {
        user_id: userId,
        type: CreditType.REWARD,
        amount,
        balance_after: Number(updatedUser.credit),
        description,
        related_id,
        related_type,
      });

      const savedLog = await manager.save(log);
      this.logger.log(
        `点数奖励: userId=${userId}, amount=${amount}, balance=${updatedUser.credit}`,
        'CreditService',
      );
      return savedLog;
    });
  }

  async getUserCreditLogs(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const [data, total] = await this.creditLogRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    return this.creditPackageRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async getCreditPackage(id: number): Promise<CreditPackage> {
    const pkg = await this.creditPackageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('套餐不存在');
    }
    return pkg;
  }

  async getUserBalance(
    userId: number,
  ): Promise<{ balance: number; totalEarned: number; totalSpent: number }> {
    const user = await this.userService.findOne(userId);

    const earnedResult = await this.creditLogRepository
      .createQueryBuilder('log')
      .select('SUM(log.amount)', 'total')
      .where('log.user_id = :userId', { userId })
      .andWhere('log.amount > 0')
      .getRawOne();

    const spentResult = await this.creditLogRepository
      .createQueryBuilder('log')
      .select('SUM(ABS(log.amount))', 'total')
      .where('log.user_id = :userId', { userId })
      .andWhere('log.amount < 0')
      .getRawOne();

    return {
      balance: Number(user.credit) || 0,
      totalEarned: Number(earnedResult?.total) || 0,
      totalSpent: Number(spentResult?.total) || 0,
    };
  }
}
