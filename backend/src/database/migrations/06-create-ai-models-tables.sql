-- =====================================================
-- AI模型管理系统 - 数据库迁移脚本
-- 版本: v1.0
-- 创建时间: 2024
-- 支持: OpenAI, Claude, DeepSeek, Gemini
-- =====================================================

-- 1. AI供应商表
CREATE TABLE IF NOT EXISTS `t_ai_providers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
  `provider_code` VARCHAR(50) NOT NULL COMMENT '供应商代码(openai, claude, deepseek, gemini)',
  `provider_name` VARCHAR(100) NOT NULL COMMENT '供应商名称',
  `base_url` VARCHAR(200) NOT NULL COMMENT '默认API基础URL',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `description` TEXT COMMENT '描述',
  `config_json` JSON COMMENT '额外配置(JSON格式)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_code` (`provider_code`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI供应商配置表';

-- 2. AI模型表
CREATE TABLE IF NOT EXISTS `t_ai_models` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '模型ID',
  `provider_id` INT UNSIGNED NOT NULL COMMENT '供应商ID',
  `model_code` VARCHAR(100) NOT NULL COMMENT '模型代码',
  `model_name` VARCHAR(100) NOT NULL COMMENT '模型显示名称',
  `model_type` ENUM('chat', 'completion', 'embedding', 'image') NOT NULL DEFAULT 'chat' COMMENT '模型类型',
  `max_input_tokens` INT UNSIGNED COMMENT '最大输入Token数',
  `max_output_tokens` INT UNSIGNED COMMENT '最大输出Token数',
  `supports_streaming` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否支持流式输出',
  `supports_function_call` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否支持函数调用',
  `supports_vision` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否支持视觉',
  `cost_per_1k_prompt_tokens` DECIMAL(10, 6) COMMENT 'Prompt成本(每1K tokens)',
  `cost_per_1k_completion_tokens` DECIMAL(10, 6) COMMENT '完成成本(每1K tokens)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为默认模型',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `description` TEXT COMMENT '描述',
  `config_json` JSON COMMENT '额外配置(JSON格式)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_model` (`provider_id`, `model_code`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `fk_model_provider` FOREIGN KEY (`provider_id`) REFERENCES `t_ai_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- 3. AI API密钥表
CREATE TABLE IF NOT EXISTS `t_ai_api_keys` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '密钥ID',
  `provider_id` INT UNSIGNED NOT NULL COMMENT '供应商ID',
  `key_name` VARCHAR(100) NOT NULL COMMENT '密钥名称',
  `api_key` VARCHAR(500) NOT NULL COMMENT 'API密钥(加密存储)',
  `base_url` VARCHAR(200) COMMENT 'API基础URL(可覆盖供应商默认值)',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级(数字越大优先级越高)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `status` ENUM('normal', 'rate_limited', 'error', 'exhausted') NOT NULL DEFAULT 'normal' COMMENT '密钥状态',
  `rate_limit_rpm` INT UNSIGNED DEFAULT 60 COMMENT '每分钟请求数限制',
  `rate_limit_tpm` INT UNSIGNED DEFAULT 90000 COMMENT '每分钟Token数限制',
  `rate_limit_rpd` INT UNSIGNED DEFAULT 10000 COMMENT '每天请求数限制',
  `requests_count_today` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '今日请求次数',
  `tokens_count_today` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '今日Token使用量',
  `errors_count_today` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '今日错误次数',
  `requests_count_total` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总请求次数',
  `tokens_count_total` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总Token使用量',
  `last_used_at` TIMESTAMP NULL COMMENT '最后使用时间',
  `last_error_at` TIMESTAMP NULL COMMENT '最后错误时间',
  `last_error_msg` TEXT COMMENT '最后错误信息',
  `stats_reset_at` DATE COMMENT '统计重置日期',
  `config_json` JSON COMMENT '额外配置(JSON格式)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_priority` (`priority`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_key_provider` FOREIGN KEY (`provider_id`) REFERENCES `t_ai_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI API密钥管理表';

-- 4. AI API调用日志表
CREATE TABLE IF NOT EXISTS `t_ai_api_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `provider_id` INT UNSIGNED NOT NULL COMMENT '供应商ID',
  `model_id` INT UNSIGNED COMMENT '模型ID',
  `key_id` INT UNSIGNED NOT NULL COMMENT '使用的密钥ID',
  `user_id` INT UNSIGNED COMMENT '用户ID',
  `request_type` VARCHAR(50) NOT NULL COMMENT '请求类型(chat, completion, etc.)',
  `model_code` VARCHAR(100) NOT NULL COMMENT '使用的模型代码',
  `prompt_tokens` INT UNSIGNED DEFAULT 0 COMMENT 'Prompt Token数量',
  `completion_tokens` INT UNSIGNED DEFAULT 0 COMMENT '完成Token数量',
  `total_tokens` INT UNSIGNED DEFAULT 0 COMMENT '总Token数量',
  `request_payload` JSON COMMENT '请求参数(仅保存关键信息)',
  `response_summary` TEXT COMMENT '响应摘要',
  `error_code` VARCHAR(50) COMMENT '错误码',
  `error_message` TEXT COMMENT '错误信息',
  `latency_ms` INT UNSIGNED COMMENT '响应延迟(毫秒)',
  `status` ENUM('success', 'error', 'rate_limited', 'timeout') NOT NULL COMMENT '调用状态',
  `ip_address` VARCHAR(50) COMMENT '请求IP',
  `user_agent` VARCHAR(500) COMMENT 'User Agent',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_key_id` (`key_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_model_code` (`model_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI API调用日志表';

-- 5. AI使用统计表(按天汇总)
CREATE TABLE IF NOT EXISTS `t_ai_usage_stats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `provider_id` INT UNSIGNED NOT NULL COMMENT '供应商ID',
  `key_id` INT UNSIGNED NOT NULL COMMENT '密钥ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `total_requests` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总请求数',
  `success_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '成功次数',
  `error_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '错误次数',
  `rate_limited_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '限流次数',
  `total_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总Token数',
  `prompt_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Prompt Token总数',
  `completion_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '完成Token总数',
  `total_cost` DECIMAL(12, 6) NOT NULL DEFAULT 0 COMMENT '总成本(美元)',
  `avg_latency_ms` INT UNSIGNED COMMENT '平均延迟(毫秒)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_key_date` (`provider_id`, `key_id`, `stat_date`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入AI供应商
INSERT INTO `t_ai_providers` (`provider_code`, `provider_name`, `base_url`, `is_active`, `sort_order`, `description`) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', 1, 100, 'OpenAI官方API，支持GPT-4, GPT-3.5等模型'),
('claude', 'Anthropic Claude', 'https://api.anthropic.com/v1', 1, 90, 'Anthropic Claude AI，支持Claude 3系列模型'),
('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1', 1, 80, 'DeepSeek AI，高性价比的中文大模型'),
('gemini', 'Google Gemini', 'https://generativelanguage.googleapis.com', 1, 70, 'Google Gemini，强大的多模态AI模型')
ON DUPLICATE KEY UPDATE
  `provider_name` = VALUES(`provider_name`),
  `base_url` = VALUES(`base_url`),
  `description` = VALUES(`description`);

-- 插入OpenAI模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'gpt-4o', 
  'GPT-4o', 
  'chat', 
  128000, 
  4096, 
  1, 
  1, 
  1, 
  0.005, 
  0.015, 
  1, 
  1, 
  100,
  '最新的GPT-4o模型，支持视觉和函数调用'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'gpt-4o-mini', 
  'GPT-4o Mini', 
  'chat', 
  128000, 
  16384, 
  1, 
  1, 
  1, 
  0.00015, 
  0.0006, 
  1, 
  0, 
  90,
  '轻量级GPT-4o模型，性价比高'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'gpt-3.5-turbo', 
  'GPT-3.5 Turbo', 
  'chat', 
  16385, 
  4096, 
  1, 
  1, 
  0, 
  0.0005, 
  0.0015, 
  1, 
  0, 
  80,
  '经典的GPT-3.5模型，速度快'
FROM `t_ai_providers` p WHERE p.provider_code = 'openai'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

-- 插入Claude模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'claude-3-5-sonnet-20241022', 
  'Claude 3.5 Sonnet', 
  'chat', 
  200000, 
  8192, 
  1, 
  1, 
  1, 
  0.003, 
  0.015, 
  1, 
  1, 
  100,
  '最新的Claude 3.5 Sonnet，平衡性能和速度'
FROM `t_ai_providers` p WHERE p.provider_code = 'claude'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'claude-3-haiku-20240307', 
  'Claude 3 Haiku', 
  'chat', 
  200000, 
  4096, 
  1, 
  1, 
  1, 
  0.00025, 
  0.00125, 
  1, 
  0, 
  90,
  '速度最快的Claude模型，适合简单任务'
FROM `t_ai_providers` p WHERE p.provider_code = 'claude'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

-- 插入DeepSeek模型
INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'deepseek-chat', 
  'DeepSeek Chat', 
  'chat', 
  64000, 
  8192, 
  1, 
  1, 
  0, 
  0.00014, 
  0.00028, 
  1, 
  1, 
  100,
  'DeepSeek聊天模型，高性价比'
FROM `t_ai_providers` p WHERE p.provider_code = 'deepseek'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

INSERT INTO `t_ai_models` (`provider_id`, `model_code`, `model_name`, `model_type`, `max_input_tokens`, `max_output_tokens`, `supports_streaming`, `supports_function_call`, `supports_vision`, `cost_per_1k_prompt_tokens`, `cost_per_1k_completion_tokens`, `is_active`, `is_default`, `sort_order`, `description`) 
SELECT 
  p.id, 
  'deepseek-reasoner', 
  'DeepSeek Reasoner', 
  'chat', 
  64000, 
  8192, 
  1, 
  0, 
  0, 
  0.00055, 
  0.00219, 
  1, 
  0, 
  90,
  'DeepSeek推理模型，强大的思维链能力'
FROM `t_ai_providers` p WHERE p.provider_code = 'deepseek'
ON DUPLICATE KEY UPDATE `model_name` = VALUES(`model_name`);

-- =====================================================
-- 索引优化说明
-- =====================================================
-- 1. 日志表按日期分区(可选，数据量大时使用)
-- ALTER TABLE t_ai_api_logs PARTITION BY RANGE (TO_DAYS(created_at)) (...);

-- 2. 定期清理旧日志(建议保留90天)
-- DELETE FROM t_ai_api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- 3. 统计表建议每日凌晨通过定时任务汇总
