<template>
	<view class="result-container">
		<!-- 加载中状态 -->
		<view v-if="loading" class="loading-section">
			<view class="loading-icon">
				<text class="icon-text">🎵</text>
			</view>
			<text class="loading-text">正在生成您的音乐...</text>
			<text class="loading-tip">{{ loadingTip }}</text>
		</view>

		<!-- 生成成功状态 -->
		<view v-else-if="musicData" class="success-section">
			<!-- 封面 -->
			<view class="cover-section">
				<image 
					v-if="musicData.coverUrl" 
					:src="musicData.coverUrl" 
					class="cover-image"
					mode="aspectFill"
				></image>
				<view v-else class="cover-placeholder">
					<text class="placeholder-icon">🎵</text>
				</view>
			</view>

			<!-- 音乐信息 -->
			<view class="music-info">
				<text class="music-title">{{ musicData.title || '无标题' }}</text>
				<text class="music-style">{{ musicData.style || '未知风格' }}</text>
			</view>

			<!-- 歌词 -->
			<view v-if="musicData.lyrics" class="lyrics-section">
				<view class="section-title">
					<text class="title-icon">📝</text>
					<text class="title-text">歌词</text>
				</view>
				<view class="lyrics-content">
					<text class="lyrics-text">{{ musicData.lyrics }}</text>
				</view>
			</view>

			<!-- 音频播放器 -->
			<view v-if="musicData.audioUrl" class="audio-section">
				<view class="audio-player">
					<button 
						class="play-btn"
						@click="togglePlay"
					>
						<text class="btn-icon">{{ isPlaying ? '⏸' : '▶' }}</text>
					</button>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: progress + '%' }"></view>
					</view>
					<text class="time-text">{{ currentTime }} / {{ duration }}</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section">
				<button class="action-btn primary-btn" @click="saveMusic">
					<text class="btn-text">保存作品</text>
				</button>
				<button class="action-btn secondary-btn" @click="shareMusic">
					<text class="btn-text">分享</text>
				</button>
				<button class="action-btn secondary-btn" @click="regenerate">
					<text class="btn-text">再生成一次</text>
				</button>
			</view>
		</view>

		<!-- 生成失败状态 -->
		<view v-else-if="error" class="error-section">
			<text class="error-icon">😔</text>
			<text class="error-title">生成失败</text>
			<text class="error-message">{{ errorMessage }}</text>
			<button class="retry-btn" @click="retry">重试</button>
		</view>
	</view>
</template>

<script>
import api from '@/api/api.js';

export default {
	data() {
		return {
			taskId: '',
			loading: true,
			error: false,
			errorMessage: '',
			musicData: null,
			isPlaying: false,
			progress: 0,
			currentTime: '00:00',
			duration: '00:00',
			loadingTips: [
				'正在为您生成旋律...',
				'正在编写歌词...',
				'正在调试音色...',
				'正在混音处理...',
				'即将完成...'
			],
			loadingTip: '正在为您生成旋律...',
			tipIndex: 0,
			audioContext: null
		};
	},
	onLoad(options) {
		if (options.taskId) {
			this.taskId = options.taskId;
			this.checkTaskStatus();
			this.startLoadingTips();
		} else {
			this.error = true;
			this.errorMessage = '缺少任务ID';
			this.loading = false;
		}
	},
	onUnload() {
		// 清理音频
		if (this.audioContext) {
			this.audioContext.pause();
			this.audioContext.destroy();
		}
	},
	methods: {
		// 开始加载提示轮播
		startLoadingTips() {
			this.tipInterval = setInterval(() => {
				this.tipIndex = (this.tipIndex + 1) % this.loadingTips.length;
				this.loadingTip = this.loadingTips[this.tipIndex];
			}, 3000);
		},
		
		// 检查任务状态
		async checkTaskStatus() {
			try {
				const result = await api.apis.getMusicTaskStatus(this.taskId);
				
				if (result && result.code === 200) {
					const task = result.data;
					
					if (task.status === 'completed') {
						// 任务完成
						clearInterval(this.tipInterval);
						this.loading = false;
						this.musicData = {
							title: task.title,
							style: task.style,
							lyrics: task.lyrics,
							audioUrl: task.audioUrl,
							coverUrl: task.coverUrl
						};
						
						// 初始化音频播放器
						if (task.audioUrl) {
							this.initAudioPlayer(task.audioUrl);
						}
					} else if (task.status === 'failed') {
						// 任务失败
						clearInterval(this.tipInterval);
						this.loading = false;
						this.error = true;
						this.errorMessage = task.error || '生成失败，请重试';
					} else {
						// 任务进行中，继续轮询
						setTimeout(() => {
							this.checkTaskStatus();
						}, 2000);
					}
				} else {
					throw new Error(result.msg || '获取任务状态失败');
				}
			} catch (error) {
				console.error('检查任务状态失败:', error);
				clearInterval(this.tipInterval);
				this.loading = false;
				this.error = true;
				this.errorMessage = error.msg || '获取任务状态失败';
			}
		},
		
		// 初始化音频播放器
		initAudioPlayer(audioUrl) {
			this.audioContext = uni.createInnerAudioContext();
			this.audioContext.src = audioUrl;
			
			this.audioContext.onTimeUpdate(() => {
				const current = this.audioContext.currentTime;
				const total = this.audioContext.duration;
				this.progress = (current / total) * 100;
				this.currentTime = this.formatTime(current);
				this.duration = this.formatTime(total);
			});
			
			this.audioContext.onPlay(() => {
				this.isPlaying = true;
			});
			
			this.audioContext.onPause(() => {
				this.isPlaying = false;
			});
			
			this.audioContext.onEnded(() => {
				this.isPlaying = false;
				this.progress = 0;
			});
		},
		
		// 格式化时间
		formatTime(seconds) {
			if (isNaN(seconds)) return '00:00';
			const min = Math.floor(seconds / 60);
			const sec = Math.floor(seconds % 60);
			return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
		},
		
		// 切换播放
		togglePlay() {
			if (!this.audioContext) return;
			
			if (this.isPlaying) {
				this.audioContext.pause();
			} else {
				this.audioContext.play();
			}
		},
		
		// 保存音乐
		saveMusic() {
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
			
			// 延迟跳转到我的作品页
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/user/works'
				});
			}, 1500);
		},
		
		// 分享音乐
		shareMusic() {
			uni.showShareMenu({
				title: this.musicData.title,
				desc: this.musicData.style,
				success: () => {
					console.log('分享成功');
				}
			});
		},
		
		// 再生成一次
		regenerate() {
			uni.navigateBack();
		},
		
		// 重试
		retry() {
			this.loading = true;
			this.error = false;
			this.errorMessage = '';
			this.tipIndex = 0;
			this.loadingTip = this.loadingTips[0];
			this.startLoadingTips();
			this.checkTaskStatus();
		}
	}
};
</script>

