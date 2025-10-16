# Gemini API 集成和管理系统

> **版本**: v1.0  
> **创建时间**: 2024年  
> **功能**: 完整实现Gemini API的集成、多密钥管理、使用统计和日志记录

---

## 📋 目录

- [1. 系统概述](#1-系统概述)
- [2. 核心功能](#2-核心功能)
- [3. 数据库设计](#3-数据库设计)
- [4. 快速开始](#4-快速开始)
- [5. API接口文档](#5-api接口文档)
- [6. 最佳实践](#6-最佳实践)

---

## 1. 系统概述

### 1.1 功能特性

✅ **多密钥轮询管理** - 支持配置多个Gemini API密钥，自动Round-Robin轮询使用  
✅ **智能限流控制** - 自动检测RPM、TPM、RPD限制，避免触发429错误  
✅ **Token精确计算** - 准确估算每次API调用的Token消耗量  
✅ **完整日志记录** - 记录每次API调用的详细信息，包括请求、响应、耗时等  
✅ **使用统计分析** - 按天汇总使用数据，支持趋势分析  
✅ **密钥状态管理** - 实时监控密钥状态，自动标记异常密钥  
✅ **定时任务重置** - 每日凌晨自动重置密钥统计数据  
✅ **管理后台API** - 提供完整的管理接口，支持密钥CRUD、统计查询等

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      应用层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AI Controller│  │ Admin API    │  │ Public API   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AIService    │→│ GeminiService│→│ KeyManager   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    数据持久层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ API Keys     │  │ API Logs     │  │ Usage Stats  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Google Gemini API                      │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 核心功能

### 2.1 多密钥轮询策略

系统采用**Round-Robin（轮询）**策略，自动在多个API密钥之间分配请求：

1. 按优先级排序密钥（priority字段越大，优先级越高）
2. 循环选择下一个密钥
3. 检查密钥可用性（是否启用、是否达到限制）
4. 如果不可用，跳过并选择下一个
5. 如果所有密钥都不可用，返回错误

### 2.2 智能限流检测

系统在使用密钥前会进行多重检查：

- ✅ **启用状态检查** - 是否被管理员禁用
- ✅ **每日限额检查** - 是否达到今日请求上限（RPD）
- ✅ **每分钟限额检查** - 最近1分钟的请求数是否达到上限（RPM）
- ✅ **Token限额检查** - 今日Token使用量是否达到上限（TPM * 1440）

### 2.3 Token计算方法

使用简单估算算法：**1 token ≈ 4 characters**

```typescript
private estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

**说明**：这是一个粗略估算，实际Token数量可能略有差异，但足够用于限流控制。

### 2.4 错误处理策略

当API调用失败时，系统会：

1. 记录详细的错误日志
2. 更新密钥的错误统计
3. 根据错误码更新密钥状态：
   - `429` → 标记为 `rate_limited`（限流）
   - 其他错误 → 标记为 `error`（错误）
4. 使用**Exponential Backoff**策略重试（由业务层实现）

---

## 3. 数据库设计

### 3.1 t_gemini_api_keys（API密钥表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 密钥ID |
| key_name | VARCHAR(100) | 密钥名称 |
| api_key | VARCHAR(500) | API密钥（加密存储） |
| base_url | VARCHAR(200) | API基础URL |
| priority | INT | 优先级 |
| is_active | TINYINT | 是否启用 |
| status | ENUM | 状态：normal/rate_limited/error/exhausted |
| rate_limit_rpm | INT | 每分钟请求限制 |
| rate_limit_tpm | INT | 每分钟Token限制 |
| rate_limit_rpd | INT | 每天请求限制 |
| requests_count_today | INT | 今日请求次数 |
| tokens_count_today | INT | 今日Token使用量 |
| requests_count_total | BIGINT | 总请求次数 |
| tokens_count_total | BIGINT | 总Token使用量 |

### 3.2 t_gemini_api_logs（API调用日志表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 日志ID |
| key_id | INT | 使用的密钥ID |
| user_id | INT | 用户ID |
| model_name | VARCHAR(100) | 模型名称 |
| request_type | VARCHAR(50) | 请求类型 |
| prompt_tokens | INT | Prompt Token数量 |
| completion_tokens | INT | 完成Token数量 |
| total_tokens | INT | 总Token数量 |
| latency_ms | INT | 响应延迟（毫秒） |
| status | ENUM | success/error/rate_limited |
| error_code | VARCHAR(50) | 错误码 |
| error_message | TEXT | 错误信息 |

### 3.3 t_gemini_models（模型配置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 模型ID |
| model_name | VARCHAR(100) | 模型名称 |
| display_name | VARCHAR(100) | 显示名称 |
| max_input_tokens | INT | 最大输入Token |
| max_output_tokens | INT | 最大输出Token |
| is_active | TINYINT | 是否启用 |
| cost_per_1k_prompt_tokens | DECIMAL | Prompt成本 |
| cost_per_1k_completion_tokens | DECIMAL | 完成成本 |

### 3.4 t_gemini_usage_stats（使用统计表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 统计ID |
| key_id | INT | 密钥ID |
| stat_date | DATE | 统计日期 |
| total_requests | INT | 总请求数 |
| success_count | INT | 成功次数 |
| error_count | INT | 错误次数 |
| total_tokens | BIGINT | 总Token数 |
| avg_latency_ms | INT | 平均延迟 |

---

## 4. 快速开始

### 4.1 初始化数据库

```bash
# 方法1：使用初始化脚本
cd backend
node scripts/init-gemini-tables.js

# 方法2：直接执行SQL
mysql -u root -p music_platform < backend/src/database/migrations/05-create-gemini-tables.sql
```

### 4.2 添加API密钥

```bash
# 使用cURL添加密钥
curl -X POST http://localhost:3000/api/admin/gemini/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "keyName": "主密钥",
    "apiKey": "AIzaSy...",
    "baseUrl": "https://generativelanguage.googleapis.com",
    "priority": 100,
    "rateLimitRpm": 15,
    "rateLimitTpm": 32000,
    "rateLimitRpd": 1500
  }'
```

### 4.3 测试密钥

```bash
# 测试密钥是否可用
curl -X POST http://localhost:3000/api/admin/gemini/keys/1/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4.4 开始使用

```bash
# 生成歌词
curl -X POST http://localhost:3000/api/ai/lyrics/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "theme": "夏日海滩",
    "style": "pop",
    "mood": "happy",
    "versionsCount": 2
  }'
```

---

## 5. API接口文档

### 5.1 管理后台API

#### 5.1.1 获取密钥列表

```http
GET /api/admin/gemini/keys
Authorization: Bearer {token}
```

**响应示例**：
```json
[
  {
    "id": 1,
    "keyName": "主密钥",
    "status": "normal",
    "isActive": true,
    "priority": 100,
    "requestsToday": 156,
    "tokensToday": 45000,
    "requestsTotal": 5420,
    "rateLimits": {
      "rpm": 15,
      "tpm": 32000,
      "rpd": 1500
    },
    "lastUsedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### 5.1.2 创建密钥

```http
POST /api/admin/gemini/keys
Content-Type: application/json
Authorization: Bearer {token}

{
  "keyName": "备用密钥",
  "apiKey": "AIzaSy...",
  "priority": 90,
  "rateLimitRpm": 15,
  "rateLimitTpm": 32000,
  "rateLimitRpd": 1500
}
```

#### 5.1.3 更新密钥

```http
PUT /api/admin/gemini/keys/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "isActive": true,
  "priority": 95
}
```

#### 5.1.4 删除密钥

```http
DELETE /api/admin/gemini/keys/:id
Authorization: Bearer {token}
```

#### 5.1.5 获取今日统计

```http
GET /api/admin/gemini/stats/today
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "code": 200,
  "data": {
    "overview": {
      "totalRequests": 342,
      "successCount": 338,
      "errorCount": 4,
      "totalTokens": 125600,
      "avgLatency": 1245
    },
    "keyStats": [
      {
        "id": 1,
        "keyName": "主密钥",
        "requestsCountToday": 156,
        "tokensCountToday": 45000
      }
    ]
  }
}
```

#### 5.1.6 获取趋势统计

```http
GET /api/admin/gemini/stats/trend
Authorization: Bearer {token}
```

#### 5.1.7 获取API调用日志

```http
GET /api/admin/gemini/logs?page=1&pageSize=20&keyId=1&status=success
Authorization: Bearer {token}
```

### 5.2 模型管理API

#### 5.2.1 获取模型列表

```http
GET /api/admin/gemini/models
Authorization: Bearer {token}
```

#### 5.2.2 获取可用模型

```http
GET /api/admin/gemini/models/available
Authorization: Bearer {token}
```

#### 5.2.3 更新模型配置

```http
PUT /api/admin/gemini/models/:id
Content-Type: application/json
Authorization: Bearer {token}

{
  "isActive": true,
  "isDefault": false,
  "sortOrder": 100
}
```

---

## 6. 最佳实践

### 6.1 密钥配置建议

1. **至少配置2个密钥**，避免单点故障
2. **设置合理的优先级**，优先使用高配额的密钥
3. **定期检查密钥状态**，及时发现和处理异常
4. **合理设置限流参数**，避免触发API限制

### 6.2 限流参数推荐

根据Gemini API官方文档，免费层建议配置：

```json
{
  "rateLimitRpm": 15,    // 每分钟15次请求
  "rateLimitTpm": 32000, // 每分钟32000 tokens
  "rateLimitRpd": 1500   // 每天1500次请求
}
```

付费层可根据实际配额调整。

### 6.3 监控和告警

建议监控以下指标：

- 密钥错误率 > 10%：检查密钥是否异常
- 限流次数过多：考虑增加密钥或升级配额
- 平均延迟 > 3秒：检查网络或API状态
- Token消耗速度：预测何时达到限额

### 6.4 成本优化

1. **使用合适的模型**：简单任务使用gemini-flash，复杂任务使用gemini-pro
2. **优化Prompt长度**：减少不必要的提示词
3. **缓存常用响应**：对于相同或相似的请求，可以缓存结果
4. **批量处理**：合并多个请求，减少API调用次数

### 6.5 安全建议

1. **加密存储API密钥**：在生产环境中应对密钥进行加密
2. **限制管理接口访问**：添加管理员角色验证
3. **定期轮换密钥**：定期更换API密钥，降低泄露风险
4. **审计日志**：记录所有管理操作，便于追溯

---

## 7. 故障排查

### 7.1 常见问题

**Q: 所有密钥都提示"已达到限制"**  
A: 检查是否为UTC时区问题，统计重置时间为每天0点（太平洋时间）

**Q: Token计算不准确**  
A: 当前使用简单估算（1 token ≈ 4 chars），实际可能有10-20%误差

**Q: 密钥状态一直是"error"**  
A: 手动重置密钥状态：POST /api/admin/gemini/keys/:id/reset-stats

**Q: 定时任务没有执行**  
A: 检查@nestjs/schedule是否正确安装和配置

### 7.2 日志查看

```bash
# 查看API调用日志
curl http://localhost:3000/api/admin/gemini/logs?status=error

# 查看密钥状态
curl http://localhost:3000/api/admin/gemini/keys
```

---

## 8. 更新日志

### v1.0 (2024-01-15)

✅ 首次发布  
✅ 实现多密钥轮询管理  
✅ 实现Token计算和限流控制  
✅ 实现完整的API调用日志  
✅ 实现使用统计和趋势分析  
✅ 实现定时任务自动重置  
✅ 提供完整的管理后台API

---

**文档维护**: 随项目更新持续维护  
**最后更新**: 2024年  
**反馈邮箱**: support@example.com
