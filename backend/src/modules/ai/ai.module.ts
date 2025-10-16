import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiService } from './gemini.service';
import { GeminiKeyManagerService } from './services/gemini-key-manager.service';
import { GeminiAdminController } from './gemini-admin.controller';
import { LyricsGeneration } from './entities/lyrics-generation.entity';
import { GeminiApiKey } from './entities/gemini-api-key.entity';
import { GeminiApiLog } from './entities/gemini-api-log.entity';
import { GeminiModel } from './entities/gemini-model.entity';
import { GeminiUsageStat } from './entities/gemini-usage-stat.entity';
import { CreditLog } from '@modules/credit/entities/credit-log.entity';
import { CreditModule } from '@modules/credit/credit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LyricsGeneration,
      CreditLog,
      GeminiApiKey,
      GeminiApiLog,
      GeminiModel,
      GeminiUsageStat,
    ]),
    ScheduleModule.forRoot(),
    CreditModule,
  ],
  controllers: [AIController, GeminiAdminController],
  providers: [AIService, GeminiService, GeminiKeyManagerService],
  exports: [AIService, GeminiService, GeminiKeyManagerService],
})
export class AIModule {}
