<template>
	<view class="container">
		
		<view class="content">
			<!-- 音乐封面和基本信息 -->
			<view class="music-cover-section">
				<view class="cover-container">
					<image :src="workDetail.coverUrl" mode="aspectFill" class="cover-image"></image>
				</view>
				
				<view class="music-basic-info">
					<text class="music-title">{{workDetail.title}}</text>
					<text class="music-style">{{workDetail.style}}</text>
					<view class="music-meta">
						<text class="creation-date">创作于 {{formatDate(workDetail.createdAt)}}</text>
						<text class="meta-divider">·</text>
						<text class="duration">{{formatTime(totalTime)}}</text>
					</view>
				</view>
			</view>
			
			<!-- 播放控制 -->
			<view class="playback-control">
				<!-- 进度条和时间 -->
				<view class="time-progress">
					<text class="current-time">{{formatTime(currentTime)}}</text>
					<view class="progress-bar">
						<view class="progress-fill" :style="{width: progress + '%'}"></view>
					</view>
					<text class="total-time">{{formatTime(totalTime)}}</text>
				</view>
				
				<!-- 波形图 -->
				<view class="waveform">
					<view v-for="(height, index) in waveformHeights" :key="index" 
					      class="waveform-bar" :style="{ height: height + 'rpx' }"></view>
				</view>
				
				<!-- 控制按钮 -->
				<view class="control-buttons">
					<view class="control-button prev" @click="handlePrev">
						<image src="/static/img/icon/pre.svg" class="control-icon"></image>
					</view>
					<view class="play-button" @click="togglePlay">
						<image v-if="!isPlaying" src="/static/img/icon/play.svg" class="play-icon"></image>
						<image v-else src="/static/img/icon/pause.svg" class="pause-icon"></image>
					</view>
					<view class="control-button next" @click="handleNext">
						<image src="/static/img/icon/next.svg" class="control-icon"></image>
					</view>
				</view>
			</view>
			
			<!-- 功能按钮 -->
			<view class="function-buttons">
				<view class="function-button" @click="toggleFavorite">
					<view class="function-icon" :class="{'active': isFavorite}">
						<image src="/static/img/icon/like.svg" class="function-img"></image>
					</view>
					<text class="function-text">收藏</text>
				</view>
				<view class="function-button" @click="downloadWork">
					<view class="function-icon">
						<image src="/static/img/icon/download.svg" class="function-img"></image>
					</view>
					<text class="function-text">下载</text>
				</view>
				<view class="function-button" @click="editMusic">
					<view class="function-icon">
						<image src="/static/img/icon/edit.svg" class="function-img"></image>
					</view>
					<text class="function-text">编辑</text>
				</view>
				<view class="function-button" @click="shareWork">
					<view class="function-icon">
						<image src="/static/img/icon/share.svg" class="function-img"></image>
					</view>
					<text class="function-text">分享</text>
				</view>
			</view>
			
			<!-- 音乐信息 -->
			<view class="music-info-section">
				<text class="section-title">音乐信息</text>
				
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">创作模式</text>
						<text class="info-value">{{workDetail.creationMode}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">音乐风格</text>
						<text class="info-value">{{workDetail.style}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">BPM</text>
						<text class="info-value">{{workDetail.bpm}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">调性</text>
						<text class="info-value">{{workDetail.key}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">创作提示词</text>
						<text class="info-value">{{workDetail.prompt}}</text>
					</view>
					<view class="info-item">
						<text class="info-label">播放次数</text>
						<text class="info-value">{{workDetail.playCount}}</text>
					</view>
				</view>
			</view>
			
			<!-- 相似推荐 -->
			<view class="similar-section">
				<view class="section-header">
					<text class="section-title">相似推荐</text>
					<text class="view-more" @click="viewMoreSimilar">查看更多</text>
				</view>
				
				<view class="similar-grid">
					<view v-for="(item, index) in similarMusic" :key="index" class="similar-item" @click="playSimilar(item)">
						<view class="similar-cover">
							<image :src="item.coverUrl" mode="aspectFill" class="similar-image"></image>
							<view class="play-icon-similar">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="similar-info">
							<text class="similar-title">{{item.title}}</text>
							<text class="similar-meta">{{item.style}} · {{item.duration}}</text>
						</view>
					</view>
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
			progress: 35, // 默认进度35%
			currentTime: 75, // 默认1:15
			totalTime: 225, // 默认3:45
			isFavorite: false,
			workDetail: {
				id: '',
				title: '加载中...',
				style: '加载中...',
				coverUrl: '/static/img/covers/default.jpg',
				createdAt: new Date(),
				creationMode: '加载中...',
				bpm: 0,
				key: '',
				prompt: '',
				playCount: 0,
				audioUrl: ''
			},
			audioContext: null,
			waveformHeights: [],
			similarMusic: []
		}
	},
	onLoad(options) {
		if (options.id) {
			this.id = options.id;
			this.getWorkDetail();
		}
		
		// 生成波形图高度
		this.generateWaveform();
		
		// 创建音频上下文
		this.audioContext = uni.createInnerAudioContext();
		this.audioContext.onTimeUpdate(() => {
			this.currentTime = this.audioContext.currentTime;
			this.progress = (this.currentTime / this.totalTime) * 100;
		});
		this.audioContext.onEnded(() => {
			this.isPlaying = false;
			this.progress = 0;
			this.currentTime = 0;
		});
		
		// 加载相似推荐
		this.loadSimilarMusic();
	},
	onUnload() {
		// 页面卸载时停止和释放音频
		if (this.audioContext) {
			this.audioContext.stop();
			this.audioContext.destroy();
		}
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		// 获取作品详情 - 使用真实API
		async getWorkDetail() {
			try {
				uni.showLoading({ title: '加载中...' });
				
				const response = await this.$minApi.apis.getMusicTasks({
					page: 1,
					pageSize: 100
				});
				
				if (response && response.data) {
					// 从列表中找到对应的作品
					const task = response.data.list.find(t => String(t.id) === String(this.id));
					
					if (task) {
						this.workDetail = {
							id: task.id,
							title: task.title || '未命名作品',
							style: task.style || '未知',
							coverUrl: task.imageUrl || '/static/img/covers/default.jpg',
							createdAt: task.createdAt,
							creationMode: task.model === 'chirp-v3-5' ? 'AI创作' : '自主创作',
							bpm: 120, // TODO: 后端添加BPM字段
							key: 'C大调', // TODO: 后端添加调性字段
							prompt: task.prompt || task.lyrics || '',
							playCount: 0, // TODO: 后端添加播放次数统计
							audioUrl: task.audioUrl
						};
						
						// 设置音频源 - 使用微信小程序官方API
						if (this.workDetail.audioUrl) {
							this.audioContext.src = this.workDetail.audioUrl;
							// 监听音频加载完成
							this.audioContext.onCanplay(() => {
								this.totalTime = this.audioContext.duration;
							});
						}
						
						console.log('✅ 作品详情加载成功:', this.workDetail.title);
					} else {
						throw new Error('作品不存在');
					}
				} else {
					throw new Error('获取作品列表失败');
				}
			} catch (error) {
				console.error('❌ 获取作品详情失败:', error);
				uni.showToast({
					title: error.message || '加载失败',
					icon: 'none'
				});
				// 延迟后返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			} finally {
				uni.hideLoading();
			}
		},
		generateWaveform() {
			// 生成随机波形图高度
			const barCount = 40; // 波形图柱子数量
			const heights = [];
			
			for (let i = 0; i < barCount; i++) {
				// 生成8-72之间的随机高度
				let height;
				if (i < 5 || i > barCount - 5) {
					// 两端高度较低
					height = Math.floor(Math.random() * 20) + 8;
				} else if (i > 10 && i < barCount - 10) {
					// 中间高度较高
					height = Math.floor(Math.random() * 40) + 32;
				} else {
					// 过渡区域
					height = Math.floor(Math.random() * 30) + 20;
				}
				heights.push(height);
			}
			
			this.waveformHeights = heights;
		},
		loadSimilarMusic() {
			// 模拟加载相似推荐
			this.similarMusic = [
				{
					id: 's1',
					title: '海浪声音',
					style: '环境',
					duration: '2:30',
					coverUrl: '/static/img/covers/cover1.jpg'
				},
				{
					id: 's2',
					title: '电子节拍',
					style: '电子',
					duration: '3:15',
					coverUrl: '/static/img/covers/cover1.jpg'
				}
			];
		},
		togglePlay() {
			if (this.isPlaying) {
				this.audioContext.pause();
			} else {
				this.audioContext.play();
			}
			this.isPlaying = !this.isPlaying;
		},
		toggleFavorite() {
			this.isFavorite = !this.isFavorite;
			
			const message = this.isFavorite ? '已收藏' : '已取消收藏';
			uni.showToast({
				title: message,
				icon: 'none'
			});
		},
		formatTime(seconds) {
			const min = Math.floor(seconds / 60);
			const sec = Math.floor(seconds % 60);
			return `${min}:${sec.toString().padStart(2, '0')}`;
		},
		formatDate(date) {
			if (!date) return '';
			const d = new Date(date);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		},
		handlePrev() {
			// 在实际应用中，这里可以切换到上一首歌
			uni.showToast({
				title: '这是第一首作品',
				icon: 'none'
			});
		},
		handleNext() {
			// 在实际应用中，这里可以切换到下一首歌
			uni.showToast({
				title: '这是最后一首作品',
				icon: 'none'
			});
		},
		editMusic() {
			uni.showToast({
				title: '音乐编辑功能开发中',
				icon: 'none'
			});
		},
		shareWork() {
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
		},
		// 下载作品 - 使用微信小程序官方API
		downloadWork() {
			if (!this.workDetail.audioUrl) {
				uni.showToast({
					title: '音频文件不存在',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '下载中...'
			});
			
			// 使用微信小程序官方 wx.downloadFile API
			wx.downloadFile({
				url: this.workDetail.audioUrl,
				success: (res) => {
					if (res.statusCode === 200) {
						// 下载成功，保存文件
						wx.saveFile({
							tempFilePath: res.tempFilePath,
							success: (saveRes) => {
								uni.hideLoading();
								uni.showToast({
									title: '下载成功',
									icon: 'success'
								});
								console.log('✅ 文件已保存到:', saveRes.savedFilePath);
							},
							fail: (err) => {
								uni.hideLoading();
								uni.showToast({
									title: '保存失败',
									icon: 'none'
								});
								console.error('❌ 保存文件失败:', err);
							}
						});
					} else {
						uni.hideLoading();
						uni.showToast({
							title: '下载失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					uni.hideLoading();
					uni.showToast({
						title: '下载失败',
						icon: 'none'
					});
					console.error('❌ 下载文件失败:', err);
				}
			});
		},
		showActionSheet() {
			uni.showActionSheet({
				itemList: ['重命名', '删除作品'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 重命名
						uni.showToast({
							title: '重命名功能开发中',
							icon: 'none'
						});
					} else if (res.tapIndex === 1) {
						// 删除
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
						
						// 模拟删除过程
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							
							// 返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}, 1000);
					}
				}
			});
		},
		viewMoreSimilar() {
			uni.showToast({
				title: '查看更多推荐功能开发中',
				icon: 'none'
			});
		},
		playSimilar(item) {
			uni.showToast({
				title: `播放${item.title}`,
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 50rpx;
}

.header {
	position: relative;
	padding: 90rpx 30rpx 20rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.back-button {
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.action-buttons-header {
	display: flex;
	align-items: center;
}

.share-button-header {
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.more-button {
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.iconfont {
	font-size: 40rpx;
	color: #FFFFFF;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.content {
	padding: 30rpx;
}

/* 音乐封面和基本信息 */
.music-cover-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.cover-container {
	width: 480rpx;
	height: 480rpx;
	margin-bottom: 30rpx;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 16rpx 48rpx rgba(11, 103, 236, 0.3);
	position: relative;
}

.cover-image {
	width: 100%;
	height: 100%;
}

.music-basic-info {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.music-title {
	font-size: 40rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 10rpx;
}

.music-style {
	font-size: 28rpx;
	color: #ACACAC;
	margin-bottom: 16rpx;
}

.music-meta {
	display: flex;
	align-items: center;
}

.creation-date, .duration {
	font-size: 24rpx;
	color: #787878;
}

.meta-divider {
	margin: 0 10rpx;
	color: #787878;
	font-size: 24rpx;
}

/* 播放控制 */
.playback-control {
	margin-bottom: 60rpx;
}

.time-progress {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.current-time, .total-time {
	font-size: 24rpx;
	color: #787878;
	width: 60rpx;
}

.progress-bar {
	flex: 1;
	height: 8rpx;
	background-color: #3D3D3D;
	border-radius: 4rpx;
	margin: 0 16rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}

.waveform {
	display: flex;
	align-items: flex-end;
	height: 120rpx;
	padding: 10rpx;
	background-color: rgba(18, 18, 18, 0.5);
	border-radius: 16rpx;
	margin-bottom: 40rpx;
	justify-content: space-between;
	position: relative;
}

.waveform::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(90deg, rgba(11, 103, 236, 0.05) 0%, rgba(115, 66, 204, 0.05) 100%);
	pointer-events: none;
	border-radius: 16rpx;
}

.waveform-bar {
	width: 6rpx;
	background: linear-gradient(180deg, #0B67EC 0%, #7342CC 100%);
	margin: 0 2rpx;
	border-radius: 3rpx;
	transition: height 0.3s ease;
	box-shadow: 0 0 16rpx rgba(11, 103, 236, 0.3);
}

.control-buttons {
	display: flex;
	justify-content: center;
	align-items: center;
}

.control-button {
	width: 96rpx;
	height: 96rpx;
	border-radius: 48rpx;
	background-color: #2D2D2D;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 30rpx;
}

.play-button {
	width: 128rpx;
	height: 128rpx;
	border-radius: 64rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(11, 103, 236, 0.3);
}

.play-button .iconfont {
	font-size: 60rpx;
}

/* 功能按钮 */
.function-buttons {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20rpx;
	margin-bottom: 60rpx;
}

.function-button {
	background-color: #1E1E1E;
	border-radius: 24rpx;
	padding: 24rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.function-icon {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
}

.function-icon.active .iconfont {
	color: #3B7EFF;
}

.function-text {
	font-size: 24rpx;
	color: #ACACAC;
}

/* 音乐信息 */
.music-info-section {
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 30rpx;
	margin-bottom: 60rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 30rpx;
	display: block;
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30rpx;
}

.info-item {
	display: flex;
	flex-direction: column;
}

.info-label {
	font-size: 24rpx;
	color: #787878;
	margin-bottom: 8rpx;
}

.info-value {
	font-size: 28rpx;
	color: #FFFFFF;
}

/* 相似推荐 */
.similar-section {
	margin-bottom: 40rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.view-more {
	font-size: 28rpx;
	color: #3B7EFF;
}

.similar-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 30rpx;
}

.similar-item {
	background-color: #1E1E1E;
	border-radius: 24rpx;
	overflow: hidden;
}

.similar-cover {
	position: relative;
	height: 180rpx;
}

.similar-image {
	width: 100%;
	height: 100%;
}

.play-icon {
	// position: absolute;
	// right: 16rpx;
	// bottom: 16rpx;
	width: 56rpx;
	height: 56rpx;
	border-radius: 28rpx;
	// background-color: rgba(18, 18, 18, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 4rpx;
}
.play-icon-similar{
	position: absolute;
	right: 16rpx;
	bottom: 16rpx;
	background-color: rgba(18, 18, 18, 0.7);
	border-radius: 28rpx;
	width: 56rpx;
	height: 56rpx;
	display: flex;
    justify-content: center;
    align-items: center;
}

.play-icon .iconfont {
	font-size: 24rpx;
}

.similar-info {
	padding: 16rpx;
	display: flex;
    flex-direction: column;
}

.similar-title {
	font-size: 28rpx;
	color: #FFFFFF;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.similar-meta {
	font-size: 24rpx;
	color: #787878;
	line-height: 20rpx;
}

/* 导航栏图标 */
.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.share-icon, .more-icon {
	width: 40rpx;
	height: 40rpx;
}

/* 音乐控制器图标 */
.control-icon {
	width: 40rpx;
	height: 40rpx;
}

.play-icon, .pause-icon {
	width: 40rpx;
	height: 40rpx;
}

/* 功能栏图标 */
.function-img {
	width: 40rpx;
	height: 40rpx;
}

/* 相关作品图标 */
.play-button .play-icon {
	width: 40rpx;
	height: 40rpx;
}
</style> 