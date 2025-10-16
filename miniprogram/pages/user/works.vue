<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="navbar">
			<view class="left"></view>
			<view class="title">我的作品</view>
			<view class="right" @click="toggleManageMode">
				<text>{{isManageMode ? '完成' : '管理'}}</text>
			</view>
		</view>
		
		<!-- 搜索和筛选区域 -->
		<view class="search-filter">
			<view class="search-box">
				<image src="/static/img/icon/search.svg" class="search-icon"></image>
				<input type="text" v-model="searchText" placeholder="搜索作品" placeholder-class="search-placeholder" confirm-type="search" />
			</view>
			<view class="filter-btn" @click="toggleFilter">
				<image src="/static/img/icon/filter.svg" class="filter-icon"></image>
			</view>
		</view>
		
		<!-- 云端存储提示 -->
		<view class="storage-tip">
			<text class="tip-icon">ℹ️</text>
			<text class="tip-text">云端作品保存3个月后将自动删除，请及时下载重要作品</text>
		</view>
		
		<!-- 过期作品提醒 -->
		<view class="expiring-notice" v-if="expiringWorks.length > 0">
			<view class="notice-content">
				<text class="notice-icon">⚠️</text>
				<view class="notice-text">
					<text class="notice-title">您有{{expiringWorks.length}}个作品即将过期</text>
					<text class="notice-desc">请及时下载保存您的作品</text>
				</view>
			</view>
			<button class="notice-button" @click="viewExpiringWorks">查看</button>
		</view>
		
		<!-- 作品列表内容 -->
		<view class="content">
			<view v-if="works.length > 0" class="works-list">
				<view class="work-item" v-for="(item, index) in filteredWorks" :key="index" :class="{'swiped': item.showActions}">
					<!-- 选择框（管理模式显示） -->
					<view class="select-box" v-if="isManageMode">
						<checkbox :checked="item.selected" @tap.stop="toggleSelect(item)" color="#3B7EFF"/>
					</view>
					
					<!-- 作品内容 -->
					<view class="work-content" 
						@click="goToDetail(item.id)" 
						@touchstart="touchStart($event, item)" 
						@touchmove="touchMove($event, item)" 
						@touchend="touchEnd($event, item)"
						:style="{transform: item.offsetX ? `translateX(${item.offsetX}px)` : ''}">
						<view class="work-cover">
							<image :src="item.coverUrl" mode="aspectFill"></image>
							<view class="play-button">
								<image :src="item.isPlaying ? '/static/img/icon/pause.svg' : '/static/img/icon/play.svg'" class="play-icon"></image>
							</view>
						</view>
						<view class="work-info">
							<view class="work-header">
								<text class="work-title">{{item.title}}</text>
								<view class="work-status">
									<text class="status-tag" :class="item.isDownloaded ? 'downloaded' : 'cloud'">
										{{item.isDownloaded ? '已下载' : '云端'}}
									</text>
									<view class="play-button" @click.stop="playAudio(item)">
										<image :src="item.isPlaying ? '/static/img/icon/pause.svg' : '/static/img/icon/play.svg'" class="play-icon"></image>
									</view>
								</view>
							</view>
							<view class="work-footer">
								<view class="work-meta">
									<text class="work-date">{{item.createTime}}</text>
									<text class="work-expiring" v-if="item.daysLeft && !item.isDownloaded">
										剩余{{item.daysLeft}}天
									</text>
								</view>
								<view class="work-actions">
									<text class="work-genre">{{item.genre}}</text>
									<view class="share-button1" @click.stop="shareWork(item)">
										<image src="/static/img/icon/share.svg" mode="aspectFit" class="icon-share"></image>
									</view>
								</view>
							</view>
							
							<!-- 音频播放波形（播放中显示） -->
							<view class="wave-animation" v-if="item.isPlaying">
								<view class="wave-bar" v-for="i in 5" :key="i"></view>
							</view>
						</view>
					</view>
					
					<!-- 侧滑操作按钮 -->
					<view class="swipe-actions">
						<view class="action-edit" @click.stop="editWork(item)">
							<image src="/static/img/icon/edit.svg" mode="aspectFit" class="icon-edit"></image>
						</view>
						<view class="action-delete" @click.stop="deleteWork(item)">
							<image src="/static/img/icon/delete.svg" mode="aspectFit" class="icon-delete"></image>
						</view>
					</view>
				</view>
				
				<!-- 加载更多 -->
				<view class="load-more" v-if="hasMoreWorks">
					<text>上拉加载更多</text>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-else class="empty-state">
				<image src="/static/img/empty-works.png" mode="aspectFit"></image>
				<text class="empty-text">您还没有创作作品</text>
				<button class="create-button" @click="goToCreate">开始创作</button>
			</view>
		</view>
		
		<!-- 管理模式底部操作栏 -->
		<view class="batch-actions" v-if="isManageMode">
			<view class="select-all">
				<checkbox :checked="isAllSelected" @tap="toggleSelectAll" color="#3B7EFF"/>
				<text>全选</text>
			</view>
			<view class="action-buttons">
				<button class="download-button" @click="downloadSelected">
					<image src="/static/img/icon/download.svg" class="action-icon"></image>
					<text>下载</text>
				</button>
				<button class="share-button" @click="shareSelected">
					<image src="/static/img/icon/share.svg" class="action-icon"></image>
					<text>分享</text>
				</button>
				<button class="delete-button" @click="deleteSelected">
					<image src="/static/img/icon/delete.svg" class="action-icon"></image>
					<text>删除</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			works: [],
			searchText: '',
			isManageMode: false,
			isAllSelected: false,
			hasMoreWorks: true,
			expiringWorks: [],
			touchStartX: 0,
			touchStartY: 0,
			actionButtonWidth: 160, // 两个操作按钮的总宽度
			currentSwiped: null, // 记录当前处于滑动状态的项目
			viewMode: 'list' // Added for the new view mode
		}
	},
	computed: {
		filteredWorks() {
			if (!this.searchText) return this.works;
			return this.works.filter(work => 
				work.title.toLowerCase().includes(this.searchText.toLowerCase())
			);
		},
		selectedWorksCount() {
			return this.works.filter(work => work.selected).length;
		}
	},
	onLoad() {
		this.getWorksList();
		this.checkExpiringWorks();
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		// 获取作品列表 - 使用真实API
		async getWorksList() {
			try {
				uni.showLoading({ title: '加载中...' });
				
				const response = await this.$minApi.apis.getMusicTasks({
					page: 1,
					pageSize: 50
				});
				
				if (response && response.data) {
					// 转换API数据为页面数据格式
					this.works = response.data.list.map(task => ({
						id: String(task.id),
						title: task.title || '未命名作品',
						coverUrl: task.imageUrl || '/static/img/covers/default.jpg',
						createTime: this.formatDate(task.createdAt),
						duration: this.formatDuration(task.duration),
						isDownloaded: false, // TODO: 需要后端提供下载状态
						daysLeft: this.calculateDaysLeft(task.createdAt),
						isPlaying: false,
						selected: false,
						showActions: false,
						offsetX: 0,
						genre: task.style || '未知',
						audioUrl: task.audioUrl,
						status: task.status
					}));
					
					console.log('✅ 作品列表加载成功:', this.works.length + '首');
				} else {
					console.warn('⚠️ API返回数据格式异常');
					this.works = [];
				}
			} catch (error) {
				console.error('❌ 获取作品列表失败:', error);
				uni.showToast({
					title: '加载失败',
					icon: 'none'
				});
				// 失败时保持空数组，不使用模拟数据
				this.works = [];
			} finally {
				uni.hideLoading();
			}
		},
		// 格式化日期
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		// 格式化时长
		formatDuration(seconds) {
			if (!seconds) return '00:00';
			const min = Math.floor(seconds / 60);
			const sec = Math.floor(seconds % 60);
			return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
		},
		// 计算剩余天数
		calculateDaysLeft(createdAt) {
			if (!createdAt) return 0;
			const created = new Date(createdAt);
			const now = new Date();
			const diffTime = 90 * 24 * 60 * 60 * 1000 - (now - created); // 90天有效期
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays > 0 ? diffDays : 0;
		},
		checkExpiringWorks() {
			// 过滤出即将过期的作品（剩余天数小于7天且未下载的）
			this.expiringWorks = this.works.filter(work => 
				!work.isDownloaded && work.daysLeft && work.daysLeft <= 7
			);
		},
		handleSearch() {
			// 搜索功能，filteredWorks计算属性会处理过滤
		},
		showFilterOptions() {
			// 显示筛选选项
			uni.showActionSheet({
				itemList: ['全部', '已下载', '云端', '即将过期'],
				success: (res) => {
					// 根据选择筛选作品
					const index = res.tapIndex;
					if (index === 0) {
						// 显示全部
					} else if (index === 1) {
						// 只显示已下载的
					} else if (index === 2) {
						// 只显示云端的
					} else if (index === 3) {
						// 只显示即将过期的
					}
				}
			});
		},
		toggleManageMode() {
			this.isManageMode = !this.isManageMode;
			if (!this.isManageMode) {
				// 退出管理模式时，取消所有选择
				this.works.forEach(work => work.selected = false);
				this.isAllSelected = false;
			}
		},
		toggleSelect(item) {
			item.selected = !item.selected;
			// 检查是否所有项目都被选中
			this.isAllSelected = this.works.every(work => work.selected);
		},
		toggleSelectAll() {
			this.isAllSelected = !this.isAllSelected;
			// 选择或取消选择所有项目
			this.works.forEach(work => work.selected = this.isAllSelected);
		},
		viewExpiringWorks() {
			// 滚动到即将过期的作品位置或高亮显示
			uni.showToast({
				title: '已为您标记即将过期的作品',
				icon: 'none'
			});
		},
		playAudio(item) {
			// 切换播放状态
			this.works.forEach(work => {
				if (work.id === item.id) {
					work.isPlaying = !work.isPlaying;
				} else {
					work.isPlaying = false;
				}
			});
			
			// 实际播放逻辑
			if (item.isPlaying) {
				// 播放音频
				uni.showToast({
					title: `正在播放：${item.title}`,
					icon: 'none'
				});
			} else {
				// 停止播放
			}
		},
		shareWork(item) {
			// 分享单个作品
			uni.showToast({
				title: `分享作品：${item.title}`,
				icon: 'none'
			});
		},
		editWork(item) {
			uni.showToast({
				title: `编辑作品：${item.title}`,
				icon: 'none'
			});
			// 实际编辑逻辑
			// uni.navigateTo({
			//     url: `/pages/creation/edit?id=${item.id}`
			// });
		},
		deleteWork(item) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除作品"${item.title}"吗？`,
				success: (res) => {
					if (res.confirm) {
						const index = this.works.findIndex(work => work.id === item.id);
						if (index !== -1) {
							this.works.splice(index, 1);
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
				}
			});
		},
		downloadSelected() {
			// 下载选中的作品
			const selectedCount = this.selectedWorksCount;
			if (selectedCount === 0) {
				uni.showToast({
					title: '请至少选择一个作品',
					icon: 'none'
				});
				return;
			}
			
			uni.showToast({
				title: `下载${selectedCount}个作品`,
				icon: 'success'
			});
		},
		shareSelected() {
			// 分享选中的作品
			const selectedCount = this.selectedWorksCount;
			if (selectedCount === 0) {
				uni.showToast({
					title: '请至少选择一个作品',
					icon: 'none'
				});
				return;
			}
			
			uni.showToast({
				title: `分享${selectedCount}个作品`,
				icon: 'success'
			});
		},
		deleteSelected() {
			// 删除选中的作品
			const selectedCount = this.selectedWorksCount;
			if (selectedCount === 0) {
				uni.showToast({
					title: '请至少选择一个作品',
					icon: 'none'
				});
				return;
			}
			
			uni.showModal({
				title: '确认删除',
				content: `确定要删除选中的${selectedCount}个作品吗？`,
				success: (res) => {
					if (res.confirm) {
						// 移除选中的作品
						this.works = this.works.filter(work => !work.selected);
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					}
				}
			});
		},
		goToDetail(id) {
			// 不在管理模式才能查看详情
			if (!this.isManageMode) {
				uni.navigateTo({
					url: '/pages/user/work-detail?id=' + id
				});
			}
		},
		goToCreate() {
			uni.switchTab({
				url: '/pages/creation/select'
			});
		},
		// 触摸开始
		touchStart(event, item) {
			if (this.isManageMode) return; // 管理模式下禁用滑动
			
			// 记录开始触摸的位置
			this.touchStartX = event.touches[0].clientX;
			this.touchStartY = event.touches[0].clientY;
			
			// 如果点击的不是当前滑动的项，则关闭已打开的项
			if (this.currentSwiped && this.currentSwiped !== item) {
				this.currentSwiped.showActions = false;
				this.currentSwiped.offsetX = 0;
			}
		},
		
		// 触摸移动
		touchMove(event, item) {
			if (this.isManageMode) return; // 管理模式下禁用滑动
			
			const touchMoveX = event.touches[0].clientX;
			const touchMoveY = event.touches[0].clientY;
			
			// 计算X和Y方向的移动距离
			const moveX = this.touchStartX - touchMoveX;
			const moveY = this.touchStartY - touchMoveY;
			
			// 如果Y方向的移动距离大于X方向，则判定为上下滚动，不处理左右滑动
			if (Math.abs(moveY) > Math.abs(moveX)) return;
			
			// 阻止页面滚动
			event.preventDefault();
			
			// 只允许左滑（moveX > 0）
			if (moveX > 0) {
				// 计算滑动的距离，最大不超过操作按钮宽度
				const offsetX = -Math.min(moveX, this.actionButtonWidth);
				item.offsetX = offsetX;
				
				// 记录当前滑动的项
				this.currentSwiped = item;
			} else if (item.showActions) {
				// 如果是右滑且当前项已显示操作按钮，则允许关闭
				const offsetX = -Math.max(this.actionButtonWidth + moveX, 0);
				item.offsetX = offsetX;
			}
		},
		
		// 触摸结束
		touchEnd(event, item) {
			if (this.isManageMode) return; // 管理模式下禁用滑动
			
			if (!item.offsetX) return;
			
			// 如果滑动距离超过操作按钮宽度的一半，则显示操作按钮
			if (Math.abs(item.offsetX) > this.actionButtonWidth / 2) {
				item.showActions = true;
				item.offsetX = -this.actionButtonWidth;
			} else {
				item.showActions = false;
				item.offsetX = 0;
			}
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 30rpx;
	position: relative;
}

/* 导航栏样式 */
.navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	position: relative;
}

.left, .right {
	width: 80rpx;
	display: flex;
	align-items: center;
}

.left {
	justify-content: flex-start;
}

.right {
	justify-content: flex-end;
	color: #3B7EFF;
	font-size: 28rpx;
}

.title {
	position: absolute;
	left: 0;
	right: 0;
	text-align: center;
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
	pointer-events: none;
}

.icon-back {
	font-size: 40rpx;
	color: #FFFFFF;
}

/* 搜索和筛选区域 */
.search-filter {
	padding: 0 30rpx 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20rpx;
}

.search-box {
	flex: 1;
	background-color: #2D2D2D;
	border-radius: 40rpx;
	padding: 15rpx 25rpx;
	display: flex;
	align-items: center;
}

.search-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 15rpx;
}

.search-input {
	flex: 1;
	height: 40rpx;
	color: #FFFFFF;
	font-size: 28rpx;
}

.filter-btn {
	background-color: #2D2D2D;
	border-radius: 40rpx;
	padding: 15rpx 25rpx;
	display: flex;
	align-items: center;
	color: #ACACAC;
}

.filter-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 10rpx;
}

/* 云端存储提示 */
.storage-tip {
	margin: 0 30rpx 20rpx;
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 20rpx;
	display: flex;
	align-items: center;
}

.tip-icon {
	font-size: 32rpx;
	color: #FFB443;
	margin-right: 15rpx;
}

.tip-text {
	color: #FFB443;
	font-size: 24rpx;
}

/* 过期作品提醒 */
.expiring-notice {
	margin: 0 30rpx 20rpx;
	background-color: rgba(255, 180, 67, 0.1);
	border-radius: 16rpx;
	padding: 20rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.notice-content {
	display: flex;
	align-items: center;
	flex: 1;
}

.notice-icon {
	font-size: 32rpx;
	color: #FFB443;
	margin-right: 15rpx;
}

.notice-text {
	display: flex;
	flex-direction: column;
}

.notice-title {
	color: #FFFFFF;
	font-size: 26rpx;
}

.notice-desc {
	color: #ACACAC;
	font-size: 22rpx;
	margin-top: 5rpx;
}

.notice-button {
	background-color: #FFB443;
	color: #FFFFFF;
	font-size: 24rpx;
	padding: 10rpx 25rpx;
	border-radius: 30rpx;
	margin-left: 15rpx;
}

/* 作品列表样式 */
.content {
	padding: 0 30rpx;
}

.works-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.work-item {
	position: relative;
	background-color: #1E1E1E;
	border-radius: 16rpx;
	overflow: hidden;
	display: flex;
}

.work-item.swiped .work-content {
	transform: translateX(-160rpx);
}

.select-box {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 15rpx;
}

.work-content {
	flex: 1;
	display: flex;
	padding: 20rpx;
	background-color: #1E1E1E;
	transition: transform 0.3s ease;
	z-index: 1;
}

.work-cover {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	overflow: hidden;
	margin-right: 20rpx;
}

.work-cover image {
	width: 100%;
	height: 100%;
}

.work-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.work-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.work-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #FFFFFF;
}

.work-status {
	display: flex;
	align-items: center;
}

.status-tag {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right: 15rpx;
}

.status-tag.downloaded {
	color: #36D1A6;
	background-color: rgba(54, 209, 166, 0.1);
}

.status-tag.cloud {
	color: #FFB443;
	background-color: rgba(255, 180, 67, 0.1);
}

.play-button {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background-color: #3B7EFF;
	display: flex;
	align-items: center;
	justify-content: center;
}

.play-button .play-icon {
	width: 40rpx;
	height: 40rpx;
	margin-left: 8rpx;
}

.work-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
}

.work-meta {
	display: flex;
	align-items: center;
}

.work-date {
	font-size: 24rpx;
	color: #787878;
}

.work-expiring {
	font-size: 24rpx;
	color: #FF5C5C;
	margin-left: 10rpx;
}

.work-actions {
	display: flex;
	align-items: center;
}

.work-genre {
	font-size: 22rpx;
	color: #ACACAC;
	background-color: #2D2D2D;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right: 15rpx;
}

/* 播放波形动画 */
.wave-animation {
	display: flex;
	align-items: center;
	height: 40rpx;
	gap: 5rpx;
}

.wave-bar {
	width: 4rpx;
	height: 100%;
	background: linear-gradient(to bottom, #0B67EC, #7342CC);
	border-radius: 2rpx;
	animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: 0.0s; }
.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
	0%, 100% { height: 20%; }
	50% { height: 100%; }
}

/* 侧滑操作按钮 */
.swipe-actions {
	display: flex;
	position: absolute;
	right: 0;
	top: 0;
	height: 100%;
	width: 160rpx;
	transform: translateX(100%);
	z-index: 0;
}

.work-item.swiped .swipe-actions {
	transform: translateX(0);
}

.action-edit, .action-delete {
	width: 80rpx;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #FFFFFF;
}

.action-edit {
	background-color: #3B7EFF;
}

.action-delete {
	background-color: #FF5C5C;
}

/* 加载更多 */
.load-more {
	text-align: center;
	padding: 30rpx 0;
	color: #787878;
	font-size: 24rpx;
}

/* 空状态 */
.empty-state {
	padding: 100rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.empty-state image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 40rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999999;
	margin-bottom: 50rpx;
}

.create-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	border-radius: 40rpx;
	width: 300rpx;
	font-size: 28rpx;
	padding: 15rpx 0;
}

/* 管理模式底部操作栏 */
.batch-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #1E1E1E;
	padding: 20rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.select-all {
	display: flex;
	align-items: center;
}

.select-all text {
	margin-left: 10rpx;
	font-size: 28rpx;
	color: #FFFFFF;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
}

.download-button, .share-button, .delete-button {
	height: 70rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 35rpx;
	padding: 0 30rpx;
	font-size: 26rpx;
}

.download-button {
	background-color: #3B7EFF;
	color: #FFFFFF;
}

.share-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
}

.delete-button {
	background-color: #FF5C5C;
	color: #FFFFFF;
}

.action-icon {
	width: 32rpx;
	height: 32rpx;
	margin-right: 10rpx;
}

.download-button .action-icon {
	/* 设置为白色 */
	filter: brightness(0) invert(1);
}

.share-button .action-icon {
	/* 设置为白色 */
	filter: brightness(0) invert(1);
}

.delete-button .action-icon {
	/* 设置为白色 */
	filter: brightness(0) invert(1);
}

/* 侧滑操作按钮样式更新 */
.action-edit .icon-edit, 
.action-delete .icon-delete {
	width: 40rpx;
	height: 40rpx;
}

.action-edit .icon-edit {
	/* 设置为白色 */
	filter: brightness(0) invert(1);
}

.action-delete .icon-delete {
	/* 设置为白色 */
	filter: brightness(0) invert(1);
}

/* 分享按钮样式 */
.share-button {
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-share {
	width: 32rpx;
	height: 32rpx;
	/* 设置SVG填充颜色为原按钮颜色 */
	filter: invert(43%) sepia(93%) saturate(1352%) hue-rotate(201deg) brightness(97%) contrast(105%);
}
</style> 