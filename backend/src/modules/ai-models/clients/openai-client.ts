import OpenAI from 'openai';
import { BaseAIClient } from './base-ai-client';
import {
  AIClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelInfo,
} from '../interfaces/ai-client.interface';

/**
 * OpenAI客户端实现
 * 基于官方openai-node SDK
 */
export class OpenAIClient extends BaseAIClient {
  private client: OpenAI;

  constructor(config: AIClientConfig) {
    super('OpenAI', config);

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      maxRetries: 0, // 我们自己处理重试
      timeout: config.timeout || 60000,
    });
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    return this.executeWithRetry(async () => {
      try {
        const completion = await this.client.chat.completions.create({
          model: request.model || 'gpt-4o',
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature ?? 0.7,
          top_p: request.topP ?? 1,
          stream: false,
        });

        const choice = completion.choices[0];
        if (!choice) {
          throw new Error('No response from OpenAI');
        }

        return {
          id: completion.id,
          content: choice.message?.content || '',
          model: completion.model,
          usage: {
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
            totalTokens: completion.usage?.total_tokens || 0,
          },
          finishReason: choice.finish_reason || 'unknown',
          createdAt: new Date(completion.created * 1000),
        };
      } catch (error) {
        // OpenAI错误处理
        if (error instanceof OpenAI.APIError) {
          this.logger.error(
            `OpenAI API Error: ${error.status} - ${error.message}`,
          );

          if (error instanceof OpenAI.RateLimitError) {
            const retryAfter = error.headers?.['retry-after'];
            this.logger.warn(
              `Rate limit exceeded. Retry after: ${retryAfter}s`,
            );
          } else if (error instanceof OpenAI.AuthenticationError) {
            throw new Error('Invalid OpenAI API key');
          } else if (error instanceof OpenAI.APIConnectionError) {
            throw new Error(`OpenAI connection error: ${error.message}`);
          }
        }

        throw error;
      }
    }, 'createChatCompletion');
  }

  async listModels(): Promise<ModelInfo[]> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.models.list();
        const models: ModelInfo[] = [];

        for await (const model of response) {
          // 只返回聊天模型
          if (model.id.includes('gpt')) {
            models.push({
              id: model.id,
              name: model.id,
              maxTokens: this.getModelMaxTokens(model.id),
              supportsStreaming: true,
              supportsFunctionCall: true,
              costPer1kPromptTokens: this.getModelCost(model.id, 'prompt'),
              costPer1kCompletionTokens: this.getModelCost(
                model.id,
                'completion',
              ),
            });
          }
        }

        return models;
      } catch (error) {
        this.logger.error(`Failed to list OpenAI models: ${error.message}`);
        throw error;
      }
    }, 'listModels');
  }

  async countTokens(text: string, model: string = 'gpt-4o'): Promise<number> {
    // OpenAI没有官方的token计数API
    // 这里使用简单的估算: 英文 ~0.75 tokens/word, 中文 ~1.3 tokens/字
    const englishWords = (text.match(/[a-zA-Z]+/g) || [])
      .join(' ')
      .split(' ').length;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    return Math.ceil(
      englishWords * 0.75 + chineseChars * 1.3 + otherChars * 0.25,
    );
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取模型的最大token数
   */
  private getModelMaxTokens(modelId: string): number {
    const tokenLimits: Record<string, number> = {
      'gpt-4o': 128000,
      'gpt-4o-mini': 128000,
      'gpt-4-turbo': 128000,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 16385,
    };

    for (const [key, value] of Object.entries(tokenLimits)) {
      if (modelId.includes(key)) {
        return value;
      }
    }

    return 4096; // 默认值
  }

  /**
   * 获取模型成本
   */
  private getModelCost(modelId: string, type: 'prompt' | 'completion'): number {
    const costs: Record<string, { prompt: number; completion: number }> = {
      'gpt-4o': { prompt: 0.005, completion: 0.015 },
      'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    };

    for (const [key, value] of Object.entries(costs)) {
      if (modelId.includes(key)) {
        return value[type];
      }
    }

    return type === 'prompt' ? 0.001 : 0.002; // 默认值
  }
}
