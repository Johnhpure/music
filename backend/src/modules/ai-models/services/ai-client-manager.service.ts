import { Injectable, Logger } from '@nestjs/common';
import { AIProviderService } from './ai-provider.service';
import { AILogService } from './ai-log.service';
import { AIUsageStatService } from './ai-usage-stat.service';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '../interfaces/ai-client.interface';

/**
 * AI客户端管理服务
 * 提供统一的AI调用入口，集成日志、统计、错误处理等功能
 */
@Injectable()
export class AIClientManagerService {
  private readonly logger = new Logger(AIClientManagerService.name);

  constructor(
    private readonly providerService: AIProviderService,
    private readonly logService: AILogService,
    private readonly usageStatService: AIUsageStatService,
  ) {}

  /**
   * 创建聊天完成
   * 这是主要的AI调用入口，集成了所有必要的功能
   */
  async createChatCompletion(
    providerCode: string,
    request: ChatCompletionRequest,
    userId?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    let keyId: number;
    let providerId: number;
    let modelCode: string;

    try {
      // 1. 查找Provider
      const provider = await this.providerService.providerRepo.findOne({
        where: { providerCode, isActive: true },
      });

      if (!provider) {
        throw new Error(`Provider ${providerCode} not found or inactive`);
      }

      providerId = provider.id;

      // 2. 选择可用的Key
      const key = await this.providerService.selectAvailableKey(providerId);
      keyId = key.id;

      // 3. 获取AI客户端
      const client = await this.providerService.getAIClient(keyId);

      // 4. 调用AI API
      this.logger.log(
        `Calling ${providerCode} API with model ${request.model || 'default'}`,
      );

      const response = await client.createChatCompletion(request);
      modelCode = response.model;

      // 5. 计算延迟
      const latencyMs = Date.now() - startTime;

      // 6. 更新Key使用统计
      await this.providerService.updateKeyUsage(
        keyId,
        response.usage.totalTokens,
        false,
      );

      // 7. 记录API调用日志
      await this.logService.logApiCall({
        providerId,
        keyId,
        userId,
        requestType: 'chat_completion',
        modelCode,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        requestPayload: {
          messages: request.messages.map((msg) => ({
            role: msg.role,
            content:
              msg.content.length > 500
                ? msg.content.substring(0, 500) + '...'
                : msg.content,
          })),
          model: request.model,
          maxTokens: request.maxTokens,
        },
        responseSummary:
          response.content.length > 200
            ? response.content.substring(0, 200) + '...'
            : response.content,
        latencyMs,
        status: 'success',
        ipAddress,
        userAgent,
      });

      // 8. 更新每日统计 (异步，不阻塞响应)
      this.usageStatService
        .updateDailyStats(providerId, keyId)
        .catch((err) =>
          this.logger.error(`Failed to update daily stats: ${err.message}`),
        );

      this.logger.log(
        `${providerCode} API call successful in ${latencyMs}ms, tokens: ${response.usage.totalTokens}`,
      );

      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      this.logger.error(
        `${providerCode} API call failed: ${error.message}`,
        error.stack,
      );

      // 记录错误日志
      if (keyId && providerId) {
        await this.logService.logApiCall({
          providerId,
          keyId,
          userId,
          requestType: 'chat_completion',
          modelCode: modelCode || request.model || 'unknown',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          requestPayload: {
            messages: request.messages.map((msg) => ({
              role: msg.role,
              content:
                msg.content.length > 500
                  ? msg.content.substring(0, 500) + '...'
                  : msg.content,
            })),
          },
          errorCode: error.code || 'UNKNOWN_ERROR',
          errorMessage: error.message,
          latencyMs,
          status: this.categorizeError(error),
          ipAddress,
          userAgent,
        });

        // 更新Key错误统计
        await this.providerService.updateKeyUsage(keyId, 0, true);

        // 如果是认证错误或配额耗尽，更新Key状态
        if (
          error.message.includes('Invalid API key') ||
          error.message.includes('Authentication')
        ) {
          await this.providerService.updateKeyStatus(
            keyId,
            'error',
            error.message,
          );
        } else if (
          error.message.includes('insufficient balance') ||
          error.message.includes('quota exceeded')
        ) {
          await this.providerService.updateKeyStatus(
            keyId,
            'exhausted',
            error.message,
          );
        }
      }

      throw error;
    }
  }

  /**
   * 批量创建聊天完成
   */
  async batchCreateChatCompletion(
    providerCode: string,
    requests: ChatCompletionRequest[],
    userId?: number,
  ): Promise<ChatCompletionResponse[]> {
    const responses: ChatCompletionResponse[] = [];

    for (const request of requests) {
      try {
        const response = await this.createChatCompletion(
          providerCode,
          request,
          userId,
        );
        responses.push(response);
      } catch (error) {
        this.logger.error(`Batch request failed: ${error.message}`);
        // 继续处理其他请求
      }
    }

    return responses;
  }

