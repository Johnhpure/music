import { Module } from '@nestjs/common';
import * as crypto from 'crypto';

// 确保crypto可用
if (typeof global !== 'undefined' && !(global as any).crypto) {
  (global as any).crypto = crypto;
}
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from '@config/database.config';
import { RedisModule } from '@config/redis.config';
import { configValidationSchema } from '@config/app.config';
import { WinstonModule } from 'nest-winston';
import { createLoggerConfig } from '@config/logger.config';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CreditModule } from '@modules/credit/credit.module';
import { AIModule } from '@modules/ai/ai.module';
import { MusicModule } from '@modules/music/music.module';
import { FileModule } from '@modules/file/file.module';
import { BannerModule } from '@modules/banner/banner.module';
import { PromptTemplateModule } from '@modules/prompt-template/prompt-template.module';
import { HotRecommendationModule } from '@modules/hot-recommendation/hot-recommendation.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { SunoConfigModule } from '@modules/suno-config/suno-config.module';
import { AIModelsModule } from '@modules/ai-models/ai-models.module';
import { BullModule } from '@nestjs/bull';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    // 通用模块
    CommonModule,

    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Redis模块
    RedisModule,

    // Bull队列模块
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),

    // 日志模块
    WinstonModule.forRoot(createLoggerConfig()),

    // 业务模块
    UserModule,
    AuthModule,
    CreditModule,
    AIModule,
    MusicModule,
    FileModule,
    BannerModule,
    PromptTemplateModule,
    HotRecommendationModule,
    PaymentModule,
    SunoConfigModule,
    AIModelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
