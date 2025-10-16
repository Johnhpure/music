# 个人中心API接口接入指南

## 📋 任务概述

本文档记录个人中心及其二三级页面的API接口接入工作。

## ✅ 已完成工作

### 1. 后端API补充

在 `backend/src/modules/user/` 中添加了以下缺失的API接口：

#### UserController 新增接口

```typescript
// 获取当前用户信息
GET /api/user/profile
Response: {
  id, openid, nickname, avatar, phone, email, 
  gender, credit, role, is_active, created_at, updated_at
}

// 更新当前用户信息
PUT /api/user/profile
Body: { nickname?, avatar?, gender?, email? }
Response: { message: string, data: UserProfile }

// 获取用户统计信息
GET /api/user/stats
Response: {
  totalWorks: number,      // 总作品数
  totalCredits: number,    // 当前点数
  consecutiveCheckin: number, // 连续签到天数
  totalCheckins: number    // 总签到次数
}

// 每日签到
POST /api/user/checkin
Response: {
  success: boolean,
  creditReward: number,    // 本次奖励点数
  totalCredit: number,     // 签到后总点数
  consecutiveDays: number, // 连续签到天数
  message: string
}
```

#### UserService 新增方法

```typescript
async getUserStats(userId: number): Promise<any>
async checkin(userId: number): Promise<any>
```

**修改的文件：**
- `backend/src/modules/user/user.controller.ts` - 添加4个新接口
- `backend/src/modules/user/user.service.ts` - 添加2个新方法

### 2. 前端API封装

前端API封装已存在于 `miniprogram/api/api.js`：

```javascript
// 获取用户信息
getUserProfile()

// 更新用户信息  
updateUserProfile(params)

// 每日签到
checkin()

// 获取用户统计
getUserStats()
```

## 🔧 待完成工作

### 1. works.vue - 我的作品页面

**当前状态：** 使用模拟数据

**需要修改：**

```javascript
// 修改 getWorksList() 方法
async getWorksList() {
  try {
    uni.showLoading({ title: '加载中...' });
    
    const response = await this.$minApi.getMusicTasks({
      page: 1,
      pageSize: 20,
      status: this.filterStatus // 'completed', 'pending', 'failed'
    });
    
    if (response.code === 200) {
      // 转换API数据为页面数据格式
      this.works = response.data.list.map(task => ({
        id: task.id,
        title: task.title,
        coverUrl: task.imageUrl || '/static/img/covers/default.jpg',
        createTime: this.formatDate(task.createdAt),
        duration: task.duration || '00:00',
        isDownloaded: false, // TODO: 需要后端提供下载状态
        daysLeft: this.calculateDaysLeft(task.createdAt),
        isPlaying: false,
        selected: false,
        showActions: false,
        offsetX: 0,
        genre: task.style || '未知'
      }));
      
      this.total = response.data.total;
    }
  } catch (error) {
    console.error('获取作品列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}

// 计算剩余天数
calculateDaysLeft(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = 90 * 24 * 60 * 60 * 1000 - (now - created); // 90天有效期
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// 格式化日期
formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
```

### 2. work-detail.vue - 作品详情页面

**当前状态：** 使用模拟数据

**需要修改：**

```javascript
async getWorkDetail() {
  try {
    uni.showLoading({ title: '加载中...' });
    
    const response = await this.$minApi.getMusicTask(this.id);
    
    if (response.code === 200) {
      const task = response.data;
      this.workDetail = {
        id: task.id,
        title: task.title,
        style: task.style,
        coverUrl: task.imageUrl || '/static/img/covers/default.jpg',
        createdAt: task.createdAt,
        creationMode: task.model === 'ai' ? 'AI创作' : '自主创作',
        bpm: 120, // TODO: 后端添加BPM字段
        key: 'C大调', // TODO: 后端添加调性字段
        prompt: task.prompt || '',
        playCount: 0, // TODO: 后端添加播放次数统计
        audioUrl: task.audioUrl
      };
      
      // 设置音频源
      if (this.workDetail.audioUrl) {
        this.audioContext.src = this.workDetail.audioUrl;
      }
    }
  } catch (error) {
    console.error('获取作品详情失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
}
```

### 3. checkin.vue - 每日签到页面

**当前状态：** 使用模拟签到逻辑

**需要修改：**

```javascript
async checkIn() {
  if (this.isCheckedToday) return;
  
  try {
    uni.showLoading({ title: '签到中...' });
    
    const response = await this.$minApi.checkin();
    
    if (response.code === 200 || response.success) {
      const data = response.data || response;
      
      // 更新签到状态
      this.isCheckedToday = true;
      this.checkedDays.push(this.today);
      this.streakDays = data.consecutiveDays || this.streakDays + 1;
      
      // 计算今日奖励
      this.todayReward = data.creditReward || 5;
      
      // 更新用户点数
      this.$store.dispatch('getCreditBalance');
      
      uni.hideLoading();
      
      // 显示奖励弹窗
      this.showRewardPopup = true;
      
    } else {
      throw new Error(response.message || '签到失败');
    }
  } catch (error) {
    uni.hideLoading();
    
    if (error.message && error.message.includes('已签到')) {
      this.isCheckedToday = true;
      uni.showToast({
        title: '今日已签到',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: error.message || '签到失败',
        icon: 'none'
      });
    }
  }
}

// 页面加载时检查签到状态
async onLoad() {
  // 初始化已签到日期
  await this.loadCheckinHistory();
}

// 加载签到历史（需要后端提供接口）
async loadCheckinHistory() {
  try {
    // TODO: 调用 /user/checkin/history 接口
    // const response = await this.$minApi.getCheckinHistory();
    // this.checkedDays = response.data.checkedDays;
    // this.streakDays = response.data.consecutiveDays;
    // this.isCheckedToday = response.data.todayChecked;
  } catch (error) {
    console.error('加载签到历史失败:', error);
  }
}
```

