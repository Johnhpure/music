#!/bin/bash

# Admin 前端服务重启脚本

set -e

echo "🔄 正在重启 Admin 前端服务..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 停止旧的前端服务（5173端口）
echo -e "${BLUE}[1/2]${NC} 停止旧的前端服务..."
PID=$(lsof -ti:5173 2>/dev/null) || true
if [ -n "$PID" ]; then
    kill $PID
    echo "  ✅ 已停止进程 $PID"
    sleep 2
else
    echo "  ℹ️  5173端口未被占用"
fi

# 启动前端服务
echo -e "${BLUE}[2/2]${NC} 启动前端服务..."
cd /home/chenbang/app/music/music_platform-master/admin
nohup npm run dev > /tmp/admin.log 2>&1 &
FRONTEND_PID=$!
echo "  ✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "  📝 日志文件: /tmp/admin.log"
sleep 3

# 验证服务状态
echo ""
echo "🔍 验证服务状态..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 前端服务${NC} - 运行正常"
else
    echo -e "  ${RED}❌ 前端服务${NC} - 启动失败"
    echo "  查看日志: tail -f /tmp/admin.log"
    exit 1
fi

echo ""
echo "✨ Admin 前端服务重启完成！"
echo ""
echo "📊 服务信息："
echo "  - 本地访问: http://localhost:5173"
echo "  - 公网访问: https://admin.jianzhile.vip"
echo "  - 进程 PID: $FRONTEND_PID"
echo "  - 日志文件: /tmp/admin.log"
echo ""
echo "📝 查看实时日志："
echo "  tail -f /tmp/admin.log"
