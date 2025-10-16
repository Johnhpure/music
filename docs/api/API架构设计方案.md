# AI音乐平台 - 统一API架构设计方案

## 📋 文档信息

- **项目名称**: AI音乐创作平台
- **文档版本**: v1.0
- **创建日期**: 2024-01-20
- **设计目标**: 构建统一的API架构，同时满足微信小程序和管理后台的需求

---

## 1. 项目背景分析

### 1.1 项目组成

本项目包含三个核心部分：

1. **微信小程序端** (`miniprogram/`)
   - 面向终端用户
   - 主要功能：音乐创作、浏览推荐、个人中心、积分购买
   - 使用微信登录认证
   
2. **后端API服务** (`backend/`)
   - 技术栈：NestJS + TypeORM + MySQL
   - 当前已实现核心业务模块
   - 需要扩展管理功能
   
3. **管理后台** (`admin/`)
   - 技术栈：Vue3 + TypeScript + Tailwind CSS
   - 面向管理员
   - 需要内容管理、用户管理、数据统计等功能

### 1.2 核心问题

目前面临的关键挑战：

1. **权限差异**: 小程序用户 vs 管理员权限需要明确区分
2. **接口差异**: 某些功能需要不同版本（如推荐列表：小程序只看启用的，管理后台要CRUD全部）
3. **数据格式**: 两端可能需要不同的数据字段和详细程度
4. **认证方式**: 需要统一又灵活的认证机制

---

## 2. 架构设计方案

### 2.1 API路由分层策略

采用**三层路由结构**，清晰区分不同权限级别：

```
/api
├── /public          # 公开接口（无需认证）
│   ├── /banner      # 轮播图
│   ├── /recommendation  # 推荐音乐
│   └── /prompt-template # 提示词模板
│
├── /user            # 用户接口（需要用户认证）
│   ├── /profile     # 个人信息
│   ├── /works       # 我的作品
│   ├── /music       # 音乐生成
│   ├── /lyrics      # 歌词生成
│   ├── /credit      # 积分管理
│   └── /order       # 订单管理
│
└── /admin           # 管理接口（需要管理员权限）
    ├── /users       # 用户管理
    ├── /content     # 内容管理
    │   ├── /banner
    │   ├── /prompt-template
    │   └── /recommendation
    ├── /statistics  # 数据统计
    └── /system      # 系统设置
```

### 2.2 权限控制设计

#### 2.2.1 角色定义

在用户表基础上扩展角色系统：

```typescript
enum UserRole {
  USER = 'user',       // 普通用户
  ADMIN = 'admin',     // 管理员
  SUPER_ADMIN = 'super_admin'  // 超级管理员（可选）
}
```

#### 2.2.2 Guard机制

```typescript
// 1. JwtAuthGuard - 验证用户身份（已存在）
@UseGuards(JwtAuthGuard)
export class UserController { ... }

// 2. AdminGuard - 验证管理员权限（新增）
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController { ... }

// 3. PublicGuard - 公开接口（不需要认证）
@Public()
export class PublicController { ... }
```

#### 2.2.3 装饰器设计

```typescript
// @Public() - 标记公开接口
export const Public = () => SetMetadata('isPublic', true);

// @Roles() - 标记所需角色
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// 使用示例
@Public()
@Get('/banner/list')
async getPublicBanners() { ... }

@Roles(UserRole.ADMIN)
@Post('/banner/create')
async createBanner() { ... }
```

### 2.3 模块化设计

#### 2.3.1 Controller分层

每个业务模块采用**三层Controller**架构：

```
banner.module.ts
├── public-banner.controller.ts      # 公开接口
├── user-banner.controller.ts        # 用户接口（可选）
├── admin-banner.controller.ts       # 管理接口
└── banner.service.ts                # 统一业务逻辑
```

**示例：Banner模块**

```typescript
// public-banner.controller.ts
@Controller('api/public/banner')
export class PublicBannerController {
  @Get('list')
  async getActiveBanners() {
    return this.bannerService.findActive();
  }
}

// admin-banner.controller.ts
@Controller('api/admin/banner')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminBannerController {
  @Get('list')
  async getAllBanners(@Query() query: QueryDto) {
    return this.bannerService.findAll(query);
  }
  
  @Post('create')
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }
  
  @Patch(':id')
  async updateBanner(@Param('id') id: number, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }
  
  @Delete(':id')
  async deleteBanner(@Param('id') id: number) {
    return this.bannerService.softDelete(id);
  }
}
```

#### 2.3.2 Service设计原则

Service层保持**单一职责**，根据调用来源返回不同数据：

