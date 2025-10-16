-- AI音乐平台 - 管理员系统数据库迁移 (增量版)
-- 只添加缺失的部分
-- 版本: 12
-- 日期: 2024-10-15

USE ai_music_platform;

-- 1. 创建管理员操作日志表（如果不存在）
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
  INDEX `idx_resource` (`resource`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作日志表';

-- 2. 检查并添加role字段到users表
SET @col_count = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' AND TABLE_NAME = 't_users' AND COLUMN_NAME = 'role');

SET @sql = IF(@col_count = 0, 
  'ALTER TABLE `t_users` ADD COLUMN `role` ENUM(''user'', ''admin'') DEFAULT ''user'' COMMENT ''角色'' AFTER `is_banned`', 
  'SELECT ''role字段已存在'' AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 检查并添加role索引
SET @idx_count = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'ai_music_platform' AND TABLE_NAME = 't_users' AND INDEX_NAME = 'idx_role');

SET @sql_idx = IF(@idx_count = 0,
  'ALTER TABLE `t_users` ADD INDEX `idx_role` (`role`)',
  'SELECT ''idx_role索引已存在'' AS message');

PREPARE stmt FROM @sql_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 更新现有管理员的role（安全更新）
UPDATE `t_users` SET `role` = 'admin' WHERE `is_admin` = 1 AND `role` != 'admin';

-- 5. 显示迁移结果
SELECT '============================================' AS '';
SELECT '管理员系统数据库迁移完成' AS 'STATUS';
SELECT '============================================' AS '';

SELECT 
  TABLE_NAME AS '表名',
  ENGINE AS '引擎',
  TABLE_ROWS AS '记录数',
  TABLE_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'ai_music_platform' 
  AND TABLE_NAME = 't_admin_logs';

SELECT COUNT(*) AS '管理员数量' FROM t_users WHERE role = 'admin';
