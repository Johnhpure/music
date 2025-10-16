# 微信一键授权登录使用指南

## 📱 功能说明

这是一个完整的微信小程序一键授权登录解决方案，支持：
- ✅ 微信手机号一键登录
- ✅ 用户头像昵称授权（可选）
- ✅ 登录状态拦截
- ✅ 统一的登录弹窗组件
- ✅ 符合当前 UI 深色主题风格

## 🎯 实现原理

### 登录流程

```
用户点击功能按钮
    ↓
检查登录状态（requireAuth）
    ↓
未登录 → 显示登录弹窗
    ↓
用户点击"微信一键登录"
    ↓
1. 获取手机号授权 (getPhoneNumber)
2. 调用 wx.login 获取 code
3. 调用后端 /api/v1/auth/wechat/login
4. 调用后端 /api/v1/auth/wechat/phone
    ↓
保存 token 和 userInfo 到本地
    ↓
执行原始回调函数
```

## 📦 文件结构

```
miniprogram/
├── components/
│   └── auth-modal/
│       └── auth-modal.vue          # 登录弹窗组件
├── mixins/
│   └── authMixin.js                 # 认证 Mixin
└── pages/
    └── user/
        └── index.vue                # 示例页面（已集成）
```

## 🚀 快速开始

### 1. 在页面中引入

```vue
<template>
  <view>
    <!-- 登录授权弹窗 -->
    <AuthModal 
      :show.sync="showAuthModal" 
      @success="handleAuthSuccess"
    />
    
    <!-- 需要登录的功能按钮 -->
    <button @click="handlePurchase">购买点数</button>
    <button @click="handleCreateMusic">AI 创作音乐</button>
  </view>
</template>

<script>
import AuthModal from '@/components/auth-modal/auth-modal.vue'
import authMixin from '@/mixins/authMixin.js'

export default {
  mixins: [authMixin],
  components: {
    AuthModal
  },
  methods: {
    // 购买点数 - 需要登录
    handlePurchase() {
      this.requireAuth(() => {
        // 登录成功后执行
        uni.navigateTo({
          url: '/pages/user/points'
        })
      })
    },
    
    // AI 创作音乐 - 需要登录
    handleCreateMusic() {
      this.requireAuth(() => {
        // 登录成功后执行
        this.startMusicCreation()
      })
    },
    
    startMusicCreation() {
      // 你的创作逻辑
    }
  }
}
</script>
```

### 2. 在多个入口添加登录拦截

#### 方法 1: 使用 `requireAuth` 方法（推荐）

```javascript
// 点击购买按钮
handlePurchaseClick() {
  this.requireAuth(() => {
    // 已登录，执行购买逻辑
    this.goPurchasePage()
  })
}

// 点击 AI 写歌词
handleAILyrics() {
  this.requireAuth(() => {
    // 已登录，调用 AI
    this.callAIService()
  })
}

// 查看音乐点数明细
handleViewPoints() {
  this.requireAuth(() => {
    // 已登录，跳转页面
    uni.navigateTo({
      url: '/pages/user/points?activeTab=history'
    })
  })
}
```

#### 方法 2: 手动检查登录状态

```javascript
handleSomeAction() {
  if (this.isUserLoggedIn()) {
    // 已登录，直接执行
    this.doSomething()
  } else {
    // 未登录，显示登录弹窗
    this.showAuthModal = true
    // 保存回调
    this._authCallback = () => {
      this.doSomething()
    }
  }
}
```

## 🎨 登录弹窗组件 API

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show | Boolean | false | 是否显示弹窗 |
| showAvatarAuth | Boolean | false | 是否显示头像授权按钮 |
| onSuccess | Function | null | 登录成功回调函数 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| @success | 登录成功 | (data) - 登录返回的数据 |
| @close | 关闭弹窗 | - |
| @update:show | 显示状态更新 | (visible) - 当前显示状态 |

### 使用示例

```vue
<AuthModal 
  :show.sync="showAuthModal"
  :showAvatarAuth="true"
  @success="handleAuthSuccess"
  @close="handleModalClose"
/>
```

## 🔧 authMixin API

### 数据属性

| 属性 | 类型 | 说明 |
|------|------|------|
| showAuthModal | Boolean | 登录弹窗显示状态 |

### 方法

#### `isUserLoggedIn()`
检查用户是否已登录

**返回值**: `Boolean`

```javascript
if (this.isUserLoggedIn()) {
  console.log('用户已登录')
}
```

#### `requireAuth(callback, options)`
需要登录才能执行的操作

**参数**:
- `callback` (Function) - 登录成功后执行的回调
- `options` (Object) - 配置选项（可选）

**返回值**: `Boolean` - 是否已登录

```javascript
this.requireAuth(() => {
  console.log('登录成功，执行回调')
}, {
  // 可选配置
})
```

#### `handleAuthSuccess(data)`
登录成功的处理函数（自动调用）

**参数**:
- `data` (Object) - 登录返回的数据

#### `logout()`
退出登录

```javascript
this.logout()
```

#### `getCurrentUser()`
获取当前用户信息

**返回值**: `Object | null`

```javascript
const userInfo = this.getCurrentUser()
console.log(userInfo.nickname, userInfo.phone)
```

#### `updateUserInfo(userInfo)`
更新用户信息到本地存储

**参数**:
- `userInfo` (Object) - 用户信息对象

```javascript
this.updateUserInfo({
  nickname: '新昵称',
  avatar: 'https://...'
})
```

## 💡 常见使用场景

### 场景 1: 首页右上角音乐点数点击

