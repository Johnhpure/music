<template>
	<view class="select-container">
		<!-- 左侧标题 -->
		<view class="left-title">选择创作方式</view>
		
		<!-- 右侧卡片区域 -->
		<view class="cards-area">
			<!-- 自主创作卡片 -->
			<view class="card blue-card" @click="handleManualCreation">
				<view class="card-content">
					<view class="card-title-box">
						<view class="card-icon">✏️</view>
						<view class="card-title">自己写歌词</view>
					</view>
					<view class="card-desc">
						自由发挥创意，写下你的歌词，AI将为你谱曲
					</view>
					<view class="arrow-box">
						<image class="arrow" src="/static/img/icon/right-arrow.svg"></image>
					</view>
				</view>
			</view>

			<!-- AI创作卡片 -->
			<view class="card purple-card" @click="handleAICreation">
				<view class="card-content">
					<view class="card-title-box">
						<view class="card-icon">✏️</view>
						<view class="card-title">AI 帮我写</view>
					</view>
					<view class="card-desc">
						告诉AI你的创作想法，它将为你生成完整歌词
					</view>
					<view class="arrow-box">
						<image class="arrow" src="/static/img/icon/right-arrow.svg"></image>
					</view>
				</view>
			</view>

			<!-- 创作向导卡片 -->
			<view class="card green-card" @click="handleWizardCreation">
				<view class="card-content">
					<view class="card-title-box">
						<view class="card-icon">🎯</view>
						<view class="card-title">创作向导</view>
					</view>
					<view class="card-desc">
						通过简单几步，快速创作出你想要的音乐
					</view>
					<view class="arrow-box">
						<image class="arrow" src="/static/img/icon/right-arrow.svg"></image>
					</view>
				</view>
			</view>
			
			<!-- 奖励提示 -->
			<view class="reward-tip">
				首次创作将获得额外10音乐点数奖励
			</view>
			<image style="width: 100vw;height: 50rpx;" src="/static/img/icon/wave-animation.svg"></image>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			hasCreatedBefore: false
		};
	},
	onLoad() {
		// 检查是否首次创作
		this.checkFirstCreation();
	},
	methods: {
		// 检查是否首次创作
		checkFirstCreation() {
			// 实际项目中应从服务器或本地存储获取
			try {
				const hasCreated = uni.getStorageSync('hasCreatedBefore');
				this.hasCreatedBefore = !!hasCreated;
			} catch(e) {
				this.hasCreatedBefore = false;
			}
		},
		
		// 处理自主创作点击
		handleManualCreation() {
			console.log('点击了自主创作按钮');
			// 直接跳转测试
			this.navigateToCreation('manual');
			// this.showCopyrightModal('manual');
		},
		
		// 处理AI辅助创作点击
		handleAICreation() {
			console.log('点击了AI辅助创作按钮');
			this.showCopyrightModal('ai');
		},
		
		// 处理创作向导点击
		handleWizardCreation() {
			console.log('点击了创作向导按钮');
			uni.navigateTo({
				url: '/pages/creation/wizard/simple'
			});
		},
		
		// 显示版权弹窗
		showCopyrightModal(creationType) {
			this.navigateToCreation(creationType);
			// 如果已经创作过，直接跳转
			if (this.hasCreatedBefore) {
				console.log('已经创作过，直接跳转');
				this.navigateToCreation(creationType);
				return;
			}
			console.log('首次创作，显示版权弹窗');
			// 否则显示版权弹窗
			uni.showModal({
				title: '创作版权说明',
				content: '在开始创作前，请了解内容版权相关规定：\n1. 您自行创作的歌词版权归您所有\n2. AI辅助创作的内容使用权归您，但不具备商业使用权\n3. 平台对用户上传和创作的内容拥有展示和推广权\n4. 请勿创作包含违反法规的内容，否则将被平台封禁',
				confirmText: '同意并继续',
				cancelText: '取消',
				success: (res) => {
					console.log('弹窗结果:', res);
					if (res.confirm) {
						console.log('用户同意版权说明');
						uni.setStorageSync('hasCreatedBefore', 'true');
						const isAuthorized = uni.getStorageSync('isAuthorized');
						if (isAuthorized) {
							console.log('用户已授权，直接跳转');
							this.navigateToCreation(creationType);
						} else {
							console.log('用户未授权，设置授权并跳转');
							uni.setStorageSync('isAuthorized', 'true');
							this.navigateToCreation(creationType);
						}
					} else {
						console.log('用户取消版权说明');
					}
				}
			});
		},
		
		// 导航到创作页面
		navigateToCreation(type) {
			console.log('正在跳转到创作页面，类型:', type);
			let url = type === 'manual' ? '/pages/creation/manual' : '/pages/creation/ai';
			console.log('跳转URL:', url);
			uni.navigateTo({ 
				url: url,
				success: function() {
					console.log('跳转成功');
				},
				fail: function(err) {
					console.error('跳转失败:', err);
					// 尝试使用switchTab方法作为备选跳转方式
					uni.showToast({
						title: '跳转失败，请重试',
						icon: 'none'
					});
				}
			});
		}
	}
};
</script>

<style lang="scss">
.select-container {
	min-height: 100vh;
	background-color: #000000;
	color: #FFFFFF;
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-left: 30rpx;
	padding-right: 30rpx;
}

/* 左侧标题 */
.left-title {
	padding: 40rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 36rpx;
	font-weight: bold;
	letter-spacing: 4rpx;
}

/* 右侧卡片区域 */
.cards-area {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

/* 卡片通用样式 */
.card {
	width: 100%;
	border-radius: 30rpx;
	// margin-bottom: 30rpx;
	display: flex;
}

/* 蓝色卡片 */
.blue-card {
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
}

/* 紫色卡片 */
.purple-card {
	background: linear-gradient(135deg, #7342CC 0%, #5F35A8 100%);
}

/* 绿色卡片 */
.green-card {
	background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

/* 卡片内容 */
.card-content {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	gap: 10rpx;
}
.card-title-box{
	display: flex;
	gap: 20rpx;
}

.card-icon {
	font-size: 40rpx;
	margin-bottom: 20rpx;
}

.card-title {
	font-size: 48rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.card-desc {
	font-size: 32rpx;
	line-height: 1.5;
	opacity: 0.8;
}

/* 奖励提示 */
.reward-tip {
	color: #ACACAC;
	font-size: 28rpx;
	text-align: center;
}
.arrow-box{
	position: relative;
	height: 100rpx;
}
.arrow{
	width: 40rpx;
	height: 42rpx;
	position: absolute;
	right: 0;
	bottom: 0;
}
</style> 