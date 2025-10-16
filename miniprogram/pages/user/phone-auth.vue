<template>
	<view class="container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="title">手机号验证</text>
		</view>

		<view class="content">
			<!-- 状态显示 -->
			<view class="status-card">
				<view class="status-icon">📱</view>
				<text class="status-title">绑定手机号</text>
				<text class="status-desc">为了提供更安全的服务和更好的用户体验，请绑定您的手机号</text>
			</view>

			<!-- 当前用户信息 -->
			<view class="user-card" v-if="userInfo">
				<image class="user-avatar" :src="userInfo.avatar || '/static/img/profile.svg'" />
				<view class="user-info">
					<text class="user-name">{{ userInfo.nickname || '音乐创作者' }}</text>
					<text class="user-status" v-if="userInfo.phone">已绑定: {{ maskedPhone }}</text>
					<text class="user-status warning" v-else>未绑定手机号</text>
				</view>
			</view>

			<!-- 授权按钮 -->
			<view class="auth-section">
				<button 
					v-if="!userInfo || !userInfo.phone"
					class="auth-button"
					open-type="getPhoneNumber"
					@getphonenumber="onGetPhoneNumber"
					phone-number-no-quota-toast="false"
					:loading="loading"
				>
					{{ loading ? '授权中...' : '🔐 获取微信手机号' }}
				</button>

				<button 
					v-else
					class="auth-button success"
					@click="goBack"
				>
					✅ 手机号已绑定
				</button>
			</view>

			<!-- 说明信息 -->
			<view class="info-section">
				<view class="info-item">
					<text class="info-icon">🔒</text>
					<text class="info-text">我们承诺保护您的隐私，手机号仅用于账户安全验证</text>
				</view>
				<view class="info-item">
					<text class="info-icon">⚡</text>
					<text class="info-text">使用微信快速验证，无需输入验证码</text>
				</view>
				<view class="info-item">
					<text class="info-icon">🎵</text>
					<text class="info-text">绑定后可享受更多个性化音乐创作服务</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import WeChatAuthComplete from '@/utils/wechatAuthComplete.js'

export default {
	data() {
		return {
			userInfo: null,
			loading: false
		}
	},

	computed: {
		maskedPhone() {
			if (!this.userInfo?.phone) return '';
			const phone = this.userInfo.phone;
			if (phone.length >= 11) {
				return phone.substring(0, 3) + '****' + phone.substring(7);
			}
			return phone;
		}
	},

	onLoad() {
		this.loadUserInfo();
	},

	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},

		// 加载用户信息
		loadUserInfo() {
			this.userInfo = WeChatAuthComplete.getUserInfo();
		},

		// 处理手机号授权
		async onGetPhoneNumber(e) {
			this.loading = true;
			console.log('📱 手机号授权回调:', e.detail);

			try {
				// 处理授权回调
				const authResult = WeChatAuthComplete.handlePhoneNumberAuth(e);

				if (authResult.success) {
					console.log('✅ 手机号授权成功，开始绑定...');

					// 重新获取登录code
					const loginCode = await WeChatAuthComplete.getWxLoginCode();

					// 使用手机号code完整登录
					const result = await WeChatAuthComplete.login({
						needUserInfo: true,
						phoneCode: authResult.code,
						desc: '绑定手机号以提供更好的服务'
					});

					if (result.success && result.userInfo.phone) {
						uni.showToast({
							title: '手机号绑定成功！',
							icon: 'success',
							duration: 2000
						});

						// 更新用户信息
						this.loadUserInfo();

						// 2秒后返回
						setTimeout(() => {
							this.goBack();
						}, 2000);
					} else {
						throw new Error('手机号绑定失败');
					}
				} else {
					throw new Error(authResult.message);
				}
			} catch (error) {
				console.error('❌ 手机号授权失败:', error);
				uni.showToast({
					title: error.message || '授权失败，请重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.loading = false;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20rpx;
}

.header {
	display: flex;
	align-items: center;
	padding: 20rpx 0 40rpx;
	position: relative;

	.back-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;

		.back-icon {
			color: white;
			font-size: 36rpx;
			font-weight: bold;
		}
	}

	.title {
		color: white;
		font-size: 40rpx;
		font-weight: bold;
		flex: 1;
		text-align: center;
		margin-right: 100rpx; // 平衡返回按钮
	}
}

.content {
	padding-bottom: 40rpx;
}

.status-card {
	background: white;
	border-radius: 24rpx;
	padding: 60rpx 40rpx;
	text-align: center;
	margin-bottom: 30rpx;
	box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.15);

	.status-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}

	.status-title {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 20rpx;
	}

	.status-desc {
		display: block;
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
	}
}

.user-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

	.user-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.user-info {
		flex: 1;

		.user-name {
			display: block;
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 8rpx;
		}

		.user-status {
			display: block;
			font-size: 26rpx;
			color: #52c41a;
			font-weight: 500;

			&.warning {
				color: #faad14;
			}
		}
	}
}

.auth-section {
	margin-bottom: 40rpx;
}

.auth-button {
	width: 100%;
	height: 100rpx;
	border-radius: 20rpx;
	font-size: 32rpx;
	font-weight: bold;
	border: none;
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
	color: white;
	box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.98);
	}

	&.success {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
	}
}

.info-section {
	background: rgba(255, 255, 255, 0.9);
	border-radius: 20rpx;
	padding: 30rpx;

	.info-item {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.info-icon {
			font-size: 32rpx;
			margin-right: 15rpx;
			margin-top: 2rpx;
		}

		.info-text {
			flex: 1;
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
		}
	}
}
</style>