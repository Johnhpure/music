<template>
	<view class="home-container">
		<!-- 登录授权弹窗 -->
		<AuthModal 
			:show.sync="showAuthModal" 
			@success="handleAuthSuccess"
		/>
		
		<!-- 顶部导航栏和音乐点数显示 -->
		<view class="top-navbar">
			<text class="app-title">AI音乐创作</text>
			<view class="music-points" @click="navigateToPoints">
				<text>🎵</text>
				<text class="points-count" v-if="!isLoggedIn">登录查看</text>
				<text class="points-count" v-else>{{userPoints}}点</text>
			</view>
		</view>
		
		<!-- 功能介绍轮播 -->
		<view class="swiper-section">
			<swiper class="swiper" circular autoplay interval="5000" duration="500" indicator-dots indicator-active-color="#FFFFFF" indicator-color="rgba(255,255,255,0.5)">
				<swiper-item v-for="(item, index) in banners" :key="index">
					<view class="swiper-item">
						<image :src="item.imageUrl" mode="aspectFill"></image>
						<view class="swiper-caption">
							<text class="caption-title">{{item.title}}</text>
							<text class="caption-desc">{{item.description}}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 轮播下方的标题 -->
		<view class="section-header recommendation-header">
			<text class="section-title">为您推荐创作作品</text>
		</view>
		
		<!-- 新手指引 -->
		<view class="guide-section">
			<view class="section-header">
				<text class="section-title">新手指引</text>
			</view>
			<view class="guide-cards">
				<view class="guide-card" @click="goToTutorial('self')">
					<view class="guide-icon bg-theme-blue">
						<!-- <text class="iconfont icon-edit"></text> -->
						<image src="/static/img/icon/pen.svg" class="guide-icon-image"></image>
					</view>
					<text class="guide-title">自主创作教程</text>
					<text class="guide-desc">学习如何自己创作歌曲</text>
				</view>
				<view class="guide-card" @click="goToTutorial('ai')">
					<view class="guide-icon bg-theme-purple">
						<!-- <text class="iconfont icon-ai"></text> -->
						 <image src="/static/img/icon/ai.svg" class="guide-icon-image"></image>
					</view>
					<text class="guide-title">AI辅助创作教程</text>
					<text class="guide-desc">了解AI如何帮助创作</text>
				</view>
			</view>
		</view>
		
		<!-- 创作灵感区 -->
		<view class="inspiration-section">
			<view class="section-header">
				<text class="section-title">创作提示词</text>
				<!-- <text class="more-link" @click="goToMore('inspiration')">查看更多</text> -->
			</view>
			
			<!-- 提示词卡片列表 -->
			<scroll-view class="scroll-view-x" scroll-x enable-flex>
				<view class="prompt-card" v-for="(item, index) in promptTemplates" :key="index" @click="usePromptTemplate(item)">
					<view class="prompt-head">
						<view class="prompt-icon" :class="item.iconBg">
							<text>{{item.icon}}</text>
						</view>
						<text class="prompt-title">{{item.title}}</text>
					</view>
					<text class="prompt-desc">{{item.content}}</text>
					<view class="prompt-tags">
						<view class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">
							<text>{{tag}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 热门推荐区 -->
		<view class="hot-recommend-section">
			<view class="section-header">
				<text class="section-title">热门推荐</text>
				<text class="more-link" @click="goToMore('recommendations')">查看全部</text>
			</view>
			<view class="music-list">
				<view class="music-item" v-for="(item, index) in hotRecommendations" :key="index" @click="viewMusicDetail(item)">
					<view class="music-cover">
						<image :src="item.coverUrl" mode="aspectFill"></image>
					</view>
					<view class="music-info">
						<view class="music-header">
							<view>
								<text class="music-title">{{item.title}}</text>
								<text class="music-meta">{{item.genre}} · {{item.duration}}</text>
							</view>
							<view class="play-button" @click.stop="previewMusic(item)">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="music-footer">
							<view class="music-tags">
								<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{tag}}</text>
							</view>
							<view class="play-count">
								<view class="play-button-view" @click.stop="previewMusic(item)">
									<image src="/static/img/icon/play.svg" class="play-icon-view"></image>
								</view>
								<text>{{item.playCount}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 创作教程 -->
		<view class="tutorial-section">
			<view class="section-header">
				<text class="section-title">创作教程</text>
			</view>
			<scroll-view class="scroll-view-x" scroll-x enable-flex>
				<view class="tutorial-card" v-for="(tutorial, index) in tutorials" :key="index" @click="viewTutorial(tutorial)">
					<view class="tutorial-cover">
						<image :src="tutorial.coverUrl" mode="aspectFill"></image>
					</view>
					<view class="tutorial-info">
						<text class="tutorial-title">{{tutorial.title}}</text>
						<text class="tutorial-meta">{{tutorial.duration}} · {{tutorial.level}}</text>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import AuthModal from '@/components/auth-modal/auth-modal.vue'
	import authMixin from '@/mixins/authMixin.js'
	
	export default {
		mixins: [authMixin],
		components: {
			AuthModal
		},
		data() {
			return {
				isLoggedIn: false,
				userPoints: 0,
				selectedEmotion: 0,
				banners: [],
				// 创作提示词模板
				promptTemplates: [
					{
						id: "summer",
						title: "夏日海滩",
						content: "创作一首关于夏日海边的轻快歌曲，描绘阳光、沙滩和欢乐时光",
						icon: "☀️",
						iconBg: "bg-theme-blue",
						tags: ["欢快", "夏日"]
					},
					{
						id: "love",
						title: "甜蜜爱情",
						content: "创作一首关于初次相遇的爱情歌曲，描述心动和美好的感觉",
						icon: "❤️",
						iconBg: "bg-theme-purple",
						tags: ["浪漫", "甜蜜"]
					},
					{
						id: "city",
						title: "城市夜景",
						content: "创作一首关于都市夜生活的歌曲，描绘城市的霓虹和节奏",
						icon: "🏙️",
						iconBg: "bg-warning",
						tags: ["都市", "流行"]
					},
					{
						id: "nature",
						title: "自然风光",
						content: "创作一首描绘自然风光的民谣，表达对大自然的热爱",
						icon: "🍃",
						iconBg: "bg-success",
						tags: ["民谣", "舒缓"]
					},
					{
						id: "dream",
						title: "梦境漫游",
						content: "创作一首梦幻风格的歌曲，描绘奇妙的梦境和幻想",
						icon: "🌙",
						iconBg: "bg-link",
						tags: ["梦幻", "电子"]
					}
				],
				// 热门推荐列表
				hotRecommendations: [
					{
						id: "1",
						title: "夏日海滩",
						genre: "电子",
						duration: "3:45",
						coverUrl: "/static/img/covers/cover1.jpg",
						playCount: "2.5k",
						tags: ["夏日", "欢快"]
					},
					{
						id: "2",
						title: "电子节拍",
						genre: "电子",
						duration: "4:12",
						coverUrl: "/static/img/covers/cover2.jpg",
						playCount: "1.8k",
						tags: ["电子", "节奏"]
					},
					{
						id: "3",
						title: "城市夜景",
						genre: "流行",
						duration: "3:28",
						coverUrl: "/static/img/covers/cover3.jpg",
						playCount: "1.6k",
						tags: ["都市", "流行"]
					},
					{
						id: "4",
						title: "秋日回忆",
						genre: "民谣",
						duration: "3:55",
						coverUrl: "/static/img/covers/cover4.jpg",
						playCount: "1.5k",
						tags: ["温暖", "民谣"]
					},
					{
						id: "5",
						title: "山间小路",
						genre: "轻音乐",
						duration: "4:30",
						coverUrl: "/static/img/covers/cover5.jpg",
						playCount: "1.3k",
						tags: ["轻音乐", "舒缓"]
					}
				],
				// 创作教程
				tutorials: [
					{
						id: "1",
						title: "AI音乐创作入门指南",
						duration: "10分钟",
						level: "初级",
						coverUrl: "/static/img/banner/banner1.jpg"
					},
					{
						id: "2",
						title: "如何创作一首流行歌曲",
						duration: "15分钟",
						level: "中级",
						coverUrl: "/static/img/banner/banner2.jpg"
					},
					{
						id: "3",
						title: "混音技巧大揭秘",
						duration: "20分钟",
						level: "高级",
						coverUrl: "/static/img/banner/banner3.jpg"
					}
				],
				emotionTags: [
					{ name: "快乐", id: "happy" },
					{ name: "悲伤", id: "sad" },
					{ name: "浪漫", id: "romantic" },
					{ name: "愤怒", id: "angry" },
					{ name: "平静", id: "calm" },
					{ name: "兴奋", id: "excited" },
					{ name: "怀旧", id: "nostalgic" },
					{ name: "神秘", id: "mysterious" }
				]
			}
		},
		mounted() {
			this.checkLoginAndLoadPoints();
			this.loadBanners();
		},
		methods: {
			/**
			 * 检查登录状态并加载点数
			 */
			async checkLoginAndLoadPoints() {
				const token = uni.getStorageSync('token');
				if (token) {
					this.isLoggedIn = true;
					try {
						const res = await this.$minApi.getUserPoints();
						if (res.code === 200) {
							this.userPoints = res.data.points || 0;
						}
					} catch (err) {
						console.error('获取用户点数失败:', err);
					}
				} else {
					this.isLoggedIn = false;
					this.userPoints = 0;
				}
			},
			/**
			 * 授权成功回调
			 */
			handleAuthSuccess() {
				// 授权成功后刷新点数
				this.checkLoginAndLoadPoints();
			},
			/**
			 * 加载Banner列表
			 */
			async loadBanners() {
				try {
					const res = await this.$minApi.getBanners();
					if (res.code === 200 && res.data) {
						this.banners = res.data.map(banner => ({
							id: banner.id,
							title: banner.title,
							description: banner.description,
							imageUrl: banner.image_url,
							linkUrl: banner.link_url
						}));
					}
				} catch (err) {
					console.error('获取Banner列表失败:', err);
					// 失败时使用默认数据
					this.banners = [
						{
							title: "欢迎使用AI音乐创作",
							description: "轻松创作属于你的音乐",
							imageUrl: "/static/img/banner/banner1.jpg"
						},
						{
							title: "AI辅助音乐创作",
							description: "用AI技术让创作更简单",
							imageUrl: "/static/img/banner/banner2.jpg"
						},
						{
							title: "分享你的创作",
							description: "与朋友一起享受音乐乐趣",
							imageUrl: "/static/img/banner/banner3.jpg"
						}
					];
				}
			},
			/**
			 * 跳转到音乐点数页面（需要登录）
			 */
			navigateToPoints() {
				this.requireAuth(() => {
					uni.navigateTo({
						url: '/pages/user/points?activeTab=history'
					});
				});
			},
			viewMusicDetail(item) {
				uni.navigateTo({
					url: `/pages/user/work-detail?id=${item.id}`
				});
			},
			selectEmotion(index) {
				this.selectedEmotion = index;
				// 根据选中的情感标签过滤灵感
				// 此处应添加实际逻辑
			},
			goToTutorial(type) {
				uni.navigateTo({
					url: `/pages/tutorial/${type}`
				});
			},
			goToMore(type) {
				if (type === 'recommendations') {
					uni.navigateTo({
						url: '/pages/recommendations/index'
					});
				} else {
					// 处理其他类型的跳转
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
				}
			},
			/**
			 * 使用提示词模板（需要登录）
			 */
			usePromptTemplate(item) {
				this.requireAuth(() => {
					uni.navigateTo({
						url: `/pages/creation/ai?prompt=${item.id}&promptTitle=${item.title}`
					});
				});
			},
			/**
			 * 前往创作工具（需要登录）
			 */
			goToTool(tool) {
				this.requireAuth(() => {
					let url = '';
					switch(tool) {
						case 'ai':
							url = '/pages/creation/ai';
							break;
						case 'lyrics':
							url = '/pages/creation/manual';
							break;
						case 'melody':
							url = '/pages/creation/melody';
							break;
						case 'remix':
							url = '/pages/creation/remix';
							break;
					}
					uni.navigateTo({
						url: url
					});
				});
			},
			previewMusic(item) {
				// 播放预览音乐
				console.log('预览音乐', item);
				// 实际项目中应调用播放器API
			},
			viewTutorial(tutorial) {
				uni.navigateTo({
					url: `/pages/tutorial/index`
				});
			}
		}
	}
</script>

<style lang="scss">
.home-container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 70rpx; /* 为底部tabBar预留空间 */
}

