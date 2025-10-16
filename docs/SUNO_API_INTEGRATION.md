# SUNO API 完整接入文档

> **版本**: v1.0  
> **创建时间**: 2024年  
> **状态**: ✅ 已完成

---

## 📋 目录

- [1. 概述](#1-概述)
- [2. 功能清单](#2-功能清单)
- [3. 数据库设计](#3-数据库设计)
- [4. API接口文档](#4-api接口文档)
- [5. 部署指南](#5-部署指南)
- [6. 测试指南](#6-测试指南)
- [7. 常见问题](#7-常见问题)

---

## 1. 概述

### 1.1 项目背景

本项目完整接入了SUNO AI音乐生成平台的API，实现了从音乐生成、歌词创作到音频处理的全流程功能。严格遵循SUNO官方API文档规范，确保API的稳定性和可靠性。

### 1.2 技术栈

- **后端框架**: NestJS 10.x
- **数据库**: MySQL 8.0
- **ORM**: TypeORM
- **消息队列**: Bull (Redis)
- **API文档**: Swagger/OpenAPI 3.0
- **认证**: JWT

### 1.3 核心特性

✅ **完整功能覆盖** - 支持SUNO API所有功能接口  
✅ **双端适配** - 同时支持小程序前端和管理后台调用  
✅ **异步处理** - 使用消息队列处理长时任务  
✅ **回调支持** - 完整的Webhook回调机制  
✅ **点数管理** - 集成点数消费和余额查询  
✅ **错误处理** - 完善的错误处理和重试机制  
✅ **类型安全** - TypeScript强类型定义  
✅ **API文档** - 自动生成Swagger文档

---

## 2. 功能清单

### 2.1 音乐生成功能

| 功能 | API端点 | 状态 | 点数消耗 |
|------|---------|------|---------|
| 基础音乐生成 | `POST /api/suno/generate` | ✅ | 20 |
| 音乐扩展 | `POST /api/suno/extend` | ✅ | 15 |
| 查询生成状态 | `GET /api/suno/generate/:taskId` | ✅ | 0 |
| 查询扩展状态 | `GET /api/suno/extend/:taskId` | ✅ | 0 |

### 2.2 歌词功能

| 功能 | API端点 | 状态 | 点数消耗 |
|------|---------|------|---------|
| 生成歌词 | `POST /api/suno/lyrics/generate` | ✅ | 5 |
| 查询歌词状态 | `GET /api/suno/lyrics/:taskId` | ✅ | 0 |
| 获取时间戳歌词 | `GET /api/suno/lyrics/timestamped/:audioId` | ✅ | 0 |

### 2.3 音频处理功能

| 功能 | API端点 | 状态 | 点数消耗 |
|------|---------|------|---------|
| 人声分离 | `POST /api/suno/vocal-separation` | ✅ | 10 |
| WAV转换 | `POST /api/suno/convert-to-wav` | ✅ | 5 |
| 查询分离状态 | `GET /api/suno/vocal-separation/:taskId` | ✅ | 0 |
| 查询转换状态 | `GET /api/suno/convert-to-wav/:taskId` | ✅ | 0 |

### 2.4 视频和翻唱功能

| 功能 | API端点 | 状态 | 点数消耗 |
|------|---------|------|---------|
| 音乐视频生成 | `POST /api/suno/music-video` | ✅ | 25 |
| 上传并翻唱 | `POST /api/suno/upload-and-cover` | ✅ | 30 |
| 查询视频状态 | `GET /api/suno/music-video/:taskId` | ✅ | 0 |
| 查询翻唱状态 | `GET /api/suno/upload-and-cover/:taskId` | ✅ | 0 |

### 2.5 系统功能

| 功能 | API端点 | 状态 |
|------|---------|------|
| 查询SUNO积分 | `GET /api/suno/credits` | ✅ |

---

## 3. 数据库设计

### 3.1 表结构概览

```
music_tasks                     # 音乐生成任务表（扩展）
├── suno_extend_tasks          # 音乐扩展任务表
├── suno_lyrics_tasks          # 歌词生成任务表
├── suno_vocal_separation_tasks # 人声分离任务表
├── suno_wav_conversion_tasks   # WAV转换任务表
├── suno_music_video_tasks      # 音乐视频任务表
├── suno_cover_tasks            # 翻唱任务表
├── suno_timestamped_lyrics     # 时间戳歌词表
└── suno_credit_usage_logs      # SUNO积分使用记录表
```

### 3.2 核心表字段

#### 3.2.1 music_tasks（扩展字段）

```sql
ALTER TABLE `music_tasks` ADD COLUMN
  custom_mode TINYINT(1) DEFAULT 1,        -- 是否自定义模式
  negative_tags VARCHAR(500) NULL,          -- 排除的音乐风格
  vocal_gender ENUM('m', 'f') NULL,         -- 人声性别
  style_weight DECIMAL(3,2) NULL,           -- 风格权重
  weirdness_constraint DECIMAL(3,2) NULL,   -- 创意发散度
  audio_weight DECIMAL(3,2) NULL,           -- 音频影响力
  callback_url VARCHAR(500) NULL,           -- 回调URL
  suno_clip_ids JSON NULL,                  -- SUNO音频片段ID列表
  tags VARCHAR(500) NULL;                   -- 音乐标签
```

#### 3.2.2 suno_extend_tasks

```sql
CREATE TABLE `suno_extend_tasks` (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id VARCHAR(50) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  original_music_task_id BIGINT UNSIGNED NOT NULL,
  audio_id VARCHAR(50) NOT NULL,
  continue_at INT NULL,
  prompt TEXT NULL,
  model ENUM('V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5') NOT NULL,
  status ENUM('PENDING', 'GENERATING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  result_data JSON NULL,
  audio_url VARCHAR(500) NULL,
  duration FLOAT NULL,
  credit_cost INT UNSIGNED DEFAULT 15,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL
);
```

详细表结构见：`backend/src/database/migrations/09-create-suno-tasks-tables.sql`

---

## 4. API接口文档

### 4.1 基础信息

**Base URL**: `http://localhost:3000/api/suno`  
**认证方式**: Bearer Token (JWT)  
**Content-Type**: `application/json`

### 4.2 通用响应格式

#### 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

#### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "error": "ERROR_CODE"
}
```

#### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权或Token无效 |
| 402 | 点数不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 503 | SUNO API服务不可用 |

### 4.3 核心接口示例

#### 4.3.1 生成音乐

**请求**

```http
POST /api/suno/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "夏日海滩",
  "lyrics": "主歌:\n阳光洒在沙滩上...\n\n副歌:\n让我们一起摇摆...",
  "style": "pop",
  "customMode": true,
  "instrumental": false,
  "model": "V4_5",
  "vocalGender": "f",
  "styleWeight": 0.75,
  "negativeTags": "重金属, 摇滚"
}
```

**响应**

```json
{
  "code": 200,
  "message": "音乐生成任务已创建",
  "data": {
    "taskId": "suno_task_abc123"
  }
}
```

#### 4.3.2 查询任务状态

**请求**

```http
GET /api/suno/generate/suno_task_abc123
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应（生成中）**

```json
{
  "code": 200,
  "data": {
    "taskId": "suno_task_abc123",
    "status": "GENERATING",
    "callbackType": "text"
  }
}
```

**响应（已完成）**

```json
{
  "code": 200,
  "data": {
    "taskId": "suno_task_abc123",
    "status": "SUCCESS",
    "callbackType": "complete",
    "response": {
      "data": [
        {
          "id": "audio_123",
          "audio_url": "https://example.com/audio.mp3",
          "stream_audio_url": "https://example.com/stream/audio",
          "image_url": "https://example.com/cover.jpg",
          "title": "夏日海滩",
          "tags": "pop, 欢快",
          "duration": 180.5,
          "createTime": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

#### 4.3.3 扩展音乐

**请求**

```http
POST /api/suno/extend
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "audioId": "audio_123",
  "defaultParamFlag": true,
  "prompt": "添加一段吉他独奏",
  "continueAt": 120,
  "model": "V4_5"
}
```

**响应**

```json
{
  "code": 200,
  "message": "音乐扩展任务已创建",
  "data": {
    "taskId": "suno_extend_abc123"
  }
}
```

#### 4.3.4 生成歌词

**请求**

```http
POST /api/suno/lyrics/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "prompt": "创作一首关于夏日海边的轻快歌曲"
}
```

**响应**

```json
{
  "code": 200,
  "message": "歌词生成任务已创建",
  "data": {
    "taskId": "suno_lyrics_abc123"
  }
}
```

#### 4.3.5 人声分离

**请求**

```http
POST /api/suno/vocal-separation
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "taskId": "suno_task_abc123",
  "audioId": "audio_123"
}
```

**响应**

```json
{
  "code": 200,
  "message": "人声分离任务已创建",
  "data": {
    "taskId": "suno_vocal_abc123"
  }
}
```

查询结果：

```json
{
  "code": 200,
  "data": {
    "taskId": "suno_vocal_abc123",
    "status": "SUCCESS",
    "vocal_removal_info": {
      "instrumental_url": "https://example.com/instrumental.mp3",
      "vocal_url": "https://example.com/vocal.mp3"
    }
  }
}
```

#### 4.3.6 查询SUNO积分

**请求**

```http
GET /api/suno/credits
Authorization: Bearer YOUR_JWT_TOKEN
```

**响应**

```json
{
  "code": 200,
  "data": {
    "credits": 500
  }
}
```

### 4.4 完整API列表

详细的API文档可通过Swagger访问：

```
http://localhost:3000/api-docs
```

---

## 5. 部署指南

### 5.1 环境要求

- Node.js 18.x或更高
- MySQL 8.0或更高
- Redis 6.x或更高
- SUNO API Key（从 https://sunoapi.org 获取）

### 5.2 安装步骤

#### 5.2.1 克隆项目

```bash
cd backend
npm install
```

#### 5.2.2 配置环境变量

创建 `.env` 文件：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=music_platform

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# SUNO API配置（重要！）
SUNO_API_KEY=your_suno_api_key
SUNO_API_BASE_URL=https://api.sunoapi.org
```

#### 5.2.3 初始化数据库

```bash
# 运行数据库迁移脚本
mysql -u root -p music_platform < src/database/migrations/01-create-tables.sql
mysql -u root -p music_platform < src/database/migrations/09-create-suno-tasks-tables.sql
```

或使用TypeORM同步：

```bash
npm run typeorm:sync
```

#### 5.2.4 启动服务

```bash
# 开发环境
npm run start:dev

# 生产环境
npm run build
npm run start:prod
```

#### 5.2.5 验证部署

访问以下URL验证部署：

- API文档: `http://localhost:3000/api-docs`
- 健康检查: `http://localhost:3000/api/health`
- SUNO积分查询: `http://localhost:3000/api/suno/credits`

### 5.3 Docker部署（推荐）

#### 5.3.1 使用docker-compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUNO_API_KEY=${SUNO_API_KEY}
    depends_on:
      - mysql
      - redis
    volumes:
      - ./uploads:/app/uploads

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: music_platform
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

启动：

```bash
docker-compose up -d
```

---

## 6. 测试指南

### 6.1 单元测试

```bash
npm run test
```

### 6.2 E2E测试

```bash
npm run test:e2e
```

### 6.3 手动测试

#### 6.3.1 使用Postman

导入Postman Collection：

```bash
# 导出OpenAPI规范
npm run generate:openapi

# 在Postman中导入 openapi.json
```

#### 6.3.2 使用cURL

**测试音乐生成：**

```bash
curl -X POST http://localhost:3000/api/suno/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试音乐",
    "style": "pop",
    "lyrics": "测试歌词内容",
    "customMode": true,
    "instrumental": false,
    "model": "V3_5"
  }'
```

**查询任务状态：**

```bash
curl -X GET http://localhost:3000/api/suno/generate/YOUR_TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**查询SUNO积分：**

```bash
curl -X GET http://localhost:3000/api/suno/credits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6.4 测试清单

- [ ] 音乐生成（自定义模式）
- [ ] 音乐生成（非自定义模式）
- [ ] 音乐扩展
- [ ] 歌词生成
- [ ] 人声分离
- [ ] WAV转换
- [ ] 音乐视频生成
- [ ] 上传并翻唱
- [ ] 查询任务状态（各种类型）
- [ ] 查询SUNO积分
- [ ] 获取时间戳歌词
- [ ] 错误处理测试
- [ ] 点数不足测试
- [ ] 并发请求测试
- [ ] 回调功能测试

---

## 7. 常见问题

### 7.1 SUNO API相关

**Q: SUNO API Key如何获取？**

A: 访问 https://sunoapi.org 注册账户并在API密钥管理页面获取。

**Q: SUNO API有请求频率限制吗？**

A: 是的，具体限制取决于您的订阅计划。建议实现请求队列和重试机制。

**Q: 音乐生成需要多长时间？**

A: 通常需要30-60秒，具体取决于模型和内容复杂度。使用回调机制可以避免长时间等待。

### 7.2 部署相关

**Q: 如何配置HTTPS？**

A: 建议使用Nginx反向代理配置SSL证书：

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Q: 如何监控SUNO API调用状态？**

A: 查看 `suno_credit_usage_logs` 表记录所有API调用历史和积分消耗。

### 7.3 开发相关

**Q: 如何添加新的SUNO API功能？**

A: 按以下步骤：
1. 在 `music.types.ts` 中添加类型定义
2. 在 `suno.service.ts` 中实现API调用方法
3. 创建相应的DTO
4. 在 `suno.controller.ts` 中添加Controller端点
5. 更新数据库表结构（如需要）
6. 编写测试用例

**Q: 如何调试SUNO API调用？**

A: 启用详细日志：

```typescript
// 在suno.service.ts中
this.logger.log(`SUNO API Request: ${JSON.stringify(request)}`);
this.logger.log(`SUNO API Response: ${JSON.stringify(response.data)}`);
```

---

## 📚 相关资源

- [SUNO官方文档](https://docs.sunoapi.org)
- [NestJS文档](https://docs.nestjs.com)
- [TypeORM文档](https://typeorm.io)
- [项目API文档](http://localhost:3000/api-docs)

---

## 🔄 更新日志

### v1.0.0 (2024-01-15)

- ✅ 完整实现SUNO API所有功能
- ✅ 数据库表结构设计完成
- ✅ Controller和Service实现完成
- ✅ Swagger文档自动生成
- ✅ 完整的类型定义和DTO
- ✅ 集成点数系统
- ✅ 错误处理和日志记录

---

## 📝 许可证

本项目遵循 MIT 许可证。

---

**维护者**: 开发团队  
**最后更新**: 2024年1月15日  
**文档版本**: 1.0.0
