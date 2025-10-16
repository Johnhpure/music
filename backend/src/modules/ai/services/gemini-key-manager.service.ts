import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { GeminiApiKey } from '../entities/gemini-api-key.entity';
import { GeminiApiLog } from '../entities/gemini-api-log.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EncryptionService } from '@common/services/encryption.service';

interface KeyUsageInfo {
  keyId: number;
  apiKey: string;
  baseUrl: string;
  canUse: boolean;
  reason?: string;
}

@Injectable()
export class GeminiKeyManagerService {
  private readonly logger = new Logger(GeminiKeyManagerService.name);
  private currentKeyIndex = 0;
  private keysCache: GeminiApiKey[] = [];
  private lastCacheUpdate = 0;
  private readonly CACHE_TTL = 30000; // 30秒缓存

  constructor(
    @InjectRepository(GeminiApiKey)
    private readonly keyRepository: Repository<GeminiApiKey>,
    @InjectRepository(GeminiApiLog)
    private readonly logRepository: Repository<GeminiApiLog>,
    private readonly encryptionService: EncryptionService,
  ) {
    this.refreshKeysCache();
  }

  /**
   * 获取下一个可用的API密钥(Round-Robin策略)
   */
  async getNextAvailableKey(): Promise<KeyUsageInfo> {
    await this.refreshKeysCacheIfNeeded();

    if (this.keysCache.length === 0) {
      throw new BadRequestException(
        '没有可用的Gemini API密钥，请先在管理后台配置',
      );
    }

    const totalKeys = this.keysCache.length;
    let attempts = 0;

    // 尝试找到一个可用的key，最多尝试所有key一遍
    while (attempts < totalKeys) {
      const key = this.keysCache[this.currentKeyIndex];
      this.currentKeyIndex = (this.currentKeyIndex + 1) % totalKeys;
      attempts++;

      const usageCheck = await this.checkKeyUsage(key);

      if (usageCheck.canUse) {
        this.logger.log(
          `Selected API key: ${key.keyName} (ID: ${key.id}, Priority: ${key.priority})`,
        );
        // 解密API密钥
        const decryptedApiKey = await this.encryptionService.decrypt(
          key.apiKey,
        );
        return {
          keyId: key.id,
          apiKey: decryptedApiKey,
          baseUrl: key.baseUrl,
          canUse: true,
        };
      } else {
        this.logger.warn(
          `Skip key ${key.keyName} (ID: ${key.id}): ${usageCheck.reason}`,
        );
      }
    }

    throw new BadRequestException(
      '所有API密钥都已达到使用限制，请稍后重试或添加更多密钥',
    );
  }

