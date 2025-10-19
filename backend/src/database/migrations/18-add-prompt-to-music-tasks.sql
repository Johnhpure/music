-- 为 t_music_tasks 表添加 prompt 字段
-- 版本: v1.0
-- 创建时间: 2025年10月19日
-- 编码: UTF-8
-- 描述: 添加创意描述/提示词字段，用于存储用户输入的音乐创作提示
-- =====================================================

-- 检查并添加 prompt 字段
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_music_tasks' 
  AND COLUMN_NAME = 'prompt'
);

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `t_music_tasks` ADD COLUMN `prompt` TEXT NULL COMMENT ''创意描述或提示词'' AFTER `style`', 
  'SELECT "t_music_tasks.prompt already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 迁移完成信息
SELECT '============================================' AS '';
SELECT 'prompt字段迁移完成' AS 'STATUS';
SELECT '版本: 18' AS '';
SELECT '日期: 2025-10-19' AS '';
SELECT '============================================' AS '';
