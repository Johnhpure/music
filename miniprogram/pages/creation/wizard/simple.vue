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
			
			<view class="input-wrapper">
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
				
				<!-- Gemini AI按钮 -->
				<button 
					class="gemini-ai-btn"
					:disabled="aiExpanding || !inspiration.trim()"
					@click="handleAIExpand"
				>
					<view class="gemini-icon">✨</view>
					<view class="gemini-glow"></view>
				</button>
			</view>
		</view>

		<!-- 热门主题推荐区域 -->
		<view class="themes-section">
			<view class="section-title">
				<text class="title-icon">🔥</text>
				<text class="title-text">热门主题推荐</text>
			</view>
			
			<view class="marquee-container">
				<view class="marquee-track">
					<view 
						class="theme-card-marquee"
						v-for="(theme, index) in doubleThemes"
						:key="index"
						:style="{ background: theme.bgColor }"
						@click="selectTheme(theme)"
					>
						<view class="theme-emoji">{{ theme.emoji }}</view>
						<view class="theme-title">{{ theme.title }}</view>
						<view class="theme-desc">{{ theme.description }}</view>
					</view>
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
			aiExpanding: false,
			cardColors: [
				'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
				'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
				'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
				'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
				'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
				'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
			],
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
		},
		doubleThemes() {
			// 拼接两份主题列表实现无缝循环
			const themesWithColors = this.hotThemes.map((theme, index) => ({
				...theme,
				bgColor: this.cardColors[index % this.cardColors.length]
			}));
			return [...themesWithColors, ...themesWithColors];
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
		
		// AI扩展灵感
		async handleAIExpand() {
			if (!this.inspiration.trim() || this.aiExpanding) return;
			
			try {
				this.aiExpanding = true;
				
				uni.showLoading({
					title: 'AI思考中...',
					mask: true
				});
				
				// 调用歌词生成接口扩展灵感
				const result = await api.apis.generateLyrics({
					prompt: this.inspiration
				});
				
				uni.hideLoading();
				
				if (result && result.code === 200) {
					// 将AI扩展的内容填充到输入框
					if (result.data && result.data.text) {
						this.inspiration = result.data.text;
						uni.showToast({
							title: 'AI已为您扩展灵感',
							icon: 'success',
							duration: 1500
						});
					}
				} else {
					uni.showToast({
						title: result.msg || 'AI扩展失败',
						icon: 'none',
						duration: 2000
					});
				}
			} catch (error) {
				console.error('AI扩展灵感失败:', error);
				uni.hideLoading();
				uni.showToast({
					title: '扩展失败，请重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.aiExpanding = false;
			}
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

.input-wrapper {
	display: flex;
	align-items: flex-start;
	gap: 20rpx;
}

.input-container {
	flex: 1;
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

// Gemini AI按钮
.gemini-ai-btn {
	position: relative;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: none;
	padding: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	animation: gemini-breathe 2s ease-in-out infinite;
	
	&::before {
		content: '';
		position: absolute;
		top: -4rpx;
		left: -4rpx;
		right: -4rpx;
		bottom: -4rpx;
		border-radius: 50%;
		background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea);
		background-size: 300% 300%;
		animation: gemini-rotate 3s linear infinite;
		opacity: 0.6;
		z-index: -1;
		filter: blur(8rpx);
	}
	
	&:disabled {
		opacity: 0.5;
		animation: none;
	}
	
	&:not(:disabled):active {
		transform: scale(0.95);
	}
}

.gemini-icon {
	font-size: 48rpx;
	z-index: 1;
	animation: gemini-pulse 2s ease-in-out infinite;
}

.gemini-glow {
	position: absolute;
	width: 80%;
	height: 80%;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
	animation: gemini-glow 2s ease-in-out infinite;
	pointer-events: none;
}

@keyframes gemini-breathe {
	0%, 100% {
		transform: scale(1);
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
	}
	50% {
		transform: scale(1.05);
		box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.6);
	}
}

@keyframes gemini-rotate {
	0% {
		background-position: 0% 50%;
	}
	100% {
		background-position: 100% 50%;
	}
}

@keyframes gemini-pulse {
	0%, 100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(1.1);
		opacity: 0.9;
	}
}

@keyframes gemini-glow {
	0%, 100% {
		opacity: 0.3;
		transform: scale(0.8);
	}
	50% {
		opacity: 0.6;
		transform: scale(1.2);
	}
}

// 热门主题区域
.themes-section {
	margin-bottom: 40rpx;
}

// 跑马灯容器
.marquee-container {
	width: 100%;
	overflow: hidden;
	position: relative;
}

.marquee-track {
	display: flex;
	gap: 20rpx;
	animation: marquee-scroll 30s linear infinite;
	
	&:hover {
		animation-play-state: paused;
	}
}

@keyframes marquee-scroll {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-50%);
	}
}

.theme-card-marquee {
	flex-shrink: 0;
	width: 400rpx;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
	border: 2rpx solid rgba(255, 255, 255, 0.1);
	animation: card-breathe 2s ease-in-out infinite;
	transition: transform 0.3s ease;
	
	&:active {
		transform: scale(0.95);
		animation-play-state: paused;
	}
}

@keyframes card-breathe {
	0%, 100% {
		transform: scale(1);
		opacity: 0.9;
	}
	50% {
		transform: scale(1.05);
		opacity: 1;
	}
}

.theme-emoji {
	font-size: 48rpx;
	margin-bottom: 15rpx;
	text-align: center;
}

.theme-title {
	font-size: 30rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	text-align: center;
	color: #FFFFFF;
}

.theme-desc {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
	line-height: 1.4;
	text-align: center;
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
