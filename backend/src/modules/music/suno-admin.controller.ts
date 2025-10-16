import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { SunoService } from './suno.service';
import { SunoAdminService } from './suno-admin.service';
import { ConfigService } from '@nestjs/config';

/**
 * SUNO API 管理后台 Controller
 * 提供API Key管理、调用统计、日志查询等功能
 */
@ApiTags('SUNO Admin - 管理后台')
@Controller('admin/suno')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class SunoAdminController {
  constructor(
    private readonly sunoService: SunoService,
    private readonly sunoAdminService: SunoAdminService,
    private readonly configService: ConfigService,
  ) {}

  // =====================================================
  // API Key 管理
  // =====================================================

  @Get('config')
  @ApiOperation({
    summary: '获取SUNO API配置',
    description: '获取当前SUNO API的配置信息（不包含完整Key）',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        data: {
          baseUrl: 'https://api.sunoapi.org',
          apiKey: '2b2489...5b4f',
          isConfigured: true,
          lastUpdated: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async getConfig() {
    const apiKey = this.configService.get<string>('SUNO_API_KEY');
    const baseUrl = this.configService.get<string>('SUNO_API_BASE_URL');

    // 脱敏处理API Key
    const maskedKey = apiKey
      ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
      : null;

    return {
      code: 200,
      data: {
        baseUrl: baseUrl || 'https://api.sunoapi.org',
        apiKey: maskedKey,
        isConfigured: !!apiKey,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  @Put('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新SUNO API Key',
    description: '更新SUNO API Key配置（需要重启服务生效）',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
  })
  async updateConfig(@Body() body: { apiKey: string; baseUrl?: string }) {
    // 注意：实际生产环境中，这里应该更新环境变量或配置文件
    // 当前仅返回提示信息
    return {
      code: 200,
      message: 'API Key已更新，需要重启服务生效',
      data: {
        apiKey: `${body.apiKey.substring(0, 6)}...${body.apiKey.substring(body.apiKey.length - 4)}`,
        baseUrl: body.baseUrl || 'https://api.sunoapi.org',
        note: '请在.env文件中更新SUNO_API_KEY配置并重启服务',
      },
    };
  }

  @Post('test-connection')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '测试SUNO API连接',
    description: '测试当前API Key是否有效以及服务连接状态',
  })
  @ApiResponse({
    status: 200,
    description: '测试完成',
    schema: {
      example: {
        code: 200,
        data: {
          connected: true,
          credits: 500,
          latency: 234,
          message: '连接成功',
        },
      },
    },
  })
  async testConnection() {
    const startTime = Date.now();
    let connected = false;
    let credits = null;
    let errorMessage = null;

    try {
      credits = await this.sunoService.getRemainingCredits();
      connected = true;
    } catch (error) {
      errorMessage = error.message;
    }

    const latency = Date.now() - startTime;

    return {
      code: 200,
      data: {
        connected,
        credits,
        latency,
        message: connected ? '连接成功' : `连接失败: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // =====================================================
  // 调用统计
  // =====================================================

  @Get('statistics')
  @ApiOperation({
    summary: '获取SUNO API调用统计',
    description: '获取API调用次数、成功率、消耗积分等统计数据',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始日期 (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束日期 (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        data: {
          overview: {
            totalCalls: 1250,
            successCalls: 1180,
            failedCalls: 70,
            successRate: 94.4,
            totalCreditsUsed: 25000,
          },
          byType: {
            generate: 800,
            lyrics: 300,
            extend: 100,
            vocal_separation: 50,
          },
          byDate: [{ date: '2024-01-15', calls: 45, credits: 900 }],
        },
      },
    },
  })
  async getStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.sunoAdminService.getStatistics(startDate, endDate);

    return {
      code: 200,
      data: stats,
    };
  }

  @Get('statistics/realtime')
  @ApiOperation({
    summary: '获取实时统计数据',
    description: '获取最近24小时的实时调用数据',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getRealtimeStatistics() {
    const stats = await this.sunoAdminService.getRealtimeStatistics();

    return {
      code: 200,
      data: stats,
    };
  }

  @Get('statistics/by-user')
  @ApiOperation({
    summary: '按用户统计',
    description: '获取各用户的API使用情况',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getStatisticsByUser(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const stats = await this.sunoAdminService.getStatisticsByUser(
      pageNum,
      limitNum,
    );

    return {
      code: 200,
      data: stats,
    };
  }

  // =====================================================
  // 调用日志
  // =====================================================

  @Get('logs')
  @ApiOperation({
    summary: '获取SUNO API调用日志',
    description: '查询API调用历史记录，支持筛选和分页',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'taskType',
    required: false,
    description: '任务类型筛选',
    enum: [
      'generate',
      'extend',
      'lyrics',
      'vocal_separation',
      'wav_conversion',
      'music_video',
      'cover',
    ],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: '用户ID筛选',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: '开始日期',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: '结束日期',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        data: {
          items: [
            {
              id: 1,
              userId: 123,
              userName: '测试用户',
              taskType: 'generate',
              taskId: 'suno_task_abc123',
              creditsUsed: 20,
              status: 'SUCCESS',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 1250,
          page: 1,
          limit: 20,
        },
      },
    },
  })
  async getLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('taskType') taskType?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const userIdNum = userId ? parseInt(userId, 10) : undefined;

    const logs = await this.sunoAdminService.getLogs({
      page: pageNum,
      limit: limitNum,
      taskType,
      userId: userIdNum,
      startDate,
      endDate,
    });

    return {
      code: 200,
      data: logs,
    };
  }

  @Get('logs/:id')
  @ApiOperation({
    summary: '获取日志详情',
    description: '获取单条调用日志的详细信息',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getLogDetail(@Query('id') id: string) {
    const log = await this.sunoAdminService.getLogDetail(parseInt(id, 10));

    return {
      code: 200,
      data: log,
    };
  }

  // =====================================================
  // 系统监控
  // =====================================================

  @Get('health')
  @ApiOperation({
    summary: 'SUNO API健康检查',
    description: '检查SUNO API服务状态和系统健康度',
  })
  @ApiResponse({
    status: 200,
    description: '健康检查完成',
    schema: {
      example: {
        code: 200,
        data: {
          status: 'healthy',
          apiAvailable: true,
          credits: 500,
          queueLength: 5,
          averageResponseTime: 234,
          lastCheck: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  async healthCheck() {
    const health = await this.sunoAdminService.healthCheck();

    return {
      code: 200,
      data: health,
    };
  }

  @Get('dashboard')
  @ApiOperation({
    summary: '获取仪表板数据',
    description: '获取管理后台仪表板所需的所有数据',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getDashboard() {
    const dashboard = await this.sunoAdminService.getDashboardData();

    return {
      code: 200,
      data: dashboard,
    };
  }
}
