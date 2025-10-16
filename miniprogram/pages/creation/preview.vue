<template>
	<view class="music-preview">
		
		<!-- 内容区域 -->
		<view class="content-container">
			
			<!-- 确认创作信息 -->
			<block v-if="!isConfirmGenerat">
				<view class="confirmation-section">
					<view class="confirmation-title">确认创作信息</view>
					<view class="confirmation-item"><text>音乐风格</text><text>{{styleName}}</text></view>
					<view class="confirmation-item"><text>声音类型</text><text>{{voiceName}}</text></view>
					<button class="gradient-button" @click="startGenerating" v-if="!isGenerating">生成音乐</button>
					<view class="tips" v-if="!isGenerating">将消耗30音乐点数</view>
				</view>
			</block>
			
			<!-- 生成中状态 -->
			<block v-if="isGenerating && isGenerating">
				<view class="generating-section">
					<view class="loading-animation">
						<view class="loading-circle"></view>
						<view class="loading-text">AI正在创作中</view>
					</view>
					<view class="generating-progress">
						<view class="progress-bar">
							<view class="progress-inner" :style="{width: `${generatingProgress}%`}"></view>
						</view>
						<view class="progress-text">{{generatingProgress}}%</view>
					</view>
					<view class="generating-tips">
						<view class="tip-item">
							<text class="iconfont icon-bulb"></text>
							<text>正在将您的歌词谱写成优美旋律</text>
						</view>
						<view class="tip-item">
							<text class="iconfont icon-time"></text>
							<text>预计需要30-60秒完成创作</text>
						</view>
						<view class="tip-item">
							<text class="iconfont icon-note"></text>
							<text>请耐心等待，我们将为您带来精彩作品</text>
						</view>
					</view>
				</view>
			</block>
			
			<!-- 生成完成状态 -->
			<block v-else-if="isConfirmGenerat && !isGenerating">
				<!-- 唱片展示 -->
				<view class="record-display">
					<view class="record-disc" :class="{'playing': isPlaying}">
						<view class="disc-inner">
							<image class="disc-cover" :src="songCover" mode="aspectFill"></image>
						</view>
					</view>
					<view class="song-info">
						<view class="song-title">{{songTitle}}</view>
						<view class="song-style">{{styleName}} / {{voiceName}}</view>
					</view>
				</view>
				
				<!-- 进度条 -->
				<view class="progress-control">
					<view class="time-display">{{formatTime(currentTime)}}</view>
					<view class="progress-bar" @click="setProgress">
						<view class="progress-inner" :style="{width: `${playProgress}%`}"></view>
						<view class="progress-handle" :style="{left: `${playProgress}%`}"></view>
					</view>
					<view class="time-display">{{formatTime(duration)}}</view>
				</view>
				
				<!-- 播放控制 -->
				<view class="player-controls">
					<view class="control-btn" @click="playPrev">
						<text class="iconfont icon-prev"></text>
					</view>
					<view class="control-btn play-btn" @click="togglePlay">
						<text class="iconfont" :class="isPlaying ? 'icon-pause' : 'icon-play'"></text>
					</view>
					<view class="control-btn" @click="playNext">
						<text class="iconfont icon-next"></text>
					</view>
				</view>
				
				<!-- 歌词展示 -->
				<view class="lyrics-display" style="display: none;">
					<view class="section-title">
						<text>歌词</text>
						<text class="show-more" @click="toggleLyricsExpand">{{isLyricsExpanded ? '收起' : '展开'}}</text>
					</view>
					<view class="lyrics-content" :class="{'expanded': isLyricsExpanded}">
						<text>{{lyrics}}</text>
					</view>
				</view>
				
				<!-- 操作按钮 -->
				<view class="action-buttons">
					<view class="action-button" @click="downloadMusic">
						<image class="icon" src="/static/img/icon/download.svg"></image>
						<text>下载</text>
					</view>
					<view class="action-button" @click="shareMusic">
						<image class="icon" src="/static/img/icon/download.svg"></image>
						<text>分享</text>
					</view>
				</view>
				
				<!-- 底部提示 -->
				<!-- <view class="bottom-tips">
					<text>创作消耗了20音乐点数，当前剩余：</text>
					<text class="points-count">{{musicPoints}}</text>
					<text class="get-more" @click="navigateToPoints">获取更多点数</text>
				</view> -->
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				creationType: 'ai', // 创作类型：ai或manual
				songTitle: '心动瞬间', // 歌曲标题
				lyrics: '', // 歌词
				styleId: 'pop', // 风格ID
				voiceId: 'female', // 声音ID
				songCover: '/static/img/covers/default.jpg', // 封面图片
				
				isConfirmGenerat: false,
				isGenerating: false, // 是否正在生成
				generatingProgress: 0, // 生成进度
				
				isPlaying: false, // 是否正在播放
				currentTime: 0, // 当前播放时间（秒）
				duration: 180, // 总时长（秒）
				
				isLyricsExpanded: false, // 歌词是否展开
				musicPoints: 80, // 剩余音乐点数
				
				audioContext: null, // 音频上下文
				progressTimer: null, // 进度条定时器
				generatingTimer: null // 生成进度定时器
			}
		},
		computed: {
			// 播放进度百分比
			playProgress() {
				if(this.duration === 0) return 0;
				return (this.currentTime / this.duration) * 100;
			},
			// 风格名称
			styleName() {
				const styles = {
					'pop': '流行',
					'rock': '摇滚',
					'folk': '民谣',
					'electronic': '电子',
					'rnb': 'R&B',
					'hiphop': '嘻哈',
					'classical': '古典',
					'jazz': '爵士',
					'country': '乡村',
					'ballad': '抒情',
					'edm': 'EDM',
					'indie': '独立'
				};
				return styles[this.styleId] || '未知风格';
			},
			// 声音名称
			voiceName() {
				const voices = {
					'male': '男声',
					'female': '女声',
					'neutral': '中性'
				};
				return voices[this.voiceId] || '未知声音';
			}
		},
		onLoad(options) {
			// 获取参数
			if(options.type) {
				this.creationType = options.type;
			}
			if(options.title) {
				this.songTitle = decodeURIComponent(options.title || '');
			}
			if(options.lyrics) {
				this.lyrics = decodeURIComponent(options.lyrics || '');
			}
			if(options.style) {
				this.styleId = options.style;
			}
			if(options.voice) {
				this.voiceId = options.voice;
			}
			
			// 初始化音频上下文
			this.audioContext = uni.createInnerAudioContext();
		},
		onUnload() {
			// 清理资源
			if(this.audioContext) {
				this.audioContext.destroy();
			}
			if(this.progressTimer) {
				clearInterval(this.progressTimer);
			}
			if(this.generatingTimer) {
				clearInterval(this.generatingTimer);
			}
		},
		methods: {
			// 开始生成音乐
			startGenerating() {
				this.isConfirmGenerat = true;
				if(this.musicPoints < 30) {
					uni.showModal({
						title: '点数不足',
						content: '您的音乐点数不足，是否前往获取更多点数？',
						confirmText: '获取点数',
						cancelText: '取消',
						success: (res) => {
							if(res.confirm) {
								this.navigateToPoints();
							}
						}
					});
					return;
				}
				
				// 设置为生成中状态
				this.isGenerating = true;
				this.generatingProgress = 0;
				
				// 消耗点数
				this.musicPoints -= 30;
				
				// 模拟生成过程
				this.simulateGenerating();
			},
			// 模拟生成过程
			simulateGenerating() {
				let progress = 0;
				
				this.generatingTimer = setInterval(() => {
					progress += Math.random() * 5;
					if(progress >= 100) {
						progress = 100;
						clearInterval(this.generatingTimer);
						this.generatingTimer = null;
						
						// 延迟500ms后显示结果
						setTimeout(() => {
							this.isGenerating = false;
							this.initAudio();
						}, 500);
					}
					this.generatingProgress = Math.floor(progress);
				}, 1000); // 优化: 从800ms改为1000ms，降低刷新频率
			},
			// 初始化音频
			initAudio() {
				// 实际项目中应加载生成的音频文件
				// 这里使用示例URL
				const audioUrl = `/static/samples/${this.styleId}_${this.voiceId}.mp3`;
				
				this.audioContext.src = audioUrl;
				this.audioContext.autoplay = false;
				
				// 监听音频事件
				this.audioContext.onCanplay(() => {
					this.duration = this.audioContext.duration || 180;
				});
				
				this.audioContext.onPlay(() => {
					this.isPlaying = true;
					this.startProgressTimer();
				});
				
				this.audioContext.onPause(() => {
					this.isPlaying = false;
					this.stopProgressTimer();
				});
				
				this.audioContext.onStop(() => {
					this.isPlaying = false;
					this.currentTime = 0;
					this.stopProgressTimer();
				});
				
				this.audioContext.onEnded(() => {
					this.isPlaying = false;
					this.currentTime = 0;
					this.stopProgressTimer();
				});
				
				this.audioContext.onError((err) => {
					console.error('音频播放错误:', err);
					uni.showToast({
						title: '音频播放失败',
						icon: 'none'
					});
					this.isPlaying = false;
					this.stopProgressTimer();
				});
				
				// 预加载
				this.audioContext.obeyMuteSwitch = false; // 是否遵循系统静音开关
			},
			// 开始进度定时器
			startProgressTimer() {
				this.stopProgressTimer();
				this.progressTimer = setInterval(() => {
					this.currentTime = this.audioContext.currentTime || 0;
				}, 500); // 优化: 从250ms改为500ms，降低刷新频率，减少性能消耗
			},
			// 停止进度定时器
			stopProgressTimer() {
				if(this.progressTimer) {
					clearInterval(this.progressTimer);
					this.progressTimer = null;
				}
			},
			// 播放/暂停
			togglePlay() {
				if(this.isPlaying) {
					this.audioContext.pause();
				} else {
					this.audioContext.play();
				}
			},
			// 上一首（功能占位，实际只有一首）
			playPrev() {
				uni.showToast({
					title: '已经是第一首',
					icon: 'none'
				});
			},
			// 下一首（功能占位，实际只有一首）
			playNext() {
				uni.showToast({
					title: '已经是最后一首',
					icon: 'none'
				});
			},
			// 设置进度
			setProgress(e) {
				if(!this.audioContext) return;
				
				const touch = e.touches[0];
				const progressBar = e.currentTarget;
				
				// 获取进度条宽度和触摸位置
				const rect = progressBar.getBoundingClientRect();
				const offsetX = touch.clientX - rect.left;
				const width = rect.width;
				
				// 计算进度百分比
				const percent = offsetX / width;
				const seekTime = this.duration * percent;
				
				// 设置播放位置
				this.audioContext.seek(seekTime);
				this.currentTime = seekTime;
			},
			// 格式化时间
			formatTime(seconds) {
				const mins = Math.floor(seconds / 60);
				const secs = Math.floor(seconds % 60);
				return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
			},
			// 切换歌词展开状态
			toggleLyricsExpand() {
				this.isLyricsExpanded = !this.isLyricsExpanded;
			},
			// 重新生成音乐
			regenerateMusic() {
				uni.showModal({
					title: '重新生成',
					content: '重新生成将消耗额外的20音乐点数，确定继续吗？',
					success: (res) => {
						if(res.confirm) {
							if(this.musicPoints < 20) {
								uni.showModal({
									title: '点数不足',
									content: '您的音乐点数不足，是否前往获取更多点数？',
									confirmText: '获取点数',
									cancelText: '取消',
									success: (res) => {
										if(res.confirm) {
											this.navigateToPoints();
										}
									}
								});
								return;
							}
							
							// 设置为生成中状态
							this.isGenerating = true;
							this.generatingProgress = 0;
							
							// 停止当前播放
							if(this.isPlaying) {
								this.audioContext.stop();
							}
							
							// 消耗点数
							this.musicPoints -= 20;
							
							// 模拟重新生成
							this.simulateGenerating();
						}
					}
				});
			},
			// 下载音乐
			downloadMusic() {
				// 实际项目中应提供真实的下载链接
				uni.showLoading({
					title: '正在下载...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '下载成功',
						icon: 'success'
					});
				}, 2000);
			},
			// 分享音乐
			shareMusic() {
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					title: this.songTitle,
					summary: `我用AI音乐助手创作了一首${this.styleName}风格的歌曲，快来听听吧！`,
					imageUrl: this.songCover,
					success: (res) => {
						console.log('分享成功：', res);
					},
					fail: (err) => {
						console.error('分享失败：', err);
					}
				});
			},
			// 保存到我的作品
			saveToWorks() {
				uni.showLoading({
					title: '正在保存...'
				});
				
				// 实际项目中应调用接口保存到服务器
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					
					// 保存成功后返回首页
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1500);
				}, 1000);
			},
			// 导航到音乐点数中心
			navigateToPoints() {
				uni.navigateTo({
					url: '/pages/user/points'
				});
			}
		}
	}
