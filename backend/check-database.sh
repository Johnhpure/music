#!/bin/bash
# 数据库表结构检查脚本
# 用途: 检查数据库中的表是否存在，特别是user/users表
# =====================================================

set -a
source .env
set +a

echo "========================================"
echo "  数据库表结构检查"
echo "========================================"
echo ""
echo "数据库: ${DB_HOST}/${DB_DATABASE}"
echo ""

# 检查数据库连接
echo "🔍 1. 检查数据库连接..."
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败，请检查配置"
    exit 1
fi

echo ""
echo "🔍 2. 列出所有数据表..."
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "SHOW TABLES;"

echo ""
echo "🔍 3. 检查user表是否存在..."
USER_TABLE=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -sse "
SELECT COUNT(*) 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '${DB_DATABASE}' 
AND TABLE_NAME = 'user';
")

if [ "$USER_TABLE" -eq "1" ]; then
    echo "✅ 'user' 表存在"
    echo ""
    echo "📋 user表结构："
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "DESCRIBE user;"
    
    echo ""
    echo "📊 user表统计信息："
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "
    SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN user_type = 'admin' THEN 1 ELSE 0 END) as admin_users,
        SUM(CASE WHEN user_type = 'vip' THEN 1 ELSE 0 END) as vip_users,
        SUM(CASE WHEN user_type = 'free' THEN 1 ELSE 0 END) as free_users
    FROM user;
    "
    
    echo ""
    echo "👥 最近10个用户："
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "
    SELECT id, username, nickname, user_type, is_admin, created_at 
    FROM user 
    ORDER BY created_at DESC 
    LIMIT 10;
    "
else
    echo "❌ 'user' 表不存在"
fi

echo ""
echo "🔍 4. 检查users表是否存在..."
USERS_TABLE=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -sse "
SELECT COUNT(*) 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '${DB_DATABASE}' 
AND TABLE_NAME = 'users';
")

if [ "$USERS_TABLE" -eq "1" ]; then
    echo "✅ 'users' 表存在"
    echo ""
    echo "📋 users表结构："
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "DESCRIBE users;"
else
    echo "❌ 'users' 表不存在"
fi

echo ""
echo "🔍 5. 检查suno_configs表是否存在..."
SUNO_TABLE=$(mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -sse "
SELECT COUNT(*) 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '${DB_DATABASE}' 
AND TABLE_NAME = 'suno_configs';
")

if [ "$SUNO_TABLE" -eq "1" ]; then
    echo "✅ 'suno_configs' 表存在"
    echo ""
    echo "📊 suno_configs表内容："
    mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "
    SELECT id, LEFT(api_key, 10) as api_key_preview, api_url, is_active, description, created_at 
    FROM suno_configs;
    "
else
    echo "❌ 'suno_configs' 表不存在"
fi

echo ""
echo "========================================"
echo "  检查完成"
echo "========================================"
