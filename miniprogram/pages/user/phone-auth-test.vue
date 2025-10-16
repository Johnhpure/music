<template>
	<view class="container">
		<view class="header">
			<text class="title">手机号授权测试</text>
			<text class="subtitle">基于微信官方API实现</text>
		</view>

		<!-- 当前状态 -->
		<view class="status-card">
			<view class="card-header">
				<text class="card-title">当前状态</text>
			</view>
			<view class="status-info">
				<view class="status-item">
					<text class="label">登录状态:</text>
					<text :class="['value', isLoggedIn ? 'success' : 'warning']">
						{{ isLoggedIn ? '已登录' : '未登录' }}
					</text>
				</view>
				<view class="status-item" v-if="userInfo">
					<text class="label">用户昵称:</text>
					<text class="value">{{ userInfo.nickname || '未设置' }}</text>
				</view>
				<view class="status-item" v-if="userInfo">
					<text class="label">手机号:</text>
					<text :class="['value', userInfo.phone ? 'success' : 'warning']">
						{{ userInfo.phone || '未绑定' }}
					</text>
				</view>
			</view>
		</view>

		<!-- 手机号授权说明 -->
		<view class="info-card">
			<view class="card-title">📱 手机号授权说明</view>
			<view class="info-content">
				<text class="info-text">• 使用微信手机号快速验证组件</text>
				<text class="info-text">• 需要企业认证小程序才能正常使用</text>
				<text class="info-text">• 开发版本可能返回模拟数据</text>
				<text class="info-text">• 每次成功调用收费0.03元</text>
			</view>
		</view>

		<!-- 授权操作按钮 -->
		<view class="action-section">
			<!-- 基础登录 -->
			<button 
				v-if="!isLoggedIn"
				class="auth-btn primary" 
				@click="doBasicLogin"
				:loading="loading.login"
			>
				{{ loading.login ? '登录中...' : '先进行基础登录' }}
			</button>

			<!-- 手机号授权按钮 -->
			<button 
				v-if="isLoggedIn"
				class="auth-btn phone"
				open-type="getPhoneNumber"
				@getphonenumber="onGetPhoneNumber"
				phone-number-no-quota-toast="false"
				:loading="loading.phone"
			>
				{{ loading.phone ? '授权中...' : '🔐 获取微信手机号' }}
			</button>

			<!-- 重新授权 -->
			<button 
				v-if="isLoggedIn && userInfo && userInfo.phone"
				class="auth-btn secondary" 
				@click="reAuth"
			>
				重新授权测试
			</button>
		</view>

		<!-- 测试结果显示 -->
		<view class="result-section">
			<view class="card-title">授权结果</view>
			<view v-if="lastAuthResult" class="result-content">
				<view class="result-item success" v-if="lastAuthResult.success">
					<text class="result-label">✅ 授权成功</text>
					<view class="result-details">
						<text v-if="lastAuthResult.phone">手机号: {{ lastAuthResult.phone }}</text>
						<text v-if="lastAuthResult.nickname">昵称: {{ lastAuthResult.nickname }}</text>
						<text>时间: {{ lastAuthResult.timestamp }}</text>
					</view>
				</view>
				<view class="result-item error" v-else>
					<text class="result-label">❌ 授权失败</text>
					<view class="result-details">
						<text>错误: {{ lastAuthResult.error }}</text>
						<text>时间: {{ lastAuthResult.timestamp }}</text>
					</view>
				</view>
			</view>
			<view v-else class="no-result">
				<text>暂无授权结果</text>
			</view>
		</view>

		<!-- 技术详情 -->
		<view class="tech-section">
			<view class="card-title">技术实现详情</view>
			<view class="tech-content">
				<text class="tech-item">• 使用 wx.login() 获取临时凭证code</text>
				<text class="tech-item">• button组件 open-type="getPhoneNumber" 触发手机号授权</text>
				<text class="tech-item">• bindgetphonenumber 回调获取phoneCode</text>
				<text class="tech-item">• 后端调用微信API /wxa/business/getuserphonenumber</text>
				<text class="tech-item">• 真实微信配置: {{ realAppId }}</text>
			</view>
		</view>

		<!-- 测试日志 -->
		<view class="logs-card">
			<view class="logs-header">
				<text class="card-title">测试日志</text>
				<text class="clear-btn" @click="clearLogs">清空</text>
			</view>
			<scroll-view class="logs-content" scroll-y>
				<view v-for="(log, index) in logs" :key="index" :class="['log-entry', log.type]">
					<text class="log-time">{{ log.time }}</text>
					<text class="log-text">{{ log.message }}</text>
				</view>
				<view v-if="logs.length === 0" class="logs-empty">
					暂无测试日志
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
			isLoggedIn: false,
			userInfo: null,
			lastAuthResult: null,
			logs: [],
			realAppId: 'wxb331c8c2878d040c',
			loading: {
				login: false,
				phone: false
			}
		}
	},
	
	onLoad() {
		this.addLog('手机号授权测试页面加载', 'info');
		this.refreshStatus();
		
		// 获取小程序账号信息
		const accountInfo = WeChatAuthComplete.getAccountInfo();
		if (accountInfo) {
			this.addLog(`小程序AppID: ${accountInfo.miniProgram.appId}`, 'info');
		}
	},
	
	methods: {
		/**
		 * 基础登录
		 */
		async doBasicLogin() {
			this.loading.login = true;
			this.addLog('开始基础登录...', 'info');
			
			try {
				const result = await WeChatAuthComplete.login({
					needUserInfo: true,
					needPhone: false,
					desc: '用于手机号授权测试'
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
				this.loading.login = false;
			}
		},

		/**
		 * 处理手机号授权回调
		 */
		async onGetPhoneNumber(e) {
			this.loading.phone = true;
			this.addLog('收到手机号授权回调', 'info');
			this.addLog(`回调详情: errMsg=${e.detail.errMsg}, errno=${e.detail.errno}`, 'info');
			
			try {
				// 处理授权回调
				const authResult = WeChatAuthComplete.handlePhoneNumberAuth(e);
				
				if (authResult.success) {
					this.addLog('手机号授权成功，获得phoneCode', 'success');
					this.addLog(`PhoneCode: ${authResult.code.substring(0, 20)}...`, 'info');
					
					// 重新登录以绑定手机号
					await this.loginWithPhone(authResult.code);
				} else {
					this.addLog(`手机号授权失败: ${authResult.message}`, 'error');
					this.setAuthResult({
						success: false,
						error: authResult.message,
						timestamp: new Date().toLocaleTimeString()
					});
				}
			} catch (error) {
				this.addLog(`手机号授权处理异常: ${error.message}`, 'error');
				this.setAuthResult({
					success: false,
					error: error.message,
					timestamp: new Date().toLocaleTimeString()
				});
			} finally {
				this.loading.phone = false;
			}
		},

		/**
		 * 使用手机号code登录
		 */
		async loginWithPhone(phoneCode) {
			this.addLog('开始手机号登录流程...', 'info');
			
			try {
				// 重新获取登录code（确保有效性）
				const loginCode = await WeChatAuthComplete.getWxLoginCode();
				this.addLog(`重新获取登录code: ${loginCode}`, 'info');
				
				// 完整授权登录
				const result = await WeChatAuthComplete.login({
					needUserInfo: true,
					phoneCode: phoneCode,
					desc: '用于绑定手机号并提供安全服务'
				});
				
				if (result.success) {
					this.addLog('手机号绑定成功！', 'success');
					
					this.setAuthResult({
						success: true,
						phone: result.userInfo.phone,
						nickname: result.userInfo.nickname,
						timestamp: new Date().toLocaleTimeString()
					});
					
					this.refreshStatus();
					
					// 显示成功提示
					uni.showToast({
						title: '手机号绑定成功',
						icon: 'success',
						duration: 2000
					});
				} else {
					throw new Error(result.message);
				}
			} catch (error) {
				this.addLog(`手机号登录失败: ${error.message}`, 'error');
				this.setAuthResult({
					success: false,
					error: error.message,
					timestamp: new Date().toLocaleTimeString()
				});
			}
		},

		/**
		 * 重新授权测试
		 */
		reAuth() {
			uni.showModal({
				title: '重新授权',
				content: '将清除当前登录状态并重新进行授权，继续吗？',
				success: (res) => {
					if (res.confirm) {
						WeChatAuthComplete.logout();
						this.addLog('已清除登录状态，可重新测试', 'info');
						this.refreshStatus();
						this.lastAuthResult = null;
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
		},

		/**
		 * 设置授权结果
		 */
		setAuthResult(result) {
			this.lastAuthResult = result;
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
			
			if (this.logs.length > 30) {
				this.logs = this.logs.slice(0, 30);
			}
			
			console.log(`[${type.toUpperCase()}] ${message}`);
		},

		/**
		 * 清空日志
		 */
		clearLogs() {
			this.logs = [];
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

.status-card, .info-card, .result-section, .tech-section, .logs-card {
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

.status-info {
	.status-item {
		display: flex;
		justify-content: space-between;
		padding: 12rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
		
		&:last-child {
			border-bottom: none;
		}
		
		.label {
			font-size: 28rpx;
			color: #666;
		}
		
		.value {
			font-size: 28rpx;
			font-weight: bold;
			
			&.success {
				color: #52c41a;
			}
			
			&.warning {
				color: #faad14;
			}
		}
	}
}

.info-content {
	.info-text {
		display: block;
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 8rpx;
		padding-left: 10rpx;
	}
}

.action-section {
	padding: 0 20rpx 20rpx;
}

.auth-btn {
	width: 100%;
	margin-bottom: 16rpx;
	padding: 32rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: bold;
	border: none;
	
	&.primary {
		background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
		color: white;
	}
	
	&.phone {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		color: white;
		box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
	}
	
	&.secondary {
		background: rgba(255,255,255,0.9);
		color: #333;
	}
	
	&:active {
		transform: scale(0.98);
	}
}

.result-content {
	.result-item {
		padding: 20rpx;
		border-radius: 12rpx;
		
		&.success {
			background: #f6ffed;
			border: 1rpx solid #b7eb8f;
		}
		
		&.error {
			background: #fff2f0;
			border: 1rpx solid #ffccc7;
		}
		
		.result-label {
			display: block;
			font-size: 30rpx;
			font-weight: bold;
			margin-bottom: 10rpx;
			
			.success & {
				color: #52c41a;
			}
			
			.error & {
				color: #ff4d4f;
			}
		}
		
		.result-details text {
			display: block;
			font-size: 26rpx;
			color: #666;
			margin-bottom: 4rpx;
		}
	}
}

.tech-content {
	.tech-item {
		display: block;
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
		margin-bottom: 8rpx;
		padding-left: 10rpx;
	}
}

.logs-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
	
	.clear-btn {
		color: #1890ff;
		font-size: 26rpx;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
		background: #e6f7ff;
	}
}

.logs-content {
	height: 400rpx;
	
	.log-entry {
		padding: 16rpx;
		border-radius: 8rpx;
		margin-bottom: 12rpx;
		
		.log-time {
			display: block;
			font-size: 20rpx;
			color: #999;
			margin-bottom: 4rpx;
		}
		
		.log-text {
			font-size: 26rpx;
		}
		
		&.info {
			background: #e6f7ff;
			color: #0050b3;
		}
		
		&.success {
			background: #f6ffed;
			color: #389e0d;
		}
		
		&.error {
			background: #fff2f0;
			color: #cf1322;
		}
	}
	
	.logs-empty {
		text-align: center;
		color: #999;
		font-size: 28rpx;
		padding: 60rpx;
	}
}

.no-result {
	text-align: center;
	color: #999;
	font-size: 28rpx;
	padding: 40rpx;
}
</style>
