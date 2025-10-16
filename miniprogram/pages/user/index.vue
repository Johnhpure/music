<template>
	<view class="container">
		<!-- 用户信息展示 -->
		<view class="user-info">
			<view class="avatar-container">
				<image class="user-avatar" :src="userAvatar" @click="handleAvatarClick"></image>
				<view v-if="!isLoggedIn" class="auth-badge">点击授权</view>
			</view>
			<view class="user-details">
				<view class="user-name-row">
					<text class="user-name">{{ userNickname }}</text>
					<view v-if="isLoggedIn" class="auth-status">
						<text v-if="userHasPhone" class="status-badge verified">✅</text>
						<text v-else class="status-badge pending" @click="showPhoneAuthPrompt">📱</text>
					</view>
				</view>
				<view class="user-info-row" v-if="isLoggedIn && userHasPhone">
					<text class="user-phone">{{ maskedUserPhone }}</text>
				</view>
				<view class="points-info">
					<view class="works-badge" @click="navigateTo('/pages/user/works')">
						<text class="music-icon">🎼</text>
						<text class="works-number">已创作{{ userWorksCount }}首</text>
					</view>
					<text class="view-details" @click="navigateTo('/pages/user/works')">查看作品</text>
				</view>
			</view>
		</view>

		<!-- 提示信息 -->
		<view class="cloud-info">
			<text class="cloud-icon">☁️</text>
			<text class="cloud-text">云端作品保存3个月后将自动删除，请及时下载重要作品</text>
			<text class="arrow-icon">></text>
		</view>

		<!-- 作品列表 -->
		<view class="works-section">
			<view class="works-header">
				<text class="section-title">我的作品</text>
				<text class="manage-link" @click="navigateTo('/pages/user/works')">管理</text>
			</view>
			<view class="works-list">
				<view class="work-item">
					<view class="work-icon-container">
						<text class="work-icon">🎵</text>
					</view>
					<view class="work-content">
						<view class="work-main">
							<text class="work-title">夏日晚风</text>
							<view class="work-actions">
								<text class="download-status">已下载</text>
								<text class="play-button">▶</text>
							</view>
						</view>
						<view class="work-sub">
							<text class="work-date">2023-06-15</text>
							<view class="work-tags">
								<text class="work-genre">流行</text>
								<text class="share-button">分享</text>
							</view>
						</view>
					</view>
				</view>

				<view class="work-item">
					<view class="work-icon-container purple">
						<text class="work-icon">🎵</text>
					</view>
					<view class="work-content">
						<view class="work-main">
							<text class="work-title">城市霓虹</text>
							<view class="work-actions">
								<text class="cloud-status">云端</text>
								<text class="play-button">▶</text>
							</view>
						</view>
						<view class="work-sub">
							<text class="work-date">2023-06-10</text>
							<view class="work-tags">
								<text class="work-genre">电子</text>
								<text class="share-button">分享</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="view-all">
				<text class="view-all-link" @click="navigateTo('/pages/user/works')">查看全部作品</text>
			</view>
		</view>

		<!-- 音乐点数中心 -->
		<view class="points-section">
			<text class="section-title">音乐点数中心</text>
			
			<view class="points-container">
				<view class="points-balance">
					<view class="balance-label">
						<text class="coin-icon">🪙</text>
						<text>音乐点数余额</text>
					</view>
					<text class="balance-value">320</text>
				</view>
				
				<view class="divider"></view>
				
				<view class="points-actions">
					<view class="action-item">
						<text class="action-icon share">🔄</text>
						<text class="action-text">分享获取点数</text>
					</view>
					<view class="action-item">
						<text class="action-icon ad">Ad</text>
						<text class="action-text">观看广告获取</text>
					</view>
					<view class="action-item">
						<text class="action-icon checkin">✓</text>
						<text class="action-text" @click="navigateTo('/pages/user/checkin')">每日签到</text>
					</view>
				</view>
				
				<button class="purchase-button" @click="navigateTo('/pages/user/points?activeTab=free')">购买点数</button>
				
				<view class="points-rule">
					<text class="rule-text">创建一首歌曲消耗20点</text>
					<text class="rule-link" @click="navigateTo('/pages/user/points?activeTab=rules')">查看规则</text>
				</view>
			</view>
		</view>
		
		<!-- 系统设置 -->
		<view class="settings-section">
			<text class="section-title">系统设置</text>
			
			<view class="settings-list">
				<view class="settings-item" @click="navigateTo('/pages/user/agreement')">
					<view class="item-left">
						<text class="item-icon">📄</text>
						<text class="item-text">用户协议</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
				<view class="settings-item" @click="navigateTo('/pages/user/privacy')">
					<view class="item-left">
						<text class="item-icon">🛡️</text>
						<text class="item-text">隐私政策</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
				<view class="settings-item" @click="navigateTo('/pages/user/copyright')">
					<view class="item-left">
						<text class="item-icon">©️</text>
						<text class="item-text">版权说明</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
				<view class="settings-item" @click="navigateTo('/pages/user/help')">
					<view class="item-left">
						<text class="item-icon">❓</text>
						<text class="item-text">帮助中心</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
				<view class="settings-item" @click="navigateTo('/pages/user/feedback')">
					<view class="item-left">
						<text class="item-icon">💬</text>
						<text class="item-text">意见反馈</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
				<view class="settings-item" @click="navigateTo('/pages/user/about')">
					<view class="item-left">
						<text class="item-icon">ℹ️</text>
						<text class="item-text">关于我们</text>
					</view>
					<text class="arrow-icon">></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue'
	import globalConfig from '@/config'
	import WeChatAuth from '@/utils/wechatAuth'
