import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AIProvider } from './entities/ai-provider.entity';
import { AIApiKey } from './entities/ai-api-key.entity';
import { AIModel } from './entities/ai-model.entity';
import { AIApiLog } from './entities/ai-api-log.entity';
import { AIUsageStat } from './entities/ai-usage-stat.entity';

// Services
import { AIProviderService } from './services/ai-provider.service';
import { AILogService } from './services/ai-log.service';
import { AIUsageStatService } from './services/ai-usage-stat.service';
import { AIClientManagerService } from './services/ai-client-manager.service';

// Controllers
import { AIProviderController } from './controllers/ai-provider.controller';
import { AIModelController } from './controllers/ai-model.controller';
import { AIStatsController } from './controllers/ai-stats.controller';
import { AIChatController } from './controllers/ai-chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AIProvider,
      AIApiKey,
      AIModel,
      AIApiLog,
      AIUsageStat,
    ]),
  ],
  controllers: [
    AIProviderController,
    AIModelController,
    AIStatsController,
    AIChatController,
  ],
  providers: [
    AIProviderService,
    AILogService,
    AIUsageStatService,
    AIClientManagerService,
  ],
  exports: [
    AIProviderService,
    AILogService,
    AIUsageStatService,
    AIClientManagerService,
  ],
})
export class AIModelsModule {}
