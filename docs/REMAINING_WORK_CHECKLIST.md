# 剩余工作清单

## 📊 整体完成度：50%

---

## ⏳ Phase 2: API路由重构 (50% 完成)

### ✅ 已完成模块 (3个)

| 模块 | 状态 | 完成度 |
|------|------|--------|
| Banner | ✅ 完成 | 100% |
| PromptTemplate | ✅ 完成 | 100% |
| HotRecommendation | ✅ 完成 | 100% |

---

### ❌ 未完成模块 (7个)

#### 1. User模块重构 🔴 高优先级

**当前状态**:
- ✅ 基础用户功能存在
- ❌ 未拆分用户端和管理端
- ❌ 缺少管理接口

**需要完成**:
```
backend/src/modules/user/
├── user.controller.ts              # 现有 - 需要调整为用户端
├── admin-user.controller.ts        # 需要新建 - 管理端
├── user.service.ts                 # 需要扩展
├── dto/
│   └── query-user.dto.ts          # 需要新建
└── user.module.ts                  # 需要更新
```

**需要的管理接口**:
- `GET /api/admin/users/list` - 用户列表（分页、搜索）
- `GET /api/admin/users/:id` - 用户详情
- `POST /api/admin/users/:id/ban` - 封禁用户
- `POST /api/admin/users/:id/unban` - 解封用户
- `PATCH /api/admin/users/:id/credits` - 调整积分
- `GET /api/admin/users/stats` - 用户统计

**预计时间**: 4-6小时

---

#### 2. Music模块路由调整 🟡 中优先级

**当前状态**:
- ✅ 核心功能完整
- ❌ 路由未按三层架构
- ❌ 缺少@Public装饰器

**需要完成**:
- 检查现有Controller路由
- 添加@Public到公开接口
- 创建admin-music.controller.ts（如果需要）
- 调整为 `/api/user/music/*` 或 `/api/public/music/*`

**预计时间**: 2-3小时

---

#### 3. Credit模块路由调整 🟡 中优先级

**当前状态**:
- ✅ 积分系统完整
- ❌ 路由未按三层架构

**需要完成**:
- 调整Controller路由到 `/api/user/credit`
- 创建admin-credit.controller.ts
- 管理接口：套餐管理、积分调整等

**预计时间**: 2小时

---

#### 4. Payment模块路由调整 🟡 中优先级

**当前状态**:
- ✅ 支付功能完整
- ❌ 路由未按三层架构

**需要完成**:
- 调整Controller路由到 `/api/user/payment`
- 创建admin-payment.controller.ts
- 管理接口：订单管理、退款等

**预计时间**: 2-3小时

---

#### 5. Auth模块路由检查 🟢 低优先级

**当前状态**:
- ✅ 认证功能完整
- ⚠️ 路由可能需要微调

**需要完成**:
- 检查路由是否符合 `/api/auth/*`
- 添加@Public装饰器（如果缺少）
- 检查管理员登录接口

**预计时间**: 1小时

---

#### 6. AI模块检查 🟢 低优先级

**当前状态**: 需要检查

**需要完成**:
- 检查AI/Gemini相关接口
- 确认路由结构
- 添加必要的权限控制

**预计时间**: 1-2小时

---

#### 7. File模块检查 🟢 低优先级

**当前状态**: 需要检查

**需要完成**:
- 检查文件上传接口
- 确认路由结构
- 添加权限控制

**预计时间**: 1小时

---

## ⏳ Phase 3: 管理接口开发 (0% 完成)

### 1. Statistics模块 🔴 高优先级

**需要创建**:
```
backend/src/modules/statistics/
├── statistics.module.ts
├── statistics.controller.ts
├── statistics.service.ts
└── dto/
    ├── date-range.dto.ts
    └── statistics-response.dto.ts
```

**需要实现的接口**:

#### 仪表板概览
```
GET /api/admin/statistics/dashboard

响应：
{
  users: {
    total: 1000,
    today: 10,
    active: 500
  },
  works: {
    total: 5000,
    today: 50,
    public: 2000
  },
  credits: {
    consumed: 10000,
    recharged: 15000,
    balance: 5000
  },
  revenue: {
    today: 100,
    week: 700,
    month: 3000
  }
}
```

#### 用户增长趋势
```
GET /api/admin/statistics/user-growth?startDate=2024-01-01&endDate=2024-01-31

响应：
{
  labels: ["2024-01-01", "2024-01-02", ...],
  values: [10, 15, 20, ...]
}
```

#### 内容统计分析
```
GET /api/admin/statistics/content-analytics?startDate=...&endDate=...

响应：
{
  byCategory: {...},
  byStatus: {...},
  trending: [...]
}
```

#### 收入趋势
```
GET /api/admin/statistics/revenue-trend?startDate=...&endDate=...

响应：
{
  labels: [...],
  values: [...]
}
```

