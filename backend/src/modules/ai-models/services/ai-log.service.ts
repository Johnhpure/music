import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIApiLog } from '../entities/ai-api-log.entity';

/**
 * AI API调用日志服务
 */
@Injectable()
export class AILogService {
  private readonly logger = new Logger(AILogService.name);

  constructor(
    @InjectRepository(AIApiLog)
    private readonly logRepo: Repository<AIApiLog>,
  ) {}

  /**
   * 记录API调用日志
   */
  async logApiCall(data: {
    providerId: number;
    modelId?: number;
    keyId: number;
    userId?: number;
    requestType: string;
    modelCode: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestPayload?: any;
    responseSummary?: string;
    errorCode?: string;
    errorMessage?: string;
    latencyMs?: number;
    status: 'success' | 'error' | 'rate_limited' | 'timeout';
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AIApiLog> {
    try {
      const log = this.logRepo.create({
        providerId: data.providerId,
        modelId: data.modelId,
        keyId: data.keyId,
        userId: data.userId,
        requestType: data.requestType,
        modelCode: data.modelCode,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        requestPayload: data.requestPayload,
        responseSummary: data.responseSummary,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        latencyMs: data.latencyMs,
        status: data.status,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      return await this.logRepo.save(log);
    } catch (error) {
      this.logger.error(`Failed to save API log: ${error.message}`);
      // 日志记录失败不应该影响主流程
      return null;
    }
  }

  /**
   * 查询API调用日志
   */
  async queryLogs(params: {
    providerId?: number;
    keyId?: number;
    userId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<{ logs: AIApiLog[]; total: number }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const skip = (page - 1) * pageSize;

    const query = this.logRepo.createQueryBuilder('log');

    if (params.providerId) {
      query.andWhere('log.providerId = :providerId', {
        providerId: params.providerId,
      });
    }

    if (params.keyId) {
      query.andWhere('log.keyId = :keyId', { keyId: params.keyId });
    }

    if (params.userId) {
      query.andWhere('log.userId = :userId', { userId: params.userId });
    }

    if (params.status) {
      query.andWhere('log.status = :status', { status: params.status });
    }

    if (params.startDate) {
      query.andWhere('log.createdAt >= :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('log.createdAt <= :endDate', {
        endDate: params.endDate,
      });
    }

    query.orderBy('log.createdAt', 'DESC');
    query.skip(skip).take(pageSize);

    const [logs, total] = await query.getManyAndCount();

    return { logs, total };
  }

  /**
   * 获取错误日志统计
   */
  async getErrorStats(params: {
    providerId?: number;
    keyId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalErrors: number;
    errorsByCode: { code: string; count: number }[];
    errorsByKey: { keyId: number; count: number }[];
  }> {
    const query = this.logRepo
      .createQueryBuilder('log')
      .where("log.status = 'error'");

    if (params.providerId) {
      query.andWhere('log.providerId = :providerId', {
        providerId: params.providerId,
      });
    }

    if (params.keyId) {
      query.andWhere('log.keyId = :keyId', { keyId: params.keyId });
    }

    if (params.startDate) {
      query.andWhere('log.createdAt >= :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('log.createdAt <= :endDate', {
        endDate: params.endDate,
      });
    }

    const [totalErrors, errorsByCode, errorsByKey] = await Promise.all([
      query.getCount(),
      this.logRepo
        .createQueryBuilder('log')
        .select('log.errorCode', 'code')
        .addSelect('COUNT(*)', 'count')
        .where("log.status = 'error'")
        .groupBy('log.errorCode')
        .getRawMany(),
      this.logRepo
        .createQueryBuilder('log')
        .select('log.keyId', 'keyId')
        .addSelect('COUNT(*)', 'count')
        .where("log.status = 'error'")
        .groupBy('log.keyId')
        .getRawMany(),
    ]);

    return {
      totalErrors,
      errorsByCode: errorsByCode.map((item) => ({
        code: item.code,
        count: parseInt(item.count),
      })),
      errorsByKey: errorsByKey.map((item) => ({
        keyId: parseInt(item.keyId),
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 清理旧日志
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.logRepo
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned ${result.affected} old logs`);

    return result.affected || 0;
  }
}
