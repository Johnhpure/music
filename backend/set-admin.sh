#!/bin/bash
# 设置用户为管理员权限
# 用途: 将指定用户设置为管理员，以便访问管理后台功能
# =====================================================

set -a
source .env
set +a

echo "========================================"
echo "  设置管理员权限脚本"
echo "========================================"
echo ""
echo "当前数据库: ${DB_HOST}/${DB_DATABASE}"
echo ""

# 先查看所有用户
echo "📋 当前所有用户列表："
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} -e "
SELECT id, username, nickname, user_type, is_admin, created_at 
FROM user 
ORDER BY created_at DESC 
LIMIT 10;
"

echo ""
read -p "请输入要设置为管理员的用户ID (输入0跳过): " user_id

if [ "$user_id" = "0" ] || [ -z "$user_id" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "正在将用户ID ${user_id} 设置为管理员..."

mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} << EOF
-- 设置用户为管理员
UPDATE user 
SET user_type = 'admin', is_admin = 1 
WHERE id = ${user_id};

-- 查看更新结果
SELECT id, username, nickname, user_type, is_admin 
FROM user 
WHERE id = ${user_id};
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 用户已成功设置为管理员！"
    echo ""
    echo "请退出登录并重新登录管理后台，然后访问 SUNO配置页面"
else
    echo ""
    echo "❌ 设置失败，请检查用户ID是否正确"
    exit 1
fi
