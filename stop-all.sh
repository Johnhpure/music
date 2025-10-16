#!/bin/bash

# 音乐平台统一停止脚本
# 停止所有开发服务（后端+前端）

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

STOPPED=0

# 停止后端
echo -e "${YELLOW}停止后端服务...${NC}"
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        sleep 2
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ 后端服务已停止 (PID: $BACKEND_PID)${NC}"
        STOPPED=1
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
    fi
    rm -f "$LOG_DIR/backend.pid"
else
    echo -e "${YELLOW}⚠️  未找到后端PID文件${NC}"
fi

# 强制停止端口3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   强制停止端口3000...${NC}"
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    STOPPED=1
fi

echo ""

# 停止前端
echo -e "${YELLOW}停止管理后台...${NC}"
if [ -f "$LOG_DIR/admin.pid" ]; then
    ADMIN_PID=$(cat "$LOG_DIR/admin.pid")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        kill $ADMIN_PID 2>/dev/null
        sleep 2
        if ps -p $ADMIN_PID > /dev/null 2>&1; then
            kill -9 $ADMIN_PID 2>/dev/null
        fi
        echo -e "${GREEN}✅ 管理后台已停止 (PID: $ADMIN_PID)${NC}"
        STOPPED=1
    else
        echo -e "${YELLOW}⚠️  管理后台未运行${NC}"
    fi
    rm -f "$LOG_DIR/admin.pid"
else
    echo -e "${YELLOW}⚠️  未找到前端PID文件${NC}"
fi

# 强制停止端口5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   强制停止端口5173...${NC}"
    kill -9 $(lsof -t -i:5173) 2>/dev/null || true
    STOPPED=1
fi

# 强制停止端口5174（测试环境）
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   强制停止端口5174...${NC}"
    kill -9 $(lsof -t -i:5174) 2>/dev/null || true
    STOPPED=1
fi

echo ""

if [ $STOPPED -eq 1 ]; then
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
else
    echo -e "${YELLOW}ℹ️  没有运行中的服务${NC}"
fi

echo ""
