-- AI Models System Complete Migration
-- 创建AI模型管理系统的完整数据库表结构

-- 1. AI供应商表
CREATE TABLE IF NOT EXISTS `t_ai_providers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '供应商ID',
  `provider_code` varchar(50) NOT NULL COMMENT '供应商代码',
  `provider_name` varchar(100) NOT NULL COMMENT '供应商名称',
  `base_url` varchar(200) NOT NULL COMMENT '默认API基础URL',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序权重',
  `description` text COMMENT '描述',
  `config_json` json DEFAULT NULL COMMENT '额外配置(JSON格式)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_code` (`provider_code`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI供应商表';

-- 2. AI API密钥表
CREATE TABLE IF NOT EXISTS `t_ai_api_keys` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '密钥ID',
  `provider_id` int unsigned NOT NULL COMMENT '供应商ID',
  `key_name` varchar(100) NOT NULL COMMENT '密钥名称',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥(加密存储)',
  `base_url` varchar(200) DEFAULT NULL COMMENT 'API基础URL(可覆盖供应商默认值)',
  `priority` int NOT NULL DEFAULT '0' COMMENT '优先级(数字越大优先级越高)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `status` enum('normal','rate_limited','error','exhausted') NOT NULL DEFAULT 'normal' COMMENT '密钥状态',
  `rate_limit_rpm` int unsigned NOT NULL DEFAULT '60' COMMENT '每分钟请求数限制',
  `rate_limit_tpm` int unsigned NOT NULL DEFAULT '90000' COMMENT '每分钟Token数限制',
  `rate_limit_rpd` int unsigned NOT NULL DEFAULT '10000' COMMENT '每天请求数限制',
  `requests_count_today` int unsigned NOT NULL DEFAULT '0' COMMENT '今日请求次数',
  `tokens_count_today` int unsigned NOT NULL DEFAULT '0' COMMENT '今日Token使用量',
  `errors_count_today` int unsigned NOT NULL DEFAULT '0' COMMENT '今日错误次数',
  `requests_count_total` bigint unsigned NOT NULL DEFAULT '0' COMMENT '总请求次数',
  `tokens_count_total` bigint unsigned NOT NULL DEFAULT '0' COMMENT '总Token使用量',
  `last_used_at` timestamp NULL DEFAULT NULL COMMENT '最后使用时间',
  `last_error_at` timestamp NULL DEFAULT NULL COMMENT '最后错误时间',
  `last_error_msg` text COMMENT '最后错误信息',
  `stats_reset_at` date DEFAULT NULL COMMENT '统计重置日期',
  `config_json` json DEFAULT NULL COMMENT '额外配置(JSON格式)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_last_used` (`last_used_at`),
  CONSTRAINT `fk_api_key_provider` FOREIGN KEY (`provider_id`) REFERENCES `t_ai_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI API密钥表';

-- 3. AI模型表
CREATE TABLE IF NOT EXISTS `t_ai_models` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '模型ID',
  `provider_id` int unsigned NOT NULL COMMENT '供应商ID',
  `model_code` varchar(100) NOT NULL COMMENT '模型代码',
  `model_name` varchar(100) NOT NULL COMMENT '模型显示名称',
  `model_type` enum('chat','completion','embedding','image') NOT NULL DEFAULT 'chat' COMMENT '模型类型',
  `max_input_tokens` int unsigned DEFAULT NULL COMMENT '最大输入Token数',
  `max_output_tokens` int unsigned DEFAULT NULL COMMENT '最大输出Token数',
  `supports_streaming` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否支持流式输出',
  `supports_function_call` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否支持函数调用',
  `supports_vision` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否支持视觉',
  `cost_per_1k_prompt_tokens` decimal(10,6) DEFAULT NULL COMMENT 'Prompt成本(每1K tokens)',
  `cost_per_1k_completion_tokens` decimal(10,6) DEFAULT NULL COMMENT '完成成本(每1K tokens)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为默认模型',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序权重',
  `description` text COMMENT '描述',
  `config_json` json DEFAULT NULL COMMENT '额外配置(JSON格式)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_model` (`provider_id`, `model_code`),
  KEY `idx_model_type` (`model_type`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_is_default` (`is_default`),
  CONSTRAINT `fk_model_provider` FOREIGN KEY (`provider_id`) REFERENCES `t_ai_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型表';

-- 4. AI API调用日志表
CREATE TABLE IF NOT EXISTS `t_ai_api_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `provider_id` int unsigned NOT NULL COMMENT '供应商ID',
  `model_id` int unsigned DEFAULT NULL COMMENT '模型ID',
  `key_id` int unsigned NOT NULL COMMENT '使用的密钥ID',
  `user_id` int unsigned DEFAULT NULL COMMENT '用户ID',
  `request_type` varchar(50) NOT NULL COMMENT '请求类型',
  `model_code` varchar(100) NOT NULL COMMENT '使用的模型代码',
  `prompt_tokens` int unsigned NOT NULL DEFAULT '0' COMMENT 'Prompt Token数量',
  `completion_tokens` int unsigned NOT NULL DEFAULT '0' COMMENT '完成Token数量',
  `total_tokens` int unsigned NOT NULL DEFAULT '0' COMMENT '总Token数量',
  `request_payload` json DEFAULT NULL COMMENT '请求参数(仅保存关键信息)',
  `response_summary` text COMMENT '响应摘要',
  `error_code` varchar(50) DEFAULT NULL COMMENT '错误码',
  `error_message` text COMMENT '错误信息',
  `latency_ms` int unsigned DEFAULT NULL COMMENT '响应延迟(毫秒)',
  `status` enum('success','error','rate_limited','timeout') NOT NULL COMMENT '调用状态',
  `ip_address` varchar(50) DEFAULT NULL COMMENT '请求IP',
  `user_agent` varchar(500) DEFAULT NULL COMMENT 'User Agent',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
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
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `provider_id` int unsigned NOT NULL COMMENT '供应商ID',
  `key_id` int unsigned NOT NULL COMMENT '密钥ID',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `total_requests` int unsigned NOT NULL DEFAULT '0' COMMENT '总请求数',
  `success_count` int unsigned NOT NULL DEFAULT '0' COMMENT '成功次数',
  `error_count` int unsigned NOT NULL DEFAULT '0' COMMENT '错误次数',
  `rate_limited_count` int unsigned NOT NULL DEFAULT '0' COMMENT '限流次数',
  `total_tokens` bigint unsigned NOT NULL DEFAULT '0' COMMENT '总Token数',
  `prompt_tokens` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'Prompt Token总数',
  `completion_tokens` bigint unsigned NOT NULL DEFAULT '0' COMMENT '完成Token总数',
  `total_cost` decimal(12,6) NOT NULL DEFAULT '0.000000' COMMENT '总成本(美元)',
  `avg_latency_ms` int unsigned DEFAULT NULL COMMENT '平均延迟(毫秒)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_key_date` (`provider_id`, `key_id`, `stat_date`),
  KEY `idx_stat_date` (`stat_date`),
  KEY `idx_provider_id` (`provider_id`),
  KEY `idx_key_id` (`key_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI使用统计表';
