# AI多模型系统部署指南

## 📋 部署检查清单

### 前置条件

- [x] Node.js 18+
- [x] MySQL 8.0+
- [x] 已有的NestJS项目运行正常
- [x] 已获取AI Provider的API Keys

### 需要的API Keys

1. **OpenAI** (可选): https://platform.openai.com/api-keys
2. **Anthropic Claude** (可选): https://console.anthropic.com/
3. **DeepSeek** (可选): https://platform.deepseek.com/

> 注意: 至少需要一个Provider的API Key才能正常工作

---

## 🚀 部署步骤

### 步骤1: 安装依赖

```bash
cd backend

# 安装AI SDK依赖
npm install openai @anthropic-ai/sdk

# 或使用yarn
yarn add openai @anthropic-ai/sdk
```

### 步骤2: 数据库迁移

```bash
# 方式1: 使用初始化脚本(推荐)
node scripts/init-ai-models-db.js

# 方式2: 手动执行SQL
# mysql -u root -p music_platform < src/database/migrations/07-create-ai-models-system.sql
# mysql -u root -p music_platform < src/database/seeds/04-insert-ai-providers.sql
```

**验证**:
```bash
mysql -u root -p -e "USE music_platform; SHOW TABLES LIKE 't_ai_%';"
```

应该看到5张表:
- t_ai_providers
- t_ai_api_keys
- t_ai_models
- t_ai_api_logs
- t_ai_usage_stats

### 步骤3: 集成Module

编辑 `src/app.module.ts`:

```typescript
import { AIModelsModule } from './modules/ai-models/ai-models.module';

@Module({
  imports: [
    // ... 现有的模块
    TypeOrmModule.forRoot({
      // ... 现有配置
    }),
    
    // 添加AI Models模块
    AIModelsModule,
  ],
})
export class AppModule {}
```

### 步骤4: 添加API Keys

#### 方式1: 通过API (推荐用于生产环境)

启动应用后，使用管理员账号调用API:

```bash
# 1. 登录获取token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.data.token')

# 2. 添加OpenAI Key
curl -X POST http://localhost:3000/api/admin/ai-providers/1/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "OpenAI主Key",
    "apiKey": "sk-proj-YOUR-KEY-HERE",
    "priority": 100,
    "rateLimitRpm": 3500,
    "rateLimitTpm": 90000,
    "rateLimitRpd": 200000
  }'

# 3. 添加Claude Key
curl -X POST http://localhost:3000/api/admin/ai-providers/2/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "Claude主Key",
    "apiKey": "sk-ant-YOUR-KEY-HERE",
    "priority": 100,
    "rateLimitRpm": 4000,
    "rateLimitTpm": 80000,
    "rateLimitRpd": 200000
  }'

# 4. 添加DeepSeek Key
curl -X POST http://localhost:3000/api/admin/ai-providers/3/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "DeepSeek主Key",
    "apiKey": "sk-YOUR-KEY-HERE",
    "priority": 100,
    "rateLimitRpm": 100000,
    "rateLimitTpm": 100000,
    "rateLimitRpd": 1000000
  }'
```

#### 方式2: 直接插入数据库 (开发环境)

```sql
-- OpenAI (provider_id = 1)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, rate_limit_rpm, rate_limit_tpm, rate_limit_rpd)
VALUES (1, 'OpenAI主Key', 'sk-proj-YOUR-KEY-HERE', 100, 3500, 90000, 200000);

-- Claude (provider_id = 2)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, rate_limit_rpm, rate_limit_tpm, rate_limit_rpd)
VALUES (2, 'Claude主Key', 'sk-ant-YOUR-KEY-HERE', 100, 4000, 80000, 200000);

-- DeepSeek (provider_id = 3)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, rate_limit_rpm, rate_limit_tpm, rate_limit_rpd)
VALUES (3, 'DeepSeek主Key', 'sk-YOUR-KEY-HERE', 100, 100000, 100000, 1000000);
```

