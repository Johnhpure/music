#!/bin/bash

# 后端服务重启脚本

set -e

echo "🔄 正在重启后端服务..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 停止旧的后端服务
echo -e "${BLUE}[1/2]${NC} 停止旧的后端服务..."
pkill -f "nest start" || echo "  ℹ️  没有找到运行中的后端服务"
sleep 2

# 启动后端服务
echo -e "${BLUE}[2/2]${NC} 启动后端服务..."
cd /home/chenbang/app/music/music_platform-master/backend
nohup npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "  ✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "  📝 日志文件: /tmp/backend.log"
sleep 5

# 验证服务状态
echo ""
echo "🔍 验证服务状态..."
if curl -s http://localhost:3000/api/ > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 后端API${NC} - 运行正常"
else
    echo -e "  ${RED}❌ 后端API${NC} - 启动失败"
    echo "  查看日志: tail -f /tmp/backend.log"
    exit 1
fi

echo ""
echo "✨ 后端服务重启完成！"
echo ""
echo "📊 服务信息："
echo "  - 本地访问: http://localhost:3000/api"
echo "  - 公网访问: https://adminapi.jianzhile.vip/api"
echo "  - 进程 PID: $BACKEND_PID"
echo "  - 日志文件: /tmp/backend.log"
echo ""
echo "📝 查看实时日志："
echo "  tail -f /tmp/backend.log"
