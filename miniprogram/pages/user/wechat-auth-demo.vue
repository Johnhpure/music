<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">微信授权功能演示</text>
			<text class="subtitle">测试所有微信授权功能</text>
		</view>

		<!-- 账号信息卡片 -->
		<view class="info-card">
			<view class="card-title">小程序账号信息</view>
			<view v-if="accountInfo" class="account-info">
				<view class="info-item">
					<text class="label">AppID:</text>
					<text class="value">{{ accountInfo.miniProgram.appId }}</text>
				</view>
				<view class="info-item">
					<text class="label">环境:</text>
					<text class="value">{{ envVersionText }}</text>
				</view>
				<view class="info-item" v-if="accountInfo.miniProgram.version">
					<text class="label">版本:</text>
					<text class="value">{{ accountInfo.miniProgram.version }}</text>
				</view>
			</view>
			<view v-else class="no-info">
				<text>无法获取账号信息（基础库版本过低）</text>
			</view>
		</view>

		<!-- 登录状态卡片 -->
		<view class="status-card">
			<view class="status-header">
				<text class="card-title">登录状态</text>
				<text :class="['status-badge', isLoggedIn ? 'success' : 'warning']">
					{{ isLoggedIn ? '✅ 已登录' : '❌ 未登录' }}
				</text>
			</view>
			
			<view v-if="isLoggedIn && userInfo" class="user-display">
				<image class="avatar" :src="userInfo.avatar || '/static/img/profile.svg'" mode="aspectFill" />
				<view class="user-text">
					<text class="nickname">{{ userInfo.nickname }}</text>
					<text class="user-id">ID: {{ userInfo.userId }}</text>
					<text class="credits">💎 {{ userInfo.creditBalance }} 点数</text>
					<text v-if="userInfo.phone" class="phone">📱 {{ userInfo.phone }}</text>
					<text v-else class="phone-empty">📱 未绑定手机号</text>
				</view>
			</view>
		</view>

		<!-- 授权测试按钮组 -->
		<view class="button-section">
			<text class="section-title">基础授权测试</text>
			
			<!-- 获取账号信息 -->
			<button class="auth-button info" @click="getAccountInfo">
				获取小程序账号信息
			</button>

			<!-- 检查授权状态 -->
			<button class="auth-button info" @click="checkAuthStatus">
				检查用户授权状态
			</button>

			<!-- 基础登录（仅code） -->
			<button 
				class="auth-button primary" 
				@click="testBasicLogin"
				:loading="loading.basic"
			>
				{{ loading.basic ? '登录中...' : '基础登录（仅code）' }}
			</button>

			<!-- 完整用户信息授权 -->
			<button 
				class="auth-button primary" 
				@click="testUserInfoAuth"
				:loading="loading.userInfo"
			>
				{{ loading.userInfo ? '授权中...' : '用户信息授权（昵称+头像）' }}
			</button>
		</view>

		<!-- 手机号授权测试 -->
		<view class="button-section">
			<text class="section-title">手机号授权测试</text>
			<text class="section-note">需要企业认证小程序才能使用，开发环境可能返回模拟数据</text>
			
			<!-- 手机号快速验证按钮 -->
			<button 
				class="auth-button phone"
				open-type="getPhoneNumber"
				@getphonenumber="onGetPhoneNumber"
				phone-number-no-quota-toast="false"
			>
				获取手机号（快速验证）
			</button>

			<button 
				class="auth-button primary" 
				@click="testCompleteAuth"
				:loading="loading.complete"
			>
				{{ loading.complete ? '授权中...' : '一键完整授权（用户信息+手机号）' }}
			</button>
		</view>

		<!-- 场景化授权测试 -->
		<view class="button-section">
			<text class="section-title">场景化授权测试</text>
			
			<button class="auth-button secondary" @click="testCreationAuth">
				创作功能授权检查
			</button>
			
			<button class="auth-button secondary" @click="testPurchaseAuth">
				购买功能授权检查
			</button>
			
			<button class="auth-button secondary" @click="testProfileAuth">
				个人中心授权检查
			</button>
		</view>

		<!-- 管理操作 -->
		<view class="button-section">
			<text class="section-title">管理操作</text>
			
			<button class="auth-button danger" @click="logout" v-if="isLoggedIn">
				退出登录
			</button>
			
			<button class="auth-button secondary" @click="refreshStatus">
				刷新状态
			</button>
			
			<button class="auth-button secondary" @click="clearLogs">
				清空日志
			</button>
		</view>

		<!-- 授权日志 -->
		<view class="logs-section">
			<view class="logs-header">
				<text class="card-title">授权日志</text>
				<text class="log-count">{{ logs.length }} 条记录</text>
			</view>
			<scroll-view class="logs-scroll" scroll-y :scroll-top="scrollTop">
				<view v-for="(log, index) in logs" :key="index" :class="['log-item', `log-${log.type}`]">
					<text class="log-time">{{ log.time }}</text>
					<text class="log-msg">{{ log.message }}</text>
				</view>
				<view v-if="logs.length === 0" class="logs-empty">
					暂无日志记录
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import WeChatAuthComplete from '@/utils/wechatAuthComplete.js'

