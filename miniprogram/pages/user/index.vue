<template>
	<view class="container">
		<!-- 登录授权弹窗 -->
		<AuthModal 
			:show.sync="showAuthModal" 
			@success="handleAuthSuccess"
		/>
		
		<!-- 用户信息展示 -->
		<view class="user-info">
			<!-- 头像点击区域 - 点击后先检查登录 -->
			<view class="avatar-wrapper" @click="handleAvatarClick">
				<image class="user-avatar" :src="userImage"></image>
				<view class="avatar-edit-hint">
					<text class="edit-icon">✏️</text>
				</view>
			</view>
			
			<view class="user-details">
				<!-- 点击昵称弹出编辑框 -->
				<text class="user-name" @click="showNicknameModal">{{ userName }}</text>
				<view class="points-info">
					<view class="points-badge">
						<text class="music-icon">🎵</text>
						<text class="points-number">320点</text>
					</view>
					<text class="view-details" @click="navigateTo('/pages/user/points?activeTab=history')">查看明细</text>
				</view>
			</view>
		</view>
		
		<!-- 头像昵称编辑弹窗 -->
		<view v-if="profileEditVisible" class="modal-overlay" @click="hideProfileEdit">
			<view class="profile-edit-modal" @click.stop>
				<view class="modal-header">
					<text class="modal-title">编辑个人信息</text>
					<text class="modal-close" @click="hideProfileEdit">✕</text>
				</view>
				<view class="modal-body">
					<!-- 头像选择 -->
					<view class="avatar-edit-section">
						<text class="section-label">头像</text>
						<view class="avatar-selector">
							<button 
								class="avatar-select-btn" 
								open-type="chooseAvatar" 
								@chooseavatar="onChooseAvatar"
							>
								<image class="preview-avatar" :src="tempAvatarPath || userImage"></image>
								<view class="avatar-edit-badge">
									<text class="edit-icon-small">✏️</text>
								</view>
							</button>
							<text class="avatar-hint">点击更换头像</text>
						</view>
					</view>
					
					<!-- 昵称输入 -->
					<view class="nickname-edit-section">
						<text class="section-label">昵称</text>
						<input 
							class="nickname-input" 
							type="nickname"
							v-model="tempNickname"
							placeholder="请输入昵称"
							placeholder-style="color: #787878;"
							maxlength="20"
						/>
					</view>
				</view>
				<view class="modal-footer">
					<button class="modal-button cancel" @click="hideProfileEdit">取消</button>
					<button class="modal-button confirm" @click="saveProfile">保存</button>
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
				
				<button class="purchase-button" @click="checkLoginForPurchase">购买点数</button>
				
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
	import AuthModal from '@/components/auth-modal/auth-modal.vue'
	import authMixin from '@/mixins/authMixin.js'
	import globalConfig from '@/config'
	export default {
		mixins: [authMixin],
		components: {
			uniIcons,
			uniNavBar,
			AuthModal
		},
		computed: {
			...mapGetters(['user','themeBgColor', 'darkMode']),
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
				works: [
					{ id: 1, title: '夏日晚风', date: '2023-06-15', status: '已下载', genre: '流行' },
					{ id: 2, title: '城市霓虹', date: '2023-06-10', status: '云端', genre: '电子' }
				], // 作品列表
				// 个人信息编辑相关
				profileEditVisible: false, // 头像昵称编辑弹窗是否显示
				tempNickname: '', // 临时昵称
				tempAvatarPath: '' // 临时头像路径
			}
		},
		onReady() {
			uni.setNavigationBarTitle({
			    title: '个人中心'
			})
			this.setNavBarColor()
		},
		onShow() {
			this.setNavBarColor()
		},
		onLoad() {
			//  高度自适应
			uni.getWindowInfo({
				success: res => {
					this.winHeight = res.windowHeight
				}
			})
			this.baseUrl = globalConfig.baseUrl.replace("/api","");
			
			// 加载用户信息
			this.loadUserInfo()
		},
		// 监听页面滚动到底部
		onReachBottom() {
			if (!this.loading && !this.isEnd) {
				this.queryParams.page++
			}
		},
		methods: {
			/**
			 * 加载用户信息
			 */
			loadUserInfo() {
				const userInfo = uni.getStorageSync('userInfo')
				console.log('loadUserInfo - 原始userInfo:', userInfo)
				if (userInfo) {
					// 确保avatar是字符串
					const avatar = userInfo.avatar
					console.log('loadUserInfo - avatar类型:', typeof avatar, 'avatar值:', avatar)
					
					let avatarUrl = '/static/img/profile.svg'
					
					if (typeof avatar === 'string' && avatar) {
						// 如果是相对路径（以/uploads开头），拼接完整URL
						if (avatar.startsWith('/uploads/')) {
							avatarUrl = `${this.baseUrl}${avatar}`
							console.log('相对路径转完整URL:', avatarUrl)
						} else if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
							// 已经是完整URL
							avatarUrl = avatar
						} else if (avatar.startsWith('/static/')) {
							// 静态资源路径
							avatarUrl = avatar
						} else {
							avatarUrl = avatar || '/static/img/profile.svg'
						}
						this.userImage = avatarUrl
					} else if (avatar && typeof avatar === 'object') {
						// 如果是对象，尝试提取url
						this.userImage = avatar.url || avatar.avatarUrl || '/static/img/profile.svg'
						console.warn('警告：avatar是对象，已提取URL:', this.userImage)
					} else {
						this.userImage = '/static/img/profile.svg'
					}
					
					this.userName = userInfo.nickname || '音乐创作者'
				}
			},
			
			/**
			 * 点击头像 - 先检查登录，登录后显示编辑弹窗
			 */
			handleAvatarClick() {
				this.requireAuth(() => {
					// 已登录，显示头像昵称编辑弹窗
					this.showProfileEdit()
				})
			},
			
			/**
			 * 点击昵称 - 先检查登录，登录后显示编辑弹窗
			 */
			showNicknameModal() {
				this.requireAuth(() => {
					// 已登录，显示头像昵称编辑弹窗
					this.showProfileEdit()
				})
			},
			
			/**
			 * 显示个人信息编辑弹窗
			 */
			showProfileEdit() {
				// 初始化临时数据
				this.tempNickname = this.userName === '音乐创作者' ? '' : this.userName
				this.tempAvatarPath = this.userImage
				this.profileEditVisible = true
			},
			
			/**
			 * 隐藏个人信息编辑弹窗
			 */
			hideProfileEdit() {
				this.profileEditVisible = false
				this.tempNickname = ''
				this.tempAvatarPath = ''
			},
			
			/**
			 * 处理登录成功回调
			 */
			handleAuthSuccess(data) {
				console.log('登录成功回调:', data)
				
				// 执行通用的登录成功回调
				if (this._authCallback && typeof this._authCallback === 'function') {
					this._authCallback(data)
					this._authCallback = null
				}
				
				// 重新加载用户信息
				this.loadUserInfo()
			},
			
			/**
			 * 检查登录 - 购买点数
			 */
			checkLoginForPurchase() {
				this.requireAuth(() => {
					// 登录后跳转到购买页面
					this.navigateTo('/pages/user/points?activeTab=free')
				})
			},
			
			/**
			 * 选择头像回调（在编辑弹窗中）
			 */
			onChooseAvatar(e) {
				console.log('选择头像:', e)
				const { avatarUrl } = e.detail
				
				if (!avatarUrl) {
					uni.showToast({
						title: '未选择头像',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 保存到临时变量，等待用户点击"保存"按钮
				this.tempAvatarPath = avatarUrl
				
				uni.showToast({
					title: '头像已选择',
					icon: 'success',
					duration: 1500
				})
			},
			
			/**
			 * 上传并保存头像
			 */
			async saveAvatar(avatarUrl) {
				try {
					uni.showLoading({
						title: '保存头像中...'
					})
					
					// 方式1: 直接使用临时路径（简单快速）
					// 如果后端支持，可以直接保存临时路径
					let finalAvatarUrl = avatarUrl
					
					// 方式2: 上传到服务器（推荐）
					// 取消下面的注释以启用上传功能
					/*
					try {
						const uploadResult = await this.$minApi.uploadAvatar(avatarUrl)
						finalAvatarUrl = uploadResult.data.url
					} catch (uploadError) {
						console.error('上传头像失败:', uploadError)
						// 上传失败时也可以使用临时路径
					}
					*/
					
					// 调用后端API保存头像
					const result = await this.$minApi.updateUserProfile({
						avatar: finalAvatarUrl
					})
					
					uni.hideLoading()
					
					if (result && result.code === 200) {
						// 更新本地存储
						const userInfo = uni.getStorageSync('userInfo') || {}
						userInfo.avatar = finalAvatarUrl
						uni.setStorageSync('userInfo', userInfo)
						
						// 更新页面显示
						this.userImage = finalAvatarUrl
						
						uni.showToast({
							title: '头像更新成功',
							icon: 'success',
							duration: 2000
						})
					} else {
						throw new Error(result.msg || '保存失败')
					}
				} catch (error) {
					uni.hideLoading()
					console.error('保存头像失败:', error)
					
					uni.showToast({
						title: error.message || '保存头像失败',
						icon: 'none',
						duration: 2000
					})
					
					// 恢复原头像
					this.loadUserInfo()
				}
			},
			
			/**
			 * 保存个人信息（头像和昵称）
			 */
			async saveProfile() {
				// 验证输入
				if (!this.tempNickname || !this.tempNickname.trim()) {
					uni.showToast({
						title: '请输入昵称',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				const nickname = this.tempNickname.trim()
				const avatarPath = this.tempAvatarPath
				
				try {
					uni.showLoading({
						title: '保存中...'
					})
					
					// 构建更新数据
					const updateData = {
						nickname: nickname
					}
					
					// 如果头像有变化，先上传到服务器
					if (avatarPath && avatarPath !== this.userImage) {
						try {
							uni.showLoading({
								title: '上传头像中...'
							})
							
							// 上传头像到服务器
							const uploadResult = await this.$minApi.uploadAvatar(avatarPath)
							
							if (uploadResult && uploadResult.code === 200 && uploadResult.data) {
							// 后端返回被双重包装：{code, message, data: {code, message, data: {url, avatarUrl}}}
							// 需要访问 uploadResult.data.data
							const avatarData = uploadResult.data.data || uploadResult.data
							updateData.avatar = avatarData.url || avatarData.avatarUrl || avatarData
							console.log('头像上传成功，URL:', updateData.avatar)
							} else {
								throw new Error('头像上传失败')
							}
						} catch (uploadError) {
							console.error('上传头像失败:', uploadError)
							uni.hideLoading()
							uni.showToast({
								title: uploadError.message || '头像上传失败',
								icon: 'none',
								duration: 2000
							})
							return
						}
					}
					
					uni.showLoading({
						title: '保存中...'
					})
					
					// 调用后端API保存个人信息
					const result = await this.$minApi.updateUserProfile(updateData)
					
					uni.hideLoading()
					
					if (result && result.code === 200) {
						// 更新本地存储
						const userInfo = uni.getStorageSync('userInfo') || {}
						userInfo.nickname = nickname
						if (updateData.avatar) {
							userInfo.avatar = updateData.avatar
						}
						uni.setStorageSync('userInfo', userInfo)
						
						// 更新页面显示
						this.userName = nickname
						if (updateData.avatar) {
							this.userImage = updateData.avatar
						}
						
						// 关闭弹窗
						this.hideProfileEdit()
						
						uni.showToast({
							title: '个人信息更新成功',
							icon: 'success',
							duration: 2000
						})
					} else {
						throw new Error(result.msg || '保存失败')
					}
				} catch (error) {
					uni.hideLoading()
					console.error('保存个人信息失败:', error)
					
					uni.showToast({
						title: error.message || '保存失败，请重试',
						icon: 'none',
						duration: 2000
					})
				}
			},
			
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

	// 头像区域样式
	.avatar-wrapper {
		position: relative;
		cursor: pointer;
		margin-right: 20rpx;
	}
	
	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 2rpx solid #0B67EC;
		display: block;
	}
	
	.avatar-edit-hint {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 36rpx;
		height: 36rpx;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid #121212;
	}
	
	.avatar-edit-hint .edit-icon {
		font-size: 18rpx;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 10rpx;
	}

	.points-info {
		display: flex;
		align-items: center;
		margin-top: 10rpx;
	}

	.points-badge {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		border-radius: 30rpx;
		padding: 6rpx 14rpx;
		margin-right: 15rpx;
	}

	.music-icon {
		font-size: 24rpx;
		margin-right: 4rpx;
	}

	.points-number {
		font-size: 24rpx;
		color: #FFFFFF;
	}

	.view-details {
		font-size: 24rpx;
		color: #3B7EFF;
		text-decoration: underline;
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
	
	/* 昵称编辑弹窗样式 */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
	}
	
	.modal-content {
		width: 600rpx;
		background-color: #1E1E1E;
		border-radius: 20rpx;
		overflow: hidden;
	}
	
	.profile-edit-modal {
		width: 600rpx;
		background-color: #1E1E1E;
		border-radius: 24rpx;
		overflow: hidden;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1px solid #2D2D2D;
	}
	
	.modal-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #FFFFFF;
	}
	
	.modal-close {
		font-size: 40rpx;
		color: #787878;
		line-height: 1;
		padding: 0 10rpx;
	}
	
	.modal-body {
		padding: 40rpx 30rpx;
	}
	
	.nickname-input {
		width: 100%;
		height: 80rpx;
		background-color: #2D2D2D;
		border-radius: 10rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #FFFFFF;
	}
	
	/* 新增：个人信息编辑弹窗专用样式 */
	.avatar-edit-section {
		margin-bottom: 40rpx;
	}
	
	.section-label {
		font-size: 28rpx;
		color: #ACACAC;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.avatar-selector {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}
	
	.avatar-select-btn {
		position: relative;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
	}
	
	.avatar-select-btn::after {
		border: none;
	}
	
	.preview-avatar {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		object-fit: cover;
		border: 4rpx solid #2D2D2D;
	}
	
	.avatar-edit-badge {
		position: absolute;
		bottom: 8rpx;
		right: 8rpx;
		width: 44rpx;
		height: 44rpx;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid #1E1E1E;
	}
	
	.avatar-edit-badge .edit-icon-small {
		font-size: 20rpx;
	}
	
	.avatar-hint {
		font-size: 24rpx;
		color: #787878;
	}
	
	.nickname-edit-section {
		margin-bottom: 20rpx;
	}
	
	.modal-footer {
		display: flex;
		border-top: 1px solid #2D2D2D;
	}
	
	.modal-button {
		flex: 1;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		font-size: 30rpx;
		border: none;
		border-radius: 0;
		
		&::after {
			border: none;
		}
		
		&.cancel {
			background-color: #2D2D2D;
			color: #ACACAC;
		}
		
		&.confirm {
			background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
			color: #FFFFFF;
			font-weight: bold;
		}
	}
</style>