-- ============================================
-- AI音乐平台 - 管理员系统数据库迁移
-- 版本: 12 (修复版)
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
  INDEX `idx_created_at` (`created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='管理员操作日志表';

-- ============================================
-- 2. 检查并添加deleted_at字段（软删除支持）
-- ============================================

-- 检查t_works表
SET @col_exists_works = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_works' 
  AND COLUMN_NAME = 'deleted_at'
);

SET @sql_works = IF(@col_exists_works = 0, 
  'ALTER TABLE `t_works` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT ''删除时间'' AFTER `updated_at`, ADD INDEX `idx_deleted_at` (`deleted_at`)', 
  'SELECT "t_works.deleted_at already exists" AS message'
);

PREPARE stmt FROM @sql_works;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查t_banners表
SET @col_exists_banners = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_banners' 
  AND COLUMN_NAME = 'deleted_at'
);

SET @sql_banners = IF(@col_exists_banners = 0, 
  'ALTER TABLE `t_banners` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT ''删除时间'' AFTER `updated_at`, ADD INDEX `idx_deleted_at` (`deleted_at`)', 
  'SELECT "t_banners.deleted_at already exists" AS message'
);

PREPARE stmt FROM @sql_banners;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查t_prompt_templates表
SET @col_exists_prompt = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_prompt_templates' 
  AND COLUMN_NAME = 'deleted_at'
);

SET @sql_prompt = IF(@col_exists_prompt = 0, 
  'ALTER TABLE `t_prompt_templates` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT ''删除时间'' AFTER `updated_at`, ADD INDEX `idx_deleted_at` (`deleted_at`)', 
  'SELECT "t_prompt_templates.deleted_at already exists" AS message'
);

PREPARE stmt FROM @sql_prompt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查t_hot_recommendations表
SET @col_exists_hot = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_hot_recommendations' 
  AND COLUMN_NAME = 'deleted_at'
);

SET @sql_hot = IF(@col_exists_hot = 0, 
  'ALTER TABLE `t_hot_recommendations` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT ''删除时间'' AFTER `updated_at`, ADD INDEX `idx_deleted_at` (`deleted_at`)', 
  'SELECT "t_hot_recommendations.deleted_at already exists" AS message'
);

PREPARE stmt FROM @sql_hot;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查t_music_tasks表
SET @col_exists_tasks = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_music_tasks' 
  AND COLUMN_NAME = 'deleted_at'
);

SET @sql_tasks = IF(@col_exists_tasks = 0, 
  'ALTER TABLE `t_music_tasks` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT ''删除时间'' AFTER `completed_at`, ADD INDEX `idx_deleted_at` (`deleted_at`)', 
  'SELECT "t_music_tasks.deleted_at already exists" AS message'
);

PREPARE stmt FROM @sql_tasks;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. 添加性能优化索引
-- ============================================

-- 为t_users表添加索引（如果不存在）
SET @idx_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_users' 
  AND INDEX_NAME = 'idx_role_created'
);

SET @sql_idx = IF(@idx_exists = 0,
  'ALTER TABLE `t_users` ADD INDEX `idx_role_created` (`role`, `created_at` DESC)',
  'SELECT "idx_role_created already exists" AS message'
);

PREPARE stmt FROM @sql_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. 初始化管理员角色数据
-- ============================================

-- 更新is_admin=1的用户为admin角色（如果role字段存在）
SET @col_exists_role = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_users' 
  AND COLUMN_NAME = 'role'
);

SET @sql_update_role = IF(@col_exists_role > 0,
  'UPDATE `t_users` SET `role` = ''admin'' WHERE `is_admin` = 1 AND `role` != ''admin''',
  'SELECT "role column does not exist yet" AS message'
);

PREPARE stmt FROM @sql_update_role;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 迁移完成信息
-- ============================================

SELECT '============================================' AS '';
SELECT '管理员系统数据库迁移完成' AS 'STATUS';
SELECT '版本: 12 (修复版)' AS '';
SELECT '日期: 2024-10-15' AS '';
SELECT '============================================' AS '';

-- 显示创建的表
SELECT 
  TABLE_NAME AS '表名',
  TABLE_ROWS AS '记录数',
  ROUND(DATA_LENGTH/1024/1024, 2) AS '大小(MB)',
  TABLE_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_admin_logs';

-- 显示添加的字段
SELECT 
  TABLE_NAME AS '表名',
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  COLUMN_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND COLUMN_NAME IN ('deleted_at', 'role')
  AND TABLE_NAME IN ('t_works', 't_banners', 't_prompt_templates', 't_hot_recommendations', 't_music_tasks', 't_users')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
