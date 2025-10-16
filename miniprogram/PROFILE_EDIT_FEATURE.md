# 小程序用户资料编辑功能文档

## 📋 功能概述

实现了点击个人中心头像触发微信授权并编辑用户资料的功能，包括头像选择和昵称输入。

## ✨ 功能特性

- ✅ 点击头像触发编辑
- ✅ 使用微信最新的头像昵称填写能力
- ✅ 支持头像选择（调用微信原生选择器）
- ✅ 支持昵称输入（微信安全检测）
- ✅ 头像上传到服务器（可选）
- ✅ 保存到后端数据库
- ✅ 实时更新页面显示

---

## 🎯 使用方法

### 用户操作流程

1. **进入个人中心**
   - 打开小程序
   - 切换到"我的"Tab

2. **编辑资料**
   - 点击个人中心顶部的头像或昵称
   - 进入"编辑资料"页面

3. **选择头像**
   - 点击头像区域的"点击更换"按钮
   - 微信会弹出头像选择器
   - 从相册选择或拍照
   - 系统自动预览新头像

4. **输入昵称**
   - 点击昵称输入框
   - 键盘上方会显示"微信昵称"字样
   - 输入新昵称（最多32个字符）
   - 系统会自动进行安全检测

5. **保存信息**
   - 点击"保存"按钮
   - 系统上传头像并保存到服务器
   - 更新本地存储和页面显示
   - 返回个人中心页面

---

## 🛠️ 技术实现

### 1. 文件结构

```
miniprogram/
├── pages/
│   └── user/
│       ├── index.vue              # 个人中心页面（已修改）
│       └── profile-edit.vue       # 新增：用户资料编辑页面
├── api/
│   └── api.js                     # API接口（已添加用户相关接口）
└── pages.json                     # 路由配置（已添加新页面）
```

### 2. 核心代码

#### 2.1 个人中心页面（index.vue）

**修改点**：
- 头像添加点击事件：`@click="editProfile"`
- 昵称添加点击事件
- 页面加载时读取用户信息：`loadUserInfo()`

```vue
<!-- 头像点击 -->
<image class="user-avatar" :src="userImage" @click="editProfile"></image>

<!-- 昵称点击 -->
<text class="user-name" @click="editProfile">{{ userName }}</text>

<script>
methods: {
  editProfile() {
    uni.navigateTo({
      url: '/pages/user/profile-edit'
    })
  },
  loadUserInfo() {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userImage = userInfo.avatar || '/static/img/profile.svg'
      this.userName = userInfo.nickname || '音乐创作者'
    }
  }
}
</script>
```

#### 2.2 用户资料编辑页面（profile-edit.vue）

**核心功能**：

1. **头像选择**（使用微信最新能力）

```vue
<button 
  class="avatar-button" 
  open-type="chooseAvatar" 
  @chooseavatar="onChooseAvatar"
>
  <image class="avatar-preview" :src="avatarUrl"></image>
</button>

<script>
onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  this.tempAvatarPath = avatarUrl
  this.avatarUrl = avatarUrl
}
</script>
```

2. **昵称输入**（带安全检测）

```vue
<input 
  class="nickname-input" 
  type="nickname"
  v-model="nickname"
  placeholder="请输入昵称"
  @blur="onNicknameBlur"
/>

<script>
onNicknameBlur(e) {
  this.nickname = e.detail.value || this.nickname
}
</script>
```

3. **保存逻辑**

```javascript
async saveProfile() {
  // 1. 验证输入
  if (!this.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  // 2. 上传头像（可选）
  let avatarUrl = this.avatarUrl
  if (this.tempAvatarPath) {
    avatarUrl = await this.$minApi.uploadAvatar(this.tempAvatarPath)
    // 或直接使用临时路径：avatarUrl = this.tempAvatarPath
  }
  
  // 3. 调用API保存
  const result = await this.$minApi.updateUserProfile({
    nickname: this.nickname.trim(),
    avatar: avatarUrl
  })
  
  // 4. 更新本地存储
  const userInfo = uni.getStorageSync('userInfo') || {}
  userInfo.nickname = this.nickname
  userInfo.avatar = avatarUrl
  uni.setStorageSync('userInfo', userInfo)
  
  // 5. 返回上一页
  uni.navigateBack()
}
```

