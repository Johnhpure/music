-- 21-add-provider-statistics-fields.sql
-- 为 AI Provider 表添加调用次数和 Token 消耗统计字段

-- 检查并添加 call_count 字段
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 't_ai_providers' 
  AND COLUMN_NAME = 'call_count');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE t_ai_providers ADD COLUMN call_count BIGINT UNSIGNED DEFAULT 0 COMMENT ''累计调用次数''',
  'SELECT ''Column call_count already exists'' AS msg');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 token_usage 字段
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 't_ai_providers' 
  AND COLUMN_NAME = 'token_usage');

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE t_ai_providers ADD COLUMN token_usage BIGINT UNSIGNED DEFAULT 0 COMMENT ''累计Token消耗''',
  'SELECT ''Column token_usage already exists'' AS msg');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
