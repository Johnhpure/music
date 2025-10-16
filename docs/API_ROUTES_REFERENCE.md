# API路由参考文档

## 📋 三层路由架构

本项目采用三层路由架构，清晰区分不同权限级别的接口：

```
/api
├── /public          # 公开接口（无需认证）
├── /user            # 用户接口（需要用户认证）
└── /admin           # 管理接口（需要管理员权限）
```

---

## 🌐 公开接口 (Public APIs)

### 1. Banner - 轮播图

**基础路径**: `/api/public/banner`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 获取启用的Banner列表 | ✅ |

**示例**:
```bash
curl http://localhost:3000/api/public/banner/list
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "欢迎使用AI音乐创作",
      "imageUrl": "/static/img/banner/banner1.jpg",
      "linkUrl": "",
      "linkType": "none",
      "sortOrder": 1
    }
  ]
}
```

---

### 2. PromptTemplate - 提示词模板

**基础路径**: `/api/public/prompt-template`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 获取启用的模板列表 | ✅ |
| GET | `/categories` | 获取模板分类 | ✅ |
| POST | `/usage` | 记录模板使用 | ✅ |

**示例**:
```bash
# 获取所有模板
curl http://localhost:3000/api/public/prompt-template/list

# 按分类筛选
curl http://localhost:3000/api/public/prompt-template/list?category=风格

# 获取分类列表
curl http://localhost:3000/api/public/prompt-template/categories
```

---

### 3. HotRecommendation - 热门推荐

**基础路径**: `/api/public/hot-recommendation`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 获取热门推荐列表 | ✅ |
| GET | `/categories` | 获取推荐分类 | ✅ |
| GET | `/category/:id` | 按分类获取推荐 | ✅ |
| POST | `/play` | 记录播放统计 | ✅ |

**示例**:
```bash
# 获取所有推荐
curl http://localhost:3000/api/public/hot-recommendation/list

# 按分类筛选
curl http://localhost:3000/api/public/hot-recommendation/list?category=流行

# 获取分类列表
curl http://localhost:3000/api/public/hot-recommendation/categories
```

---

## 👤 用户接口 (User APIs)

### 4. Auth - 认证

**基础路径**: `/api/auth`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/wechat-login` | 微信小程序登录 | ✅ |
| POST | `/wechat-auth` | 微信授权登录 | ✅ |
| POST | `/logout` | 退出登录 | ✅ |
| POST | `/refresh` | 刷新Token | ✅ |

---

### 5. User - 用户

**基础路径**: `/api/user`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/profile` | 获取个人信息 | ✅ |
| PATCH | `/profile` | 更新个人信息 | ✅ |
| POST | `/checkin` | 每日签到 | ✅ |
| GET | `/stats` | 个人统计 | ✅ |

---

### 6. Music - 音乐生成

**基础路径**: `/api/user/music`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/generate` | 创建音乐生成任务 | ✅ |
| GET | `/:taskId/status` | 获取任务状态 | ✅ |
| GET | `/list` | 获取任务列表 | ✅ |

---

### 7. Credit - 积分

**基础路径**: `/api/user/credit`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/balance` | 获取积分余额 | ✅ |
| GET | `/logs` | 获取积分记录 | ✅ |
| GET | `/packages` | 获取积分套餐 | ✅ |

---

### 8. Payment - 支付

**基础路径**: `/api/user/payment`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/order` | 创建订单 | ✅ |
| POST | `/wechat-pay` | 微信支付 | ✅ |
| GET | `/order/:id` | 查询订单 | ✅ |
| GET | `/orders` | 订单列表 | ✅ |

---

## 🔐 管理接口 (Admin APIs)

### 9. Banner管理

**基础路径**: `/api/admin/banner`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 分页获取所有Banner | ✅ |
| GET | `/:id` | 获取Banner详情 | ✅ |
| POST | `/` | 创建Banner | ✅ |
| PATCH | `/:id` | 更新Banner | ✅ |
| DELETE | `/:id` | 软删除Banner | ✅ |
| POST | `/:id/restore` | 恢复已删除的Banner | ✅ |
| POST | `/:id/toggle` | 切换启用状态 | ✅ |
| POST | `/sort` | 批量更新排序 | ✅ |

**查询参数**:
```typescript
{
  page?: number;           // 页码，默认1
  pageSize?: number;       // 每页数量，默认20
  status?: 'active' | 'inactive';  // 状态筛选
  includeDeleted?: boolean;  // 是否包含已删除，默认false
  keyword?: string;        // 关键词搜索
}
```

**示例**:
```bash
# 获取列表（需要管理员Token）
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/banner/list?page=1&pageSize=10

# 创建Banner
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"新Banner","imageUrl":"http://...","linkUrl":"","linkType":"none","sortOrder":1}' \
  http://localhost:3000/api/admin/banner
