-- =====================================================
-- SUNO API 任务表结构设计
-- 版本: v1.0
-- 创建时间: 2024
-- 编码: UTF-8
-- 描述: 支持SUNO API所有功能的数据库表结构
-- =====================================================

-- 1. SUNO音乐生成任务表（扩展现有表）
-- 注：music_tasks表已存在，这里添加额外字段支持
ALTER TABLE `music_tasks` 
  ADD COLUMN IF NOT EXISTS `custom_mode` TINYINT(1) DEFAULT 1 COMMENT '是否自定义模式',
  ADD COLUMN IF NOT EXISTS `negative_tags` VARCHAR(500) NULL COMMENT '排除的音乐风格',
  ADD COLUMN IF NOT EXISTS `vocal_gender` ENUM('m', 'f') NULL COMMENT '人声性别',
  ADD COLUMN IF NOT EXISTS `style_weight` DECIMAL(3,2) NULL COMMENT '风格权重(0.00-1.00)',
  ADD COLUMN IF NOT EXISTS `weirdness_constraint` DECIMAL(3,2) NULL COMMENT '创意发散度(0.00-1.00)',
  ADD COLUMN IF NOT EXISTS `audio_weight` DECIMAL(3,2) NULL COMMENT '音频影响力权重(0.00-1.00)',
  ADD COLUMN IF NOT EXISTS `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  ADD COLUMN IF NOT EXISTS `suno_clip_ids` JSON NULL COMMENT 'SUNO返回的音频片段ID列表',
  ADD COLUMN IF NOT EXISTS `source_audio_url` VARCHAR(500) NULL COMMENT '原始音频URL（用于扩展）',
  ADD COLUMN IF NOT EXISTS `stream_audio_url` VARCHAR(500) NULL COMMENT '流式音频URL',
  ADD COLUMN IF NOT EXISTS `source_stream_audio_url` VARCHAR(500) NULL COMMENT '原始流式音频URL',
  ADD COLUMN IF NOT EXISTS `source_image_url` VARCHAR(500) NULL COMMENT '原始封面URL',
  ADD COLUMN IF NOT EXISTS `tags` VARCHAR(500) NULL COMMENT '音乐标签';

-- 2. SUNO音乐扩展任务表
CREATE TABLE IF NOT EXISTS `suno_extend_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `original_music_task_id` BIGINT UNSIGNED NOT NULL COMMENT '原始音乐任务ID',
  `audio_id` VARCHAR(50) NOT NULL COMMENT 'SUNO音频ID',
  `continue_at` INT NULL COMMENT '从第几秒开始扩展',
  `prompt` TEXT NULL COMMENT '扩展提示词',
  `default_param_flag` TINYINT(1) DEFAULT 1 COMMENT '是否使用默认参数',
  `model` ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') NOT NULL COMMENT '使用的模型',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `audio_url` VARCHAR(500) NULL COMMENT '扩展后的音频URL',
  `duration` FLOAT NULL COMMENT '音频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 15 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_original_task` (`original_music_task_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`original_music_task_id`) REFERENCES `music_tasks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO音乐扩展任务表';

-- 3. SUNO歌词生成任务表
CREATE TABLE IF NOT EXISTS `suno_lyrics_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `prompt` TEXT NOT NULL COMMENT '创作主题/提示词',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `lyrics_text` TEXT NULL COMMENT '生成的歌词',
  `title` VARCHAR(200) NULL COMMENT '生成的标题',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 5 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO歌词生成任务表';

-- 4. SUNO人声分离任务表
CREATE TABLE IF NOT EXISTS `suno_vocal_separation_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `source_task_id` VARCHAR(50) NOT NULL COMMENT '源音乐任务ID',
  `audio_id` VARCHAR(50) NOT NULL COMMENT 'SUNO音频ID',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `instrumental_url` VARCHAR(500) NULL COMMENT '纯伴奏URL',
  `vocal_url` VARCHAR(500) NULL COMMENT '纯人声URL',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 10 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_source_task` (`source_task_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO人声分离任务表';

