# 音乐点数余额功能API接入文档

> **创建时间**: 2025-10-15  
> **功能**: 小程序首页音乐点数获取与显示  
> **状态**: ✅ 已完成

---

## 📋 功能概述

实现了小程序首页右上角的音乐点数获取和显示功能，通过真实API接口从后端获取用户的点数余额信息。

### 功能特点

- ✅ 实时从后端API获取用户点数余额
- ✅ 使用Vuex状态管理统一管理点数数据
- ✅ 支持页面切换时自动刷新点数
- ✅ 点击点数区域可跳转到点数详情页
- ✅ 完整的JWT认证保护
- ✅ 优雅的错误处理和降级策略

---

## 🏗️ 架构设计

### 数据流向

```
用户登录 → JWT Token
    ↓
小程序首页加载
    ↓
调用 Vuex Action: getCreditBalance()
    ↓
API请求: GET /api/credit/balance (带JWT Token)
    ↓
后端验证Token → CreditService.getUserBalance()
    ↓
返回: { balance, totalEarned, totalSpent }
    ↓
更新 Vuex State: creditBalance
    ↓
首页显示点数
```

### 技术栈

**后端 (NestJS)**
- TypeORM - 数据库ORM
- JWT - 用户认证
- Passport - 认证中间件

**前端 (uni-app + Vue)**
- Vuex - 状态管理
- uni.request - HTTP请求
- JWT Token - API认证

---

## 🔧 实现细节

### 1. 后端API实现

#### 1.1 Controller层 (`backend/src/modules/credit/credit.controller.ts`)

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Public } from '@modules/auth/decorators/public.decorator';
import { CreditService } from './credit.service';

@Controller('credit')
@UseGuards(JwtAuthGuard)  // 控制器级别的JWT守卫
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  /**
   * 获取用户点数余额
   * 需要JWT认证
   * GET /api/credit/balance
   */
  @Get('balance')
  async getBalance(@Request() req) {
    return this.creditService.getUserBalance(req.user.id);
  }

  /**
   * 获取点数套餐（公开接口）
   * 不需要认证
   * GET /api/credit/packages
   */
  @Public()
  @Get('packages')
  async getCreditPackages() {
    return this.creditService.getCreditPackages();
  }
}
```

**关键点：**
- 使用 `@UseGuards(JwtAuthGuard)` 保护所有接口
- `getBalance()` 需要认证，从 `req.user.id` 获取用户ID
- `getCreditPackages()` 使用 `@Public()` 标记为公开接口

#### 1.2 Service层 (`backend/src/modules/credit/credit.service.ts`)

```typescript
async getUserBalance(userId: number): Promise<{
  balance: number;
  totalEarned: number;
  totalSpent: number;
}> {
  // 1. 获取用户当前余额
  const user = await this.userService.findOne(userId);
  
  // 2. 统计总收入（所有正数记录）
  const earnedResult = await this.creditLogRepository
    .createQueryBuilder('log')
    .select('SUM(log.amount)', 'total')
    .where('log.user_id = :userId', { userId })
    .andWhere('log.amount > 0')
    .getRawOne();
  
  // 3. 统计总支出（所有负数记录）
  const spentResult = await this.creditLogRepository
    .createQueryBuilder('log')
    .select('SUM(ABS(log.amount))', 'total')
    .where('log.user_id = :userId', { userId })
    .andWhere('log.amount < 0')
    .getRawOne();

  return {
    balance: Number(user.credit) || 0,
    totalEarned: Number(earnedResult?.total) || 0,
    totalSpent: Number(spentResult?.total) || 0,
  };
}
```

**返回数据结构：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "balance": 320,
    "totalEarned": 500,
    "totalSpent": 180
  }
}
```

---

### 2. 前端实现

#### 2.1 API封装 (`miniprogram/api/api.js`)

```javascript
export default {
  apis: {
    /**
     * 获取用户点数余额
     * 需要JWT认证
     */
    getCreditBalance() {
      return minRequest.get('/credit/balance')
    },
    
    /**
     * 获取点数套餐列表（公开接口）
     */
    getCreditPackages() {
      return minRequest.get('/credit/packages')
    }
  }
}
```

**请求拦截器自动添加JWT Token：**
```javascript
minRequest.interceptors.request((request) => {
  const user = Vue.prototype.$store.getters.user
  const token = user?.token || user?.ApiToken;
  
  if (user && token) {
    request.header = {
      ...request.header,
      'Authorization': `Bearer ${token}`
    }
  }
  return request
})
```

#### 2.2 Vuex Store (`miniprogram/store/modules/user.js`)

