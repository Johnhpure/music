# AI多模型集成系统使用指南

> **版本**: v1.0  
> **创建时间**: 2025-01  
> **项目**: 音乐创作平台AI多模型系统

---

## 📋 目录

- [1. 系统概述](#1-系统概述)
- [2. 快速开始](#2-快速开始)
- [3. 架构设计](#3-架构设计)
- [4. API接口文档](#4-api接口文档)
- [5. 管理后台使用](#5-管理后台使用)
- [6. 开发集成](#6-开发集成)
- [7. 最佳实践](#7-最佳实践)
- [8. 故障排查](#8-故障排查)

---

## 1. 系统概述

### 1.1 功能特性

本系统提供了完整的AI多模型管理和调用能力：

✅ **多Provider支持**
- OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5-turbo)
- Anthropic Claude (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus)
- DeepSeek (DeepSeek Chat, DeepSeek Reasoner, DeepSeek Coder)

✅ **核心功能**
- 多API Key轮询和负载均衡
- 智能错误重试(指数退避)
- Token使用统计和成本计算
- 完整的调用日志记录
- 速率限制管理
- 自动模型列表同步

✅ **管理能力**
- Provider配置管理
- API Key管理(支持多key)
- Model配置管理
- 使用统计和趋势分析
- 错误监控和告警

### 1.2 技术栈

- **后端**: NestJS + TypeScript
- **数据库**: MySQL 8.0+
- **SDK**: 
  - `openai` (OpenAI官方SDK)
  - `@anthropic-ai/sdk` (Claude官方SDK)
- **ORM**: TypeORM

---

## 2. 快速开始

### 2.1 安装依赖

```bash
cd backend
npm install openai @anthropic-ai/sdk mysql2
```

### 2.2 数据库初始化

```bash
# 运行数据库初始化脚本
node scripts/init-ai-models-db.js
```

这将创建以下表：
- `t_ai_providers` - AI供应商
- `t_ai_api_keys` - API密钥
- `t_ai_models` - AI模型
- `t_ai_api_logs` - API调用日志
- `t_ai_usage_stats` - 使用统计

### 2.3 添加API Key

有两种方式添加API Key：

#### 方式1: 通过API接口

```bash
curl -X POST http://localhost:3000/api/admin/ai-providers/1/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "providerId": 1,
    "keyName": "OpenAI主Key",
    "apiKey": "sk-proj-...",
    "priority": 100,
    "rateLimitRpm": 3500,
    "rateLimitTpm": 90000,
    "rateLimitRpd": 200000
  }'
```

#### 方式2: 直接插入数据库

```sql
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, rate_limit_rpm, rate_limit_tpm, rate_limit_rpd)
VALUES (1, 'OpenAI主Key', 'sk-proj-...', 100, 3500, 90000, 200000);
```

### 2.4 集成到AppModule

```typescript
// src/app.module.ts
import { AIModelsModule } from './modules/ai-models/ai-models.module';

@Module({
  imports: [
    // ... 其他模块
    AIModelsModule,
  ],
})
export class AppModule {}
```

### 2.5 第一次调用

```typescript
import { AIClientManagerService } from './modules/ai-models/services/ai-client-manager.service';

@Injectable()
export class YourService {
  constructor(
    private readonly aiClientManager: AIClientManagerService,
  ) {}

  async generateText() {
    const response = await this.aiClientManager.createChatCompletion(
      'openai', // provider code
      {
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ],
        model: 'gpt-4o',
        maxTokens: 1000,
        temperature: 0.7,
      },
      userId, // 可选
      ipAddress, // 可选
      userAgent, // 可选
    );

    console.log(response.content);
    console.log(`Tokens used: ${response.usage.totalTokens}`);
  }
}
```

---

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Controllers: AIChat, AIProvider, AIModel, AIStats)        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Service Layer                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        AIClientManagerService                        │  │
│  │  (统一调用入口，集成日志、统计、错误处理)            │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                                │
│  ┌──────────▼───────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ AIProviderService    │  │ AILogService │  │ AIUsage  │ │
│  │ (Key选择、轮询)      │  │ (日志记录)   │  │StatService│ │
│  └──────────┬───────────┘  └──────────────┘  └──────────┘ │
└─────────────┼────────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────────┐
│                   AI Client Layer                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ OpenAIClient │  │ ClaudeClient │  │DeepSeekClient│     │
│  │ (openai SDK) │  │(@anthropic)  │  │(OpenAI兼容)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                   │                   │           │
└─────────┼───────────────────┼───────────────────┼───────────┘
          │                   │                   │
┌─────────▼───────────────────▼───────────────────▼───────────┐
│              External AI Provider APIs                       │
│  (OpenAI API, Claude API, DeepSeek API)                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 多Key轮询策略

```typescript
// 轮询算法
function selectAvailableKey(providerId: number): AIApiKey {
  // 1. 获取所有活跃的key
  const keys = await getActiveKeys(providerId);
  
  // 2. 按优先级排序 (priority DESC)
  keys.sort((a, b) => b.priority - a.priority);
  
  // 3. 检查速率限制
  for (const key of keys) {
    if (checkRateLimit(key)) {
      return key; // 返回第一个未达到限制的key
    }
  }
  
  // 4. 所有key都达到限制，返回最近最少使用的
  return keys.sort((a, b) => 
    a.lastUsedAt.getTime() - b.lastUsedAt.getTime()
  )[0];
}
```

### 3.3 错误重试机制

```typescript
// 指数退避重试
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      // 判断是否应该重试
      if (!shouldRetry(error) || attempt >= maxRetries) {
        throw error;
      }
      
      // 指数退避: 1s, 2s, 4s, 8s
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
      await sleep(backoffMs);
    }
  }
}

function shouldRetry(error: any): boolean {
  // 网络错误 - 重试
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return true;
  }
  
  // 速率限制 (429) - 重试
  if (error.status === 429) {
    return true;
  }
  
  // 服务器错误 (500-599) - 重试
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  // 其他错误 - 不重试
  return false;
}
```

---

## 4. API接口文档

### 4.1 聊天完成接口

**POST** `/api/ai/chat/completions`

创建AI聊天完成请求。

#### 请求参数

```typescript
{
  "providerCode": "openai",  // 必填: openai | anthropic | deepseek
  "messages": [              // 必填: 对话消息列表
    {
      "role": "user",        // system | user | assistant
      "content": "Hello!"
    }
  ],
  "model": "gpt-4o",        // 可选: 模型代码
  "maxTokens": 1000,        // 可选: 最大token数
  "temperature": 0.7,       // 可选: 0-2
  "topP": 1.0               // 可选: 0-1
}
```

#### 响应示例

```json
{
  "code": 200,
  "data": {
    "id": "chatcmpl-abc123",
    "content": "Hello! How can I help you today?",
    "model": "gpt-4o",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 15,
      "totalTokens": 25
    },
    "finishReason": "stop",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4.2 Provider管理接口

#### 获取Provider列表

**GET** `/api/admin/ai-providers`

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "providerCode": "openai",
      "providerName": "OpenAI",
      "baseUrl": "https://api.openai.com/v1",
      "isActive": true,
      "modelsCount": 4,
      "activeKeysCount": 2
    }
  ]
}
```

#### 创建Provider

**POST** `/api/admin/ai-providers`

```json
{
  "providerCode": "custom-provider",
  "providerName": "Custom AI Provider",
  "baseUrl": "https://api.custom.com",
  "isActive": true,
  "sortOrder": 70,
  "description": "自定义AI供应商"
}
```

### 4.3 API Key管理接口

#### 获取Key列表

**GET** `/api/admin/ai-providers/:providerId/keys`

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "providerId": 1,
      "keyName": "OpenAI主Key",
      "apiKey": "sk-p...1234",  // 已脱敏
      "priority": 100,
      "isActive": true,
      "status": "normal",
      "requestsCountToday": 1523,
      "tokensCountToday": 45231,
      "lastUsedAt": "2025-01-15T10:25:00.000Z"
    }
  ]
}
```

#### 添加API Key

**POST** `/api/admin/ai-providers/:providerId/keys`

```json
{
  "keyName": "OpenAI备用Key",
  "apiKey": "sk-proj-...",
  "priority": 90,
  "rateLimitRpm": 3500,
  "rateLimitTpm": 90000,
  "rateLimitRpd": 200000
}
```

#### 验证API Key

**POST** `/api/admin/ai-providers/keys/:id/validate`

```json
{
  "code": 200,
  "data": {
    "isValid": true
  },
  "message": "API Key is valid"
}
```

### 4.4 Model管理接口

#### 获取模型列表

**GET** `/api/admin/ai-models?providerId=1&isActive=true`

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "providerId": 1,
      "modelCode": "gpt-4o",
      "modelName": "GPT-4o",
      "modelType": "chat",
      "maxInputTokens": 128000,
      "maxOutputTokens": 16384,
      "supportsStreaming": true,
      "supportsFunctionCall": true,
      "costPer1kPromptTokens": 0.005,
      "costPer1kCompletionTokens": 0.015,
      "isActive": true,
      "isDefault": true
    }
  ]
}
```

#### 同步模型列表

**POST** `/api/admin/ai-providers/:id/sync-models`

从Provider的API自动获取最新的模型列表并更新数据库。

```json
{
  "code": 200,
  "message": "Synced 10 models",
  "data": {
    "count": 10
  }
}
```

### 4.5 统计接口

#### 获取使用统计

**GET** `/api/admin/ai-stats/usage?startDate=2025-01-01&endDate=2025-01-15&groupBy=day`

```json
{
  "code": 200,
  "data": [
    {
      "date": "2025-01-15",
      "totalRequests": 5230,
      "successCount": 5180,
      "errorCount": 50,
      "totalTokens": 152300,
      "totalCost": 1.523
    }
  ]
}
```

#### 获取趋势数据

**GET** `/api/admin/ai-stats/usage/trend?days=30`

```json
{
  "code": 200,
  "data": [
    {
      "date": "2025-01-15",
      "requests": 5230,
      "tokens": 152300,
      "cost": 1.523,
      "successRate": 0.99
    }
  ]
}
```

#### 获取仪表盘统计

**GET** `/api/admin/ai-stats/dashboard?days=7`

```json
{
  "code": 200,
  "data": {
    "summary": {
      "totalRequests": 35420,
      "successCount": 35102,
      "errorCount": 318,
      "successRate": 0.991,
      "totalTokens": 1052300,
      "totalCost": 10.523,
      "avgLatencyMs": 1523
    },
    "trend": [...],
    "errors": {
      "totalErrors": 318,
      "errorsByCode": [...],
      "errorsByKey": [...]
    }
  }
}
```

---

## 5. 管理后台使用

### 5.1 Provider管理

1. **添加Provider**
   - 进入"AI Provider管理"页面
   - 点击"添加Provider"
   - 填写Provider信息
   - 保存

2. **配置API Key**
   - 选择Provider
   - 点击"添加API Key"
   - 填写Key信息和速率限制
   - 设置优先级
   - 保存

3. **同步模型列表**
   - 选择Provider
   - 点击"同步模型"
   - 系统自动从API获取最新模型

### 5.2 监控和统计

1. **查看使用趋势**
   - 进入"统计分析"页面
   - 选择时间范围
   - 查看请求量、Token使用量、成本趋势

2. **错误监控**
   - 查看错误率
   - 按错误类型分组
   - 按Key分组查看问题Key

3. **Key状态监控**
   - 查看每个Key的使用情况
   - 监控速率限制状态
   - 查看最后使用时间

---

## 6. 开发集成

### 6.1 在Service中使用

```typescript
import { Injectable } from '@nestjs/common';
import { AIClientManagerService } from '../ai-models/services/ai-client-manager.service';

@Injectable()
export class LyricsService {
  constructor(
    private readonly aiClientManager: AIClientManagerService,
  ) {}

  async generateLyrics(theme: string, style: string, userId: number) {
    try {
      // 使用DeepSeek生成中文歌词(性价比高)
      const response = await this.aiClientManager.createChatCompletion(
        'deepseek',
        {
          messages: [
            {
              role: 'system',
              content: '你是一个专业的歌词创作助手。',
            },
            {
              role: 'user',
              content: `请创作一首关于"${theme}"的${style}风格歌词。`,
            },
          ],
          model: 'deepseek-chat',
          maxTokens: 2000,
          temperature: 0.8,
        },
        userId,
      );

      return {
        lyrics: response.content,
        tokensUsed: response.usage.totalTokens,
        cost: this.calculateCost(response.usage),
      };
    } catch (error) {
      // 降级到OpenAI
      console.log('DeepSeek failed, falling back to OpenAI');
      
      const response = await this.aiClientManager.createChatCompletion(
        'openai',
        {
          messages: [...],
          model: 'gpt-3.5-turbo',
        },
        userId,
      );

      return {
        lyrics: response.content,
        tokensUsed: response.usage.totalTokens,
        cost: this.calculateCost(response.usage),
      };
    }
  }

  private calculateCost(usage: any): number {
    // 成本已经在response中计算
    return usage.totalTokens * 0.001; // 示例
  }
}
```

### 6.2 批量调用

```typescript
async function batchGenerate() {
  const requests = [
    { messages: [{ role: 'user', content: 'Task 1' }] },
    { messages: [{ role: 'user', content: 'Task 2' }] },
    { messages: [{ role: 'user', content: 'Task 3' }] },
  ];

  const responses = await aiClientManager.batchCreateChatCompletion(
    'openai',
    requests,
    userId,
  );

  console.log(`Completed ${responses.length} tasks`);
}
```

### 6.3 Token计数

```typescript
// 在发送请求前估算token数
const tokenCount = await aiClientManager.countTokens(
  'openai',
  longText,
  'gpt-4o',
);

console.log(`Estimated tokens: ${tokenCount}`);

// 检查是否会超过限制
if (tokenCount > 100000) {
  console.log('Text too long, need to split');
}
```

---

## 7. 最佳实践

### 7.1 Provider选择策略

根据不同场景选择合适的Provider：

| 场景 | 推荐Provider | 模型 | 原因 |
|------|-------------|------|------|
| 中文内容生成 | DeepSeek | deepseek-chat | 性价比高，中文能力强 |
| 英文内容生成 | OpenAI | gpt-4o-mini | 平衡性能和成本 |
| 复杂推理任务 | Claude | claude-3-5-sonnet | 推理能力强 |
| 代码生成 | DeepSeek | deepseek-coder | 专门优化 |
| 多模态(图片) | OpenAI | gpt-4o | 支持视觉 |
| 长上下文 | Claude | claude-3-5-sonnet | 200K上下文 |

### 7.2 成本优化

```typescript
// 1. 根据任务复杂度选择模型
function selectModel(complexity: 'simple' | 'medium' | 'complex') {
  switch (complexity) {
    case 'simple':
      return { provider: 'deepseek', model: 'deepseek-chat' }; // 最便宜
    case 'medium':
      return { provider: 'openai', model: 'gpt-4o-mini' };
    case 'complex':
      return { provider: 'openai', model: 'gpt-4o' };
  }
}

// 2. 限制maxTokens
const response = await aiClientManager.createChatCompletion('openai', {
  messages: [...],
  maxTokens: 500, // 限制输出长度，控制成本
});

// 3. 使用缓存(DeepSeek支持)
// DeepSeek会自动缓存重复的prompt，降低成本
```

### 7.3 错误处理

```typescript
async function robustAICall() {
  const providers = ['deepseek', 'openai', 'anthropic']; // 降级链
  
  for (const provider of providers) {
    try {
      const response = await aiClientManager.createChatCompletion(
        provider,
        request,
        userId,
      );
      
      return response;
    } catch (error) {
      console.error(`${provider} failed: ${error.message}`);
      
      // 如果是最后一个provider，抛出错误
      if (provider === providers[providers.length - 1]) {
        throw error;
      }
      
      // 否则继续尝试下一个provider
      continue;
    }
  }
}
```

### 7.4 速率限制管理

```typescript
// 为不同的Key设置不同的限制
const keys = [
  {
    name: '主Key',
    priority: 100,
    rateLimitRpm: 3500,  // OpenAI GPT-4o的RPM限制
    rateLimitTpm: 90000, // TPM限制
    rateLimitRpd: 200000, // 每日限制
  },
  {
    name: '备用Key',
    priority: 90,
    rateLimitRpm: 3500,
    rateLimitTpm: 90000,
    rateLimitRpd: 200000,
  },
];

// 系统会自动轮询使用，避免单个Key达到限制
```

---

## 8. 故障排查

### 8.1 常见错误

#### 错误1: "No available API keys"

**原因**: 所有Key都不可用或已达速率限制

**解决方案**:
1. 检查Key状态: `GET /api/admin/ai-providers/1/keys`
2. 查看是否所有Key都达到了每日限制
3. 添加新的Key或等待限制重置

#### 错误2: "Invalid API key"

**原因**: API Key无效或已过期

**解决方案**:
1. 验证Key: `POST /api/admin/ai-providers/keys/:id/validate`
2. 检查Provider的API Key是否正确
3. 重新生成Key并更新

#### 错误3: 高错误率

**原因**: 网络问题、服务器问题或配置错误

**解决方案**:
1. 查看错误统计: `GET /api/admin/ai-stats/logs/errors`
2. 检查错误类型分布
3. 针对性解决:
   - 网络问题: 检查DNS、防火墙
   - 服务器问题: 等待Provider恢复
   - 配置错误: 检查baseUrl、apiKey等

### 8.2 性能优化

#### 问题: API响应慢

**诊断**:
```sql
-- 查看平均延迟
SELECT 
  provider_id,
  AVG(latency_ms) as avg_latency,
  MAX(latency_ms) as max_latency
FROM t_ai_api_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY provider_id;
```

**优化**:
1. 检查网络延迟
2. 使用地理位置更近的Provider
3. 启用HTTP/2连接
4. 增加超时时间

#### 问题: 数据库慢

**诊断**:
```sql
-- 检查慢查询
SHOW PROCESSLIST;

-- 检查索引使用
EXPLAIN SELECT * FROM t_ai_api_logs WHERE ...;
```

**优化**:
1. 添加索引
2. 定期清理旧日志
3. 使用分区表
4. 读写分离

### 8.3 日志分析

```typescript
// 查询最近的错误日志
const errors = await logService.queryLogs({
  status: 'error',
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  page: 1,
  pageSize: 50,
});

// 分析错误模式
errors.logs.forEach(log => {
  console.log(`Error: ${log.errorCode}`);
  console.log(`Key: ${log.keyId}`);
  console.log(`Message: ${log.errorMessage}`);
});
```

---

## 附录

### A. 环境变量配置

```bash
# .env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=music_platform

# API Keys (用于初始化，生产环境应通过管理后台添加)
# OPENAI_API_KEY=sk-proj-...
# ANTHROPIC_API_KEY=sk-ant-...
# DEEPSEEK_API_KEY=sk-...
```

### B. 数据库表结构

详见: `backend/src/database/migrations/07-create-ai-models-system.sql`

### C. API限制参考

| Provider | RPM | TPM | RPD |
|----------|-----|-----|-----|
| OpenAI GPT-4o | 3,500 | 90,000 | - |
| OpenAI GPT-4o-mini | 3,500 | 90,000 | - |
| Claude 3.5 Sonnet | 4,000 | 80,000 | - |
| DeepSeek | 无限制 | 无限制 | - |

*注: 限制可能随Provider政策变化，请查阅官方文档*

---

**文档维护**: 请在修改系统时同步更新本文档  
**最后更新**: 2025-01-15
