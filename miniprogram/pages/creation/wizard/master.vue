<template>
	<view class="wizard-container">
		<!-- 模式切换区域 -->
		<view class="mode-switch-container">
			<view class="mode-tabs">
				<view 
					class="mode-tab" 
					@click="switchMode('simple')"
				>
					<text class="mode-text">极简模式</text>
				</view>
				<view 
					class="mode-tab"
					@click="switchMode('scene')"
				>
					<text class="mode-text">情景模式</text>
				</view>
				<view 
					class="mode-tab active"
				>
					<text class="mode-text">大师模式</text>
				</view>
			</view>
		</view>

		<view class="coming-soon">
			<text class="icon">🚧</text>
			<text class="title">大师模式开发中</text>
			<text class="desc">敬请期待更专业的创作工具</text>
			<button class="back-btn" @click="goBack">返回</button>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		switchMode(mode) {
			if (mode === 'simple') {
				uni.redirectTo({
					url: '/pages/creation/wizard/simple'
				});
			} else if (mode === 'scene') {
				uni.redirectTo({
					url: '/pages/creation/wizard/scene'
				});
			}
		},
		goBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style lang="scss" scoped>
.wizard-container {
	min-height: 100vh;
	background-color: #000000;
	color: #FFFFFF;
	padding: 30rpx;
}

.mode-switch-container {
	margin-bottom: 40rpx;
}

.mode-tabs {
	display: flex;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 50rpx;
	padding: 8rpx;
}

.mode-tab {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	border-radius: 40rpx;
	transition: all 0.3s ease;
}

.mode-tab.active {
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
}

.mode-text {
	font-size: 28rpx;
	font-weight: 500;
}

.coming-soon {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
}

.icon {
	font-size: 120rpx;
	margin-bottom: 40rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.desc {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 60rpx;
}

.back-btn {
	width: 300rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
	border-radius: 40rpx;
	color: #FFFFFF;
	font-size: 28rpx;
	border: none;
}
</style>
