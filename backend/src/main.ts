import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/http-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { CorsInterceptor } from '@common/interceptors/cors.interceptor';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    cors: true, // 在创建时启用 CORS
  });

  // 配置静态文件访问
  const uploadPath =
    process.env.STORAGE_PATH || path.join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // 全局 CORS 中间件（必须在其他中间件之前）
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log(`[CORS] ${req.method} ${req.url}, Origin: ${origin}`);

    // 设置 CORS headers - 始终设置
    const allowOrigin = origin || '*';
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type,Authorization,X-Requested-With,Accept',
    );
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Range,X-Content-Range',
    );
    res.setHeader('Access-Control-Max-Age', '3600');

    console.log(`[CORS] Set headers, Origin: ${allowOrigin}`);

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] Responding to OPTIONS`);
      return res.status(204).end();
    }

    next();
  });

  // 使用Winston日志
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局 CORS 拦截器（第一个）
  app.useGlobalInterceptors(new CorsInterceptor());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // 全局路由前缀
  app.setGlobalPrefix('api');

  logger.log(`🔐 CORS: Enabled for all origins (development mode)`);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}/api`);
  logger.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📦 Database: ${process.env.DB_DATABASE}`);
}
bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
