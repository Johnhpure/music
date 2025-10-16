-- Phase 3.3: 为音乐任务表添加作品管理字段
-- 作用: 支持分享、公开展示、下载统计和本地存储功能

ALTER TABLE `music_tasks` 
ADD COLUMN `share_url` VARCHAR(200) NULL COMMENT '分享链接' AFTER `completed_at`,
ADD COLUMN `is_public` TINYINT(1) DEFAULT 0 COMMENT '是否公开' AFTER `share_url`,
ADD COLUMN `download_count` INT UNSIGNED DEFAULT 0 COMMENT '下载次数' AFTER `is_public`,
ADD COLUMN `local_audio_path` VARCHAR(500) NULL COMMENT '本地音频路径' AFTER `download_count`;

-- 添加索引以优化查询
CREATE INDEX `idx_is_public_status` ON `music_tasks` (`is_public`, `status`, `created_at` DESC);
CREATE INDEX `idx_share_url` ON `music_tasks` (`share_url`);

-- 注释
ALTER TABLE `music_tasks` COMMENT='音乐生成任务表(Phase 3.3增强: 支持分享和作品管理)';
