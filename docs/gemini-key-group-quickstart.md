# Gemini KEY组管理 - 快速开始指南

## 🚀 快速启动

### 1. 运行数据库迁移

首先需要创建 Gemini KEY 组的数据库表：

```bash
# 连接到 MySQL 数据库
mysql -u your_username -p your_database

# 执行 migration 文件
source backend/src/database/migrations/16-create-gemini-key-groups-table.sql

# 或者直接执行
mysql -u your_username -p your_database < backend/src/database/migrations/16-create-gemini-key-groups-table.sql
```

### 2. 启动服务

```bash
# 在项目根目录
./start-local.sh
```

服务启动后：
- **后端 API**: http://localhost:3000
- **管理后台**: http://localhost:5173

### 3. 访问管理界面

1. 打开浏览器访问：http://localhost:5173
2. 登录管理后台
3. 进入 **设置 → AI配置管理** 页面
4. 向下滚动到 **"Gemini密钥组管理"** 部分

## 📝 创建第一个 KEY 组

### 步骤 1：点击"创建KEY组"

在 Gemini 密钥组管理区域，点击右上角的 **"创建KEY组"** 按钮。

### 步骤 2：填写基本信息

**组名称**（必填）：
```
示例：生产环境主KEY组
```

**轮询策略**（必填）：
- **顺序轮询**：每次请求依次使用下一个 KEY
- **故障切换**：使用当前 KEY 直到出错才切换

推荐新手选择：**故障切换**

### 步骤 3：添加 API 密钥

在 **"API密钥列表"** 文本框中，**每行输入一个** Gemini API 密钥：

```
AIzaSyABC123def456GHI789jkl...
AIzaSyDEF456ghi789JKL012mno...
AIzaSyGHI789jkl012MNO345pqr...
```

⚠️ **注意**：
- 至少需要 1 个密钥
- 每行一个密钥
- 不要有空格或其他字符

### 步骤 4：可选配置

**基础URL**（可选）：
- 默认使用 Google 官方 API 地址
- 如需使用代理，在此填写代理地址

**描述**（可选）：
```
用于生产环境的 AI 音乐生成功能
```

**是否启用**：
- ✅ 勾选以立即启用此 KEY 组

### 步骤 5：创建

点击 **"创建KEY组"** 按钮。

✅ 创建成功后，您将看到：
- KEY 组卡片显示在列表中
- 显示 KEY 总数、可用 KEY 数量
- 显示当前使用的 KEY
- 显示统计信息（请求数、成功率等）

## 🎯 使用 KEY 组

### 方式 1：通过后端 API 调用

```typescript
// 在您的代码中
import { AIClientManagerService } from '@modules/ai-models/services/ai-client-manager.service';

// 注入服务
constructor(
  private readonly aiClientManager: AIClientManagerService,
) {}

// 使用 KEY 组调用 Gemini
async generateMusic(prompt: string) {
  const keyGroupId = 1; // 您创建的 KEY 组 ID
  
  const response = await this.aiClientManager.createChatCompletionWithKeyGroup(
    keyGroupId,
    {
      messages: [
        { role: 'user', content: prompt }
      ],
      model: 'gemini-pro'
    },
    userId,
    ipAddress,
    userAgent
  );
  
  return response.content;
}
```

### 方式 2：查看 KEY 组 ID

在管理界面中，每个 KEY 组卡片都会显示其 ID，您需要在代码中使用这个 ID。

## 🔍 监控和管理

### 查看 KEY 状态

在 KEY 组卡片中，您可以看到每个 KEY 的：
- **状态**：active（正常）/ error（错误）/ exhausted（配额耗尽）
- **错误次数**：累计错误数
- **最后使用时间**：相对时间显示
- **当前标记**：显示当前正在使用的 KEY

### 编辑 KEY 组

1. 点击 KEY 组卡片右侧的 **铅笔图标**
2. 修改组名称、轮询策略等
3. **注意**：重新填写密钥列表会替换所有现有密钥

