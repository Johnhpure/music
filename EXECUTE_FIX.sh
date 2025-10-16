#!/bin/bash

# 🎯 提示词功能修复执行脚本
# 日期: 2025-10-15

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  提示词添加功能修复执行向导${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# 步骤1: 数据库迁移
echo -e "${YELLOW}步骤 1/3: 执行数据库迁移${NC}"
echo "---------------------------------------"
echo "正在读取数据库配置..."

cd /home/chenbang/app/music/music_platform-master/backend
source .env 2>/dev/null || true

DB_HOST="${DB_HOST:-172.17.0.3}"
DB_USER="${DB_USERNAME:-music_user}"
DB_NAME="${DB_DATABASE:-ai_music_platform}"
DB_CONTAINER="2d50faa43a3c"

echo "数据库配置:"
echo "  - 主机: $DB_HOST"
echo "  - 用户: $DB_USER"  
echo "  - 数据库: $DB_NAME"
echo "  - 容器: $DB_CONTAINER"
echo ""

# 交互式输入密码
if [ -z "$DB_PASSWORD" ]; then
    echo -n "请输入数据库密码 (music_user): "
    read -s DB_PASSWORD
    echo ""
fi

echo "执行SQL迁移..."
docker exec -i "$DB_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOSQL'
-- 添加 icon 字段
ALTER TABLE `t_prompt_templates` 
ADD COLUMN IF NOT EXISTS `icon` VARCHAR(50) NULL COMMENT '图标' AFTER `tags`;

-- 验证
SELECT '✅ Icon字段添加成功' AS Status;
SELECT 
    COLUMN_NAME AS '字段名',
    COLUMN_TYPE AS '类型',
    IS_NULLABLE AS '可空',
    COLUMN_COMMENT AS '注释'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 't_prompt_templates'
  AND COLUMN_NAME IN ('title', 'content', 'category', 'tags', 'icon')
ORDER BY ORDINAL_POSITION;
EOSQL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库迁移完成${NC}"
    echo ""
else
    echo -e "${RED}❌ 数据库迁移失败${NC}"
    echo ""
    echo "请手动执行以下SQL："
    echo "  docker exec -i $DB_CONTAINER mysql -u$DB_USER -p $DB_NAME"
    echo "  ALTER TABLE \`t_prompt_templates\` ADD COLUMN \`icon\` VARCHAR(50) NULL COMMENT '图标' AFTER \`tags\`;"
    echo ""
    exit 1
fi

# 步骤2: 重启后端
echo -e "${YELLOW}步骤 2/3: 重启后端服务${NC}"
echo "---------------------------------------"
cd /home/chenbang/app/music/music_platform-master

# 检查是否有restart脚本
if [ -f "restart-backend.sh" ]; then
    echo "使用restart-backend.sh重启..."
    ./restart-backend.sh
else
    echo "手动重启后端服务..."
    pkill -f "nest start" || echo "  ℹ️  没有找到运行中的后端"
    sleep 2
    
    cd backend
    nohup npm run start:dev > /tmp/backend.log 2>&1 &
    echo "  ✅ 后端服务已启动"
    echo "  📝 日志: /tmp/backend.log"
fi

echo -e "${GREEN}✅ 后端服务重启完成${NC}"
echo ""
sleep 3

# 步骤3: 验证
echo -e "${YELLOW}步骤 3/3: 验证修复${NC}"
echo "---------------------------------------"
echo "检查后端健康状态..."
sleep 2

HEALTH_CHECK=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "failed")
if [ "$HEALTH_CHECK" != "failed" ]; then
    echo -e "${GREEN}✅ 后端服务运行正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端健康检查失败，请查看日志${NC}"
    echo "  tail -f /tmp/backend.log"
fi
echo ""

echo "查看后端日志（最后20行）："
echo "---------------------------------------"
tail -20 /tmp/backend.log 2>/dev/null || echo "日志文件不存在"
echo ""

# 完成
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ 修复执行完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "📋 下一步操作："
echo "  1. 清除浏览器缓存 (Ctrl+Shift+Delete)"
echo "  2. 硬刷新页面 (Ctrl+F5)"
echo "  3. 测试添加提示词功能"
echo ""
echo "📊 查看实时日志："
echo "  tail -f /tmp/backend.log"
echo ""
echo "🔍 如果仍有问题，请查看:"
echo "  - PROMPT_FIX_SUMMARY.md (完整修复总结)"
echo "  - docs/fix-prompt-template-issue.md (详细文档)"
echo ""
