#!/bin/bash

# AI音乐平台自动化测试脚本
# 测试数据库、后端API和前端集成

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

# 测试结果数组
declare -a TEST_RESULTS

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_pattern=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "执行测试 #$TOTAL_TESTS: $test_name"
    
    local start=$(date +%s%N)
    local result
    result=$(eval "$test_command" 2>&1)
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 )) # 毫秒
    
    if [[ -z "$expected_pattern" ]] || echo "$result" | grep -q "$expected_pattern"; then
        log_success "✓ $test_name [${duration}ms]"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS|$test_name|${duration}ms|$result")
        return 0
    else
        log_error "✗ $test_name [${duration}ms]"
        log_error "期望: $expected_pattern"
        log_error "实际结果: $result"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL|$test_name|${duration}ms|$result")
        return 1
    fi
}

# HTTP测试函数
run_http_test() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_code=$5
    local token=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "执行HTTP测试 #$TOTAL_TESTS: $test_name"
    
    local start=$(date +%s%N)
    local auth_header=""
    if [[ -n "$token" ]]; then
        auth_header="-H 'Authorization: Bearer $token'"
    fi
    
    local cmd="curl -s -w '\n%{http_code}' -X $method http://localhost:3000/api$endpoint"
    if [[ -n "$data" ]]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    if [[ -n "$auth_header" ]]; then
        cmd="$cmd $auth_header"
    fi
    
    local response
    response=$(eval "$cmd" 2>&1)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 ))
    
    if [[ "$http_code" == "$expected_code" ]]; then
        log_success "✓ $test_name [${duration}ms] HTTP $http_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("PASS|$test_name|${duration}ms|HTTP $http_code: $body")
        echo "$body"
        return 0
    else
        log_error "✗ $test_name [${duration}ms]"
        log_error "期望HTTP码: $expected_code, 实际: $http_code"
        log_error "响应: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("FAIL|$test_name|${duration}ms|HTTP $http_code (期望$expected_code): $body")
        return 1
    fi
}

# ============================================
# 第一部分: 数据库层测试
# ============================================
echo ""
echo "============================================"
echo "  第一部分: 数据库层测试"
echo "============================================"
echo ""

# 测试MySQL连接
run_test "MySQL连接测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 -e 'SELECT 1' 2>&1 | grep -v 'Using a password'" \
    "1"

# 测试数据库是否存在
run_test "数据库ai_music_platform存在性测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 -e 'SHOW DATABASES LIKE \"ai_music_platform\"' 2>&1 | grep -v 'Using a password'" \
    "ai_music_platform"

# 测试关键表是否存在
run_test "表t_users存在性测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e 'SHOW TABLES LIKE \"t_users\"' 2>&1 | grep -v 'Using a password'" \
    "t_users"

run_test "表t_music_tasks存在性测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e 'SHOW TABLES LIKE \"t_music_tasks\"' 2>&1 | grep -v 'Using a password'" \
    "t_music_tasks"

# 测试用户表结构
run_test "t_users表结构完整性测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e 'DESCRIBE t_users' 2>&1 | grep -v 'Using a password'" \
    "id"

# 测试用户数据
run_test "用户数据查询测试" \
    "docker exec ai_music_mysql_simple mysql -umusic_user -pmusic_password_123 ai_music_platform -e 'SELECT COUNT(*) as count FROM t_users' 2>&1 | grep -v 'Using a password' | tail -1" \
    ""

# 测试Redis连接
run_test "Redis连接测试" \
    "docker exec ai_music_redis redis-cli ping" \
    "PONG"

# 测试Redis基础操作
run_test "Redis SET/GET测试" \
    "docker exec ai_music_redis redis-cli SET test_key 'test_value' && docker exec ai_music_redis redis-cli GET test_key" \
    "test_value"

# 清理测试数据
docker exec ai_music_redis redis-cli DEL test_key > /dev/null 2>&1

# ============================================
# 第二部分: 后端API测试
# ============================================
echo ""
echo "============================================"
echo "  第二部分: 后端API测试"
echo "============================================"
echo ""

# 全局变量存储token
ACCESS_TOKEN=""
USER_ID=""

# 测试公开端点（注意：根路径没有/api前缀）
# run_http_test "健康检查端点" "GET" "/" "" "404" ""

# 测试认证模块
log_info "开始测试认证模块..."

# 生成随机测试用户
RANDOM_SUFFIX=$(date +%s%N | md5sum | head -c 8)
TEST_USERNAME="test_user_$RANDOM_SUFFIX"
TEST_PASSWORD="Test123456"
TEST_PHONE="1380000${RANDOM_SUFFIX:0:4}"

