#!/bin/bash

# 音乐平台本地开发环境状态查看脚本

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID文件
BACKEND_PID_FILE="/tmp/backend_pid.txt"
ADMIN_PID_FILE="/tmp/admin_pid.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台本地开发环境状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Docker
echo -e "${YELLOW}Docker 服务:${NC}"
if docker info > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Docker 运行中${NC}"
else
    echo -e "  ${RED}❌ Docker 未运行${NC}"
fi
echo ""

# 检查数据库服务
echo -e "${YELLOW}数据库服务:${NC}"

# MySQL
if docker ps | grep -q "ai_music_mysql"; then
    echo -e "  ${GREEN}✅ MySQL (localhost:3306) - 运行中${NC}"
    if docker exec ai_music_mysql mysqladmin ping -h localhost -uroot -proot123456 --silent > /dev/null 2>&1; then
        echo -e "     ${GREEN}数据库连接正常${NC}"
    else
        echo -e "     ${RED}数据库连接失败${NC}"
    fi
else
    echo -e "  ${RED}❌ MySQL - 未运行${NC}"
fi

# Redis
if docker ps | grep -q "ai_music_redis"; then
    echo -e "  ${GREEN}✅ Redis (localhost:6379) - 运行中${NC}"
    if docker exec ai_music_redis redis-cli -a redis123456 ping > /dev/null 2>&1; then
        echo -e "     ${GREEN}Redis 连接正常${NC}"
    else
        echo -e "     ${RED}Redis 连接失败${NC}"
    fi
else
    echo -e "  ${RED}❌ Redis - 未运行${NC}"
fi

# Adminer
if docker ps | grep -q "ai_music_adminer"; then
    echo -e "  ${GREEN}✅ Adminer (http://localhost:8080) - 运行中${NC}"
else
    echo -e "  ${YELLOW}⚠️  Adminer - 未运行${NC}"
fi

echo ""

# 检查后端服务
echo -e "${YELLOW}后端 API 服务 (http://localhost:3000/api):${NC}"
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ 运行中 (PID: $BACKEND_PID)${NC}"
        if curl -s http://localhost:3000/api/public/banner/list > /dev/null 2>&1; then
            echo -e "     ${GREEN}API 响应正常${NC}"
        else
            echo -e "     ${YELLOW}API 响应异常${NC}"
        fi
    else
        echo -e "  ${RED}❌ 未运行 (PID 文件存在但进程不存在)${NC}"
    fi
elif lsof -ti :3000 > /dev/null 2>&1; then
    PID=$(lsof -ti :3000)
    echo -e "  ${YELLOW}⚠️  端口 3000 被占用 (PID: $PID)${NC}"
else
    echo -e "  ${RED}❌ 未运行${NC}"
fi

echo ""

# 检查管理后台
echo -e "${YELLOW}管理后台前端 (http://localhost:5173):${NC}"
if [ -f "$ADMIN_PID_FILE" ]; then
    ADMIN_PID=$(cat "$ADMIN_PID_FILE")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ 运行中 (PID: $ADMIN_PID)${NC}"
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo -e "     ${GREEN}前端响应正常${NC}"
        else
            echo -e "     ${YELLOW}前端响应异常${NC}"
        fi
    else
        echo -e "  ${RED}❌ 未运行 (PID 文件存在但进程不存在)${NC}"
    fi
elif lsof -ti :5173 > /dev/null 2>&1; then
    PID=$(lsof -ti :5173)
    echo -e "  ${YELLOW}⚠️  端口 5173 被占用 (PID: $PID)${NC}"
else
    echo -e "  ${RED}❌ 未运行${NC}"
fi

echo ""

# 日志文件
echo -e "${YELLOW}日志文件:${NC}"
if [ -f "/tmp/backend_startup.log" ]; then
    SIZE=$(du -h /tmp/backend_startup.log | cut -f1)
    echo -e "  ${GREEN}✅ 后端日志: /tmp/backend_startup.log ($SIZE)${NC}"
else
    echo -e "  ${YELLOW}⚠️  后端日志不存在${NC}"
fi

if [ -f "/tmp/admin_startup.log" ]; then
    SIZE=$(du -h /tmp/admin_startup.log | cut -f1)
    echo -e "  ${GREEN}✅ 前端日志: /tmp/admin_startup.log ($SIZE)${NC}"
else
    echo -e "  ${YELLOW}⚠️  前端日志不存在${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}快捷命令:${NC}"
echo -e "  启动所有服务: ${GREEN}./start-dev.sh${NC}"
echo -e "  停止所有服务: ${GREEN}./stop-dev.sh${NC}"
echo -e "  查看后端日志: ${GREEN}tail -f /tmp/backend_startup.log${NC}"
echo -e "  查看前端日志: ${GREEN}tail -f /tmp/admin_startup.log${NC}"
echo -e "${BLUE}========================================${NC}"
