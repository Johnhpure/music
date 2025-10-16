# AI音乐创作助手 - API接口设计文档

## 1. 接口设计规范

### 1.1 基础规范

- **协议**: HTTPS
- **请求方式**: GET, POST, PUT, DELETE
- **编码格式**: UTF-8
- **数据格式**: JSON
- **接口前缀**: `/api/v1`

### 1.2 RESTful风格

遵循RESTful设计原则：
- GET: 获取资源
- POST: 创建资源
- PUT: 更新资源
- DELETE: 删除资源

### 1.3 统一返回格式

#### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1686900000000
}
```

#### 失败响应

```json
{
  "code": 400,
  "msg": "参数错误",
  "data": null,
  "timestamp": 1686900000000
}
```

### 1.4 HTTP状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.5 业务错误码

| 错误码 | 说明 |
|-------|------|
| 1000 | 系统错误 |
| 1001 | 参数错误 |
| 1002 | 数据不存在 |
| 2000 | 用户不存在 |
| 2001 | 用户未登录 |
| 2002 | Token过期 |
| 2003 | Token无效 |
| 3000 | 积分不足 |
| 3001 | 积分消费失败 |
| 4000 | AI服务异常 |
| 4001 | 音乐生成失败 |
| 5000 | 文件上传失败 |
| 5001 | 文件格式不支持 |

### 1.6 请求头

```
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {唯一请求ID}
```

### 1.7 分页参数

```json
{
  "page": 1,        // 页码，从1开始
  "pageSize": 20,   // 每页数量，默认20
  "total": 100,     // 总记录数
  "pages": 5        // 总页数
}
```

---

## 2. 用户模块API

### 2.1 微信登录

**接口**: `POST /api/v1/auth/wechat/login`

**描述**: 通过微信授权码登录

**请求参数**:

```json
{
  "code": "微信授权码"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "JWT Token",
    "userId": "用户ID",
    "userInfo": {
      "id": "用户ID",
      "nickname": "昵称",
      "avatar": "头像URL",
      "points": 320,
      "createdAt": "注册时间"
    }
  }
}
```

---

### 2.2 获取用户信息

**接口**: `GET /api/v1/user/info`

**描述**: 获取当前登录用户信息

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "用户ID",
    "nickname": "昵称",
    "avatar": "头像URL",
    "points": 320,
    "worksCount": 15,
    "streakDays": 3,
    "createdAt": "注册时间"
  }
}
```

---

### 2.3 更新用户信息

**接口**: `PUT /api/v1/user/info`

**描述**: 更新用户昵称和头像

**请求头**: 需要Token

**请求参数**:

```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null
}
```

---

## 3. 创作模块API

### 3.1 AI生成歌词

**接口**: `POST /api/v1/create/lyrics/generate`

**描述**: 使用AI生成歌词

**请求头**: 需要Token

**请求参数**:

```json
{
  "prompt": "创作提示词",
  "category": "爱情",           // 可选：分类
  "language": "zh-CN",          // 语言，默认中文
  "versionsCount": 2            // 生成版本数，默认2
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "versions": [
      {
        "title": "歌曲标题",
        "content": "歌词内容",
        "version": 1
      },
      {
        "title": "歌曲标题2",
        "content": "歌词内容2",
        "version": 2
      }
    ],
    "pointsConsumed": 10          // 消耗的点数
  }
}
```

---

### 3.2 生成音乐

**接口**: `POST /api/v1/create/music/generate`

**描述**: 根据歌词和风格生成音乐

**请求头**: 需要Token

**请求参数**:

```json
{
  "title": "歌曲标题",
  "lyrics": "歌词内容",
  "style": "pop",               // 风格：pop/rock/folk/electronic等
  "voice": "female",            // 声音：male/female/neutral
  "creationType": "ai"          // 创作类型：ai/manual
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "任务创建成功",
  "data": {
    "taskId": "生成任务ID",
    "estimatedTime": 45           // 预计完成时间（秒）
  }
}
```

**说明**: 
- 音乐生成是异步任务，返回taskId
- 需要轮询或WebSocket获取生成进度

---

### 3.3 查询生成状态

