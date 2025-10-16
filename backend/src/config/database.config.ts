import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', ''),
  database: configService.get<string>('DB_DATABASE', 'music_platform'),

  // 实体自动加载
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // 开发环境自动同步(生产环境务必关闭) - 暂时关闭以避免表结构冲突
  synchronize: false,

  // 日志
  logging:
    configService.get<string>('NODE_ENV') === 'development'
      ? ['error', 'warn', 'query']
      : ['error'],
  logger: 'advanced-console',

  // 字符集和时区
  charset: 'utf8mb4',
  timezone: '+08:00',

  // 连接池配置
  extra: {
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },

  // 自动加载实体
  autoLoadEntities: true,

  // 重试策略
  retryAttempts: 3,
  retryDelay: 3000,

  // 慢查询监控(超过1秒)
  maxQueryExecutionTime: 1000,
});
