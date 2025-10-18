-- 插入SUNO API配置（模板文件）
-- 版本: v1.0
-- 创建时间: 2025年1月
-- 编码: UTF-8
-- 使用说明: 复制此文件为 17-insert-suno-config.sql 并替换 YOUR_API_KEY 和 YOUR_API_URL
-- =====================================================

-- 先清空可能存在的旧配置（可选）
-- DELETE FROM `suno_configs` WHERE `api_key` = 'YOUR_OLD_API_KEY';

-- 插入新的SUNO配置
INSERT INTO `suno_configs` 
  (`api_key`, `api_url`, `is_active`, `description`) 
VALUES 
  (
    'YOUR_API_KEY',
    'YOUR_API_URL',
    1,
    '主SUNO API配置 - 用于AI音乐生成'
  );

-- 确保只有一个激活的配置
UPDATE `suno_configs` 
SET `is_active` = 0 
WHERE `api_key` != 'YOUR_API_KEY' AND `is_active` = 1;
