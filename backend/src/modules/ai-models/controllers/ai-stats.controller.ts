import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AILogService } from '../services/ai-log.service';
import { AIUsageStatService } from '../services/ai-usage-stat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';

/**
 * AI统计Controller
 */
@Controller('admin/ai-stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AIStatsController {
  constructor(
    private readonly logService: AILogService,
    private readonly usageStatService: AIUsageStatService,
  ) {}

  // ========== 调用日志 ==========

  @Get('logs')
  async getLogs(
    @Query('providerId') providerId?: number,
    @Query('keyId') keyId?: number,
    @Query('userId') userId?: number,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    const result = await this.logService.queryLogs({
      providerId,
      keyId,
      userId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page || 1,
      pageSize: pageSize || 50,
    });

    return {
      code: 200,
      data: {
        logs: result.logs,
        total: result.total,
        page: page || 1,
        pageSize: pageSize || 50,
        totalPages: Math.ceil(result.total / (pageSize || 50)),
      },
    };
  }

  @Get('logs/errors')
  async getErrorStats(
    @Query('providerId') providerId?: number,
    @Query('keyId') keyId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.logService.getErrorStats({
      providerId,
      keyId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { code: 200, data: stats };
  }

  // ========== 使用统计 ==========

  @Get('usage')
  async getUsageStats(
    @Query('providerId') providerId?: number,
    @Query('keyId') keyId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'provider' | 'key',
  ) {
    const stats = await this.usageStatService.getStats({
      providerId,
      keyId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      groupBy,
    });

    return { code: 200, data: stats };
  }

  @Get('usage/aggregated')
  async getAggregatedStats(
    @Query('providerId') providerId?: number,
    @Query('keyId') keyId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.usageStatService.getAggregatedStats({
      providerId,
      keyId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return { code: 200, data: stats };
  }

  @Get('usage/trend')
  async getTrendData(
    @Query('providerId') providerId?: number,
    @Query('keyId') keyId?: number,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    const trend = await this.usageStatService.getTrendData({
      providerId,
      keyId,
      days: days || 30,
    });

    return { code: 200, data: trend };
  }

  // ========== 仪表盘统计 ==========

  @Get('dashboard')
  async getDashboardStats(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    const daysCount = days || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const [aggregated, trend, errors] = await Promise.all([
      this.usageStatService.getAggregatedStats({
        startDate,
      }),
      this.usageStatService.getTrendData({
        days: daysCount,
      }),
      this.logService.getErrorStats({
        startDate,
      }),
    ]);

    return {
      code: 200,
      data: {
        summary: aggregated,
        trend,
        errors,
      },
    };
  }
}
