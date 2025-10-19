# Gemini KEY组管理功能说明

## 功能概述

Gemini KEY组管理功能允许用户创建和管理多个API密钥组，支持两种轮询策略，提高API调用的成功率和稳定性。

## 核心特性

### 1. KEY组管理
- 创建、编辑、删除KEY组
- 每个KEY组可包含多个Gemini API密钥
- 支持启用/禁用KEY组
- 支持自定义base URL

### 2. 两种轮询策略

#### 顺序轮询（Sequential）
**工作原理**：
- 按顺序依次使用KEY组中的每个API密钥
- 第一次请求使用KEY #1，第二次使用KEY #2，依此类推
- 循环使用，到达最后一个KEY后回到第一个
- 平均分配请求到所有KEY

**适用场景**：
- 所有KEY的配额较小，需要均匀分配负载
- 想要最大化利用所有KEY的配额
- 请求频率较高的场景

**示例**：
```
请求1 → KEY #1
请求2 → KEY #2
请求3 → KEY #3
请求4 → KEY #1  (循环)
请求5 → KEY #2
...
```

#### 故障切换（Failover）
**工作原理**：
- 使用当前KEY直到遇到错误
- 遇到429（速率限制）、503（服务不可用）等错误时自动切换到下一个KEY
- 切换后继续使用新KEY，直到再次遇到错误
- 始终使用可用的KEY

**适用场景**：
- KEY配额较大，单个KEY足以应对大部分请求
- 需要高可用性，当一个KEY失败时自动切换
- 不希望频繁切换KEY的场景

**示例**：
```
请求1-100 → KEY #1 (成功)
请求101 → KEY #1 (429错误)
请求102-200 → KEY #2 (自动切换，成功)
请求201 → KEY #2 (503错误)
请求202-300 → KEY #3 (自动切换，成功)
...
```

### 3. KEY状态管理
每个KEY在组内有三种状态：
- **active**: 正常可用
- **error**: 遇到错误（非配额问题）
- **exhausted**: 配额耗尽或速率限制

系统会自动追踪每个KEY的：
- 错误次数
- 最后使用时间
- 最后错误信息

### 4. 统计信息
KEY组提供以下统计数据：
- KEY总数
- 可用KEY数量
- 总请求次数
- 成功请求次数
- 错误请求次数
- 成功率

## 使用指南

### 1. 创建KEY组

**步骤**：
1. 进入AI配置管理页面
2. 找到"Gemini密钥组管理"部分
3. 点击"创建KEY组"按钮
4. 填写以下信息：
   - **组名称**：便于识别的名称
   - **轮询策略**：选择"顺序轮询"或"故障切换"
   - **API密钥列表**：每行输入一个Gemini API密钥
   - **基础URL**（可选）：自定义API地址
   - **描述**（可选）：备注信息
   - **是否启用**：勾选以启用此KEY组
5. 点击"创建KEY组"

**示例**：
```
组名称: 生产环境Gemini KEY组
轮询策略: 故障切换
API密钥列表:
AIzaSyABC123...
AIzaSyDEF456...
AIzaSyGHI789...
描述: 用于生产环境的Gemini API调用
```

### 2. 使用KEY组

**后端调用**：
```typescript
// 使用AI Client Manager服务
const response = await aiClientManagerService.createChatCompletionWithKeyGroup(
  keyGroupId,  // KEY组ID
  {
    messages: [
      { role: 'user', content: '你好' }
    ],
    model: 'gemini-pro'
  },
  userId,
  ipAddress,
  userAgent
);
```

### 3. 管理KEY组

#### 编辑KEY组
- 点击KEY组右侧的编辑按钮
- 修改组名称、轮询策略、描述等
- 注意：修改API密钥列表会替换所有现有密钥

#### 移除单个密钥
- 在密钥列表中点击对应密钥的删除按钮
- 确认后该密钥将从组中移除
- 注意：不能移除最后一个密钥

#### 重置KEY组状态
- 点击KEY组右侧的刷新按钮
- 重置所有KEY的状态为active
- 清除所有错误记录和计数

