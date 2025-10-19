import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ModelInfo,
} from '../interfaces/ai-client.interface';
import { GeminiKeyGroupService } from '../services/gemini-key-group.service';

/**
 * Gemini KEY组客户端实现
 * 支持多KEY轮询策略
 */
export class GeminiKeyGroupClient {
  private readonly logger = new Logger(GeminiKeyGroupClient.name);
  private keyGroupId: number;
  private keyGroupService: GeminiKeyGroupService;
  private currentKeyIndex: number = 0;
  private currentApiKey: string = '';
  private genAI: GoogleGenerativeAI;
  private baseUrl: string;

  constructor(
    keyGroupId: number,
    keyGroupService: GeminiKeyGroupService,
    baseUrl?: string,
  ) {
    this.keyGroupId = keyGroupId;
    this.keyGroupService = keyGroupService;
    this.baseUrl = baseUrl;
  }

  /**
   * 初始化并获取第一个可用的KEY
   */
  private async ensureKey(): Promise<void> {
    const { key, keyIndex } = await this.keyGroupService.getNextAvailableKey(
      this.keyGroupId,
    );
    this.currentApiKey = key;
    this.currentKeyIndex = keyIndex;
    this.genAI = new GoogleGenerativeAI(key);
  }

  /**
   * 创建聊天完成
   */
  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    // 确保有可用的KEY
    await this.ensureKey();

    try {
      const modelName = request.model || 'gemini-pro';
      const model = this.genAI.getGenerativeModel({ model: modelName });

      // 将messages转换为Gemini的prompt格式
      const prompt = this.convertMessagesToPrompt(request.messages);

      this.logger.log(
        `Calling Gemini API (KeyGroup ${this.keyGroupId}, Key ${this.currentKeyIndex}) with model ${modelName}`,
      );

      // 调用Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Gemini没有直接返回token使用量，需要估算
      const promptTokens = this.estimateTokens(prompt);
      const completionTokens = this.estimateTokens(text);

      // 报告成功
      await this.keyGroupService.reportKeySuccess(
        this.keyGroupId,
        this.currentKeyIndex,
        promptTokens + completionTokens,
      );

      return {
        id: `gemini-keygroup-${this.keyGroupId}-${Date.now()}`,
        content: text,
        model: modelName,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        createdAt: new Date(),
      };
    } catch (error) {
      // Gemini错误处理
      this.logger.error(
        `Gemini API Error (KeyGroup ${this.keyGroupId}, Key ${this.currentKeyIndex}): ${error.message}`,
      );

      // 报告错误
      await this.keyGroupService.reportKeyError(
        this.keyGroupId,
        this.currentKeyIndex,
        error.message,
        error.status,
      );

      // 处理特定错误类型
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API key');
      } else if (error.message?.includes('SAFETY')) {
        throw new Error('Content blocked by Gemini safety filters');
      } else if (error.message?.includes('RECITATION')) {
        throw new Error('Content blocked by Gemini recitation policy');
      } else if (error.status === 429 || error.message?.includes('429')) {
        this.logger.warn(
          'Gemini rate limit exceeded, key group will handle failover if configured',
        );
        error.status = 429;
      } else if (error.status === 500 || error.message?.includes('500')) {
        this.logger.warn('Gemini server error');
        error.status = 500;
      } else if (error.status === 503 || error.message?.includes('503')) {
        this.logger.warn('Gemini service unavailable');
        error.status = 503;
      }

