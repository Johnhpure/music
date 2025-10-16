import OpenAI from 'openai';
import { BaseAIClient } from './base-ai-client';
import {
  AIClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelInfo,
} from '../interfaces/ai-client.interface';

/**
 * DeepSeek客户端实现
 * 使用OpenAI SDK的兼容模式
 */
export class DeepSeekClient extends BaseAIClient {
  private client: OpenAI;

  constructor(config: AIClientConfig) {
    super('DeepSeek', config);

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || 'https://api.deepseek.com',
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
          model: request.model || 'deepseek-chat',
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature ?? 0.7,
          top_p: request.topP ?? 1,
          stream: false,
        });

        const choice = completion.choices[0];
        if (!choice) {
          throw new Error('No response from DeepSeek');
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
        // DeepSeek使用OpenAI兼容的错误格式
        if (error instanceof OpenAI.APIError) {
          this.logger.error(
            `DeepSeek API Error: ${error.status} - ${error.message}`,
          );

          // 根据DeepSeek文档的错误码
          if (error.status === 400) {
            throw new Error(
              `DeepSeek invalid request format: ${error.message}`,
            );
          } else if (error.status === 401) {
            throw new Error('Invalid DeepSeek API key');
          } else if (error.status === 402) {
            throw new Error('DeepSeek insufficient balance');
          } else if (error.status === 422) {
            throw new Error(`DeepSeek invalid parameters: ${error.message}`);
          } else if (error.status === 429) {
            this.logger.warn('DeepSeek rate limit exceeded');
          } else if (error.status === 503) {
            this.logger.warn('DeepSeek server overloaded');
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
          models.push({
            id: model.id,
            name: model.id,
            maxTokens: this.getModelMaxTokens(model.id),
            supportsStreaming: true,
            supportsFunctionCall: model.id.includes('chat'),
            costPer1kPromptTokens: this.getModelCost(model.id, 'prompt'),
            costPer1kCompletionTokens: this.getModelCost(
              model.id,
              'completion',
            ),
          });
        }

        return models;
      } catch (error) {
        this.logger.error(`Failed to list DeepSeek models: ${error.message}`);
        // 返回已知模型列表作为fallback
        return this.getKnownModels();
      }
    }, 'listModels');
  }

  async countTokens(
    text: string,
    model: string = 'deepseek-chat',
  ): Promise<number> {
    // DeepSeek使用类似GPT的tokenizer
    // 使用简单估算: 英文 ~0.75 tokens/word, 中文 ~1.3 tokens/字
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
      if (error instanceof OpenAI.APIError && error.status === 401) {
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
      'deepseek-chat': 128000,
      'deepseek-reasoner': 128000,
      'deepseek-coder': 128000,
    };

    for (const [key, value] of Object.entries(tokenLimits)) {
      if (modelId.includes(key)) {
        return value;
      }
    }

    return 128000; // 默认值
  }

  /**
   * 获取模型成本 (基于2025年2月后的价格)
   */
  private getModelCost(modelId: string, type: 'prompt' | 'completion'): number {
    const costs: Record<string, { prompt: number; completion: number }> = {
      'deepseek-chat': {
        prompt: 0.00027, // $0.27/M tokens
        completion: 0.0011, // $1.10/M tokens
      },
      'deepseek-reasoner': {
        prompt: 0.0004, // 4 Yuan/M tokens
        completion: 0.0016, // 16 Yuan/M tokens (按1 Yuan = 0.14 USD估算)
      },
      'deepseek-coder': {
        prompt: 0.00027,
        completion: 0.0011,
      },
    };

    for (const [key, value] of Object.entries(costs)) {
      if (modelId.includes(key)) {
        return value[type];
      }
    }

    return type === 'prompt' ? 0.00027 : 0.0011; // 默认值
  }

  /**
   * 获取已知模型列表(作为API失败时的fallback)
   */
  private getKnownModels(): ModelInfo[] {
    return [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.00027,
        costPer1kCompletionTokens: 0.0011,
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsFunctionCall: false,
        costPer1kPromptTokens: 0.0004,
        costPer1kCompletionTokens: 0.0016,
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        maxTokens: 128000,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.00027,
        costPer1kCompletionTokens: 0.0011,
      },
    ];
  }
}
