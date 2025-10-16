import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),

          // 重连策略
          retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },

          // 连接超时
          connectTimeout: 10000,

          // 命令超时
          commandTimeout: 5000,

          // 自动Pipeline
          enableAutoPipelining: true,

          // 错误处理
          lazyConnect: false,
        });

        // Redis事件监听
        redis.on('connect', () => {
          console.log('✅ Redis连接成功');
        });

        redis.on('error', (error) => {
          console.error('❌ Redis连接错误:', error.message);
        });

        redis.on('close', () => {
          console.log('⚠️  Redis连接关闭');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
