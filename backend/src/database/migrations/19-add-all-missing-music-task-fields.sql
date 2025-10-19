-- 为 t_music_tasks 表添加所有缺失字段
-- 版本: v1.0
-- 创建时间: 2025年10月19日
-- 编码: UTF-8
-- 描述: 一次性添加Entity中定义但数据库缺失的所有字段
-- =====================================================

-- 1. suno_response (JSON类型，存储Suno API完整响应)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='suno_response');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `suno_response` JSON NULL COMMENT ''Suno API响应数据'' AFTER `suno_task_id`', 'SELECT "suno_response exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. video_url (视频URL)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='video_url');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `video_url` VARCHAR(500) NULL COMMENT ''视频URL'' AFTER `audio_url`', 'SELECT "video_url exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. image_url (封面图片URL)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='image_url');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `image_url` VARCHAR(500) NULL COMMENT ''封面图片URL'' AFTER `video_url`', 'SELECT "image_url exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. credit_cost (积分消耗，替换旧的cost_credits)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='credit_cost');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `credit_cost` DECIMAL(10,2) DEFAULT 20 COMMENT ''消耗积分'' AFTER `error_message`', 'SELECT "credit_cost exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. share_url (分享链接)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='share_url');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `share_url` VARCHAR(500) NULL COMMENT ''分享链接'' AFTER `credit_cost`', 'SELECT "share_url exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6. is_public (是否公开)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='is_public');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `is_public` TINYINT(1) DEFAULT 0 COMMENT ''是否公开'' AFTER `share_url`', 'SELECT "is_public exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7. download_count (下载次数)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='download_count');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `download_count` INT DEFAULT 0 COMMENT ''下载次数'' AFTER `is_public`', 'SELECT "download_count exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. local_audio_path (本地音频文件路径)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='local_audio_path');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `local_audio_path` VARCHAR(500) NULL COMMENT ''本地音频路径'' AFTER `download_count`', 'SELECT "local_audio_path exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 9. like_count (点赞数)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='t_music_tasks' AND COLUMN_NAME='like_count');
SET @sql = IF(@col = 0, 'ALTER TABLE `t_music_tasks` ADD COLUMN `like_count` INT DEFAULT 0 COMMENT ''点赞数'' AFTER `local_audio_path`', 'SELECT "like_count exists" AS msg');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 迁移完成信息
SELECT '============================================' AS '';
SELECT '所有缺失字段迁移完成' AS 'STATUS';
SELECT '版本: 19' AS '';
SELECT '日期: 2025-10-19' AS '';
SELECT '============================================' AS '';