```typescript
@Injectable()
export class BannerService {
  // 公开接口：只返回启用的banner
  async findActive(): Promise<Banner[]> {
    return this.bannerRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      select: ['id', 'title', 'imageUrl', 'linkUrl'] // 有限字段
    });
  }
  
  // 管理接口：返回所有banner及完整信息
  async findAll(query: QueryDto): Promise<PaginatedResult<Banner>> {
    const { page, pageSize, status } = query;
    return this.bannerRepository.findAndCount({
      where: status ? { isActive: status === 'active' } : {},
      order: { sortOrder: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
  }
  
  // 管理操作：软删除
  async softDelete(id: number): Promise<void> {
    await this.bannerRepository.update(id, { isDeleted: true });
  }
}
```

---

## 3. 数据库设计优化

### 3.1 用户表扩展

```sql
ALTER TABLE `t_users` 
ADD COLUMN `role` VARCHAR(20) DEFAULT 'user' COMMENT '角色：user/admin' AFTER `is_admin`,
ADD INDEX `idx_role` (`role`);
```

### 3.2 管理员操作日志表（新增）

```sql
CREATE TABLE IF NOT EXISTS `t_admin_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL COMMENT '管理员ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `resource` VARCHAR(100) NOT NULL COMMENT '操作资源',
  `resource_id` VARCHAR(50) NULL COMMENT '资源ID',
  `details` JSON NULL COMMENT '操作详情',
  `ip_address` VARCHAR(50) NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT 'User Agent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_created` (`admin_id`, `created_at` DESC),
  INDEX `idx_action` (`action`),
  INDEX `idx_resource` (`resource`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作日志表';
```

### 3.3 软删除支持

为主要业务表添加软删除标记：

```sql
-- 批量添加软删除字段
ALTER TABLE `t_works` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_banners` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_prompt_templates` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_hot_recommendations` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
```

---

## 4. 认证与授权

### 4.1 JWT Token设计

```typescript
interface JwtPayload {
  sub: number;        // 用户ID
  openid?: string;    // 微信openid
  role: UserRole;     // 角色
  iat: number;        // 签发时间
  exp: number;        // 过期时间
}
```

### 4.2 Token刷新机制

```typescript
// 双Token策略
{
  accessToken: string;   // 短期访问令牌（2小时）
  refreshToken: string;  // 长期刷新令牌（7天）
}

// 自动刷新流程
POST /api/auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

### 4.3 管理后台登录

支持两种登录方式：

1. **微信登录** + 管理员验证
   ```typescript
   POST /api/auth/wechat-login
   验证 → 检查is_admin → 返回带role的token
   ```

2. **独立账号登录**（推荐）
   ```typescript
   POST /api/auth/admin-login
   Body: { username: string, password: string }
   验证 → 返回管理员token
   ```

---

## 5. API响应格式统一

### 5.1 标准响应结构

```typescript
interface ApiResponse<T> {
  code: number;           // 状态码：200成功，其他失败
  message: string;        // 提示信息
  data: T;               // 业务数据
  timestamp: number;      // 时间戳
}

// 分页响应
interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  timestamp: number;
}
```

### 5.2 错误码规范

```typescript
enum ErrorCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500,
  
  // 业务错误码
  INSUFFICIENT_CREDITS = 1001,
  TASK_LIMIT_EXCEEDED = 1002,
  INVALID_WECHAT_CODE = 1003,
  // ...
}
```

---

## 6. 前端对接方案

### 6.1 小程序端

```javascript
// miniprogram/api/api.js

// 路径调整
const API_BASE = '/api';

export default {
  // 公开接口
  getPublicBanners() {
    return minRequest.get(`${API_BASE}/public/banner/list`);
  },
  
  // 用户接口（需要token）
  getUserProfile() {
    return minRequest.get(`${API_BASE}/user/profile`);
  },
  
  createMusicTask(params) {
    return minRequest.post(`${API_BASE}/user/music/generate`, params);
  }
};
```

### 6.2 管理后台

```typescript
// admin/src/api/index.ts

const ADMIN_API_BASE = '/api/admin';