-- 5. SUNO WAV转换任务表
CREATE TABLE IF NOT EXISTS `suno_wav_conversion_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `source_task_id` VARCHAR(50) NOT NULL COMMENT '源音乐任务ID',
  `audio_id` VARCHAR(50) NOT NULL COMMENT 'SUNO音频ID',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `wav_url` VARCHAR(500) NULL COMMENT 'WAV格式音频URL',
  `file_size` BIGINT NULL COMMENT '文件大小(字节)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 5 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_source_task` (`source_task_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO WAV转换任务表';

-- 6. SUNO音乐视频任务表
CREATE TABLE IF NOT EXISTS `suno_music_video_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `source_task_id` VARCHAR(50) NOT NULL COMMENT '源音乐任务ID',
  `audio_id` VARCHAR(50) NOT NULL COMMENT 'SUNO音频ID',
  `author` VARCHAR(100) NULL COMMENT '作者名称',
  `domain_name` VARCHAR(100) NULL COMMENT '域名/品牌名',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `video_url` VARCHAR(500) NULL COMMENT '音乐视频URL',
  `thumbnail_url` VARCHAR(500) NULL COMMENT '视频缩略图URL',
  `duration` FLOAT NULL COMMENT '视频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 25 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_source_task` (`source_task_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO音乐视频任务表';

-- 7. SUNO翻唱任务表
CREATE TABLE IF NOT EXISTS `suno_cover_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT 'SUNO任务ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `upload_url` VARCHAR(500) NULL COMMENT '上传的音频URL',
  `local_file_path` VARCHAR(500) NULL COMMENT '本地文件路径',
  `custom_mode` TINYINT(1) DEFAULT 0 COMMENT '是否自定义模式',
  `prompt` TEXT NULL COMMENT '提示词',
  `style` VARCHAR(200) NULL COMMENT '风格',
  `title` VARCHAR(200) NULL COMMENT '标题',
  `model` ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') DEFAULT 'V4' COMMENT '使用的模型',
  `status` ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING' COMMENT '任务状态',
  `callback_url` VARCHAR(500) NULL COMMENT '回调URL',
  `result_data` JSON NULL COMMENT 'SUNO返回的结果数据',
  `cover_audio_url` VARCHAR(500) NULL COMMENT '翻唱后的音频URL',
  `cover_image_url` VARCHAR(500) NULL COMMENT '翻唱后的封面URL',
  `duration` FLOAT NULL COMMENT '音频时长(秒)',
  `error_message` TEXT NULL COMMENT '错误信息',
  `credit_cost` INT UNSIGNED DEFAULT 30 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO翻唱任务表';

-- 8. SUNO时间戳歌词表
CREATE TABLE IF NOT EXISTS `suno_timestamped_lyrics` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `music_task_id` BIGINT UNSIGNED NOT NULL COMMENT '音乐任务ID',
  `audio_id` VARCHAR(50) NOT NULL COMMENT 'SUNO音频ID',
  `lyrics_data` JSON NOT NULL COMMENT '带时间戳的歌词数据',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_music_task` (`music_task_id`),
  INDEX `idx_audio_id` (`audio_id`),
  FOREIGN KEY (`music_task_id`) REFERENCES `music_tasks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO时间戳歌词表';

-- 9. SUNO API积分使用记录表
CREATE TABLE IF NOT EXISTS `suno_credit_usage_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `task_type` ENUM('generate', 'extend', 'lyrics', 'vocal_separation', 'wav_conversion', 'music_video', 'cover') NOT NULL COMMENT '任务类型',
  `task_id` VARCHAR(50) NOT NULL COMMENT '任务ID',
  `credits_used` INT UNSIGNED NOT NULL COMMENT '使用的积分数',
  `suno_remaining_credits` INT NULL COMMENT 'SUNO API剩余积分',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_task_type` (`task_type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `t_users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SUNO API积分使用记录表';

-- 添加注释说明
ALTER TABLE `music_tasks` COMMENT = '音乐生成任务表（支持SUNO API完整功能）';
