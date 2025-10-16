#!/bin/bash

# 管理后台测试环境启动脚本

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  启动管理后台测试环境${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 检查端口5174是否被占用
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  端口5174已被占用，正在停止...${NC}"
    kill $(lsof -t -i:5174) 2>/dev/null || true
    sleep 2
fi

echo -e "${GREEN}✅ 启动测试环境...${NC}"
echo -e "${GREEN}   端口: 5174${NC}"
echo -e "${GREEN}   API: $(grep VITE_API_BASE_URL .env.test | cut -d= -f2)${NC}"
echo ""

pnpm run test
