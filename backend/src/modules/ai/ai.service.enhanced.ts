import { Injectable } from '@nestjs/common';
import { AIClientManagerService } from '../ai-models/services/ai-client-manager.service';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';

/**
 * 增强版AI服务
 * 集成了新的多模型系统
 * 保持向后兼容
 */
@Injectable()
export class AIServiceEnhanced {
  constructor(private readonly aiClientManager: AIClientManagerService) {}

  /**
   * 生成歌词 - 使用DeepSeek(性价比高)
   */
  async generateLyrics(userId: number, dto: GenerateLyricsDto) {
    const systemPrompt = this.buildLyricsSystemPrompt(dto);
    const userPrompt = this.buildLyricsUserPrompt(dto);

    try {
      // 首选DeepSeek (性价比最高)
      const response = await this.aiClientManager.createChatCompletion(
        'deepseek',
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'deepseek-chat',
          maxTokens: 2000,
          temperature: 0.8,
        },
        userId,
      );

      return this.parseLyricsResponse(response.content, dto, response.usage);
    } catch (error) {
      console.log('DeepSeek failed, falling back to OpenAI');

      // 降级到OpenAI
      const response = await this.aiClientManager.createChatCompletion(
        'openai',
        {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'gpt-3.5-turbo',
          maxTokens: 2000,
          temperature: 0.8,
        },
        userId,
      );

      return this.parseLyricsResponse(response.content, dto, response.usage);
    }
  }

  /**
   * 扩展灵感 - 使用OpenAI或Claude
   */
  async expandInspiration(userId: number, inspiration: string) {
    const response = await this.aiClientManager.createChatCompletion(
      'openai', // 或 'anthropic'
      {
        messages: [
          {
            role: 'system',
            content: '你是一个音乐创作助手，帮助用户扩展音乐创作灵感。',
          },
          {
            role: 'user',
            content: `请基于以下灵感，扩展出3-5个具体的音乐创作方向：\n\n${inspiration}`,
          },
        ],
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        temperature: 0.9,
      },
      userId,
    );

    return {
      inspirations: this.parseInspirations(response.content),
      tokensUsed: response.usage.totalTokens,
    };
  }

  /**
   * 优化歌词 - 使用Claude(编辑能力强)
   */
  async refineLyrics(userId: number, lyrics: string, requirements: string) {
    try {
      const response = await this.aiClientManager.createChatCompletion(
        'anthropic',
        {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的歌词编辑，擅长优化和改进歌词。',
            },
            {
              role: 'user',
              content: `请根据以下要求优化歌词：\n\n要求：${requirements}\n\n原歌词：\n${lyrics}`,
            },
          ],
          model: 'claude-3-5-sonnet-latest',
          maxTokens: 2000,
          temperature: 0.7,
        },
        userId,
      );

      return {
        refinedLyrics: response.content,
        tokensUsed: response.usage.totalTokens,
      };
    } catch (error) {
      // 降级到OpenAI
      const response = await this.aiClientManager.createChatCompletion(
        'openai',
        {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的歌词编辑，擅长优化和改进歌词。',
            },
            {
              role: 'user',
              content: `请根据以下要求优化歌词：\n\n要求：${requirements}\n\n原歌词：\n${lyrics}`,
            },
          ],
          model: 'gpt-4o',
          maxTokens: 2000,
          temperature: 0.7,
        },
        userId,
      );

      return {
        refinedLyrics: response.content,
        tokensUsed: response.usage.totalTokens,
      };
    }
  }

  /**
   * 代码生成示例 - 使用DeepSeek Coder
   */
  async generateCode(userId: number, description: string) {
    const response = await this.aiClientManager.createChatCompletion(
      'deepseek',
      {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的代码生成助手。',
          },
          {
            role: 'user',
            content: description,
          },
        ],
        model: 'deepseek-coder',
        maxTokens: 2000,
        temperature: 0.3,
      },
      userId,
    );

    return {
      code: response.content,
      tokensUsed: response.usage.totalTokens,
    };
  }

  // ========== 私有方法 ==========

  private buildLyricsSystemPrompt(dto: GenerateLyricsDto): string {
    return `你是一个专业的${dto.language || '中文'}歌词创作助手。
你擅长创作${dto.style || '流行'}风格的歌曲歌词。
你的歌词具有${dto.mood || '积极向上'}的情感基调。
请创作符合要求的高质量歌词，包含主歌、副歌等完整结构。`;
  }

  private buildLyricsUserPrompt(dto: GenerateLyricsDto): string {
    let prompt = `请创作一首关于"${dto.theme}"的歌曲歌词。\n\n`;
    prompt += `要求：\n`;
    prompt += `- 风格: ${dto.style || '流行'}\n`;
    prompt += `- 情绪: ${dto.mood || '积极'}\n`;
    prompt += `- 语言: ${dto.language || '中文'}\n`;
    prompt += `- 生成 ${dto.versionsCount || 2} 个不同的版本\n`;

    if (dto.customPrompt) {
      prompt += `
额外要求：
${dto.customPrompt}
`;
    }

    prompt += `\n请为每个版本提供：\n`;
    prompt += `1. 歌曲标题\n`;
    prompt += `2. 完整歌词(包含主歌、副歌等结构)\n`;
    prompt += `3. 简短的创作说明\n`;

    return prompt;
  }

  private parseLyricsResponse(
    content: string,
    dto: GenerateLyricsDto,
    usage: any,
  ) {
    // 简单解析，实际应该更复杂
    const versions = [];
    const versionMatches = content.split(/版本\s*[一二三四五1-5]/);

    for (
      let i = 1;
      i < Math.min(versionMatches.length, (dto.versionsCount || 2) + 1);
      i++
    ) {
      versions.push({
        versionNumber: i,
        title: `版本${i}`,
        lyrics: versionMatches[i].trim(),
        wordCount: versionMatches[i].length,
      });
    }

    // 如果解析失败，返回整个内容作为单个版本
    if (versions.length === 0) {
      versions.push({
        versionNumber: 1,
        title: '生成的歌词',
        lyrics: content,
        wordCount: content.length,
      });
    }

    return {
      requestId: `lyric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      versions,
      costCredits: Math.ceil(usage.totalTokens / 100), // 简单的积分计算
      remainingCredits: 0, // 需要从用户服务获取
      createdAt: new Date().toISOString(),
      usage: {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
      },
    };
  }

  private parseInspirations(content: string): string[] {
    // 简单的解析逻辑
    const lines = content.split('\n').filter((line) => line.trim());
    const inspirations = [];

    for (const line of lines) {
      const match = line.match(/^\d+[.、](.+)$/);
      if (match) {
        inspirations.push(match[1].trim());
      }
    }

    return inspirations.length > 0 ? inspirations : [content];
  }
}
