import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIUsageStat } from '../entities/ai-usage-stat.entity';
import { AIApiLog } from '../entities/ai-api-log.entity';

/**
 * AI使用统计服务
 */
@Injectable()
export class AIUsageStatService {
  private readonly logger = new Logger(AIUsageStatService.name);

  constructor(
    @InjectRepository(AIUsageStat)
    private readonly statRepo: Repository<AIUsageStat>,
    @InjectRepository(AIApiLog)
    private readonly logRepo: Repository<AIApiLog>,
  ) {}

  /**
   * 更新每日统计
   * (可以通过定时任务调用,也可以在每次API调用后实时更新)
   */
  async updateDailyStats(
    providerId: number,
    keyId: number,
    date: Date = new Date(),
  ): Promise<void> {
    const statDate = new Date(date.toISOString().split('T')[0]);

    // 查询当天的日志统计
    const stats = await this.logRepo
      .createQueryBuilder('log')
      .select('COUNT(*)', 'totalRequests')
      .addSelect(
        "SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)",
        'successCount',
      )
      .addSelect(
        "SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)",
        'errorCount',
      )
      .addSelect(
        "SUM(CASE WHEN status = 'rate_limited' THEN 1 ELSE 0 END)",
        'rateLimitedCount',
      )
      .addSelect('SUM(log.totalTokens)', 'totalTokens')
      .addSelect('SUM(log.promptTokens)', 'promptTokens')
      .addSelect('SUM(log.completionTokens)', 'completionTokens')
      .addSelect('AVG(log.latencyMs)', 'avgLatencyMs')
      .where('log.providerId = :providerId', { providerId })
      .andWhere('log.keyId = :keyId', { keyId })
      .andWhere('DATE(log.createdAt) = :statDate', {
        statDate: statDate.toISOString().split('T')[0],
      })
      .getRawOne();

    const statData = {
      providerId,
      keyId,
      statDate,
      totalRequests: parseInt(stats.totalRequests) || 0,
      successCount: parseInt(stats.successCount) || 0,
      errorCount: parseInt(stats.errorCount) || 0,
      rateLimitedCount: parseInt(stats.rateLimitedCount) || 0,
      totalTokens: parseInt(stats.totalTokens) || 0,
      promptTokens: parseInt(stats.promptTokens) || 0,
      completionTokens: parseInt(stats.completionTokens) || 0,
      avgLatencyMs: parseInt(stats.avgLatencyMs) || 0,
      totalCost: 0,
    };

    // 使用 upsert 避免并发冲突
    await this.statRepo.upsert(statData, ['providerId', 'keyId', 'statDate']);

    this.logger.debug(
      `Updated stats for provider ${providerId}, key ${keyId}, date ${statDate.toISOString()}`,
    );
  }

  /**
   * 获取统计数据
   */
  async getStats(params: {
    providerId?: number;
    keyId?: number;
    startDate?: Date;
    endDate?: Date;
    groupBy?: 'day' | 'provider' | 'key';
  }): Promise<any[]> {
    const query = this.statRepo.createQueryBuilder('stat');

    if (params.providerId) {
      query.andWhere('stat.providerId = :providerId', {
        providerId: params.providerId,
      });
    }

    if (params.keyId) {
      query.andWhere('stat.keyId = :keyId', { keyId: params.keyId });
    }

    if (params.startDate) {
      query.andWhere('stat.statDate >= :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('stat.statDate <= :endDate', {
        endDate: params.endDate,
      });
    }

