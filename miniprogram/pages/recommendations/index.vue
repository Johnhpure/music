<template>
	<view class="recommendations-container">
		<!-- 顶部导航 -->
		<view class="nav-header">
			<view class="nav-back" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="nav-title">热门推荐</text>
			<view class="nav-search" @click="showSearch">
				<text class="search-icon">🔍</text>
			</view>
		</view>

		<!-- 分类标签 -->
		<view class="category-section">
			<scroll-view class="category-scroll" scroll-x enable-flex>
				<view class="category-item" 
					  v-for="(category, index) in categories" 
					  :key="category.id" 
					  :class="{ active: selectedCategory === category.id }"
					  @click="selectCategory(category.id)">
					<text class="category-text">{{category.name}}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 音乐列表 -->
		<scroll-view class="music-scroll" scroll-y @scrolltolower="loadMore">
			<view class="music-list">
				<view class="music-item" 
					  v-for="(item, index) in musicList" 
					  :key="item.id" 
					  @click="viewMusicDetail(item)">
					<view class="music-rank">
						<text class="rank-number">{{ index + 1 }}</text>
					</view>
					<view class="music-cover">
						<image :src="item.coverUrl" mode="aspectFill" @error="onMusicCoverError(item, index)"></image>
						<!-- 热门标识 -->
						<view v-if="item.isHot" class="hot-badge">
							<text class="hot-text">热门</text>
						</view>
					</view>
					<view class="music-info">
						<view class="music-header">
							<text class="music-title">{{item.title}}</text>
							<text class="music-meta">{{item.artist}} · {{item.genre}}</text>
						</view>
						<view class="music-footer">
							<view class="music-tags">
								<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{tag}}</text>
							</view>
							<view class="music-stats">
								<view class="play-count">
									<text class="play-icon">▶</text>
									<text class="count-text">{{ formatPlayCount(item.playCount) }}</text>
								</view>
								<view class="duration">
									<text class="duration-text">{{ item.duration }}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="music-actions">
						<view class="action-btn" @click.stop="previewMusicByIndex(index)">
							<image src="/static/img/icon/play.svg" class="action-icon"></image>
						</view>
						<view class="action-btn" @click.stop="likeMusicByIndex(index)">
							<text class="like-icon" :class="{ liked: item.isLiked }">♥</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载更多提示 -->
			<view class="load-more" v-if="loading">
				<text class="load-text">加载中...</text>
			</view>
			<view class="load-end" v-if="isEnd">
				<text class="end-text">没有更多了</text>
			</view>
		</scroll-view>

		<!-- 搜索弹窗 -->
		<view class="search-modal" v-if="showSearchModal" @click="hideSearch">
			<view class="search-content" @click.stop>
				<view class="search-input-area">
					<input class="search-input" 
						   v-model="searchKeyword" 
						   placeholder="搜索音乐、艺术家..."
						   @input="onSearchInput"
						   @confirm="doSearch" />
					<view class="search-btn" @click="doSearch">
						<text>搜索</text>
					</view>
				</view>
				<view class="search-history" v-if="searchHistory.length > 0">
					<text class="history-title">搜索历史</text>
					<view class="history-tags">
						<text class="history-tag" 
							  v-for="(item, index) in searchHistory" 
							  :key="index"
							  @click="searchByHistory(item)">{{item}}</text>
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
				// 分类数据
				categories: [
					{ id: 'all', name: '全部' },
					{ id: 'pop', name: '流行' },
					{ id: 'electronic', name: '电子' },
					{ id: 'folk', name: '民谣' },
					{ id: 'rock', name: '摇滚' },
					{ id: 'classical', name: '古典' },
					{ id: 'jazz', name: '爵士' }
				],
				selectedCategory: 'all',
				
				// 音乐列表数据
				musicList: [],
				loading: false,
				isEnd: false,
				page: 1,
				pageSize: 20,
				
				// 搜索相关
				showSearchModal: false,
				searchKeyword: '',
				searchHistory: [],
				
				// 默认数据
				defaultMusicList: []
			}
		},
		
		async onLoad(options) {
			// 获取分类参数
			if (options.category) {
				this.selectedCategory = options.category;
			}
			
			// 加载分类数据
			await this.loadCategories();
			
			// 加载音乐列表
			await this.loadMusicList();
			
			// 加载搜索历史
			this.loadSearchHistory();
		},
		
		methods: {
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			
			// 显示搜索
			showSearch() {
				this.showSearchModal = true;
			},
			
			// 隐藏搜索
			hideSearch() {
				this.showSearchModal = false;
			},
			
			// 选择分类
			async selectCategory(categoryId) {
				if (this.selectedCategory === categoryId) return;
				
				this.selectedCategory = categoryId;
				this.page = 1;
				this.isEnd = false;
				this.musicList = [];
				
				await this.loadMusicList();
			},
			
			// 加载分类数据
			async loadCategories() {
				try {
					const response = await this.$minApi.getRecommendationCategories();
					if (response.code === 200 && response.data) {
						this.categories = [
							{ id: 'all', name: '全部' },
							...response.data.map(cat => ({
								id: cat.id,
								name: cat.name
							}))
						];
					}
				} catch (error) {
					console.error('获取分类失败:', error);
				}
			},
			
			// 加载音乐列表
			async loadMusicList() {
				if (this.loading) return;
				this.loading = true;
				
				try {
					let response;
					if (this.selectedCategory === 'all') {
						response = await this.$minApi.getHotRecommendations({
							page: this.page,
							pageSize: this.pageSize
						});
					} else {
						response = await this.$minApi.getRecommendationsByCategory(this.selectedCategory, {
							page: this.page,
							pageSize: this.pageSize
						});
					}
					
					if (response.code === 200 && response.data) {
						const newList = response.data.map(music => ({
							id: music.id,
							title: music.title,
							artist: music.artist || "未知艺术家",
							genre: music.genre || "流行",
							duration: music.duration || "3:30",
							// 如果API返回的是/uploads路径，替换为本地静态文件路径
							coverUrl: music.coverUrl && music.coverUrl.startsWith('/uploads/') 
								? music.coverUrl.replace('/uploads/', '/static/img/')
								: (music.coverUrl || "/static/img/covers/default.jpg"),
							playCount: music.playCount || 0,
							tags: music.tags || [],
							category: music.category || "流行",
							isHot: music.isHot !== false,
							isLiked: music.isLiked || false
						}));
						
						if (this.page === 1) {
							this.musicList = newList;
						} else {
							this.musicList = [...this.musicList, ...newList];
						}
						
						this.isEnd = newList.length < this.pageSize;
					} else {
						console.log('API返回空数据');
						if (this.page === 1) {
							this.musicList = [];
						}
						this.isEnd = true;
					}
				} catch (error) {
					console.error('获取音乐列表失败:', error);
					if (this.page === 1) {
						this.musicList = [];
					}
					this.isEnd = true;
				} finally {
					this.loading = false;
				}
			},
			
			// 加载更多
			async loadMore() {
				if (this.loading || this.isEnd) return;
				
				this.page++;
				await this.loadMusicList();
			},
			
			// 查看音乐详情
			viewMusicDetail(item) {
				console.log('查看音乐详情:', item.title);
				
				// 记录点击统计
				this.trackMusicClick(item.id);
				
				uni.navigateTo({
					url: `/pages/user/work-detail?id=${item.id}&title=${encodeURIComponent(item.title)}&artist=${encodeURIComponent(item.artist)}`
				});
			},
			
			// 预览播放音乐
			previewMusic(item) {
				console.log('预览播放音乐:', item.title);
				
				// 记录播放统计
				this.trackMusicPlay(item.id);
				
				uni.showToast({
					title: `播放 ${item.title}`,
					icon: 'none'
				});
			},

			// 通过索引预览播放音乐（解决小程序事件参数传递问题）
			previewMusicByIndex(index) {
				// 获取音乐数据
				const item = this.musicList[index];
				
				// 参数检查，防止undefined错误
				if (!item || !item.title || !item.id) {
					console.error('❌ previewMusicByIndex: 参数不完整:', { index, item });
					uni.showToast({
						title: '数据加载中，请稍后再试',
						icon: 'none'
					});
					return;
				}
				
				console.log('🎵 预览播放音乐:', item.title);
				
				// 记录音乐播放统计
				this.trackMusicPlay(item.id);
				
				uni.showToast({
					title: `播放 ${item.title}`,
					icon: 'none'
				});
			},
			
			// 喜欢音乐
			async likeMusic(item) {
				try {
					// 切换喜欢状态
					item.isLiked = !item.isLiked;
					
					// 调用API
					await this.$minApi.toggleMusicLike({
						musicId: item.id,
						isLiked: item.isLiked
					});
					
					uni.showToast({
						title: item.isLiked ? '已添加到喜欢' : '已取消喜欢',
						icon: 'none'
					});
				} catch (error) {
					// 失败时恢复状态
					item.isLiked = !item.isLiked;
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
				}
			},

			// 通过索引喜欢音乐（解决小程序事件参数传递问题）
			async likeMusicByIndex(index) {
				// 获取音乐数据
				const item = this.musicList[index];
				
				if (!item || !item.id) {
					console.error('❌ likeMusicByIndex: 参数不完整:', { index, item });
					uni.showToast({
						title: '数据加载中，请稍后再试',
						icon: 'none'
					});
					return;
				}
				
				try {
					// 切换喜欢状态
					item.isLiked = !item.isLiked;
					this.$set(this.musicList, index, item);
					
					// 调用API
					await this.$minApi.toggleMusicLike({
						musicId: parseInt(item.id) || 0,
						isLiked: item.isLiked
					});
					
					uni.showToast({
						title: item.isLiked ? '已添加到喜欢' : '已取消喜欢',
						icon: 'none'
					});
				} catch (error) {
					// 失败时恢复状态
					item.isLiked = !item.isLiked;
					this.$set(this.musicList, index, item);
					uni.showToast({
						title: '操作失败',
						icon: 'none'
					});
				}
			},
			
			// 搜索输入
			onSearchInput() {
				// 实时搜索提示可以在这里实现
			},
			
			// 执行搜索
			async doSearch() {
				if (!this.searchKeyword.trim()) return;
				
				// 保存搜索历史
				this.saveSearchHistory(this.searchKeyword);
				
				// 执行搜索
				this.page = 1;
				this.isEnd = false;
				this.musicList = [];
				this.selectedCategory = 'all';
				
				try {
					const response = await this.$minApi.searchMusic({
						keyword: this.searchKeyword,
						page: this.page,
						pageSize: this.pageSize
					});
					
					if (response.code === 200 && response.data) {
						this.musicList = response.data.map(music => ({
							id: music.id,
							title: music.title,
							artist: music.artist || "未知艺术家",
							genre: music.genre || "流行",
							duration: music.duration || "3:30",
							// 如果API返回的是/uploads路径，替换为本地静态文件路径
						coverUrl: music.coverUrl && music.coverUrl.startsWith('/uploads/') 
							? music.coverUrl.replace('/uploads/', '/static/img/')
							: (music.coverUrl || "/static/img/covers/default.jpg"),
							playCount: music.playCount || 0,
							tags: music.tags || [],
							category: music.category || "流行",
							isHot: music.isHot !== false,
							isLiked: music.isLiked || false
						}));
					}
				} catch (error) {
					console.error('搜索失败:', error);
					uni.showToast({
						title: '搜索失败',
						icon: 'none'
					});
				}
				
				this.hideSearch();
			},
			
			// 通过历史搜索
			searchByHistory(keyword) {
				this.searchKeyword = keyword;
				this.doSearch();
			},
			
			// 保存搜索历史
			saveSearchHistory(keyword) {
				const history = this.searchHistory.filter(item => item !== keyword);
				history.unshift(keyword);
				this.searchHistory = history.slice(0, 10); // 最多保存10条
				
				uni.setStorageSync('searchHistory', this.searchHistory);
			},
			
			// 加载搜索历史
			loadSearchHistory() {
				try {
					const history = uni.getStorageSync('searchHistory');
					if (history) {
						this.searchHistory = history;
					}
				} catch (error) {
					console.log('加载搜索历史失败:', error);
				}
			},
			
			// 封面加载错误处理
			onMusicCoverError(music, index) {
				// 参数检查，防止undefined错误
				if (!music) {
					console.error('❌ onMusicCoverError: music参数为undefined');
					return;
				}
				
				console.warn('音乐封面加载失败:', music.coverUrl);
				this.$set(this.musicList, index, {
					...music,
					coverUrl: "/static/img/covers/default.jpg"
				});
			},
			
			// 格式化播放次数
			formatPlayCount(count) {
				if (typeof count === 'string') return count;
				if (count >= 1000000) {
					return Math.floor(count / 100000) / 10 + 'M';
				} else if (count >= 1000) {
					return Math.floor(count / 100) / 10 + 'k';
				} else {
					return count.toString();
				}
			},
			
			// 记录音乐点击统计
			async trackMusicClick(musicId) {
				try {
					await this.$minApi.trackMusicPlay({
						musicId: parseInt(musicId) || 0,
						action: 'click',
						timestamp: new Date().toISOString()
					});
				} catch (error) {
					console.log('音乐点击统计失败:', error);
				}
			},
			
			// 记录音乐播放统计
			async trackMusicPlay(musicId) {
				try {
					await this.$minApi.trackMusicPlay({
						musicId: parseInt(musicId) || 0,
						action: 'play',
						timestamp: new Date().toISOString()
					});
				} catch (error) {
					console.log('音乐播放统计失败:', error);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.recommendations-container {
		min-height: 100vh;
		background-color: #000000;
		color: #FFFFFF;
	}

	/* 顶部导航 */
	.nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 16rpx;
		background-color: #1E1E1E;
		border-bottom: 1rpx solid #2D2D2D;
	}

	.nav-back, .nav-search {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background-color: #2D2D2D;
	}

	.back-icon, .search-icon {
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #FFFFFF;
	}

	/* 分类标签 */
	.category-section {
		padding: 20rpx 0;
		background-color: #1E1E1E;
		border-bottom: 1rpx solid #2D2D2D;
	}

	.category-scroll {
		white-space: nowrap;
		padding: 0 16rpx;
	}

	.category-item {
		display: inline-block;
		padding: 12rpx 24rpx;
		margin-right: 16rpx;
		background-color: #2D2D2D;
		border-radius: 24rpx;
		transition: all 0.2s;
	}

	.category-item.active {
		background: linear-gradient(135deg, #36D1A6 0%, #0B67EC 100%);
	}

	.category-text {
		font-size: 26rpx;
		color: #FFFFFF;
	}

	/* 音乐列表 */
	.music-scroll {
		height: calc(100vh - 240rpx);
	}

	.music-list {
		padding: 0 16rpx;
	}

	.music-item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #2D2D2D;
	}

	.music-rank {
		width: 60rpx;
		text-align: center;
		margin-right: 16rpx;
	}

	.rank-number {
		font-size: 28rpx;
		font-weight: 600;
		color: #ACACAC;
	}

	.music-cover {
		width: 100rpx;
		height: 100rpx;
		border-radius: 12rpx;
		overflow: hidden;
		margin-right: 16rpx;
		position: relative;
	}

	.hot-badge {
		position: absolute;
		top: 4rpx;
		right: 4rpx;
		background-color: rgba(255, 107, 107, 0.9);
		border-radius: 8rpx;
		padding: 2rpx 6rpx;
	}

	.hot-text {
		font-size: 18rpx;
		color: #FFFFFF;
		font-weight: 500;
	}

	.music-info {
		flex: 1;
		margin-right: 16rpx;
	}

	.music-header {
		margin-bottom: 8rpx;
	}

	.music-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #FFFFFF;
		display: block;
		margin-bottom: 4rpx;
	}

	.music-meta {
		font-size: 22rpx;
		color: #ACACAC;
	}

	.music-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.music-tags {
		display: flex;
		flex-wrap: wrap;
	}

	.tag {
		font-size: 20rpx;
		color: #ACACAC;
		background-color: #2D2D2D;
		border-radius: 12rpx;
		padding: 2rpx 8rpx;
		margin-right: 8rpx;
		margin-bottom: 4rpx;
	}

	.music-stats {
		display: flex;
		align-items: center;
	}

	.play-count, .duration {
		display: flex;
		align-items: center;
		margin-left: 16rpx;
	}

	.play-icon {
		font-size: 18rpx;
		color: #ACACAC;
		margin-right: 4rpx;
	}

	.count-text, .duration-text {
		font-size: 20rpx;
		color: #ACACAC;
	}

	.music-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.action-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8rpx;
	}

	.action-icon {
		width: 32rpx;
		height: 32rpx;
	}

	.like-icon {
		font-size: 32rpx;
		color: #ACACAC;
		transition: all 0.2s;
	}

	.like-icon.liked {
		color: #FF6B6B;
	}

	/* 加载提示 */
	.load-more, .load-end {
		text-align: center;
		padding: 40rpx 0;
	}

	.load-text, .end-text {
		font-size: 24rpx;
		color: #ACACAC;
	}

	/* 搜索弹窗 */
	.search-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 200rpx;
		z-index: 1000;
	}

	.search-content {
		width: 680rpx;
		background-color: #1E1E1E;
		border-radius: 20rpx;
		padding: 40rpx;
	}

	.search-input-area {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.search-input {
		flex: 1;
		height: 80rpx;
		background-color: #2D2D2D;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		margin-right: 20rpx;
	}

	.search-btn {
		width: 120rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #36D1A6 0%, #0B67EC 100%);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.search-history {
		
	}

	.history-title {
		font-size: 24rpx;
		color: #ACACAC;
		margin-bottom: 20rpx;
	}

	.history-tags {
		display: flex;
		flex-wrap: wrap;
	}

	.history-tag {
		font-size: 24rpx;
		color: #ACACAC;
		background-color: #2D2D2D;
		border-radius: 16rpx;
		padding: 8rpx 16rpx;
		margin-right: 12rpx;
		margin-bottom: 12rpx;
	}
</style>