  /**
   * 检查密钥是否可用
   */
  private async checkKeyUsage(
    key: GeminiApiKey,
  ): Promise<{ canUse: boolean; reason?: string }> {
    // 检查是否启用
    if (!key.isActive) {
      return { canUse: false, reason: '密钥已禁用' };
    }

    // 检查状态
    if (key.status === 'exhausted') {
      return { canUse: false, reason: '密钥已耗尽配额' };
    }

    // 检查是否需要重置今日统计
    await this.resetDailyStatsIfNeeded(key);

    // 检查今日请求数
    if (key.requestsCountToday >= key.rateLimitRpd) {
      await this.updateKeyStatus(key.id, 'rate_limited');
      return {
        canUse: false,
        reason: `已达到今日请求上限(${key.rateLimitRpd})`,
      };
    }

    // 检查今日token数
    if (key.tokensCountToday >= key.rateLimitTpm * 1440) {
      // 假设1440分钟(24小时)
      await this.updateKeyStatus(key.id, 'rate_limited');
      return {
        canUse: false,
        reason: `已达到今日Token上限`,
      };
    }

    // 检查最近1分钟的请求数(RPM限制)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentRequests = await this.logRepository.count({
      where: {
        keyId: key.id,
        createdAt: MoreThan(oneMinuteAgo),
      },
    });

    if (recentRequests >= key.rateLimitRpm) {
      return {
        canUse: false,
        reason: `已达到每分钟请求上限(${key.rateLimitRpm})`,
      };
    }

    return { canUse: true };
  }

  /**
   * 重置每日统计（如果需要）
   */
  private async resetDailyStatsIfNeeded(key: GeminiApiKey): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (!key.statsResetAt || key.statsResetAt.toString() !== today) {
      await this.keyRepository.update(key.id, {
        requestsCountToday: 0,
        tokensCountToday: 0,
        errorsCountToday: 0,
        statsResetAt: new Date(today),
        status: 'normal',
      });

      // 更新缓存中的key
      key.requestsCountToday = 0;
      key.tokensCountToday = 0;
      key.errorsCountToday = 0;
      key.statsResetAt = new Date(today);
      key.status = 'normal';

      this.logger.log(
        `Reset daily stats for key: ${key.keyName} (ID: ${key.id})`,
      );
    }
  }

  /**
   * 记录API密钥使用情况
   */
  async recordKeyUsage(
    keyId: number,
    tokenCount: number,
    success: boolean,
  ): Promise<void> {
    const updateData: any = {
      requestsCountToday: () => 'requests_count_today + 1',
      requestsCountTotal: () => 'requests_count_total + 1',
      tokensCountToday: () => `tokens_count_today + ${tokenCount}`,
      tokensCountTotal: () => `tokens_count_total + ${tokenCount}`,
      lastUsedAt: new Date(),
    };

    if (!success) {
      updateData.errorsCountToday = () => 'errors_count_today + 1';
    }

    await this.keyRepository
      .createQueryBuilder()
      .update(GeminiApiKey)
      .set(updateData)
      .where('id = :keyId', { keyId })
      .execute();

    // 刷新缓存
    this.lastCacheUpdate = 0;
  }

  /**
   * 记录错误信息
   */
  async recordKeyError(
    keyId: number,
    errorMsg: string,
    status?: string,
  ): Promise<void> {
    const updateData: any = {
      lastErrorAt: new Date(),
      lastErrorMsg: errorMsg,
      errorsCountToday: () => 'errors_count_today + 1',
    };

    if (status) {
      updateData.status = status;
    }

    await this.keyRepository.update(keyId, updateData);
    this.lastCacheUpdate = 0;
  }

  /**
   * 更新密钥状态
   */
  private async updateKeyStatus(keyId: number, status: string): Promise<void> {
    await this.keyRepository.update(keyId, { status });
    this.lastCacheUpdate = 0;
  }

  /**
   * 刷新密钥缓存（如果需要）
   */
  private async refreshKeysCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.CACHE_TTL) {
      await this.refreshKeysCache();
    }
  }

  /**
   * 刷新密钥缓存
   */
  private async refreshKeysCache(): Promise<void> {
    try {
      this.keysCache = await this.keyRepository.find({
        where: { isActive: true },
        order: { priority: 'DESC', id: 'ASC' },
      });

      this.lastCacheUpdate = Date.now();
      this.logger.log(
        `Refreshed keys cache: ${this.keysCache.length} active keys`,
      );
    } catch (error) {
      this.logger.error('Failed to refresh keys cache', error);
    }
  }

  /**
   * 定时任务：每天凌晨重置所有密钥状态
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetAllKeysDaily(): Promise<void> {
    this.logger.log('Running daily reset for all API keys...');

    const today = new Date().toISOString().split('T')[0];

    await this.keyRepository
      .createQueryBuilder()
      .update(GeminiApiKey)
      .set({
        requestsCountToday: 0,
        tokensCountToday: 0,
        errorsCountToday: 0,
        statsResetAt: new Date(today),
        status: 'normal',
      })
      .where('is_active = 1')
      .execute();

    await this.refreshKeysCache();
    this.logger.log('Daily reset completed');
  }

  /**
   * 获取所有密钥的统计信息
   */
  async getKeysStats(): Promise<any[]> {
    const keys = await this.keyRepository.find({
      order: { priority: 'DESC', id: 'ASC' },
    });

    return keys.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      status: key.status,
      isActive: key.isActive,
      priority: key.priority,
      requestsToday: key.requestsCountToday,
      tokensToday: key.tokensCountToday,
      errorsToday: key.errorsCountToday,
      requestsTotal: key.requestsCountTotal,
      tokensTotal: key.tokensCountTotal,
      rateLimits: {
        rpm: key.rateLimitRpm,
        tpm: key.rateLimitTpm,
        rpd: key.rateLimitRpd,
      },
      lastUsedAt: key.lastUsedAt,
      lastErrorAt: key.lastErrorAt,
      lastErrorMsg: key.lastErrorMsg,
    }));
  }
}
