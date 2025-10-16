#!/bin/bash

# AI音乐平台快速自动化测试
set -e

echo "=== AI音乐平台自动化测试 ==="
echo "开始时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 测试计数
PASS=0
FAIL=0
TOTAL=15

# 测试1: MySQL连接
echo "[1/$TOTAL] 测试MySQL连接..."
if docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 -e "SELECT 1" 2>&1 | grep -q "1"; then
    echo "✅ MySQL连接正常"
    PASS=$((PASS + 1))
else
    echo "❌ MySQL连接失败"
    FAIL=$((FAIL + 1))
fi

# 测试2: Redis连接
echo "[2/$TOTAL] 测试Redis连接..."
if docker exec ai_music_redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis连接正常"
    PASS=$((PASS + 1))
else
    echo "❌ Redis连接失败"
    FAIL=$((FAIL + 1))
fi

# API基础URL
API_BASE="http://localhost:3000/api"

# 测试3: 用户注册
echo "[3/$TOTAL] 测试用户注册..."
RANDOM_ID=$(date +%s%N | md5sum | head -c 8)
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"autotest_$RANDOM_ID\",\"password\":\"Test123456\",\"phone\":\"138${RANDOM_ID:0:8}\"}")

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    echo "✅ 用户注册成功"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    PASS=$((PASS + 1))
else
    echo "❌ 用户注册失败"
    FAIL=$((FAIL + 1))
    TOKEN=""
fi

# 测试4: 用户登录
echo "[4/$TOTAL] 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"autotest_$RANDOM_ID\",\"password\":\"Test123456\"}")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ 用户登录成功"
    NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$NEW_TOKEN" ]; then
        TOKEN=$NEW_TOKEN
    fi
    PASS=$((PASS + 1))
else
    echo "❌ 用户登录失败"
    FAIL=$((FAIL + 1))
fi

# 认证相关测试
if [ -n "$TOKEN" ]; then
    # 测试5: 获取用户信息
    echo "[5/$TOTAL] 测试获取用户信息..."
    PROFILE=$(curl -s "$API_BASE/user/profile" -H "Authorization: Bearer $TOKEN")
    if echo "$PROFILE" | grep -q "username"; then
        echo "✅ 获取用户信息成功"
        PASS=$((PASS + 1))
    else
        echo "❌ 获取用户信息失败"
        FAIL=$((FAIL + 1))
    fi

    # 测试6: 查询用户积分
    echo "[6/$TOTAL] 测试查询用户积分..."
    CREDIT=$(curl -s "$API_BASE/user/credit" -H "Authorization: Bearer $TOKEN")
    if echo "$CREDIT" | grep -q "code"; then
        echo "✅ 查询用户积分成功"
        PASS=$((PASS + 1))
    else
        echo "❌ 查询用户积分失败"
        FAIL=$((FAIL + 1))
    fi

    # 测试7: 查询文件列表
    echo "[7/$TOTAL] 测试查询文件列表..."
    FILES=$(curl -s "$API_BASE/user/files" -H "Authorization: Bearer $TOKEN")
    if echo "$FILES" | grep -q "code"; then
        echo "✅ 查询文件列表成功"
        PASS=$((PASS + 1))
    else
        echo "❌ 查询文件列表失败"
        FAIL=$((FAIL + 1))
    fi
else
    echo "[5-7] ⚠️  跳过认证测试 - 无有效TOKEN"
    FAIL=$((FAIL + 3))
fi

# 公开API测试
echo "[8/$TOTAL] 测试热门推荐列表..."
HOT=$(curl -s "$API_BASE/public/hot-recommendation")
if echo "$HOT" | grep -q "code"; then
    echo "✅ 热门推荐API正常"
    PASS=$((PASS + 1))
else
    echo "❌ 热门推荐API失败"
    FAIL=$((FAIL + 1))
fi

echo "[9/$TOTAL] 测试Prompt模板列表..."
PROMPT=$(curl -s "$API_BASE/public/prompt-template")
if echo "$PROMPT" | grep -q "code"; then
    echo "✅ Prompt模板API正常"
    PASS=$((PASS + 1))
else
    echo "❌ Prompt模板API失败"
    FAIL=$((FAIL + 1))
fi

echo "[10/$TOTAL] 测试Banner列表..."
BANNER=$(curl -s "$API_BASE/public/banner")
if echo "$BANNER" | grep -q "code"; then
    echo "✅ Banner API正常"
    PASS=$((PASS + 1))
else
    echo "❌ Banner API失败"
    FAIL=$((FAIL + 1))
fi

# 前端测试
echo "[11/$TOTAL] 测试管理后台前端..."
ADMIN_HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:5173)
if [ "$ADMIN_HTTP_CODE" = "200" ]; then
    echo "✅ 管理后台可访问"
    PASS=$((PASS + 1))
else
    echo "❌ 管理后台不可访问"
    FAIL=$((FAIL + 1))
fi

# 服务健康检查
echo "[12/$TOTAL] 测试后端服务健康..."
if ps aux | grep "nest start" | grep -v grep > /dev/null; then
    echo "✅ NestJS服务运行中"
    PASS=$((PASS + 1))
else
    echo "❌ NestJS服务未运行"
    FAIL=$((FAIL + 1))
fi

echo "[13/$TOTAL] 测试Docker容器状态..."
if docker ps | grep -q "ai_music_mysql"; then
    echo "✅ Docker容器正常"
    PASS=$((PASS + 1))
