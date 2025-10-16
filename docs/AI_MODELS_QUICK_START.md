# AI多模型系统 - 快速开始

## ✨ 系统已完成!

恭喜！AI多模型集成系统已经完整实现。

---

## 📦 包含内容

### ✅ 已实现功能

1. **多Provider支持**: OpenAI, Claude, DeepSeek
2. **多Key轮询**: 智能负载均衡和速率限制
3. **错误重试**: 指数退避策略
4. **完整日志**: API调用日志和使用统计
5. **管理API**: Provider/Key/Model/Stats管理
6. **文档完善**: 使用指南、部署指南、示例代码

### 📁 文件结构

```
project/
├── backend/
│   ├── src/modules/ai-models/        # 核心代码 (24文件)
│   │   ├── clients/                  # OpenAI/Claude/DeepSeek客户端
│   │   ├── controllers/              # 4个Controller
│   │   ├── services/                 # 4个Service
│   │   ├── dto/                      # 数据传输对象
│   │   └── ai-models.module.ts      # Module定义
│   ├── src/database/
│   │   ├── migrations/07-create-ai-models-system.sql
│   │   └── seeds/04-insert-ai-providers.sql
│   ├── scripts/init-ai-models-db.js
│   ├── INSTALL_AI_MODELS.sh         # 自动安装脚本
│   ├── AI_MODELS_README.md          # 快速指南
│   └── AI_MODELS_DEPLOYMENT.md      # 部署指南
└── docs/devdoc/
    ├── AI_MODELS_INTEGRATION_GUIDE.md     # 完整使用指南(8章节)
    ├── AI_MODELS_ADMIN_UI_EXAMPLE.md      # 前端界面示例
    └── AI_MODELS_IMPLEMENTATION_SUMMARY.md # 实现总结
```

---

## 🚀 3分钟快速部署

### 方式1: 使用自动化脚本(推荐)

```bash
cd backend
./INSTALL_AI_MODELS.sh
```

脚本会自动:
1. ✅ 检查Node.js和MySQL
2. ✅ 安装npm依赖(openai, @anthropic-ai/sdk)
3. ✅ 创建数据库表(5张表)
4. ✅ 插入初始数据(3 providers, 11 models)
5. ✅ 验证安装

### 方式2: 手动安装

```bash
# 1. 安装依赖
cd backend
npm install openai @anthropic-ai/sdk

# 2. 数据库初始化
node scripts/init-ai-models-db.js

# 3. 验证
mysql -u root -p -e "USE music_platform; SELECT COUNT(*) FROM t_ai_providers;"
```

---

## 🔑 添加API Keys

### 获取API Keys

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Claude**: https://console.anthropic.com/
3. **DeepSeek**: https://platform.deepseek.com/

### 通过API添加(推荐)

```bash
# 获取管理员token
TOKEN="your-jwt-token"

# 添加OpenAI Key
curl -X POST http://localhost:3000/api/admin/ai-providers/1/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "OpenAI主Key",
    "apiKey": "sk-proj-...",
    "priority": 100,
    "rateLimitRpm": 3500,
    "rateLimitTpm": 90000
  }'
```

### 或直接插入数据库

```sql
-- OpenAI (provider_id=1)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority)
VALUES (1, 'OpenAI主Key', 'sk-proj-...', 100);

-- Claude (provider_id=2)  
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority)
VALUES (2, 'Claude主Key', 'sk-ant-...', 100);

-- DeepSeek (provider_id=3)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority)
VALUES (3, 'DeepSeek主Key', 'sk-...', 100);
```

---

## 🔌 集成到项目

### 1. 导入Module

编辑 `src/app.module.ts`:

```typescript
import { AIModelsModule } from './modules/ai-models/ai-models.module';

@Module({
  imports: [
    // ... 其他模块
    AIModelsModule,  // 添加这一行
  ],
})
export class AppModule {}
```

### 2. 使用示例

```typescript
import { Injectable } from '@nestjs/common';
import { AIClientManagerService } from './modules/ai-models/services/ai-client-manager.service';

@Injectable()
export class YourService {
  constructor(
    private readonly aiClientManager: AIClientManagerService,
  ) {}

  async example() {
    // 调用AI生成内容
    const response = await this.aiClientManager.createChatCompletion(
      'deepseek',  // 使用DeepSeek(性价比高)
      {
        messages: [
          { role: 'user', content: '写一首关于春天的诗' }
        ],
        model: 'deepseek-chat',
        maxTokens: 500,
      },
      userId,
    );

    console.log(response.content);
    console.log(`使用Token: ${response.usage.totalTokens}`);
  }
}
```

### 3. Provider降级示例

```typescript
async function robustCall() {
  // 降级链: DeepSeek -> OpenAI -> Claude
  const providers = ['deepseek', 'openai', 'anthropic'];
  
  for (const provider of providers) {
    try {
      return await this.aiClientManager.createChatCompletion(
        provider, request, userId
      );
    } catch (error) {
      console.log(`${provider} failed, trying next...`);
      if (provider === providers[providers.length - 1]) {
        throw error;
      }
    }
  }
}
```

---

## 📊 管理后台

### API接口