**接口**: `GET /api/v1/create/music/status/:taskId`

**描述**: 查询音乐生成任务状态

**请求头**: 需要Token

**请求参数**: 无（taskId在URL中）

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "任务ID",
    "status": "completed",        // pending/processing/completed/failed
    "progress": 100,              // 进度 0-100
    "result": {
      "workId": "作品ID",
      "audioUrl": "音频文件URL",
      "coverUrl": "封面URL",
      "duration": 185             // 时长（秒）
    }
  }
}
```

---

### 3.4 保存作品

**接口**: `POST /api/v1/works`

**描述**: 保存生成的音乐作品

**请求头**: 需要Token

**请求参数**:

```json
{
  "title": "歌曲标题",
  "lyrics": "歌词内容",
  "style": "pop",
  "voice": "female",
  "audioUrl": "音频文件URL",
  "coverUrl": "封面URL",
  "duration": 185,
  "creationType": "ai"
}
```

**返回数据**:

```json
{
  "code": 201,
  "msg": "保存成功",
  "data": {
    "workId": "作品ID",
    "pointsConsumed": 30          // 本次消耗的点数
  }
}
```

---

## 4. 作品模块API

### 4.1 获取作品列表

**接口**: `GET /api/v1/works`

**描述**: 获取用户的作品列表

**请求头**: 需要Token

**请求参数**:

```
page=1              // 页码
pageSize=20         // 每页数量
keyword=搜索关键词   // 可选
filter=all          // 筛选：all/downloaded/cloud/expiring
sortBy=createTime   // 排序字段
sortOrder=desc      // 排序方向：asc/desc
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "作品ID",
        "title": "夏日晚风",
        "coverUrl": "封面URL",
        "audioUrl": "音频URL",
        "duration": 185,
        "genre": "流行",
        "isDownloaded": true,
        "daysLeft": null,
        "createTime": "2023-06-15 10:30:00",
        "playCount": 120
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

### 4.2 获取作品详情

**接口**: `GET /api/v1/works/:id`

**描述**: 获取作品详细信息

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "作品ID",
    "title": "夏日晚风",
    "lyrics": "完整歌词...",
    "coverUrl": "封面URL",
    "audioUrl": "音频URL",
    "duration": 185,
    "genre": "流行",
    "style": "pop",
    "voice": "female",
    "creationType": "ai",
    "isDownloaded": true,
    "isPublic": true,
    "playCount": 120,
    "likeCount": 35,
    "shareCount": 12,
    "createTime": "2023-06-15 10:30:00",
    "expiryTime": "2023-09-15 10:30:00"
  }
}
```

---

### 4.3 删除作品

**接口**: `DELETE /api/v1/works/:id`

**描述**: 删除指定作品

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null
}
```

---

### 4.4 批量删除作品

**接口**: `POST /api/v1/works/batch/delete`

**描述**: 批量删除多个作品

**请求头**: 需要Token

**请求参数**:

```json
{
  "workIds": ["id1", "id2", "id3"]
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "批量删除成功",
  "data": {
    "successCount": 3,
    "failedCount": 0
  }
}
```

---

### 4.5 下载作品

**接口**: `POST /api/v1/works/:id/download`

**描述**: 标记作品为已下载并返回下载链接

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "downloadUrl": "下载链接（带签名）",
    "expiresIn": 3600             // 链接有效期（秒）
  }
}
```

---

### 4.6 分享作品

**接口**: `POST /api/v1/works/:id/share`

**描述**: 分享作品，返回分享数据

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "shareData": {
      "title": "分享标题",
      "desc": "分享描述",
      "imageUrl": "分享图片",
      "path": "小程序路径"
    },
    "pointsEarned": 5             // 分享获得的积分
  }
}
```

---

### 4.7 获取即将过期作品

**接口**: `GET /api/v1/works/expiring`

**描述**: 获取即将过期的作品列表（剩余天数<7天）

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "作品ID",
        "title": "电子梦境",
        "daysLeft": 2,
        "expiryTime": "2023-06-20 10:30:00"
      }
    ]
  }
}
```

---

## 5. 积分模块API

### 5.1 获取积分余额

**接口**: `GET /api/v1/points/balance`

**描述**: 获取当前用户积分余额

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "points": 320,
    "lastUpdateTime": "2023-06-16 10:30:00"
  }
}
```

