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
			categories: [],
			weeklyHot: [],
			featured: [],
			newArtists: [],
			loading: false
		}
	},
	onLoad() {
		this.loadCategories()
		this.loadRecommendations()
	},
	methods: {
		async loadCategories() {
			try {
				const res = await this.$minApi.getRecommendationCategories()
				if (res.code === 200 && res.data) {
					// 将API返回的分类数据映射为页面需要的格式
					this.categories = res.data.map(item => ({
						id: item.code,
						name: item.name
					}))
					console.log('分类加载成功，共', this.categories.length, '个')
				}
			} catch (error) {
				console.error('加载分类失败:', error)
				// 失败时使用默认分类
				this.categories = [
					{ id: 'all', name: '全部' }
				]
			}
		},
		async loadRecommendations() {
			if (this.loading) return
			
			this.loading = true
			uni.showLoading({
				title: '加载中...'
			})
			
			try {
				// 获取热门推荐列表 - 使用公开的list接口
				const params = this.currentCategory === 'all' ? {} : { category: this.currentCategory }
				const res = await this.$minApi.getHotRecommendations(params)
				
				if (res.code === 200 && res.data) {
					const allData = Array.isArray(res.data) ? res.data : []
					
					// 转换数据格式，适配前端显示
					const formattedData = allData.map(item => ({
						id: item.id,
						title: item.title,
						author: item.artist || '未知艺术家',
						coverUrl: item.coverUrl,
						audioUrl: item.audioUrl,
						playCount: item.playCount || 0,
						duration: item.duration,
						category: item.category,
						isHot: item.playCount > 5000
					}))
					
					// 分配到不同分组
					// 本周热门：播放量前4的
					this.weeklyHot = formattedData
						.sort((a, b) => b.playCount - a.playCount)
						.slice(0, 4)
					
					// 精选推荐：播放量5-8名的
					this.featured = formattedData
						.sort((a, b) => b.playCount - a.playCount)
						.slice(4, 8)
					
					// 新人作品：播放量较低的后面几个
					this.newArtists = formattedData
						.sort((a, b) => a.playCount - b.playCount)
						.slice(0, 2)
				}
			} catch (error) {
				console.error('加载推荐失败:', error)
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			} finally {
				this.loading = false
				uni.hideLoading()
			}
		},
		navigateBack() {
			uni.navigateBack();
		},
		switchCategory(categoryId) {
			this.currentCategory = categoryId
			this.loadRecommendations()
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