</script>

<style lang="scss">
.music-preview {
	min-height: 100vh;
	background-color: #121212;
	color: #FFFFFF;
}

.status-bar-height {
	height: var(--status-bar-height);
	width: 100%;
}

.nav-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	
	.left, .right {
		width: 80rpx;
		
		.iconfont {
			font-size: 40rpx;
		}
	}
	
	.center {
		flex: 1;
		text-align: center;
		
		.title {
			font-size: 34rpx;
			font-weight: 600;
		}
	}
}

.steps-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 40rpx 40rpx;
	
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.step-icon {
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;
			background-color: #282828;
			color: #CCCCCC;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 26rpx;
			margin-bottom: 10rpx;
		}
		
		.step-text {
			font-size: 24rpx;
			color: #CCCCCC;
		}
		
		&.active {
			.step-icon {
				background-color: #3B7EFF;
				color: #FFFFFF;
			}
			
			.step-text {
				color: #FFFFFF;
			}
		}
	}
	
	.step-line {
		width: 100rpx;
		height: 2rpx;
		background-color: #282828;
		margin: 0 20rpx;
		margin-bottom: 20rpx;
	}
}

.content-container {
	padding: 0 30rpx 30rpx;
}

// 确认信息样式
.confirmation-section {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	text-align: center;
}

