# 下次会话启动指南

## 📋 快速上下文

**项目**: AI音乐平台 - API统一架构实施  
**当前完成度**: 50%  
**上次会话**: 完成了Banner、PromptTemplate、HotRecommendation三个模块  
**测试状态**: 6/6 公开接口测试通过 ✅

---

## 🎯 本次会话任务：修复路由问题

### 任务概述
当前有15个Controller路由不符合三层架构规范，需要修复。

### 三层架构标准
```
/api
├── /public  (公开接口，无需认证，使用@Public装饰器)
├── /user    (用户接口，需要JWT认证)
└── /admin   (管理接口，需要JWT+Admin权限)
```

---

## 🔧 需要修复的Controller

### 第一批：移除多余的 `api/` 前缀（6个）

**问题**: main.ts已设置全局前缀`/api`，Controller不应再加`api/`

| 文件 | 当前路由 | 应改为 |
|------|---------|--------|
| `music/suno.controller.ts` | `@Controller('api/suno')` | `@Controller('user/suno')` |
| `ai-models/controllers/ai-chat.controller.ts` | `@Controller('api/ai/chat')` | `@Controller('user/ai/chat')` |
| `ai-models/controllers/ai-model.controller.ts` | `@Controller('api/admin/ai-models')` | `@Controller('admin/ai-models')` |
| `ai-models/controllers/ai-provider.controller.ts` | `@Controller('api/admin/ai-providers')` | `@Controller('admin/ai-providers')` |
| `ai-models/controllers/ai-stats.controller.ts` | `@Controller('api/admin/ai-stats')` | `@Controller('admin/ai-stats')` |
| `ai/gemini-admin.controller.ts` | `@Controller('api/admin/gemini')` | `@Controller('admin/gemini')` |

---

### 第二批：调整为 `user/` 路由（5个）

| 文件 | 当前路由 | 应改为 |
|------|---------|--------|
| `music/music.controller.ts` | `@Controller('music')` | `@Controller('user/music')` |
| `credit/credit.controller.ts` | `@Controller('credit')` | `@Controller('user/credit')` |
| `payment/payment.controller.ts` | `@Controller('payment')` | `@Controller('user/payment')` |
| `ai/ai.controller.ts` | `@Controller('ai')` | `@Controller('user/ai')` |
| `file/file.controller.ts` | `@Controller('files')` | `@Controller('user/files')` |

---

### 第三批：清理旧Controller（2个 - 可选）

| 文件 | 状态 | 建议 |
|------|------|------|
| `prompt-template/prompt-template.controller.ts` | 已有Public版本 | 删除或标记@Deprecated |
| `banner/banner.controller.ts` | 已有Public版本 | 删除或标记@Deprecated |

---

## 📝 修复步骤

### Step 1: 检查当前路由状态
```bash
cd backend/src/modules
grep -rn "@Controller" . | grep -v node_modules
```

### Step 2: 批量修复（按优先级）

#### 优先级1: 修复api前缀（6个文件）
```bash
# 1. music/suno.controller.ts
# 2. ai-models/controllers/ai-chat.controller.ts
# 3. ai-models/controllers/ai-model.controller.ts
# 4. ai-models/controllers/ai-provider.controller.ts
# 5. ai-models/controllers/ai-stats.controller.ts
# 6. ai/gemini-admin.controller.ts
```

#### 优先级2: 调整user路由（5个文件）
```bash
# 1. music/music.controller.ts
# 2. credit/credit.controller.ts
# 3. payment/payment.controller.ts
# 4. ai/ai.controller.ts
# 5. file/file.controller.ts
```

### Step 3: 添加必要的Guards

**用户接口需要**:
```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user/resource')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  // ...
}
```

**管理接口需要**:
```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin/resource')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminResourceController {
  // ...
}
```

### Step 4: 测试验证
```bash
# 等待服务自动重启（约10秒）
sleep 10

# 测试修改后的接口
curl http://localhost:3000/api/user/music/list
curl http://localhost:3000/api/user/credit/balance
```

---

## ✅ 验证清单

每修复一个Controller后检查：

- [ ] 路由符合三层架构（public/user/admin）
- [ ] 无多余的`api/`前缀
- [ ] 用户接口有`@UseGuards(JwtAuthGuard)`
- [ ] 管理接口有`@UseGuards(JwtAuthGuard, AdminGuard)`
- [ ] 服务能正常启动（无编译错误）
- [ ] 测试接口能正常访问

---

## 🎯 预期成果

修复完成后：
- ✅ 所有路由符合三层架构
- ✅ 路由清晰明了（/api/public/*, /api/user/*, /api/admin/*）
- ✅ 权限控制正确
- ✅ 为后续开发打下良好基础

---

## 📚 参考文档

- `docs/ROUTE_ISSUES_CHECKLIST.md` - 详细的路由问题清单
- `docs/REMAINING_WORK_CHECKLIST.md` - 完整的剩余工作
- `docs/API_ROUTES_REFERENCE.md` - API路由参考

---

## 💬 给新会话的提示词

您可以复制以下内容到新会话：

```
你好！我需要继续上次的API路由重构工作。

当前状态：
- 项目：AI音乐平台后端
- 位置：/home/chenbang/app/music/music_platform-master
- 完成度：50%
- 已完成：Banner、PromptTemplate、HotRecommendation三个模块

本次任务：修复路由问题
- 15个Controller路由不符合三层架构
- 需要移除多余的api/前缀（6个）
- 需要调整为user/路由（5个）
- 需要添加正确的Guards

详细说明请查看：docs/NEXT_SESSION_GUIDE.md 和 docs/ROUTE_ISSUES_CHECKLIST.md

请按照优先级开始修复，从移除api/前缀开始。
```

---

## ⏱️ 预计时间

- 第一批（api前缀）：1-1.5小时
- 第二批（user路由）：1-1.5小时
- 清理旧Controller：0.5小时
- 测试验证：0.5小时

**总计**：约3-4小时

---

## 🚀 下一步

修复路由后，建议继续：
1. User模块重构（4-6小时）
2. Statistics模块开发（2-3天）
3. 管理后台对接（1周）

---

**祝下次会话顺利！** 🎉

---

## 附录：快速命令参考

```bash
# 进入项目
cd /home/chenbang/app/music/music_platform-master/backend

# 检查所有Controller路由
grep -rn "@Controller" src/modules/ | grep -v node_modules

# 检查服务状态
ps aux | grep "node.*backend"

# 查看日志
tail -f /tmp/nest-server.log

# 测试接口
curl http://localhost:3000/api/public/banner/list

# 运行自动化测试
./test-api-integration.sh
```
