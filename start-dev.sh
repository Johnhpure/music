#!/bin/bash

# 音乐平台本地开发环境启动脚本
# 启动后端API服务 + 管理后台前端 + 数据库服务

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/Users/bang/Documents/dev/miniprogram1/music"
BACKEND_DIR="$PROJECT_ROOT/backend"
ADMIN_DIR="$PROJECT_ROOT/admin"
DOCKER_COMPOSE_DIR="/Users/bang/Documents/dev/miniprogram/backend"

# 日志文件
LOG_DIR="/tmp"
BACKEND_LOG="$LOG_DIR/backend_startup.log"
ADMIN_LOG="$LOG_DIR/admin_startup.log"
BACKEND_PID_FILE="$LOG_DIR/backend_pid.txt"
ADMIN_PID_FILE="$LOG_DIR/admin_pid.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台本地开发环境启动${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 检查并启动 Docker 服务
echo -e "${YELLOW}[1/4] 检查 Docker 服务...${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker Desktop${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker 运行正常${NC}"
echo ""

# 2. 启动数据库服务（MySQL + Redis）
echo -e "${YELLOW}[2/4] 启动数据库服务（MySQL + Redis）...${NC}"

cd "$DOCKER_COMPOSE_DIR"

# 检查容器是否已运行
if docker ps | grep -q "ai_music_mysql"; then
    echo -e "${GREEN}✅ MySQL 容器已在运行${NC}"
else
    echo "启动 MySQL 容器..."
    docker-compose up -d mysql
    echo -e "${GREEN}✅ MySQL 容器已启动${NC}"
fi

if docker ps | grep -q "ai_music_redis"; then
    echo -e "${GREEN}✅ Redis 容器已在运行${NC}"
else
    echo "启动 Redis 容器..."
    docker-compose up -d redis
    echo -e "${GREEN}✅ Redis 容器已启动${NC}"
fi

# 等待数据库就绪
echo "等待数据库服务就绪..."
sleep 3

# 验证数据库连接
if docker exec ai_music_mysql mysqladmin ping -h localhost -uroot -proot123456 --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL 连接成功${NC}"
else
    echo -e "${RED}❌ MySQL 连接失败${NC}"
    exit 1
fi

if docker exec ai_music_redis redis-cli -a redis123456 ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis 连接成功${NC}"
else
    echo -e "${RED}❌ Redis 连接失败${NC}"
    exit 1
fi

echo ""

# 3. 启动后端服务
echo -e "${YELLOW}[3/4] 启动后端 API 服务...${NC}"

cd "$BACKEND_DIR"

# 检查是否已有后端进程在运行
if [ -f "$BACKEND_PID_FILE" ]; then
    OLD_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "检测到后端服务已在运行 (PID: $OLD_PID)，正在停止..."
        kill $OLD_PID 2>/dev/null || true
        sleep 2
    fi
fi

# 清理端口 3000
if lsof -ti :3000 > /dev/null 2>&1; then
    echo "端口 3000 被占用，正在清理..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 启动后端
echo "启动后端服务..."
npm run start:dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"

# 等待后端启动
echo "等待后端服务启动..."
sleep 5

# 检查后端是否成功启动
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    if curl -s http://localhost:3000/api/public/banner/list > /dev/null; then
        echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
        echo -e "${GREEN}   访问地址: http://localhost:3000/api${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务启动中，请稍候...${NC}"
    fi
else
    echo -e "${RED}❌ 后端服务启动失败，查看日志: $BACKEND_LOG${NC}"
    exit 1
fi

echo ""

# 4. 启动管理后台前端
echo -e "${YELLOW}[4/4] 启动管理后台前端...${NC}"

cd "$ADMIN_DIR"

# 检查是否已有前端进程在运行
if [ -f "$ADMIN_PID_FILE" ]; then
    OLD_PID=$(cat "$ADMIN_PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "检测到管理后台已在运行 (PID: $OLD_PID)，正在停止..."
        kill $OLD_PID 2>/dev/null || true
        sleep 2
    fi
fi

# 清理端口 5173
if lsof -ti :5173 > /dev/null 2>&1; then
    echo "端口 5173 被占用，正在清理..."
    lsof -ti :5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 启动管理后台
echo "启动管理后台..."
npm run dev > "$ADMIN_LOG" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$ADMIN_PID_FILE"

# 等待前端启动
echo "等待管理后台启动..."
sleep 5

# 检查前端是否成功启动
if ps -p $ADMIN_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 管理后台启动成功 (PID: $ADMIN_PID)${NC}"
    echo -e "${GREEN}   访问地址: http://localhost:5173${NC}"
else
    echo -e "${RED}❌ 管理后台启动失败，查看日志: $ADMIN_LOG${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 所有服务启动完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}📊 服务状态：${NC}"
echo -e "  • MySQL:       ✅ localhost:3306"
echo -e "  • Redis:       ✅ localhost:6379"
echo -e "  • Adminer:     ✅ http://localhost:8080"
echo -e "  • 后端API:     ✅ http://localhost:3000/api"
echo -e "  • 管理后台:     ✅ http://localhost:5173"
echo ""
echo -e "${YELLOW}📝 日志文件：${NC}"
echo -e "  • 后端日志: $BACKEND_LOG"
echo -e "  • 前端日志: $ADMIN_LOG"
echo ""
echo -e "${YELLOW}🛑 停止服务：${NC}"
echo -e "  运行脚本: ./stop-dev.sh"
echo ""
echo -e "${BLUE}========================================${NC}"