.confirmation-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 20rpx;
}

.confirmation-item {
	display: flex;
	justify-content: space-between;
	font-size: 26rpx;
	color: #CCCCCC;
	margin-bottom: 10rpx;
}

.tips {
	font-size: 24rpx;
	color: #8E8E8E;
	margin-top: 10rpx;
}

.gradient-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	border-radius: 100rpx;
	padding: 10rpx 0;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20rpx;
}

// 生成中状态样式
.generating-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	
	.loading-animation {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
		
		.loading-circle {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 6rpx solid rgba(59, 126, 255, 0.1);
			border-top-color: #3B7EFF;
			animation: spin 1.5s linear infinite;
			margin-bottom: 30rpx;
		}
		
		.loading-text {
			font-size: 34rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
	}
	
	.generating-progress {
		width: 100%;
		margin-bottom: 40rpx;
		
		.progress-bar {
			width: 100%;
			height: 10rpx;
			background-color: #282828;
			border-radius: 5rpx;
			overflow: hidden;
			margin-bottom: 10rpx;
			
			.progress-inner {
				height: 100%;
				background: linear-gradient(90deg, #3B7EFF, #9A7BFF);
				border-radius: 5rpx;
				transition: width 0.3s ease;
			}
		}
		
		.progress-text {
			text-align: center;
			font-size: 26rpx;
			color: #CCCCCC;
		}
	}
	
	.generating-tips {
		background-color: #1E1E1E;
		border-radius: 15rpx;
		padding: 30rpx;
		width: 100%;
		
		.tip-item {
			display: flex;
			align-items: center;
			margin-bottom: 20rpx;
			
			.iconfont {
				font-size: 30rpx;
				color: #3B7EFF;
				margin-right: 15rpx;
			}
			
			text {
				font-size: 26rpx;
				color: #CCCCCC;
			}
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

// 唱片展示样式
.record-display {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 0;
	margin-bottom: 30rpx;
	
	.record-disc {
		width: 400rpx;
		height: 400rpx;
		border-radius: 50%;
		background-color: #1E1E1E;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 0 30rpx rgba(0, 0, 0, 0.5);
		margin-bottom: 30rpx;
		
		&.playing {
			animation: rotate 15s linear infinite;
		}
		
		.disc-inner {
			width: 300rpx;
			height: 300rpx;
			border-radius: 50%;
			overflow: hidden;
			
			.disc-cover {
				width: 100%;
				height: 100%;
			}
		}
	}
	
	.song-info {
		text-align: center;
		
		.song-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #FFFFFF;
			margin-bottom: 10rpx;
		}
		
		.song-style {
			font-size: 24rpx;
			color: #CCCCCC;
		}
	}
}

@keyframes rotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

// 进度条样式
.progress-control {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	
	.time-display {
		font-size: 24rpx;
		color: #CCCCCC;
		width: 80rpx;
		text-align: center;
	}
	
	.progress-bar {
		flex: 1;
		height: 6rpx;
		background-color: #282828;
		border-radius: 3rpx;
		position: relative;
		margin: 0 15rpx;
		
		.progress-inner {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			background: linear-gradient(90deg, #3B7EFF, #9A7BFF);
			border-radius: 3rpx;
		}
		
		.progress-handle {
			position: absolute;
			top: 50%;
			width: 20rpx;
			height: 20rpx;
			border-radius: 50%;
			background-color: #FFFFFF;
			transform: translate(-50%, -50%);
		}
	}
}

// 播放控制样式
.player-controls {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 50rpx;
	
	.control-btn {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.iconfont {
			font-size: 50rpx;
			color: #CCCCCC;
		}
		
		&.play-btn {
			width: 120rpx;
			height: 120rpx;
			background-color: #3B7EFF;
			border-radius: 50%;
			margin: 0 40rpx;
			
			.iconfont {
				font-size: 60rpx;
				color: #FFFFFF;
			}
		}
	}
}

// 歌词展示样式
.lyrics-display {
	background-color: #1E1E1E;
	border-radius: 15rpx;
	padding: 20rpx;
	margin-bottom: 40rpx;
	
	.section-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
		font-size: 30rpx;
		font-weight: 600;
		
		.show-more {
			font-size: 24rpx;
			color: #3B7EFF;
			font-weight: normal;
		}
	}
	
	.lyrics-content {
		max-height: 240rpx;
		overflow: hidden;
		transition: max-height 0.3s ease;
		
		&.expanded {
			max-height: 1000rpx;
		}
		
		text {
			font-size: 26rpx;
			color: #CCCCCC;
			line-height: 1.8;
			white-space: pre-wrap;
		}
	}
}

// 操作按钮样式
.action-buttons {
	display: flex;
	justify-content: center;
	gap: 40rpx;
	margin-bottom: 40rpx;
	
	.action-button {
		display: flex;
		align-items: center;
		padding: 20rpx 40rpx;
		border-radius: 40rpx;
		background-color: rgba(45,45,45,1);
		gap: 10rpx;
		.icon{
			width: 30rpx;
			height: 30rpx;
		}
		.iconfont {
			font-size: 50rpx;
			color: #CCCCCC;
			margin-bottom: 10rpx;
		}
		
		text {
			font-size: 24rpx;
			color: #CCCCCC;
		}
	}
}

// 底部提示样式
.bottom-tips {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 24rpx;
	color: #8E8E8E;
	
	.points-count {
		color: #3B7EFF;
		margin: 0 10rpx;
	}
	
	.get-more {
		color: #9A7BFF;
		margin-left: 15rpx;
		text-decoration: underline;
	}
}
</style> 