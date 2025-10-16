#!/bin/bash

# 提示词表添加icon字段迁移脚本
# 日期: 2025-10-15

set -e

echo "🔄 开始添加icon字段到t_prompt_templates表..."

# 获取数据库配置
DB_HOST="${DB_HOST:-172.17.0.3}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USERNAME:-music_user}"
DB_NAME="${DB_DATABASE:-ai_music_platform}"
DB_CONTAINER="2d50faa43a3c"

# 检查MySQL容器
if ! docker ps | grep -q "$DB_CONTAINER"; then
    echo "❌ MySQL容器未运行，尝试查找MySQL容器..."
    DB_CONTAINER=$(docker ps | grep mysql | awk '{print $1}' | head -1)
    if [ -z "$DB_CONTAINER" ]; then
        echo "❌ 未找到运行中的MySQL容器"
        exit 1
    fi
    echo "✅ 找到MySQL容器: $DB_CONTAINER"
fi

# 读取数据库密码
if [ -f .env ]; then
    source .env
    if [ -z "$DB_PASSWORD" ]; then
        echo "请输入数据库密码:"
        read -s DB_PASSWORD
    fi
else
    echo "请输入数据库密码:"
    read -s DB_PASSWORD
fi

# 执行SQL
echo "📝 执行数据库迁移..."
docker exec -i "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOSQL'
-- 为 t_prompt_templates 表添加 icon 字段

-- 检查字段是否存在
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_prompt_templates' 
  AND COLUMN_NAME = 'icon';

SELECT @col_exists AS 'Icon field exists (0=no, 1=yes)';

-- 如果不存在则添加
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `t_prompt_templates` ADD COLUMN `icon` VARCHAR(50) NULL COMMENT ''图标'' AFTER `tags`',
  'SELECT ''Icon field already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 验证结果
SELECT '✅ Migration completed successfully' AS Status;

-- 显示表结构
SELECT 
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '类型',
    IS_NULLABLE AS '可空',
    COLUMN_COMMENT AS '注释'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_prompt_templates'
  AND COLUMN_NAME IN ('category', 'title', 'content', 'tags', 'icon', 'sort_order', 'is_active')
ORDER BY ORDINAL_POSITION;
EOSQL

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功完成！"
    echo ""
    echo "📋 下一步操作："
    echo "  1. 重启后端服务: ./restart-backend.sh 或 pm2 restart music-backend"
    echo "  2. 清除浏览器缓存"
    echo "  3. 测试添加提示词功能"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi
