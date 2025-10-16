-- 创建 t_admin_logs 表
-- 只创建管理员日志表，其他字段已存在

USE music_platform;

-- 创建管理员操作日志表
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

-- 验证表是否创建成功
SELECT 'Table t_admin_logs created successfully!' AS Status;