import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProvider } from '../entities/ai-provider.entity';
import { AIApiKey } from '../entities/ai-api-key.entity';
import { AIModel } from '../entities/ai-model.entity';
import { AIClient } from '../interfaces/ai-client.interface';
import { OpenAIClient } from '../clients/openai-client';
import { ClaudeClient } from '../clients/claude-client';
import { DeepSeekClient } from '../clients/deepseek-client';
import { GeminiClient } from '../clients/gemini-client';
import { EncryptionService } from '../../../common/services/encryption.service';

/**
 * AI Provider管理服务
 * 负责Provider、Key、Model的管理
 */
@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private readonly clientCache = new Map<number, AIClient>();

  constructor(
    @InjectRepository(AIProvider)
    public readonly providerRepo: Repository<AIProvider>,
    @InjectRepository(AIApiKey)
    private readonly keyRepo: Repository<AIApiKey>,
    @InjectRepository(AIModel)
    private readonly modelRepo: Repository<AIModel>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * 获取AI客户端实例(带缓存)
   */
  async getAIClient(keyId: number): Promise<AIClient> {
    // 检查缓存
    if (this.clientCache.has(keyId)) {
      return this.clientCache.get(keyId);
    }

    // 从数据库加载key
    const key = await this.keyRepo.findOne({
      where: { id: keyId, isActive: true },
      relations: ['provider'],
    });

    if (!key) {
      throw new NotFoundException(`API Key ${keyId} not found or inactive`);
    }

    // 创建客户端
    const client = await this.createClientInstance(key);

    // 缓存
    this.clientCache.set(keyId, client);

    return client;
  }

  /**
   * 选择一个可用的Key (多Key轮询)
   * 基于优先级和状态选择
   */
  async selectAvailableKey(providerId: number): Promise<AIApiKey> {
    const keys = await this.keyRepo.find({
      where: {
        providerId,
        isActive: true,
        status: 'normal',
      },
      order: {
        priority: 'DESC', // 优先级从高到低
        lastUsedAt: 'ASC', // 最少使用优先
      },
    });

    if (keys.length === 0) {
      throw new NotFoundException(
        `No available API keys for provider ${providerId}`,
      );
    }

    // 检查速率限制
    for (const key of keys) {
      if (await this.checkRateLimit(key)) {
        return key;
      }
    }

    // 所有key都达到限制,返回最近最少使用的
    this.logger.warn(
      `All keys for provider ${providerId} are rate limited, using least recently used`,
    );
    return keys[0];
  }

  /**
   * 检查速率限制
   */
  private async checkRateLimit(key: AIApiKey): Promise<boolean> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 检查是否需要重置统计
    // statsResetAt可能是字符串(YYYY-MM-DD)或Date对象,需要统一处理
    const resetDate = key.statsResetAt
      ? typeof key.statsResetAt === 'string'
        ? key.statsResetAt
        : key.statsResetAt.toISOString().split('T')[0]
      : null;

    if (!resetDate || resetDate !== today) {
      await this.resetKeyStats(key.id);
      return true;
    }

    // 检查每日请求限制
    if (key.requestsCountToday >= key.rateLimitRpd) {
      this.logger.warn(`Key ${key.id} exceeded daily request limit`);
      return false;
    }

    // 检查每分钟请求限制(简化版,实际应该用滑动窗口)
    // 这里假设lastUsedAt在1分钟内的请求需要限制
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    if (key.lastUsedAt && key.lastUsedAt > oneMinuteAgo) {
      // 简化处理,实际应该统计1分钟内的请求数
      if (key.requestsCountToday % 60 >= key.rateLimitRpm) {
        this.logger.warn(`Key ${key.id} exceeded per-minute request limit`);
        return false;
      }
    }

    return true;
  }

  /**
   * 重置Key统计
   */
  private async resetKeyStats(keyId: number): Promise<void> {
    await this.keyRepo.update(keyId, {
      requestsCountToday: 0,
      tokensCountToday: 0,
      errorsCountToday: 0,
      statsResetAt: new Date(),
    });
  }

  /**
   * 更新Key使用统计
   */
  async updateKeyUsage(
    keyId: number,
    tokens: number,
    isError: boolean = false,
  ): Promise<void> {
    const key = await this.keyRepo.findOne({ where: { id: keyId } });
    if (!key) return;

    await this.keyRepo.update(keyId, {
      requestsCountToday: key.requestsCountToday + 1,
      requestsCountTotal: key.requestsCountTotal + 1,
      tokensCountToday: key.tokensCountToday + tokens,
      tokensCountTotal: key.tokensCountTotal + tokens,
      errorsCountToday: isError
        ? key.errorsCountToday + 1
        : key.errorsCountToday,
      lastUsedAt: new Date(),
      lastErrorAt: isError ? new Date() : key.lastErrorAt,
    });
  }

  /**
   * 更新Provider统计数据
   */
  async updateProviderStats(
    providerId: number,
    tokens: number,
  ): Promise<void> {
    const provider = await this.providerRepo.findOne({
      where: { id: providerId },
    });
    if (!provider) return;

    await this.providerRepo.update(providerId, {
      callCount: (provider.callCount || 0) + 1,
      tokenUsage: (provider.tokenUsage || 0) + tokens,
    });
  }

  /**
   * 更新Key状态
   */
  async updateKeyStatus(
    keyId: number,
    status: 'normal' | 'rate_limited' | 'error' | 'exhausted',
    errorMsg?: string,
  ): Promise<void> {
    const update: any = { status };

    if (errorMsg) {
      update.lastErrorMsg = errorMsg;
      update.lastErrorAt = new Date();
    }

    await this.keyRepo.update(keyId, update);
  }

  /**
   * 同步Provider的模型列表
   */
  async syncProviderModels(providerId: number): Promise<number> {
    const provider = await this.providerRepo.findOne({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException(`Provider ${providerId} not found`);
    }

    // 获取一个可用的key
    const key = await this.selectAvailableKey(providerId);
    const client = await this.getAIClient(key.id);

    try {
      // 从API获取模型列表
      const models = await client.listModels();

      let syncedCount = 0;

      // 更新或创建模型
      for (const modelInfo of models) {
        const existing = await this.modelRepo.findOne({
          where: {
            providerId,
            modelCode: modelInfo.id,
          },
        });

        if (existing) {
          // 更新
          await this.modelRepo.update(existing.id, {
            modelName: modelInfo.name,
            maxInputTokens: modelInfo.maxTokens,
            supportsStreaming: modelInfo.supportsStreaming,
            supportsFunctionCall: modelInfo.supportsFunctionCall,
            costPer1kPromptTokens: modelInfo.costPer1kPromptTokens,
            costPer1kCompletionTokens: modelInfo.costPer1kCompletionTokens,
          });
        } else {
          // 创建
          await this.modelRepo.save({
            providerId,
            modelCode: modelInfo.id,
            modelName: modelInfo.name,
            modelType: 'chat',
            maxInputTokens: modelInfo.maxTokens,
            supportsStreaming: modelInfo.supportsStreaming,
            supportsFunctionCall: modelInfo.supportsFunctionCall,
            costPer1kPromptTokens: modelInfo.costPer1kPromptTokens,
            costPer1kCompletionTokens: modelInfo.costPer1kCompletionTokens,
            isActive: true,
          });
        }

        syncedCount++;
      }

      this.logger.log(
        `Synced ${syncedCount} models for provider ${provider.providerName}`,
      );

      return syncedCount;
    } catch (error) {
      this.logger.error(
        `Failed to sync models for provider ${providerId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 验证API Key
   */
  async validateKey(keyId: number): Promise<boolean> {
    const client = await this.getAIClient(keyId);

    try {
      return await client.validateApiKey();
    } catch (error) {
      this.logger.error(`Failed to validate key ${keyId}: ${error.message}`);
      return false;
    }
  }

  /**
   * 创建AI客户端实例
   */
  private async createClientInstance(key: AIApiKey): Promise<AIClient> {
    // 解密API密钥
    const decryptedApiKey = await this.encryptionService.decrypt(key.apiKey);

    const config = {
      apiKey: decryptedApiKey,
      baseUrl: key.baseUrl || key.provider.baseUrl,
      maxRetries: 3,
      timeout: 60000,
    };

    switch (key.provider.providerCode) {
      case 'openai':
        return new OpenAIClient(config);
      case 'claude':
      case 'anthropic':
        return new ClaudeClient(config);
      case 'deepseek':
        return new DeepSeekClient(config);
      case 'gemini':
      case 'google':
        return new GeminiClient(config);
      default:
        throw new Error(`Unsupported provider: ${key.provider.providerCode}`);
    }
  }

  /**
   * 清除客户端缓存
   */
  clearClientCache(keyId?: number): void {
    if (keyId) {
      this.clientCache.delete(keyId);
    } else {
      this.clientCache.clear();
    }
  }
}