### 移除单个密钥

1. 在密钥列表中找到要移除的密钥
2. 点击右侧的 **删除图标**
3. 确认删除
4. **注意**：不能删除最后一个密钥

### 重置 KEY 组状态

如果所有 KEY 都出现错误，可以：
1. 点击 KEY 组右侧的 **刷新图标**
2. 确认重置
3. 所有 KEY 状态将重置为 `active`
4. 错误计数清零

### 删除 KEY 组

1. 点击 KEY 组右侧的 **删除图标**
2. 确认删除
3. **警告**：此操作不可撤销

## 💡 策略选择建议

### 使用"顺序轮询"的场景：
- ✅ 每个 KEY 的配额都很少（如免费层）
- ✅ 需要均匀使用所有 KEY
- ✅ 请求量很大，需要分散负载
- ✅ 想要充分利用所有 KEY 的配额

### 使用"故障切换"的场景：
- ✅ 主 KEY 配额充足
- ✅ 备用 KEY 用于容灾
- ✅ 不希望频繁切换 KEY
- ✅ 追求稳定性，只在出错时切换

## ⚠️ 常见问题

### Q: KEY 组创建后看不到真实的密钥？
**A**: 为了安全，密钥加密存储后只显示后 8 位（加密后的）。如需修改密钥，需要重新输入完整的密钥列表。

### Q: 所有 KEY 都显示 "exhausted" 怎么办？
**A**: 说明所有 KEY 的配额都用完了。您可以：
1. 等待配额重置（通常每天重置）
2. 添加新的 KEY 到组中
3. 创建新的 KEY 组

### Q: 顺序轮询时，如果某个 KEY 失效会怎样？
**A**: 系统仍会尝试使用该 KEY，但会记录错误。建议定期检查 KEY 状态，移除失效的 KEY。

### Q: 如何知道正在使用哪个 KEY？
**A**: KEY 组卡片的密钥列表中，当前使用的 KEY 会标记 **[当前]**。

### Q: 可以为不同的业务创建不同的 KEY 组吗？
**A**: 可以！您可以创建多个 KEY 组，每个组使用不同的策略和密钥集合。

## 🔐 安全建议

1. **定期轮换密钥**：建议每 1-3 个月更换 API 密钥
2. **最小权限原则**：为每个 KEY 设置合适的权限
3. **监控异常**：定期检查错误次数，及时发现问题
4. **备份配置**：记录 KEY 组的配置，便于恢复
5. **分离环境**：开发、测试、生产使用不同的 KEY 组

## 📊 监控指标说明

在 KEY 组卡片中显示的统计信息：

- **KEY总数**：组中包含的所有 KEY 数量
- **可用KEY**：状态为 `active` 的 KEY 数量
- **总请求数**：使用此 KEY 组的累计请求次数
- **成功率**：成功请求 / 总请求的百分比

## 🎓 最佳实践

### 推荐配置（生产环境）：

```
组名称: 生产环境 Gemini KEY组
轮询策略: 故障切换
KEY 数量: 3-5 个
描述: 用于生产环境 AI 功能，配额充足的主 KEY + 备用 KEY
```

### 推荐配置（开发/测试）：

```
组名称: 开发测试 KEY组
轮询策略: 顺序轮询
KEY 数量: 2-3 个
描述: 用于开发和测试，免费层 KEY 轮流使用
```

## 📚 更多信息

- 完整功能文档：`docs/gemini-key-group-feature.md`
- API 文档：http://localhost:3000/api/docs
- 技术实现细节：查看源代码注释

## 🆘 需要帮助？

如遇到问题，请检查：
1. ✅ 数据库 migration 是否已执行
2. ✅ 后端服务是否正常启动
3. ✅ Gemini API 密钥是否有效
4. ✅ 浏览器控制台是否有错误信息

---

**祝您使用愉快！🎉**
