# AI音乐平台 - API接口清单

## 📋 文档说明

本文档列出了所有API接口的详细清单，包括公开接口、用户接口和管理接口。

**基础路径**: `/api`  
**认证方式**: JWT Bearer Token  
**响应格式**: JSON

---

## 1. 认证接口 (Authentication)

### 1.1 微信小程序登录
```http
POST /api/auth/wechat-login
```

**请求参数**:
```json
{
  "code": "微信登录code",
  "iv": "加密向量",
  "encryptedData": "加密数据"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "creditBalance": 100,
      "role": "user"
    }
  }
}
```

---

### 1.2 管理员登录
```http
POST /api/auth/admin-login
```

**请求参数**:
```json
{
  "username": "admin",
  "password": "password"
}
```

**权限**: 无需认证

---

### 1.3 退出登录
```http
POST /api/auth/logout
```

**权限**: 需要认证

---

### 1.4 刷新Token
```http
POST /api/auth/refresh
```

**请求参数**:
```json
{
  "refreshToken": "refresh_token"
}
```

---

## 2. 公开接口 (Public)

### 2.1 Banner轮播图

#### 获取启用的Banner列表
```http
GET /api/public/banner/list
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "Banner标题",
      "imageUrl": "图片URL",
      "linkUrl": "跳转链接",
      "sortOrder": 1
    }
  ]
}
```

**权限**: 无需认证

---

### 2.2 提示词模板

#### 获取启用的提示词模板
```http
GET /api/public/prompt-template/list?category=风格&tag=流行
```

**查询参数**:
- `category` (可选): 分类筛选
- `tag` (可选): 标签筛选

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "category": "风格",
      "title": "流行摇滚",
      "content": "模板内容",
      "tags": ["流行", "摇滚"],
      "usageCount": 100
    }
  ]
}
```

**权限**: 无需认证

---

#### 获取模板分类
```http
GET /api/public/prompt-template/categories
```

**响应**:
```json
{
  "code": 200,
  "data": ["风格", "情绪", "主题", "场景"]
}
```

---

### 2.3 热门推荐

#### 获取推荐音乐列表
```http
GET /api/public/hot-recommendation/list?category=流行&page=1&pageSize=20
```

**查询参数**:
- `category` (可选): 分类筛选
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认20

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "歌曲名",
        "artist": "艺术家",
        "coverUrl": "封面URL",
        "audioUrl": "音频URL",
        "duration": "3:45",
        "playCount": 1000,
        "likeCount": 50
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**权限**: 无需认证

---

#### 获取推荐分类
```http
GET /api/public/hot-recommendation/categories
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "code": "pop",
      "name": "流行",
      "icon": "图标URL"
    }
  ]
}
```

---

## 3. 用户接口 (User)

### 3.1 个人中心

#### 获取个人信息
```http
GET /api/user/profile
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "phone": "138****5678",
    "creditBalance": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**权限**: 需要用户认证

---

#### 更新个人信息
```http
PATCH /api/user/profile
```

**请求参数**:
```json
{
  "nickName": "新昵称",
  "avatarUrl": "新头像URL"
}
```

**权限**: 需要用户认证

---

#### 每日签到
```http
POST /api/user/checkin
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "credits": 5,
    "continuousDays": 3,
    "totalDays": 10
  }
}
```

**权限**: 需要用户认证

---

#### 获取个人统计
```http
GET /api/user/stats
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "worksCount": 10,
    "creditsConsumed": 200,
    "creditsRecharged": 300,
    "playCount": 1000
  }
}
```

**权限**: 需要用户认证

---

### 3.2 音乐生成

#### 创建音乐生成任务
```http
POST /api/user/music/generate
```

**请求参数**:
```json
{
  "title": "歌曲标题",
  "lyrics": "歌词内容",
  "style": "流行摇滚",
  "voiceGender": "male"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "taskId": "task_123",
    "status": "pending",
    "estimatedTime": 60
  }
}
```

**权限**: 需要用户认证

---

#### 获取任务状态
```http
GET /api/user/music/:taskId/status
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "taskId": "task_123",
    "status": "completed",
    "progress": 100,
    "audioUrl": "音频URL",
    "coverUrl": "封面URL"
  }
}
```

**权限**: 需要用户认证

---

#### 获取任务列表
```http
GET /api/user/music/list?page=1&pageSize=20&status=completed
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status` (可选): 任务状态筛选

**权限**: 需要用户认证

---

### 3.3 歌词生成

#### 生成AI歌词
```http
POST /api/user/lyrics/generate
```

**请求参数**:
```json
{
  "theme": "青春校园",
  "style": "流行",
  "mood": "欢快",
  "language": "chinese",
  "additionalRequirements": "包含副歌"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "requestId": "req_123",
    "versions": [
      {
        "version": 1,
        "content": "歌词内容...",
        "structure": {
          "verse": 2,
          "chorus": 1,
          "bridge": 1
        }
      }
    ]
  }
}
```

**权限**: 需要用户认证

---

#### 获取歌词生成历史
```http
GET /api/user/lyrics/history?page=1&pageSize=20
```

**权限**: 需要用户认证

---

### 3.4 积分管理

#### 获取积分余额
```http
GET /api/user/credit/balance
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "balance": 100,
    "frozen": 0,
    "available": 100
  }
}
```

**权限**: 需要用户认证

---

#### 获取积分记录
```http
GET /api/user/credit/logs?page=1&pageSize=20&type=consume
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `type` (可选): 类型筛选 (recharge/consume/reward/refund)

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "amount": -10,
        "balanceBefore": 110,
        "balanceAfter": 100,
        "type": "consume",
        "description": "生成音乐",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50
  }
}
```

**权限**: 需要用户认证

---

#### 获取积分套餐
```http
GET /api/user/credit/packages
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "基础套餐",
      "credits": 100,
      "bonusCredits": 10,
      "price": 9.9,
      "isActive": true
    }
  ]
}
```

**权限**: 需要用户认证

---

### 3.5 订单管理

#### 创建订单
```http
POST /api/user/order/create
```

**请求参数**:
```json
{
  "packageId": 1
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "orderNo": "order_123",
    "amount": 9.9,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**权限**: 需要用户认证

---

#### 微信支付
```http
POST /api/user/payment/wechat-pay
```

**请求参数**:
```json
{
  "orderNo": "order_123"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "timeStamp": "时间戳",
    "nonceStr": "随机字符串",
    "package": "prepay_id=xxx",
    "signType": "RSA",
    "paySign": "签名"
  }
}
```

**权限**: 需要用户认证

---

#### 查询订单状态
```http
GET /api/user/order/:orderNo/status
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "orderNo": "order_123",
    "status": "paid",
    "paidAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**权限**: 需要用户认证

---

## 4. 管理接口 (Admin)

### 4.1 Banner管理

#### 获取所有Banner
```http
GET /api/admin/banner/list?page=1&pageSize=20&status=active
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status` (可选): 状态筛选 (active/inactive)

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Banner标题",
        "imageUrl": "图片URL",
        "linkUrl": "跳转链接",
        "linkType": "internal",
        "isActive": true,
        "sortOrder": 1,
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-12-31T23:59:59.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10
  }
}
```

**权限**: 需要管理员权限

---

#### 创建Banner
```http
POST /api/admin/banner
```

**请求参数**:
```json
{
  "title": "Banner标题",
  "imageUrl": "图片URL",
  "linkUrl": "跳转链接",
  "linkType": "internal",
  "sortOrder": 1,
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-12-31T23:59:59.000Z"
}
```

**权限**: 需要管理员权限

---

#### 更新Banner
```http
PATCH /api/admin/banner/:id
```

**请求参数**: 同创建接口

**权限**: 需要管理员权限

---

#### 删除Banner（软删除）
```http
DELETE /api/admin/banner/:id
```

**权限**: 需要管理员权限

---

#### 切换Banner状态
```http
POST /api/admin/banner/:id/toggle
```

**权限**: 需要管理员权限

---

### 4.2 提示词模板管理

#### 获取所有模板
```http
GET /api/admin/prompt-template/list?page=1&pageSize=20&category=风格
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `category` (可选): 分类筛选
- `status` (可选): 状态筛选

**权限**: 需要管理员权限

---

#### 创建模板
```http
POST /api/admin/prompt-template
```

**请求参数**:
```json
{
  "category": "风格",
  "title": "流行摇滚",
  "content": "模板内容",
  "tags": ["流行", "摇滚"],
  "sortOrder": 1
}
```

**权限**: 需要管理员权限

---

#### 更新模板
```http
PATCH /api/admin/prompt-template/:id
```

**权限**: 需要管理员权限

---

#### 删除模板
```http
DELETE /api/admin/prompt-template/:id
```

**权限**: 需要管理员权限

---

#### 批量操作
```http
POST /api/admin/prompt-template/batch
```

**请求参数**:
```json
{
  "ids": [1, 2, 3],
  "action": "activate" // activate/deactivate/delete
}
```

**权限**: 需要管理员权限

---

### 4.3 热门推荐管理

#### 获取所有推荐
```http
GET /api/admin/hot-recommendation/list?page=1&pageSize=20
```

**权限**: 需要管理员权限

---

#### 创建推荐
```http
POST /api/admin/hot-recommendation
```

**请求参数**:
```json
{
  "category": "流行",
  "title": "歌曲名",
  "artist": "艺术家",
  "coverUrl": "封面URL",
  "audioUrl": "音频URL",
  "duration": "3:45",
  "description": "描述",
  "sortOrder": 1
}
```

**权限**: 需要管理员权限

---

#### 更新推荐
```http
PATCH /api/admin/hot-recommendation/:id
```

**权限**: 需要管理员权限

---

#### 删除推荐
```http
DELETE /api/admin/hot-recommendation/:id
```

**权限**: 需要管理员权限

---

### 4.4 用户管理

#### 获取用户列表
```http
GET /api/admin/users/list?page=1&pageSize=20&keyword=张三&status=active
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `keyword` (可选): 搜索关键词
- `status` (可选): 状态筛选 (active/banned)

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "nickName": "用户昵称",
        "phone": "138****5678",
        "creditBalance": 100,
        "worksCount": 10,
        "isBanned": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100
  }
}
```

**权限**: 需要管理员权限

---

#### 获取用户详情
```http
GET /api/admin/users/:id
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "nickName": "用户昵称",
    "phone": "138****5678",
    "avatarUrl": "头像URL",
    "creditBalance": 100,
    "isBanned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "stats": {
      "worksCount": 10,
      "creditsConsumed": 200,
      "creditsRecharged": 300
    },
    "recentWorks": [],
    "recentOrders": []
  }
}
```

**权限**: 需要管理员权限

---

#### 封禁用户
```http
POST /api/admin/users/:id/ban
```

**请求参数**:
```json
{
  "reason": "违规原因"
}
```

**权限**: 需要管理员权限

---

#### 解封用户
```http
POST /api/admin/users/:id/unban
```

**权限**: 需要管理员权限

---

#### 调整用户积分
```http
PATCH /api/admin/users/:id/credits
```

**请求参数**:
```json
{
  "amount": 100,
  "type": "reward",
  "description": "系统奖励"
}
```

**权限**: 需要管理员权限

---

### 4.5 订单管理

#### 获取订单列表
```http
GET /api/admin/orders/list?page=1&pageSize=20&status=paid&userId=1
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status` (可选): 状态筛选
- `userId` (可选): 用户ID筛选
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期

**权限**: 需要管理员权限

---

#### 获取订单详情
```http
GET /api/admin/orders/:orderNo
```

**权限**: 需要管理员权限

---

#### 退款
```http
POST /api/admin/orders/:orderNo/refund
```

**请求参数**:
```json
{
  "reason": "退款原因"
}
```

**权限**: 需要管理员权限

---

### 4.6 数据统计

