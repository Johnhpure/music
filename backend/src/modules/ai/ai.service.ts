import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GeminiService } from './gemini.service';
import { CreditService } from '@modules/credit/credit.service';
import { LyricsGeneration } from './entities/lyrics-generation.entity';
import {
  CreditLog,
  CreditType,
} from '@modules/credit/entities/credit-log.entity';
import { GenerateLyricsDto } from './dto/generate-lyrics.dto';
import { ExpandInspirationDto } from './dto/expand-inspiration.dto';
import { GenerateLyricsParams, ExpandInspirationParams } from './ai.types';

@Injectable()
export class AIService {
  private readonly LYRICS_GENERATION_COST = 10;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(LyricsGeneration)
    private lyricsGenerationRepository: Repository<LyricsGeneration>,
    @InjectRepository(CreditLog)
    private creditLogRepository: Repository<CreditLog>,
    private geminiService: GeminiService,
    private creditService: CreditService,
    private dataSource: DataSource,
  ) {}

  async generateLyrics(userId: number, dto: GenerateLyricsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.creditService.consumeCredit(userId, {
        amount: this.LYRICS_GENERATION_COST,
        description: '生成AI歌词',
        related_type: 'lyrics_generation',
      });

      const params: GenerateLyricsParams = {
        theme: dto.theme,
        style: dto.style,
        mood: dto.mood,
        language: dto.language || 'zh',
        customPrompt: dto.customPrompt,
      };

      const versionsCount = dto.versionsCount || 2;

      this.logger.log(
        `User ${userId} generating ${versionsCount} lyrics versions for theme: ${dto.theme}`,
      );

      const results = await this.geminiService.generateMultipleLyrics(
        params,
        versionsCount,
        userId,
      );

      const generation = this.lyricsGenerationRepository.create({
        user_id: userId,
        theme: dto.theme,
        style: dto.style,
        mood: dto.mood,
        language: dto.language || 'zh',
        custom_prompt: dto.customPrompt,
        lyrics: JSON.stringify(results),
        title: results[0]?.title || '未命名歌曲',
        structure: results[0]?.structure || '自由结构',
        credit_cost: this.LYRICS_GENERATION_COST,
      });

      await queryRunner.manager.save(generation);
      await queryRunner.commitTransaction();

      const balance = await this.creditService.getUserBalance(userId);

      this.logger.log(
        `Lyrics generated successfully for user ${userId}, generation ID: ${generation.id}`,
      );

      return {
        requestId: `lyric_${generation.id}_${Date.now()}`,
        versions: results.map((result, index) => ({
          versionNumber: index + 1,
          title: result.title,
          lyrics: result.lyrics,
          wordCount: result.wordCount || 0,
        })),
        costCredits: this.LYRICS_GENERATION_COST,
        remainingCredits: balance.balance,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate lyrics', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('歌词生成失败');
    } finally {
      await queryRunner.release();
    }
  }

  async expandInspiration(userId: number, dto: ExpandInspirationDto) {
    const INSPIRATION_COST = 10;
    const FREE_COUNT_PER_DAY = 3;

    try {
      // 获取用户今天的AI扩展灵感使用次数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const usageCount = await this.creditLogRepository
        .createQueryBuilder('log')
        .where('log.user_id = :userId', { userId })
        .andWhere('log.related_type = :relatedType', {
          relatedType: 'ai_inspiration',
        })
        .andWhere('log.created_at >= :today', { today })
        .andWhere('log.created_at < :tomorrow', { tomorrow })
        .getCount();

      this.logger.log(
        `User ${userId} has used AI inspiration ${usageCount} times today`,
      );

      // 判断是否需要扣费
      const needPayment = usageCount >= FREE_COUNT_PER_DAY;
      let costCredits = 0;

      if (needPayment) {
        // 检查余额并扣费
        await this.creditService.consumeCredit(userId, {
          amount: INSPIRATION_COST,
          description: 'AI扩展灵感',
          related_type: 'ai_inspiration',
        });
        costCredits = INSPIRATION_COST;
      } else {
        // 免费使用，但也记录到credit_logs中（amount=0）
        await this.creditLogRepository.insert({
          user_id: userId,
          amount: 0,
          balance_after: 0,
          type: CreditType.CONSUME,
          description: `AI扩展灵感（免费，今日第${usageCount + 1}次）`,
          related_type: 'ai_inspiration',
        });
      }

      // 调用Gemini服务扩展灵感
      const params: ExpandInspirationParams = {
        originalPrompt: dto.originalPrompt,
      };

      const result = await this.geminiService.expandInspiration(params, userId);

      // 获取剩余点数
      const balance = await this.creditService.getUserBalance(userId);

      // 计算剩余免费次数
      const remainingFreeCount = Math.max(
        0,
        FREE_COUNT_PER_DAY - usageCount - 1,
      );

      this.logger.log(
        `AI inspiration expanded successfully for user ${userId}`,
      );

      return {
        expandedContent: result.expandedContent,
        originalPrompt: result.originalPrompt,
        costCredits,
        remainingCredits: balance.balance,
        remainingFreeCount,
        usedFreeCount: Math.min(usageCount + 1, FREE_COUNT_PER_DAY),
      };
    } catch (error) {
      this.logger.error('Failed to expand inspiration', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('AI灵感扩展失败');
    }
  }

  async getGenerationHistory(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.lyricsGenerationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        theme: item.theme,
        title: item.title,
        style: item.style,
        mood: item.mood,
        lyrics: item.lyrics,
        structure: item.structure,
        creditCost: item.credit_cost,
        createdAt: item.created_at,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getGenerationById(userId: number, id: number) {
    const generation = await this.lyricsGenerationRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!generation) {
      throw new BadRequestException('歌词记录不存在');
    }

    return {
      id: generation.id,
      theme: generation.theme,
      title: generation.title,
      style: generation.style,
      mood: generation.mood,
      language: generation.language,
      customPrompt: generation.custom_prompt,
      lyrics: generation.lyrics,
      structure: generation.structure,
      creditCost: generation.credit_cost,
      createdAt: generation.created_at,
    };
  }
}
