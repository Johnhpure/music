import * as Joi from 'joi';

// 配置验证Schema
export const configValidationSchema = Joi.object({
  // 应用配置
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // 数据库配置
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // Redis配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // JWT配置
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // 微信小程序配置
  WECHAT_APPID: Joi.string().allow('').optional(),
  WECHAT_SECRET: Joi.string().allow('').optional(),

  // Gemini AI配置
  GEMINI_API_KEY: Joi.string().allow('').optional(),

  // Suno API配置
  SUNO_API_KEY: Joi.string().allow('').optional(),
  SUNO_API_BASE_URL: Joi.string().default('https://api.suno.ai'),

  // OSS配置
  OSS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  OSS_ACCESS_KEY_SECRET: Joi.string().allow('').optional(),
  OSS_BUCKET: Joi.string().allow('').optional(),
  OSS_REGION: Joi.string().default('oss-cn-hangzhou'),
  OSS_ENDPOINT: Joi.string().allow('').optional(),

  // 前端URL
  FRONTEND_URL: Joi.string().default('http://localhost:8080'),

  // 日志级别
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
});

// 应用配置接口
export interface AppConfig {
  nodeEnv: string;
  port: number;
}

// JWT配置接口
export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

// 微信配置接口
export interface WechatConfig {
  appId: string;
  secret: string;
}
