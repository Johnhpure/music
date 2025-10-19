import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { BaseAIClient } from './base-ai-client';
import {
  AIClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ModelInfo,
} from '../interfaces/ai-client.interface';

/**
 * Gemini客户端实现
 * 基于官方@google/generative-ai SDK
 */
export class GeminiClient extends BaseAIClient {
  private genAI: GoogleGenerativeAI;

  constructor(config: AIClientConfig) {
    super('Gemini', config);

    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    return this.executeWithRetry(async () => {
      try {
        // 如果没有指定model，使用gemini-1.5-flash作为fallback
        // 正常情况下应该由调用方指定model（从数据库配置中读取）
        const modelName = request.model || 'gemini-1.5-flash';
        const model = this.genAI.getGenerativeModel({ model: modelName });

        // 将messages转换为Gemini的prompt格式
        const prompt = this.convertMessagesToPrompt(request.messages);

        this.logger.log(`Calling Gemini API with model ${modelName}`);

        // 调用Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Gemini没有直接返回token使用量，需要估算
        const promptTokens = this.estimateTokens(prompt);
        const completionTokens = this.estimateTokens(text);

        return {
          id: `gemini-${Date.now()}`, // Gemini没有返回ID，自己生成
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
        this.logger.error(`Gemini API Error: ${error.message}`);

        // 处理特定错误类型
        if (error.message?.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key');
        } else if (error.message?.includes('SAFETY')) {
          throw new Error('Content blocked by Gemini safety filters');
        } else if (error.message?.includes('RECITATION')) {
          throw new Error('Content blocked by Gemini recitation policy');
        } else if (error.status === 429 || error.message?.includes('429')) {
          this.logger.warn('Gemini rate limit exceeded');
          error.status = 429; // 标准化错误码以便重试
        } else if (error.status === 500 || error.message?.includes('500')) {
          this.logger.warn('Gemini server error');
          error.status = 500;
        }

        throw error;
      }
    }, 'createChatCompletion');
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      // 使用Gemini REST API获取完整的模型列表
      const response = await axios.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          params: {
            key: this.config.apiKey,
          },
        },
      );

      const models: ModelInfo[] = [];

      if (response.data && response.data.models) {
        for (const model of response.data.models) {
          // 只包含支持generateContent的模型
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

  async countTokens(
    text: string,
    model: string = 'gemini-1.5-flash',
  ): Promise<number> {
    try {
      // 尝试使用Gemini的countTokens API
      const generativeModel = this.genAI.getGenerativeModel({ model });
      const result = await generativeModel.countTokens(text);
      return result.totalTokens;
    } catch {
      // 如果API不可用，使用估算
      this.logger.warn(
        `Gemini token counting API unavailable, using estimation`,
      );
      return this.estimateTokens(text);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // 使用REST API listModels来验证key（最可靠的方法）
      const response = await axios.get(
        'https://generativelanguage.googleapis.com/v1beta/models',
        {
          params: {
            key: this.config.apiKey,
            pageSize: 1, // 只获取1个模型来验证
          },
          timeout: 10000,
        },
      );

      // 如果能成功获取模型列表，说明key有效
      return response.status === 200 && response.data && response.data.models;
    } catch (err: any) {
      this.logger.warn(`Gemini API key validation error: ${err.message}`);

      // 检查是否是API key错误
      if (
        err.response?.status === 400 ||
        err.message?.includes('API_KEY_INVALID') ||
        err.message?.includes('invalid API key') ||
        err.message?.includes('API key not valid')
      ) {
        return false;
      }

      // 其他错误（网络问题等）也认为验证失败，但记录详细错误
      this.logger.error(`Gemini validation failed with error: ${err.message}`);
      throw err;
    }
  }

  /**
   * 将统一的ChatMessage格式转换为Gemini的prompt格式
   * Gemini不支持多轮对话的messages格式，需要转换为单一prompt
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

    // 如果最后不是以User:结尾，添加一个提示
    if (!prompt.trim().endsWith('User:')) {
      prompt += 'Assistant:';
    }

    return prompt.trim();
  }

  /**
   * Token数量估算
   * Gemini的token计算方式：英文 ~0.75 tokens/word, 中文 ~1.3 tokens/字
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
