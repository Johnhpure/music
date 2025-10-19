import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerateLyricsParams,
  LyricsResult,
  ExpandInspirationParams,
  ExpandInspirationResult,
} from './ai.types';
import { AIClientManagerService } from '@modules/ai-models/services/ai-client-manager.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(
    private readonly aiClientManager: AIClientManagerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('Gemini service initialized with AI Client Manager');
  }

  /**
   * 计算文本的Token数量（简单估算：1 token ≈ 4 characters）
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  async generateLyrics(
    params: GenerateLyricsParams,
    userId?: number,
  ): Promise<LyricsResult> {
    try {
      const prompt = this.buildPrompt(params);

      this.logger.log(
        `Generating lyrics for theme: ${params.theme} using AI Client Manager`,
      );

      // 使用新的统一AI客户端管理服务
      const response = await this.aiClientManager.createChatCompletion(
        'gemini', // provider code
        {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'gemini-pro',
          temperature: 0.8,
          maxTokens: 2048,
        },
        userId,
      );

      const text = response.content;
      return this.parseLyricsResponse(text);
    } catch (error) {
      this.logger.error('Failed to generate lyrics', error);
      throw new BadRequestException('歌词生成失败，请稍后重试');
    }
  }

  async generateMultipleLyrics(
    params: GenerateLyricsParams,
    count: number = 2,
    userId?: number,
  ): Promise<LyricsResult[]> {
    const results: LyricsResult[] = [];

    for (let i = 0; i < count; i++) {
      try {
        this.logger.log(
          `Generating lyrics version ${i + 1}/${count} for theme: ${params.theme}`,
        );

        const result = await this.generateLyrics(params, userId);
        results.push(result);

        if (i < count - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        this.logger.warn(
          `Failed to generate lyrics version ${i + 1}, skipping`,
          error,
        );
      }
    }

    if (results.length === 0) {
      throw new BadRequestException('歌词生成失败，请稍后重试');
    }

    return results;
  }

  async expandInspiration(
    params: ExpandInspirationParams,
    userId?: number,
  ): Promise<ExpandInspirationResult> {
    try {
      const prompt = this.buildInspirationPrompt(params.originalPrompt);

      this.logger.log(
        `Expanding inspiration for prompt: ${params.originalPrompt} using AI Client Manager`,
      );

      // 使用新的统一AI客户端管理服务
      const response = await this.aiClientManager.createChatCompletion(
        'gemini', // provider code
        {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'gemini-pro',
          temperature: 0.7,
          maxTokens: 1024,
        },
        userId,
      );

      const expandedContent = response.content.trim();

      return {
        expandedContent,
        originalPrompt: params.originalPrompt,
      };
    } catch (error) {
      this.logger.error('Failed to expand inspiration', error);
      throw new BadRequestException('AI灵感扩展失败，请稍后重试');
    }
  }

  private buildInspirationPrompt(originalPrompt: string): string {
    let prompt = `你是一位经验丰富的音乐创作顾问。用户给出了一个简短的创作主题或想法，请你帮助扩展和丰富这个创作灵感，使其更加完整和具体。\n\n`;
    prompt += `用户的原始想法：${originalPrompt}\n\n`;
    prompt += `请根据用户的原始想法，进行以下扩展：\n`;
    prompt += `1. 明确歌曲的主题和核心情感\n`;
    prompt += `2. 建议适合的音乐风格和情绪氛围\n`;
    prompt += `3. 提供具体的创作方向和场景描述\n`;
    prompt += `4. 给出歌词可以包含的关键元素和意象\n`;
    prompt += `5. 建议歌曲结构（如主歌、副歌的情感走向）\n\n`;
    prompt += `请用流畅自然的中文，以一段完整的文字形式输出扩展后的创作灵感（不要分点列举），让用户能够清晰地理解如何创作这首歌曲。字数控制在200-300字之间。\n`;

    return prompt;
  }

  private buildPrompt(
    params: GenerateLyricsParams,
    versionNumber: number = 1,
  ): string {
    const { theme, style, mood, language = 'zh', customPrompt } = params;

    let prompt = `请你作为一名专业的作词人，创作一首歌词（版本${versionNumber}）。\n\n`;

    prompt += `主题：${theme}\n`;

    if (style) {
      prompt += `音乐风格：${this.translateStyle(style)}\n`;
    }

    if (mood) {
      prompt += `情绪：${this.translateMood(mood)}\n`;
    }

    prompt += `语言：${language === 'zh' ? '中文' : language === 'en' ? 'English' : language}\n\n`;

    if (customPrompt) {
      prompt += `额外要求：${customPrompt}\n\n`;
    }

    prompt += `请按照以下格式输出：\n`;
    prompt += `标题：[歌曲标题]\n\n`;
    prompt += `[副歌/主歌等结构标记]\n`;
    prompt += `[歌词内容]\n\n`;
    prompt += `注意：\n`;
    prompt += `1. 歌词要有韵律感和节奏感\n`;
    prompt += `2. 适合演唱和音乐表现\n`;
    prompt += `3. 情感表达要真挚自然\n`;
    prompt += `4. 包含完整的歌曲结构（主歌、副歌等）\n`;

    return prompt;
  }

  private translateStyle(style: string): string {
    const styleMap: Record<string, string> = {
      pop: '流行',
      rock: '摇滚',
      jazz: '爵士',
      classical: '古典',
      electronic: '电子',
      hiphop: '嘻哈',
      country: '乡村',
      folk: '民谣',
      rnb: 'R&B',
      ballad: '抒情',
    };
    return styleMap[style] || style;
  }

  private translateMood(mood: string): string {
    const moodMap: Record<string, string> = {
      happy: '快乐',
      sad: '悲伤',
      romantic: '浪漫',
      energetic: '充满活力',
      calm: '平静',
      melancholic: '忧郁',
      inspirational: '励志',
      nostalgic: '怀旧',
    };
    return moodMap[mood] || mood;
  }

  private parseLyricsResponse(text: string): LyricsResult {
    const lines = text.split('\n');
    let title = '';
    let lyrics = '';
    let structure = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (
        trimmedLine.startsWith('标题：') ||
        trimmedLine.startsWith('Title:')
      ) {
        title = trimmedLine.replace(/^(标题：|Title:)\s*/, '').trim();
      } else if (trimmedLine) {
        lyrics += line + '\n';
      }
    }

    const structureMatch = lyrics.match(/\[(.*?)\]/g);
    if (structureMatch) {
      structure = structureMatch
        .map((s) => s.replace(/[\[\]]/g, ''))
        .join(', ');
    }

    const lyricsText = lyrics.trim();
    const wordCount = lyricsText.replace(/\s/g, '').length;

    return {
      lyrics: lyricsText,
      title: title || '未命名歌曲',
      structure: structure || '自由结构',
      wordCount,
    };
  }
}
