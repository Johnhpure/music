-- AI音乐创作助手 - 数据库初始化脚本
-- 版本: v1.0
-- 编码: UTF-8
-- 排序规则: utf8mb4_unicode_ci

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `t_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(100) NOT NULL UNIQUE COMMENT '微信openid',
  `phone` VARCHAR(20) NULL COMMENT '手机号',
  `nick_name` VARCHAR(100) NOT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(500) NULL COMMENT '头像URL',
  `credit_balance` INT UNSIGNED DEFAULT 100 COMMENT '点数余额',
  `is_banned` TINYINT(1) DEFAULT 0 COMMENT '是否封禁',
  `is_admin` TINYINT(1) DEFAULT 0 COMMENT '是否管理员',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_openid` (`openid`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_credit_balance` (`credit_balance`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 点数套餐表
CREATE TABLE IF NOT EXISTS `t_credit_packages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '套餐ID',
  `name` VARCHAR(50) NOT NULL COMMENT '套餐名称',
  `credits` INT UNSIGNED NOT NULL COMMENT '点数数量',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格(元)',
  `bonus_credits` INT UNSIGNED DEFAULT 0 COMMENT '赠送点数',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_is_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点数套餐表';

-- 3. 点数记录表
CREATE TABLE IF NOT EXISTS `t_credit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `amount` INT NOT NULL COMMENT '变动数量(正数=充值,负数=消费)',
  `balance_before` INT UNSIGNED NOT NULL COMMENT '变动前余额',
  `balance_after` INT UNSIGNED NOT NULL COMMENT '变动后余额',
  `type` ENUM('recharge', 'consume', 'reward', 'refund') NOT NULL COMMENT '类型',
  `description` VARCHAR(200) NOT NULL COMMENT '描述',
  `order_id` VARCHAR(50) NULL COMMENT '订单ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_created` (`user_id`, `created_at` DESC),
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点数记录表';

-- 4. 歌词生成记录表
CREATE TABLE IF NOT EXISTS `t_lyrics_generation` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `request_id` VARCHAR(50) NOT NULL UNIQUE COMMENT '请求ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `theme` VARCHAR(200) NOT NULL COMMENT '主题',
  `style` VARCHAR(50) NULL COMMENT '风格',
  `mood` VARCHAR(50) NULL COMMENT '情绪',
  `language` VARCHAR(20) DEFAULT 'chinese' COMMENT '语言',
  `additional_requirements` TEXT NULL COMMENT '额外要求',
  `versions` JSON NOT NULL COMMENT '生成的版本',
  `cost_credits` INT UNSIGNED DEFAULT 10 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_created` (`user_id`, `created_at` DESC),
  INDEX `idx_request_id` (`request_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='歌词生成记录表';

-- 5. 音乐生成任务表
CREATE TABLE IF NOT EXISTS `t_music_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
  `task_id` VARCHAR(50) NOT NULL UNIQUE COMMENT '任务标识',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '歌曲标题',
  `lyrics` TEXT NOT NULL COMMENT '歌词内容',
  `style` VARCHAR(50) NOT NULL COMMENT '音乐风格',
  `voice_gender` ENUM('male', 'female', 'neutral') DEFAULT 'neutral' COMMENT '人声性别',
  `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '任务状态',
  `progress` INT UNSIGNED DEFAULT 0 COMMENT '进度(0-100)',
  `audio_url` VARCHAR(500) NULL COMMENT '音频URL',
  `cover_url` VARCHAR(500) NULL COMMENT '封面URL',
  `duration` VARCHAR(20) NULL COMMENT '时长',
  `error_message` TEXT NULL COMMENT '错误信息',
  `suno_task_id` VARCHAR(100) NULL COMMENT 'Suno任务ID',
  `cost_credits` INT UNSIGNED DEFAULT 20 COMMENT '消耗点数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音乐生成任务表';

-- 6. 作品表
CREATE TABLE IF NOT EXISTS `t_works` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '作品ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '作品标题',
  `lyrics` TEXT NULL COMMENT '歌词',
  `style` VARCHAR(50) NULL COMMENT '风格',
  `audio_url` VARCHAR(500) NOT NULL COMMENT '音频URL',
  `cover_url` VARCHAR(500) NULL COMMENT '封面URL',
  `duration` VARCHAR(20) NULL COMMENT '时长',
  `file_size` BIGINT UNSIGNED NULL COMMENT '文件大小(字节)',
  `visibility` ENUM('private', 'public') DEFAULT 'private' COMMENT '可见性',
  `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除',
  `play_count` INT UNSIGNED DEFAULT 0 COMMENT '播放次数',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `share_count` INT UNSIGNED DEFAULT 0 COMMENT '分享数',
  `download_count` INT UNSIGNED DEFAULT 0 COMMENT '下载数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_visibility` (`user_id`, `visibility`, `is_deleted`),
  INDEX `idx_created_at_desc` (`created_at` DESC),
  INDEX `idx_play_count` (`play_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作品表';

-- 7. 文件表
CREATE TABLE IF NOT EXISTS `t_files` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '文件ID',
  `user_id` INT UNSIGNED NULL COMMENT '用户ID',
  `file_name` VARCHAR(200) NOT NULL COMMENT '文件名',
  `original_name` VARCHAR(200) NOT NULL COMMENT '原始文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_type` VARCHAR(50) NOT NULL COMMENT '文件类型',
  `file_size` BIGINT UNSIGNED NOT NULL COMMENT '文件大小(字节)',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  `storage_type` ENUM('local', 'oss', 'cos') DEFAULT 'oss' COMMENT '存储类型',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- 8. 热门推荐表
CREATE TABLE IF NOT EXISTS `t_hot_recommendations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '推荐ID',
  `category` VARCHAR(50) NOT NULL COMMENT '分类',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `cover_url` VARCHAR(500) NOT NULL COMMENT '封面URL',
  `audio_url` VARCHAR(500) NOT NULL COMMENT '音频URL',
  `artist` VARCHAR(100) NULL COMMENT '艺术家',
  `duration` VARCHAR(20) NULL COMMENT '时长',
  `description` TEXT NULL COMMENT '描述',
  `play_count` INT UNSIGNED DEFAULT 0 COMMENT '播放次数',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category_active_sort` (`category`, `is_active`, `sort_order`),
  INDEX `idx_play_count` (`play_count` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='热门推荐表';

-- 9. 推荐分类表
CREATE TABLE IF NOT EXISTS `t_recommendation_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类代码',
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `icon` VARCHAR(200) NULL COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_is_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='推荐分类表';

-- 10. 音乐播放统计表
CREATE TABLE IF NOT EXISTS `t_music_play_stats` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
  `music_id` BIGINT UNSIGNED NOT NULL COMMENT '音乐ID',
  `music_type` ENUM('work', 'recommendation') NOT NULL COMMENT '音乐类型',
  `user_id` INT UNSIGNED NULL COMMENT '用户ID',
  `play_duration` INT UNSIGNED NULL COMMENT '播放时长(秒)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_music` (`music_type`, `music_id`),
  INDEX `idx_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='音乐播放统计表';

-- 11. 用户音乐点赞表
CREATE TABLE IF NOT EXISTS `t_user_music_likes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `music_id` BIGINT UNSIGNED NOT NULL COMMENT '音乐ID',
  `music_type` ENUM('work', 'recommendation') NOT NULL COMMENT '音乐类型',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_music` (`user_id`, `music_type`, `music_id`),
  INDEX `idx_music` (`music_type`, `music_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户音乐点赞表';

-- 12. Banner轮播图表
CREATE TABLE IF NOT EXISTS `t_banners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'BannerID',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `link_url` VARCHAR(500) NULL COMMENT '跳转链接',
  `link_type` ENUM('none', 'internal', 'external', 'miniprogram') DEFAULT 'none' COMMENT '链接类型',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `start_time` TIMESTAMP NULL COMMENT '开始时间',
  `end_time` TIMESTAMP NULL COMMENT '结束时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_is_active` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banner轮播图表';

-- 13. 提示词模板表
CREATE TABLE IF NOT EXISTS `t_prompt_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
  `category` VARCHAR(50) NOT NULL COMMENT '分类(风格/情绪/主题)',
  `title` VARCHAR(100) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '模板内容',
  `tags` VARCHAR(200) NULL COMMENT '标签(逗号分隔)',
  `usage_count` INT UNSIGNED DEFAULT 0 COMMENT '使用次数',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category_active` (`category`, `is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提示词模板表';

-- 14. 提示词使用记录表
CREATE TABLE IF NOT EXISTS `t_prompt_template_usage` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `template_id` INT UNSIGNED NOT NULL COMMENT '模板ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_user_created` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提示词使用记录表';

-- 15. 支付订单表
CREATE TABLE IF NOT EXISTS `t_orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `package_id` INT UNSIGNED NOT NULL COMMENT '套餐ID',
  `credits` INT UNSIGNED NOT NULL COMMENT '点数数量',
  `bonus_credits` INT UNSIGNED DEFAULT 0 COMMENT '赠送点数',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
  `payment_method` VARCHAR(50) NULL COMMENT '支付方式',
  `payment_time` TIMESTAMP NULL COMMENT '支付时间',
  `transaction_id` VARCHAR(100) NULL COMMENT '交易流水号',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付订单表';

-- 16. 系统配置表
CREATE TABLE IF NOT EXISTS `t_system_configs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT NOT NULL COMMENT '配置值',
  `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型',
  `description` VARCHAR(200) NULL COMMENT '描述',
  `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
