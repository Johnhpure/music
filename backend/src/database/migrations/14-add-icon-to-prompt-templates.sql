-- 添加 icon 字段到 t_prompt_templates 表
-- 创建时间: 2025-01-16

-- 检查并添加 icon 字段
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_prompt_templates' 
  AND COLUMN_NAME = 'icon'
);

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE `t_prompt_templates` ADD COLUMN `icon` VARCHAR(50) NULL COMMENT ''图标'' AFTER `tags`',
  'SELECT "t_prompt_templates.icon already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证字段是否添加成功
SELECT 
  COLUMN_NAME AS '字段名',
  COLUMN_TYPE AS '类型',
  IS_NULLABLE AS '可空',
  COLUMN_COMMENT AS '说明'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_prompt_templates'
  AND COLUMN_NAME = 'icon';
