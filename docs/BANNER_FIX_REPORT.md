# Banner管理功能修复报告

## 问题描述
管理后台无法正常使用Banner管理功能，包括：
1. 无法获取Banner列表（500错误）
2. 无法创建新的Banner
3. 图片上传后URL格式问题导致图片无法显示

## 错误信息
```
Unknown column 'User.unionid' in 'field list'
Unknown column 'User.nickname' in 'field list'
Unknown column 'User.email' in 'field list'
```

## 根因分析

### 1. 数据库表结构与实体定义不匹配
- TypeORM实体定义中包含的字段在数据库表中不存在
- 数据库表使用下划线命名（如`nick_name`），而实体使用驼峰命名（如`nickname`）

### 2. 认证系统问题
- 缺少管理员账号
- 缺少必要的认证字段（email、password）

### 3. 图片上传URL问题
- StorageService返回的是完整的localhost URL
- 导致前端在不同环境下无法正确访问图片

## 解决方案

### 1. 修复数据库表结构
**添加缺失的列：**
```sql
ALTER TABLE t_users ADD COLUMN unionid VARCHAR(255) NULL AFTER openid;
ALTER TABLE t_users ADD COLUMN email VARCHAR(100) NULL;
ALTER TABLE t_users ADD COLUMN password VARCHAR(255) NULL;
ALTER TABLE t_users ADD COLUMN is_active TINYINT(1) DEFAULT 1;
```

**创建虚拟列解决命名差异：**
```sql
ALTER TABLE t_users ADD COLUMN nickname VARCHAR(100) GENERATED ALWAYS AS (nick_name) VIRTUAL;
ALTER TABLE t_users ADD COLUMN avatar VARCHAR(500) GENERATED ALWAYS AS (avatar_url) VIRTUAL;
ALTER TABLE t_users ADD COLUMN credit INT UNSIGNED GENERATED ALWAYS AS (credit_balance) VIRTUAL;
```

### 2. 修复User实体定义
更新了`backend/src/modules/user/entities/user.entity.ts`：
- 添加了`unionid`字段定义
- 保持了与数据库列名的映射关系

### 3. 创建管理员账号
创建了默认管理员账号：
- 用户名：admin
- 密码：admin123
- 角色：admin

### 4. 修复图片上传URL
修改了`StorageService`的`upload`方法，返回相对路径而不是完整URL：
```typescript
// 之前
return `${this.baseUrl}/${subPath.replace(/\\/g, '/')}`;

// 之后
return `/uploads/${subPath.replace(/\\/g, '/')}`;
```

## 修复文件列表

### 后端文件
1. `/backend/src/modules/user/entities/user.entity.ts` - 添加unionid字段
2. `/backend/src/modules/auth/auth.service.ts` - 移除unionid参数
3. `/backend/src/modules/user/dto/create-user.dto.ts` - 移除unionid字段
4. `/backend/src/modules/file/storage.service.ts` - 修改URL返回格式

### 前端文件
1. `/admin/src/views/Content/components/BannerModal.vue` - 调整图片URL处理逻辑

### 数据库迁移脚本
1. `/backend/scripts/add-unionid-column.js` - 添加unionid列
2. `/backend/scripts/fix-all-user-columns.js` - 添加所有缺失列
3. `/backend/scripts/add-nickname-alias.js` - 创建虚拟列
4. `/backend/scripts/create-admin-user.js` - 创建管理员账号

## 验证结果
✅ 管理员登录功能正常
✅ Banner列表获取正常
✅ Banner创建功能正常
✅ 图片上传功能正常

## 后续建议

### 1. 数据库规范化
- 统一使用驼峰命名或下划线命名
- 避免使用虚拟列，直接在实体中使用`@Column({ name: 'actual_column_name' })`

### 2. 环境配置优化
- 将API基础URL配置到环境变量
- 使用相对路径处理静态资源

### 3. 迁移管理
- 建立规范的数据库迁移流程
- 使用TypeORM的迁移工具管理表结构变更

### 4. 监控和日志
- 添加更详细的错误日志
- 实现健康检查端点
- 添加数据库连接监控

## 总结
本次修复主要解决了数据库表结构与TypeORM实体定义不匹配的问题，通过添加缺失的数据库列、创建虚拟列、修复实体定义等方式，成功恢复了Banner管理功能的正常运行。同时优化了图片上传的URL处理逻辑，确保图片能在不同环境下正常显示。
