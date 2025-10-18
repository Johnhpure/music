-- SUNO配置管理表
-- 版本: v1.0
-- 创建时间: 2025年1月
-- 编码: UTF-8
-- 描述: 用于管理SUNO API配置，支持多配置切换
-- =====================================================

CREATE TABLE IF NOT EXISTS `suno_configs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `api_key` VARCHAR(500) NOT NULL COMMENT 'SUNO API密钥',
  `api_url` VARCHAR(255) NOT NULL DEFAULT 'https://api.sunoapi.org' COMMENT 'API接口地址',
  `is_active` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否激活（1=是，0=否）',
  `description` TEXT NULL COMMENT '配置描述',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO API配置表';
