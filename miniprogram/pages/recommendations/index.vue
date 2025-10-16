<template>
	<view class="container">
		
		<!-- 分类筛选 -->
		<view class="category-container">
			<scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
				<view 
					v-for="(category, index) in categories" 
					:key="index" 
					class="category-pill" 
					:class="{ active: currentCategory === category.id }"
					@click="switchCategory(category.id)"
				>
					<text>{{category.name}}</text>
				</view>
			</scroll-view>
		</view>
		
		<!-- 推荐内容区域 -->
		<scroll-view class="content-scroll" scroll-y="true">
			<!-- 本周热门 -->
			<view class="section">
				<text class="section-title">本周热门</text>
				
				<view class="music-grid">
					<view 
						v-for="(item, index) in weeklyHot" 
						:key="index" 
						class="music-card"
						@click="playMusic(item)"
					>
						<view class="card-cover" :style="{ backgroundImage: 'url(' + item.coverUrl + ')' }">
							<view class="play-button">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="card-info">
							<text class="music-title">{{item.title}}</text>
							<text class="music-author">创作者：{{item.author}}</text>
							<view class="card-footer">
								<text class="play-count">播放 {{formatPlayCount(item.playCount)}}</text>
								<view v-if="item.isHot" class="wave-animation">
									<view class="wave-bar" v-for="n in 5" :key="n"></view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 精选推荐 -->
			<view class="section">
				<text class="section-title">精选推荐</text>
				
				<view class="music-grid">
					<view 
						v-for="(item, index) in featured" 
						:key="index" 
						class="music-card"
						@click="playMusic(item)"
					>
						<view class="card-cover" :style="{ backgroundImage: 'url(' + item.coverUrl + ')' }">
							<view class="play-button">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="card-info">
							<text class="music-title">{{item.title}}</text>
							<text class="music-author">创作者：{{item.author}}</text>
							<view class="card-footer">
								<text class="play-count">播放 {{formatPlayCount(item.playCount)}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 新人作品 -->
			<view class="section">
				<text class="section-title">新人作品</text>
				
				<view class="music-grid">
					<view 
						v-for="(item, index) in newArtists" 
						:key="index" 
						class="music-card"
						@click="playMusic(item)"
					>
						<view class="card-cover" :style="{ backgroundImage: 'url(' + item.coverUrl + ')' }">
							<view class="play-button">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="card-info">
							<text class="music-title">{{item.title}}</text>
							<text class="music-author">创作者：{{item.author}}</text>
							<view class="card-footer">
								<text class="play-count">播放 {{formatPlayCount(item.playCount)}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentCategory: 'all',
			categories: [
				{ id: 'all', name: '全部' },
				{ id: 'pop', name: '流行' },
				{ id: 'electronic', name: '电子' },
				{ id: 'rock', name: '摇滚' },
				{ id: 'folk', name: '民谣' },
				{ id: 'hiphop', name: '嘻哈' },
				{ id: 'classical', name: '古典' }
			],
			weeklyHot: [
				{
					id: 'hot1',
					title: '夏日晚风',
					author: '小明',
					coverUrl: '/static/img/covers/cover1.jpg',
					playCount: 12000,
					isHot: true
				},
				{
					id: 'hot2',
					title: '城市霓虹',
					author: '小红',
					coverUrl: '/static/img/covers/cover2.jpg',
					playCount: 8500,
					isHot: false
				},
				{
					id: 'hot3',
					title: '雨后彩虹',
					author: '阿杰',
					coverUrl: '/static/img/covers/cover3.jpg',
					playCount: 6700,
					isHot: false
				},
				{
					id: 'hot4',
					title: '电子梦境',
					author: 'DJ小王',
					coverUrl: '/static/img/covers/cover4.jpg',
					playCount: 5300,
					isHot: false
				}
			],
			featured: [
				{
					id: 'feat1',
					title: '青春回忆',
					author: '小李',
					coverUrl: '/static/img/covers/cover5.jpg',
					playCount: 4800
				},
				{
					id: 'feat2',
					title: '星空漫步',
					author: '星辰',
					coverUrl: '/static/img/covers/cover6.jpg',
					playCount: 3900
				},
				{
					id: 'feat3',
					title: '心跳节奏',
					author: '节拍大师',
					coverUrl: '/static/img/covers/cover7.jpg',
					playCount: 3200
				},
				{
					id: 'feat4',
					title: '海浪声音',
					author: '海风',
					coverUrl: '/static/img/covers/cover8.jpg',
					playCount: 2800
				}
			],
			newArtists: [
				{
					id: 'new1',
					title: '第一首歌',
					author: '新手小张',
					coverUrl: '/static/img/covers/cover9.jpg',
					playCount: 856
				},
				{
					id: 'new2',
					title: '尝试创作',
					author: '音乐小白',
					coverUrl: '/static/img/covers/cover10.jpg',
					playCount: 723
				}
			]
		}
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		switchCategory(categoryId) {
			this.currentCategory = categoryId;
			
			// 模拟请求数据
			uni.showLoading({
				title: '加载中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				// 实际应用中这里应该根据分类过滤数据
			}, 500);
		},
		formatPlayCount(count) {
			if (count >= 10000) {
				return (count / 10000).toFixed(1) + '万';
			} else if (count >= 1000) {
				return (count / 1000).toFixed(1) + '千';
			}
			return count;
		},
		playMusic(item) {
			// 显示正在播放的提示
			uni.showToast({
				title: `正在播放: ${item.title}`,
				icon: 'none'
			});
			
			// 跳转到音乐详情页
			uni.navigateTo({
				url: `/pages/user/work-detail?id=${item.id}`
			});
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	display: flex;
	flex-direction: column;
}

/* 导航栏样式 */
.navbar {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	padding: 20rpx 30rpx;
}

.left {
	position: absolute;
	left: 30rpx;
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	width: 40rpx;
	height: 40rpx;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 分类筛选样式 */
.category-container {
	padding: 0 30rpx;
	margin-bottom: 30rpx;
}

.category-scroll {
	white-space: nowrap;
	width: 100%;
}

.category-pill {
	display: inline-block;
	padding: 12rpx 24rpx;
	border-radius: 48rpx;
	font-size: 28rpx;
	color: #ACACAC;
	background-color: #2D2D2D;
	margin-right: 16rpx;
}

.category-pill.active {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	font-weight: 500;
}

/* 内容区域样式 */
.content-scroll {
	flex: 1;
	padding: 0 30rpx;
}

.section {
	margin-bottom: 40rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 20rpx;
	display: block;
}

.music-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	grid-gap: 20rpx;
}

.music-card {
	background-color: #1E1E1E;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(11, 103, 236, 0.2);
}

.card-cover {
	height: 240rpx;
	background-size: cover;
	background-position: center;
	position: relative;
}

.play-button {
	position: absolute;
	right: 16rpx;
	bottom: 16rpx;
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	background-color: #0B67EC;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}

.play-button .play-icon {
	width: 40rpx;
	height: 40rpx;
}

.card-info {
	padding: 20rpx;
}

.music-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
	display: block;
}

.music-author {
	font-size: 24rpx;
	color: #ACACAC;
	margin-bottom: 16rpx;
	display: block;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.play-count {
	font-size: 24rpx;
	color: #787878;
}

.wave-animation {
	height: 30rpx;
	display: flex;
	align-items: center;
}

.wave-bar {
	width: 6rpx;
	height: 6rpx;
	margin: 0 2rpx;
	background: linear-gradient(to bottom, #0B67EC, #7342CC);
	border-radius: 3rpx;
	animation: wave 1.2s ease-in-out infinite;
}

@keyframes wave {
	0%, 100% { height: 6rpx; }
	50% { height: 30rpx; }
}

.wave-bar:nth-child(1) { animation-delay: 0.0s; }
.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

.play-icon {
	width: 40rpx;
	height: 40rpx;
}
</style> 