#### 删除KEY组
- 点击KEY组右侧的删除按钮
- 确认后整个KEY组及其配置将被删除
- 此操作不可撤销

### 4. 监控KEY组

KEY组界面实时显示：
- 当前使用的KEY（标记为"[当前]"）
- 每个KEY的状态（active/error/exhausted）
- 每个KEY的错误次数
- 每个KEY的最后使用时间
- KEY组的整体统计数据

## 最佳实践

### 1. KEY数量建议
- **顺序轮询**：3-10个KEY为宜，充分利用配额
- **故障切换**：2-5个KEY即可，确保高可用

### 2. 监控和维护
- 定期检查KEY组的成功率
- 及时移除失效的KEY
- 对于长期error状态的KEY，考虑重新验证或更换
- 当所有KEY都exhausted时，考虑增加新KEY

### 3. 策略选择
- 高并发场景 → 顺序轮询
- 高可用场景 → 故障切换
- 可以为不同业务创建不同策略的KEY组

### 4. 安全建议
- API密钥在数据库中加密存储
- 界面只显示密钥的后8位（加密后）
- 定期轮换API密钥
- 设置合理的密钥权限

## 技术实现

### 数据库表结构
```sql
CREATE TABLE t_gemini_key_groups (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  rotation_strategy ENUM('sequential', 'failover'),
  api_keys JSON NOT NULL,
  current_key_index INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  base_url VARCHAR(200),
  requests_count_total BIGINT UNSIGNED DEFAULT 0,
  success_count_total BIGINT UNSIGNED DEFAULT 0,
  error_count_total BIGINT UNSIGNED DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API接口

**创建KEY组**：
```
POST /api/ai/gemini-key-groups
Body: {
  groupName: string
  rotationStrategy: 'sequential' | 'failover'
  apiKeys: string[]
  baseUrl?: string
  description?: string
  isActive?: boolean
}
```

**获取所有KEY组**：
```
GET /api/ai/gemini-key-groups
```

**获取KEY组详情**：
```
GET /api/ai/gemini-key-groups/:id
```

**更新KEY组**：
```
PUT /api/ai/gemini-key-groups/:id
Body: 同创建接口（字段均可选）
```

**删除KEY组**：
```
DELETE /api/ai/gemini-key-groups/:id
```

**添加密钥**：
```
POST /api/ai/gemini-key-groups/:id/keys
Body: { apiKeys: string[] }
```

**移除密钥**：
```
DELETE /api/ai/gemini-key-groups/:id/keys/:keyIndex
```

**重置KEY组状态**：
```
POST /api/ai/gemini-key-groups/:id/reset
```

## 故障排查

### KEY组不工作
1. 检查KEY组是否启用（isActive = true）
2. 检查是否有可用的KEY（activeKeys > 0）
3. 查看KEY组的错误日志

### 所有KEY都失效
1. 验证每个KEY的有效性
2. 检查KEY的配额是否耗尽
3. 考虑添加新的KEY或等待配额重置

### 切换策略不符合预期
1. 顺序轮询：每次请求都应该切换到下一个KEY
2. 故障切换：只有在遇到错误时才会切换
3. 检查日志中的策略执行记录

## 更新日志

### v1.0 (2025-01)
- 初始版本发布
- 支持顺序轮询和故障切换两种策略
- 完整的KEY组管理功能
- 前端管理界面
- 统计和监控功能

## 相关文件

**后端**：
- `backend/src/modules/ai-models/entities/gemini-key-group.entity.ts`
- `backend/src/modules/ai-models/services/gemini-key-group.service.ts`
- `backend/src/modules/ai-models/clients/gemini-keygroup-client.ts`
- `backend/src/modules/ai-models/controllers/gemini-key-group.controller.ts`
- `backend/src/database/migrations/16-create-gemini-key-groups-table.sql`

**前端**：
- `admin/src/components/GeminiKeyGroupManager.vue`
- `admin/src/api/index.ts` (geminiKeyGroupAPI)

## 支持

如有问题或建议，请联系开发团队。
