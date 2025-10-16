-- Phase 4: 添加用户互动和热门推荐功能
-- 作用: 支持点赞、热门排序和风格筛选

-- 1. 为music_tasks表添加点赞计数
ALTER TABLE `music_tasks` 
ADD COLUMN `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数' AFTER `local_audio_path`;

-- 2. 创建用户点赞记录表
CREATE TABLE IF NOT EXISTS `user_music_likes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '点赞ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `music_task_id` BIGINT UNSIGNED NOT NULL COMMENT '音乐任务ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  UNIQUE KEY `uk_user_music` (`user_id`, `music_task_id`),
  INDEX `idx_music_task` (`music_task_id`),
  INDEX `idx_user_created` (`user_id`, `created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户音乐点赞表';

-- 3. 添加索引优化热门推荐查询
CREATE INDEX `idx_public_hot` ON `music_tasks` (`is_public`, `status`, `download_count` DESC);
CREATE INDEX `idx_public_like` ON `music_tasks` (`is_public`, `status`, `like_count` DESC);
CREATE INDEX `idx_style_public` ON `music_tasks` (`style`, `is_public`, `status`);

-- 4. 注释
ALTER TABLE `music_tasks` COMMENT='音乐生成任务表(Phase 4增强: 支持点赞和热门推荐)';
