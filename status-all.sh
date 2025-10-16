#!/bin/bash

# 音乐平台统一状态查看脚本
# 查看所有服务运行状态

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

LOG_DIR="/tmp/music-platform"
PROJECT_ROOT="/home/chenbang/app/music/musicdev/music"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  音乐平台开发环境状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检测当前配置模式
echo -e "${CYAN}📋 当前配置模式：${NC}"
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
    if grep -q "HOST=0.0.0.0" "$PROJECT_ROOT/backend/.env" 2>/dev/null; then
        echo -e "  ${GREEN}局域网模式 (LAN)${NC}"
        echo -e "  访问地址: http://192.168.1.118:xxxx"
    elif grep -q "HOST=localhost" "$PROJECT_ROOT/backend/.env" 2>/dev/null; then
        echo -e "  ${GREEN}本地模式 (LOCAL)${NC}"
        echo -e "  访问地址: http://localhost:xxxx"
    else
        echo -e "  ${YELLOW}未知模式${NC}"
    fi
else
    echo -e "  ${RED}未配置${NC}"
fi
echo ""

# 检查后端
echo -e "${CYAN}🔧 后端服务 (端口3000):${NC}"
BACKEND_RUNNING=false
if [ -f "$LOG_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        BACKEND_RUNNING=true
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo -e "  PID:  ${GREEN}$BACKEND_PID${NC}"
        
        # 检测监听地址
        if lsof -p $BACKEND_PID -a -i:3000 -sTCP:LISTEN 2>/dev/null | grep -q "\*:3000"; then
            echo -e "  监听: ${GREEN}0.0.0.0:3000 (局域网可访问)${NC}"
            echo -e "  局域网: http://192.168.1.118:3000"
            echo -e "  本机:   http://localhost:3000"
        else
            echo -e "  监听: ${GREEN}localhost:3000 (仅本机)${NC}"
            echo -e "  本机:   http://localhost:3000"
        fi
        echo -e "  API文档: http://localhost:3000/api/docs"
    else
        echo -e "  状态: ${RED}❌ 已停止 (PID文件存在但进程不存在)${NC}"
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
echo -e "${CYAN}🎨 管理后台 (端口5173/5174):${NC}"
ADMIN_RUNNING=false
if [ -f "$LOG_DIR/admin.pid" ]; then
    ADMIN_PID=$(cat "$LOG_DIR/admin.pid")
    if ps -p $ADMIN_PID > /dev/null 2>&1; then
        ADMIN_RUNNING=true
        echo -e "  状态: ${GREEN}✅ 运行中${NC}"
        echo -e "  PID:  ${GREEN}$ADMIN_PID${NC}"
        
        # 检测端口
        if lsof -p $ADMIN_PID -a -i:5173 2>/dev/null | grep -q ":5173"; then
            if lsof -p $ADMIN_PID -a -i:5173 -sTCP:LISTEN 2>/dev/null | grep -q "\*:5173"; then
                echo -e "  监听: ${GREEN}0.0.0.0:5173 (局域网可访问)${NC}"
                echo -e "  局域网: http://192.168.1.118:5173"
                echo -e "  本机:   http://localhost:5173"
            else
                echo -e "  监听: ${GREEN}localhost:5173 (仅本机)${NC}"
                echo -e "  本机:   http://localhost:5173"
            fi
        elif lsof -p $ADMIN_PID -a -i:5174 2>/dev/null | grep -q ":5174"; then
            echo -e "  监听: ${GREEN}localhost:5174 (测试模式)${NC}"
            echo -e "  本机:   http://localhost:5174"
        fi
    else
        echo -e "  状态: ${RED}❌ 已停止 (PID文件存在但进程不存在)${NC}"
    fi
else
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  状态: ${YELLOW}⚠️  端口5173被占用但无PID文件${NC}"
        echo -e "  占用进程: $(lsof -t -i:5173)"
    elif lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "  状态: ${YELLOW}⚠️  端口5174被占用但无PID文件${NC}"
        echo -e "  占用进程: $(lsof -t -i:5174)"
    else
        echo -e "  状态: ${RED}❌ 未运行${NC}"
    fi
fi
echo ""

# 检查数据库
echo -e "${CYAN}🗄️  数据库连接:${NC}"
cd "$PROJECT_ROOT/backend"
if node test-db-connection.js > /dev/null 2>&1; then
    echo -e "  状态: ${GREEN}✅ 连接正常${NC}"
    echo -e "  主机: rm-bp1s2o0qzqdwdif9nko.mysql.rds.aliyuncs.com"
    echo -e "  数据库: music"
else
    echo -e "  状态: ${RED}❌ 连接失败${NC}"
fi
echo ""

# 日志文件
echo -e "${CYAN}📂 日志文件:${NC}"
if [ -f "$LOG_DIR/backend.log" ]; then
    BACKEND_LOG_SIZE=$(du -h "$LOG_DIR/backend.log" | cut -f1)
    echo -e "  后端: ${GREEN}$LOG_DIR/backend.log${NC} (${BACKEND_LOG_SIZE})"
else
    echo -e "  后端: ${YELLOW}不存在${NC}"
fi

if [ -f "$LOG_DIR/admin.log" ]; then
    ADMIN_LOG_SIZE=$(du -h "$LOG_DIR/admin.log" | cut -f1)
    echo -e "  前端: ${GREEN}$LOG_DIR/admin.log${NC} (${ADMIN_LOG_SIZE})"
else
    echo -e "  前端: ${YELLOW}不存在${NC}"
fi
echo ""

# 总结
echo -e "${BLUE}========================================${NC}"
if [ "$BACKEND_RUNNING" = true ] && [ "$ADMIN_RUNNING" = true ]; then
    echo -e "${GREEN}✅ 所有服务运行正常${NC}"
elif [ "$BACKEND_RUNNING" = true ] || [ "$ADMIN_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠️  部分服务运行中${NC}"
else
    echo -e "${RED}❌ 所有服务已停止${NC}"
fi
echo -e "${BLUE}========================================${NC}"
echo ""

# 提示
if [ "$BACKEND_RUNNING" = true ] && [ "$ADMIN_RUNNING" = true ]; then
    echo -e "${CYAN}💡 管理命令：${NC}"
    echo -e "  查看后端日志: ${YELLOW}tail -f $LOG_DIR/backend.log${NC}"
    echo -e "  查看前端日志: ${YELLOW}tail -f $LOG_DIR/admin.log${NC}"
    echo -e "  停止所有服务: ${YELLOW}./stop-all.sh${NC}"
    echo ""
else
    echo -e "${CYAN}💡 启动服务：${NC}"
    echo -e "  局域网模式: ${YELLOW}./start-lan.sh${NC}"
    echo -e "  本地模式:   ${YELLOW}./start-local.sh${NC}"
    echo ""
fi