---

### 5.2 获取积分明细

**接口**: `GET /api/v1/points/records`

**描述**: 获取积分获取和消费明细

**请求头**: 需要Token

**请求参数**:

```
page=1
pageSize=20
startDate=2023-05-01      // 可选
endDate=2023-06-16        // 可选
type=all                  // all/earn/consume
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "summary": {
      "earned": 285,
      "consumed": 140,
      "net": 145
    },
    "list": [
      {
        "id": "记录ID",
        "type": "earn",             // earn/consume
        "title": "观看广告",
        "subtitle": null,
        "points": 10,
        "balance": 330,             // 操作后余额
        "createTime": "2023-06-16 10:30:00"
      },
      {
        "id": "记录ID2",
        "type": "consume",
        "title": "创作歌曲",
        "subtitle": "《夏日晚风》",
        "points": 30,
        "balance": 320,
        "createTime": "2023-06-16 09:15:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

---

### 5.3 消费积分

**接口**: `POST /api/v1/points/consume`

**描述**: 消费积分

**请求头**: 需要Token

**请求参数**:

```json
{
  "amount": 30,
  "reason": "创作音乐",
  "relatedId": "关联ID（如作品ID）"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "消费成功",
  "data": {
    "remainingPoints": 290,
    "recordId": "记录ID"
  }
}
```

---

### 5.4 观看广告获取积分

**接口**: `POST /api/v1/points/earn/ad`

**描述**: 观看广告获取积分

**请求头**: 需要Token

**请求参数**:

```json
{
  "adId": "广告ID"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "points": 10,
    "remainingPoints": 330,
    "remainingWatches": 2         // 今日剩余观看次数
  }
}
```

---

### 5.5 分享作品获取积分

**接口**: `POST /api/v1/points/earn/share`

**描述**: 分享作品获取积分

**请求头**: 需要Token

**请求参数**:

```json
{
  "workId": "作品ID"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "points": 5,
    "remainingPoints": 325,
    "dailyEarned": 15,            // 今日已获取
    "dailyLimit": 30              // 每日上限
  }
}
```

---

### 5.6 邀请好友获取积分

**接口**: `POST /api/v1/points/earn/invite`

**描述**: 邀请好友获取积分

**请求头**: 需要Token

**请求参数**:

```json
{
  "inviteeId": "被邀请人ID"
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "points": 20,
    "remainingPoints": 345,
    "inviteCount": 3              // 累计邀请人数
  }
}
```

---

## 6. 签到模块API

### 6.1 每日签到

**接口**: `POST /api/v1/checkin`

**描述**: 每日签到打卡

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "签到成功",
  "data": {
    "points": 10,                 // 本次获得积分
    "remainingPoints": 330,
    "streakDays": 3,              // 连续签到天数
    "todayChecked": true,
    "milestone": {                // 达成的里程碑（可选）
      "days": 3,
      "points": 10,
      "title": "连续签到3天"
    }
  }
}
```

---

### 6.2 获取签到日历

**接口**: `GET /api/v1/checkin/calendar`

**描述**: 获取指定月份的签到日历

**请求头**: 需要Token

**请求参数**:

```
year=2023
month=6
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "year": 2023,
    "month": 6,
    "checkedDays": [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    "streakDays": 3,
    "todayChecked": true,
    "milestones": [
      {
        "days": 1,
        "points": 5,
        "achieved": true,
        "claimed": true
      },
      {
        "days": 3,
        "points": 10,
        "achieved": true,
        "claimed": false
      },
      {
        "days": 7,
        "points": 15,
        "achieved": false,
        "claimed": false
      }
    ]
  }
}
```

---

### 6.3 领取里程碑奖励

**接口**: `POST /api/v1/checkin/milestone/claim`

**描述**: 领取连续签到里程碑奖励

**请求头**: 需要Token

**请求参数**:

```json
{
  "milestoneDays": 3            // 领取的里程碑天数
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "领取成功",
  "data": {
    "points": 10,
    "remainingPoints": 340,
    "milestone": {
      "days": 3,
      "points": 10,
      "claimed": true
    }
  }
}
```