#### 2.3 API接口（api.js）

**新增接口**：

```javascript
// 更新用户资料
updateUserProfile(params) {
  return minRequest.post('/user/profile', params, { method: 'PUT' })
},

// 上传头像
uploadAvatar(filePath) {
  const token = uni.getStorageSync('token')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: globalConfig.baseUrl + '/upload/avatar',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if(res.data.code === 200) {
          resolve(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => reject(err)
    })
  })
}
```

---

## 🔌 后端API对接

### 1. 更新用户资料接口

**接口**: `PUT /api/v1/user/profile`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数**:
```json
{
  "nickname": "音乐爱好者",
  "avatar": "https://example.com/avatar.jpg"
}
```

**成功响应**:
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": {
    "id": "123",
    "nickname": "音乐爱好者",
    "avatar": "https://example.com/avatar.jpg",
    "points": 320,
    ...
  }
}
```

### 2. 上传头像接口（可选）

**接口**: `POST /api/v1/upload/avatar`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
- `file`: 图片文件（form-data）

**成功响应**:
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/avatar/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 102400
  }
}
```

---

## 📱 微信小程序API说明

### 1. button open-type="chooseAvatar"

**功能**: 打开微信原生头像选择器

**特性**:
- 支持从相册选择或拍照
- 返回临时文件路径
- 无需额外授权
- 微信基础库 2.21.2+ 支持

**回调事件**:
```javascript
bindchooseavatar="onChooseAvatar"

onChooseAvatar(e) {
  const { avatarUrl } = e.detail
  // avatarUrl 是微信临时路径，如：wxfile://tmp_xxx.jpg
  // 可以直接显示，或上传到服务器
}
```

### 2. input type="nickname"

**功能**: 昵称输入框（带安全检测）

**特性**:
- 键盘上方显示"微信昵称"提示
- 自动进行内容安全检测
- 检测违规内容自动提示
- 微信基础库 2.21.2+ 支持

**使用**:
```html
<input 
  type="nickname" 
  placeholder="请输入昵称"
  @blur="onNicknameBlur"
/>
```

---

## ⚠️ 注意事项

### 1. 头像处理

**临时路径 vs 服务器URL**:
- **临时路径**: `wxfile://tmp_xxx.jpg`
  - 优点：无需上传，速度快
  - 缺点：有效期短，无法跨设备
  - 适用场景：仅在当前设备显示

- **服务器URL**: `https://example.com/avatar.jpg`
  - 优点：永久保存，跨设备同步
  - 缺点：需要上传，多一步操作
  - 适用场景：需要跨设备、长期保存

**推荐方案**:
```javascript
// 方案1：直接使用临时路径（简单快速）
avatarUrl = this.tempAvatarPath

// 方案2：上传到服务器（推荐）
avatarUrl = await this.$minApi.uploadAvatar(this.tempAvatarPath)
```

### 2. 昵称安全检测

微信会自动检测昵称内容，如果包含违规内容：
- 不会直接报错
- 但可能在后续使用中被限制
- 建议在后端也做二次检测

### 3. 兼容性

**微信基础库要求**: 2.21.2+

**检测方法**:
```javascript
// 检查是否支持新能力
if (wx.canIUse('button.open-type.chooseAvatar')) {
  // 支持新版头像选择
} else {
  // 使用旧版方式或提示升级
}
```

### 4. 用户体验优化

**加载提示**:
```javascript
uni.showLoading({ title: '上传头像中...' })
uni.showLoading({ title: '保存中...' })
uni.hideLoading()
```

**错误处理**:
```javascript
try {
  await this.saveProfile()
} catch (error) {
  uni.showToast({
    title: error.message || '保存失败',
    icon: 'none',
    duration: 2000
  })
}
```

**成功反馈**:
```javascript
uni.showToast({
  title: '保存成功',
  icon: 'success',
  duration: 2000
})

setTimeout(() => {
  uni.navigateBack()
}, 1500)
```

---

## 🎨 UI设计

### 页面布局

