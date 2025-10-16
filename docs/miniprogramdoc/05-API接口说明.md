# API接口说明

## API基础配置

### 接口地址
- **开发环境**: `http://192.168.1.118:3000`
- **备用地址**: `http://localhost:8080`
- **API前缀**: `/api`
- **完整基础URL**: `http://192.168.1.118:3000/api`

### 请求配置
- **Content-Type**: `application/json`
- **Authorization**: `Bearer {token}`（需要认证的接口）
- **超时时间**: 60秒

### 响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 状态码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权（token无效或过期）
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 一、认证相关接口

### 1. 微信小程序登录
```
POST /auth/wechat-login
```

**请求参数**:
```json
{
  "code": "微信登录code",
  "encryptedData": "加密数据",
  "iv": "加密算法初始向量"
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "openid": "xxx",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "phone": "手机号"
    },
    "token": "JWT token",
    "expiresIn": 7200
  }
}
```

### 2. 微信授权登录（新版）
```
POST /auth/wechat-auth
```

**请求参数**:
```json
{
  "code": "微信code",
  "phoneCode": "手机号code（可选）"
}
```

### 3. 检查登录状态
```
GET /auth/check
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "isLoggedIn": true,
    "user": { /* 用户信息 */ }
  }
}
```

### 4. 刷新Token
```
POST /auth/refresh
```

**需要认证**: 是

### 5. 退出登录
```
POST /auth/logout
```

**需要认证**: 是

---

## 二、用户相关接口

### 1. 获取用户信息
```
GET /user/profile
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "phone": "手机号",
    "gender": 1,
    "creditBalance": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. 更新用户信息
```
PUT /user/profile
```

**需要认证**: 是

**请求参数**:
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "gender": 1
}
```

### 3. 每日签到
```
POST /user/checkin
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "todayCheckedIn": true,
    "consecutiveDays": 5,
    "rewardCredits": 10,
    "totalRewards": 50
  }
}
```

### 4. 获取用户统计
```
GET /user/stats
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "totalWorks": 10,
    "totalCredits": 100,
    "consecutiveCheckin": 5
  }
}
```

---

## 三、音乐生成接口

### 1. 创建音乐生成任务
```
POST /music/generate
```

**需要认证**: 是

**请求参数**:
```json
{
  "title": "歌曲标题",
  "lyrics": "歌词内容",
  "style": "pop",
  "voice": "female",
  "type": "manual"
}
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "taskId": "task_xxx",
    "status": "pending",
    "estimatedTime": 60
  }
}
```

### 2. 获取任务详情
```
GET /music/:id
```

**需要认证**: 是

**路径参数**:
- `id`: 任务ID

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "id": "task_xxx",
    "title": "歌曲标题",
    "lyrics": "歌词内容",
    "style": "pop",
    "voice": "female",
    "status": "completed",
    "audioUrl": "音频文件URL",
    "coverUrl": "封面URL",
    "duration": 180,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 获取任务状态
```
GET /music/:id/status
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "status": "processing",
    "progress": 50,
    "estimatedRemaining": 30
  }
}
```

### 4. 获取用户音乐任务列表
```
GET /music/list
```

**需要认证**: 是

**查询参数**:
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认10）
- `status`: 状态筛选（可选：pending/processing/completed/failed）

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "list": [ /* 任务列表 */ ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 5. 删除音乐任务
```
DELETE /music/:id
```

**需要认证**: 是

---

## 四、AI歌词生成接口

### 1. 生成AI歌词
```
POST /ai/lyrics/generate
```

**需要认证**: 是

**请求参数**:
```json
{
  "prompt": "创作提示词",
  "style": "流行",
  "emotion": "快乐",
  "length": "medium"
}
```

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "requestId": "req_xxx",
    "lyrics": "生成的歌词内容",
    "title": "建议的歌曲标题",
    "creditsCost": 20
  }
}
```

### 2. 获取歌词生成历史
```
GET /ai/lyrics/history
```

**需要认证**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量

### 3. 评价歌词
```
POST /ai/lyrics/:requestId/rate
```

**需要认证**: 是

**请求参数**:
```json
{
  "rating": 5,
  "feedback": "评价反馈"
}
```

### 4. 收藏/取消收藏歌词
```
POST /ai/lyrics/:requestId/favorite
```

**需要认证**: 是

---

## 五、点数系统接口

### 1. 获取点数余额
```
GET /credit/balance
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "balance": 100,
    "totalEarned": 200,
    "totalSpent": 100
  }
}
```

### 2. 获取点数记录
```
GET /credit/logs
```

**需要认证**: 是

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `type`: 类型（earn/spend）

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "earn",
        "amount": 10,
        "reason": "每日签到",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50
  }
}
```

### 3. 获取点数统计
```
GET /credit/stats
```

**需要认证**: 是

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "daily": { /* 每日统计 */ },
    "weekly": { /* 每周统计 */ },
    "monthly": { /* 每月统计 */ }
  }
}
```

### 4. 获取点数套餐
```
GET /credit/packages
```

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "基础套餐",
      "credits": 100,
      "price": 9.9,
      "discount": 0,
      "isHot": false
    }
  ]
}
```

### 5. 消费点数
```
POST /credit/consume
```

**需要认证**: 是