```javascript
export default {
  state: {
    user: null,
    creditBalance: 0,          // 用户点数余额
    lastCreditUpdate: null     // 最后更新时间
  },
  
  mutations: {
    // 更新用户点数
    updateCreditBalance(state, balance) {
      state.creditBalance = balance
      state.lastCreditUpdate = Date.now()
      
      // 同步更新用户信息中的点数
      if (state.user) {
        state.user.creditBalance = balance
        Vue.prototype.$cache.set('_userInfo', state.user, 0)
      }
    }
  },
  
  actions: {
    // 获取用户点数余额
    async getCreditBalance({ commit, getters }) {
      if (!getters.isLoggedIn) {
        throw new Error('用户未登录')
      }

      try {
        const response = await minApi.apis.getCreditBalance()
        
        if (response.code === 200) {
          const balance = response.data.balance || 0
          commit('updateCreditBalance', balance)
          return balance
        } else {
          throw new Error(response.message || '获取点数失败')
        }
      } catch (error) {
        console.error('获取点数余额失败:', error)
        throw error
      }
    }
  },
  
  getters: {
    // 获取用户点数余额
    userCreditBalance: (state) => {
      return state.creditBalance
    }
  }
}
```

#### 2.3 首页组件 (`miniprogram/pages/index/index.vue`)

**模板部分：**
```vue
<template>
  <view class="home-container">
    <!-- 顶部导航栏和音乐点数显示 -->
    <view class="top-navbar">
      <text class="app-title">AI音乐创作</text>
      <view class="music-points" @click="handlePointsClick">
        <text>🎵</text>
        <text class="points-count">{{userCreditBalance}}点</text>
      </view>
    </view>
    
    <!-- 其他页面内容 -->
  </view>
</template>
```

**脚本部分：**
```javascript
export default {
  data() {
    return {
      userCreditBalance: 0,  // 显示的点数
      loadingPoints: false   // 加载状态
    }
  },
  
  async onLoad() {
    // 初始化时从store中获取已有的点数
    this.userCreditBalance = this.$store.getters.userCreditBalance || 0;
    
    // 尝试自动登录
    await this.checkAutoLogin();
    
    // 加载用户点数
    await this.loadUserCreditBalance();
  },
  
  async onShow() {
    // 页面显示时刷新数据（从其他页面返回时）
    this.userCreditBalance = this.$store.getters.userCreditBalance || this.userCreditBalance;
    
    // 异步更新点数
    await this.loadUserCreditBalance();
  },
  
  methods: {
    // 处理点数按钮点击
    async handlePointsClick() {
      // 先刷新点数
      await this.loadUserCreditBalance();
      
      // 跳转到点数详情页
      uni.navigateTo({
        url: '/pages/user/points'
      });
    },
    
    // 获取用户点数余额
    async loadUserCreditBalance() {
      // 检查用户是否已登录
      if (!this.$store.getters.isLoggedIn) {
        this.userCreditBalance = 0;
        return;
      }
      
      if (this.loadingPoints) return;
      this.loadingPoints = true;
      
      try {
        // 使用Vuex action获取点数
        const balance = await this.$store.dispatch('getCreditBalance');
        this.userCreditBalance = balance;
        console.log('✅ 点数更新成功:', this.userCreditBalance);
      } catch (error) {
        console.error('❌ 获取点数余额失败:', error);
        // 网络错误时显示当前store中的点数或默认值
        this.userCreditBalance = this.$store.getters.userCreditBalance || 0;
        if (this.userCreditBalance === 0) {
          this.userCreditBalance = '--';
        }
      } finally {
        this.loadingPoints = false;
      }
    }
  }
}
```

**样式部分：**
```scss
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 32rpx;
  background-color: #1E1E1E;
}

.music-points {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
  border-radius: 36rpx;
  padding: 12rpx 24rpx;
  cursor: pointer;
}

.points-count {
  font-size: 28rpx;
  font-weight: 500;
  color: #FFFFFF;
}
```

---

## 🧪 API测试

### 测试环境
- 后端地址: `http://localhost:3000`
- API前缀: `/api`
- 完整地址: `http://localhost:3000/api`

### 1. 测试获取点数余额（需要认证）

**请求：**
```bash
curl -X GET "http://localhost:3000/api/credit/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "balance": 320,
    "totalEarned": 500,
    "totalSpent": 180
  },
  "timestamp": "2025-10-15T02:52:50.636Z"
}
```

**未认证响应 (401)：**
```json
{
  "code": 401,
  "message": "Unauthorized",
  "error": "INTERNAL_ERROR",
  "timestamp": "2025-10-15T02:52:50.636Z",
  "path": "/api/credit/balance",
  "method": "GET"
}
```

### 2. 测试获取套餐列表（公开接口）

**请求：**
```bash
curl -X GET "http://localhost:3000/api/credit/packages" \
  -H "Content-Type: application/json"
```

