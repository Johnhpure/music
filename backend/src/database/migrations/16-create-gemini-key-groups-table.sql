-- 创建Gemini密钥组表
-- 支持多KEY轮询策略(顺序轮询和故障切换)

CREATE TABLE IF NOT EXISTS `t_gemini_key_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '密钥组ID',
  `group_name` VARCHAR(100) NOT NULL COMMENT '密钥组名称',
  `rotation_strategy` ENUM('sequential', 'failover') NOT NULL DEFAULT 'sequential' COMMENT '轮询策略: sequential=顺序轮询, failover=故障切换',
  `api_keys` JSON NOT NULL COMMENT 'API密钥数组，格式: [{key: string, status: string, errorCount: number, lastUsedAt: Date}]',
  `current_key_index` INT NOT NULL DEFAULT 0 COMMENT '当前使用的KEY索引（用于顺序轮询）',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `base_url` VARCHAR(200) NULL COMMENT 'API基础URL（可选）',
  `requests_count_total` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总请求次数',
  `success_count_total` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '成功请求次数',
  `error_count_total` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '错误请求次数',
  `description` TEXT NULL COMMENT '描述',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_rotation_strategy` (`rotation_strategy`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gemini密钥组表';

-- 添加初始数据说明
-- 用户可以通过管理界面创建KEY组
-- 每个KEY组包含多个API密钥，支持两种轮询策略：
-- 1. sequential（顺序轮询）：按顺序依次使用每个KEY，每次请求使用下一个KEY
-- 2. failover（故障切换）：使用当前KEY直到出现错误（如429、503等），然后自动切换到下一个KEY