### 步骤5: 验证安装

```bash
# 1. 重启应用
npm run start:dev

# 2. 检查Provider列表
curl http://localhost:3000/api/admin/ai-providers \
  -H "Authorization: Bearer $TOKEN"

# 3. 验证API Key
curl -X POST http://localhost:3000/api/admin/ai-providers/keys/1/validate \
  -H "Authorization: Bearer $TOKEN"

# 4. 测试聊天接口
curl -X POST http://localhost:3000/api/ai/chat/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "providerCode": "deepseek",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "model": "deepseek-chat"
  }'
```

预期响应:
```json
{
  "code": 200,
  "data": {
    "id": "chatcmpl-...",
    "content": "你好！有什么我可以帮助你的吗？",
    "model": "deepseek-chat",
    "usage": {
      "promptTokens": 5,
      "completionTokens": 10,
      "totalTokens": 15
    }
  }
}
```

---

## 🔧 配置优化

### 速率限制配置

根据你的API tier调整限制:

| Provider | Tier | RPM | TPM | RPD |
|----------|------|-----|-----|-----|
| OpenAI | Tier 1 | 500 | 30K | - |
| OpenAI | Tier 2 | 3,500 | 90K | - |
| OpenAI | Tier 3 | 10,000 | 300K | - |
| Claude | Free | 5 | 4K | 50 |
| Claude | Pro | 1,000 | 100K | 10K |
| DeepSeek | All | Unlimited | Unlimited | Unlimited |

### 多Key配置示例

```sql
-- OpenAI: 主Key + 2个备用Key
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, ...) VALUES
(1, 'OpenAI主Key', 'sk-1', 100, ...),
(1, 'OpenAI备用Key1', 'sk-2', 90, ...),
(1, 'OpenAI备用Key2', 'sk-3', 80, ...);

-- Claude: 主Key + 1个备用
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, ...) VALUES
(2, 'Claude主Key', 'sk-ant-1', 100, ...),
(2, 'Claude备用Key', 'sk-ant-2', 90, ...);

-- DeepSeek: 单Key即可(无限制)
INSERT INTO t_ai_api_keys (provider_id, key_name, api_key, priority, ...) VALUES
(3, 'DeepSeek主Key', 'sk-1', 100, ...);
```

---

## 📊 监控设置

### 1. 启用定时统计任务

创建 `src/tasks/ai-stats.task.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AIUsageStatService } from '../modules/ai-models/services/ai-usage-stat.service';

@Injectable()
export class AIStatsTask {
  private readonly logger = new Logger(AIStatsTask.name);

  constructor(
    private readonly usageStatService: AIUsageStatService,
  ) {}

  // 每小时更新统计
  @Cron('0 * * * *')
  async updateHourlyStats() {
    this.logger.log('Updating AI usage statistics...');
    
    try {
      // 更新所有provider的统计
      // 实现逻辑...
      
      this.logger.log('Statistics updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update statistics: ${error.message}`);
    }
  }

  // 每天清理旧日志(保留90天)
  @Cron('0 2 * * *')
  async cleanOldLogs() {
    this.logger.log('Cleaning old logs...');
    
    try {
      const deleted = await this.logService.cleanOldLogs(90);
      this.logger.log(`Cleaned ${deleted} old logs`);
    } catch (error) {
      this.logger.error(`Failed to clean logs: ${error.message}`);
    }
  }
}
```

### 2. 配置告警

创建 `src/tasks/ai-monitor.task.ts`:

```typescript
@Injectable()
export class AIMonitorTask {
  // 每5分钟检查错误率
  @Cron('*/5 * * * *')
  async checkErrorRate() {
    const stats = await this.usageStatService.getAggregatedStats({
      startDate: new Date(Date.now() - 5 * 60 * 1000),
    });

    // 错误率超过5%告警
    if (stats.successRate < 0.95) {
      await this.sendAlert({
        level: 'warning',
        message: `AI error rate is high: ${((1 - stats.successRate) * 100).toFixed(2)}%`,
        stats,
      });
    }
  }

