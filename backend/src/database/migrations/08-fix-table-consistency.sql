-- ================================================================
-- 修复数据库表结构一致性问题
-- 创建时间: 2024年
-- 说明: 使数据库表结构与Entity定义保持一致
-- ================================================================

-- 1. 修复用户表 - openid字段应该允许NULL
-- 原因: 支持非微信注册的用户(如手机号注册)
ALTER TABLE `t_users` 
MODIFY COLUMN `openid` VARCHAR(100) NULL COMMENT '微信openid(可选，支持非微信注册)';

-- 2. 修复音乐任务表 - lyrics字段应该允许NULL  
-- 原因: 纯音乐模式(instrumental: true)时歌词可为空
ALTER TABLE `t_music_tasks`
MODIFY COLUMN `lyrics` TEXT NULL COMMENT '歌词内容(纯音乐模式可为空)';

-- ================================================================
-- 以下是建议添加的索引优化(可选)
-- ================================================================

-- 3. 优化点数记录表 - 添加复合索引以提升查询性能
ALTER TABLE `t_credit_logs` 
ADD INDEX IF NOT EXISTS `idx_user_type_created` (`user_id`, `type`, `created_at` DESC);

-- 4. 优化音乐任务表 - 添加状态索引
ALTER TABLE `t_music_tasks` 
ADD INDEX IF NOT EXISTS `idx_status_created` (`status`, `created_at` DESC);

-- ================================================================
-- 执行完成
-- ================================================================
