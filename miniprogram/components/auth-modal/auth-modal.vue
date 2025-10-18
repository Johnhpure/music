<template>
	<view class="auth-modal" v-if="visible" @touchmove.stop.prevent>
		<!-- 遮罩层 -->
		<view class="modal-mask" @tap="handleClose"></view>
		
		<!-- 主内容 -->
		<view class="modal-content">
			<!-- 关闭按钮 -->
			<view class="close-btn" @tap="handleClose">
				<text class="icon-close">✕</text>
			</view>
			
			<!-- Logo 和标题 -->
			<view class="header">
				<image class="logo" src="/static/img/logo.png" mode="aspectFit"></image>
				<text class="title">AI音乐创作助手</text>
				<text class="subtitle">创作属于你的音乐世界</text>
			</view>
			
			<!-- 授权说明 -->
			<view class="auth-tips">
				<view class="tip-item">
					<text class="tip-icon">🎵</text>
					<text class="tip-text">创作AI音乐</text>
				</view>
				<view class="tip-item">
					<text class="tip-icon">💾</text>
					<text class="tip-text">保存我的作品</text>
				</view>
				<view class="tip-item">
					<text class="tip-icon">🎁</text>
					<text class="tip-text">获取音乐点数</text>
				</view>
			</view>
			
			<!-- 授权按钮 -->
			<view class="auth-buttons">
				<!-- 微信一键登录（获取手机号） -->
				<button 
					class="auth-btn primary"
					open-type="getPhoneNumber"
					@getphonenumber="handleGetPhoneNumber"
					:loading="loading"
				>
					<text class="btn-icon">📱</text>
					<text class="btn-text">微信一键登录</text>
				</button>
			</view>
			
			<!-- 隐私协议 -->
			<view class="agreement">
				<text class="agreement-text">登录即表示同意</text>
				<text class="agreement-link" @tap="openAgreement">《用户协议》</text>
				<text class="agreement-text">和</text>
				<text class="agreement-link" @tap="openPrivacy">《隐私政策》</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'AuthModal',
	props: {
		// 是否显示
		show: {
			type: Boolean,
			default: false
		},
		// 登录成功后的回调
		onSuccess: {
			type: Function,
			default: null
		}
	},
	data() {
		return {
			visible: false,
			loading: false
		}
	},
	watch: {
		show: {
			handler(val) {
				this.visible = val
			},
			immediate: true
		}
	},
	methods: {
		/**
		 * 处理微信手机号授权
		 */
		async handleGetPhoneNumber(e) {
			console.log('手机号授权回调:', e)
			
			if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
				uni.showToast({
					title: '您取消了授权',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			if (!e.detail.code) {
				uni.showToast({
					title: '授权失败，请重试',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			this.loading = true
			
			try {
				// 步骤1: 先调用 wx.login 获取 code
				const loginRes = await this.wxLogin()
				
				if (!loginRes.code) {
					throw new Error('获取登录凭证失败')
				}
				
				// 步骤2: 调用后端微信登录接口
				const loginResult = await this.$minApi.wechatLogin({
					code: loginRes.code
				})
				
				console.log('微信登录结果:', loginResult)
				
				if (loginResult && loginResult.code === 200) {
					const { token, userInfo } = loginResult.data
					
					// 保存token和用户信息
					uni.setStorageSync('token', token)
					uni.setStorageSync('userInfo', userInfo)
					
					// 步骤3: 如果有手机号code，调用获取手机号接口
					if (e.detail.code) {
						try {
							// 传入刚获取的token，确保请求带上Authorization header
							const phoneResult = await this.$minApi.getUserPhone({
								code: e.detail.code
							}, token)
							
							if (phoneResult && phoneResult.code === 200) {
								console.log('手机号获取成功:', phoneResult.data)
								// 更新本地用户信息
								const updatedUserInfo = { ...userInfo, ...phoneResult.data }
								uni.setStorageSync('userInfo', updatedUserInfo)
							}
						} catch (phoneError) {
							console.error('获取手机号失败:', phoneError)
							// 手机号获取失败不影响登录，继续
						}
					}
					
					uni.showToast({
						title: '登录成功',
						icon: 'success',
						duration: 2000
					})
					
					// 延迟关闭，让用户看到成功提示
					setTimeout(() => {
						this.visible = false
						this.$emit('update:show', false)
						this.$emit('success', loginResult.data)
						
						// 如果有回调函数，执行它
						if (this.onSuccess) {
							this.onSuccess(loginResult.data)
						}
					}, 500)
				} else {
					throw new Error(loginResult.msg || '登录失败')
				}
			} catch (error) {
				console.error('登录失败:', error)
				uni.showToast({
					title: error.message || '登录失败，请重试',
					icon: 'none',
					duration: 2000
				})
			} finally {
				this.loading = false
			}
		},
		
		/**
		 * 调用微信登录
		 */
		wxLogin() {
			return new Promise((resolve, reject) => {
				uni.login({
					provider: 'weixin',
					success: (res) => {
						console.log('wx.login 成功:', res)
						resolve(res)
					},
					fail: (err) => {
						console.error('wx.login 失败:', err)
						reject(err)
					}
				})
			})
		},
		
		/**
		 * 关闭弹窗
		 */
		handleClose() {
			this.visible = false
			this.$emit('update:show', false)
			this.$emit('close')
		},
		
		/**
		 * 打开用户协议
		 */
		openAgreement() {
			uni.navigateTo({
				url: '/pages/user/agreement'
			})
		},
		
		/**
		 * 打开隐私政策
		 */
		openPrivacy() {
			uni.navigateTo({
				url: '/pages/user/privacy'
			})
		}
	}
}
</script>

<style lang="less" scoped>
.auth-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	animation: fadeIn 0.3s ease;
}

.modal-content {
	position: relative;
	width: 600rpx;
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 60rpx 40rpx 40rpx;
	animation: slideUp 0.3s ease;
	z-index: 1;
}

.close-btn {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
}

.close-btn .icon-close {
	font-size: 40rpx;
	color: #787878;
	font-weight: 300;
}

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 50rpx;
}

.header .logo {
	width: 120rpx;
	height: 120rpx;
	margin-bottom: 20rpx;
}

.header .title {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
	margin-bottom: 10rpx;
}

.header .subtitle {
	font-size: 24rpx;
	color: #ACACAC;
}

.auth-tips {
	display: flex;
	justify-content: space-around;
	margin-bottom: 50rpx;
	padding: 30rpx 20rpx;
	background-color: #2D2D2D;
	border-radius: 20rpx;
}

.tip-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.tip-item .tip-icon {
	font-size: 40rpx;
	margin-bottom: 10rpx;
}

.tip-item .tip-text {
	font-size: 22rpx;
	color: #CCCCCC;
	text-align: center;
}

.auth-buttons {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.auth-btn {
	width: 100%;
	height: 90rpx;
	border-radius: 45rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 600;
	border: none;
	padding: 0;
	
	&::after {
		border: none;
	}
	
	&.primary {
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
	}
	
	&.secondary {
		background-color: #2D2D2D;
		color: #FFFFFF;
	}
	
	&[disabled] {
		opacity: 0.6;
	}
}

.auth-btn .btn-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
}

.auth-btn .btn-text {
	font-size: 30rpx;
}

.agreement {
	text-align: center;
	font-size: 22rpx;
	color: #787878;
	line-height: 1.6;
}

.agreement .agreement-text {
	color: #787878;
}

.agreement .agreement-link {
	color: #3B7EFF;
	text-decoration: underline;
}

/* 动画 */
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes slideUp {
	from {
		transform: translateY(100rpx);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>