<style lang="scss" scoped>
.result-container {
	min-height: 100vh;
	background-color: #000000;
	color: #FFFFFF;
	padding: 30rpx;
}

// 加载中状态
.loading-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
}

.loading-icon {
	font-size: 120rpx;
	margin-bottom: 40rpx;
	animation: bounce 1s infinite;
}

@keyframes bounce {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-20rpx); }
}

.icon-text {
	font-size: 120rpx;
}

.loading-text {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.loading-tip {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.6);
}

// 成功状态
.success-section {
	padding-bottom: 100rpx;
}

.cover-section {
	width: 100%;
	aspect-ratio: 1;
	border-radius: 30rpx;
	overflow: hidden;
	margin-bottom: 40rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}

.cover-image {
	width: 100%;
	height: 100%;
}

.cover-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.placeholder-icon {
	font-size: 200rpx;
	opacity: 0.3;
}

.music-info {
	text-align: center;
	margin-bottom: 40rpx;
}

.music-title {
	display: block;
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 15rpx;
}

.music-style {
	display: block;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.6);
}

// 歌词区域
.lyrics-section {
	margin-bottom: 40rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.title-icon {
	font-size: 32rpx;
	margin-right: 10rpx;
}

.title-text {
	font-size: 28rpx;
	font-weight: bold;
}

.lyrics-content {
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 20rpx;
	padding: 30rpx;
	max-height: 400rpx;
	overflow-y: auto;
}

.lyrics-text {
	font-size: 26rpx;
	line-height: 1.8;
	white-space: pre-wrap;
}

// 音频播放器
.audio-section {
	margin-bottom: 40rpx;
}

.audio-player {
	background-color: rgba(255, 255, 255, 0.05);
	border-radius: 20rpx;
	padding: 30rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.play-btn {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	padding: 0;
}

.btn-icon {
	font-size: 36rpx;
	color: #FFFFFF;
}

.progress-bar {
	flex: 1;
	height: 8rpx;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 4rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #0B67EC 0%, #7342CC 100%);
	transition: width 0.3s ease;
}

.time-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.6);
	white-space: nowrap;
}

// 操作按钮
.action-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.action-btn {
	height: 90rpx;
	border-radius: 45rpx;
	font-size: 30rpx;
	border: none;
}

.primary-btn {
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
	color: #FFFFFF;
}

.secondary-btn {
	background-color: rgba(255, 255, 255, 0.1);
	color: #FFFFFF;
}

.btn-text {
	font-weight: 500;
}

// 错误状态
.error-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 200rpx;
}

.error-icon {
	font-size: 120rpx;
	margin-bottom: 40rpx;
}

.error-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.error-message {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 60rpx;
	text-align: center;
}

.retry-btn {
	width: 300rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #0952BC 100%);
	border-radius: 40rpx;
	color: #FFFFFF;
	font-size: 28rpx;
	border: none;
}
</style>
