<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="left" @click="navigateBack">
				<text class="iconfont icon-back">&#xe600;</text>
			</view>
			<text class="title">购买点数</text>
		</view>
		
		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
				<view class="step-circle">1</view>
				<view class="step-line"></view>
				<text class="step-text">选择套餐</text>
			</view>
			<view class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
				<view class="step-circle">2</view>
				<view class="step-line"></view>
				<text class="step-text">支付完成</text>
			</view>
		</view>
		
		<!-- 步骤1: 选择支付方式 -->
		<view v-if="currentStep === 1" class="payment-method-step">
			<!-- 支付方式 -->
			<view class="card">
				<text class="card-title">支付方式</text>
				
				<!-- 微信支付 -->
				<view class="payment-method selected">
					<view class="method-info">
						<view class="method-icon wechat-icon">
							<text class="iconfont wechat">&#xe63e;</text>
						</view>
						<view class="method-text">
							<text class="method-title">微信支付</text>
							<text class="method-desc">使用微信小程序支付</text>
						</view>
					</view>
					<view class="radio-button">
						<view class="radio-inner"></view>
					</view>
				</view>
			</view>
			
			<!-- 订单信息 -->
			<view class="card">
				<text class="card-title">订单信息</text>
				
				<view class="order-info">
					<view class="info-row">
						<text class="info-label">套餐名称</text>
						<text class="info-value">{{selectedPackage.name}}</text>
					</view>
					
					<view class="info-row">
						<text class="info-label">原价</text>
						<text class="info-original">¥{{selectedPackage.originalPrice.toFixed(2)}}</text>
					</view>
					
					<view class="info-row">
						<text class="info-label">优惠</text>
						<text class="info-discount">-¥{{(selectedPackage.originalPrice - selectedPackage.price).toFixed(2)}}</text>
					</view>
					
					<view class="divider"></view>
					
					<view class="info-row">
						<text class="info-label">实付金额</text>
						<text class="info-final-price">¥{{selectedPackage.price.toFixed(2)}}</text>
					</view>
					
					<view class="info-row">
						<text class="info-label">获得点数</text>
						<text class="info-points">{{selectedPackage.points}} + {{selectedPackage.bonus}}(赠送)</text>
					</view>
				</view>
			</view>
			
			<!-- 支付按钮 -->
			<button class="payment-button gradient" @click="simulatePayment">立即支付</button>
			
			<text class="agreement-text">点击立即支付即表示同意《音乐点数购买协议》</text>
		</view>
		
		<!-- 步骤2: 支付完成 -->
		<view v-if="currentStep === 2" class="payment-success-step">
			<view class="card">
				<view class="success-content">
					<view class="success-icon">
						<text class="iconfont icon-check">&#xe648;</text>
					</view>
					
					<text class="success-title">支付成功</text>
					<text class="success-subtitle">您已成功购买{{selectedPackage.points}}点数</text>
					
					<view class="points-result">
						<text class="points-label">获得点数</text>
						<text class="points-value">{{selectedPackage.points + selectedPackage.bonus}}</text>
						<text class="points-bonus">包含赠送{{selectedPackage.bonus}}点</text>
					</view>
					
					<view class="divider"></view>
					
					<text class="balance-notice">点数已添加到您的账户</text>
					<text class="balance-info">当前点数余额: <text class="balance-value">{{newBalance}}</text></text>
				</view>
			</view>
			
			<view class="action-buttons">
				<button class="secondary-button" @click="viewDetails">查看明细</button>
				<button class="primary-button gradient" @click="backToPointsCenter">返回点数中心</button>
			</view>
		</view>
	</view>
</template>

<script>
import WeChatAuth from '@/utils/wechatAuth'

