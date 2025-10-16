#!/bin/bash

# 音乐平台开发环境状态查看脚本（Linux版本）

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_DIR="/tmp/music-platform"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台开发环境状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查后端
echo -e "${YELLOW}后端服务 (端口3000):${NC}"
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo -e "  PID:  $BACKEND_PID"
        echo -e "  URL:  http://localhost:3000"
        echo -e "  文档: http://localhost:3000/api/docs"
    else
        echo -e "  状态: ${RED}❌ 已停止${NC}"
    fi
else
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  状态: ${YELLOW}⚠️  端口被占用但无PID文件${NC}"
        echo -e "  占用进程: $(lsof -t -i:3000)"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
fi
echo ""

# 检查前端
echo -e "${YELLOW}管理后台 (端口5173):${NC}"
if [ -f "$LOG_DIR/admin.pid" ]; then
    ADMIN_PID=$(cat "$LOG_DIR/admin.pid")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo -e "  PID:  $ADMIN_PID"
        echo -e "  URL:  http://localhost:5173"
    else
        echo -e "  状态: ${RED}❌ 已停止${NC}"
    fi
else
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  状态: ${YELLOW}⚠️  端口被占用但无PID文件${NC}"
        echo -e "  占用进程: $(lsof -t -i:5173)"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
fi
echo ""

# 检查数据库
echo -e "${YELLOW}数据库连接:${NC}"
cd /home/chenbang/app/music/musicdev/music/backend
if node test-db-connection.js > /dev/null 2>&1; then
    echo -e "  状态: ${GREEN}✅ 连接正常${NC}"
    echo -e "  主机: rm-bp1s2o0qzqdwdif9nko.mysql.rds.aliyuncs.com"
    echo -e "  数据库: music"
else
    echo -e "  状态: ${RED}❌ 连接失败${NC}"
fi
echo ""

# 日志文件
echo -e "${YELLOW}日志文件:${NC}"
if [ -f "$LOG_DIR/backend.log" ]; then
    echo -e "  后端: $LOG_DIR/backend.log"
else
    echo -e "  后端: ${YELLOW}不存在${NC}"
fi

if [ -f "$LOG_DIR/admin.log" ]; then
    echo -e "  前端: $LOG_DIR/admin.log"
else
    echo -e "  前端: ${YELLOW}不存在${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