#### 仪表板概览
```http
GET /api/admin/statistics/dashboard
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "users": {
      "total": 1000,
      "today": 10,
      "active": 500
    },
    "works": {
      "total": 5000,
      "today": 50,
      "public": 2000
    },
    "credits": {
      "consumed": 10000,
      "recharged": 15000,
      "balance": 5000
    },
    "revenue": {
      "today": 100,
      "week": 700,
      "month": 3000
    }
  }
}
```

**权限**: 需要管理员权限

---

#### 用户增长趋势
```http
GET /api/admin/statistics/users/growth?startDate=2024-01-01&endDate=2024-01-31
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "labels": ["2024-01-01", "2024-01-02", ...],
    "values": [10, 15, 20, ...]
  }
}
```

**权限**: 需要管理员权限

---

#### 作品统计
```http
GET /api/admin/statistics/works/stats?startDate=2024-01-01&endDate=2024-01-31
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "byStyle": {
      "流行": 100,
      "摇滚": 50,
      "民谣": 30
    },
    "byDuration": {
      "短(< 2分钟)": 50,
      "中(2-4分钟)": 100,
      "长(> 4分钟)": 30
    }
  }
}
```

**权限**: 需要管理员权限

---

#### 收入趋势
```http
GET /api/admin/statistics/revenue/trend?startDate=2024-01-01&endDate=2024-01-31
```

**权限**: 需要管理员权限

---

### 4.7 系统管理

#### 获取系统配置
```http
GET /api/admin/system/configs
```

**响应**:
```json
{
  "code": 200,
  "data": [
    {
      "key": "default_credits",
      "value": "100",
      "type": "number",
      "description": "新用户默认积分"
    }
  ]
}
```

**权限**: 需要管理员权限

---

#### 更新配置
```http
PATCH /api/admin/system/configs/:key
```

**请求参数**:
```json
{
  "value": "200"
}
```

**权限**: 需要管理员权限

---

#### 获取操作日志
```http
GET /api/admin/system/logs?page=1&pageSize=20&action=USER_BAN
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `action` (可选): 操作类型筛选
- `adminId` (可选): 管理员ID筛选
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期

**响应**:
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "adminId": 1,
        "adminName": "管理员",
        "action": "USER_BAN",
        "resource": "user",
        "resourceId": "123",
        "details": {},
        "ipAddress": "192.168.1.1",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100
  }
}
```

**权限**: 需要管理员权限

---

#### 系统健康检查
```http
GET /api/admin/system/health
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "database": "ok",
    "redis": "ok",
    "storage": "ok",
    "api": "ok"
  }
}
```

**权限**: 需要管理员权限

---

## 5. 文件上传

#### 上传文件
```http
POST /api/file/upload
```

**请求**: `multipart/form-data`
- `file`: 文件
- `type`: 文件类型 (audio/image/document)
- `purpose`: 用途 (music_upload/avatar/cover)

**响应**:
```json
{
  "code": 200,
  "data": {
    "fileId": 1,
    "fileName": "文件名",
    "fileUrl": "https://example.com/path/to/file",
    "fileSize": 1024000,
    "mimeType": "audio/mpeg"
  }
}
```

**权限**: 需要用户认证

---

## 6. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或token无效） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |
| 1001 | 积分不足 |
| 1002 | 任务限额已达 |
| 1003 | 微信登录失败 |

---

## 7. 限流说明

| 接口类型 | 限制 |
|----------|------|
| 公开接口 | 100次/分钟 |
| 用户接口 | 60次/分钟 |
| 音乐生成 | 10次/分钟 |
| 管理接口 | 1000次/分钟 |

---

## 8. 附录

### 8.1 认证Header示例

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 8.2 分页参数

所有列表接口统一支持：
- `page`: 页码（从1开始）
- `pageSize`: 每页数量（默认20，最大100）

### 8.3 日期格式

所有日期统一使用ISO 8601格式：
```
2024-01-01T00:00:00.000Z
```

### 8.4 时间范围查询

支持时间范围的接口统一使用：
- `startDate`: 开始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）

---

**文档编写**: AI Assistant  
**最后更新**: 2024-01-20  
**版本**: v1.0