/* 状态栏 */
.status-bar {
	height: 44rpx;
	background-color: #121212;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 16rpx;
	font-size: 12rpx;
	color: #FFFFFF;
}

.status-icons {
	display: flex;
	gap: 8rpx;
}

/* 顶部导航栏 */
.top-navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 32rpx;
	background-color: #1E1E1E;
}

.app-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.music-points {
	display: flex;
	align-items: center;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	border-radius: 36rpx;
	padding: 12rpx 24rpx;
}

.music-points .icon-music {
	font-size: 14rpx;
	margin-right: 4rpx;
}

.points-count {
	font-size: 28rpx;
	font-weight: 500;
	color: #FFFFFF;
}

/* 轮播图 */
.swiper-section {
	margin: 20rpx 32rpx;
}

.swiper {
	height: 320rpx;
	border-radius: 24rpx;
	overflow: hidden;
}

.swiper-item {
	position: relative;
	width: 100%;
	height: 100%;
}

.swiper-item image {
	width: 100%;
	height: 100%;
}

.swiper-caption {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 32rpx;
	background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.caption-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #FFFFFF;
	display: block;
	margin-bottom: 6rpx;
}

.caption-desc {
	font-size: 24rpx;
	color: #ACACAC;
}

/* 小节标题 */
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 30rpx;
	margin-top: 40rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.more-link {
	font-size: 26rpx;
	color: #4C94FF;
}

