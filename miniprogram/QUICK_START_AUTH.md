# 🚀 微信授权登录快速入门

## 3 步集成登录功能

### 步骤 1: 引入组件和 Mixin

```vue
<script>
import AuthModal from '@/components/auth-modal/auth-modal.vue'
import authMixin from '@/mixins/authMixin.js'

export default {
  mixins: [authMixin],
  components: { AuthModal }
}
</script>
```

### 步骤 2: 添加登录弹窗

```vue
<template>
  <view>
    <!-- 登录授权弹窗 -->
    <AuthModal 
      :show.sync="showAuthModal" 
      @success="handleAuthSuccess"
    />
    
    <!-- 你的页面内容 -->
  </view>
</template>
```

### 步骤 3: 添加登录拦截

```vue
<script>
export default {
  methods: {
    // 需要登录的功能
    handleSomeAction() {
      this.requireAuth(() => {
        // 登录成功后执行
        console.log('用户已登录，执行功能')
        uni.navigateTo({
          url: '/pages/target/page'
        })
      })
    }
  }
}
</script>
```

## ✅ 完成！

现在用户点击功能按钮时：
1. 如果未登录 → 自动弹出登录窗口
2. 登录成功 → 自动执行原始操作
3. 如果已登录 → 直接执行操作

## 📝 常见使用场景

```javascript
// 购买点数
handleBuyPoints() {
  this.requireAuth(() => {
    uni.navigateTo({ url: '/pages/user/points' })
  })
}

// AI 创作
handleAICreate() {
  this.requireAuth(() => {
    this.startAICreation()
  })
}

// 查看作品详情
viewWork(workId) {
  this.requireAuth(() => {
    uni.navigateTo({ url: `/pages/work/detail?id=${workId}` })
  })
}
```

## 🔍 检查登录状态

```javascript
// 方法 1: 使用 mixin 方法
if (this.isUserLoggedIn()) {
  console.log('已登录')
}

// 方法 2: 获取用户信息
const userInfo = this.getCurrentUser()
if (userInfo) {
  console.log('用户昵称:', userInfo.nickname)
}
```

## 🎯 已集成的页面

- ✅ **首页** (`pages/index/index.vue`)
  - 右上角音乐点数点击
  - 创作提示词模板使用
  - 创作工具入口

- ✅ **用户中心** (`pages/user/index.vue`)
  - 点击头像
  - 购买点数按钮

## 📖 完整文档

查看 `AUTH_LOGIN_GUIDE.md` 了解更多高级用法和最佳实践！