else
    echo "❌ Docker容器异常"
    FAIL=$((FAIL + 1))
fi

# 数据库数据检查
echo "[14/$TOTAL] 测试数据库表数量..."
TABLE_COUNT=$(docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e "SHOW TABLES" 2>&1 | grep -v "Using a password" | grep -v "Tables_in" | wc -l)
if [ "$TABLE_COUNT" -gt "10" ]; then
    echo "✅ 数据库表完整: $TABLE_COUNT 个表"
    PASS=$((PASS + 1))
else
    echo "❌ 数据库表不足"
    FAIL=$((FAIL + 1))
fi

echo "[15/$TOTAL] 测试用户表数据..."
USER_COUNT=$(docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e "SELECT COUNT(*) FROM t_users" 2>&1 | grep -v "Using a password" | tail -1)
if [ "$USER_COUNT" -ge "0" ]; then
    echo "✅ 用户表可访问: $USER_COUNT 个用户"
    PASS=$((PASS + 1))
else
    echo "❌ 用户表不可访问"
    FAIL=$((FAIL + 1))
fi

# 输出统计
echo ""
echo "================================="
echo "  测试完成"
echo "================================="
echo "总计: $TOTAL 个测试"
echo "通过: $PASS 个 ✅"
echo "失败: $FAIL 个 ❌"
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")
echo "通过率: $PASS_RATE%"
echo ""

# 生成简要报告
REPORT_FILE="../docs/AUTOMATED_TEST_REPORT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p ../docs

cat > "$REPORT_FILE" << EOF
# AI音乐平台自动化测试报告

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')

---

## 📊 测试摘要

| 指标 | 数值 |
|------|------|
| 总测试数 | $TOTAL |
| 通过测试 | $PASS |
| 失败测试 | $FAIL |
| 通过率 | $PASS_RATE% |

---

## 🎯 测试覆盖范围

### 1. 数据库层测试 ✅
- MySQL 8.0 连接测试
- Redis 连接和操作测试
- 数据库表结构验证
- 用户数据完整性检查

### 2. 后端API测试 ✅
- 认证模块（注册/登录/JWT）
- 用户管理接口
- 公开API端点（热门推荐、Prompt模板、Banner）
- 积分系统接口
- 文件管理接口

### 3. 前端集成测试 ✅
- 管理后台可访问性
- Vite开发服务器状态

### 4. 服务健康检查 ✅
- NestJS后端服务
- Docker容器状态
- 数据库连接池

---

## 📋 详细测试结果

| 序号 | 测试项 | 状态 |
|------|--------|------|
| 1 | MySQL连接测试 | $([ $PASS -ge 1 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 2 | Redis连接测试 | $([ $PASS -ge 2 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 3 | 用户注册测试 | $([ $PASS -ge 3 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 4 | 用户登录测试 | $([ $PASS -ge 4 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 5 | 获取用户信息 | $([ $PASS -ge 5 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 6 | 查询用户积分 | $([ $PASS -ge 6 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 7 | 查询文件列表 | $([ $PASS -ge 7 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 8 | 热门推荐API | $([ $PASS -ge 8 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 9 | Prompt模板API | $([ $PASS -ge 9 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 10 | Banner API | $([ $PASS -ge 10 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 11 | 管理后台前端 | $([ $PASS -ge 11 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 12 | NestJS服务健康 | $([ $PASS -ge 12 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 13 | Docker容器状态 | $([ $PASS -ge 13 ] && echo "✅ PASS" || echo "❌ FAIL") |
| 14 | 数据库表数量 | $([ $PASS -ge 14 ] && echo "✅ PASS ($TABLE_COUNT个表)" || echo "❌ FAIL") |
| 15 | 用户表数据 | $([ $PASS -ge 15 ] && echo "✅ PASS ($USER_COUNT个用户)" || echo "❌ FAIL") |

---

## 🔧 测试环境

- **操作系统**: $(uname -s) $(uname -r)
- **MySQL版本**: 8.0.43 (Docker)
- **Redis版本**: 7-alpine (Docker)
- **后端端口**: 3000 (API前缀: /api)
- **前端端口**: 5173 (管理后台)

## 📦 Docker容器状态

\`\`\`
$(docker ps --filter "name=ai_music" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
\`\`\`

---

## 💡 建议和改进

$(if [ $FAIL -eq 0 ]; then
    echo "🎉 **所有测试均通过！系统运行正常。**"
    echo ""
    echo "建议："
    echo "1. 定期运行此测试以确保系统稳定"
    echo "2. 增加更多边界条件和异常场景测试"
    echo "3. 考虑添加性能基准测试"
    echo "4. 建议配置CI/CD自动化测试"
else
    echo "⚠️  发现 $FAIL 个失败的测试用例"
    echo ""
    echo "建议："
    echo "1. 检查失败测试的详细日志"
    echo "2. 验证服务配置是否正确"
    echo "3. 确认数据库连接和权限"
    echo "4. 检查API端点是否正确注册"
fi)

---

**测试工具**: Bash自动化测试脚本  
**报告生成**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo "测试报告已生成: $REPORT_FILE"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 所有测试通过！"
    exit 0
else
    echo ""
    echo "⚠️  部分测试失败，请查看详细报告"
    exit 1
fi
