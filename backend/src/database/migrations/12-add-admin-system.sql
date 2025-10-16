-- ============================================
-- AI音乐平台 - 管理员系统数据库迁移
-- 版本: 12
-- 日期: 2024-10-15
-- 描述: 添加管理员操作日志表和软删除支持
-- ============================================

USE ai_music_platform;

-- ============================================
-- 1. 创建管理员操作日志表
-- ============================================

CREATE TABLE IF NOT EXISTS `t_admin_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `admin_id` INT UNSIGNED NOT NULL COMMENT '管理员ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `resource` VARCHAR(100) NOT NULL COMMENT '操作资源',
  `resource_id` VARCHAR(50) NULL COMMENT '资源ID',
  `details` JSON NULL COMMENT '操作详情',
  `ip_address` VARCHAR(50) NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT 'User Agent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_admin_created` (`admin_id`, `created_at` DESC),
  INDEX `idx_action` (`action`),
  INDEX `idx_resource` (`resource`, `resource_id`),
  INDEX `idx_created_at` (`created_at` DESC),
  CONSTRAINT `fk_admin_logs_admin` FOREIGN KEY (`admin_id`) 
    REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='管理员操作日志表';

-- ============================================
-- 2. 为主要表添加软删除支持
-- ============================================

-- 作品表
ALTER TABLE `t_works` 
ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL COMMENT '删除时间' AFTER `updated_at`,
ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- 轮播图表
ALTER TABLE `t_banners` 
ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL COMMENT '删除时间' AFTER `updated_at`,
ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- 提示词模板表
ALTER TABLE `t_prompt_templates` 
ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL COMMENT '删除时间' AFTER `updated_at`,
ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- 热门推荐表
ALTER TABLE `t_hot_recommendations` 
ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL COMMENT '删除时间' AFTER `updated_at`,
ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- 音乐任务表
ALTER TABLE `t_music_tasks` 
ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL COMMENT '删除时间' AFTER `completed_at`,
ADD INDEX IF NOT EXISTS `idx_deleted_at` (`deleted_at`);

-- ============================================
-- 3. 确保用户表有role字段
-- ============================================

-- 检查并添加role字段（如果不存在）
SET @dbname = DATABASE();
SET @tablename = 't_users';
SET @columnname = 'role';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色' AFTER `is_banned`")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加role索引（如果不存在）
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'idx_role')
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD INDEX `idx_role` (`role`)")
));
PREPARE addIndexIfNotExists FROM @preparedStatement2;
EXECUTE addIndexIfNotExists;
DEALLOCATE PREPARE addIndexIfNotExists;

-- ============================================
-- 4. 添加性能优化索引
-- ============================================

-- 用户表优化索引
ALTER TABLE `t_users` 
ADD INDEX IF NOT EXISTS `idx_role_created` (`role`, `created_at` DESC);

-- 作品表优化索引
ALTER TABLE `t_works` 
ADD INDEX IF NOT EXISTS `idx_user_created` (`user_id`, `created_at` DESC),
ADD INDEX IF NOT EXISTS `idx_status_created` (`status`, `created_at` DESC);

-- 音乐任务表优化索引
ALTER TABLE `t_music_tasks` 
ADD INDEX IF NOT EXISTS `idx_user_status` (`user_id`, `status`),
ADD INDEX IF NOT EXISTS `idx_status_created` (`status`, `created_at` DESC);

-- 订单表优化索引
ALTER TABLE `t_orders` 
ADD INDEX IF NOT EXISTS `idx_user_status` (`user_id`, `status`),
ADD INDEX IF NOT EXISTS `idx_status_created` (`status`, `created_at` DESC);

-- 积分记录表优化索引
ALTER TABLE `t_credit_logs` 
ADD INDEX IF NOT EXISTS `idx_user_type_created` (`user_id`, `type`, `created_at` DESC);

-- ============================================
-- 5. 初始化管理员账号（可选）
-- ============================================

-- 更新is_admin=1的用户为admin角色
UPDATE `t_users` 
SET `role` = 'admin' 
WHERE `is_admin` = 1 AND `role` != 'admin';

-- 如果没有管理员，创建一个默认管理员（可选，生产环境需要修改密码）
-- INSERT INTO `t_users` (`openid`, `nick_name`, `role`, `is_admin`, `credit_balance`) 
-- VALUES ('admin_default', '系统管理员', 'admin', 1, 0)
-- ON DUPLICATE KEY UPDATE `role` = 'admin', `is_admin` = 1;

-- ============================================
-- 迁移完成信息
-- ============================================

SELECT '============================================' AS '';
SELECT '管理员系统数据库迁移完成' AS 'STATUS';
SELECT '版本: 12' AS '';
SELECT '日期: 2024-10-15' AS '';
SELECT '============================================' AS '';

-- 显示创建的表
SELECT 
  TABLE_NAME AS '表名',
  TABLE_ROWS AS '记录数',
  ROUND(DATA_LENGTH/1024/1024, 2) AS '大小(MB)',
  TABLE_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 't_admin_logs';

-- 显示添加的字段
SELECT 
  TABLE_NAME AS '表名',
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  COLUMN_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND COLUMN_NAME IN ('deleted_at', 'role')
  AND TABLE_NAME IN ('t_works', 't_banners', 't_prompt_templates', 't_hot_recommendations', 't_music_tasks', 't_users')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