export default {
	data() {
		return {
			accountInfo: null,
			userInfo: null,
			isLoggedIn: false,
			logs: [],
			scrollTop: 0,
			loading: {
				basic: false,
				userInfo: false,
				complete: false,
			}
		}
	},
	
	computed: {
		envVersionText() {
			const versionMap = {
				'develop': '开发版',
				'trial': '体验版', 
				'release': '正式版'
			};
			return versionMap[this.accountInfo?.miniProgram?.envVersion] || '未知';
		}
	},
	
	onLoad() {
		this.addLog('页面加载完成', 'info');
		this.refreshStatus();
	},
	
	methods: {
		/**
		 * 获取小程序账号信息
		 */
		getAccountInfo() {
			this.addLog('获取小程序账号信息...', 'info');
			const info = WeChatAuthComplete.getAccountInfo();
			if (info) {
				this.accountInfo = info;
				this.addLog(`账号信息获取成功: ${info.miniProgram.appId}`, 'success');
			} else {
				this.addLog('账号信息获取失败', 'error');
			}
		},

		/**
		 * 检查授权状态
		 */
		async checkAuthStatus() {
			this.addLog('检查用户授权状态...', 'info');
			const status = await WeChatAuthComplete.checkAuthSettings();
			this.addLog(`用户信息授权: ${status.hasUserInfo ? '已授权' : '未授权'}`, 
				status.hasUserInfo ? 'success' : 'warning');
		},

		/**
		 * 基础登录测试
		 */
		async testBasicLogin() {
			this.loading.basic = true;
			this.addLog('开始基础登录测试...', 'info');
			
			try {
				const result = await WeChatAuthComplete.login({
					needUserInfo: false,
					needPhone: false
				});
				
				if (result.success) {
					this.addLog('基础登录成功', 'success');
					this.refreshStatus();
				} else {
					this.addLog(`基础登录失败: ${result.message}`, 'error');
				}
			} catch (error) {
				this.addLog(`基础登录异常: ${error.message}`, 'error');
			} finally {
				this.loading.basic = false;
			}
		},

		/**
		 * 用户信息授权测试
		 */
		async testUserInfoAuth() {
			this.loading.userInfo = true;
			this.addLog('开始用户信息授权测试...', 'info');
			
			try {
				const result = await WeChatAuthComplete.login({
					needUserInfo: true,
					needPhone: false,
					desc: '用于完善个人资料和提供个性化服务'
				});
				
				if (result.success) {
					this.addLog('用户信息授权成功', 'success');
					this.addLog(`获得用户信息: ${result.userInfo.nickname}`, 'success');
					this.refreshStatus();
				} else {
					this.addLog(`用户信息授权失败: ${result.message}`, 'error');
				}
			} catch (error) {
				this.addLog(`用户信息授权异常: ${error.message}`, 'error');
			} finally {
				this.loading.userInfo = false;
			}
		},

		/**
		 * 手机号授权回调
		 */
		async onGetPhoneNumber(e) {
			this.addLog('收到手机号授权回调...', 'info');
			
			const result = WeChatAuthComplete.handlePhoneNumberAuth(e);
			
			if (result.success) {
				this.addLog('手机号授权成功，开始登录...', 'success');
				
				try {
					// 重新获取登录code（因为手机号code有时效性）
					const loginCode = await WeChatAuthComplete.getWxLoginCode();
					
					const authResult = await WeChatAuthComplete.login({
						needUserInfo: true,
						phoneCode: result.code,
						desc: '用于账户安全验证'
					});
					
					if (authResult.success && authResult.userInfo.phone) {
						this.addLog(`手机号绑定成功: ${authResult.userInfo.phone}`, 'success');
						this.refreshStatus();
					} else {
						this.addLog('手机号绑定失败', 'error');
					}
				} catch (error) {
					this.addLog(`手机号授权登录异常: ${error.message}`, 'error');
				}
			} else {
				this.addLog(`手机号授权失败: ${result.message}`, 'error');
			}
		},

		/**
		 * 一键完整授权测试
		 */
		async testCompleteAuth() {
			this.loading.complete = true;
			this.addLog('开始一键完整授权...', 'info');
			
			try {
				const result = await WeChatAuthComplete.completeAuth();
				
				if (result.success) {
					this.addLog('一键完整授权成功', 'success');
					this.refreshStatus();
				} else {
					this.addLog(`一键完整授权失败: ${result.message}`, 'error');
				}
			} catch (error) {
				this.addLog(`一键完整授权异常: ${error.message}`, 'error');
			} finally {
				this.loading.complete = false;
			}
		},

		/**
		 * 场景化授权测试
		 */
		async testCreationAuth() {
			this.addLog('测试创作功能授权...', 'info');
			const result = await WeChatAuthComplete.checkCreationAuth();
			this.addLog(`创作授权结果: ${result.success ? '通过' : '失败'}`, 
				result.success ? 'success' : 'warning');
			if (result.success) this.refreshStatus();
		},

		async testPurchaseAuth() {
			this.addLog('测试购买功能授权...', 'info');
			const result = await WeChatAuthComplete.checkPurchaseAuth();
			this.addLog(`购买授权结果: ${result.success ? '通过' : '失败'}`, 
				result.success ? 'success' : 'warning');
			if (result.success) this.refreshStatus();
		},

		async testProfileAuth() {
			this.addLog('测试个人中心授权...', 'info');
			const result = await WeChatAuthComplete.checkProfileAuth();
			this.addLog(`个人中心授权结果: ${result.success ? '通过' : '失败'}`, 
				result.success ? 'success' : 'warning');
			if (result.success) this.refreshStatus();
		},

		/**
		 * 退出登录
		 */
		logout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						WeChatAuthComplete.logout();
						this.addLog('已退出登录', 'info');
						this.refreshStatus();
					}
				}
			});
		},

		/**
		 * 刷新状态
		 */
		refreshStatus() {
			this.isLoggedIn = WeChatAuthComplete.isLoggedIn();
			this.userInfo = WeChatAuthComplete.getUserInfo();
			this.accountInfo = WeChatAuthComplete.getAccountInfo();
			
			this.addLog(`状态刷新完成: ${this.isLoggedIn ? '已登录' : '未登录'}`, 'info');
		},

		/**
		 * 添加日志
		 */
		addLog(message, type = 'info') {
			const log = {
				time: new Date().toLocaleTimeString(),
				message,
				type
			};
			this.logs.unshift(log);
			
			// 限制日志数量
			if (this.logs.length > 50) {
				this.logs = this.logs.slice(0, 50);
			}
			
			// 滚动到顶部
			this.$nextTick(() => {
				this.scrollTop = 0;
			});
			
			console.log(`[${type.toUpperCase()}] ${message}`);
		},

		/**
		 * 清空日志
		 */
		clearLogs() {
			this.logs = [];
			this.addLog('日志已清空', 'info');
		}
	}
}
</script>