    if (params.groupBy === 'day') {
      query
        .select('stat.statDate', 'date')
        .addSelect('SUM(stat.totalRequests)', 'totalRequests')
        .addSelect('SUM(stat.successCount)', 'successCount')
        .addSelect('SUM(stat.errorCount)', 'errorCount')
        .addSelect('SUM(stat.totalTokens)', 'totalTokens')
        .addSelect('SUM(stat.totalCost)', 'totalCost')
        .groupBy('stat.statDate')
        .orderBy('stat.statDate', 'DESC');
    } else if (params.groupBy === 'provider') {
      query
        .select('stat.providerId', 'providerId')
        .addSelect('SUM(stat.totalRequests)', 'totalRequests')
        .addSelect('SUM(stat.successCount)', 'successCount')
        .addSelect('SUM(stat.errorCount)', 'errorCount')
        .addSelect('SUM(stat.totalTokens)', 'totalTokens')
        .addSelect('SUM(stat.totalCost)', 'totalCost')
        .groupBy('stat.providerId');
    } else if (params.groupBy === 'key') {
      query
        .select('stat.keyId', 'keyId')
        .addSelect('SUM(stat.totalRequests)', 'totalRequests')
        .addSelect('SUM(stat.successCount)', 'successCount')
        .addSelect('SUM(stat.errorCount)', 'errorCount')
        .addSelect('SUM(stat.totalTokens)', 'totalTokens')
        .addSelect('SUM(stat.totalCost)', 'totalCost')
        .groupBy('stat.keyId');
    } else {
      query.orderBy('stat.statDate', 'DESC');
    }

    return await query.getRawMany();
  }

  /**
   * 获取聚合统计
   */
  async getAggregatedStats(params: {
    providerId?: number;
    keyId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalRequests: number;
    successCount: number;
    errorCount: number;
    successRate: number;
    totalTokens: number;
    totalCost: number;
    avgLatencyMs: number;
  }> {
    const query = this.statRepo.createQueryBuilder('stat');

    if (params.providerId) {
      query.andWhere('stat.providerId = :providerId', {
        providerId: params.providerId,
      });
    }

    if (params.keyId) {
      query.andWhere('stat.keyId = :keyId', { keyId: params.keyId });
    }

    if (params.startDate) {
      query.andWhere('stat.statDate >= :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('stat.statDate <= :endDate', {
        endDate: params.endDate,
      });
    }

    const result = await query
      .select('SUM(stat.totalRequests)', 'totalRequests')
      .addSelect('SUM(stat.successCount)', 'successCount')
      .addSelect('SUM(stat.errorCount)', 'errorCount')
      .addSelect('SUM(stat.totalTokens)', 'totalTokens')
      .addSelect('SUM(stat.totalCost)', 'totalCost')
      .addSelect('AVG(stat.avgLatencyMs)', 'avgLatencyMs')
      .getRawOne();

    const totalRequests = parseInt(result.totalRequests) || 0;
    const successCount = parseInt(result.successCount) || 0;

    return {
      totalRequests,
      successCount,
      errorCount: parseInt(result.errorCount) || 0,
      successRate: totalRequests > 0 ? successCount / totalRequests : 0,
      totalTokens: parseInt(result.totalTokens) || 0,
      totalCost: parseFloat(result.totalCost) || 0,
      avgLatencyMs: parseInt(result.avgLatencyMs) || 0,
    };
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(params: {
    providerId?: number;
    keyId?: number;
    days?: number;
  }): Promise<
    Array<{
      date: string;
      requests: number;
      tokens: number;
      cost: number;
      successRate: number;
    }>
  > {
    const days = params.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = this.statRepo
      .createQueryBuilder('stat')
      .select('stat.statDate', 'date')
      .addSelect('SUM(stat.totalRequests)', 'requests')
      .addSelect('SUM(stat.totalTokens)', 'tokens')
      .addSelect('SUM(stat.totalCost)', 'cost')
      .addSelect('SUM(stat.successCount)', 'successCount')
      .addSelect('SUM(stat.totalRequests)', 'totalRequests')
      .where('stat.statDate >= :startDate', { startDate })
      .groupBy('stat.statDate')
      .orderBy('stat.statDate', 'ASC');

    if (params.providerId) {
      query.andWhere('stat.providerId = :providerId', {
        providerId: params.providerId,
      });
    }

    if (params.keyId) {
      query.andWhere('stat.keyId = :keyId', { keyId: params.keyId });
    }

    const results = await query.getRawMany();

    return results.map((item) => {
      const totalRequests = parseInt(item.totalRequests) || 0;
      const successCount = parseInt(item.successCount) || 0;

      return {
        date: item.date,
        requests: parseInt(item.requests) || 0,
        tokens: parseInt(item.tokens) || 0,
        cost: parseFloat(item.cost) || 0,
        successRate: totalRequests > 0 ? successCount / totalRequests : 0,
      };
    });
  }
}