      throw error;
    }
  }

  /**
   * 获取模型列表
   */
  async listModels(): Promise<ModelInfo[]> {
    await this.ensureKey();

    try {
      const response = await axios.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          params: {
            key: this.currentApiKey,
          },
        },
      );

      const models: ModelInfo[] = [];

      if (response.data && response.data.models) {
        for (const model of response.data.models) {
          if (model.supportedGenerationMethods?.includes('generateContent')) {
            models.push({
              id: model.baseModelId || model.name?.replace('models/', ''),
              name: model.displayName || model.name,
              maxTokens: model.inputTokenLimit || 1048576,
              supportsStreaming:
                model.supportedGenerationMethods?.includes(
                  'streamGenerateContent',
                ) || false,
              supportsFunctionCall: true,
              costPer1kPromptTokens: this.getModelCost(
                model.baseModelId,
                'prompt',
              ),
              costPer1kCompletionTokens: this.getModelCost(
                model.baseModelId,
                'completion',
              ),
            });
          }
        }
      }

      this.logger.log(`Retrieved ${models.length} models from Gemini API`);
      return models.length > 0 ? models : this.getFallbackModels();
    } catch (error) {
      this.logger.warn(
        `Failed to fetch models from Gemini API: ${error.message}, using fallback list`,
      );
      return this.getFallbackModels();
    }
  }

  /**
   * 验证KEY组中的当前KEY
   */
  async validateApiKey(): Promise<boolean> {
    await this.ensureKey();

    try {
      const response = await axios.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          params: {
            key: this.currentApiKey,
            pageSize: 1,
          },
          timeout: 10000,
        },
      );

      return response.status === 200 && response.data && response.data.models;
    } catch (err: any) {
      this.logger.warn(
        `Gemini API key validation error (KeyGroup ${this.keyGroupId}): ${err.message}`,
      );

      await this.keyGroupService.reportKeyError(
        this.keyGroupId,
        this.currentKeyIndex,
        err.message,
        err.response?.status,
      );

      if (
        err.response?.status === 400 ||
        err.message?.includes('API_KEY_INVALID') ||
        err.message?.includes('invalid API key') ||
        err.message?.includes('API key not valid')
      ) {
        return false;
      }

      throw err;
    }
  }

  /**
   * 统计Token数量
   */
  async countTokens(
    text: string,
    model: string = 'gemini-pro',
  ): Promise<number> {
    await this.ensureKey();

    try {
      const generativeModel = this.genAI.getGenerativeModel({ model });
      const result = await generativeModel.countTokens(text);
      return result.totalTokens;
    } catch {
      this.logger.warn(
        'Gemini token counting API unavailable, using estimation',
      );
      return this.estimateTokens(text);
    }
  }

  /**
   * 获取已知模型列表作为fallback
   */
  private getFallbackModels(): ModelInfo[] {
    return [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash Experimental',
        maxTokens: 1048576,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0,
        costPer1kCompletionTokens: 0,
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        maxTokens: 1048576,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.0001,
        costPer1kCompletionTokens: 0.0004,
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        maxTokens: 2097152,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.00125,
        costPer1kCompletionTokens: 0.005,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        maxTokens: 1048576,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.000075,
        costPer1kCompletionTokens: 0.0003,
      },
      {
        id: 'gemini-1.5-flash-8b',
        name: 'Gemini 1.5 Flash-8B',
        maxTokens: 1048576,
        supportsStreaming: true,
        supportsFunctionCall: true,
        costPer1kPromptTokens: 0.0000375,
        costPer1kCompletionTokens: 0.00015,
      },
    ];
  }

  /**
   * 获取模型定价
   */
  private getModelCost(modelId: string, type: 'prompt' | 'completion'): number {
    const costs: Record<string, { prompt: number; completion: number }> = {
      'gemini-2.0-flash-exp': { prompt: 0, completion: 0 },
      'gemini-2.0-flash': { prompt: 0.0001, completion: 0.0004 },
      'gemini-1.5-pro': { prompt: 0.00125, completion: 0.005 },
      'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
      'gemini-1.5-flash-8b': { prompt: 0.0000375, completion: 0.00015 },
    };

    for (const [key, value] of Object.entries(costs)) {
      if (modelId?.includes(key)) {
        return value[type];
      }
    }

    return type === 'prompt' ? 0.0001 : 0.0004;
  }

  /**
   * 将统一的ChatMessage格式转换为Gemini的prompt格式
   */
  private convertMessagesToPrompt(messages: ChatMessage[]): string {
    let prompt = '';

    for (const message of messages) {
      switch (message.role) {
        case 'system':
          prompt += `${message.content}\n\n`;
          break;
        case 'user':
          prompt += `User: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    }

    if (!prompt.trim().endsWith('User:')) {
      prompt += 'Assistant:';
    }

    return prompt.trim();
  }

  /**
   * Token数量估算
   */
  private estimateTokens(text: string): number {
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
