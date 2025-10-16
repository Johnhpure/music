#!/bin/bash

# 音乐平台开发环境启动脚本（Linux版本）
# 功能：启动后端API服务和管理后台

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="/home/chenbang/app/music/musicdev/music"
BACKEND_DIR="$PROJECT_ROOT/backend"
ADMIN_DIR="$PROJECT_ROOT/admin"

# 日志文件
LOG_DIR="/tmp/music-platform"
mkdir -p "$LOG_DIR"
BACKEND_LOG="$LOG_DIR/backend.log"
ADMIN_LOG="$LOG_DIR/admin.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台开发环境启动${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 检查环境
echo -e "${YELLOW}[1/4] 检查运行环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
echo -e "${GREEN}✅ pnpm: $(pnpm --version)${NC}"
echo ""

# 2. 检查数据库配置
echo -e "${YELLOW}[2/4] 检查数据库配置...${NC}"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}❌ backend/.env 文件不存在${NC}"
    echo -e "${YELLOW}提示: 请复制 .env.example 并配置数据库信息${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 数据库配置文件存在${NC}"

# 测试数据库连接
echo -e "${YELLOW}   测试数据库连接...${NC}"
cd "$BACKEND_DIR"
if node test-db-connection.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败，请检查配置${NC}"
    exit 1
fi
echo ""

# 3. 启动后端服务
echo -e "${YELLOW}[3/4] 启动后端服务...${NC}"

cd "$BACKEND_DIR"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装后端依赖...${NC}"
    npm install
fi

# 检查是否已运行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口3000已被占用，停止现有服务...${NC}"
    kill $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi

# 启动后端（后台运行）
echo -e "${YELLOW}   启动后端服务（端口3000）...${NC}"
nohup npm run start:dev > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"

# 等待后端启动
sleep 5

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}   访问地址: http://localhost:3000${NC}"
    echo -e "${GREEN}   API文档: http://localhost:3000/api/docs${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $BACKEND_LOG${NC}"
    exit 1
fi
echo ""

# 4. 启动管理后台
echo -e "${YELLOW}[4/4] 启动管理后台...${NC}"

cd "$ADMIN_DIR"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装前端依赖...${NC}"
    pnpm install
fi

# 检查是否已运行
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口5173已被占用，停止现有服务...${NC}"
    kill $(lsof -t -i:5173) 2>/dev/null || true
    sleep 2
fi

# 启动前端（后台运行）
echo -e "${YELLOW}   启动管理后台（端口5173）...${NC}"
nohup pnpm run dev > "$ADMIN_LOG" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$LOG_DIR/admin.pid"

# 等待前端启动
sleep 3

if ps -p $ADMIN_PID > /dev/null; then
    echo -e "${GREEN}✅ 管理后台启动成功 (PID: $ADMIN_PID)${NC}"
    echo -e "${GREEN}   访问地址: http://localhost:5173${NC}"
else
    echo -e "${RED}❌ 管理后台启动失败${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $ADMIN_LOG${NC}"
    exit 1
fi
echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 所有服务已启动完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "📋 服务信息："
echo -e "  ${GREEN}后端API:${NC}     http://localhost:3000"
echo -e "  ${GREEN}API文档:${NC}     http://localhost:3000/api/docs"
echo -e "  ${GREEN}管理后台:${NC}    http://localhost:5173"
echo ""
echo -e "📝 进程信息："
echo -e "  ${GREEN}后端PID:${NC}     $BACKEND_PID"
echo -e "  ${GREEN}前端PID:${NC}     $ADMIN_PID"
echo ""
echo -e "📂 日志文件："
echo -e "  ${GREEN}后端日志:${NC}    $BACKEND_LOG"
echo -e "  ${GREEN}前端日志:${NC}    $ADMIN_LOG"
echo ""
echo -e "🛠️  管理命令："
echo -e "  ${YELLOW}查看状态:${NC}    ./status-dev-linux.sh"
echo -e "  ${YELLOW}停止服务:${NC}    ./stop-dev-linux.sh"
echo -e "  ${YELLOW}查看后端日志:${NC} tail -f $BACKEND_LOG"
echo -e "  ${YELLOW}查看前端日志:${NC} tail -f $ADMIN_LOG"
echo ""
