<template>
	<view class="music-player-container">
		<!-- 渐变背景 -->
		<view class="background-gradient"></view>
		
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<view class="nav-button" @click="navigateBack">
				<image src="/static/img/icon/back.svg" class="nav-icon"></image>
			</view>
			<text class="nav-title">音乐播放</text>
			<view class="nav-button" @click="showActionSheet">
				<image src="/static/img/icon/more.svg" class="nav-icon"></image>
			</view>
		</view>
		
		<!-- 黑胶唱片区域 -->
		<view class="vinyl-section">
			<!-- 唱针 -->
			<view class="tonearm" :class="{'playing': isPlaying}">
				<view class="tonearm-body"></view>
				<view class="tonearm-head"></view>
			</view>
			
			<!-- 黑胶唱片 -->
			<view class="vinyl-wrapper">
				<view class="vinyl-disc" :class="{'rotating': isPlaying}">
					<!-- 唱片外圈 -->
					<view class="vinyl-outer"></view>
					<!-- 唱片纹路 -->
					<view class="vinyl-groove vinyl-groove-1"></view>
					<view class="vinyl-groove vinyl-groove-2"></view>
					<view class="vinyl-groove vinyl-groove-3"></view>
					<!-- 专辑封面 -->
					<view class="album-cover">
						<image :src="workDetail.coverUrl" mode="aspectFill" class="cover-image"></image>
					</view>
					<!-- 中心圆点 -->
					<view class="vinyl-center"></view>
				</view>
			</view>
		</view>
		
		<!-- 歌曲信息 -->
		<view class="song-info">
			<text class="song-title">{{workDetail.title}}</text>
			<view class="song-meta">
				<text class="artist-name">{{workDetail.artist}}</text>
				<view class="genre-tag">
					<text>{{workDetail.style}}</text>
				</view>
			</view>
		</view>
		
		<!-- 互动区 -->
		<view class="interaction-section">
			<view class="interaction-button" @click="toggleFavorite">
				<image :src="isFavorite ? '/static/img/icon/like-fill.svg' : '/static/img/icon/like.svg'" 
				       class="interaction-icon" :class="{'liked': isFavorite}"></image>
				<text class="interaction-count">{{workDetail.likeCount || 0}}</text>
			</view>
			<view class="interaction-button" @click="shareWork">
				<image src="/static/img/icon/share.svg" class="interaction-icon"></image>
				<text class="interaction-count">分享</text>
			</view>
			<view class="interaction-button" @click="downloadWork">
				<image src="/static/img/icon/download.svg" class="interaction-icon"></image>
				<text class="interaction-count">下载</text>
			</view>
		</view>
		
		<!-- 播放控制区 -->
		<view class="playback-section">
			<!-- 音质标识 -->
			<view class="quality-tag">
				<text>标准音质</text>
			</view>
			
			<!-- 进度条 -->
			<view class="progress-section">
				<text class="time-text">{{formatTime(currentTime)}}</text>
				<view class="progress-bar" @click="handleProgressClick">
					<view class="progress-bg">
						<view class="progress-fill" :style="{width: progress + '%'}">
							<view class="progress-thumb"></view>
						</view>
					</view>
				</view>
				<text class="time-text">{{formatTime(totalTime)}}</text>
			</view>
			
			<!-- 控制按钮 -->
			<view class="control-buttons">
				<view class="control-btn" @click="handlePrev">
					<image src="/static/img/icon/pre.svg" class="control-icon"></image>
				</view>
				<view class="play-btn" @click="togglePlay">
					<image v-if="!isPlaying" src="/static/img/icon/play.svg" class="play-icon"></image>
					<image v-else src="/static/img/icon/pause.svg" class="play-icon"></image>
				</view>
				<view class="control-btn" @click="handleNext">
					<image src="/static/img/icon/next.svg" class="control-icon"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			id: '',
			isPlaying: false,
			progress: 0,
			currentTime: 0,
			totalTime: 0,
			isFavorite: false,
			workDetail: {
				id: '',
				title: '加载中...',
				artist: '未知艺术家',
				style: '流行',
				coverUrl: '/static/img/covers/default.jpg',
				audioUrl: '',
				likeCount: 0
			}
		}
	},
	onLoad(options) {
		if (options.id) {
			this.id = options.id;
			this.getWorkDetail();
		}
		
		// 监听全局音频管理器事件
		this.$audioManager.on('play', this.onAudioPlay);
		this.$audioManager.on('pause', this.onAudioPause);
		this.$audioManager.on('timeUpdate', this.onTimeUpdate);
		this.$audioManager.on('ended', this.onAudioEnded);
		
		// 检查当前是否有正在播放的音乐
		const playState = this.$audioManager.getPlayState();
		if (playState.currentMusic && playState.currentMusic.id === this.id) {
			this.isPlaying = playState.isPlaying;
			this.currentTime = playState.currentTime;
			this.totalTime = playState.duration;
			this.progress = playState.progress;
		}
	},
	onUnload() {
		// 移除事件监听
		this.$audioManager.off('play', this.onAudioPlay);
		this.$audioManager.off('pause', this.onAudioPause);
		this.$audioManager.off('timeUpdate', this.onTimeUpdate);
		this.$audioManager.off('ended', this.onAudioEnded);
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		async getWorkDetail() {
			try {
				// 这里应该调用真实API获取详情
				// const res = await this.$minApi.getWorkDetail(this.id);
				
				// 模拟数据（实际项目中应该从API获取）
				setTimeout(() => {
					this.workDetail = {
						id: this.id,
						title: '夏日海风',
						artist: 'AI创作',
						style: '电子',
						coverUrl: '/static/img/covers/cover2.jpg',
						audioUrl: 'https://example.com/sample-music.mp3',
						likeCount: 128
					};
					
					// 如果是当前正在播放的歌曲，同步状态
					const playState = this.$audioManager.getPlayState();
					if (playState.currentMusic && playState.currentMusic.id === this.id) {
						this.isPlaying = playState.isPlaying;
						this.currentTime = playState.currentTime;
						this.totalTime = playState.duration;
						this.progress = playState.progress;
					} else {
						// 自动播放
						this.playMusic();
					}
				}, 500);
			} catch (err) {
				console.error('获取作品详情失败:', err);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
			}
		},
		playMusic() {
			if (!this.workDetail.audioUrl) {
				uni.showToast({
					title: '音频地址不存在',
					icon: 'none'
				});
				return;
			}
			
			this.$audioManager.play({
				id: this.workDetail.id,
				title: this.workDetail.title,
				audioUrl: this.workDetail.audioUrl,
				coverUrl: this.workDetail.coverUrl,
				artist: this.workDetail.artist
			});
		},
		togglePlay() {
			const playState = this.$audioManager.getPlayState();
			
			// 如果当前没有播放任何音乐，或播放的不是本页面的音乐
			if (!playState.currentMusic || playState.currentMusic.id !== this.id) {
				this.playMusic();
			} else {
				this.$audioManager.togglePlay();
			}
		},
		handlePrev() {
			uni.showToast({
				title: '这是第一首作品',
				icon: 'none'
			});
		},
		handleNext() {
			uni.showToast({
				title: '这是最后一首作品',
				icon: 'none'
			});
		},
		handleProgressClick(e) {
			// 获取点击位置的百分比
			const query = uni.createSelectorQuery().in(this);
			query.select('.progress-bg').boundingClientRect();
			query.exec((res) => {
				if (res[0]) {
					const clickX = e.detail.x;
					const barLeft = res[0].left;
					const barWidth = res[0].width;
					const percent = (clickX - barLeft) / barWidth;
					const newTime = this.totalTime * percent;
					this.$audioManager.seek(newTime);
				}
			});
		},
		toggleFavorite() {
			this.isFavorite = !this.isFavorite;
			
			const message = this.isFavorite ? '已收藏' : '已取消收藏';
			uni.showToast({
				title: message,
				icon: 'none'
			});
			
			// 这里应该调用API保存收藏状态
		},
		shareWork() {
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
		},
		downloadWork() {
			uni.showLoading({
				title: '下载中...'
			});
			
			// 模拟下载过程（实际项目中应该调用真实下载API）
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '下载成功',
					icon: 'success'
				});
			}, 2000);
		},
		showActionSheet() {
			uni.showActionSheet({
				itemList: ['编辑信息', '删除作品'],
				success: (res) => {
					if (res.tapIndex === 0) {
						uni.showToast({
							title: '编辑功能开发中',
							icon: 'none'
						});
					} else if (res.tapIndex === 1) {
						this.confirmDelete();
					}
				}
			});
		},
		confirmDelete() {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除此作品吗？此操作不可撤销。',
				confirmColor: '#FF4D4F',
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({
							title: '删除中...'
						});
						
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}, 1000);
					}
				}
			});
		},
		formatTime(seconds) {
			if (!seconds || isNaN(seconds)) return '00:00';
			const min = Math.floor(seconds / 60);
			const sec = Math.floor(seconds % 60);
			return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
		},
		// 音频事件监听器
		onAudioPlay() {
			this.isPlaying = true;
		},
		onAudioPause() {
			this.isPlaying = false;
		},
		onTimeUpdate(data) {
			this.currentTime = data.currentTime;
			this.totalTime = data.duration;
			this.progress = data.progress;
		},
		onAudioEnded() {
			this.isPlaying = false;
			this.progress = 0;
			this.currentTime = 0;
		}
	}
}
</script>

