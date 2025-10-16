# AI多模型集成系统

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install openai @anthropic-ai/sdk
```

### 2. 初始化数据库

```bash
node scripts/init-ai-models-db.js
```

### 3. 配置API Key

通过管理后台或API添加你的AI Provider API Keys：

```bash
# 示例: 添加OpenAI Key
curl -X POST http://localhost:3000/api/admin/ai-providers/1/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "OpenAI主Key",
    "apiKey": "sk-proj-...",
    "priority": 100,
    "rateLimitRpm": 3500,
    "rateLimitTpm": 90000,
    "rateLimitRpd": 200000
  }'
```

### 4. 集成到AppModule

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

### 5. 开始使用

```typescript
import { AIClientManagerService } from './modules/ai-models/services/ai-client-manager.service';

@Injectable()
export class YourService {
  constructor(
    private readonly aiClientManager: AIClientManagerService,
  ) {}

  async example() {
    const response = await this.aiClientManager.createChatCompletion(
      'openai',
      {
        messages: [{ role: 'user', content: 'Hello!' }],
        model: 'gpt-4o',
      },
      userId,
    );
    
    console.log(response.content);
  }
}
```

## 📦 项目结构

```
backend/src/modules/ai-models/
├── clients/                    # AI客户端实现
│   ├── base-ai-client.ts      # 基类(重试、错误处理)
│   ├── openai-client.ts       # OpenAI客户端
│   ├── claude-client.ts       # Claude客户端
│   └── deepseek-client.ts     # DeepSeek客户端
├── controllers/               # 控制器
│   ├── ai-provider.controller.ts
│   ├── ai-model.controller.ts
│   ├── ai-stats.controller.ts
│   └── ai-chat.controller.ts
├── dto/                       # 数据传输对象
│   ├── create-provider.dto.ts
│   ├── create-api-key.dto.ts
│   └── chat-completion.dto.ts
├── entities/                  # 数据库实体
│   ├── ai-provider.entity.ts
│   ├── ai-api-key.entity.ts
│   ├── ai-model.entity.ts
│   ├── ai-api-log.entity.ts
│   └── ai-usage-stat.entity.ts
├── interfaces/                # 接口定义
│   └── ai-client.interface.ts
├── services/                  # 服务层
│   ├── ai-provider.service.ts     # Provider管理
│   ├── ai-log.service.ts          # 日志记录
│   ├── ai-usage-stat.service.ts   # 使用统计
│   └── ai-client-manager.service.ts # 统一调用入口
└── ai-models.module.ts        # 模块定义
```

## 🎯 核心功能

### ✅ 多Provider支持

- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5-turbo
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **DeepSeek**: DeepSeek Chat, DeepSeek Reasoner, DeepSeek Coder

### ✅ 多Key轮询

- 基于优先级的自动选择
- 最少使用优先(LRU)
- 速率限制检查
- 自动Key状态管理

### ✅ 智能重试

- 指数退避策略(1s → 2s → 4s → 8s)
- 区分可重试和不可重试错误
- 429限流自动处理
- 网络错误和超时重试

### ✅ 完整日志

- API调用日志
- Token使用统计
- 成本计算
- 错误追踪

### ✅ 统计分析

- 按天汇总统计
- 趋势分析
- 成本分析
- 性能监控

## 📊 数据库表

| 表名 | 说明 |
|------|------|
| t_ai_providers | AI供应商配置 |
| t_ai_api_keys | API密钥管理 |
| t_ai_models | 模型信息 |
| t_ai_api_logs | API调用日志 |
| t_ai_usage_stats | 使用统计(按天) |

## 🔧 API接口

### 聊天接口

```http
POST /api/ai/chat/completions
Authorization: Bearer {token}
Content-Type: application/json

{
  "providerCode": "openai",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gpt-4o",
  "maxTokens": 1000
}
```

### 管理接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/admin/ai-providers | GET | 获取Provider列表 |
| /api/admin/ai-providers | POST | 创建Provider |
| /api/admin/ai-providers/:id/keys | GET | 获取Key列表 |
| /api/admin/ai-providers/:providerId/keys | POST | 添加Key |
| /api/admin/ai-providers/:id/sync-models | POST | 同步模型 |
| /api/admin/ai-models | GET | 获取模型列表 |
| /api/admin/ai-stats/dashboard | GET | 获取仪表盘数据 |
| /api/admin/ai-stats/usage/trend | GET | 获取趋势数据 |

## 💡 使用示例

### 基础调用

```typescript
const response = await aiClientManager.createChatCompletion(
  'openai',
  {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing' },
    ],
    model: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.7,
  },
  userId,
);
```

### Provider降级

```typescript
async function robustCall() {
  const providers = ['deepseek', 'openai', 'anthropic'];
  
  for (const provider of providers) {
    try {
      return await aiClientManager.createChatCompletion(provider, request, userId);
    } catch (error) {
      if (provider === providers[providers.length - 1]) throw error;
      continue;
    }
  }
}
```

### Token计数

```typescript
const tokens = await aiClientManager.countTokens(
  'openai',
  longText,
  'gpt-4o',
);

if (tokens > 100000) {
  console.log('Text too long');
}
```

## 📈 性能建议

### Provider选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| 中文内容 | DeepSeek | 性价比高 |
| 英文内容 | OpenAI GPT-4o-mini | 平衡 |
| 复杂推理 | Claude 3.5 Sonnet | 推理强 |
| 代码生成 | DeepSeek Coder | 专门优化 |
| 多模态 | OpenAI GPT-4o | 支持图片 |

### 成本优化

```typescript
// 1. 限制maxTokens
{ maxTokens: 500 }

// 2. 使用便宜的模型
providerCode: 'deepseek'

// 3. 利用缓存(DeepSeek自动缓存重复prompt)
```

## 🐛 故障排查

### 错误: "No available API keys"

**解决**: 
1. 检查Key状态
2. 查看是否达到速率限制
3. 添加新Key

### 错误: "Invalid API key"

**解决**:
1. 验证Key: `POST /api/admin/ai-providers/keys/:id/validate`
2. 重新生成Key

### 高错误率

**解决**:
1. 查看错误统计: `GET /api/admin/ai-stats/logs/errors`
2. 检查网络、服务器、配置

## 📚 文档

- [完整使用指南](../docs/devdoc/AI_MODELS_INTEGRATION_GUIDE.md)
- [前端界面示例](../docs/devdoc/AI_MODELS_ADMIN_UI_EXAMPLE.md)
- [数据库结构](./src/database/migrations/07-create-ai-models-system.sql)

## 📝 更新日志

### v1.0.0 (2025-01)

- ✅ 初始版本
- ✅ 支持OpenAI、Claude、DeepSeek
- ✅ 多Key轮询机制
- ✅ 完整日志和统计
- ✅ 管理后台API

## 🤝 贡献

欢迎提交Issue和PR！

## 📄 License

MIT