### 4. purchase.vue - 购买点数页面

**当前状态：** 模拟支付流程

**需要接入：**

```javascript
async simulatePayment() {
  // 检查登录状态
  if (!WeChatAuth.isLoggedIn()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    this.checkLoginStatus();
    return;
  }
  
  try {
    uni.showLoading({ title: '正在调起支付...' });
    
    // 1. 创建订单
    const orderResponse = await this.$minApi.createOrder({
      packageId: this.selectedPackage.id,
      amount: this.selectedPackage.price
    });
    
    if (orderResponse.code !== 200) {
      throw new Error(orderResponse.message || '创建订单失败');
    }
    
    const orderId = orderResponse.data.orderId;
    
    // 2. 调起微信支付
    const paymentResponse = await this.$minApi.createWechatPayment({
      orderId: orderId
    });
    
    if (paymentResponse.code !== 200) {
      throw new Error(paymentResponse.message || '调起支付失败');
    }
    
    // 3. 调起微信支付
    await uni.requestPayment({
      provider: 'wxpay',
      timeStamp: paymentResponse.data.timeStamp,
      nonceStr: paymentResponse.data.nonceStr,
      package: paymentResponse.data.package,
      signType: paymentResponse.data.signType,
      paySign: paymentResponse.data.paySign,
    });
    
    uni.hideLoading();
    
    // 支付成功
    uni.showToast({
      title: '支付成功',
      icon: 'success'
    });
    
    // 刷新用户点数
    await this.$store.dispatch('getCreditBalance');
    
    // 切换到支付成功步骤
    setTimeout(() => {
      this.currentStep = 2;
      this.newBalance = this.$store.getters.userCreditBalance;
    }, 1000);
    
  } catch (error) {
    uni.hideLoading();
    
    if (error.errMsg && error.errMsg.includes('cancel')) {
      uni.showToast({
        title: '支付已取消',
        icon: 'none'
      });
    } else {
      uni.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      });
    }
  }
}
```

## 📝 后端待补充接口

### 1. 签到历史接口

```typescript
// UserController
@Get('checkin/history')
async getCheckinHistory(@Request() req) {
  return this.userService.getCheckinHistory(req.user.id);
}

// UserService
async getCheckinHistory(userId: number): Promise<any> {
  // TODO: 从checkin_logs表查询本月签到记录
  return {
    checkedDays: [], // 本月已签到日期数组
    consecutiveDays: 0, // 连续签到天数
    todayChecked: false // 今天是否已签到
  };
}
```

### 2. 作品播放统计

```typescript
// MusicController - 已存在但需确认
@Post('tasks/:id/play')
async trackPlay(@Request() req, @Param('id') id: string) {
  return this.musicService.trackPlay(req.user.id, parseInt(id, 10));
}
```

### 3. 支付相关接口

需要在 `backend/src/modules/payment/` 模块中实现：
- 创建订单
- 微信支付
- 订单查询
- 订单取消

## 🔍 测试检查清单

### 个人中心主页 (index.vue)
- [ ] 用户信息正确显示
- [ ] 点数余额实时更新
- [ ] 作品数量正确统计
- [ ] 点击跳转功能正常

### 我的作品 (works.vue)
- [ ] 作品列表正确加载
- [ ] 分页加载功能正常
- [ ] 搜索功能正常
- [ ] 播放、分享、删除功能正常
- [ ] 过期提醒正确显示

### 作品详情 (work-detail.vue)
- [ ] 作品信息完整显示
- [ ] 音频播放功能正常
- [ ] 下载功能正常
- [ ] 分享功能正常

### 音乐点数中心 (points.vue)
- [ ] 点数余额正确显示
- [ ] 点数记录正确加载
- [ ] 签到功能正常
- [ ] 购买点数跳转正常

### 每日签到 (checkin.vue)
- [ ] 签到日历正确显示
- [ ] 签到功能正常
- [ ] 连续签到奖励正确计算
- [ ] 签到历史正确加载

### 购买点数 (purchase.vue)
- [ ] 套餐信息正确显示
- [ ] 支付流程正常
- [ ] 支付成功后点数更新
- [ ] 订单记录正确

## 📌 注意事项

1. **错误处理**：所有API调用都需要添加try-catch错误处理
2. **加载状态**：使用uni.showLoading和uni.hideLoading显示加载状态
3. **数据转换**：API返回的数据格式可能需要转换为页面所需格式
4. **空状态处理**：数据为空时显示友好的空状态提示
5. **权限检查**：某些接口需要登录，要做好未登录状态的处理
6. **点数同步**：所有涉及点数变动的操作都要同步更新Vuex状态

## 🚀 部署步骤

1. 确保后端服务正常运行
2. 测试新增的API接口
3. 逐个页面修改并测试
4. 进行完整的端到端测试
5. 部署到生产环境

## 📚 相关文档

- [API接口说明](./miniprogramdoc/05-API接口说明.md)
- [页面功能详细说明](./miniprogramdoc/03-页面功能详细说明.md)
- [完整页面功能分析报告](./miniprogramdoc/07-完整页面功能分析报告.md)