**技术要点**:
- 需要编写复杂的SQL聚合查询
- 可能需要使用QueryBuilder
- 考虑缓存优化（Redis）
- 日期范围处理

**预计时间**: 2-3天

---

### 2. System模块 🟡 中优先级

**需要创建**:
```
backend/src/modules/system/
├── system.module.ts
├── system.controller.ts
├── system.service.ts
└── entities/
    └── system-config.entity.ts
```

**需要实现的接口**:

#### 系统配置管理
```
GET /api/admin/system/configs
PATCH /api/admin/system/configs/:key

配置项示例：
- default_credits: 新用户默认积分
- music_generation_cost: 音乐生成消耗积分
- lyrics_generation_cost: 歌词生成消耗积分
- checkin_credits: 签到奖励积分
- site_name: 站点名称
- site_logo: 站点Logo
- maintenance_mode: 维护模式
```

#### 操作日志查询
```
GET /api/admin/system/logs?page=1&pageSize=20&action=...&adminId=...

响应：使用已有的AuditService.findAll()
```

#### 系统健康检查
```
GET /api/admin/system/health

响应：
{
  database: "ok",
  redis: "ok",
  storage: "ok",
  api: "ok",
  uptime: 123456
}
```

**技术要点**:
- 需要创建system_configs表
- 配置项支持动态加载
- 健康检查需要连接各服务
- 可能需要缓存配置

**预计时间**: 1-2天

---

## ⏳ Phase 4: 前端对接与测试 (0% 完成)

### 1. 小程序API路径调整 🔴 高优先级

**当前状态**:
```javascript
// miniprogram/api/api.js
// 当前路由：/auth/wechat-login
// 需要改为：/api/auth/wechat-login
```

**需要完成**:
- 修改所有API调用添加 `/api` 前缀
- 区分 `/public` 和 `/user` 路由
- 测试所有小程序功能

**影响范围**:
- 约50+个接口调用
- 需要全面测试

**预计时间**: 1天

---

### 2. 管理后台API对接 🔴 高优先级

**当前状态**:
```typescript
// admin/src/api/index.ts
// 已定义完整的API接口
// 但后端接口未全部实现
```

**需要完成**:
- 等待后端Statistics和System模块完成
- 对接真实API
- 替换mock数据
- 测试所有管理后台页面

**影响范围**:
- Dashboard页面
- 用户管理页面
- 内容管理页面
- 数据分析页面
- 系统设置页面

**预计时间**: 1周

---

### 3. 认证和Token管理 🔴 高优先级

**需要完成**:

#### 创建管理员账号
```sql
-- 方式1：数据库直接创建
INSERT INTO t_users (openid, nick_name, role, is_admin) 
VALUES ('admin_account', '超级管理员', 'admin', 1);

-- 方式2：通过接口注册后提升权限
UPDATE t_users SET role = 'admin', is_admin = 1 WHERE id = 1;
```

#### 实现管理员登录接口
```typescript
// 可能需要新增
POST /api/auth/admin-login
Body: { username, password }

// 或使用微信登录后检查权限
POST /api/auth/wechat-login
Response: { token, role: 'admin' }
```

#### Token测试
```bash
# 获取管理员Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"..."}' | jq -r '.data.token')

# 测试管理接口
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/banner/list
```

**预计时间**: 2-3小时

---

### 4. 全面测试 🟡 中优先级

**功能测试清单**:

#### 小程序端
- [ ] 首页banner显示
- [ ] 热门推荐加载
- [ ] 提示词模板使用
- [ ] 音乐生成功能
- [ ] 歌词生成功能
- [ ] 个人中心信息
- [ ] 积分充值流程
- [ ] 作品管理功能

#### 管理后台
- [ ] 登录功能
- [ ] 仪表板数据
- [ ] Banner管理CRUD
- [ ] 提示词管理CRUD
- [ ] 推荐管理CRUD
- [ ] 用户管理功能
- [ ] 数据统计图表
- [ ] 操作日志查询
- [ ] 系统配置管理

**权限测试清单**:
- [ ] 普通用户无法访问管理接口
- [ ] 管理员可以访问所有管理接口
- [ ] Token过期正确处理
- [ ] 未登录重定向正确

**性能测试**:
- [ ] 列表接口响应 < 200ms
- [ ] 统计接口响应 < 500ms
- [ ] 并发100用户无异常

**安全测试**:
- [ ] SQL注入防护
- [ ] XSS攻击防护
- [ ] 敏感信息脱敏
- [ ] 审计日志完整

**预计时间**: 3-5天

---

## 📊 工作量估算

### 按优先级