/* 推荐作品区 */
.recommendation-header {
	margin-top: 0;
}

.recommendation-section {
	padding: 0 16rpx;
}

.scroll-view-x {
	white-space: nowrap;
	padding-bottom: 10rpx;
}

.prompt-card {
	display: inline-block;
	width: 470rpx;
	background-color: #1E1E1E;
	border-radius: 20rpx;
	padding: 20rpx;
	margin-right: 16rpx;
}

.prompt-head {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.prompt-icon {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 8rpx;
}

.prompt-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #FFFFFF;
}

.prompt-desc {
	font-size: 24rpx;
	color: #ACACAC;
	line-height: 1.4;
	margin-bottom: 12rpx;
	white-space: normal;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.prompt-tags {
	display: flex;
	flex-wrap: wrap;
}

.tag {
	font-size: 22rpx;
	color: #ACACAC;
	background-color: #282828;
	border-radius: 22rpx;
	padding: 4rpx 16rpx;
	margin-right: 8rpx;
	margin-bottom: 6rpx;
}

/* 新手指引 */
.guide-section {
	padding: 0 16rpx;
	margin-top: 8rpx;
	margin-bottom: 16rpx;
}

.guide-cards {
	display: flex;
	gap: 12rpx;
}

.guide-card {
	flex: 1;
	background-color: #1E1E1E;
	border-radius: 24rpx;
	padding: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.guide-icon {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 8rpx;
	.guide-icon-image {
		width: 50rpx;
    	height: 50rpx;
	}
}


.bg-theme-blue {
	background-color: rgba(11, 103, 236, 0.2);
}

.bg-theme-purple {
	background-color: rgba(115, 66, 204, 0.2);
}

.guide-icon .icon-edit {
	font-size: 20rpx;
	color: #0B67EC;
}

.guide-icon .icon-ai {
	font-size: 20rpx;
	color: #7342CC;
}

.guide-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #FFFFFF;
	margin-bottom: 8rpx;
	text-align: center;
}

.guide-desc {
	font-size: 24rpx;
	color: #787878;
	text-align: center;
}

/* 创作灵感 */
.inspiration-section {
	margin-top: 24rpx;
	padding-left: 30rpx;
	padding-right: 30rpx;
	overflow: hidden;
	width: 100vw;
}

.emotion-tags {
	display: flex;
	padding: 0 16rpx;
	margin-bottom: 12rpx;
}

.emotion-tag {
	display: inline-block;
	padding: 6rpx 12rpx;
	background-color: #1E1E1E;
	border-radius: 20rpx;
	margin-right: 8rpx;
}

.emotion-tag text {
	font-size: 12rpx;
	color: #ACACAC;
}

.emotion-tag.active {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}

.emotion-tag.active text {
	color: #FFFFFF;
}

.inspiration-cards {
	display: flex;
	flex-wrap: wrap;
	padding: 0 16rpx;
	gap: 12rpx;
}

.inspiration-card {
	position: relative;
	width: calc(50% - 6rpx);
	height: 120rpx;
	border-radius: 12rpx;
	overflow: hidden;
}

.inspiration-card image {
	width: 100%;
	height: 100%;
}

.inspiration-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 12rpx;
	background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.inspiration-title {
	font-size: 14rpx;
	font-weight: 500;
	color: #FFFFFF;
	display: block;
}

.inspiration-desc {
	font-size: 12rpx;
	color: #ACACAC;
}

/* 创作工具 */
.tools-section {
	margin-top: 24rpx;
}

.tools-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 0 16rpx;
	gap: 12rpx;
}