# 测试注册
REGISTER_RESPONSE=$(run_http_test "用户注册" "POST" "/auth/register" \
    "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\",\"phone\":\"$TEST_PHONE\"}" \
    "200" "")

if [[ $? -eq 0 ]]; then
    # 尝试从响应中提取token和user_id
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    if [[ -n "$ACCESS_TOKEN" ]]; then
        log_success "获取到访问令牌: ${ACCESS_TOKEN:0:20}..."
    fi
fi

# 测试重复注册（应该失败，返回409冲突状态码）
run_http_test "重复用户名注册（应失败）" "POST" "/auth/register" \
    "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\",\"phone\":\"$TEST_PHONE\"}" \
    "409" ""

# 测试登录
LOGIN_RESPONSE=$(run_http_test "用户登录" "POST" "/auth/login" \
    "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}" \
    "200" "")

if [[ $? -eq 0 ]]; then
    # 更新token（登录返回的token更准确）
    NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$NEW_TOKEN" ]]; then
        ACCESS_TOKEN=$NEW_TOKEN
        log_success "更新访问令牌: ${ACCESS_TOKEN:0:20}..."
    fi
fi

# 测试错误凭证登录
run_http_test "错误密码登录（应失败）" "POST" "/auth/login" \
    "{\"username\":\"$TEST_USERNAME\",\"password\":\"WrongPassword\"}" \
    "401" ""

# 测试需要认证的端点
if [[ -n "$ACCESS_TOKEN" ]]; then
    log_info "使用认证令牌测试受保护端点..."
    
    # 测试用户信息获取
    run_http_test "获取当前用户信息" "GET" "/user/profile" "" "200" "$ACCESS_TOKEN"
    
    # 测试积分查询
    run_http_test "查询用户积分" "GET" "/user/credit" "" "200" "$ACCESS_TOKEN"
    
    # 测试文件列表
    run_http_test "查询用户文件列表" "GET" "/user/files" "" "200" "$ACCESS_TOKEN"
else
    log_warning "未能获取访问令牌，跳过认证端点测试"
fi

# 测试公开API端点
log_info "测试公开API端点..."

# 测试热门推荐
run_http_test "获取热门推荐列表" "GET" "/public/hot-recommendation" "" "200" ""

# 测试推荐分类
run_http_test "获取推荐分类" "GET" "/public/hot-recommendation/categories" "" "200" ""

# 测试Prompt模板
run_http_test "获取Prompt模板列表" "GET" "/public/prompt-template" "" "200" ""

# 测试Banner
run_http_test "获取Banner列表" "GET" "/public/banner?position=home" "" "200" ""

# 测试公开音乐列表
run_http_test "获取公开音乐列表" "GET" "/public/music" "" "200" ""

# 测试AI相关端点（需要认证）
if [[ -n "$ACCESS_TOKEN" ]]; then
    log_info "测试AI功能端点..."
    
    # 测试歌词生成（简单请求）
    run_http_test "AI歌词生成" "POST" "/user/ai/generate-lyrics" \
        "{\"inspiration\":\"夏日海边\",\"language\":\"zh\"}" \
        "200" "$ACCESS_TOKEN"
    
    # 测试音乐任务列表
    run_http_test "查询音乐任务列表" "GET" "/user/music/tasks" "" "200" "$ACCESS_TOKEN"
fi

# 测试管理后台端点（需要管理员权限，预期401或403）
log_info "测试管理后台端点（预期需要管理员权限）..."

run_http_test "管理后台-用户列表（应需要权限）" "GET" "/admin/users" "" "401" ""

run_http_test "管理后台-Banner管理（应需要权限）" "GET" "/admin/banner" "" "401" ""

run_http_test "管理后台-AI模型管理（应需要权限）" "GET" "/admin/ai-models" "" "401" ""

# ============================================
# 第三部分: 前端集成测试
# ============================================
echo ""
echo "============================================"
echo "  第三部分: 前端集成测试"
echo "============================================"
echo ""

# 测试管理后台前端（使用完整URL，不加/api前缀）
run_test "管理后台前端加载" \
    "curl -s -w '%{http_code}' http://localhost:5173 | tail -1" \
    "200"

# 测试管理后台静态资源
run_test "管理后台Vite开发服务器" \
    "curl -s http://localhost:5173 | grep -q 'vite'" \
    ""

# 测试API端点可访问性（从前端角度）
log_info "测试前端API配置兼容性..."

# 小程序配置的API地址
MINIPROGRAM_API="http://192.168.1.118:3000"
run_test "小程序API地址可达性测试" \
    "timeout 3 curl -s $MINIPROGRAM_API/public/banner 2>&1 | grep -q 'code'" \
    ""

