-- 创建提示词分类表
CREATE TABLE IF NOT EXISTS `t_prompt_categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '分类描述',
  `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_sort_active` (`sort_order`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提示词分类表';

-- 为提示词模板表添加分类ID外键字段
ALTER TABLE `t_prompt_templates` 
ADD COLUMN `category_id` INT UNSIGNED DEFAULT NULL COMMENT '分类ID（外键）' AFTER `id`,
ADD COLUMN `variables` TEXT DEFAULT NULL COMMENT '变量定义(JSON格式)' AFTER `icon`,
ADD INDEX `idx_category_id` (`category_id`);

-- 插入默认分类（基于现有数据）
INSERT INTO `t_prompt_categories` (`name`, `description`, `icon`, `sort_order`, `is_active`) VALUES
('流行音乐', '适合流行音乐风格的创作提示词', 'mdi:music-note', 10, 1),
('R&B', '适合R&B风格的创作提示词', 'mdi:music-note-half', 20, 1),
('电子音乐', '适合电子音乐风格的创作提示词', 'mdi:waveform', 30, 1),
('摇滚', '适合摇滚风格的创作提示词', 'mdi:guitar-electric', 40, 1),
('民谣', '适合民谣风格的创作提示词', 'mdi:guitar-acoustic', 50, 1),
('古典', '适合古典音乐风格的创作提示词', 'mdi:piano', 60, 1),
('爵士', '适合爵士风格的创作提示词', 'mdi:saxophone', 70, 1),
('嘻哈', '适合嘻哈风格的创作提示词', 'mdi:microphone', 80, 1),
('乡村', '适合乡村音乐风格的创作提示词', 'mdi:guitar-acoustic', 90, 1),
('蓝调', '适合蓝调风格的创作提示词', 'mdi:music-clef-treble', 100, 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 更新现有数据：将category字符串映射到category_id
UPDATE `t_prompt_templates` pt
JOIN `t_prompt_categories` pc ON pt.`category` = pc.`name`
SET pt.`category_id` = pc.`id`
WHERE pt.`category_id` IS NULL;