**成功响应 (200)：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "入门套餐",
      "amount": "100.00",
      "price": "9.90",
      "bonus": 0,
      "description": "适合新手用户",
      "is_active": true,
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "标准套餐",
      "amount": "500.00",
      "price": "49.90",
      "bonus": 50,
      "description": "最受欢迎",
      "is_active": true,
      "sort_order": 2
    }
  ],
  "timestamp": "2025-10-15T02:52:56.582Z"
}
```

---

## 🔒 安全性

### JWT认证流程

1. **用户登录** → 获取JWT Token
2. **Token存储** → 本地存储（uni.storage）
3. **API请求** → 自动在请求头添加 `Authorization: Bearer {token}`
4. **后端验证** → JwtAuthGuard验证Token有效性
5. **获取用户** → 从Token解析用户ID
6. **返回数据** → 返回该用户的点数信息

### 权限控制

| 接口 | 路径 | 认证要求 | 说明 |
|------|------|----------|------|
| 获取余额 | GET /api/credit/balance | ✅ 需要 | 只能查看自己的余额 |
| 消费点数 | POST /api/credit/consume | ✅ 需要 | 只能消费自己的点数 |
| 奖励点数 | POST /api/credit/reward | ✅ 需要 | 系统奖励给用户 |
| 点数记录 | GET /api/credit/logs | ✅ 需要 | 只能查看自己的记录 |
| 套餐列表 | GET /api/credit/packages | ❌ 公开 | 所有人都能查看 |

---

## 📱 用户体验优化

### 1. 加载策略

```javascript
// 优先显示缓存的点数
this.userCreditBalance = this.$store.getters.userCreditBalance || 0;

// 然后异步加载最新数据
await this.loadUserCreditBalance();
```

### 2. 错误处理

```javascript
try {
  const balance = await this.$store.dispatch('getCreditBalance');
  this.userCreditBalance = balance;
} catch (error) {
  // 显示缓存的点数
  this.userCreditBalance = this.$store.getters.userCreditBalance || 0;
  
  // 网络错误显示 '--'
  if (this.userCreditBalance === 0) {
    this.userCreditBalance = '--';
  }
}
```

### 3. 自动刷新

- **onLoad**: 页面首次加载时获取
- **onShow**: 从其他页面返回时刷新
- **点击事件**: 点击点数区域时刷新

---

## 🐛 常见问题

### 1. 点数显示为 "--" 或 0

**原因：**
- 用户未登录
- Token过期
- 网络请求失败

**解决方案：**
```javascript
// 检查登录状态
if (!this.$store.getters.isLoggedIn) {
  this.userCreditBalance = 0;
  return;
}

// 重新登录
await this.$store.dispatch('wechatLogin');
```

### 2. API返回401错误

**原因：**
- JWT Token无效或过期
- 请求头未正确添加Token

**解决方案：**
```javascript
// 检查Token是否存在
const token = uni.getStorageSync('token');
console.log('Token:', token);

// 重新获取Token
const result = await WeChatAuth.login();
```

### 3. 点数不同步

**原因：**
- Vuex状态未更新
- 多个页面同时修改

**解决方案：**
```javascript
// 强制刷新点数
await this.$store.dispatch('getCreditBalance');

// 使用Vuex统一管理
this.userCreditBalance = this.$store.getters.userCreditBalance;
```

---

## 📊 数据流程图

```
┌─────────────────┐
│   用户登录       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  获取JWT Token  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  存储到本地      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  首页加载        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vuex: getCreditBalance() │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API: GET /credit/balance │
│ Header: Authorization    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 后端验证Token    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CreditService   │
│ getUserBalance()│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 返回点数数据     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 更新Vuex State  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 首页显示点数     │
└─────────────────┘
```

---

## ✅ 验收清单

- [x] 后端API实现完整（GET /api/credit/balance）
- [x] JWT认证守卫正常工作
- [x] 前端API封装完整
- [x] Vuex Store状态管理完整
- [x] 首页UI显示正常
- [x] 点击跳转功能正常
- [x] 自动刷新机制工作
- [x] 错误处理完善
- [x] API测试通过
- [x] 代码文档完整

---

## 📝 更新日志

### v1.0.0 (2025-10-15)
- ✅ 实现后端credit balance API
- ✅ 添加JWT认证保护
- ✅ 实现前端Vuex状态管理
- ✅ 实现首页点数显示
- ✅ 完成API测试
- ✅ 编写完整文档

---

## 🔗 相关文档

- [API文档 - 点数系统接口](./API_DOCUMENTATION.md#五点数系统接口)
- [小程序页面功能说明](../miniprogramdoc/03-页面功能详细说明.md)
- [后端架构设计](./BACKEND_ARCHITECTURE_DESIGN.md)

---

## 👥 维护者

- 开发团队
- 最后更新: 2025-10-15