import WeChatAuthComplete from '@/utils/wechatAuthComplete'
	
	export default {
		components: {
			uniIcons,
			uniNavBar
		},
		computed: {
			...mapGetters(['user','themeBgColor', 'darkMode', 'isLoggedIn', 'userAvatar', 'userNickname']),
			
			// 用户点数
			userPoints() {
				if (this.user && this.user.points !== undefined) {
					return this.user.points
				}
				return 320 // 默认值，实际应从后端获取
			},

			// 用户是否有手机号
			userHasPhone() {
				return this.user && this.user.phone && this.user.phone !== '';
			},

			// 脱敏显示的手机号
			maskedUserPhone() {
				if (!this.userHasPhone) return '';
				const phone = this.user.phone;
				if (phone.length >= 11) {
					return phone.substring(0, 3) + '****' + phone.substring(7);
				}
				return phone;
			},

			// 用户作品数量
			userWorksCount() {
				return this.user?.worksCount || this.worksCount || 0;
			},

			// 用户点数余额
			userCreditBalance() {
				return this.user?.creditBalance || this.user?.points || 0;
			}
		},
		data() {
			return {
				baseUrl: "",
				// 窗口高度
				winHeight: "",
				loading: false,
				isEnd: false, // 是否已加载全部数据
				userImage: '/static/img/profile.svg', // 用户头像
				userName: '音乐创作者', // 用户名称
				userEmail: 'user@example.com', // 用户邮箱
				worksCount: 0, // 用户作品数量
				works: [
					{ id: 1, title: '夏日晚风', date: '2023-06-15', status: '已下载', genre: '流行' },
					{ id: 2, title: '城市霓虹', date: '2023-06-10', status: '云端', genre: '电子' }
				] // 作品列表
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
			    title: '个人中心'
			})
			this.setNavBarColor()
		},

		async onLoad() {
			//  高度自适应
			uni.getSystemInfo({
				success: res => {
					this.winHeight = res.windowHeight
				}
			})
			this.baseUrl = globalConfig.baseUrl.replace("/api","");
			
			// 检查登录状态并加载用户数据
			await this.checkAutoLogin();
		},
		
		async onShow() {
			this.setNavBarColor();
			// 页面显示时刷新用户数据
			await this.loadUserData();
		},
		// 监听页面滚动到底部
		onReachBottom() {
			if (!this.loading && !this.isEnd) {
				this.queryParams.page++
			}
		},
		methods: {
			navigateTo(url) {
				uni.navigateTo({
					url: url
				})
			},
			setNavBarColor() {
				// navBar-bg-color
				uni.setNavigationBarColor({
				    frontColor: '#ffffff',
				    backgroundColor: this.themeBgColor,
				    animation: {
				        duration: 400,
				        timingFunc: 'easeIn'
				    }
				})
			},
			
			// 处理头像点击事件
			async handleAvatarClick() {
				console.log('🎯 点击了用户头像，开始授权检查...');
				
				// 如果已登录，显示用户菜单或完善信息选项
				if (this.isLoggedIn) {
					await this.showLoggedInOptions();
					return;
				}
				
				// 如果未登录，触发完整的微信授权流程
				await this.handleCompleteAuth();
			},

			// 显示已登录用户的选项
			async showLoggedInOptions() {
				const user = this.user || {};
				const hasPhone = user.phone && user.phone !== '';
				const hasCompleteInfo = user.nickname && user.avatar;
				
				let itemList = ['个人资料', '我的作品'];
				
				// 如果用户信息不完整，提供完善信息选项
				if (!hasPhone || !hasCompleteInfo) {
					itemList.unshift('完善个人信息');
				}
				
				itemList.push('设置', '退出登录');
				
				uni.showActionSheet({
					itemList: itemList,
					success: async (res) => {
						const selectedItem = itemList[res.tapIndex];
						
						switch(selectedItem) {
							case '完善个人信息':
								await this.handleCompleteProfile();
								break;
							case '个人资料':
								this.showUserProfile();
								break;
							case '我的作品':
								this.navigateTo('/pages/user/works');
								break;
							case '设置':
								this.navigateTo('/pages/user/settings');
								break;
							case '退出登录':
								this.handleLogout();
								break;
						}
					}
				});
			},

			// 处理完整的微信授权流程
			async handleCompleteAuth() {
				console.log('🔐 开始完整微信授权流程（新用户）...');
				
				uni.showLoading({
					title: '正在授权...'
				});
				
				try {
					// 使用智能授权，适配个人中心场景
					const authResult = await WeChatAuthComplete.smartAuth('profile');
					
					// 先隐藏loading
					uni.hideLoading();
					
					if (authResult.success) {
						console.log('✅ 完整授权成功!', authResult.userInfo);
						
						// 显示授权成功提示
						uni.showToast({
							title: '授权成功！',
							icon: 'success',
							duration: 2000
						});
						
						// 刷新页面数据
						await this.refreshUserData();
						
						// 检查是否需要手机号授权
						if (!authResult.userInfo.hasPhone) {
							setTimeout(() => {
								this.showPhoneAuthPrompt();
							}, 2500);
						}
						
					} else {
						console.log('❌ 授权失败:', authResult.message);
						uni.showToast({
							title: authResult.message || '授权失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					// 确保隐藏loading
					uni.hideLoading();
					
					console.error('❌ 授权异常:', error);
					uni.showToast({
						title: '授权失败，请重试',
						icon: 'none',
						duration: 2000
					});
				}
			},

			// 完善个人信息
			async handleCompleteProfile() {
				console.log('📝 开始完善个人信息...');
				
				const user = this.user || {};
				const needsPhone = !user.phone;
				const needsUserInfo = !user.nickname || !user.avatar;
				
				if (needsPhone) {
					this.showPhoneAuthPrompt();
				} else if (needsUserInfo) {
					// 重新获取用户信息
					try {
						const result = await WeChatAuthComplete.login({
							needUserInfo: true,
							needPhone: false,
							desc: '完善您的个人资料'
						});
						
						if (result.success) {
							uni.showToast({
								title: '信息更新成功',
								icon: 'success'
							});
							await this.refreshUserData();
						}
					} catch (error) {
						uni.showToast({
							title: '更新失败，请重试',
							icon: 'none'
						});
					}
				} else {
					uni.showToast({
						title: '您的信息已完善',
						icon: 'success'
					});
				}
			},

			// 显示手机号授权提示
			showPhoneAuthPrompt() {
				uni.showModal({
					title: '绑定手机号',
					content: '为了提供更好的服务和账户安全，建议您绑定手机号。是否现在绑定？',
					confirmText: '立即绑定',
					cancelText: '暂时跳过',
					success: (res) => {
						if (res.confirm) {
							// 跳转到手机号授权页面
							uni.navigateTo({
								url: '/pages/user/phone-auth'
							});
						}
					}
				});
			},
			
			// 显示用户菜单
			showUserMenu() {
				uni.showActionSheet({
					itemList: ['个人资料', '设置', '退出登录'],
					success: (res) => {
						switch(res.tapIndex) {
							case 0:
								// 个人资料
								this.showUserProfile();
								break;
							case 1:
								// 设置
								this.navigateTo('/pages/user/settings');
								break;
							case 2:
								// 退出登录
								this.handleLogout();
								break;
						}
					}
				});
			},
			
			// 显示用户资料
			showUserProfile() {
				const user = this.user || {};
				uni.showModal({
					title: '个人资料',
					content: `昵称: ${user.nickName || '音乐创作者'}\n已创作作品: ${this.userWorksCount}首\n点数余额: ${this.userCreditBalance || 0}点\n注册时间: ${user.createdAt || '未知'}`,
					showCancel: false,
					confirmText: '确定'
				});
			},
			
			// 退出登录
			handleLogout() {
				uni.showModal({
					title: '确认退出',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.dispatch('logout');
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
							// 刷新页面数据
							this.refreshUserData();
						}
					}
				});
			},
			
			// 检查自动登录
			async checkAutoLogin() {
				try {
					// 首先检查Vuex中是否已有用户信息
					if (this.isLoggedIn) {
						console.log('✅ 用户已登录 (Vuex)');
						await this.loadUserData();
						return;
					}
					
					// 检查本地存储中的登录状态
					const isLoggedIn = WeChatAuth.isLoggedIn();
					
					if (isLoggedIn) {
						// 如果本地有登录信息但Vuex没有，更新Vuex状态
						const userInfo = WeChatAuth.getUserInfo();
						const token = uni.getStorageSync('token');
						
						this.$store.commit('login', {
							...userInfo,
							token: token,
							ApiToken: token
						});
						
						console.log('✅ 从本地存储恢复登录状态');
						await this.loadUserData();
					} else {
						console.log('ℹ️ 用户未登录');
					}
				} catch (error) {
					console.error('❌ 自动登录检查失败:', error);
				}
			},
			
			// 加载用户数据（优化容错处理）
			async loadUserData() {
				if (!this.isLoggedIn) {
					this.worksCount = 0;
					return;
				}
				
				try {
					// 获取用户点数余额（这个接口正常工作）
					await this.$store.dispatch('getCreditBalance');
					console.log('✅ 用户点数余额获取成功');
				} catch (error) {
					console.log('⚠️ 获取用户点数余额失败:', error.message);
				}
				
				try {
					// 获取用户作品数量（可能404，但不影响主要功能）
					await this.loadUserWorksCount();
				} catch (error) {
					console.log('⚠️ 获取用户作品数量失败:', error.message);
					this.worksCount = 0;
				}
				
				console.log('✅ 个人中心页面数据更新完成（部分接口可能未实现）');
			},
			
			// 获取用户作品数量（优化容错处理）
			async loadUserWorksCount() {
				try {
					// 方法1: 先尝试获取用户统计信息
					const statsResponse = await this.$minApi.getUserStats();
					if (statsResponse.code === 200) {
						this.worksCount = statsResponse.data.totalWorks || 0;
						console.log('✅ 从用户统计获取作品数量:', this.worksCount);
						return;
					}
				} catch (error) {
					console.log('⚠️ 用户统计接口暂未实现 (404)，跳过');
				}
				
				try {
					// 方法2: 如果统计接口失败，通过作品列表获取
					const worksResponse = await this.$minApi.getUserWorks({
						page: 1,
						pageSize: 1 // 只获取第一页来获取总数
					});
					
					if (worksResponse.code === 200) {
						this.worksCount = worksResponse.data.total || 0;
						console.log('✅ 从作品列表获取作品数量:', this.worksCount);
					} else {
						console.log('⚠️ 作品列表接口返回失败，使用默认值');
						this.worksCount = 0;
					}
				} catch (error) {
					console.log('⚠️ 作品列表接口暂未实现 (404)，使用默认值');
					this.worksCount = 0;
				}
			},
			
			// 刷新用户数据
			async refreshUserData() {
				await this.loadUserData();
				// 触发页面重新计算computed属性
				this.$forceUpdate();
			}
		}
	}