export default {
	data() {
		return {
			currentStep: 1,
			initialBalance: 320, // 用户当前点数余额
			selectedPackage: {
				name: '300点数套餐',
				points: 300,
				originalPrice: 30.00,
				price: 19.90,
				bonus: 30,
				tag: '首充特惠'
			},
			newBalance: 0,
			isCheckingLogin: false // 是否正在检查登录状态
		}
	},
	async onLoad() {
		console.log('购买点数页面加载');
		
		// 检查登录状态
		await this.checkLoginStatus();
	},
	created() {
		// 计算支付后的新余额
		this.newBalance = this.initialBalance + this.selectedPackage.points + this.selectedPackage.bonus;
		
		// 获取上一页传递的套餐信息
		const eventChannel = this.getOpenerEventChannel();
		if (eventChannel) {
			eventChannel.on('selectPackage', (data) => {
				if (data && data.package) {
					this.selectedPackage = data.package;
					// 重新计算新余额
					this.newBalance = this.initialBalance + this.selectedPackage.points + this.selectedPackage.bonus;
				}
			});
		}
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		
		// 检查登录状态
		async checkLoginStatus() {
			if (this.isCheckingLogin) return;
			
			this.isCheckingLogin = true;
			
			try {
				// 检查是否已登录
				const isLoggedIn = await WeChatAuth.checkPurchaseLogin();
				
				if (!isLoggedIn) {
					// 用户取消登录，返回上一页
					uni.navigateBack();
					return;
				}
				
				console.log('✅ 用户已登录，可以购买点数');
				
			} catch (error) {
				console.error('登录检查失败:', error);
				uni.showToast({
					title: '登录验证失败',
					icon: 'none'
				});
				
				// 延迟后返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
				
			} finally {
				this.isCheckingLogin = false;
			}
		},
		
		// 微信支付 - 使用真实API
		async simulatePayment() {
			// 再次检查登录状态
			if (!WeChatAuth.isLoggedIn()) {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				});
				this.checkLoginStatus();
				return;
			}
			
			uni.showLoading({
				title: '正在调起支付...'
			});
			
			try {
				// TODO: 1. 创建订单
				const orderResponse = await this.$minApi.apis.createOrder({
					packageId: this.selectedPackage.id || 1,
					amount: this.selectedPackage.price,
					points: this.selectedPackage.points,
					bonus: this.selectedPackage.bonus
				});
				
				if (!orderResponse || orderResponse.code !== 200) {
					throw new Error(orderResponse?.message || '创建订单失败');
				}
				
				const orderId = orderResponse.data.orderId;
				
				// TODO: 2. 调起微信支付参数
				const paymentResponse = await this.$minApi.apis.createWechatPayment({
					orderId: orderId
				});
				
				if (!paymentResponse || paymentResponse.code !== 200) {
					throw new Error(paymentResponse?.message || '调起支付失败');
				}
				
				// 3. 使用微信小程序官方 wx.requestPayment API
				await new Promise((resolve, reject) => {
					wx.requestPayment({
						timeStamp: paymentResponse.data.timeStamp,
						nonceStr: paymentResponse.data.nonceStr,
						package: paymentResponse.data.package,
						signType: paymentResponse.data.signType,
						paySign: paymentResponse.data.paySign,
						success: (res) => {
							console.log('✅ 微信支付成功:', res);
							resolve(res);
						},
						fail: (err) => {
							console.error('❌ 微信支付失败:', err);
							reject(err);
						}
					});
				});
				
				uni.hideLoading();
				
				// 支付成功
				uni.showToast({
					title: '支付成功',
					icon: 'success'
				});
				
				// 刷新用户点数
				if (this.$store && this.$store.dispatch) {
					await this.$store.dispatch('getCreditBalance');
					// 更新新余额显示
					this.newBalance = this.$store.getters.userCreditBalance;
				}
				
				// 延迟后切换到支付成功步骤
				setTimeout(() => {
					this.currentStep = 2;
				}, 1000);
				
			} catch (error) {
				uni.hideLoading();
				
				// 判断是否为用户取消
				if (error.errMsg && (error.errMsg.includes('cancel') || error.errMsg.includes('用户取消'))) {
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
				
				console.error('❌ 支付流程失败:', error);
			}
		},
		viewDetails() {
			// 跳转到点数明细页面，并设置激活的标签页
			uni.navigateTo({
				url: '/pages/user/points?activeTab=history'
			});
		},
		backToPointsCenter() {
			// 返回点数中心
			uni.navigateTo({
				url: '/pages/user/points'
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 40rpx;
}

/* 导航栏样式 */
.navbar {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	padding: 20rpx 30rpx;
}

.left {
	position: absolute;
	left: 30rpx;
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-back {
	font-size: 40rpx;
	color: #FFFFFF;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 步骤指示器 */
.step-indicator {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 60rpx;
	margin-bottom: 30rpx;
}

.step {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	flex: 1;
}

.step-circle {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	background-color: #3D3D3D;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24rpx;
	color: #FFFFFF;
	margin-bottom: 16rpx;
	z-index: 2;
}

.step.active .step-circle {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}

.step.completed .step-circle {
	background-color: #36D1A6;
}

.step-line {
	position: absolute;
	top: 24rpx;
	height: 4rpx;
	width: 100%;
	background-color: #3D3D3D;
	left: -50%;
	z-index: 1;
}

.step:first-child .step-line {
	display: none;
}

.step-text {
	font-size: 24rpx;
	color: #ACACAC;
}

.step.active .step-text {
	color: #FFFFFF;
}

/* 卡片样式 */
.card {
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 30rpx;
	margin: 0 30rpx 30rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 20rpx;
	display: block;
}

/* 支付方式样式 */
.payment-method {
	background-color: #2D2D2D;
	border-radius: 24rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 2rpx solid transparent;
}

.payment-method.selected {
	border-color: #0B67EC;
}

.method-info {
	display: flex;
	align-items: center;
}

.method-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.wechat-icon {
	background-color: rgba(11, 103, 236, 0.2);
}

.wechat {
	font-size: 40rpx;
	color: #07C160;
}

.method-text {
	display: flex;
	flex-direction: column;
}

.method-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.method-desc {
	font-size: 24rpx;
	color: #ACACAC;
}

.radio-button {
	width: 48rpx;
	height: 48rpx;
	border-radius: 24rpx;
	border: 4rpx solid #0B67EC;
	display: flex;
	align-items: center;
	justify-content: center;
}

.radio-inner {
	width: 24rpx;
	height: 24rpx;
	border-radius: 12rpx;
	background-color: #0B67EC;
}

/* 订单信息样式 */
.order-info {
	display: flex;
	flex-direction: column;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.info-label {
	font-size: 28rpx;
	color: #ACACAC;
}

.info-value {
	font-size: 28rpx;
	color: #FFFFFF;
	font-weight: 500;
}

.info-original {
	font-size: 28rpx;
	color: #ACACAC;
	text-decoration: line-through;
}

.info-discount {
	font-size: 28rpx;
	color: #36D1A6;
}

.info-final-price {
	font-size: 36rpx;
	color: #FFFFFF;
	font-weight: 600;
}

.info-points {
	font-size: 28rpx;
	color: #36D1A6;
}

.divider {
	height: 2rpx;
	background-color: #3D3D3D;
	margin: 20rpx 0;
}

/* 按钮样式 */
.payment-button {
	width: calc(100% - 60rpx);
	height: 90rpx;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 45rpx;
	color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20rpx;
}

.agreement-text {
	font-size: 24rpx;
	color: #787878;
	text-align: center;
	display: block;
}

/* 支付成功样式 */
.success-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
}

.success-icon {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	background-color: #36D1A6;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30rpx;
}

.icon-check {
	font-size: 60rpx;
	color: #FFFFFF;
}

.success-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 16rpx;
}

.success-subtitle {
	font-size: 28rpx;
	color: #ACACAC;
	margin-bottom: 30rpx;
}

.points-result {
	width: 70%;
	background-color: #2D2D2D;
	border-radius: 24rpx;
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 30rpx;
}

.points-label {
	font-size: 24rpx;
	color: #ACACAC;
	margin-bottom: 10rpx;
}

.points-value {
	font-size: 48rpx;
	font-weight: 700;
	color: #FFFFFF;
	margin-bottom: 10rpx;
}

.points-bonus {
	font-size: 24rpx;
	color: #36D1A6;
}

.balance-notice {
	font-size: 28rpx;
	color: #ACACAC;
	margin-bottom: 8rpx;
}

.balance-info {
	font-size: 28rpx;
	color: #ACACAC;
}

.balance-value {
	font-weight: 600;
	color: #FFFFFF;
}

/* 底部操作按钮 */
.action-buttons {
	display: flex;
	padding: 0 30rpx;
	gap: 20rpx;
}

.secondary-button, .primary-button {
	flex: 1;
	height: 90rpx;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.secondary-button {
	background-color: #2D2D2D;
	color: #FFFFFF;
}

.primary-button {
	color: #FFFFFF;
}

/* 渐变背景 */
.gradient {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}
</style> 