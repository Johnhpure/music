#!/bin/bash

# AI多模型系统安装脚本
# 用于快速部署AI模型集成系统

set -e  # 遇到错误立即退出

echo "=================================="
echo "AI多模型系统安装程序"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "${YELLOW}[1/6]${NC} 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js未安装${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js版本: $NODE_VERSION"
echo ""

# 检查MySQL
echo -e "${YELLOW}[2/6]${NC} 检查MySQL连接..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}错误: MySQL客户端未安装${NC}"
    exit 1
fi

# 从.env读取数据库配置
if [ -f .env ]; then
    export $(cat .env | grep -E '^DB_' | xargs)
else
    echo -e "${RED}错误: .env文件不存在${NC}"
    exit 1
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-music_platform}
DB_USERNAME=${DB_USERNAME:-root}

echo -e "${GREEN}✓${NC} 数据库配置:"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  User: $DB_USERNAME"
echo ""

# 检查npm依赖
echo -e "${YELLOW}[3/6]${NC} 检查npm依赖..."

OPENAI_INSTALLED=$(npm list openai 2>/dev/null | grep openai || echo "")
ANTHROPIC_INSTALLED=$(npm list @anthropic-ai/sdk 2>/dev/null | grep @anthropic-ai/sdk || echo "")

if [ -z "$OPENAI_INSTALLED" ] || [ -z "$ANTHROPIC_INSTALLED" ]; then
    echo -e "${YELLOW}⚠${NC} 缺少依赖，正在安装..."
    npm install openai @anthropic-ai/sdk
    echo -e "${GREEN}✓${NC} 依赖安装完成"
else
    echo -e "${GREEN}✓${NC} 依赖已安装"
    echo "  - openai: $(echo $OPENAI_INSTALLED | grep -oP 'openai@\K[0-9.]+')"
    echo "  - @anthropic-ai/sdk: $(echo $ANTHROPIC_INSTALLED | grep -oP '@anthropic-ai/sdk@\K[0-9.]+')"
fi
echo ""

# 数据库迁移
echo -e "${YELLOW}[4/6]${NC} 执行数据库迁移..."

# 检查表是否已存在
TABLE_EXISTS=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    -e "SHOW TABLES LIKE 't_ai_providers';" 2>/dev/null | grep t_ai_providers || echo "")

if [ -n "$TABLE_EXISTS" ]; then
    echo -e "${YELLOW}⚠${NC} 表已存在，是否要重新创建? (y/N): "
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "  删除现有表..."
        mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
            -e "DROP TABLE IF EXISTS t_ai_usage_stats, t_ai_api_logs, t_ai_models, t_ai_api_keys, t_ai_providers;"
    else
        echo -e "${YELLOW}⚠${NC} 跳过表创建"
        echo ""
        echo -e "${YELLOW}[5/6]${NC} 跳过seed数据"
        echo ""
        echo -e "${YELLOW}[6/6]${NC} 跳过验证"
        echo ""
        echo -e "${GREEN}=================================="
        echo -e "安装取消"
        echo -e "==================================${NC}"
        exit 0
    fi
fi

echo "  创建表结构..."
mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    < src/database/migrations/07-create-ai-models-system.sql

echo -e "${GREEN}✓${NC} 表创建成功"
echo ""

# 插入初始数据
echo -e "${YELLOW}[5/6]${NC} 插入初始数据..."
mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    < src/database/seeds/04-insert-ai-providers.sql

echo -e "${GREEN}✓${NC} 初始数据插入完成"
echo ""

# 验证安装
echo -e "${YELLOW}[6/6]${NC} 验证安装..."

PROVIDER_COUNT=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    -se "SELECT COUNT(*) FROM t_ai_providers;")
MODEL_COUNT=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    -se "SELECT COUNT(*) FROM t_ai_models;")
KEY_COUNT=$(mysql -h$DB_HOST -P$DB_PORT -u$DB_USERNAME -p$DB_PASSWORD -D$DB_DATABASE \
    -se "SELECT COUNT(*) FROM t_ai_api_keys;")

echo -e "${GREEN}✓${NC} 验证结果:"
echo "  - AI Providers: $PROVIDER_COUNT"
echo "  - AI Models: $MODEL_COUNT"
echo "  - API Keys: $KEY_COUNT"
echo ""

# 安装完成
echo -e "${GREEN}=================================="
echo -e "✨ 安装成功! ✨"
echo -e "==================================${NC}"
echo ""
echo "下一步:"
echo "  1. 通过管理API添加API Keys"
echo "  2. 在app.module.ts中导入AIModelsModule"
echo "  3. 重启应用"
echo ""
echo "文档:"
echo "  - 快速开始: backend/AI_MODELS_README.md"
echo "  - 完整指南: docs/devdoc/AI_MODELS_INTEGRATION_GUIDE.md"
echo "  - 部署指南: backend/AI_MODELS_DEPLOYMENT.md"
echo ""
echo -e "${YELLOW}⚠ 重要: 请及时添加真实的API Keys!${NC}"
echo ""
