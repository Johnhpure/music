-- Gemini API管理系统 - 数据库表
-- 创建时间: 2024
-- 编码: UTF-8
-- 排序规则: utf8mb4_unicode_ci

-- 1. Gemini API密钥表
CREATE TABLE IF NOT EXISTS `t_gemini_api_keys` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '密钥ID',
  `key_name` VARCHAR(100) NOT NULL COMMENT '密钥名称',
  `api_key` VARCHAR(500) NOT NULL COMMENT 'API密钥(加密存储)',
  `base_url` VARCHAR(200) DEFAULT 'https://generativelanguage.googleapis.com' COMMENT 'API基础URL',
  `priority` INT DEFAULT 0 COMMENT '优先级(数字越大优先级越高)',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `status` ENUM('normal', 'rate_limited', 'error', 'exhausted') DEFAULT 'normal' COMMENT '密钥状态',
  
  -- 速率限制配置
  `rate_limit_rpm` INT UNSIGNED DEFAULT 15 COMMENT '每分钟请求数限制',
  `rate_limit_tpm` INT UNSIGNED DEFAULT 32000 COMMENT '每分钟Token数限制',
  `rate_limit_rpd` INT UNSIGNED DEFAULT 1500 COMMENT '每天请求数限制',
  
  -- 使用统计
  `requests_count_today` INT UNSIGNED DEFAULT 0 COMMENT '今日请求次数',
  `tokens_count_today` INT UNSIGNED DEFAULT 0 COMMENT '今日Token使用量',
  `errors_count_today` INT UNSIGNED DEFAULT 0 COMMENT '今日错误次数',
  `requests_count_total` BIGINT UNSIGNED DEFAULT 0 COMMENT '总请求次数',
  `tokens_count_total` BIGINT UNSIGNED DEFAULT 0 COMMENT '总Token使用量',
  
  -- 时间记录
  `last_used_at` TIMESTAMP NULL COMMENT '最后使用时间',
  `last_error_at` TIMESTAMP NULL COMMENT '最后错误时间',
  `last_error_msg` TEXT NULL COMMENT '最后错误信息',
  `stats_reset_at` DATE NULL COMMENT '统计重置日期',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_is_active_priority` (`is_active`, `priority` DESC),
  INDEX `idx_status` (`status`),
  INDEX `idx_stats_reset` (`stats_reset_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gemini API密钥表';