  // 每30分钟检查Key状态
  @Cron('*/30 * * * *')
  async checkKeyStatus() {
    const keys = await this.keyRepo.find({
      where: { isActive: true, status: Not('normal') },
    });

    if (keys.length > 0) {
      await this.sendAlert({
        level: 'warning',
        message: `${keys.length} API keys are in abnormal status`,
        keys: keys.map(k => ({ id: k.id, name: k.keyName, status: k.status })),
      });
    }
  }
}
```

---

## 🔒 安全建议

### 1. API Key加密

在生产环境中，应该加密存储API Keys:

```typescript
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY; // 32字节

function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(apiKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptApiKey(encryptedKey: string): string {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### 2. 访问控制

确保管理API只能被管理员访问:

```typescript
@Controller('api/admin/ai-providers')
@UseGuards(JwtAuthGuard, AdminGuard) // 添加AdminGuard
export class AIProviderController {
  // ...
}
```

### 3. 速率限制

为API添加全局速率限制:

```typescript
// main.ts
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100次请求
}));
```

---

## 🐛 常见问题

### Q1: 初始化脚本失败

**错误**: `Error: connect ECONNREFUSED`

**解决**:
1. 确认MySQL正在运行
2. 检查.env配置
3. 确认数据库已创建

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS music_platform;"
```

### Q2: API Key验证失败

**错误**: `Invalid API key`

**解决**:
1. 检查Key是否正确
2. 确认Provider的baseUrl正确
3. 测试Key是否有效:

```bash
# OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."

# Claude
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-..." \
  -H "anthropic-version: 2023-06-01"

# DeepSeek
curl https://api.deepseek.com/models \
  -H "Authorization: Bearer sk-..."
```

### Q3: 高错误率

**诊断**:
```sql
SELECT 
  provider_id,
  status,
  COUNT(*) as count,
  error_code
FROM t_ai_api_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY provider_id, status, error_code;
```

**常见原因**:
- 速率限制达到
- API Key无效或配额用完
- 网络问题
- baseUrl配置错误

---

## 📈 性能优化

### 1. 数据库索引

已在迁移SQL中创建，确认索引存在:

```sql
SHOW INDEX FROM t_ai_api_logs;
SHOW INDEX FROM t_ai_usage_stats;
```

### 2. 连接池配置

```typescript
// database.config.ts
TypeOrmModule.forRoot({
  // ...
  extra: {
    connectionLimit: 20, // 增加连接池大小
    queueLimit: 0,
  },
})
```

### 3. 缓存优化

```typescript
// 使用Redis缓存Provider和Model信息
@Injectable()
export class AIProviderService {
  async getProvider(id: number) {
    const cacheKey = `provider:${id}`;
    let provider = await this.cacheManager.get(cacheKey);
    
    if (!provider) {
      provider = await this.providerRepo.findOne({ where: { id } });
      await this.cacheManager.set(cacheKey, provider, 3600); // 缓存1小时
    }
    
    return provider;
  }
}
```

---

## ✅ 部署验证清单

部署完成后，逐项检查:

- [ ] 数据库表创建成功(5张表)
- [ ] Providers数据初始化完成(3个provider)
- [ ] Models数据初始化完成(11个model)
- [ ] 至少添加了1个API Key
- [ ] API Key验证通过
- [ ] 聊天接口测试成功
- [ ] 管理后台可访问
- [ ] 统计数据正常显示
- [ ] 日志正常记录

---

## 📞 技术支持

遇到问题?

1. 查看日志: `backend/logs/`
2. 检查数据库: `SELECT * FROM t_ai_api_logs ORDER BY created_at DESC LIMIT 10;`
3. 查看文档: `docs/devdoc/AI_MODELS_INTEGRATION_GUIDE.md`
4. 提交Issue

---

**部署完成! 🎉**

建议先在开发环境测试完整流程，确认无误后再部署到生产环境。
