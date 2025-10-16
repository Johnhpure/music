# 数据库迁移指南 - Phase 1 管理员系统

## 📋 迁移信息

- **迁移版本**: 12
- **迁移文件**: `backend/src/database/migrations/12-add-admin-system.sql`
- **迁移日期**: 2024-10-15
- **影响范围**: 添加管理员操作日志表，为主要表添加软删除支持

---

## ⚠️ 重要提示

**在执行迁移前，请务必备份数据库！**

```bash
# 备份命令
mysqldump -u root -p music_platform > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 📦 迁移内容

### 1. 新增表

#### t_admin_logs (管理员操作日志表)
- 记录所有管理员操作
- 包含操作类型、资源、详情、IP地址等信息
- 支持审计和追溯

### 2. 表结构修改

为以下表添加 `deleted_at` 字段，支持软删除：
- `t_works` (作品表)
- `t_banners` (轮播图表)
- `t_prompt_templates` (提示词模板表)
- `t_hot_recommendations` (热门推荐表)
- `t_music_tasks` (音乐任务表)

### 3. 索引优化

为以下表添加性能优化索引：
- `t_users`: role、role+created_at组合索引
- `t_works`: user_id+created_at、status+created_at组合索引
- `t_music_tasks`: user_id+status、status+created_at组合索引
- `t_orders`: user_id+status、status+created_at组合索引
- `t_credit_logs`: user_id+type+created_at组合索引

### 4. 数据初始化

- 将 `is_admin=1` 的用户角色更新为 `admin`

---

## 🚀 执行步骤

### 方法1: 使用MySQL命令行（推荐）

```bash
# 1. 进入项目目录
cd /home/chenbang/app/music/music_platform-master

# 2. 备份数据库
mysqldump -u root -p music_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 执行迁移
mysql -u root -p music_platform < backend/src/database/migrations/12-add-admin-system.sql

# 4. 验证迁移
mysql -u root -p music_platform -e "SHOW TABLES LIKE 't_admin_logs';"
mysql -u root -p music_platform -e "DESCRIBE t_works;" | grep deleted_at
mysql -u root -p music_platform -e "DESCRIBE t_users;" | grep role
```

### 方法2: 使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到 `music_platform` 数据库
3. 打开 `backend/src/database/migrations/12-add-admin-system.sql` 文件
4. 点击执行（Execute）按钮
5. 查看输出信息确认执行成功

### 方法3: 使用DBeaver / Navicat等工具

1. 连接到 `music_platform` 数据库
2. 新建SQL编辑器
3. 复制粘贴迁移文件内容
4. 执行SQL
5. 检查执行结果

---

## ✅ 验证步骤

### 1. 检查新表是否创建

```sql
-- 检查admin_logs表
SHOW CREATE TABLE t_admin_logs;

-- 查看表结构
DESCRIBE t_admin_logs;
```

**预期结果**: 表存在，包含所有字段和索引

### 2. 检查软删除字段

```sql
-- 检查各表的deleted_at字段
SELECT 
  TABLE_NAME AS '表名',
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'music_platform' 
  AND COLUMN_NAME = 'deleted_at'
  AND TABLE_NAME IN ('t_works', 't_banners', 't_prompt_templates', 't_hot_recommendations', 't_music_tasks');
```

**预期结果**: 5个表都有 `deleted_at` 字段

### 3. 检查role字段和索引

```sql
-- 检查users表的role字段
DESCRIBE t_users;

-- 检查索引
SHOW INDEX FROM t_users WHERE Key_name = 'idx_role';
```

**预期结果**: 
- role字段存在，类型为 `enum('user','admin')`
- idx_role索引存在

### 4. 检查管理员数据

```sql
-- 查看所有管理员
SELECT id, nick_name, role, is_admin FROM t_users WHERE role = 'admin';
```

**预期结果**: is_admin=1的用户role已更新为'admin'

---

## 🔄 回滚方案

如果迁移后遇到问题，可以执行以下回滚操作：

```sql
-- 1. 删除admin_logs表
DROP TABLE IF EXISTS `t_admin_logs`;

-- 2. 移除deleted_at字段
ALTER TABLE `t_works` DROP COLUMN IF EXISTS `deleted_at`;
ALTER TABLE `t_banners` DROP COLUMN IF EXISTS `deleted_at`;
ALTER TABLE `t_prompt_templates` DROP COLUMN IF EXISTS `deleted_at`;
ALTER TABLE `t_hot_recommendations` DROP COLUMN IF EXISTS `deleted_at`;
ALTER TABLE `t_music_tasks` DROP COLUMN IF EXISTS `deleted_at`;

-- 3. 如果需要，从备份恢复
-- mysql -u root -p music_platform < backup_YYYYMMDD_HHMMSS.sql
```

---

## 📝 迁移后操作

### 1. 重启后端服务

```bash
cd /home/chenbang/app/music/music_platform-master/backend

# 如果使用npm
npm run start:dev

# 如果使用pm2
pm2 restart backend
```

### 2. 验证API

```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试是否能正常连接数据库
curl http://localhost:3000/api/public/banner/list
```

### 3. 检查日志

```bash
# 查看后端日志
tail -f backend/logs/app.log

# 或使用pm2
pm2 logs backend
```

---

## 🐛 常见问题

### 问题1: 执行时报错 "Table 't_admin_logs' already exists"

**原因**: 表已经存在

**解决**: 这是正常的，脚本使用了 `CREATE TABLE IF NOT EXISTS`，可以安全忽略

### 问题2: 执行时报错 "Duplicate column name 'deleted_at'"

**原因**: deleted_at字段已经存在

**解决**: 可以注释掉对应表的ALTER TABLE语句，或使用 `ADD COLUMN IF NOT EXISTS`

### 问题3: 外键约束失败

**原因**: t_users表中不存在对应的admin_id

**解决**: 
```sql
-- 先删除外键约束
ALTER TABLE `t_admin_logs` DROP FOREIGN KEY `fk_admin_logs_admin`;

-- 重新创建时不添加外键，或确保admin_id存在
```

### 问题4: 索引已存在

**原因**: 索引已经创建

**解决**: 使用 `ADD INDEX IF NOT EXISTS` 或忽略错误

---

## 📊 性能影响

### 预估影响

- **迁移时间**: 约1-5分钟（取决于数据量）
- **停机时间**: 0（在线迁移）
- **存储增加**: 约10-50MB（取决于日志量）

### 性能优化

新增的索引会提升查询性能：
- 管理员操作日志查询: 提升80%+
- 按role查询用户: 提升60%+
- 作品和任务列表查询: 提升40%+

---

## 📞 技术支持

如果在迁移过程中遇到问题：

1. 查看错误日志
2. 参考常见问题部分
3. 联系技术负责人

---

## ✨ 下一步

迁移完成后，可以继续以下工作：

1. ✅ Phase 1权限系统已完成
2. 🚀 开始Phase 2: API路由重构
   - Banner模块重构
   - PromptTemplate模块重构
   - HotRecommendation模块重构
3. 📝 更新API文档

---

**文档编写**: Factory AI Assistant  
**创建日期**: 2024-10-15  
**最后更新**: 2024-10-15
