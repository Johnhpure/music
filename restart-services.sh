#!/bin/bash

# AI音乐平台服务重启脚本
# 用于重启后端和前端服务

set -e

echo "🔄 正在重启AI音乐平台服务..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 停止旧的后端服务
echo -e "${BLUE}[1/4]${NC} 停止旧的后端服务..."
pkill -f "nest start" || echo "  ⚠️  没有找到运行中的后端服务"
sleep 2

# 停止旧的前端服务（5173端口）
echo -e "${BLUE}[2/4]${NC} 停止旧的前端服务..."
PID=$(lsof -ti:5173 2>/dev/null) || true
if [ -n "$PID" ]; then
    kill $PID
    echo "  ✅ 已停止进程 $PID"
else
    echo "  ⚠️  5173端口未被占用"
fi
sleep 2

# 启动后端服务
echo -e "${BLUE}[3/4]${NC} 启动后端服务..."
cd /home/chenbang/app/music/music_platform-master/backend
npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "  ✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "  📝 日志文件: /tmp/backend.log"
sleep 5

# 启动前端服务
echo -e "${BLUE}[4/4]${NC} 启动前端服务..."
cd /home/chenbang/app/music/music_platform-master/admin
npm run dev -- --port 5173 --host 0.0.0.0 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  ✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "  📝 日志文件: /tmp/frontend.log"
sleep 3

# 验证服务状态
echo ""
echo "🔍 验证服务状态..."

# 检查后端
if curl -s http://localhost:3000/api/public/banner > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 后端API${NC} - 运行正常 (http://localhost:3000)"
else
    echo -e "  ${RED}❌ 后端API${NC} - 启动失败，请查看日志: /tmp/backend.log"
fi

# 检查前端
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ 前端服务${NC} - 运行正常 (http://localhost:5173)"
else
    echo -e "  ${RED}❌ 前端服务${NC} - 启动失败，请查看日志: /tmp/frontend.log"
fi

echo ""
echo "✨ 服务重启完成！"
echo ""
echo "📊 服务信息："
echo "  - 后端API:  http://localhost:3000/api"
echo "  - 管理后台: http://localhost:5173"
echo "  - 后端PID:  $BACKEND_PID"
echo "  - 前端PID:  $FRONTEND_PID"
echo ""
echo "📝 查看日志："
echo "  - 后端: tail -f /tmp/backend.log"
echo "  - 前端: tail -f /tmp/frontend.log"
echo ""
echo "🌐 公网访问（配置Cloudflare Tunnel后）："
echo "  - 管理后台: https://admin.jianzhile.vip"
echo "  - 后端API:  https://api.jianzhile.vip/api"