-- 2. Gemini API调用日志表
CREATE TABLE IF NOT EXISTS `t_gemini_api_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `key_id` INT UNSIGNED NOT NULL COMMENT '使用的密钥ID',
  `user_id` INT UNSIGNED NULL COMMENT '用户ID',
  `model_name` VARCHAR(100) NOT NULL COMMENT '使用的模型名称',
  `request_type` VARCHAR(50) NOT NULL COMMENT '请求类型(generateContent/streamContent/etc)',
  
  -- Token统计
  `prompt_tokens` INT UNSIGNED DEFAULT 0 COMMENT 'Prompt Token数量',
  `completion_tokens` INT UNSIGNED DEFAULT 0 COMMENT '完成 Token数量',
  `total_tokens` INT UNSIGNED DEFAULT 0 COMMENT '总Token数量',
  
  -- 请求响应
  `request_payload` JSON NULL COMMENT '请求参数(仅保存关键信息)',
  `response_summary` TEXT NULL COMMENT '响应摘要',
  `error_code` VARCHAR(50) NULL COMMENT '错误码',
  `error_message` TEXT NULL COMMENT '错误信息',
  
  -- 性能指标
  `latency_ms` INT UNSIGNED NULL COMMENT '响应延迟(毫秒)',
  `status` ENUM('success', 'error', 'rate_limited') NOT NULL COMMENT '调用状态',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_key_id_created` (`key_id`, `created_at` DESC),
  INDEX `idx_user_id_created` (`user_id`, `created_at` DESC),
  INDEX `idx_status_created` (`status`, `created_at` DESC),
  INDEX `idx_model_created` (`model_name`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gemini API调用日志表';

-- 3. Gemini模型配置表
CREATE TABLE IF NOT EXISTS `t_gemini_models` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模型ID',
  `model_name` VARCHAR(100) NOT NULL UNIQUE COMMENT '模型名称(如: gemini-pro)',
  `display_name` VARCHAR(100) NOT NULL COMMENT '显示名称',
  `description` TEXT NULL COMMENT '模型描述',
  `version` VARCHAR(50) NULL COMMENT '版本',
  
  -- 模型能力
  `max_input_tokens` INT UNSIGNED DEFAULT 30720 COMMENT '最大输入Token数',
  `max_output_tokens` INT UNSIGNED DEFAULT 2048 COMMENT '最大输出Token数',
  `support_streaming` TINYINT(1) DEFAULT 1 COMMENT '是否支持流式输出',
  `support_vision` TINYINT(1) DEFAULT 0 COMMENT '是否支持图像输入',
  `support_audio` TINYINT(1) DEFAULT 0 COMMENT '是否支持音频输入',
  
  -- 使用配置
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否为默认模型',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  
  -- 成本配置(每1000 tokens)
  `cost_per_1k_prompt_tokens` DECIMAL(10,6) DEFAULT 0 COMMENT 'Prompt成本',
  `cost_per_1k_completion_tokens` DECIMAL(10,6) DEFAULT 0 COMMENT '完成成本',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX `idx_is_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gemini模型配置表';

-- 4. Gemini使用统计表(按天汇总)
CREATE TABLE IF NOT EXISTS `t_gemini_usage_stats` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  `key_id` INT UNSIGNED NOT NULL COMMENT '密钥ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `model_name` VARCHAR(100) NULL COMMENT '模型名称(NULL表示全部)',
  
  -- 请求统计
  `total_requests` INT UNSIGNED DEFAULT 0 COMMENT '总请求数',
  `success_count` INT UNSIGNED DEFAULT 0 COMMENT '成功次数',
  `error_count` INT UNSIGNED DEFAULT 0 COMMENT '错误次数',
  `rate_limited_count` INT UNSIGNED DEFAULT 0 COMMENT '限流次数',
  
  -- Token统计
  `total_prompt_tokens` BIGINT UNSIGNED DEFAULT 0 COMMENT '总Prompt Token',
  `total_completion_tokens` BIGINT UNSIGNED DEFAULT 0 COMMENT '总完成Token',
  `total_tokens` BIGINT UNSIGNED DEFAULT 0 COMMENT '总Token数',
  
  -- 性能统计
  `avg_latency_ms` INT UNSIGNED DEFAULT 0 COMMENT '平均延迟(毫秒)',
  `max_latency_ms` INT UNSIGNED DEFAULT 0 COMMENT '最大延迟(毫秒)',
  `min_latency_ms` INT UNSIGNED DEFAULT 0 COMMENT '最小延迟(毫秒)',
  
  -- 成本统计
  `estimated_cost` DECIMAL(10,4) DEFAULT 0 COMMENT '预估成本(USD)',
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE KEY `uk_key_date_model` (`key_id`, `stat_date`, `model_name`),
  INDEX `idx_stat_date` (`stat_date` DESC),
  INDEX `idx_key_date` (`key_id`, `stat_date` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gemini使用统计表';

-- 5. 插入默认的Gemini模型配置
INSERT INTO `t_gemini_models` (`model_name`, `display_name`, `description`, `max_input_tokens`, `max_output_tokens`, `support_streaming`, `support_vision`, `is_default`, `sort_order`) VALUES
('gemini-pro', 'Gemini Pro', 'Google最强大的文本生成模型', 30720, 2048, 1, 0, 1, 100),
('gemini-pro-vision', 'Gemini Pro Vision', '支持图像和文本输入的多模态模型', 12288, 4096, 1, 1, 0, 90),
('gemini-1.5-pro', 'Gemini 1.5 Pro', '更强大的长文本处理能力', 1048576, 8192, 1, 1, 0, 95),
('gemini-1.5-flash', 'Gemini 1.5 Flash', '更快速的响应，适合高频场景', 1048576, 8192, 1, 1, 0, 85),
('gemini-2.0-flash', 'Gemini 2.0 Flash', '最新一代快速模型', 1048576, 8192, 1, 1, 0, 80)
ON DUPLICATE KEY UPDATE 
  `display_name` = VALUES(`display_name`),
  `description` = VALUES(`description`),
  `max_input_tokens` = VALUES(`max_input_tokens`),
  `max_output_tokens` = VALUES(`max_output_tokens`);
