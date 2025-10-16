-- =====================================================
-- SUNO API 补充任务表
-- 版本: v1.1
-- 创建时间: 2025
-- 编码: UTF-8
-- 描述: 补充SUNO API缺失的任务表（添加人声、添加伴奏、上传扩展、封面生成、API调用日志）
-- =====================================================

-- 1. SUNO添加人声任务表
CREATE TABLE IF NOT EXISTS `suno_add_vocals_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `upload_url` VARCHAR(500) NOT NULL COMMENT '上传的伴奏URL',
  `prompt` TEXT NOT NULL COMMENT '人声提示词',
  `title` VARCHAR(200) NOT NULL COMMENT '歌曲标题',
  `negative_tags` VARCHAR(500) NULL COMMENT '排除的音乐风格',
  `style` VARCHAR(200) NOT NULL COMMENT '音乐风格',
  `vocal_gender` ENUM('m', 'f') NULL COMMENT '人声性别',
  `style_weight` DECIMAL(3,2) NULL COMMENT '风格权重(0.00-1.00)',
  `weirdness_constraint` DECIMAL(3,2) NULL COMMENT '创意发散度(0.00-1.00)',
  `audio_weight` DECIMAL(3,2) NULL COMMENT '音频影响力权重(0.00-1.00)',
  `model` ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') DEFAULT 'V4_5PLUS' COMMENT '使用的模型',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `audio_url` VARCHAR(500) NULL COMMENT '生成的音频URL',
  `duration` FLOAT NULL COMMENT '音频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 20 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO添加人声任务表';

-- 2. SUNO添加伴奏任务表
CREATE TABLE IF NOT EXISTS `suno_add_instrumental_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `upload_url` VARCHAR(500) NOT NULL COMMENT '上传的人声URL',
  `title` VARCHAR(200) NOT NULL COMMENT '歌曲标题',
  `negative_tags` VARCHAR(500) NULL COMMENT '排除的音乐风格',
  `tags` VARCHAR(500) NOT NULL COMMENT '音乐标签',
  `vocal_gender` ENUM('m', 'f') NULL COMMENT '人声性别',
  `style_weight` DECIMAL(3,2) NULL COMMENT '风格权重(0.00-1.00)',
  `weirdness_constraint` DECIMAL(3,2) NULL COMMENT '创意发散度(0.00-1.00)',
  `audio_weight` DECIMAL(3,2) NULL COMMENT '音频影响力权重(0.00-1.00)',
  `model` ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') DEFAULT 'V4_5PLUS' COMMENT '使用的模型',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `audio_url` VARCHAR(500) NULL COMMENT '生成的音频URL',
  `duration` FLOAT NULL COMMENT '音频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 20 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO添加伴奏任务表';

-- 3. SUNO上传并扩展任务表
CREATE TABLE IF NOT EXISTS `suno_upload_extend_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `upload_url` VARCHAR(500) NOT NULL COMMENT '上传的音频URL',
  `default_param_flag` TINYINT(1) DEFAULT 1 COMMENT '是否使用默认参数',
  `instrumental` TINYINT(1) DEFAULT 0 COMMENT '是否纯伴奏',
  `prompt` TEXT NULL COMMENT '扩展提示词',
  `style` VARCHAR(200) NULL COMMENT '音乐风格',
  `title` VARCHAR(200) NULL COMMENT '歌曲标题',
  `continue_at` INT NULL COMMENT '从第几秒开始扩展',
  `negative_tags` VARCHAR(500) NULL COMMENT '排除的音乐风格',
  `vocal_gender` ENUM('m', 'f') NULL COMMENT '人声性别',
  `style_weight` DECIMAL(3,2) NULL COMMENT '风格权重(0.00-1.00)',
  `weirdness_constraint` DECIMAL(3,2) NULL COMMENT '创意发散度(0.00-1.00)',
  `audio_weight` DECIMAL(3,2) NULL COMMENT '音频影响力权重(0.00-1.00)',
  `model` ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') NOT NULL COMMENT '使用的模型',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `audio_url` VARCHAR(500) NULL COMMENT '扩展后的音频URL',
  `duration` FLOAT NULL COMMENT '音频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 20 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO上传并扩展任务表';

-- 4. SUNO封面生成任务表（Cover Suno）
CREATE TABLE IF NOT EXISTS `suno_cover_suno_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `parent_task_id` VARCHAR(50) NOT NULL COMMENT '父任务ID（音乐生成任务ID）',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `cover_images` JSON NULL COMMENT '封面图片URL数组',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 10 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_parent_task` (`parent_task_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO封面生成任务表';

-- 5. SUNO API调用日志表（用于统计和监控）
CREATE TABLE IF NOT EXISTS `suno_api_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `task_type` ENUM('generate', 'extend', 'lyrics', 'vocal_separation', 'wav_conversion', 'music_video', 'cover', 'add_vocals', 'add_instrumental', 'upload_extend', 'cover_suno', 'boost_style', 'get_credits') NOT NULL COMMENT '任务类型',
  `task_id` VARCHAR(50) NULL COMMENT '任务ID',
  `api_endpoint` VARCHAR(200) NOT NULL COMMENT 'API端点',
  `request_params` JSON NULL COMMENT '请求参数',
  `response_data` JSON NULL COMMENT '响应数据',
  `status_code` INT NOT NULL COMMENT 'HTTP状态码',
  `success` TINYINT(1) NOT NULL COMMENT '是否成功',
  `credits_used` INT UNSIGNED DEFAULT 0 COMMENT '消耗的积分',
  `error_message` TEXT NULL COMMENT '错误信息',
  `response_time` INT UNSIGNED NULL COMMENT '响应时间(毫秒)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_task_type` (`task_type`),
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_success` (`success`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO API调用日志表';

-- 6. SUNO API统计汇总表（按天统计）
CREATE TABLE IF NOT EXISTS `suno_api_daily_stats` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `task_type` ENUM('generate', 'extend', 'lyrics', 'vocal_separation', 'wav_conversion', 'music_video', 'cover', 'add_vocals', 'add_instrumental', 'upload_extend', 'cover_suno', 'all') NOT NULL COMMENT '任务类型',
  `total_calls` INT UNSIGNED DEFAULT 0 COMMENT '总调用次数',
  `success_calls` INT UNSIGNED DEFAULT 0 COMMENT '成功次数',
  `failed_calls` INT UNSIGNED DEFAULT 0 COMMENT '失败次数',
  `total_credits_used` INT UNSIGNED DEFAULT 0 COMMENT '总消耗积分',
  `avg_response_time` INT UNSIGNED NULL COMMENT '平均响应时间(毫秒)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_date_type` (`stat_date`, `task_type`),
  INDEX `idx_stat_date` (`stat_date`),
  INDEX `idx_task_type` (`task_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO API每日统计表';

-- 7. SUNO用户统计表（按用户统计）
CREATE TABLE IF NOT EXISTS `suno_user_stats` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  `user_id` INT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
  `total_calls` INT UNSIGNED DEFAULT 0 COMMENT '总调用次数',
  `success_calls` INT UNSIGNED DEFAULT 0 COMMENT '成功次数',
  `failed_calls` INT UNSIGNED DEFAULT 0 COMMENT '失败次数',
  `total_credits_used` INT UNSIGNED DEFAULT 0 COMMENT '总消耗积分',
  `last_call_at` TIMESTAMP NULL COMMENT '最后调用时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_total_calls` (`total_calls`),
  INDEX `idx_last_call` (`last_call_at`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO用户统计表';