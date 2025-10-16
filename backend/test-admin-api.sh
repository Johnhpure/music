#!/bin/bash

# ============================================
# 管理接口测试脚本
# 需要管理员Token
# ============================================

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否提供了Token
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}错误: 需要设置ADMIN_TOKEN环境变量${NC}"
  echo ""
  echo "使用方法:"
  echo "  export ADMIN_TOKEN='your_jwt_token'"
  echo "  ./test-admin-api.sh"
  echo ""
  echo "或者:"
  echo "  ADMIN_TOKEN='your_jwt_token' ./test-admin-api.sh"
  echo ""
  exit 1
fi

echo "========================================"
echo "  API集成测试 - 管理接口"
echo "========================================"
echo -e "Token: ${YELLOW}${ADMIN_TOKEN:0:20}...${NC}"
echo ""

TOTAL=0
PASSED=0
FAILED=0

# 测试函数
test_admin_api() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=${5:-200}
  
  TOTAL=$((TOTAL + 1))
  echo -n "测试 $TOTAL: $name ... "
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      "$BASE_URL$url")
  else
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$url")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    # 显示部分响应数据
    if [ "$http_code" -eq 200 ]; then
      echo "   响应: $(echo "$body" | jq -c '{code, message}' 2>/dev/null || echo 'OK')"
    fi
    return 0
  else
    echo -e "${RED}✗ 失败${NC} (HTTP $http_code, 期望 $expected_status)"
    echo "   响应: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo "测试管理接口 (需要管理员权限)"
echo "========================================"
echo ""

# Banner管理接口
echo "【Banner管理模块】"
test_admin_api "获取Banner列表" "GET" "/admin/banner/list?page=1&pageSize=10"
test_admin_api "获取单个Banner" "GET" "/admin/banner/1"
echo ""

# PromptTemplate管理接口
echo "【提示词模板管理模块】"
test_admin_api "获取模板列表" "GET" "/admin/prompt-template/list?page=1&pageSize=10"
test_admin_api "获取单个模板" "GET" "/admin/prompt-template/1"
echo ""

# HotRecommendation管理接口
echo "【热门推荐管理模块】"
test_admin_api "获取推荐列表" "GET" "/admin/hot-recommendation/list?page=1&pageSize=10"
test_admin_api "获取单个推荐" "GET" "/admin/hot-recommendation/1"
echo ""

# 测试创建操作 (可选)
echo "【创建测试 (跳过以避免污染数据)】"
echo -e "${YELLOW}提示: 取消注释下面的代码来测试创建功能${NC}"
# test_admin_api "创建Banner" "POST" "/admin/banner" \
#   '{"title":"测试Banner","imageUrl":"http://example.com/test.jpg","linkUrl":"","linkType":"none","sortOrder":999}'
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
  echo ""
  echo "后续可以测试:"
  echo "  - 创建 (POST)"
  echo "  - 更新 (PATCH)"
  echo "  - 删除 (DELETE)"
  echo "  - 恢复 (POST /:id/restore)"
  echo "  - 切换状态 (POST /:id/toggle)"
  exit 0
else
  echo -e "${RED}✗ 部分测试失败${NC}"
  echo ""
  echo "可能的原因:"
  echo "  1. Token无效或已过期"
  echo "  2. 用户不是管理员角色"
  echo "  3. 数据库中没有对应的记录"
  exit 1
fi
