#!/bin/bash

# 音乐平台本地开发环境停止脚本
# 停止后端API服务 + 管理后台前端 + 数据库服务

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID文件
BACKEND_PID_FILE="/tmp/backend_pid.txt"
ADMIN_PID_FILE="/tmp/admin_pid.txt"
DOCKER_COMPOSE_DIR="/Users/bang/Documents/dev/miniprogram/backend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台本地开发环境停止${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 停止管理后台前端
echo -e "${YELLOW}[1/4] 停止管理后台前端...${NC}"

if [ -f "$ADMIN_PID_FILE" ]; then
    ADMIN_PID=$(cat "$ADMIN_PID_FILE")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        kill $ADMIN_PID 2>/dev/null
        echo -e "${GREEN}✅ 管理后台已停止 (PID: $ADMIN_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  管理后台未运行${NC}"
    fi
    rm -f "$ADMIN_PID_FILE"
else
    echo -e "${YELLOW}⚠️  管理后台未运行${NC}"
fi

# 清理端口 5173
if lsof -ti :5173 > /dev/null 2>&1; then
    lsof -ti :5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ 端口 5173 已清理${NC}"
fi

echo ""

# 2. 停止后端服务
echo -e "${YELLOW}[2/4] 停止后端 API 服务...${NC}"

if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ 后端服务已停止 (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
    fi
    rm -f "$BACKEND_PID_FILE"
else
    echo -e "${YELLOW}⚠️  后端服务未运行${NC}"
fi

# 清理端口 3000
if lsof -ti :3000 > /dev/null 2>&1; then
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ 端口 3000 已清理${NC}"
fi

echo ""

# 3. 停止数据库服务
echo -e "${YELLOW}[3/4] 停止数据库服务...${NC}"

read -p "是否停止数据库服务 (MySQL + Redis)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$DOCKER_COMPOSE_DIR"

    if docker ps | grep -q "ai_music_mysql\|ai_music_redis"; then
        docker-compose stop mysql redis
        echo -e "${GREEN}✅ 数据库服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库服务未运行${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  跳过停止数据库服务${NC}"
fi

echo ""

# 4. 清理日志文件（可选）
echo -e "${YELLOW}[4/4] 清理日志文件...${NC}"

read -p "是否清理日志文件? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f /tmp/backend_startup.log
    rm -f /tmp/admin_startup.log
    echo -e "${GREEN}✅ 日志文件已清理${NC}"
else
    echo -e "${YELLOW}⚠️  跳过清理日志文件${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 所有服务已停止！${NC}"
echo -e "${BLUE}========================================${NC}"
