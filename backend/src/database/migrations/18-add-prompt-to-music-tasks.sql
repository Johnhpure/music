-- 为 t_music_tasks 表添加 Suno 相关字段
-- 版本: v1.0
-- 创建时间: 2025年10月19日
-- 编码: UTF-8
-- 描述: 添加创意描述/提示词、纯音乐标志、AI模型版本字段
-- =====================================================

-- 检查并添加 prompt 字段
SET @col_exists_prompt = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_music_tasks' 
  AND COLUMN_NAME = 'prompt'
);

SET @sql_prompt = IF(@col_exists_prompt = 0, 
  'ALTER TABLE `t_music_tasks` ADD COLUMN `prompt` TEXT NULL COMMENT ''创意描述或提示词'' AFTER `style`', 
  'SELECT "t_music_tasks.prompt already exists" AS message'
);

PREPARE stmt FROM @sql_prompt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 instrumental 字段
SET @col_exists_instrumental = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_music_tasks' 
  AND COLUMN_NAME = 'instrumental'
);

SET @sql_instrumental = IF(@col_exists_instrumental = 0, 
  'ALTER TABLE `t_music_tasks` ADD COLUMN `instrumental` TINYINT(1) DEFAULT 0 COMMENT ''是否生成纯音乐（无人声）'' AFTER `prompt`', 
  'SELECT "t_music_tasks.instrumental already exists" AS message'
);

PREPARE stmt FROM @sql_instrumental;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 model 字段
SET @col_exists_model = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_music_tasks' 
  AND COLUMN_NAME = 'model'
);

SET @sql_model = IF(@col_exists_model = 0, 
  'ALTER TABLE `t_music_tasks` ADD COLUMN `model` ENUM(''V3_5'', ''V4'') DEFAULT ''V3_5'' COMMENT ''AI模型版本'' AFTER `instrumental`', 
  'SELECT "t_music_tasks.model already exists" AS message'
);

PREPARE stmt FROM @sql_model;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 迁移完成信息
SELECT '============================================' AS '';
SELECT 'Suno相关字段迁移完成' AS 'STATUS';
SELECT '版本: 18' AS '';
SELECT '日期: 2025-10-19' AS '';
SELECT '============================================' AS '';
