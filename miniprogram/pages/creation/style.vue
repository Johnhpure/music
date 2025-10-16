<template>
	<view class="style-selection">
		<!-- 内容区域 -->
		<view class="content-container">
			<!-- 音乐风格选择 -->
			<view class="style-section">
				<view class="section-title">风格类型</view>
				<view class="style-grid">
					<view
						class="style-item"
						v-for="(style, index) in musicStyles"
						:key="index"
						:class="{'active': selectedStyle === style.id}"
						@click="selectStyle(style.id)"
					>
						<view class="style-icon">
							<text class="iconfont" :class="style.icon"></text>
						</view>
						<view class="style-name">{{style.name}}</view>
					</view>
				</view>
			</view>
			
			<!-- 声音性别选择 -->
			<view class="voice-section">
				<view class="section-title">声音性别</view>
				<view class="voice-options">
					<view
						class="voice-option"
						v-for="(voice, index) in voiceGenders"
						:key="index"
						:class="{'active': selectedVoice === voice.id}"
						@click="selectVoice(voice.id)"
					>
						<view class="option-icon">
							<text class="iconfont" :class="voice.icon"></text>
						</view>
						<view class="option-name">{{voice.name}}</view>
					</view>
				</view>
			</view>
			
			<!-- 声音参考试听 -->
			<!-- <view class="voice-sample">
				<view class="section-title">声音参考</view>
				<view class="sample-card">
					<view class="sample-info">
						<view class="info-text">
							<text class="sample-label">当前选择：</text>
							<text class="sample-value">{{currentStyleName}} / {{currentVoiceName}}</text>
						</view>
						<view class="preview-tip">
							<text>点击试听按钮，预览声音效果</text>
						</view>
					</view>
					<view class="play-button" @click="playSample">
						<text class="iconfont icon-play"></text>
					</view>
				</view>
			</view> -->
			
			<!-- 底部操作区 -->
			<view class="bottom-actions">
				<button class="back-btn" @click="goBack">
					返回修改歌词
				</button>
				<button class="next-btn" :disabled="!canProceed" @click="proceedToNext">
					下一步 <text class="iconfont icon-right"></text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				creationType: 'ai', // 创作类型：ai-AI辅助创作，manual-自主创作
				songTitle: '', // 歌曲标题
				lyrics: '', // 歌词内容
				selectedStyle: 'pop', // 选中的音乐风格
				selectedVoice: 'female', // 选中的声音性别
				isPlaying: false, // 是否正在播放示例
				
				// 音乐风格列表
				musicStyles: [
					{id: 'pop', name: '流行', icon: 'icon-pop'},
					{id: 'rock', name: '摇滚', icon: 'icon-rock'},
					{id: 'folk', name: '民谣', icon: 'icon-folk'},
					{id: 'electronic', name: '电子', icon: 'icon-electronic'},
					{id: 'rnb', name: 'R&B', icon: 'icon-rnb'},
					{id: 'hiphop', name: '嘻哈', icon: 'icon-hiphop'},
					{id: 'classical', name: '古典', icon: 'icon-classical'},
					{id: 'jazz', name: '爵士', icon: 'icon-jazz'},
					{id: 'country', name: '乡村', icon: 'icon-country'},
					{id: 'ballad', name: '抒情', icon: 'icon-ballad'},
					{id: 'edm', name: 'EDM', icon: 'icon-edm'},
					{id: 'indie', name: '独立', icon: 'icon-indie'}
				],
				
				// 声音性别列表
				voiceGenders: [
					{id: 'male', name: '男声', icon: 'icon-male'},
					{id: 'female', name: '女声', icon: 'icon-female'},
					{id: 'neutral', name: '中性', icon: 'icon-neutral'}
				]
			}
		},
		computed: {
			// 当前选中的风格名称
			currentStyleName() {
				const style = this.musicStyles.find(item => item.id === this.selectedStyle);
				return style ? style.name : '';
			},
			// 当前选中的声音名称
			currentVoiceName() {
				const voice = this.voiceGenders.find(item => item.id === this.selectedVoice);
				return voice ? voice.name : '';
			},
			// 是否可以进行下一步
			canProceed() {
				return this.selectedStyle && this.selectedVoice;
			}
		},
		onLoad(options) {
			// 获取创作类型和歌曲信息
			if(options.type) {
				this.creationType = options.type;
			}
			if(options.title) {
				this.songTitle = decodeURIComponent(options.title || '');
			}
			if(options.lyrics) {
				this.lyrics = decodeURIComponent(options.lyrics || '');
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			// 选择音乐风格
			selectStyle(styleId) {
				this.selectedStyle = styleId;
			},
			// 选择声音性别
			selectVoice(voiceId) {
				this.selectedVoice = voiceId;
			},
			// 播放示例
			playSample() {
				if(this.isPlaying) {
					// 停止播放
					uni.stopBackgroundAudio({
						success: () => {
							this.isPlaying = false;
						}
					});
					return;
				}
				
				// 根据选择的风格和声音播放对应的示例音频
				const sampleUrl = this.getSampleUrl(this.selectedStyle, this.selectedVoice);
				
				uni.showToast({
					title: '正在播放示例...',
					icon: 'none'
				});
				
				// 播放示例音频
				uni.playBackgroundAudio({
					dataUrl: sampleUrl,
					title: `${this.currentStyleName} - ${this.currentVoiceName}示例`,
					success: () => {
						this.isPlaying = true;
					},
					fail: () => {
						uni.showToast({
							title: '示例播放失败',
							icon: 'none'
						});
					}
				});
				
				// 监听播放结束
				uni.onBackgroundAudioStop(() => {
					this.isPlaying = false;
				});
			},
			// 获取示例音频URL
			getSampleUrl(style, voice) {
				// 实际项目中应根据风格和声音组合返回对应的示例音频URL
				// 这里返回模拟URL
				return `/static/samples/${style}_${voice}.mp3`;
			},
			// 进行下一步
			proceedToNext() {
				if(!this.canProceed) return;
				
				// 跳转到音乐预览页面
				uni.navigateTo({
					url: `/pages/creation/preview?type=${this.creationType}&title=${encodeURIComponent(this.songTitle)}&style=${this.selectedStyle}&voice=${this.selectedVoice}` + 
						 (this.lyrics ? `&lyrics=${encodeURIComponent(this.lyrics)}` : '')
				});
			}
		}
	}
