#!/bin/bash

# ============================================
# API集成测试脚本
# 测试三层路由架构的所有公开接口
# ============================================

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "  API集成测试 - 公开接口"
echo "========================================"
echo ""

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_api() {
  local name=$1
  local url=$2
  local expected_status=${3:-200}
  
  TOTAL=$((TOTAL + 1))
  echo -n "测试 $TOTAL: $name ... "
  
  response=$(curl -s -w "\n%{http_code}" "$BASE_URL$url")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq "$expected_status" ]; then
    # 检查是否有data字段或者是成功响应
    if echo "$body" | jq -e '.data' > /dev/null 2>&1 || echo "$body" | jq -e '.code' > /dev/null 2>&1; then
      echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
      PASSED=$((PASSED + 1))
      return 0
    else
      echo -e "${RED}✗ 失败${NC} (响应格式错误)"
      FAILED=$((FAILED + 1))
      return 1
    fi
  else
    echo -e "${RED}✗ 失败${NC} (HTTP $http_code, 期望 $expected_status)"
    echo "   响应: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo "测试公开接口 (无需认证)"
echo "========================================"
echo ""

# Banner接口测试
echo "【Banner模块】"
test_api "获取Banner列表" "/public/banner/list"
echo ""

# PromptTemplate接口测试
echo "【提示词模板模块】"
test_api "获取模板列表" "/public/prompt-template/list"
test_api "获取模板分类" "/public/prompt-template/categories"
echo ""

# HotRecommendation接口测试
echo "【热门推荐模块】"
test_api "获取推荐列表" "/public/hot-recommendation/list"
test_api "获取推荐分类" "/public/hot-recommendation/categories"
echo ""

# 健康检查
echo "【系统健康检查】"
test_api "健康检查" "/health" 404
echo ""

echo "========================================"
echo "  测试结果统计"
echo "========================================"
echo -e "总计: $TOTAL"
echo -e "${GREEN}通过: $PASSED${NC}"
echo -e "${RED}失败: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ 所有测试通过！${NC}"
  exit 0
else
  echo -e "${RED}✗ 部分测试失败${NC}"
  exit 1
fi
