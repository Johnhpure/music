import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@common/guards/admin.guard';
import { EncryptionService } from '@common/services/encryption.service';
import { GeminiApiKey } from './entities/gemini-api-key.entity';
import { GeminiModel } from './entities/gemini-model.entity';
import { GeminiApiLog } from './entities/gemini-api-log.entity';
import { GeminiUsageStat } from './entities/gemini-usage-stat.entity';
import { GeminiKeyManagerService } from './services/gemini-key-manager.service';
import {
  CreateGeminiApiKeyDto,
  UpdateGeminiApiKeyDto,
  QueryGeminiStatsDto,
} from './dto/gemini-api-key.dto';
import {
  CreateGeminiModelDto,
  UpdateGeminiModelDto,
} from './dto/gemini-model.dto';

@Controller('admin/gemini')
@UseGuards(JwtAuthGuard, AdminGuard)
export class GeminiAdminController {
  constructor(
    @InjectRepository(GeminiApiKey)
    private readonly keyRepository: Repository<GeminiApiKey>,
    @InjectRepository(GeminiModel)
    private readonly modelRepository: Repository<GeminiModel>,
    @InjectRepository(GeminiApiLog)
    private readonly logRepository: Repository<GeminiApiLog>,
    @InjectRepository(GeminiUsageStat)
    private readonly statRepository: Repository<GeminiUsageStat>,
    private readonly keyManager: GeminiKeyManagerService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ==================== API密钥管理 ====================

  /**
   * 获取所有API密钥列表
   */
  @Get('keys')
  async getApiKeys() {
    return await this.keyManager.getKeysStats();
  }

  /**
   * 创建新的API密钥
   */
  @Post('keys')
  async createApiKey(@Body() dto: CreateGeminiApiKeyDto) {
    // 加密API密钥
    const encryptedApiKey = await this.encryptionService.encrypt(dto.apiKey);
    const key = this.keyRepository.create({
      ...dto,
      apiKey: encryptedApiKey,
    });
    const saved = await this.keyRepository.save(key);
    // 返回时隐藏实际密钥
    const { apiKey, ...safeData } = saved;
    return {
      code: 200,
      message: '创建成功',
      data: {
        ...safeData,
        apiKey: '***已加密***',
      },
    };
  }

  /**
   * 更新API密钥配置
   */
  @Put('keys/:id')
  async updateApiKey(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeminiApiKeyDto,
  ) {
    // 如果更新包含apiKey字段，需要加密
    if (dto.apiKey) {
      dto.apiKey = await this.encryptionService.encrypt(dto.apiKey);
    }
    await this.keyRepository.update(id, dto);
    const updated = await this.keyRepository.findOne({ where: { id } });
    // 返回时隐藏实际密钥
    const { apiKey, ...safeData } = updated;
    return {
      code: 200,
      message: '更新成功',
      data: {
        ...safeData,
        apiKey: apiKey ? '***已加密***' : undefined,
      },
    };
  }

  /**
   * 删除API密钥
   */
  @Delete('keys/:id')
  async deleteApiKey(@Param('id', ParseIntPipe) id: number) {
    await this.keyRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }

  /**
   * 测试API密钥是否可用
   */
  @Post('keys/:id/test')
  async testApiKey(@Param('id', ParseIntPipe) id: number) {
    const key = await this.keyRepository.findOne({ where: { id } });
    if (!key) {
      return { code: 404, message: '密钥不存在' };
    }

    try {
      // 解密API密钥
      const decryptedApiKey = await this.encryptionService.decrypt(key.apiKey);
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(decryptedApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent('Hello');
      const response = await result.response;
      const text = response.text();

      return {
        code: 200,
        message: '测试成功',
        data: {
          keyName: key.keyName,
          testResponse: text.substring(0, 100),
        },
      };
    } catch (error) {
      return {
        code: 500,
        message: '测试失败',
        error: error.message,
      };
    }
  }

  /**
   * 重置密钥今日统计
   */
  @Post('keys/:id/reset-stats')
  async resetKeyStats(@Param('id', ParseIntPipe) id: number) {
    const today = new Date().toISOString().split('T')[0];
    await this.keyRepository.update(id, {
      requestsCountToday: 0,
      tokensCountToday: 0,
      errorsCountToday: 0,
      statsResetAt: new Date(today),
      status: 'normal',
    });
    return { code: 200, message: '重置成功' };
  }

  // ==================== 模型管理 ====================

  /**
   * 获取所有模型配置
   */
  @Get('models')
  async getModels() {
    const models = await this.modelRepository.find({
      order: { sortOrder: 'DESC', id: 'ASC' },
    });
    return { code: 200, data: models };
  }

  /**
   * 获取可用的模型列表（从Gemini API获取）
   */
  @Get('models/available')
  async getAvailableModels() {
    try {
      // 获取一个可用的key
      const keyInfo = await this.keyManager.getNextAvailableKey();
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(keyInfo.apiKey);

      // 注意：Gemini API目前没有直接列出所有模型的接口
      // 这里返回已知的模型列表
      const knownModels = [
        { name: 'gemini-pro', displayName: 'Gemini Pro' },
        { name: 'gemini-pro-vision', displayName: 'Gemini Pro Vision' },
        { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
        { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
        { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash' },
      ];

      return { code: 200, data: knownModels };
    } catch (error) {
      return {
        code: 500,
        message: '获取模型列表失败',
        error: error.message,
      };
    }
  }

  /**
   * 创建模型配置
   */
  @Post('models')
  async createModel(@Body() dto: CreateGeminiModelDto) {
    const model = this.modelRepository.create(dto);
    const saved = await this.modelRepository.save(model);
    return { code: 200, message: '创建成功', data: saved };
  }

  /**
   * 更新模型配置
   */
  @Put('models/:id')
  async updateModel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeminiModelDto,
  ) {
    // 如果设置为默认模型，先取消其他模型的默认状态
    if (dto.isDefault) {
      await this.modelRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    await this.modelRepository.update(id, dto);
    const updated = await this.modelRepository.findOne({ where: { id } });
    return { code: 200, message: '更新成功', data: updated };
  }

  /**
   * 删除模型配置
   */
  @Delete('models/:id')
  async deleteModel(@Param('id', ParseIntPipe) id: number) {
    await this.modelRepository.delete(id);
    return { code: 200, message: '删除成功' };
  }

  // ==================== 调用日志查询 ====================

  /**
   * 获取API调用日志
   */
  @Get('logs')
  async getApiLogs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('keyId') keyId?: number,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (keyId) where.keyId = keyId;
    if (status) where.status = status;

    const [logs, total] = await this.logRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip,
    });

    return {
      code: 200,
      data: {
        items: logs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // ==================== 使用统计 ====================

  /**
   * 获取使用统计
   */
  @Get('stats')
  async getStats(@Query() query: QueryGeminiStatsDto) {
    const where: any = {};

    if (query.keyId) where.keyId = query.keyId;
    if (query.modelName) where.modelName = query.modelName;

    if (query.startDate && query.endDate) {
      where.statDate = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.statDate = query.startDate;
    }

    const stats = await this.statRepository.find({
      where,
      order: { statDate: 'DESC' },
      take: 30,
    });

    return { code: 200, data: stats };
  }

  /**
   * 获取今日统计概览
   */
  @Get('stats/today')
  async getTodayStats() {
    const today = new Date().toISOString().split('T')[0];

    // 从API日志中实时统计今日数据
    const logs = await this.logRepository
      .createQueryBuilder('log')
      .where('DATE(log.created_at) = :today', { today })
      .select([
        'COUNT(*) as totalRequests',
        'SUM(CASE WHEN log.status = "success" THEN 1 ELSE 0 END) as successCount',
        'SUM(CASE WHEN log.status = "error" THEN 1 ELSE 0 END) as errorCount',
        'SUM(CASE WHEN log.status = "rate_limited" THEN 1 ELSE 0 END) as rateLimitedCount',
        'SUM(log.total_tokens) as totalTokens',
        'AVG(log.latency_ms) as avgLatency',
      ])
      .getRawOne();

    // 获取各个key的今日统计
    const keys = await this.keyRepository.find({
      where: { isActive: true },
      select: [
        'id',
        'keyName',
        'requestsCountToday',
        'tokensCountToday',
        'errorsCountToday',
      ],
    });

    return {
      code: 200,
      data: {
        overview: logs,
        keyStats: keys,
      },
    };
  }

  /**
   * 获取趋势统计（最近7天）
   */
  @Get('stats/trend')
  async getTrendStats() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const stats = await this.statRepository
      .createQueryBuilder('stat')
      .where('stat.stat_date >= :startDate', {
        startDate: startDate.toISOString().split('T')[0],
      })
      .andWhere('stat.stat_date <= :endDate', {
        endDate: endDate.toISOString().split('T')[0],
      })
      .select([
        'stat.stat_date as date',
        'SUM(stat.total_requests) as totalRequests',
        'SUM(stat.total_tokens) as totalTokens',
        'SUM(stat.success_count) as successCount',
        'SUM(stat.error_count) as errorCount',
      ])
      .groupBy('stat.stat_date')
      .orderBy('stat.stat_date', 'ASC')
      .getRawMany();

    return { code: 200, data: stats };
  }
}