```

---

### 10. PromptTemplate管理

**基础路径**: `/api/admin/prompt-template`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 分页获取所有模板 | ✅ |
| GET | `/:id` | 获取模板详情 | ✅ |
| POST | `/` | 创建模板 | ✅ |
| PATCH | `/:id` | 更新模板 | ✅ |
| DELETE | `/:id` | 软删除模板 | ✅ |
| POST | `/:id/restore` | 恢复已删除的模板 | ✅ |
| POST | `/:id/toggle` | 切换启用状态 | ✅ |

**查询参数**:
```typescript
{
  page?: number;
  pageSize?: number;
  category?: string;       // 分类筛选
  status?: 'active' | 'inactive';
  includeDeleted?: boolean;
  keyword?: string;        // 标题/内容搜索
  tag?: string;           // 标签筛选
}
```

---

### 11. HotRecommendation管理

**基础路径**: `/api/admin/hot-recommendation`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 分页获取所有推荐 | ✅ |
| GET | `/:id` | 获取推荐详情 | ✅ |
| POST | `/` | 创建推荐 | ✅ |
| PATCH | `/:id` | 更新推荐 | ✅ |
| DELETE | `/:id` | 软删除推荐 | ✅ |
| POST | `/:id/restore` | 恢复已删除的推荐 | ✅ |
| POST | `/:id/toggle` | 切换启用状态 | ✅ |

**查询参数**:
```typescript
{
  page?: number;
  pageSize?: number;
  category?: string;       // 分类筛选
  status?: 'active' | 'inactive';
  includeDeleted?: boolean;
  keyword?: string;        // 标题/艺术家搜索
}
```

---

### 12. User管理

**基础路径**: `/api/admin/users`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/list` | 用户列表 | ⏳ 待实现 |
| GET | `/:id` | 用户详情 | ⏳ 待实现 |
| POST | `/:id/ban` | 封禁用户 | ⏳ 待实现 |
| POST | `/:id/unban` | 解封用户 | ⏳ 待实现 |
| PATCH | `/:id/credits` | 调整用户积分 | ⏳ 待实现 |

---

### 13. Statistics - 数据统计

**基础路径**: `/api/admin/statistics`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/dashboard` | 仪表板概览 | ⏳ 待实现 |
| GET | `/user-growth` | 用户增长趋势 | ⏳ 待实现 |
| GET | `/content-analytics` | 内容统计分析 | ⏳ 待实现 |
| GET | `/revenue-trend` | 收入趋势 | ⏳ 待实现 |

---

### 14. System - 系统管理

**基础路径**: `/api/admin/system`

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| GET | `/configs` | 获取系统配置 | ⏳ 待实现 |
| PATCH | `/configs/:key` | 更新配置 | ⏳ 待实现 |
| GET | `/logs` | 获取操作日志 | ⏳ 待实现 |
| GET | `/health` | 系统健康检查 | ⏳ 待实现 |

---

## 🔑 认证说明

### 公开接口
- 无需认证
- 使用 `@Public()` 装饰器标记
- 直接访问

### 用户接口
- 需要JWT认证
- Header: `Authorization: Bearer {token}`
- Token通过微信登录获取

### 管理接口
- 需要JWT认证 + 管理员权限
- Header: `Authorization: Bearer {token}`
- 使用 `@UseGuards(JwtAuthGuard, AdminGuard)` 保护
- 所有操作自动记录到审计日志

---

## 📊 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2024-10-15T08:00:00.000Z"
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": "2024-10-15T08:00:00.000Z"
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误信息",
  "error": "ERROR_CODE",
  "timestamp": "2024-10-15T08:00:00.000Z",
  "path": "/api/...",
  "method": "GET"
}
```

---

## 🧪 测试工具

### 公开接口测试
```bash
cd backend
./test-api-integration.sh
```

### 管理接口测试
```bash
cd backend
export ADMIN_TOKEN="your_jwt_token"
./test-admin-api.sh
```

### 手动测试
```bash
# 公开接口
curl http://localhost:3000/api/public/banner/list

# 用户接口（需要token）
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/user/profile

# 管理接口（需要管理员token）
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/admin/banner/list
```

---

## 📝 开发指南

### 添加新的公开接口
1. Controller使用 `@Controller('public/resource')`
2. 方法添加 `@Public()` 装饰器
3. 无需Guards

### 添加新的用户接口
1. Controller使用 `@Controller('user/resource')`
2. 使用 `@UseGuards(JwtAuthGuard)`
3. 使用 `@CurrentUser()` 获取当前用户

### 添加新的管理接口
1. Controller使用 `@Controller('admin/resource')`
2. 使用 `@UseGuards(JwtAuthGuard, AdminGuard)`
3. 使用 `@CurrentUser()` 获取管理员
4. 关键操作记录审计日志:
```typescript
await this.auditService.log({
  adminId: user.id,
  action: 'RESOURCE_ACTION',
  resource: 'resource_name',
  resourceId: id.toString(),
  details: {...},
});
```

---

## 📚 相关文档

- [API接口清单](./api/API接口清单.md) - 详细的接口文档
- [API架构设计](./api/API架构设计方案.md) - 架构设计说明
- [实施进度](./IMPLEMENTATION_PROGRESS.md) - 开发进度跟踪
- [数据库迁移指南](./DATABASE_MIGRATION_GUIDE.md) - 数据库变更

---

**文档版本**: v1.0  
**最后更新**: 2024-10-15  
**维护者**: Factory AI Assistant