</script>

<style lang="scss">
.style-selection {
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

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
}

// 音乐风格选择样式
.style-section {
	margin-bottom: 40rpx;
	
	.style-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		
		.style-item {
			background-color: #1E1E1E;
			border-radius: 15rpx;
			padding: 30rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			border: 2rpx solid transparent;
			
			&.active {
				border-color: #3B7EFF;
				background-color: rgba(59, 126, 255, 0.1);
			}
			
			.style-icon {
				font-size: 60rpx;
				color: #CCCCCC;
				margin-bottom: 15rpx;
				
				.iconfont {
					font-size: inherit;
				}
			}
			
			.style-name {
				font-size: 26rpx;
				color: #CCCCCC;
			}
			
			&.active {
				.style-icon, .style-name {
					color: #FFFFFF;
				}
			}
		}
	}
}

// 声音性别选择样式
.voice-section {
	margin-bottom: 40rpx;
	
	.voice-options {
		display: flex;
		justify-content: space-between;
		
		.voice-option {
			flex: 1;
			margin: 0 10rpx;
			background-color: #1E1E1E;
			border-radius: 15rpx;
			padding: 30rpx 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			border: 2rpx solid transparent;
			
			&.active {
				border-color: #3B7EFF;
				background-color: rgba(59, 126, 255, 0.1);
			}
			
			.option-icon {
				font-size: 60rpx;
				color: #CCCCCC;
				margin-bottom: 15rpx;
				
				.iconfont {
					font-size: inherit;
				}
			}
			
			.option-name {
				font-size: 26rpx;
				color: #CCCCCC;
			}
			
			&.active {
				.option-icon, .option-name {
					color: #FFFFFF;
				}
			}
		}
	}
}

// 声音示例样式
.voice-sample {
	margin-bottom: 60rpx;
	
	.sample-card {
		background-color: #1E1E1E;
		border-radius: 15rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.sample-info {
			.info-text {
				margin-bottom: 10rpx;
				
				.sample-label {
					font-size: 26rpx;
					color: #CCCCCC;
					margin-right: 10rpx;
				}
				
				.sample-value {
					font-size: 28rpx;
					color: #FFFFFF;
				}
			}
			
			.preview-tip {
				font-size: 24rpx;
				color: #8E8E8E;
			}
		}
		
		.play-button {
			width: 80rpx;
			height: 80rpx;
			background-color: #3B7EFF;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			
			.iconfont {
				font-size: 40rpx;
				color: #FFFFFF;
			}
		}
	}
}

// 底部操作区样式
.bottom-actions {
	display: flex;
	justify-content: space-between;
	
	.back-btn, .next-btn {
		width: 48%;
		text-align: center;
		padding: 10rpx 0;
		border-radius: 50rpx;
		font-size: 30rpx;
	}
	
	.back-btn {
		background-color: #282828;
		color: #CCCCCC;
	}
	
	.next-btn {
		background: linear-gradient(135deg, #3B7EFF 0%, #9A7BFF 100%);
		color: #FFFFFF;
		font-weight: 600;
		display: flex;
		justify-content: center;
		align-items: center;
		
		.iconfont {
			margin-left: 10rpx;
		}
		
		&[disabled] {
			opacity: 0.5;
			background: #666666;
		}
	}
}
</style> 