---

## 7. 推荐模块API

### 7.1 获取本周热门

**接口**: `GET /api/v1/recommendations/weekly`

**描述**: 获取本周热门作品

**请求参数**:

```
category=all        // 分类：all/pop/rock/folk等
limit=10            // 数量限制，默认10
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "作品ID",
        "title": "夏日晚风",
        "author": "小明",
        "authorId": "作者ID",
        "coverUrl": "封面URL",
        "audioUrl": "音频URL",
        "duration": 185,
        "genre": "流行",
        "playCount": 12000,
        "likeCount": 350,
        "isHot": true
      }
    ]
  }
}
```

---

### 7.2 获取精选推荐

**接口**: `GET /api/v1/recommendations/featured`

**描述**: 获取编辑精选作品

**请求参数**:

```
category=all
limit=10
```

**返回数据**: 同上

---

### 7.3 获取新人作品

**接口**: `GET /api/v1/recommendations/new`

**描述**: 获取新人创作作品

**请求参数**:

```
category=all
limit=10
```

**返回数据**: 同上

---

## 8. 支付模块API

### 8.1 创建订单

**接口**: `POST /api/v1/payment/order`

**描述**: 创建积分购买订单

**请求头**: 需要Token

**请求参数**:

```json
{
  "packageId": "套餐ID",
  "points": 300,
  "amount": 19.9
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "订单创建成功",
  "data": {
    "orderId": "订单ID",
    "prepayId": "预支付ID",
    "paySign": "支付签名",
    "timeStamp": "时间戳",
    "nonceStr": "随机字符串",
    "package": "prepay_id=xxx",
    "signType": "RSA"
  }
}
```

---

### 8.2 查询订单状态

**接口**: `GET /api/v1/payment/order/:orderId`

**描述**: 查询订单支付状态

**请求头**: 需要Token

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "orderId": "订单ID",
    "status": "paid",             // pending/paid/cancelled/expired
    "points": 300,
    "bonusPoints": 30,
    "amount": 19.9,
    "createTime": "2023-06-16 10:30:00",
    "paidTime": "2023-06-16 10:32:00"
  }
}
```

---

### 8.3 支付回调

**接口**: `POST /api/v1/payment/callback/wechat`

**描述**: 微信支付回调接口（由微信服务器调用）

**说明**: 
- 验证签名
- 更新订单状态
- 增加用户积分
- 记录积分明细

---

## 9. 文件上传API

### 9.1 上传封面图片

**接口**: `POST /api/v1/upload/cover`

**描述**: 上传作品封面图片

**请求头**: 需要Token

**请求格式**: multipart/form-data

**请求参数**:

```
file: 图片文件
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "图片URL",
    "filename": "文件名",
    "size": 1024000
  }
}
```

---

### 9.2 上传音频文件

**接口**: `POST /api/v1/upload/audio`

**描述**: 上传音频文件

**请求头**: 需要Token

**请求格式**: multipart/form-data

**请求参数**:

```
file: 音频文件
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "音频URL",
    "filename": "文件名",
    "size": 5120000,
    "duration": 185
  }
}
```

---

## 10. 其他API

### 10.1 获取提示词模板

**接口**: `GET /api/v1/prompts/templates`

**描述**: 获取创作提示词模板列表

**请求参数**:

```
category=all        // 分类：all/love/friendship等
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "模板ID",
        "category": "爱情",
        "title": "初次见面",
        "content": "写一首关于初次见面就心动的爱情歌曲",
        "tags": ["浪漫", "甜蜜"]
      }
    ]
  }
}
```

---

### 10.2 提交反馈

**接口**: `POST /api/v1/feedback`

**描述**: 提交用户反馈

**请求头**: 需要Token

**请求参数**:

```json
{
  "type": "bug",                // bug/feature/other
  "content": "反馈内容",
  "contact": "联系方式",         // 可选
  "images": ["图片URL1", "图片URL2"]  // 可选
}
```

**返回数据**:

```json
{
  "code": 200,
  "msg": "提交成功",
  "data": {
    "feedbackId": "反馈ID"
  }
}
```

---

### 10.3 获取系统配置

**接口**: `GET /api/v1/system/config`

**描述**: 获取系统配置信息

**返回数据**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "version": "2.0.4",
    "minVersion": "2.0.0",
    "updateUrl": "更新链接",
    "pointsRules": {
      "createMusic": 30,          // 创作音乐消耗
      "generateLyrics": 10,       // AI生成歌词消耗
      "downloadWork": 5,          // 下载作品消耗
      "dailyCheckin": 5,          // 每日签到获得
      "watchAd": 10,              // 观看广告获得
      "shareWork": 5,             // 分享作品获得
      "inviteFriend": 20          // 邀请好友获得
    },
    "adConfig": {
      "dailyLimit": 3,            // 每日观看上限
      "adUnitId": "广告位ID"
    }
  }
}
```

