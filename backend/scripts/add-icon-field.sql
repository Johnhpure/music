-- 为 t_prompt_templates 表添加 icon 字段
USE ai_music_platform;

-- 检查字段是否存在
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ai_music_platform' 
AND TABLE_NAME = 't_prompt_templates' 
AND COLUMN_NAME = 'icon';

-- 如果不存在则添加
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `t_prompt_templates` ADD COLUMN `icon` VARCHAR(50) NULL COMMENT ''图标'' AFTER `tags`',
  'SELECT "icon field already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证结果
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ai_music_platform'
AND TABLE_NAME = 't_prompt_templates'
ORDER BY ORDINAL_POSITION;