**请求参数**:
```json
{
  "amount": 30,
  "reason": "生成音乐",
  "relatedId": "task_xxx"
}
```

### 6. 奖励点数
```
POST /credit/reward
```

**需要认证**: 是

**请求参数**:
```json
{
  "amount": 10,
  "reason": "每日签到"
}
```

---

## 六、Banner管理接口

### 1. 获取启用的Banner
```
GET /banners/active
```

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "Banner标题",
      "description": "Banner描述",
      "imageUrl": "图片URL",
      "linkUrl": "跳转链接",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

### 2. 获取Banner列表（管理后台）
```
GET /banner/list
```

**需要认证**: 是（管理员）

---

## 七、提示词模板接口

### 1. 获取启用的提示词模板
```
GET /prompt-template/list
```

**查询参数**:
- `category`: 分类（可选）
- `isActive`: 是否启用（默认true）

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "夏日海滩",
      "content": "创作一首关于夏日海边的轻快歌曲...",
      "icon": "☀️",
      "iconBg": "bg-theme-blue",
      "tags": ["欢快", "夏日"],
      "category": "季节",
      "sortOrder": 1
    }
  ]
}
```

### 2. 记录提示词使用统计
```
POST /prompt-template/usage
```

**请求参数**:
```json
{
  "templateId": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 八、热门推荐接口

### 1. 获取热门推荐音乐
```
GET /hot-recommendation/list
```

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `isHot`: 是否热门（可选）
- `category`: 分类（可选）

**响应数据**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "title": "音乐标题",
      "artist": "艺术家",
      "genre": "流行",
      "duration": "3:45",
      "coverUrl": "封面URL",
      "audioUrl": "音频URL",
      "playCount": 2500,
      "tags": ["夏日", "欢快"],
      "category": "流行",
      "isHot": true
    }
  ]
}
```

### 2. 获取推荐分类
```
GET /hot-recommendation/categories
```

**响应数据**:
```json
{
  "code": 200,
  "data": [
    { "id": "pop", "name": "流行" },
    { "id": "rock", "name": "摇滚" }
  ]
}
```

### 3. 根据分类获取推荐
```
GET /hot-recommendation/category/:categoryId
```

**路径参数**:
- `categoryId`: 分类ID

### 4. 记录音乐播放统计
```
POST /hot-recommendation/play
```

**请求参数**:
```json
{
  "musicId": 1,
  "action": "play",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5. 切换音乐喜欢状态
```
POST /hot-recommendation/:id/toggle-like
```

**需要认证**: 是

---

## 九、文件上传接口

### 1. 文件上传
```
POST /file/upload
```

**需要认证**: 是

**请求类型**: `multipart/form-data`

**表单数据**:
- `file`: 文件对象
- `type`: 文件类型（image/audio/video）
- `purpose`: 上传目的（avatar/cover/audio等）

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "fileId": 1,
    "url": "文件访问URL",
    "filename": "文件名",
    "size": 1024,
    "mimeType": "audio/mpeg"
  }
}
```

### 2. 获取文件信息
```
GET /file/:id
```

**需要认证**: 是

### 3. 文件下载
```
GET /file/:id/download
```

**需要认证**: 是

---

## 十、搜索接口

### 1. 搜索音乐
```
GET /music/search
```

**查询参数**:
- `keyword`: 搜索关键词
- `page`: 页码
- `pageSize`: 每页数量

**响应数据**:
```json
{
  "code": 200,
  "data": {
    "list": [ /* 搜索结果 */ ],
    "total": 100,
    "keyword": "搜索关键词"
  }
}
```

---

## API调用示例

### 使用示例
```javascript
// 在页面中调用
async loadUserProfile() {
  try {
    const response = await this.$minApi.getUserProfile()
    if (response.code === 200) {
      this.userInfo = response.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 带参数的请求
async loadMusicList() {
  try {
    const response = await this.$minApi.getMusicTasks({
      page: this.page,
      pageSize: 20,
      status: 'completed'
    })
    if (response.code === 200) {
      this.musicList = response.data.list
    }
  } catch (error) {
    console.error('加载音乐列表失败:', error)
  }
}

// 文件上传
async uploadCover(filePath) {
  try {
    const response = await this.$minApi.uploadFile(
      filePath,
      'cover.jpg',
      'image',
      'music_cover'
    )
    if (response.code === 200) {
      this.coverUrl = response.data.url
    }
  } catch (error) {
    console.error('上传失败:', error)
  }
}
```

### 错误处理
```javascript
try {
  const response = await this.$minApi.someApi()
  if (response.code === 200) {
    // 处理成功响应
  } else {
    // 处理业务错误
    uni.showToast({
      title: response.message || '操作失败',
      icon: 'none'
    })
  }
} catch (error) {
  // 处理网络错误
  if (error.statusCode === 401) {
    // 未授权，跳转登录
    uni.reLaunch({ url: '/pages/login/login' })
  } else {
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  }
}
```

---

## 接口统计

- **认证相关**: 5个
- **用户相关**: 4个
- **音乐生成**: 5个
- **AI歌词**: 4个
- **点数系统**: 6个
- **Banner管理**: 2个
- **提示词模板**: 2个
- **热门推荐**: 5个
- **文件上传**: 3个
- **搜索**: 1个

**总计**: 37个核心接口