```
┌─────────────────────────┐
│   编辑个人资料             │ ← 导航栏
├─────────────────────────┤
│                         │
│   [头像]                 │ ← 头像选择区
│   📷 点击更换             │
│                         │
├─────────────────────────┤
│ 昵称                     │
│ ┌─────────────────────┐ │
│ │ 请输入昵称           │ │ ← 昵称输入框
│ └─────────────────────┘ │
├─────────────────────────┤
│ 📌 头像和昵称将在所有...  │
│ 📌 请勿上传违规内容...    │ ← 提示信息
├─────────────────────────┤
│                         │
│   ┌───────────────┐     │
│   │    保存       │     │ ← 保存按钮
│   └───────────────┘     │
│   ┌───────────────┐     │
│   │    取消       │     │ ← 取消按钮
│   └───────────────┘     │
│                         │
└─────────────────────────┘
```

### 样式特点

- **深色主题**: #121212 背景
- **渐变按钮**: 蓝紫渐变
- **圆角设计**: 16rpx 卡片圆角
- **交互反馈**: hover 态 + 点击效果

---

## 🧪 测试建议

### 功能测试

1. **基础功能**
   - ✅ 点击头像能否跳转
   - ✅ 头像选择能否正常显示
   - ✅ 昵称输入能否正常保存
   - ✅ 保存后能否正确返回
   - ✅ 个人中心能否显示新信息

2. **异常情况**
   - ✅ 不选择头像直接保存
   - ✅ 输入空昵称
   - ✅ 输入过长昵称（>32字符）
   - ✅ 输入特殊字符
   - ✅ 网络异常时的处理

3. **边界情况**
   - ✅ 首次使用（无用户信息）
   - ✅ Token过期
   - ✅ 上传超大图片
   - ✅ 频繁切换头像

### 性能测试

- 头像上传速度（不同网络环境）
- 页面加载时间
- 内存占用情况

---

## 📝 更新日志

### v1.0.0 (2024-10-16)

- ✨ 新增用户资料编辑页面
- ✨ 实现头像选择功能（微信最新能力）
- ✨ 实现昵称输入功能（带安全检测）
- ✨ 新增头像上传API
- ✨ 新增用户资料更新API
- 🐛 修复个人中心用户信息不更新问题
- 📝 完善文档和注释

---

## 🚀 下一步优化建议

### 功能扩展

1. **图片裁剪**
   - 选择头像后允许裁剪
   - 支持缩放和旋转
   - 固定比例（1:1）

2. **头像库**
   - 提供默认头像选项
   - 支持从头像库选择
   - AI生成头像

3. **更多资料**
   - 性别选择
   - 个人签名
   - 所在地区
   - 生日

4. **实时预览**
   - 编辑时实时预览
   - 对比编辑前后效果

### 性能优化

1. **图片压缩**
   - 上传前自动压缩
   - 减少上传时间
   - 节省存储空间

2. **缓存策略**
   - 头像本地缓存
   - 减少网络请求

3. **懒加载**
   - 页面按需加载
   - 提升首屏速度

---

## 💡 常见问题

### Q1: 为什么选择的头像无法显示？

**A**: 检查以下几点：
1. 是否获取到了avatarUrl
2. image标签的src是否正确绑定
3. 网络请求是否成功
4. 临时路径是否过期

### Q2: 昵称输入后被微信拦截？

**A**: 可能包含违规内容，微信会自动检测：
1. 避免使用敏感词
2. 不要包含特殊符号
3. 建议使用中文或英文

### Q3: 如何自定义头像上传接口？

**A**: 修改 `api/api.js` 中的 `uploadAvatar` 方法：

```javascript
uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: '你的上传地址', // 修改这里
      filePath: filePath,
      name: 'file',
      // ... 其他配置
    })
  })
}
```

### Q4: 能否支持微信旧版本？

**A**: 可以做兼容处理：

```javascript
if (wx.canIUse('button.open-type.chooseAvatar')) {
  // 使用新版头像选择
} else {
  // 使用 chooseImage 或提示升级
  uni.chooseImage({
    count: 1,
    success: (res) => {
      this.avatarUrl = res.tempFilePaths[0]
    }
  })
}
```

---

## 📞 技术支持

如有问题，请查看：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [UniApp官方文档](https://uniapp.dcloud.net.cn/)
- [后端API文档](../backend/API_TEST.md)

---

**功能开发完成！祝您使用愉快！🎉**