```vue
<!-- pages/index/index.vue -->
<view class="points-badge" @click="handlePointsClick">
  <text class="music-icon">🎵</text>
  <text class="points-number">{{ pointsCount }}点</text>
</view>

<script>
export default {
  mixins: [authMixin],
  methods: {
    handlePointsClick() {
      this.requireAuth(() => {
        uni.navigateTo({
          url: '/pages/user/points?activeTab=history'
        })
      })
    }
  }
}
</script>
```

### 场景 2: AI 帮我写歌词按钮

```vue
<!-- pages/create/index.vue -->
<button class="ai-button" @click="handleAICreate">AI 帮我写</button>

<script>
export default {
  mixins: [authMixin],
  methods: {
    handleAICreate() {
      this.requireAuth(() => {
        // 检查点数是否足够
        const user = this.getCurrentUser()
        if (user.points < 20) {
          uni.showModal({
            title: '点数不足',
            content: '创作歌曲需要 20 点数，是否前往购买？',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/user/points?activeTab=free'
                })
              }
            }
          })
        } else {
          // 开始 AI 创作
          this.startAICreation()
        }
      })
    }
  }
}
</script>
```

### 场景 3: 购买点数按钮

```vue
<!-- pages/user/points.vue -->
<button class="buy-button" @click="handleBuyPoints">购买点数</button>

<script>
export default {
  mixins: [authMixin],
  methods: {
    handleBuyPoints() {
      this.requireAuth(() => {
        // 显示支付面板
        this.showPaymentPanel = true
      })
    }
  }
}
</script>
```

### 场景 4: 点击用户头像

```vue
<!-- pages/user/index.vue -->
<button 
  class="avatar-button" 
  @tap="handleAvatarClick"
>
  <image class="user-avatar" :src="userImage"></image>
</button>

<script>
export default {
  mixins: [authMixin],
  methods: {
    handleAvatarClick() {
      this.requireAuth(() => {
        // 登录后可以修改头像
        console.log('用户已登录，可以修改头像')
      })
    }
  }
}
</script>
```

## 🌐 全局事件监听

系统会触发以下全局事件，你可以在任何页面监听：

```javascript
// App.vue 或任意页面
onLoad() {
  // 监听用户登录
  uni.$on('userLoggedIn', (data) => {
    console.log('用户已登录:', data)
    // 刷新用户相关数据
  })
  
  // 监听用户退出
  uni.$on('userLoggedOut', () => {
    console.log('用户已退出')
    // 清理用户相关数据
  })
  
  // 监听用户信息更新
  uni.$on('userInfoUpdated', (userInfo) => {
    console.log('用户信息已更新:', userInfo)
  })
}

onUnload() {
  // 取消监听
  uni.$off('userLoggedIn')
  uni.$off('userLoggedOut')
  uni.$off('userInfoUpdated')
}
```

## 🔐 后端接口要求

### 1. 微信登录接口

```
POST /api/v1/auth/wechat/login
```

**请求参数**:
```json
{
  "code": "微信 wx.login 返回的 code"
}
```

**返回数据**:
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "JWT Token",
    "userInfo": {
      "openid": "用户 openid",
      "nickname": "用户昵称",
      "avatar": "用户头像",
      ...
    }
  }
}
```

### 2. 获取手机号接口

```
POST /api/v1/auth/wechat/phone
```

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "code": "getPhoneNumber 返回的 code"
}
```

**返回数据**:
```json
{
  "code": 200,
  "msg": "获取手机号成功",
  "data": {
    "phone": "13800138000",
    "countryCode": "86"
  }
}
```

## 🎯 最佳实践

### 1. 统一的错误处理

```javascript
// 在 authMixin 中已经处理了常见错误
// 你可以监听错误事件进行额外处理
uni.$on('authError', (error) => {
  console.error('认证错误:', error)
  // 上报错误日志
})
```

### 2. 登录状态持久化

```javascript
// 系统会自动将 token 和 userInfo 保存到本地存储
// 重启小程序后会自动恢复登录状态
```

### 3. Token 过期处理

```javascript
// 在请求拦截器中检查 401 状态
// miniprogram/api/api.js
minRequest.interceptors.response((response) => {
  if (response.statusCode === 401) {
    // Token 过期，清除登录信息
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 提示用户重新登录
    uni.showModal({
      title: '登录已过期',
      content: '请重新登录',
      showCancel: false,
      success: () => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  }
  return response.data
})
```

## ⚠️ 注意事项

1. **手机号授权**：
   - 需要在微信公众平台开通"手机号快速验证组件"功能
   - 个人账号无法使用此功能
   - 需要付费服务

2. **用户隐私**：
   - 必须在小程序中添加《用户协议》和《隐私政策》
   - 获取用户信息前必须明确告知用途

3. **兼容性**：
   - `getPhoneNumber` 需要基础库 2.21.2 或以上
   - `chooseAvatar` 需要基础库 2.21.0 或以上

4. **测试环境**：
   - 开发环境可以使用测试号进行调试
   - 正式环境需要已认证的企业小程序

## 🐛 常见问题

### Q: 点击登录按钮没有反应？
A: 检查以下几点：
1. 是否正确引入 `AuthModal` 组件
2. 是否正确使用 `authMixin`
3. 查看控制台是否有错误信息

### Q: 手机号授权失败？
A: 
1. 确认小程序已开通"手机号快速验证组件"
2. 确认后端接口已正确实现
3. 查看微信返回的错误信息

### Q: 登录成功但页面数据没更新？
A: 
1. 在 `handleAuthSuccess` 中刷新数据
2. 监听全局 `userLoggedIn` 事件更新数据

## 📄 License

MIT License

## 👨‍💻 作者

Factory AI Assistant