.tool-card {
	width: calc(25% - 9rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.tool-icon {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 8rpx;
}

.bg-success {
	background-color: rgba(54, 209, 166, 0.2);
}

.bg-warning {
	background-color: rgba(255, 180, 67, 0.2);
}

.tool-icon .icon-magic {
	font-size: 18rpx;
	color: #0B67EC;
}

.tool-icon .icon-lyrics {
	font-size: 18rpx;
	color: #7342CC;
}

.tool-icon .icon-music-note {
	font-size: 18rpx;
	color: #36D1A6;
}

.tool-icon .icon-remix {
	font-size: 18rpx;
	color: #FFB443;
}

.tool-name {
	font-size: 12rpx;
	color: #ACACAC;
	text-align: center;
}

/* 创作故事 */
.stories-section {
	margin-top: 24rpx;
	padding-bottom: 16rpx;
}

.story-cards {
	padding: 0 16rpx;
}

.story-card {
	display: flex;
	background-color: #1E1E1E;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 12rpx;
}

.story-cover {
	width: 100rpx;
	height: 100rpx;
}

.story-info {
	flex: 1;
	padding: 12rpx;
}

.story-title {
	font-size: 14rpx;
	font-weight: 500;
	color: #FFFFFF;
	margin-bottom: 4rpx;
	display: block;
}

.story-desc {
	font-size: 12rpx;
	color: #ACACAC;
	margin-bottom: 8rpx;
	display: block;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.story-author {
	display: flex;
	align-items: center;
}

.author-avatar {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	margin-right: 6rpx;
}

.author-name {
	font-size: 12rpx;
	color: #787878;
}

/* 热门推荐 */
.hot-recommend-section {
	padding: 0 16rpx;
	margin-top: 24rpx;
}

.music-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.music-item {
	display: flex;
	background-color: #1E1E1E;
	border-radius: 12rpx;
	overflow: hidden;
	justify-content: center;
    align-items: center;
}

.music-cover {
	width: 140rpx; /* 70px * 2 */
	height: 140rpx; /* 70px * 2 */
	flex-shrink: 0;
	position: relative;
}

.music-cover image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	border-radius: 20rpx;
}

.music-info {
	flex: 1;
	padding: 24rpx; /* 12px * 2 */
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.music-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.music-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #FFFFFF;
	display: block;
	margin-bottom: 4rpx;
}

.music-meta {
	font-size: 26rpx;
	color: #ACACAC;
	display: block;
}

.play-button {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background-color: #282828;
	//background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	//box-shadow: 0 4rpx 16rpx rgba(11, 103, 236, 0.3);
}

.play-icon {
	width: 32rpx;
	height: 32rpx;
	filter: brightness(0) invert(1);
}

.play-button-view {
	width: 34rpx;
	height: 34rpx;
	border-radius: 50%;
	background-color: #282828;
	//background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	//box-shadow: 0 4rpx 16rpx rgba(11, 103, 236, 0.3);
}

.play-icon-view {
	width: 16rpx;
	height: 16rpx;
	filter: brightness(0) invert(1);
}

.music-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16rpx;
}

.music-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.play-count {
	font-size: 26rpx;
	color: #787878;
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.play-count text:first-child {
	margin-right: 8rpx;
}

/* 创作教程 */
.tutorial-section {
	margin-top: 24rpx;
	padding: 0 16rpx;
}

.tutorial-card {
	display: inline-block;
	width: 470rpx;
	background-color: #1E1E1E;
	border-radius: 20rpx;
	overflow: hidden;
	margin-right: 16rpx;
}

.tutorial-cover {
	height: 240rpx;
	overflow: hidden;
}

.tutorial-cover image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.tutorial-info {
	padding: 16rpx;
}

.tutorial-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #FFFFFF;
	margin-bottom: 4rpx;
	white-space: normal;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.tutorial-meta {
	font-size: 24rpx;
	color: #ACACAC;
}

/* 通用颜色类 */
.bg-theme-blue {
	background-color: rgba(11, 103, 236, 0.2);
}

.bg-theme-purple {
	background-color: rgba(115, 66, 204, 0.2);
}

.bg-success {
	background-color: rgba(54, 209, 166, 0.2);
}

.bg-warning {
	background-color: rgba(255, 180, 67, 0.2);
}

.bg-link {
	background-color: rgba(76, 148, 255, 0.2);
}
</style> 