<style lang="scss">
.container {
	padding: 20rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
}

.header {
	text-align: center;
	padding: 30rpx;
	color: white;
	
	.title {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}
	
	.subtitle {
		display: block;
		font-size: 28rpx;
		opacity: 0.8;
	}
}

.info-card, .status-card {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
}

.account-info {
	.info-item {
		display: flex;
		justify-content: space-between;
		padding: 10rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		
		.label {
			color: #666;
			font-size: 28rpx;
		}
		
		.value {
			color: #333;
			font-size: 28rpx;
			font-weight: bold;
		}
	}
}

.status-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	
	.status-badge {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: bold;
		
		&.success {
			background: #f6ffed;
			color: #52c41a;
		}
		
		&.warning {
			background: #fff7e6;
			color: #faad14;
		}
	}
}

.user-display {
	display: flex;
	align-items: center;
	
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.user-text {
		flex: 1;
		
		.nickname {
			display: block;
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
			margin-bottom: 8rpx;
		}
		
		.user-id, .credits {
			display: block;
			font-size: 24rpx;
			color: #666;
			margin-bottom: 4rpx;
		}
		
		.phone {
			display: block;
			font-size: 26rpx;
			color: #52c41a;
			font-weight: bold;
		}
		
		.phone-empty {
			display: block;
			font-size: 26rpx;
			color: #999;
		}
	}
}

