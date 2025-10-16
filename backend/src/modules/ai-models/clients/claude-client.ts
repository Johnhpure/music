import Anthropic from '@anthropic-ai/sdk';
import { BaseAIClient } from './base-ai-client';
import {
  AIClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelInfo,
} from '../interfaces/ai-client.interface';

/**
 * Claude客户端实现
 * 基于官方@anthropic-ai/sdk
 */
export class ClaudeClient extends BaseAIClient {
  private client: Anthropic;

  constructor(config: AIClientConfig) {
    super('Claude', config);

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      maxRetries: 0, // 我们自己处理重试
      timeout: config.timeout || 60000,
    });
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    return this.executeWithRetry(async () => {
      try {
        const response = await this.client.messages.create({
          model: request.model || 'claude-3-5-sonnet-latest',
          max_tokens: request.maxTokens || 1024,
          temperature: request.temperature ?? 0.7,
          top_p: request.topP ?? 1,
          messages: request.messages.map((msg) => ({
            role: msg.role === 'system' ? 'user' : msg.role, // Claude不支持system role
            content: msg.content,
          })),
        });

        const content =
          response.content[0]?.type === 'text' ? response.content[0].text : '';

        return {
          id: response.id,
          content,
          model: response.model,
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens:
              response.usage.input_tokens + response.usage.output_tokens,
          },
          finishReason: response.stop_reason || 'unknown',
          createdAt: new Date(),
        };
      } catch (error) {
        // Claude错误处理
        if (error instanceof Anthropic.APIError) {
          this.logger.error(
            `Claude API Error: ${error.status} - ${error.message}`,
          );

          if (error instanceof Anthropic.RateLimitError) {
            this.logger.warn('Claude rate limit exceeded');
          } else if (error instanceof Anthropic.AuthenticationError) {
            throw new Error('Invalid Claude API key');
          } else if (error instanceof Anthropic.APIConnectionError) {
            throw new Error(`Claude connection error: ${error.message}`);
          }
        }

        throw error;
      }
    }, 'createChatCompletion');
  }

  async listModels(): Promise<ModelInfo[]> {
    // Claude没有提供列出模型的API
    // 返回已知的Claude模型列表
    return [
      {
        id: 'claude-3-5-sonnet-latest',
        name: 'Claude 3.5 Sonnet (Latest)',
        maxTokens: 200000,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.003,
        costPer1kCompletionTokens: 0.015,
      },
      {
        id: 'claude-3-5-haiku-latest',
        name: 'Claude 3.5 Haiku (Latest)',
        maxTokens: 200000,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.0008,
        costPer1kCompletionTokens: 0.004,
      },
      {
        id: 'claude-3-opus-latest',
        name: 'Claude 3 Opus (Latest)',
        maxTokens: 200000,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.015,
        costPer1kCompletionTokens: 0.075,
      },
    ];
  }

  async countTokens(text: string, model?: string): Promise<number> {
    try {
      // 使用Claude的beta token计数API
      const count = await this.client.beta.messages.countTokens({
        model: model || 'claude-3-5-sonnet-latest',
        messages: [{ role: 'user', content: text }],
      });

      return count.input_tokens;
    } catch (error) {
      // 如果API不可用,使用估算
      this.logger.warn(
        `Claude token counting API unavailable, using estimation`,
      );
      return this.estimateTokens(text);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // 尝试发送一个最小的请求来验证key
      await this.client.messages.create({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Token数量估算
   */
  private estimateTokens(text: string): number {
    // 简单估算: 英文 ~0.75 tokens/word, 中文 ~1.3 tokens/字
    const englishWords = (text.match(/[a-zA-Z]+/g) || [])
      .join(' ')
      .split(' ').length;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;

    return Math.ceil(
      englishWords * 0.75 + chineseChars * 1.3 + otherChars * 0.25,
    );
  }
}