<style lang="scss">
.music-player-container {
	position: relative;
	min-height: 100vh;
	overflow: hidden;
}

/* 渐变背景 */
.background-gradient {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(180deg, #000000 0%, #3E2723 100%);
	z-index: -1;
}

/* 顶部导航栏 */
.top-nav {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 90rpx 30rpx 20rpx;
}

.nav-button {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-icon {
	width: 40rpx;
	height: 40rpx;
	filter: brightness(0) invert(1);
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 黑胶唱片区域 */
.vinyl-section {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 60rpx 0;
	margin-top: 40rpx;
}

/* 唱针 */
.tonearm {
	position: absolute;
	top: 0;
	right: 50%;
	margin-right: -180rpx;
	width: 240rpx;
	height: 280rpx;
	transform-origin: 40rpx 40rpx;
	transform: rotate(-25deg);
	transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	z-index: 10;
}

.tonearm.playing {
	transform: rotate(0deg);
}

.tonearm-body {
	position: absolute;
	top: 40rpx;
	left: 40rpx;
	width: 8rpx;
	height: 200rpx;
	background: linear-gradient(180deg, #888888 0%, #333333 100%);
	border-radius: 4rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
}

.tonearm-head {
	position: absolute;
	top: 0;
	left: 20rpx;
	width: 48rpx;
	height: 48rpx;
	background: radial-gradient(circle, #666666 0%, #333333 100%);
	border-radius: 50%;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
}

/* 黑胶唱片 */
.vinyl-wrapper {
	position: relative;
	width: 540rpx;
	height: 540rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.vinyl-disc {
	position: relative;
	width: 540rpx;
	height: 540rpx;
	border-radius: 50%;
	background: #1a1a1a;
	box-shadow: 
		0 0 40rpx rgba(0, 0, 0, 0.8),
		inset 0 0 60rpx rgba(0, 0, 0, 0.6);
}

.vinyl-disc.rotating {
	animation: rotate 20s linear infinite;
}

@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* 唱片外圈 */
.vinyl-outer {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 50%;
	border: 20rpx solid #0a0a0a;
	box-shadow: inset 0 0 20rpx rgba(255, 255, 255, 0.1);
}

/* 唱片纹路 */
.vinyl-groove {
	position: absolute;
	border-radius: 50%;
	border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.vinyl-groove-1 {
	top: 60rpx;
	left: 60rpx;
	right: 60rpx;
	bottom: 60rpx;
}

.vinyl-groove-2 {
	top: 90rpx;
	left: 90rpx;
	right: 90rpx;
	bottom: 90rpx;
}

.vinyl-groove-3 {
	top: 120rpx;
	left: 120rpx;
	right: 120rpx;
	bottom: 120rpx;
}

/* 专辑封面 */
.album-cover {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 320rpx;
	height: 320rpx;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.6);
}

.cover-image {
	width: 100%;
	height: 100%;
}

/* 中心圆点 */
.vinyl-center {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: radial-gradient(circle, #333333 0%, #000000 100%);
	box-shadow: 
		0 0 20rpx rgba(0, 0, 0, 0.8),
		inset 0 0 10rpx rgba(255, 255, 255, 0.1);
}

/* 歌曲信息 */
.song-info {
	text-align: center;
	padding: 40rpx 60rpx 20rpx;
}

.song-title {
	display: block;
	font-size: 44rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 20rpx;
}

.song-meta {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 20rpx;
}

.artist-name {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.6);
}

.genre-tag {
	padding: 6rpx 16rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.genre-tag text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 互动区 */
.interaction-section {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 80rpx;
	padding: 40rpx 60rpx;
}

.interaction-button {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.interaction-icon {
	width: 48rpx;
	height: 48rpx;
	filter: brightness(0) invert(1);
	opacity: 0.7;
	transition: opacity 0.3s;
}

.interaction-icon.liked {
	opacity: 1;
	filter: none;
}

.interaction-count {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.6);
}

/* 播放控制区 */
.playback-section {
	padding: 0 60rpx 60rpx;
}

/* 音质标识 */
.quality-tag {
	display: inline-flex;
	padding: 6rpx 16rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	border: 1rpx solid rgba(255, 255, 255, 0.2);
	margin-bottom: 40rpx;
}

.quality-tag text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.6);
}

/* 进度条 */
.progress-section {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 50rpx;
}

.time-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.5);
	width: 80rpx;
	text-align: center;
}

.progress-bar {
	flex: 1;
	padding: 20rpx 0;
}

.progress-bg {
	height: 6rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3rpx;
	overflow: visible;
	position: relative;
}

.progress-fill {
	height: 100%;
	background: #FF4141;
	border-radius: 3rpx;
	position: relative;
	transition: width 0.3s;
}

.progress-thumb {
	position: absolute;
	right: -8rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 16rpx;
	height: 16rpx;
	background: #FFFFFF;
	border-radius: 50%;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}

/* 控制按钮 */
.control-buttons {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 60rpx;
}

.control-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 50%;
	border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.control-icon {
	width: 36rpx;
	height: 36rpx;
	filter: brightness(0) invert(1);
}

.play-btn {
	width: 120rpx;
	height: 120rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #FFFFFF;
	border-radius: 50%;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
}

.play-icon {
	width: 48rpx;
	height: 48rpx;
}
</style>