.button-section {
	margin-bottom: 30rpx;
	
	.section-title {
		display: block;
		color: white;
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		text-align: center;
	}
	
	.section-note {
		display: block;
		color: rgba(255,255,255,0.8);
		font-size: 24rpx;
		text-align: center;
		margin-bottom: 20rpx;
		padding: 0 20rpx;
		line-height: 1.4;
	}
}

.auth-button {
	width: 100%;
	margin-bottom: 16rpx;
	padding: 28rpx;
	border-radius: 16rpx;
	font-size: 30rpx;
	font-weight: bold;
	border: none;
	
	&.primary {
		background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
		color: white;
	}
	
	&.secondary {
		background: rgba(255,255,255,0.9);
		color: #333;
	}
	
	&.info {
		background: linear-gradient(135deg, #13c2c2 0%, #1890ff 100%);
		color: white;
	}
	
	&.phone {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		color: white;
	}
	
	&.danger {
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		color: white;
	}
	
	&:active {
		transform: scale(0.98);
		opacity: 0.8;
	}
}

.logs-section {
	background: white;
	border-radius: 20rpx;
	padding: 30rpx;
	
	.logs-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		
		.log-count {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.logs-scroll {
		height: 500rpx;
		
		.log-item {
			padding: 16rpx 20rpx;
			border-radius: 12rpx;
			margin-bottom: 12rpx;
			
			.log-time {
				display: block;
				font-size: 20rpx;
				color: #999;
				margin-bottom: 6rpx;
			}
			
			.log-msg {
				font-size: 26rpx;
				line-height: 1.3;
			}
			
			&.log-info {
				background: #e6f7ff;
				color: #0050b3;
			}
			
			&.log-success {
				background: #f6ffed;
				color: #389e0d;
			}
			
			&.log-warning {
				background: #fffbe6;
				color: #d48806;
			}
			
			&.log-error {
				background: #fff2f0;
				color: #cf1322;
			}
		}
		
		.logs-empty {
			text-align: center;
			padding: 60rpx;
			color: #999;
			font-size: 28rpx;
		}
	}
}

.no-info {
	text-align: center;
	color: #999;
	font-size: 28rpx;
	padding: 40rpx;
}
</style>
