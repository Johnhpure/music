# Gemini API 快速开始指南

## 1. 初始化数据库

```bash
cd /home/chenbang/app/music/music_platform-master/backend
node scripts/init-gemini-tables.js
```

## 2. 添加API密钥

通过Postman或curl添加密钥：

```bash
curl -X POST http://localhost:3000/api/admin/gemini/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "keyName": "主密钥",
    "apiKey": "YOUR_GEMINI_API_KEY",
    "priority": 100,
    "rateLimitRpm": 15,
    "rateLimitTpm": 32000,
    "rateLimitRpd": 1500
  }'
```

## 3. 测试功能

```bash
# 生成歌词
curl -X POST http://localhost:3000/api/ai/lyrics/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "theme": "夏日海滩",
    "style": "pop",
    "mood": "happy",
    "versionsCount": 2
  }'
```

## 4. 查看统计

```bash
# 查看今日统计
curl http://localhost:3000/api/admin/gemini/stats/today \
  -H "Authorization: Bearer YOUR_TOKEN"

# 查看密钥列表
curl http://localhost:3000/api/admin/gemini/keys \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 核心功能

- ✅ 多密钥轮询使用
- ✅ Token精确计算
- ✅ 智能限流控制
- ✅ 完整日志记录
- ✅ 使用统计分析
- ✅ 管理后台API

详细文档请参考：`GEMINI_API_INTEGRATION.md`