</script>

<style lang="less">
	.container {
		background-color: #121212;
		color: #FFFFFF;
		padding: 20rpx;
		min-height: 100vh;
	}

	// 用户信息卡片样式
	.user-info {
		display: flex;
		align-items: center;
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}

	.avatar-container {
		position: relative;
		margin-right: 20rpx;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 2rpx solid #0B67EC;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.user-avatar:hover {
		transform: scale(1.05);
		border-color: #36D1A6;
	}

	.auth-badge {
		position: absolute;
		bottom: -5rpx;
		right: -5rpx;
		background: linear-gradient(135deg, #36D1A6 0%, #0B67EC 100%);
		color: white;
		font-size: 20rpx;
		padding: 4rpx 8rpx;
		border-radius: 12rpx;
		border: 2rpx solid #1E1E1E;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-right: 10rpx;
	}

	.auth-status {
		display: flex;
		align-items: center;
	}

	.status-badge {
		font-size: 24rpx;
		padding: 4rpx 8rpx;
		border-radius: 12rpx;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.status-badge.verified {
		background: rgba(54, 209, 166, 0.2);
		color: #36D1A6;
		border: 1rpx solid #36D1A6;
	}

	.status-badge.pending {
		background: rgba(250, 173, 20, 0.2);
		color: #FAAD14;
		border: 1rpx solid #FAAD14;
		animation: shake 3s infinite;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25%, 75% { transform: translateX(-2rpx); }
		50% { transform: translateX(2rpx); }
	}

	.user-info-row {
		margin-bottom: 6rpx;
	}

	.user-phone {
		font-size: 26rpx;
		color: #36D1A6;
		font-weight: 500;
	}

	.points-info {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
	}

	.works-badge {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #36D1A6 0%, #0B67EC 100%);
		border-radius: 30rpx;
		padding: 6rpx 14rpx;
		margin-right: 15rpx;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.works-badge:hover {
		transform: scale(1.02);
		box-shadow: 0 4rpx 12rpx rgba(54, 209, 166, 0.3);
	}

	.music-icon {
		font-size: 24rpx;
		margin-right: 4rpx;
	}

	.works-number {
		font-size: 24rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	.view-details {
		font-size: 24rpx;
		color: #36D1A6;
		text-decoration: underline;
		cursor: pointer;
	}
	
	.view-details:hover {
		color: #0B67EC;
	}

	// 云存储提示样式
	.cloud-info {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
	}

	.cloud-icon {
		font-size: 30rpx;
		color: #3B7EFF;
		margin-right: 10rpx;
	}

	.cloud-text {
		flex: 1;
		font-size: 24rpx;
		color: #CCCCCC;
	}
	
	.arrow-icon {
		font-size: 24rpx;
		color: #787878;
	}

	// 作品列表样式
	.works-section {
		margin-bottom: 20rpx;
	}

	.works-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.manage-link {
		font-size: 24rpx;
		color: #ACACAC;
	}

	.works-list {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.work-item {
		display: flex;
		padding: 20rpx;
		border-bottom: 1px solid #2D2D2D;
	}

	.work-icon-container {
		width: 80rpx;
		height: 80rpx;
		background-color: #3B7EFF;
		border-radius: 10rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 20rpx;
		
		&.purple {
			background-color: #7342CC;
		}
	}

	.work-icon {
		font-size: 32rpx;
		color: #FFFFFF;
	}

	.work-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.work-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.work-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.work-actions {
		display: flex;
		align-items: center;
	}

	.download-status {
		font-size: 24rpx;
		color: #36D1A6;
		margin-right: 15rpx;
	}
	
	.cloud-status {
		font-size: 24rpx;
		color: #FFB443;
		margin-right: 15rpx;
	}

	.play-button {
		font-size: 30rpx;
		color: #3B7EFF;
	}

	.work-sub {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.work-date {
		font-size: 24rpx;
		color: #787878;
	}

	.work-tags {
		display: flex;
		align-items: center;
	}

	.work-genre {
		font-size: 22rpx;
		color: #ACACAC;
		background-color: #2D2D2D;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 10rpx;
	}

	.share-button {
		font-size: 24rpx;
		color: #3B7EFF;
	}
	
	.view-all {
		display: flex;
		justify-content: center;
		margin-top: 15rpx;
	}
	
	.view-all-link {
		font-size: 26rpx;
		color: #3B7EFF;
		padding: 10rpx;
	}

	// 点数中心样式
	.points-section {
		margin-bottom: 20rpx;
	}

	.points-container {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 20rpx;
		margin-top: 15rpx;
	}

	.points-balance {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.balance-label {
		display: flex;
		align-items: center;
	}

	.coin-icon {
		font-size: 30rpx;
		color: #FFB443;
		margin-right: 10rpx;
	}

	.balance-value {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.divider {
		height: 1px;
		background-color: #2D2D2D;
		margin: 20rpx 0;
	}

	.points-actions {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.action-item {
		width: 30%;
		background-color: #2D2D2D;
		border-radius: 10rpx;
		padding: 15rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.action-icon {
		font-size: 36rpx;
		margin-bottom: 10rpx;
		
		&.share {
			color: #3B7EFF;
		}
		
		&.ad {
			color: #7342CC;
		}
		
		&.checkin {
			color: #36D1A6;
		}
	}

	.action-text {
		font-size: 22rpx;
		color: #ACACAC;
		text-align: center;
	}

	.purchase-button {
		width: 100%;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
		border-radius: 30rpx;
		padding: 15rpx 0;
		font-size: 28rpx;
		margin: 20rpx 0;
	}

	.points-rule {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.rule-text {
		font-size: 22rpx;
		color: #787878;
	}

	.rule-link {
		font-size: 22rpx;
		color: #3B7EFF;
	}

	// 系统设置样式
	.settings-section {
		margin-bottom: 20rpx;
	}

	.settings-list {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		overflow: hidden;
		margin-top: 15rpx;
	}

	.settings-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 25rpx 20rpx;
		border-bottom: 1px solid #2D2D2D;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.item-left {
		display: flex;
		align-items: center;
	}

	.item-icon {
		font-size: 36rpx;
		margin-right: 15rpx;
	}

	.item-text {
		font-size: 28rpx;
		color: #FFFFFF;
	}
</style>