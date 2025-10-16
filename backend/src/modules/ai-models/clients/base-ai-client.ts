import { Logger } from '@nestjs/common';
import {
  AIClient,
  AIClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelInfo,
} from '../interfaces/ai-client.interface';

/**
 * AI客户端基类
 * 提供通用的错误处理、重试逻辑、日志记录等功能
 */
export abstract class BaseAIClient implements AIClient {
  protected readonly logger: Logger;
  protected readonly config: AIClientConfig;
  protected readonly providerName: string;

  constructor(providerName: string, config: AIClientConfig) {
    this.providerName = providerName;
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      timeout: config.timeout ?? 60000,
      ...config,
    };
    this.logger = new Logger(`${providerName}Client`);
  }

  abstract createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse>;

  abstract listModels(): Promise<ModelInfo[]>;

  abstract countTokens(text: string, model?: string): Promise<number>;

  abstract validateApiKey(): Promise<boolean>;

  /**
   * 带重试机制的执行方法
   * 使用指数退避策略
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `${operationName} - Attempt ${attempt + 1}/${this.config.maxRetries + 1}`,
        );

        const result = await operation();
        return result;
      } catch (error) {
        lastError = error;

        // 判断是否需要重试
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        // 计算退避时间 (指数退避: 1s, 2s, 4s...)
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);

        this.logger.warn(
          `${operationName} failed (attempt ${attempt + 1}): ${error.message}. ` +
            `Retrying in ${backoffMs}ms...`,
        );

        await this.sleep(backoffMs);
      }
    }

    this.logger.error(
      `${operationName} failed after ${this.config.maxRetries + 1} attempts`,
    );
    throw lastError;
  }

  /**
   * 判断错误是否应该重试
   */
  protected shouldRetry(error: any, attempt: number): boolean {
    // 已达到最大重试次数
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // 网络错误 - 重试
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // 速率限制 (429) - 重试
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      return true;
    }

    // 服务器错误 (500, 502, 503, 504) - 重试
    if (error.status >= 500 && error.status < 600) {
      return true;
    }

    // 超时错误 - 重试
    if (
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Timeout')
    ) {
      return true;
    }

    // 其他错误 - 不重试
    return false;
  }

  /**
   * Sleep工具函数
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 标准化错误信息
   */
  protected normalizeError(error: any): {
    code: string;
    message: string;
    status?: number;
  } {
    return {
      code: error.code || error.type || 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      status: error.status || error.statusCode,
    };
  }

  /**
   * 计算成本
   */
  protected calculateCost(
    promptTokens: number,
    completionTokens: number,
    costPer1kPrompt: number,
    costPer1kCompletion: number,
  ): number {
    const promptCost = (promptTokens / 1000) * costPer1kPrompt;
    const completionCost = (completionTokens / 1000) * costPer1kCompletion;
    return promptCost + completionCost;
  }
}
