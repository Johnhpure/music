/**
 * AI Client统一接口
 * 所有AI Provider客户端都需要实现此接口
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  createdAt: Date;
}

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens?: number;
  supportsStreaming?: boolean;
  supportsFunctionCall?: boolean;
  costPer1kPromptTokens?: number;
  costPer1kCompletionTokens?: number;
}

export interface AIClientConfig {
  apiKey: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AIClient {
  /**
   * 创建聊天完成
   */
  createChatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse>;

  /**
   * 获取可用模型列表
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * 计算Token数量
   */
  countTokens(text: string, model?: string): Promise<number>;

  /**
   * 验证API Key是否有效
   */
  validateApiKey(): Promise<boolean>;
}
