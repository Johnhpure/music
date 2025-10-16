
# AI音乐生成微信小程序前端项目深度分析报告 (续)

## 4️⃣ 页面路由与业务流程 (续)

### 4.3 页面清单

| 模块 | 页面 | 路径 | 功能说明 |
|------|------|------|----------|
| **首页** | 首页 | `/pages/index/index` | 推荐作品、创作灵感、教程入口 |
| **教程** | 教程首页 | `/pages/tutorial/index` | 创作教程列表 |
| | AI创作教程 | `/pages/tutorial/ai` | AI辅助创作完整指南 |
| | 自主创作教程 | `/pages/tutorial/self` | 自主创作完整指南 |
| **创作** | 选择创作方式 | `/pages/creation/select` | AI辅助 vs 自主创作 |
| | AI辅助创作 | `/pages/creation/ai` | 提示词输入、歌词生成 |
| | 自主创作 | `/pages/creation/manual` | 手动编写歌词 |
| | 风格设置 | `/pages/creation/style` | 选择音乐风格 |
| | 预览生成 | `/pages/creation/preview` | 预览并生成音乐 |
| **用户** | 个人中心 | `/pages/user/index` | 用户信息、作品、点数 |
| | 我的作品 | `/pages/user/works` | 作品列表管理 |
| | 作品详情 | `/pages/user/work-detail` | 单个作品详情 |
| | 音乐点数中心 | `/pages/user/points` | 点数余额、购买、规则 |
| | 系统设置 | `/pages/user/settings` | 应用设置 |
| | 用户协议 | `/pages/user/agreement` | 服务条款 |
| | 隐私政策 | `/pages/user/privacy` | 隐私保护说明 |
| | 版权说明 | `/pages/user/copyright` | 版权相关规定 |
| | 帮助中心 | `/pages/user/help` | 常见问题解答 |
| | 意见反馈 | `/pages/user/feedback` | 用户反馈入口 |
| | 关于我们 | `/pages/user/about` | 应用介绍 |
| | 购买点数 | `/pages/user/purchase` | 点数购买页面 |
| | 每日签到 | `/pages/user/checkin` | 签到获取点数 |
| **推荐** | 热门推荐 | `/pages/recommendations/index` | 热门音乐作品 |
| **登录** | 登录页 | `/pages/login/login` | 用户登录 |
| | 忘记密码 | `/pages/login/forget` | 密码找回 |

---

## 5️⃣ API接口清单

**文件**: [`api/api.js`](frontend-ui/api/api.js)

### 5.1 用户相关接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `login(params)` | POST | `/User/Login` | 用户登录 |
| `logout()` | POST | `/User/LoginOff` | 用户登出 |
| `checkLoginState()` | POST | `/User/CheckLoginState` | 检查登录状态 |
| `listUser(params)` | GET | `/User/GetUserList` | 获取用户列表 |
| `listRole()` | GET | `/User/GetRoleList` | 获取角色列表 |
| `settingRole(params)` | POST | `/User/SettingRole` | 设置用户角色 |
| `userPwdModify(params)` | POST | `/post/user/pwd/modify` | 修改密码 |

### 5.2 任务管理接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `getTaskList(params)` | GET | `/Task/GetTaskList` | 获取任务列表 |
| `getTaskInfo(taskId)` | GET | `/Task/GetTaskInfo` | 获取任务详情 |
| `getGroupTaskInfo(taskId)` | GET | `/Task/GetGroupTaskInfo` | 获取分组任务详情 |
| `getSimpleTaskInfo(taskId)` | GET | `/Task/GetSimpleTaskInfo` | 获取简单任务详情 |
| `saveTask(params)` | POST | `/Task/SaveTask` | 保存任务信息 |
| `loadTaskCharts(params)` | GET | `/Task/GetChartsJson` | 获取任务统计图表 |
| `loadIndexData()` | GET | `/Task/GetIndexData` | 获取首页数据 |

### 5.3 承包商/员工管理接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `listContractor(params)` | GET | `/Task/GetContractorList` | 获取承包商列表 |
| `getContractor(params)` | GET | `/Task/GetContractorInfo` | 获取承包商信息 |
| `saveContractor(params)` | POST | `/Task/ContractorSave` | 保存承包商信息 |
| `listStaff(params)` | GET | `/Task/GetStaffList` | 获取员工列表 |
| `getStaff(params)` | GET | `/Task/GetStaffInfo` | 获取员工信息 |
| `saveStaff(params)` | POST | `/Task/StaffSave` | 保存员工信息 |
| `delStaff(params)` | POST | `/Task/DelStaffInfo` | 删除员工信息 |

### 5.4 事故管理接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `getEventList(params)` | GET | `/Event/GetEventList` | 获取事故列表 |
| `getEventInfo(eventId)` | GET | `/Event/GetEventInfo` | 获取事故详情 |
| `saveEvent(params)` | POST | `/Event/EventSave` | 保存事故信息 |
| `getEventDays()` | GET | `/Event/GetDays` | 获取无事故天数 |
| `loadBarCharts(params)` | GET | `/Event/GetChartsJson` | 获取柱状图数据 |
| `loadTableCharts(params)` | GET | `/Event/GetChartsByYearJson` | 获取年度图表数据 |
| `loadEventByMonth(params)` | GET | `/Event/GetChartsByMonthJson` | 获取月度事故数据 |
| `loadEventByDay(params)` | GET | `/Event/GetChartsByDayJson` | 获取每日事故数据 |

