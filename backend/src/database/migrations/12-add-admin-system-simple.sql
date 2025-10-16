-- AI音乐平台 - 管理员系统数据库迁移 (简化版)
-- 版本: 12
-- 日期: 2024-10-15

USE ai_music_platform;

-- 1. 创建管理员操作日志表
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

-- 2. 添加deleted_at字段到各表
ALTER TABLE `t_works` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_banners` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_prompt_templates` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_hot_recommendations` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';
ALTER TABLE `t_music_tasks` ADD COLUMN `deleted_at` TIMESTAMP NULL COMMENT '删除时间';

-- 3. 为deleted_at字段添加索引
ALTER TABLE `t_works` ADD INDEX `idx_deleted_at` (`deleted_at`);
ALTER TABLE `t_banners` ADD INDEX `idx_deleted_at` (`deleted_at`);
ALTER TABLE `t_prompt_templates` ADD INDEX `idx_deleted_at` (`deleted_at`);
ALTER TABLE `t_hot_recommendations` ADD INDEX `idx_deleted_at` (`deleted_at`);
ALTER TABLE `t_music_tasks` ADD INDEX `idx_deleted_at` (`deleted_at`);

-- 4. 添加role字段到users表
ALTER TABLE `t_users` ADD COLUMN `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色' AFTER `is_banned`;

-- 5. 为role字段添加索引
ALTER TABLE `t_users` ADD INDEX `idx_role` (`role`);

-- 6. 更新现有管理员的role
UPDATE `t_users` SET `role` = 'admin' WHERE `is_admin` = 1;

-- 显示结果
SELECT '迁移完成！' AS 'Status';
SELECT COUNT(*) AS 'admin_logs表是否创建' FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'ai_music_platform' AND TABLE_NAME = 't_admin_logs';
