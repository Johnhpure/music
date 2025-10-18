<template>
	<view class="wizard-container">
		<!-- 模式切换区域 -->
		<view class="mode-switch-container">
			<view class="mode-tabs">
				<view 
					class="mode-tab" 
					:class="{ 'active': currentMode === 'simple' }"
					@click="switchMode('simple')"
				>
					<text class="mode-text">极简模式</text>
				</view>
				<view 
					class="mode-tab" 
					:class="{ 'active': currentMode === 'scene' }"
					@click="switchMode('scene')"
				>
					<text class="mode-text">情景模式</text>
				</view>
				<view 
					class="mode-tab" 
					:class="{ 'active': currentMode === 'master' }"
					@click="switchMode('master')"
				>
					<text class="mode-text">大师模式</text>
				</view>
			</view>
		</view>

		<!-- 灵感输入区域 -->
		<view class="inspiration-section">
			<view class="section-title">
				<text class="title-icon">✨</text>
				<text class="title-text">描述你的灵感</text>
			</view>
			
			<view class="input-container">
				<textarea 
					class="inspiration-input"
					v-model="inspiration"
					placeholder="在此处输入您的灵感，例如：写一首关于爱情的、中国风的、快乐的歌曲。"
					:maxlength="200"
					@input="onInputChange"
				></textarea>
				<view class="char-count">{{ charCount }}/200</view>
			</view>
		</view>

		<!-- 热门主题推荐区域 -->
		<view class="themes-section">
			<view class="section-title">
				<text class="title-icon">🔥</text>
				<text class="title-text">热门主题推荐</text>
			</view>
			
			<view class="themes-grid">
				<view 
					class="theme-card"
					v-for="(theme, index) in hotThemes"
					:key="index"
					@click="selectTheme(theme)"
				>
					<view class="theme-emoji">{{ theme.emoji }}</view>
					<view class="theme-title">{{ theme.title }}</view>
					<view class="theme-desc">{{ theme.description }}</view>
				</view>
			</view>
		</view>

		<!-- 生成按钮 -->
		<view class="generate-section">
			<button 
				class="generate-btn"
				:disabled="!canGenerate"
				:class="{ 'disabled': !canGenerate }"
				@click="handleGenerate"
			>
				<text class="btn-text">{{ generating ? '生成中...' : '开始生成' }}</text>
			</button>
		</view>
	</view>
</template>

<script>
import api from '@/api/api.js';

export default {
	data() {
		return {
			currentMode: 'simple',
			inspiration: '',
			generating: false,
			hotThemes: [
				{
					emoji: '🌊',
					title: 'City Pop风格',
					description: '关于分手的歌曲',
					prompt: '创作一首City Pop风格的关于分手的歌曲，节奏轻快但歌词略带伤感'
				},
				{
					emoji: '🏰',
					title: '童话主题',
					description: '王子与公主的爱情故事',
					prompt: '创作一首童话主题的歌曲，讲述王子与公主的浪漫爱情故事，旋律优美梦幻'
				},
				{
					emoji: '🏖️',
					title: '夏日海滩',
					description: '清凉、快乐的氛围',
					prompt: '创作一首夏日海滩主题的歌曲，充满清凉快乐的氛围，节奏轻松愉悦'
				}
			]
		};
	},
	computed: {
		charCount() {
			return this.inspiration.length;
		},
		canGenerate() {
			return this.inspiration.trim().length > 0 && !this.generating;
		}
	},
	methods: {
		// 模式切换
		switchMode(mode) {
			if (mode === this.currentMode) return;
			
			this.currentMode = mode;
			
			// 根据模式跳转到对应页面
			if (mode === 'scene') {
				uni.redirectTo({
					url: '/pages/creation/wizard/scene'
				});
			} else if (mode === 'master') {
				uni.redirectTo({
					url: '/pages/creation/wizard/master'
				});
			}
		},
		
		// 输入变化
		onInputChange(e) {
			this.inspiration = e.detail.value;
		},
		
		// 选择主题
		selectTheme(theme) {
			this.inspiration = theme.prompt;
		},
		
		// 处理生成
		async handleGenerate() {
			if (!this.canGenerate) return;
			
			// 检查登录状态
			const token = uni.getStorageSync('token');
			if (!token) {
				uni.showModal({
					title: '提示',
					content: '请先登录后再创作',
					confirmText: '去登录',
					success: (res) => {
						if (res.confirm) {
							uni.switchTab({
								url: '/pages/user/index'
							});
						}
					}
				});
				return;
			}
			
			try {
				this.generating = true;
				
				uni.showLoading({
					title: '正在生成...',
					mask: true
				});
				
				// 调用生成接口
				const result = await api.apis.generateMusic({
					prompt: this.inspiration,
					mode: 'simple'
				});
				
				uni.hideLoading();
				
				if (result && result.code === 200) {
					// 生成成功，跳转到结果页面
					uni.navigateTo({
						url: `/pages/creation/wizard/result?taskId=${result.data.taskId}`
					});
				} else {
					uni.showToast({
						title: result.msg || '生成失败，请重试',
						icon: 'none',
						duration: 2000
					});
				}
				
			} catch (error) {
				console.error('生成音乐失败:', error);
				uni.hideLoading();
				uni.showToast({
					title: error.msg || '生成失败，请重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.generating = false;
			}
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
	padding-bottom: 200rpx;
}

// 模式切换区域
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

// 灵感输入区域
.inspiration-section {
	margin-bottom: 40rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.title-icon {
	font-size: 40rpx;
	margin-right: 15rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
}

.input-container {
	position: relative;
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 20rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.1);
	padding: 30rpx;
}

.inspiration-input {
	width: 100%;
	min-height: 240rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: #FFFFFF;
	background-color: transparent;
	border: none;
}

.char-count {
	position: absolute;
	right: 30rpx;
	bottom: 20rpx;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.5);
}

// 热门主题区域
.themes-section {
	margin-bottom: 40rpx;
}

.themes-grid {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.theme-card {
	background: linear-gradient(135deg, rgba(115, 66, 204, 0.3) 0%, rgba(95, 53, 168, 0.3) 100%);
	border-radius: 20rpx;
	padding: 30rpx;
	border: 2rpx solid rgba(255, 255, 255, 0.1);
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.98);
		opacity: 0.8;
	}
}

.theme-emoji {
	font-size: 40rpx;
	margin-bottom: 10rpx;
}

.theme-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.theme-desc {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.7);
	line-height: 1.4;
}

// 生成按钮区域
.generate-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 30rpx;
	background: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.9) 80%, rgba(0, 0, 0, 0) 100%);
}

.generate-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
	border-radius: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	
	&.disabled {
		opacity: 0.5;
		background: linear-gradient(135deg, #666666 0%, #444444 100%);
	}
	
	&:not(.disabled):active {
		transform: scale(0.98);
	}
}

.btn-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #FFFFFF;
}
</style>