### 5.5 文件上传接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `uploadFile(params)` | POST | `/File/Upload` | 文件上传 |

**参数说明**:
```javascript
{
  filePath: string,    // 文件路径
  name: string,        // 文件参数名
  fileby: string,      // 文件用途
  filetype: number     // 文件类型: 1图片 2excel 3template 4文档
}
```

### 5.6 审批相关接口

| 接口方法 | 请求方式 | 路径 | 功能说明 |
|---------|---------|------|----------|
| `listAuditProject()` | GET | `/get/audit/project/list` | 项目审批列表 |
| `listAuditUser()` | GET | `/get/audit/user/list` | 用户审批列表 |

### 5.7 API配置

**BaseURL配置** ([`config/index.js`](frontend-ui/config/index.js)):
```javascript
// 生产环境
const ipAddress = 'http://8.141.1.164:8012/api'

// 文件访问地址
const fileAddr = 'http://8.141.1.164:8012/fileUpload/'

// H5环境使用代理
// #ifdef H5
return '/api'  // 通过manifest.json配置的proxy转发
// #endif

// 非H5环境直接访问
// #ifndef H5
return ipAddress
// #endif
```

---

## 6️⃣ 组件体系分析

### 6.1 自定义组件

| 组件名称 | 路径 | 功能说明 |
|---------|------|----------|
| `watch-button` | `components/watch-login/watch-button.vue` | 登录按钮组件 |
| `watch-input` | `components/watch-login/watch-input.vue` | 登录输入框组件 |
| `tui-datetime` | `components/tui/tui-datetime.vue` | 日期时间选择器 |

### 6.2 uni-ui组件使用

| 组件 | 使用场景 |
|------|----------|
| `uni-card` | 卡片容器 |
| `uni-goods-nav` | 商品导航栏 |
| `uni-icons` | 图标显示 |
| `uni-list` / `uni-list-item` | 列表展示 |
| `uni-nav-bar` | 页面导航栏 |
| `uni-popup` | 弹窗组件 |
| `uni-status-bar` | 状态栏占位 |
| `uni-tag` | 标签展示 |

### 6.3 ColorUI样式使用

**主要样式类**:
- `.cu-*`: ColorUI核心样式类
- `.text-*`: 文本颜色类
- `.bg-*`: 背景颜色类
- `.margin-*` / `.padding-*`: 间距类
- `.shadow-*`: 阴影效果类

---

## 7️⃣ 样式设计系统

### 7.1 色彩系统

**主题色**:
```scss
// 主色调
$primary-blue: #0B67EC;      // 主蓝色
$primary-purple: #7342CC;    // 主紫色

// 背景色
$bg-dark: #121212;           // 深色背景
$bg-card: #1E1E1E;           // 卡片背景
$bg-input: #2D2D2D;          // 输入框背景

// 文本色
$text-white: #FFFFFF;        // 主文本
$text-gray: #ACACAC;         // 次要文本
$text-light: #787878;        // 辅助文本

// 功能色
$success: #36D1A6;           // 成功
$warning: #FFB443;           // 警告
$error: #FF5C5C;             // 错误
$link: #4C94FF;              // 链接
```

**渐变色**:
```scss
// 主渐变
background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);

// 卡片渐变
.blue-card {
  background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
}

.purple-card {
  background: linear-gradient(135deg, #7342CC 0%, #5F35A8 100%);
}
```

### 7.2 布局规范

**间距系统**:
```scss
$spacing-xs: 10rpx;
$spacing-sm: 20rpx;
$spacing-md: 30rpx;
$spacing-lg: 40rpx;
$spacing-xl: 60rpx;
```

**圆角规范**:
```scss
$radius-sm: 10rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 30rpx;
$radius-round: 100rpx;  // 圆角按钮
```

**字体大小**:
```scss
$font-xs: 22rpx;
$font-sm: 24rpx;
$font-md: 28rpx;
$font-lg: 32rpx;
$font-xl: 36rpx;
$font-xxl: 48rpx;
```

---

## 8️⃣ 核心功能实现分析

### 8.1 登录与鉴权

**自动登录流程**:
```javascript
// App.vue - onLaunch
autoLogin() {
  this.$store.dispatch('autoLogin')
}

// store/modules/user.js
autoLogin({ commit, getters, dispatch }) {
  if (getters.user && getters.user.userName && getters.user.password) {
    // 使用缓存的账号密码自动登录
    dispatch('login', params)
  } else {
    // 提示用户登录
    uni.reLaunch({ url: '/pages/login/login' })
  }
}
```

**Token管理**:
```javascript
// api/api.js - 请求拦截器
minRequest.interceptors.request((request) => {
  const user = Vue.prototype.$store.getters.user
  if (user && user.ApiToken) {
    request.header = {
      ...request.header,
      'WC-Token': user.ApiToken  // 自动添加Token
    }
  }
  return request
})
```

### 8.2 应用升级方案

**整包升级检测**:
```javascript
// App.vue
appUpgrade(platform) {
  if (platform !== 'android') return
  
  plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
    let params = {
      appid: plus.runtime.appid,
      version: wgtinfo.versionCode,  // 使用versionCode比较
      platform: platform
    }
    
    this.$minApi.findUpgradeApp(params).then(appRes => {
      if (appRes.appid) {
        uni.showModal({
          title: "下载更新提示",
          content: appRes.note,
          success: sucRes => {
            if (sucRes.confirm) {
              plus.runtime.openURL(appRes.url)  // 打开下载链接
            