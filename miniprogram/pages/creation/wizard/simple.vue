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
				<view class="title-left">
					<text class="title-icon">✨</text>
					<text class="title-text">描述你的灵感</text>
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
				<view class="title-left">
					<text class="title-icon">🔥</text>
					<text class="title-text">热门主题推荐</text>
				</view>
			</view>
			
			<!-- 跑马灯容器 -->
			<view class="marquee-container">
				<view class="marquee-track">
					<view 
						class="theme-card"
						v-for="(theme, index) in doubledThemes"
						:key="'theme-' + index"
						:style="{ background: cardColors[index % cardColors.length] }"
						@click="selectTheme(index)"
					>
						<view class="card-glow"></view>
						<view class="card-content">
							<view class="theme-emoji">{{ theme.emoji }}</view>
							<view class="theme-title">{{ theme.title }}</view>
							<view class="theme-desc">{{ theme.description }}</view>
						</view>
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
		// 复制一份主题列表用于无缝滚动
		doubledThemes() {
			return this.hotThemes.concat(this.hotThemes);
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
		selectTheme(index) {
			// 因为是 doubledThemes（主题列表的双倍），需要取模获取原始主题
			const theme = this.hotThemes[index % this.hotThemes.length];
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
				
				// 调试日志
				console.log('[handleAIExpand] 开始调用AI扩展灵感');
				console.log('[handleAIExpand] inspiration值:', this.inspiration);
				console.log('[handleAIExpand] inspiration长度:', this.inspiration.length);
				console.log('[handleAIExpand] 发送参数:', { originalPrompt: this.inspiration });
				
				// 调用AI扩展灵感接口
				const result = await api.apis.expandInspiration({
					originalPrompt: this.inspiration
				});
				
				uni.hideLoading();
				
				if (result && result.code === 200) {
					// 将AI扩展的内容填充到输入框
					if (result.data && result.data.expandedContent) {
						this.inspiration = result.data.expandedContent;
						
						// 显示成功提示，包含积分信息
						let toastTitle = 'AI已为您扩展灵感';
						if (result.data.costCredits > 0) {
							toastTitle += `（消耗${result.data.costCredits}积分）`;
						} else if (result.data.remainingFreeCount !== undefined) {
							toastTitle += `（剩余${result.data.remainingFreeCount}次免费）`;
						}
						
						uni.showToast({
							title: toastTitle,
							icon: 'success',
							duration: 2000
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
				console.error('[handleAIExpand] AI扩展灵感失败:', error);
				console.log('[handleAIExpand] 错误详情:', JSON.stringify(error));
				uni.hideLoading();
				
				// 根据错误类型显示不同提示
				let errorMsg = '扩展失败，请重试';
				
				// 处理401未登录错误
				if (error.statusCode === 401 || (error.data && error.data.code === 401)) {
					errorMsg = '请先登录后再使用AI扩展功能';
				} else if (error.msg) {
					errorMsg = error.msg;
				} else if (error.data && error.data.message) {
					errorMsg = error.data.message;
				} else if (error.errMsg) {
					errorMsg = error.errMsg;
				}
				
				uni.showToast({
					title: errorMsg,
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
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.title-left {
	display: flex;
	align-items: center;
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

// Gemini AI按钮
.gemini-ai-btn {
	position: relative;
	width: 80rpx;
	height: 80rpx;
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
	font-size: 40rpx;
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
	margin-bottom: 60rpx;
}

// 跑马灯容器
.marquee-container {
	width: 100%;
	overflow: hidden;
	position: relative;
	padding: 30rpx 0;
	
	&::before,
	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100rpx;
		z-index: 2;
		pointer-events: none;
	}
	
	&::before {
		left: 0;
		background: linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
	}
	
	&::after {
		right: 0;
		background: linear-gradient(to left, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
	}
}

.marquee-track {
	display: flex;
	gap: 30rpx;
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

// 主题卡片
.theme-card {
	flex-shrink: 0;
	width: 420rpx;
	min-height: 280rpx;
	border-radius: 30rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.6),
	            0 0 40rpx rgba(102, 126, 234, 0.3);
	position: relative;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: card-breathe 4s ease-in-out infinite;
	
	// 渐变边框效果
	&::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 30rpx;
		padding: 3rpx;
		background: linear-gradient(135deg, 
			rgba(255, 255, 255, 0.6),
			rgba(255, 255, 255, 0.1),
			rgba(255, 255, 255, 0.6)
		);
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: 0.5;
		animation: border-flow 3s linear infinite;
	}
	
	&:hover {
		transform: translateY(-10rpx) scale(1.05);
		box-shadow: 0 30rpx 80rpx rgba(0, 0, 0, 0.8),
		            0 0 60rpx rgba(102, 126, 234, 0.6);
		animation-play-state: paused;
	}
	
	&:active {
		transform: translateY(-5rpx) scale(1.02);
	}
}

// 呼吸动画
@keyframes card-breathe {
	0%, 100% {
		transform: scale(1);
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.6),
		            0 0 40rpx rgba(102, 126, 234, 0.3);
	}
	50% {
		transform: scale(1.02);
		box-shadow: 0 25rpx 70rpx rgba(0, 0, 0, 0.7),
		            0 0 50rpx rgba(102, 126, 234, 0.5);
	}
}

// 边框流动动画
@keyframes border-flow {
	0% {
		background-position: 0% 50%;
	}
	100% {
		background-position: 200% 50%;
	}
}

// 光晕效果
.card-glow {
	position: absolute;
	top: -50%;
	left: -50%;
	width: 200%;
	height: 200%;
	background: radial-gradient(
		circle,
		rgba(255, 255, 255, 0.3) 0%,
		transparent 60%
	);
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
	animation: glow-pulse 3s ease-in-out infinite;
}

.theme-card:hover .card-glow {
	opacity: 1;
}

@keyframes glow-pulse {
	0%, 100% {
		opacity: 0.2;
		transform: scale(0.8);
	}
	50% {
		opacity: 0.4;
		transform: scale(1.2);
	}
}

// 卡片内容
.card-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	position: relative;
	z-index: 1;
}

.theme-emoji {
	font-size: 80rpx;
	filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.4));
	animation: emoji-float 3s ease-in-out infinite;
}

@keyframes emoji-float {
	0%, 100% {
		transform: translateY(0) rotate(0deg);
	}
	25% {
		transform: translateY(-8rpx) rotate(-5deg);
	}
	75% {
		transform: translateY(-8rpx) rotate(5deg);
	}
}

.theme-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #FFFFFF;
	text-align: center;
	text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.5);
	letter-spacing: 1rpx;
}

.theme-desc {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.9);
	text-align: center;
	line-height: 1.6;
	text-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.3);
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