| 优先级 | 模块 | 工作量 | 状态 |
|--------|------|--------|------|
| 🔴 高 | User模块重构 | 4-6小时 | 待开始 |
| 🔴 高 | Statistics模块 | 2-3天 | 待开始 |
| 🔴 高 | 小程序API调整 | 1天 | 待开始 |
| 🔴 高 | 管理后台对接 | 1周 | 待开始 |
| 🔴 高 | 认证Token管理 | 2-3小时 | 待开始 |
| 🟡 中 | Music路由调整 | 2-3小时 | 待开始 |
| 🟡 中 | Credit路由调整 | 2小时 | 待开始 |
| 🟡 中 | Payment路由调整 | 2-3小时 | 待开始 |
| 🟡 中 | System模块 | 1-2天 | 待开始 |
| 🟡 中 | 全面测试 | 3-5天 | 待开始 |
| 🟢 低 | Auth路由检查 | 1小时 | 待开始 |
| 🟢 低 | AI模块检查 | 1-2小时 | 待开始 |
| 🟢 低 | File模块检查 | 1小时 | 待开始 |

**总工作量**: 约 **3-4周**

---

### 按阶段

| 阶段 | 剩余工作 | 预计时间 |
|------|---------|---------|
| Phase 2 (API重构) | 7个模块 | 1-1.5周 |
| Phase 3 (管理接口) | 2个模块 | 1周 |
| Phase 4 (前端对接) | 测试+对接 | 1-1.5周 |

**总计**: 约 **3-4周**

---

## 🎯 推荐的开发顺序

### 第1周：完成核心模块重构

**Day 1-2: User模块重构** (最重要)
- 拆分用户端和管理端
- 实现用户管理接口
- 测试用户CRUD

**Day 3: Music/Credit/Payment路由调整**
- 统一调整为三层架构
- 添加必要的@Public装饰器
- 测试关键功能

**Day 4: Auth/AI/File模块检查**
- 检查并调整路由
- 补充权限控制
- 测试认证流程

**Day 5: 创建管理员账号和Token**
- 实现管理员登录
- 测试所有管理接口
- 修复发现的问题

---

### 第2周：Statistics和System模块

**Day 1-3: Statistics模块开发**
- 仪表板概览
- 用户增长趋势
- 内容统计分析
- 收入趋势

**Day 4-5: System模块开发**
- 系统配置管理
- 操作日志查询
- 健康检查

---

### 第3周：前端对接

**Day 1: 小程序API调整**
- 修改所有API路径
- 测试小程序功能

**Day 2-5: 管理后台对接**
- 对接Statistics接口
- 对接System接口
- 替换所有mock数据
- 测试所有页面

---

### 第4周：测试和优化

**Day 1-2: 功能测试**
- 小程序端全面测试
- 管理后台全面测试

**Day 3: 权限和安全测试**
- 权限控制测试
- 安全漏洞检查

**Day 4: 性能测试和优化**
- 接口性能测试
- 数据库查询优化
- 缓存策略调整

**Day 5: 文档和部署准备**
- 更新API文档
- 编写部署文档
- 准备上线

---

## 💡 快速启动建议

### 如果时间有限，优先完成：

1. **User模块重构** (必须)
   - 管理后台的用户管理是核心功能

2. **Statistics模块** (必须)
   - 仪表板是管理后台的门面
   - 先实现基础统计，复杂的可以后续优化

3. **认证和Token** (必须)
   - 没有这个无法测试管理接口

4. **管理后台对接** (必须)
   - 让管理后台真正可用

5. **其他模块** (可选)
   - Music/Credit/Payment路由调整可以暂缓
   - System模块可以简化实现
   - 全面测试可以分阶段进行

---

## 🔍 详细核查清单

### 需要逐一检查的模块

运行以下命令检查每个模块的Controller：

```bash
cd backend/src/modules

# 检查所有Controller的路由
grep -r "@Controller" . | grep -v node_modules

# 检查@Public装饰器的使用
grep -r "@Public()" . | grep -v node_modules

# 检查@UseGuards的使用
grep -r "@UseGuards" . | grep -v node_modules
```

---

## 📝 总结

### 已完成 (50%)
- ✅ 权限系统 (100%)
- ✅ 数据库迁移 (100%)
- ✅ Banner模块 (100%)
- ✅ PromptTemplate模块 (100%)
- ✅ HotRecommendation模块 (100%)
- ✅ 测试脚本 (100%)
- ✅ API文档 (100%)

### 待完成 (50%)
- ❌ User模块重构
- ❌ Music/Credit/Payment路由调整
- ❌ Auth/AI/File模块检查
- ❌ Statistics模块
- ❌ System模块
- ❌ 小程序API调整
- ❌ 管理后台对接
- ❌ 认证Token管理
- ❌ 全面测试

### 预计完成时间
**保守估计**: 3-4周  
**理想情况**: 2-3周（如果每天投入6-8小时）

---

**下一步建议**: 从User模块重构开始 💪