  /**
   * 计算Token数量
   */
  async countTokens(
    providerCode: string,
    text: string,
    model?: string,
  ): Promise<number> {
    const provider = await this.providerService.providerRepo.findOne({
      where: { providerCode, isActive: true },
    });

    if (!provider) {
      throw new Error(`Provider ${providerCode} not found`);
    }

    const key = await this.providerService.selectAvailableKey(provider.id);
    const client = await this.providerService.getAIClient(key.id);

    return await client.countTokens(text, model);
  }

  /**
   * 获取可用的Provider列表
   */
  async getAvailableProviders(): Promise<
    Array<{
      code: string;
      name: string;
      models: number;
      activeKeys: number;
    }>
  > {
    const providers = await this.providerService.providerRepo.find({
      where: { isActive: true },
      relations: ['models', 'apiKeys'],
    });

    return providers.map((provider) => ({
      code: provider.providerCode,
      name: provider.providerName,
      models: provider.models.filter((m) => m.isActive).length,
      activeKeys: provider.apiKeys.filter((k) => k.isActive).length,
    }));
  }

  /**
   * 对错误进行分类
   */
  private categorizeError(error: any): 'error' | 'rate_limited' | 'timeout' {
    if (
      error.status === 429 ||
      error.message.includes('rate limit') ||
      error.message.includes('Rate limit')
    ) {
      return 'rate_limited';
    }

    if (
      error.code === 'ETIMEDOUT' ||
      error.message.includes('timeout') ||
      error.message.includes('Timeout')
    ) {
      return 'timeout';
    }

    return 'error';
  }

  /**
   * 使用Gemini KEY组创建聊天完成
   * 支持多KEY轮询策略
   */
  async createChatCompletionWithKeyGroup(
    keyGroupId: number,
    request: ChatCompletionRequest,
    userId?: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    const { GeminiKeyGroupService } = await import(
      './gemini-key-group.service'
    );
    const { GeminiKeyGroupClient } = await import(
      '../clients/gemini-keygroup-client'
    );
    const { GeminiKeyGroup } = await import(
      '../entities/gemini-key-group.entity'
    );

    // 注入 GeminiKeyGroupService
    const keyGroupRepo =
      this.providerService.providerRepo.manager.connection.getRepository(
        GeminiKeyGroup,
      );
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const encryptionService = require('@common/services/encryption.service');
    const keyGroupService = new GeminiKeyGroupService(
      keyGroupRepo,
      encryptionService,
    );

    try {
      // 获取KEY组信息
      const keyGroup = await keyGroupService.findOne(keyGroupId);

      if (!keyGroup.isActive) {
        throw new Error(`Gemini key group ${keyGroupId} is not active`);
      }

      this.logger.log(
        `Calling Gemini API with KeyGroup ${keyGroupId} (strategy: ${keyGroup.rotationStrategy})`,
      );

      // 创建KEY组客户端
      const client = new GeminiKeyGroupClient(
        keyGroupId,
        keyGroupService,
        keyGroup.baseUrl,
      );

      // 调用AI API
      const response = await client.createChatCompletion(request);

      const latencyMs = Date.now() - startTime;

      // 记录API调用日志
      await this.logService.logApiCall({
        providerId: 0,
        keyId: keyGroupId,
        userId,
        requestType: 'chat_completion_keygroup',
        modelCode: response.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        requestPayload: {
          messages: request.messages.map((msg) => ({
            role: msg.role,
            content:
              msg.content.length > 500
                ? msg.content.substring(0, 500) + '...'
                : msg.content,
          })),
          model: request.model,
          maxTokens: request.maxTokens,
          keyGroupId,
          rotationStrategy: keyGroup.rotationStrategy,
        },
        responseSummary:
          response.content.length > 200
            ? response.content.substring(0, 200) + '...'
            : response.content,
        latencyMs,
        status: 'success',
        ipAddress,
        userAgent,
      });

      this.logger.log(
        `Gemini KeyGroup ${keyGroupId} API call successful in ${latencyMs}ms, tokens: ${response.usage.totalTokens}`,
      );

      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;

      this.logger.error(
        `Gemini KeyGroup ${keyGroupId} API call failed: ${error.message}`,
        error.stack,
      );

      // 记录错误日志
      await this.logService.logApiCall({
        providerId: 0,
        keyId: keyGroupId,
        userId,
        requestType: 'chat_completion_keygroup',
        modelCode: request.model || 'unknown',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        requestPayload: {
          messages: request.messages.map((msg) => ({
            role: msg.role,
            content:
              msg.content.length > 500
                ? msg.content.substring(0, 500) + '...'
                : msg.content,
          })),
          keyGroupId,
        },
        errorCode: error.code || 'UNKNOWN_ERROR',
        errorMessage: error.message,
        latencyMs,
        status: this.categorizeError(error),
        ipAddress,
        userAgent,
      });

      throw error;
    }
  }
}