---

## 11. WebSocket接口（可选）

### 11.1 音乐生成进度推送

**连接**: `wss://api.example.com/ws/music/generate`

**鉴权**: 连接时携带token参数

**消息格式**:

```json
{
  "type": "progress",
  "data": {
    "taskId": "任务ID",
    "progress": 45,               // 进度 0-100
    "status": "processing",       // pending/processing/completed/failed
    "message": "正在生成旋律..."
  }
}
```

---

## 12. 接口调用流程示例

### 12.1 完整创作流程

```
1. 用户登录
   POST /api/v1/auth/wechat/login

2. 选择创作方式
   
3. AI生成歌词（可选）
   POST /api/v1/create/lyrics/generate
   
4. 选择风格和声音

5. 生成音乐
   POST /api/v1/create/music/generate
   返回taskId
   
6. 轮询查询生成状态
   GET /api/v1/create/music/status/:taskId
   
7. 生成完成，保存作品
   POST /api/v1/works
   
8. 下载或分享
   POST /api/v1/works/:id/download
   POST /api/v1/works/:id/share
```

### 12.2 积分购买流程

```
1. 选择积分套餐

2. 创建订单
   POST /api/v1/payment/order
   
3. 调用微信支付
   wx.requestPayment(payParams)
   
4. 微信回调
   POST /api/v1/payment/callback/wechat
   
5. 查询订单状态
   GET /api/v1/payment/order/:orderId
   
6. 积分到账
   GET /api/v1/points/balance
```

---

## 13. 安全建议

### 13.1 Token机制

- 使用JWT Token
- Token有效期：7天
- 支持刷新Token
- 敏感操作需要二次验证

### 13.2 接口限流

- 每个用户每分钟最多60次请求
- 创作接口限流：每小时最多10次
- 支付接口限流：每分钟最多3次

### 13.3 数据加密

- 敏感数据传输使用HTTPS
- 密码使用bcrypt加密
- Token使用RSA签名

### 13.4 参数验证

- 所有输入参数进行严格验证
- 防止SQL注入
- 防止XSS攻击

---

## 14. 性能优化

### 14.1 缓存策略

- 配置信息缓存：1小时
- 用户信息缓存：30分钟
- 作品列表缓存：5分钟
- 推荐列表缓存：10分钟

### 14.2 分页加载

- 默认每页20条
- 最大每页100条
- 支持游标分页（大数据量）

### 14.3 CDN加速

- 图片资源使用CDN
- 音频文件使用CDN
- 静态资源使用CDN

---

## 15. 错误处理

### 15.1 错误示例

```json
{
  "code": 3000,
  "msg": "积分不足",
  "data": {
    "required": 30,
    "current": 15,
    "shortage": 15
  }
}
```

### 15.2 异常处理

- 所有异常统一捕获
- 返回友好错误信息
- 记录详细日志
- 及时告警

---

## 16. API版本管理

### 16.1 版本策略

- URL版本：/api/v1, /api/v2
- 向后兼容
- 废弃通知提前30天

### 16.2 变更日志

记录所有API变更：
- 新增接口
- 修改接口
- 废弃接口
- 参数变更

---

本文档定义了AI音乐创作助手的完整API接口规范，为后端开发提供了详细的实现依据。实际开发时可根据业务需求进行调整。
