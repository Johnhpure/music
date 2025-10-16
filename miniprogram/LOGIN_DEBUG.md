# 微信小程序登录调试指南

## 🔧 问题解决情况

### ✅ 已修复的问题

1. **TypeError: Cannot read property '$minApi' of undefined**
   - 原因：在静态方法中无法正确访问Vue实例
   - 解决：通过 `getCurrentPages()` 获取当前页面实例，并添加备用的 `uni.request` 直接调用

2. **开发模式支持**
   - 添加了后端接口调用失败时的模拟数据支持
   - 5秒请求超时设置
   - 自动降级到模拟登录

### ⚠️ 警告信息说明

以下警告不影响功能正常使用：

1. **SharedArrayBuffer警告**
   - 这是浏览器兼容性警告，不影响小程序功能
   
2. **wx.getSystemInfoSync is deprecated**
   - 这是uni-app框架或第三方组件的兼容性警告
   - 不影响登录功能

## 🧪 测试步骤

### 1. 测试登录功能

```javascript
// 在小程序中测试登录
1. 打开创作选择页面
2. 点击"自己写歌词"或"AI帮我写"按钮
3. 应该弹出登录授权弹窗
4. 点击"立即登录"
5. 在微信授权弹窗中选择"允许"或"拒绝"
6. 查看控制台日志确认登录流程
```

### 2. 预期日志输出

```
🔐 开始微信登录流程...
✅ 获取登录code成功: [code]
✅ 获取用户信息成功: [用户昵称]  (如果用户授权)
⚠️ 用户取消授权或获取用户信息失败，仅使用code登录  (如果用户拒绝)
🔧 开发模式：使用模拟登录数据  (如果后端没启动)
✅ Vuex状态更新成功
🎉 微信登录完成!
```

### 3. 开发模式模拟数据

如果后端服务器没有启动，系统会自动使用以下模拟数据：

```json
{
  "userInfo": {
    "id": "mock_user_[时间戳]",
    "openId": "mock_openid_[code后8位]",
    "nickName": "音乐创作者",
    "avatarUrl": "/static/img/profile.svg",
    "points": 320,
    "createdAt": "[当前时间]"
  },
  "token": "mock_jwt_token_[时间戳]"
}
```

## 🔍 调试方法

### 查看登录状态

在任意页面的控制台执行：

```javascript
// 检查登录状态
const WeChatAuth = require('@/utils/wechatAuth').default
console.log('登录状态:', WeChatAuth.isLoggedIn())
console.log('用户信息:', WeChatAuth.getUserInfo())

// 查看存储信息
console.log('本地用户信息:', uni.getStorageSync('userInfo'))
console.log('本地token:', uni.getStorageSync('token'))
```

### 清除登录状态（测试用）

```javascript
// 清除所有登录信息
uni.removeStorageSync('userInfo')
uni.removeStorageSync('token')
uni.removeStorageSync('loginTime')
console.log('登录状态已清除')
```

## 🚀 后端接口对接

### 如果需要对接真实后端

1. **启动后端服务**：确保 `http://localhost:3000` 可访问
2. **实现登录接口**：`POST /api/auth/wechat-login`
3. **接口格式参考**：见 `WECHAT_LOGIN_IMPLEMENTATION.md`

### 如果暂时使用模拟数据

当前配置已支持开发模式下的模拟数据，无需修改代码。

## 📱 在不同场景下测试

### 1. 创作功能登录
- 页面：`pages/creation/select.vue`
- 触发：点击"自己写歌词"或"AI帮我写"
- 提示：登录后开始创作您的专属音乐

### 2. 个人中心登录
- 页面：`pages/user/index.vue`
- 触发：点击用户头像
- 提示：登录后可查看和管理您的作品、点数记录

### 3. 购买点数登录
- 页面：`pages/user/purchase.vue`
- 触发：进入页面自动检查
- 提示：购买点数需要登录账号

## 🎯 测试重点

### 必须测试的场景
- ✅ 用户同意微信授权
- ✅ 用户拒绝微信授权
- ✅ 网络异常情况
- ✅ 重复登录处理
- ✅ 登录状态持久化

### 预期行为
- 登录成功后自动更新页面显示
- 已登录用户不重复弹出登录框
- 网络异常时降级到模拟数据（开发模式）
- 用户取消登录时停止后续流程

## 🔧 故障排除

### 如果登录仍然失败

1. **检查网络**：确认小程序可以访问网络
2. **查看控制台**：详细错误信息在开发者工具控制台
3. **清除缓存**：删除小程序缓存重新测试
4. **检查权限**：确认小程序有获取用户信息的权限

### 常见错误处理

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| 获取code失败 | 网络问题或小程序配置 | 检查网络和AppID配置 |
| 用户拒绝授权 | 用户主动拒绝 | 正常流程，使用code登录 |
| 后端接口调用失败 | 服务器未启动 | 使用开发模式模拟数据 |
| Vuex状态更新失败 | Store未初始化 | 刷新页面或重启小程序 |

---

## ✅ 测试清单

- [ ] 创作页面登录触发正常
- [ ] 个人中心头像点击正常  
- [ ] 购买页面自动登录检查正常
- [ ] 用户同意授权流程正常
- [ ] 用户拒绝授权流程正常
- [ ] 登录状态保存和读取正常
- [ ] 页面数据更新正常
- [ ] 退出登录功能正常

**修复完成！现在可以正常测试微信小程序登录功能了！** 🎉
