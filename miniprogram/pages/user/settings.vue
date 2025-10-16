<template>
	<view class="container">
		<view class="header">
			<view class="back-button" @click="navigateBack">
				<text class="iconfont icon-back">&#xe600;</text>
			</view>
			<text class="title">系统设置</text>
		</view>
		
		<view class="content">
			<view class="settings-section">
				<view class="section-title">账号设置</view>
				<view class="settings-group">
					<view class="settings-item" @click="goToUserInfo">
						<text class="item-label">个人资料</text>
						<view class="item-value">
							<text class="value-text">编辑</text>
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
					<view class="settings-item" v-if="!isLogin" @click="login">
						<text class="item-label">登录/注册</text>
						<view class="item-value">
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
					<view class="settings-item" v-if="isLogin" @click="logout">
						<text class="item-label">退出登录</text>
						<view class="item-value">
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="settings-section">
				<view class="section-title">应用设置</view>
				<view class="settings-group">
					<view class="settings-item">
						<text class="item-label">深色模式</text>
						<view class="item-value">
							<switch :checked="isDarkMode" @change="toggleDarkMode" color="#3B7EFF" />
						</view>
					</view>
					<view class="settings-item">
						<text class="item-label">播放音效</text>
						<view class="item-value">
							<switch :checked="playSounds" @change="togglePlaySounds" color="#3B7EFF" />
						</view>
					</view>
					<view class="settings-item" @click="clearCache">
						<text class="item-label">清除缓存</text>
						<view class="item-value">
							<text class="value-text">{{cacheSize}}</text>
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="settings-section">
				<view class="section-title">通知设置</view>
				<view class="settings-group">
					<view class="settings-item">
						<text class="item-label">推送通知</text>
						<view class="item-value">
							<switch :checked="pushNotification" @change="togglePushNotification" color="#3B7EFF" />
						</view>
					</view>
					<view class="settings-item" :class="{'disabled': !pushNotification}">
						<text class="item-label">新功能通知</text>
						<view class="item-value">
							<switch :disabled="!pushNotification" :checked="newFeatureNotification" @change="toggleNewFeatureNotification" color="#3B7EFF" />
						</view>
					</view>
					<view class="settings-item" :class="{'disabled': !pushNotification}">
						<text class="item-label">活动通知</text>
						<view class="item-value">
							<switch :disabled="!pushNotification" :checked="activityNotification" @change="toggleActivityNotification" color="#3B7EFF" />
						</view>
					</view>
				</view>
			</view>
			
			<view class="settings-section">
				<view class="section-title">关于</view>
				<view class="settings-group">
					<view class="settings-item" @click="goToAbout">
						<text class="item-label">关于我们</text>
						<view class="item-value">
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
					<view class="settings-item" @click="goToPrivacyPolicy">
						<text class="item-label">隐私政策</text>
						<view class="item-value">
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
					<view class="settings-item" @click="goToUserAgreement">
						<text class="item-label">用户协议</text>
						<view class="item-value">
							<text class="iconfont arrow-icon">&#xe60c;</text>
						</view>
					</view>
					<view class="settings-item">
						<text class="item-label">版本</text>
						<view class="item-value">
							<text class="value-text">v1.0.0</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="settings-section">
				<button class="feedback-button" @click="goToFeedback">意见反馈</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLogin: true,
			isDarkMode: true,
			playSounds: true,
			pushNotification: true,
			newFeatureNotification: true,
			activityNotification: true,
			cacheSize: '12.6MB'
		}
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		goToUserInfo() {
			uni.showToast({
				title: '个人资料功能开发中',
				icon: 'none'
			});
		},
		login() {
			uni.showToast({
				title: '登录功能开发中',
				icon: 'none'
			});
		},
		logout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						this.isLogin = false;
						uni.showToast({
							title: '已退出登录',
							icon: 'success'
						});
					}
				}
			});
		},
		toggleDarkMode(e) {
			this.isDarkMode = e.detail.value;
			// 实际应用中，这里需要应用深色模式设置
			uni.showToast({
				title: this.isDarkMode ? '已开启深色模式' : '已关闭深色模式',
				icon: 'none'
			});
		},
		togglePlaySounds(e) {
			this.playSounds = e.detail.value;
		},
		clearCache() {
			uni.showLoading({
				title: '清除中...'
			});
			
			// 模拟清除缓存过程
			setTimeout(() => {
				uni.hideLoading();
				this.cacheSize = '0KB';
				uni.showToast({
					title: '缓存已清除',
					icon: 'success'
				});
			}, 1500);
		},
		togglePushNotification(e) {
			this.pushNotification = e.detail.value;
			if (!this.pushNotification) {
				this.newFeatureNotification = false;
				this.activityNotification = false;
			}
		},
		toggleNewFeatureNotification(e) {
			this.newFeatureNotification = e.detail.value;
		},
		toggleActivityNotification(e) {
			this.activityNotification = e.detail.value;
		},
		goToAbout() {
			uni.showToast({
				title: '关于我们页面开发中',
				icon: 'none'
			});
		},
		goToPrivacyPolicy() {
			uni.showToast({
				title: '隐私政策页面开发中',
				icon: 'none'
			});
		},
		goToUserAgreement() {
			uni.showToast({
				title: '用户协议页面开发中',
				icon: 'none'
			});
		},
		goToFeedback() {
			uni.showToast({
				title: '意见反馈功能开发中',
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 50rpx;
}

.header {
	position: relative;
	padding: 90rpx 30rpx 20rpx;
	display: flex;
	align-items: center;
}

.back-button {
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
	width: 100%;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.content {
	padding: 30rpx;
}

.settings-section {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 20rpx;
	padding-left: 10rpx;
}

.settings-group {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	overflow: hidden;
}

.settings-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #333333;
}

.settings-item:last-child {
	border-bottom: none;
}

.settings-item.disabled {
	opacity: 0.5;
}

.item-label {
	font-size: 30rpx;
	color: #FFFFFF;
}

.item-value {
	display: flex;
	align-items: center;
}

.value-text {
	font-size: 28rpx;
	color: #999999;
	margin-right: 10rpx;
}

.arrow-icon {
	font-size: 30rpx;
	color: #999999;
}

.feedback-button {
	width: 100%;
	height: 90rpx;
	background-color: #1E1E1E;
	color: #FFFFFF;
	font-size: 32rpx;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style> 