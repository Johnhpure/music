#!/bin/bash

echo "🔍 测试 CORS 配置..."
echo ""

# 测试 1: OPTIONS 请求
echo "📋 测试 1: OPTIONS 预检请求"
echo "URL: http://localhost:3000/api/public/banner/list"
curl -s -X OPTIONS http://localhost:3000/api/public/banner/list \
  -H "Origin: https://admin.jianzhile.vip" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep -E "< HTTP|< Access-Control" | head -10
echo ""

# 测试 2: GET 请求
echo "📋 测试 2: GET 请求"
echo "URL: http://localhost:3000/api/public/banner/list"
curl -s -X GET http://localhost:3000/api/public/banner/list \
  -H "Origin: https://admin.jianzhile.vip" \
  -v 2>&1 | grep -E "< HTTP|< Access-Control" | head -10
echo ""

# 测试 3: 查看日志
echo "📋 测试 3: 查看最近的 CORS 日志"
tail -30 /tmp/backend.log | grep -E "CORS|Origin" | tail -10
echo ""

echo "✅ 测试完成"