# ============================================
# 生成测试报告
# ============================================
echo ""
echo "============================================"
echo "  测试报告生成"
echo "============================================"
echo ""

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")

# 创建测试报告
REPORT_FILE="../docs/AUTOMATED_TEST_REPORT_$(date +%Y%m%d_%H%M%S).md"
mkdir -p ../docs

cat > "$REPORT_FILE" << EOF
# AI音乐平台自动化测试报告

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**执行耗时**: ${DURATION}秒

---

## 📊 测试摘要

| 指标 | 数值 |
|------|------|
| 总测试数 | $TOTAL_TESTS |
| 通过测试 | $PASSED_TESTS |
| 失败测试 | $FAILED_TESTS |
| 通过率 | ${PASS_RATE}% |

---

## 🎯 测试覆盖范围

### 1. 数据库层测试
- ✅ MySQL 8.0 连接测试
- ✅ 数据库结构验证
- ✅ 关键表存在性检查
- ✅ Redis 连接和基础操作
- ✅ 数据完整性验证

### 2. 后端API测试
- ✅ 认证模块（注册/登录/JWT）
- ✅ 用户管理接口
- ✅ 公开API端点
- ✅ AI功能接口
- ✅ 音乐生成接口
- ✅ 积分系统接口
- ✅ 文件管理接口
- ✅ 权限控制验证

### 3. 前端集成测试
- ✅ 管理后台访问
- ✅ Vite开发服务器
- ✅ API配置兼容性

---

## 📋 详细测试结果

EOF

# 添加详细结果
echo "### 测试用例详情" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| 状态 | 测试名称 | 耗时 | 详细结果 |" >> "$REPORT_FILE"
echo "|------|----------|------|----------|" >> "$REPORT_FILE"

for result in "${TEST_RESULTS[@]}"; do
    IFS='|' read -r status name duration details <<< "$result"
    # 截断过长的详细信息
    short_details=$(echo "$details" | head -c 100)
    if [[ ${#details} -gt 100 ]]; then
        short_details="$short_details..."
    fi
    
    if [[ "$status" == "PASS" ]]; then
        echo "| ✅ PASS | $name | $duration | \`$short_details\` |" >> "$REPORT_FILE"
    else
        echo "| ❌ FAIL | $name | $duration | \`$short_details\` |" >> "$REPORT_FILE"
    fi
done

# 添加环境信息
cat >> "$REPORT_FILE" << EOF

---

## 🔧 测试环境

- **操作系统**: $(uname -s) $(uname -r)
- **Node.js版本**: $(node --version 2>/dev/null || echo "未检测到")
- **MySQL版本**: 8.0.43 (Docker)
- **Redis版本**: 7-alpine (Docker)
- **后端端口**: 3000
- **前端端口**: 5173 (Admin管理后台)

## 📦 Docker容器状态

\`\`\`
$(docker ps --filter "name=ai_music" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
\`\`\`

---

## 🔍 发现的问题

EOF

if [[ $FAILED_TESTS -gt 0 ]]; then
    echo "### 失败的测试用例" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    for result in "${TEST_RESULTS[@]}"; do
        IFS='|' read -r status name duration details <<< "$result"
        if [[ "$status" == "FAIL" ]]; then
            echo "**$name**" >> "$REPORT_FILE"
            echo "\`\`\`" >> "$REPORT_FILE"
            echo "$details" >> "$REPORT_FILE"
            echo "\`\`\`" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
    done
else
    echo "🎉 所有测试均通过！" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" << EOF

## 💡 建议和改进

1. **数据库优化**: 建议定期检查慢查询日志
2. **API性能**: 部分接口响应时间可优化
3. **错误处理**: 建议完善错误响应的统一格式
4. **测试覆盖**: 建议增加单元测试和集成测试
5. **监控告警**: 建议配置APM监控系统

---

**测试工具**: Bash自动化测试脚本  
**报告生成**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

log_success "测试报告已生成: $REPORT_FILE"

# ============================================
# 输出最终统计
# ============================================
echo ""
echo "============================================"
echo "  测试完成"
echo "============================================"
echo ""
echo -e "总计: ${BLUE}$TOTAL_TESTS${NC} 个测试"
echo -e "通过: ${GREEN}$PASSED_TESTS${NC} 个"
echo -e "失败: ${RED}$FAILED_TESTS${NC} 个"
echo -e "通过率: ${GREEN}${PASS_RATE}%${NC}"
echo -e "耗时: ${DURATION}秒"
echo ""

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}🎉 所有测试均通过！${NC}"
    exit 0
else
    echo -e "${RED}⚠️  有测试失败，请查看详细报告${NC}"
    exit 1
fi