export const adminApi = {
  // Banner管理
  banner: {
    list: (params?: QueryParams) => 
      http.get(`${ADMIN_API_BASE}/banner/list`, { params }),
    
    create: (data: CreateBannerDto) => 
      http.post(`${ADMIN_API_BASE}/banner/create`, data),
    
    update: (id: number, data: UpdateBannerDto) => 
      http.patch(`${ADMIN_API_BASE}/banner/${id}`, data),
    
    delete: (id: number) => 
      http.delete(`${ADMIN_API_BASE}/banner/${id}`),
  },
  
  // 用户管理
  users: {
    list: (params?: QueryParams) => 
      http.get(`${ADMIN_API_BASE}/users/list`, { params }),
    
    ban: (userId: number) => 
      http.post(`${ADMIN_API_BASE}/users/${userId}/ban`),
    
    unban: (userId: number) => 
      http.post(`${ADMIN_API_BASE}/users/${userId}/unban`),
  },
  
  // 数据统计
  statistics: {
    dashboard: () => 
      http.get(`${ADMIN_API_BASE}/statistics/dashboard`),
    
    users: (params: DateRangeParams) => 
      http.get(`${ADMIN_API_BASE}/statistics/users`, { params }),
  }
};
```

---

## 7. 安全设计

### 7.1 API限流

```typescript
// 不同接口不同限流策略
@Throttle(100, 60)  // 100次/分钟
@Get('/public/banner/list')

@Throttle(10, 60)   // 10次/分钟
@Post('/user/music/generate')

@Throttle(1000, 60) // 1000次/分钟（管理员）
@Get('/admin/statistics/dashboard')
```

### 7.2 敏感数据脱敏

```typescript
// 用户列表返回时脱敏
class UserListDto {
  id: number;
  nickName: string;
  phone: string;  // 只返回: "138****5678"
  creditBalance: number;
  // 不返回: openid
}
```

### 7.3 操作审计

```typescript
// 管理员敏感操作自动记录
@Post('/admin/users/:id/ban')
async banUser(@Param('id') id: number, @User() admin: User) {
  await this.userService.ban(id);
  await this.auditService.log({
    adminId: admin.id,
    action: 'USER_BAN',
    resource: 'user',
    resourceId: id.toString(),
  });
}
```

---

## 8. 性能优化

### 8.1 缓存策略

```typescript
// Redis缓存热点数据
@Cacheable('banner:active', 300) // 5分钟缓存
async findActiveBanners() { ... }

@Cacheable('prompt-templates', 600) // 10分钟缓存
async findActiveTemplates() { ... }

// 缓存失效
@CacheEvict('banner:*')
async updateBanner() { ... }
```

### 8.2 数据库优化

```sql
-- 添加必要索引
CREATE INDEX idx_works_user_created ON t_works(user_id, created_at DESC);
CREATE INDEX idx_orders_user_status ON t_orders(user_id, status);
CREATE INDEX idx_music_tasks_user_status ON t_music_tasks(user_id, status);
```

### 8.3 分页查询优化

```typescript
// 使用游标分页替代offset分页（大数据量）
class CursorPaginationDto {
  cursor?: string;  // 上一页最后一条记录的ID
  limit: number = 20;
}
```

---

## 9. 监控与日志

### 9.1 日志分级

```typescript
// 使用NestJS Logger
private readonly logger = new Logger(BannerService.name);

// INFO - 正常操作
this.logger.log(`User ${userId} created banner ${bannerId}`);

// WARN - 异常但不影响运行
this.logger.warn(`Banner ${id} not found in cache`);

// ERROR - 需要关注的错误
this.logger.error(`Failed to upload banner image`, error.stack);
```

### 9.2 性能监控

```typescript
// 使用拦截器记录慢查询
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > 1000) {
          this.logger.warn(`Slow API: ${duration}ms`);
        }
      })
    );
  }
}
```

---

## 10. 技术栈版本

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥18.0 | 后端运行环境 |
| NestJS | ^10.0 | 后端框架 |
| TypeORM | ^0.3 | ORM框架 |
| MySQL | ≥8.0 | 数据库 |
| Redis | ≥6.0 | 缓存 |
| Vue | ^3.4 | 管理后台框架 |
| TypeScript | ^5.3 | 类型系统 |

---

## 11. 总结

### 11.1 设计原则

1. **清晰分层**: 公开/用户/管理三层路由，权限明确
2. **单一职责**: 每个Controller专注一种角色
3. **复用优先**: Service层统一业务逻辑
4. **安全第一**: 完善的认证、授权、审计机制
5. **性能优化**: 缓存、索引、分页策略

### 11.2 优势

- ✅ **扩展性强**: 新增功能只需添加对应Controller
- ✅ **维护性好**: 路由清晰，代码模块化
- ✅ **安全可靠**: 多层权限验证，操作审计
- ✅ **性能优秀**: 缓存、索引、优化查询
- ✅ **兼容性好**: 保持现有小程序接口不变

### 11.3 下一步

请参考 **《开发实施计划.md》** 文档，了解具体实施步骤和时间安排。

---

**文档编写**: AI Assistant  
**审核状态**: 待审核  
**最后更新**: 2024-01-20
