import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '@common/common.module';

// Entities
import { AIProvider } from './entities/ai-provider.entity';
import { AIApiKey } from './entities/ai-api-key.entity';
import { AIModel } from './entities/ai-model.entity';
import { AIApiLog } from './entities/ai-api-log.entity';
import { AIUsageStat } from './entities/ai-usage-stat.entity';
import { GeminiKeyGroup } from './entities/gemini-key-group.entity';

// Services
import { AIProviderService } from './services/ai-provider.service';
import { AILogService } from './services/ai-log.service';
import { AIUsageStatService } from './services/ai-usage-stat.service';
import { AIClientManagerService } from './services/ai-client-manager.service';
import { GeminiKeyGroupService } from './services/gemini-key-group.service';

// Controllers
import { AIProviderController } from './controllers/ai-provider.controller';
import { AIModelController } from './controllers/ai-model.controller';
import { AIStatsController } from './controllers/ai-stats.controller';
import { AIChatController } from './controllers/ai-chat.controller';
import { GeminiKeyGroupController } from './controllers/gemini-key-group.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AIProvider,
      AIApiKey,
      AIModel,
      AIApiLog,
      AIUsageStat,
      GeminiKeyGroup,
    ]),
    CommonModule,
  ],
  controllers: [
    AIProviderController,
    AIModelController,
    AIStatsController,
    AIChatController,
    GeminiKeyGroupController,
  ],
  providers: [
    AIProviderService,
    AILogService,
    AIUsageStatService,
    AIClientManagerService,
    GeminiKeyGroupService,
  ],
  exports: [
    AIProviderService,
    AILogService,
    AIUsageStatService,
    AIClientManagerService,
    GeminiKeyGroupService,
  ],
})
export class AIModelsModule {}