| 功能 | 接口 |
|------|------|
| Provider列表 | GET /api/admin/ai-providers |
| 添加Key | POST /api/admin/ai-providers/:id/keys |
| 验证Key | POST /api/admin/ai-providers/keys/:id/validate |
| 同步模型 | POST /api/admin/ai-providers/:id/sync-models |
| 统计仪表盘 | GET /api/admin/ai-stats/dashboard |
| 使用趋势 | GET /api/admin/ai-stats/usage/trend |

### 前端界面示例

参考: `docs/devdoc/AI_MODELS_ADMIN_UI_EXAMPLE.md`

包含:
- Provider管理页面(Vue 3 + Element Plus)
- 统计仪表盘
- API调用示例

---

## 📚 完整文档

| 文档 | 位置 | 内容 |
|------|------|------|
| 快速指南 | `backend/AI_MODELS_README.md` | 功能介绍、快速开始 |
| 使用手册 | `docs/devdoc/AI_MODELS_INTEGRATION_GUIDE.md` | 8章节完整指南 |
| 部署指南 | `backend/AI_MODELS_DEPLOYMENT.md` | 详细部署步骤 |
| 前端示例 | `docs/devdoc/AI_MODELS_ADMIN_UI_EXAMPLE.md` | Vue界面代码 |
| 实现总结 | `docs/devdoc/AI_MODELS_IMPLEMENTATION_SUMMARY.md` | 技术细节 |

---

## 💡 最佳实践

### Provider选择

| 场景 | 推荐Provider | 模型 |
|------|-------------|------|
| 中文内容 | DeepSeek | deepseek-chat |
| 英文内容 | OpenAI | gpt-4o-mini |
| 复杂推理 | Claude | claude-3-5-sonnet |
| 代码生成 | DeepSeek | deepseek-coder |
| 多模态 | OpenAI | gpt-4o |

### 成本估算

| Provider | 模型 | 输入($/1K) | 输出($/1K) |
|----------|------|-----------|-----------|
| DeepSeek | deepseek-chat | $0.00027 | $0.0011 |
| OpenAI | gpt-4o-mini | $0.00015 | $0.0006 |
| OpenAI | gpt-4o | $0.005 | $0.015 |
| Claude | claude-3-5-sonnet | $0.003 | $0.015 |

**推荐**: 优先使用DeepSeek，成本最低且中文效果好

---

## 🔍 验证安装

### 1. 检查数据库

```bash
mysql -u root -p -e "
USE music_platform;
SELECT 'Providers' as type, COUNT(*) as count FROM t_ai_providers
UNION ALL
SELECT 'Models', COUNT(*) FROM t_ai_models
UNION ALL
SELECT 'Keys', COUNT(*) FROM t_ai_api_keys;
"
```

预期输出:
```
+-----------+-------+
| type      | count |
+-----------+-------+
| Providers |     3 |
| Models    |    11 |
| Keys      |     X | (你添加的key数量)
+-----------+-------+
```

### 2. 测试API

```bash
# 获取Provider列表
curl http://localhost:3000/api/admin/ai-providers \
  -H "Authorization: Bearer $TOKEN"

# 测试聊天
curl -X POST http://localhost:3000/api/ai/chat/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerCode": "deepseek",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 🛠️ 故障排查

### 问题1: "No available API keys"

**解决**: 添加至少一个API Key

```sql
SELECT * FROM t_ai_api_keys WHERE is_active = 1;
```

### 问题2: "Invalid API key"

**解决**: 验证Key是否正确

```bash
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."

# Claude
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-..." \
  -H "anthropic-version: 2023-06-01"
```

### 问题3: 导入Module失败

**解决**: 确认路径正确

```typescript
// 正确
import { AIModelsModule } from './modules/ai-models/ai-models.module';

// 错误
import { AIModelsModule } from '../ai-models/ai-models.module';
```

---

## 📞 获取帮助

### 文档查询

1. 快速问题 → `backend/AI_MODELS_README.md`
2. 详细指南 → `docs/devdoc/AI_MODELS_INTEGRATION_GUIDE.md`
3. 部署问题 → `backend/AI_MODELS_DEPLOYMENT.md`
4. 代码示例 → `backend/src/modules/ai/ai.service.enhanced.ts`

### 检查日志

```bash
# 应用日志
tail -f backend/logs/application.log

# 数据库日志
SELECT * FROM t_ai_api_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 🎉 下一步

1. **添加API Keys** (必须)
   - 至少添加一个Provider的Key
   - 建议添加多个Key实现负载均衡

2. **集成到现有服务** (推荐)
   - 修改`ai.service.ts`使用新系统
   - 参考`ai.service.enhanced.ts`示例

3. **配置监控** (可选)
   - 查看统计仪表盘
   - 设置告警阈值
   - 定期清理日志

4. **前端管理界面** (可选)
   - 参考Vue示例代码
   - 实现可视化管理

5. **性能优化** (后期)
   - 添加Redis缓存
   - 启用流式响应
   - 实现批量调用

---

## ✅ 检查清单

部署前确认:

- [ ] Node.js 18+ 已安装
- [ ] MySQL 8.0+ 正常运行
- [ ] npm依赖已安装(openai, @anthropic-ai/sdk)
- [ ] 数据库表已创建(5张表)
- [ ] 初始数据已导入(3 providers, 11 models)
- [ ] 至少添加了1个API Key
- [ ] AIModelsModule已导入到app.module.ts
- [ ] 应用可正常启动
- [ ] API测试成功

---

**祝你使用愉快! 🚀**

如有问题，请查阅详细文档或提交Issue。
