import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GeminiService } from './gemini.service';
import { LyricsGeneration } from './entities/lyrics-generation.entity';
import { CreditLog } from '@modules/credit/entities/credit-log.entity';
import { CreditModule } from '@modules/credit/credit.module';
import { AIModelsModule } from '@modules/ai-models/ai-models.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LyricsGeneration, CreditLog]),
    ScheduleModule.forRoot(),
    ConfigModule,
    CreditModule,
    AIModelsModule,
  ],
  controllers: [AIController],
  providers: [AIService, GeminiService],
  exports: [AIService, GeminiService],
})
export class AIModule {}
