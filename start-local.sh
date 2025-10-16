#!/bin/bash

# 音乐平台本地开发环境启动脚本
# 场景：办公室电脑本地开发，仅localhost访问
# 功能：启动后端API服务和管理后台，仅支持本机访问

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目配置
PROJECT_ROOT="/home/chenbang/app/music/musicdev/music"
BACKEND_DIR="$PROJECT_ROOT/backend"
ADMIN_DIR="$PROJECT_ROOT/admin"
MINIPROGRAM_DIR="$PROJECT_ROOT/miniprogram"
LOG_DIR="/tmp/music-platform"

mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台本地开发环境启动${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}📍 场景：本机开发，localhost访问${NC}"
echo ""

# 1. 检查环境
echo -e "${YELLOW}[1/5] 检查运行环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
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

# 2. 配置本地环境
echo -e "${YELLOW}[2/5] 配置本地环境...${NC}"

# 后端配置
if [ -f "$BACKEND_DIR/.env.local" ]; then
    cp "$BACKEND_DIR/.env.local" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✅ 后端配置已切换到本地模式${NC}"
else
    echo -e "${RED}❌ 找不到 backend/.env.local${NC}"
    exit 1
fi

# 前端配置
if [ -f "$ADMIN_DIR/.env.local" ]; then
    cp "$ADMIN_DIR/.env.local" "$ADMIN_DIR/.env"
    cp "$ADMIN_DIR/.env.local" "$ADMIN_DIR/.env.development"
    echo -e "${GREEN}✅ 前端配置已切换到本地模式${NC}"
else
    echo -e "${RED}❌ 找不到 admin/.env.local${NC}"
    exit 1
fi

# 小程序配置
if [ -f "$MINIPROGRAM_DIR/config/index.local.js" ]; then
    cp "$MINIPROGRAM_DIR/config/index.local.js" "$MINIPROGRAM_DIR/config/index.js"
    echo -e "${GREEN}✅ 小程序配置已切换到本地模式${NC}"
else
    echo -e "${RED}❌ 找不到 miniprogram/config/index.local.js${NC}"
    exit 1
fi

echo ""

# 3. 测试数据库连接
echo -e "${YELLOW}[3/5] 测试数据库连接...${NC}"
cd "$BACKEND_DIR"
if node test-db-connection.js > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo -e "${YELLOW}提示: 请检查数据库配置或网络连接${NC}"
    exit 1
fi
echo ""

# 4. 启动后端服务
echo -e "${YELLOW}[4/5] 启动后端服务...${NC}"

cd "$BACKEND_DIR"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装后端依赖...${NC}"
    npm install
fi

# 停止已存在的后端服务
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口3000已被占用，停止现有服务...${NC}"
    kill $(lsof -t -i:3000) 2>/dev/null || true
    sleep 2
fi

# 启动后端
echo -e "${YELLOW}   启动后端服务（监听 localhost:3000）...${NC}"
nohup npm run start:dev > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$LOG_DIR/backend.pid"

# 等待后端启动
sleep 5

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ 后端服务启动失败${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $LOG_DIR/backend.log${NC}"
    exit 1
fi
echo ""

# 5. 启动管理后台
echo -e "${YELLOW}[5/5] 启动管理后台...${NC}"

cd "$ADMIN_DIR"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   安装前端依赖...${NC}"
    pnpm install
fi

# 停止已存在的前端服务
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口5173已被占用，停止现有服务...${NC}"
    kill $(lsof -t -i:5173) 2>/dev/null || true
    sleep 2
fi

# 启动前端（本地模式）
echo -e "${YELLOW}   启动管理后台（监听 localhost:5173）...${NC}"
nohup pnpm run dev > "$LOG_DIR/admin.log" 2>&1 &
ADMIN_PID=$!
echo $ADMIN_PID > "$LOG_DIR/admin.pid"

# 等待前端启动
sleep 3

if ps -p $ADMIN_PID > /dev/null; then
    echo -e "${GREEN}✅ 管理后台启动成功 (PID: $ADMIN_PID)${NC}"
else
    echo -e "${RED}❌ 管理后台启动失败${NC}"
    echo -e "${YELLOW}   查看日志: tail -f $LOG_DIR/admin.log${NC}"
    exit 1
fi
echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ 本地开发环境启动完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "📋 ${CYAN}服务信息：${NC}"
echo -e "  ${GREEN}后端API:${NC}     http://localhost:3000"
echo -e "  ${GREEN}API文档:${NC}     http://localhost:3000/api/docs"
echo -e "  ${GREEN}管理后台:${NC}    http://localhost:5173"
echo ""
echo -e "📝 ${CYAN}进程信息：${NC}"
echo -e "  ${GREEN}后端PID:${NC}     $BACKEND_PID"
echo -e "  ${GREEN}前端PID:${NC}     $ADMIN_PID"
echo ""
echo -e "📂 ${CYAN}日志文件：${NC}"
echo -e "  ${GREEN}后端日志:${NC}    $LOG_DIR/backend.log"
echo -e "  ${GREEN}前端日志:${NC}    $LOG_DIR/admin.log"
echo ""
echo -e "🔧 ${CYAN}小程序开发：${NC}"
echo -e "  ${YELLOW}1. 使用HBuilderX打开 miniprogram 目录${NC}"
echo -e "  ${YELLOW}2. 运行到微信开发者工具${NC}"
echo -e "  ${YELLOW}3. 小程序会自动连接到 http://localhost:3000/api${NC}"
echo ""
echo -e "🛠️  ${CYAN}管理命令：${NC}"
echo -e "  ${YELLOW}停止服务:${NC}     ./stop-all.sh"
echo -e "  ${YELLOW}查看状态:${NC}     ./status-all.sh"
echo -e "  ${YELLOW}查看后端日志:${NC}  tail -f $LOG_DIR/backend.log"
echo -e "  ${YELLOW}查看前端日志:${NC}  tail -f $LOG_DIR/admin.log"
echo ""
