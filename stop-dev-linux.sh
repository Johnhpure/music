#!/bin/bash

# 音乐平台开发环境停止脚本（Linux版本）

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_DIR="/tmp/music-platform"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  停止音乐平台开发环境${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止后端
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止后端服务 (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        echo -e "${GREEN}✅ 后端服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
    fi
    rm -f "$LOG_DIR/backend.pid"
else
    echo -e "${YELLOW}⚠️  未找到后端PID文件${NC}"
fi

# 停止前端
if [ -f "$LOG_DIR/admin.pid" ]; then
    ADMIN_PID=$(cat "$LOG_DIR/admin.pid")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止管理后台 (PID: $ADMIN_PID)...${NC}"
        kill $ADMIN_PID
        echo -e "${GREEN}✅ 管理后台已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  管理后台未运行${NC}"
    fi
    rm -f "$LOG_DIR/admin.pid"
else
    echo -e "${YELLOW}⚠️  未找到前端PID文件${NC}"
fi

# 强制停止端口占用（如果有）
echo ""
echo -e "${YELLOW}检查端口占用...${NC}"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}强制停止端口3000...${NC}"
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}强制停止端口5173...${NC}"
    kill -9 $(lsof -t -i:5173) 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ 所有服务已停止${NC}"
echo ""
