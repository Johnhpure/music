<template>
	<view class="home-container">
		
		<!-- 顶部导航栏和音乐点数显示 -->
		<view class="top-navbar">
			<text class="app-title">AI音乐创作</text>
			<view class="music-points" @click="handlePointsClick">
				<text>🎵</text>
				<text class="points-count">{{userCreditBalance}}点</text>
			</view>
		</view>
		
		<!-- 功能介绍轮播 -->
		<view class="swiper-section">
			<swiper class="swiper" circular autoplay interval="5000" duration="500" indicator-dots indicator-active-color="#FFFFFF" indicator-color="rgba(255,255,255,0.5)">
				<swiper-item v-for="(item, index) in banners" :key="item.id || index">
					<view class="swiper-item" @click="onBannerClick(item)">
						<image :src="item.imageUrl" mode="aspectFill" :data-index="index" @error="onBannerImageError"></image>
						<view class="swiper-caption">
							<text class="caption-title">{{item.title}}</text>
							<text class="caption-desc">{{item.description}}</text>
						</view>
						<!-- 如果有链接，显示点击提示 -->
						<view v-if="item.linkUrl" class="banner-click-hint">
							<text class="hint-text">点击查看详情</text>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<!-- 创作灵感区 -->
		<view class="inspiration-section">
			<view class="section-header">
				<text class="section-title">创作提示词</text>
				<!-- <text class="more-link" @click="goToMore('inspiration')">查看更多</text> -->
			</view>
			
			<!-- 提示词卡片列表 -->
			<scroll-view class="scroll-view-x" scroll-x enable-flex>
				<view class="prompt-card" v-for="(item, index) in promptTemplates" :key="item.id || index" :data-index="index" @click="usePromptTemplateByIndex">
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
					<!-- 显示分类标识 -->
					<view v-if="item.category" class="prompt-category">
						<text class="category-text">{{item.category}}</text>
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
				<view class="music-item" v-for="(item, index) in hotRecommendations" :key="item.id || index" @click="viewMusicDetail(item)">
					<view class="music-cover">
						<image :src="item.coverUrl" mode="aspectFill" :data-index="index" @error="onMusicCoverError"></image>
						<!-- 热门标识 -->
						<view v-if="item.isHot" class="hot-badge">
							<text class="hot-text">热门</text>
						</view>
					</view>
					<view class="music-info">
						<view class="music-header">
							<view>
								<text class="music-title">{{item.title}}</text>
								<text class="music-meta">{{item.artist}} · {{item.genre}} · {{item.duration}}</text>
							</view>
							<view class="play-button" @click.stop="previewMusicByIndex(index)">
								<image src="/static/img/icon/play.svg" class="play-icon"></image>
							</view>
						</view>
						<view class="music-footer">
							<view class="music-tags">
								<text class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{tag}}</text>
							</view>
							<view class="play-count">
								<view class="play-button-view" @click.stop="previewMusicByIndex(index)">
									<image src="/static/img/icon/play.svg" class="play-icon-view"></image>
								</view>
								<text>{{ formatPlayCount(item.playCount) }}</text>
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
		
		<!-- 新手指引 (移动到最底部) -->
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
	</view>
</template>

<script>
	import cacheManager from '@/utils/cacheManager';
	import errorHandler from '@/utils/errorHandler';

	export default {
		data() {
			return {
				// User credit balance info
				userCreditBalance: 0,
				loadingPoints: false,
				selectedEmotion: 0,
				// Last refresh timestamps for cache management
				lastRefreshTime: {
					banner: 0,
					promptTemplate: 0,
					hotRecommendation: 0
				},
				// Banner轮播图数据（从API动态获取）
				banners: [],
				loadingBanners: false,
				// 默认Banner数据（API调用失败时的备用数据）
				defaultBanners: [
					{
						id: 'default_1',
						title: "欢迎使用AI音乐创作",
						description: "轻松创作属于你的音乐",
						imageUrl: "/static/img/banner/banner1.jpg",
						linkUrl: "",
						sortOrder: 1,
						isActive: true
					},
					{
						id: 'default_2',
						title: "AI辅助音乐创作", 
						description: "用AI技术让创作更简单",
						imageUrl: "/static/img/banner/banner2.jpg",
						linkUrl: "",
						sortOrder: 2,
						isActive: true
					},
					{
						id: 'default_3',
						title: "分享你的创作",
						description: "与朋友一起享受音乐乐趣",
						imageUrl: "/static/img/banner/banner3.jpg",
						linkUrl: "",
						sortOrder: 3,
						isActive: true
					}
				],
				// 创作提示词模板（从API动态获取）
				promptTemplates: [],
				loadingPromptTemplates: false,
				// 默认提示词模板（API调用失败时的备用数据）
				defaultPromptTemplates: [
					{
						id: "default_summer",
						title: "夏日海滩",
						content: "创作一首关于夏日海边的轻快歌曲，描绘阳光、沙滩和欢乐时光",
						icon: "☀️",
						iconBg: "bg-theme-blue",
						tags: ["欢快", "夏日"],
						category: "季节",
						sortOrder: 1,
						isActive: true
					},
					{
						id: "default_love",
						title: "甜蜜爱情",
						content: "创作一首关于初次相遇的爱情歌曲，描述心动和美好的感觉",
						icon: "❤️",
						iconBg: "bg-theme-purple",
						tags: ["浪漫", "甜蜜"],
						category: "情感",
						sortOrder: 2,
						isActive: true
					},
					{
						id: "default_city",
						title: "城市夜景",
						content: "创作一首关于都市夜生活的歌曲，描绘城市的霓虹和节奏",
						icon: "🏙️",
						iconBg: "bg-warning",
						tags: ["都市", "流行"],
						category: "生活",
						sortOrder: 3,
						isActive: true
					},
					{
						id: "default_nature",
						title: "自然风光",
						content: "创作一首描绘自然风光的民谣，表达对大自然的热爱",
						icon: "🍃",
						iconBg: "bg-success",
						tags: ["民谣", "舒缓"],
						category: "自然",
						sortOrder: 4,
						isActive: true
					},
					{
						id: "default_dream",
						title: "梦境漫游",
						content: "创作一首梦幻风格的歌曲，描绘奇妙的梦境和幻想",
						icon: "🌙",
						iconBg: "bg-link",
						tags: ["梦幻", "电子"],
						category: "幻想",
						sortOrder: 5,
						isActive: true
					}
				],
				// 热门推荐列表（从API动态获取）
				hotRecommendations: [],
				loadingHotRecommendations: false,
				// 默认热门推荐数据（API调用失败时的备用数据）
				defaultHotRecommendations: [
					{
						id: "default_1",
						title: "夏日海滩",
						artist: "AI音乐创作师",
						genre: "电子",
						duration: "3:45",
						coverUrl: "/static/img/covers/cover1.jpg",
						playCount: 2500,
						tags: ["夏日", "欢快"],
						category: "流行",
						isHot: true,
						sortOrder: 1,
						isActive: true
					},
					{
						id: "default_2",
						title: "电子节拍",
						artist: "AI音乐创作师",
						genre: "电子",
						duration: "4:12",
						coverUrl: "/static/img/covers/cover2.jpg",
						playCount: 1800,
						tags: ["电子", "节奏"],
						category: "电子",
						isHot: true,
						sortOrder: 2,
						isActive: true
					},
					{
						id: "default_3",
						title: "城市夜景",
						artist: "AI音乐创作师",
						genre: "流行",
						duration: "3:28",
						coverUrl: "/static/img/covers/cover3.jpg",
						playCount: 1600,
						tags: ["都市", "流行"],
						category: "流行",
						isHot: true,
						sortOrder: 3,
						isActive: true
					},
					{
						id: "default_4",
						title: "秋日回忆",
						artist: "AI音乐创作师",
						genre: "民谣",
						duration: "3:55",
						coverUrl: "/static/img/covers/cover4.jpg",
						playCount: 1500,
						tags: ["温暖", "民谣"],
						category: "民谣",
						isHot: true,
						sortOrder: 4,
						isActive: true
					},
					{
						id: "default_5",
						title: "山间小路",
						artist: "AI音乐创作师",
						genre: "轻音乐",
						duration: "4:30",
						coverUrl: "/static/img/covers/cover5.jpg",
						playCount: 1300,
						tags: ["轻音乐", "舒缓"],
						category: "轻音乐",
						isHot: true,
						sortOrder: 5,
						isActive: true
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
		async onLoad() {
			// 初始化时从store中获取已有的点数
			this.userCreditBalance = this.$store.getters.userCreditBalance || 0;
			
			// 设置默认数据（立即显示，避免空白）
			this.banners = [...this.defaultBanners];
			this.promptTemplates = [...this.defaultPromptTemplates];
			this.hotRecommendations = [...this.defaultHotRecommendations];
			
			// 尝试自动登录
			await this.checkAutoLogin();
			
			// 并行加载所有数据
			await Promise.all([
				this.loadUserCreditBalance(),
				this.loadBanners(),
				this.loadPromptTemplates(),
				this.loadHotRecommendations()
			]);
		},
		async onShow() {
			// 页面显示时刷新数据（从其他页面返回时）
			// 先显示store中的点数，然后异步更新
			this.userCreditBalance = this.$store.getters.userCreditBalance || this.userCreditBalance;

			// 使用CacheManager智能刷新：仅刷新缓存过期的数据
			const refreshPromises = [
				this.loadUserCreditBalance() // 点数总是刷新（不缓存）
			];

			// Banner缓存检查（TTL: 5分钟）
			if (cacheManager.shouldRefresh('banners', 'banner', this.lastRefreshTime.banner)) {
				refreshPromises.push(this.loadBanners());
			}

			// 提示词模板缓存检查（TTL: 10分钟）
			if (cacheManager.shouldRefresh('promptTemplates', 'promptTemplate', this.lastRefreshTime.promptTemplate)) {
				refreshPromises.push(this.loadPromptTemplates());
			}

			// 热门推荐缓存检查（TTL: 2分钟）
			if (cacheManager.shouldRefresh('hotRecommendations', 'hotRecommendation', this.lastRefreshTime.hotRecommendation)) {
				refreshPromises.push(this.loadHotRecommendations());
			}

			await Promise.all(refreshPromises);
		},
		methods: {
			// 处理点数按钮点击
			async handlePointsClick() {
				// 先刷新点数
				await this.loadUserCreditBalance();
				// 然后跳转到点数页面
				uni.navigateTo({
					url: '/pages/user/points'
				});
			},
			
			// 获取用户点数余额
			async loadUserCreditBalance() {
				// 检查用户是否已登录
				if (!this.$store.getters.isLoggedIn) {
					this.userCreditBalance = 0;
					return;
				}
				
				if (this.loadingPoints) return;
				this.loadingPoints = true;
				
				try {
					// 使用Vuex action获取点数
					const balance = await this.$store.dispatch('getCreditBalance');
					this.userCreditBalance = balance;
					console.log('✅ 点数更新成功:', this.userCreditBalance);
				} catch (error) {
					console.error('❌ 获取点数余额失败:', error);
					// 网络错误时显示当前store中的点数或默认值
					this.userCreditBalance = this.$store.getters.userCreditBalance || 0;
					if (this.userCreditBalance === 0) {
						this.userCreditBalance = '--';
					}
				} finally {
					this.loadingPoints = false;
				}
			},
			
			// 加载首页数据
			async loadHomePageData() {
				try {
					const response = await this.$minApi.getHomePageData();
					console.log('🏠 获取首页数据响应:', response);
					
					if (response.code === 200 && response.data.promptTemplates) {
						// 更新提示词模板数据
						this.promptTemplates = response.data.promptTemplates.map(item => ({
							id: item.id,
							title: item.title,
							content: item.content,
							icon: item.icon || "🎵",
							iconBg: item.iconBg || "bg-theme-blue",
							tags: item.tags || []
						}));
						console.log('✅ 首页数据加载成功');
					}
				} catch (error) {
					console.error('❌ 获取首页数据失败:', error);
					// 失败时使用默认数据，不影响用户体验
				}
			},
			
			// 加载Banner轮播图数据
			async loadBanners() {
				if (this.loadingBanners) return;

				// 先尝试从缓存获取
				const cachedBanners = cacheManager.get('banners', 'banner');
				if (cachedBanners) {
					console.log('🔄 使用缓存的Banner数据');
					this.banners = cachedBanners;
					return;
				}

				this.loadingBanners = true;

				try {
					console.log('🖼️ 开始加载Banner数据...');
					const response = await this.$minApi.getActiveBanners();
					console.log('🖼️ Banner API响应:', response);

					if (response.code === 200 && response.data && response.data.length > 0) {
						// 直接使用API返回的Banner数据
						this.banners = response.data.map(banner => ({
							id: banner.id,
							title: banner.title,
							description: banner.description,
							imageUrl: banner.imageUrl, // 直接使用API返回的图片URL
							linkUrl: banner.linkUrl,
							sortOrder: banner.sortOrder,
							isActive: banner.isActive
						}));

						// 缓存Banner数据
						cacheManager.set('banners', this.banners, 'banner');
						this.lastRefreshTime.banner = Date.now();

						console.log(`✅ Banner数据加载成功，共${this.banners.length}张图片`);
					} else {
						console.log('⚠️ API返回的Banner数据为空，使用默认数据');
						// 保持使用默认数据
						if (this.banners.length === 0) {
							this.banners = [...this.defaultBanners];
						}
					}
				} catch (error) {
					console.error('❌ 获取Banner数据失败:', error);
					// 使用ErrorHandler统一错误处理
					errorHandler.handle(error, 'Banner加载');
					// 网络错误时使用默认数据
					if (this.banners.length === 0) {
						this.banners = [...this.defaultBanners];
						console.log('🔄 使用默认Banner数据');
					}
				} finally {
					this.loadingBanners = false;
				}
			},
			
			// 处理Banner点击事件
			onBannerClick(banner) {
				// 参数检查，防止undefined错误
				if (!banner) {
					console.error('❌ onBannerClick: banner参数为undefined');
					return;
				}
				
				if (!banner.title) {
					console.error('❌ onBannerClick: banner对象缺少title属性', banner);
					return;
				}
				
				console.log('🖼️ 点击了Banner:', banner.title);
				
				// 如果Banner有链接地址，进行跳转
				if (banner.linkUrl) {
					// 判断是内部页面还是外部链接
					if (banner.linkUrl.startsWith('/pages/')) {
						// 内部页面跳转
						uni.navigateTo({
							url: banner.linkUrl,
							fail: (err) => {
								console.error('页面跳转失败:', err);
								uni.showToast({
									title: '页面跳转失败',
									icon: 'none'
								});
							}
						});
					} else if (banner.linkUrl.startsWith('http')) {
						// 外部链接，复制到剪贴板
						uni.setClipboardData({
							data: banner.linkUrl,
							success: () => {
								uni.showToast({
									title: '链接已复制',
									icon: 'success'
								});
							}
						});
					} else {
						// 其他类型的链接处理
						console.log('未知链接类型:', banner.linkUrl);
					}
				} else {
					// 没有链接时的默认行为（可以跳转到创作页面）
					uni.navigateTo({
						url: '/pages/creation/select'
					});
				}
			},
			
			// 加载创作提示词模板数据
			async loadPromptTemplates() {
				if (this.loadingPromptTemplates) return;

				// 先尝试从缓存获取
				const cachedTemplates = cacheManager.get('promptTemplates', 'promptTemplate');
				if (cachedTemplates) {
					console.log('🔄 使用缓存的提示词模板数据');
					this.promptTemplates = cachedTemplates;
					return;
				}

				this.loadingPromptTemplates = true;

				try {
					console.log('🎭 开始加载提示词模板数据...');
					const response = await this.$minApi.getActivePromptTemplates();
					console.log('🎭 提示词模板API响应:', response);

					if (response.code === 200 && response.data && response.data.length > 0) {
						// 转换API数据格式为前端需要的格式
						this.promptTemplates = response.data.map(template => ({
							id: template.id,
							title: template.title,
							content: template.content,
							icon: template.icon || "🎵",
							iconBg: this.getCategoryIconBg(template.category),
							tags: typeof template.tags === 'string' ? template.tags.split(',') : (template.tags || []),
							category: template.category || "其他",
							sortOrder: template.sortOrder || 0,
							isActive: template.isActive !== false
						}));

						// 缓存提示词模板数据
						cacheManager.set('promptTemplates', this.promptTemplates, 'promptTemplate');
						this.lastRefreshTime.promptTemplate = Date.now();

						console.log(`✅ 提示词模板数据加载成功，共${this.promptTemplates.length}个模板`);
					} else {
						console.log('⚠️ API返回的提示词数据为空，使用默认数据');
						// 保持使用默认数据
						if (this.promptTemplates.length === 0 || this.promptTemplates.every(t => t.id.startsWith('default_'))) {
							this.promptTemplates = [...this.defaultPromptTemplates];
						}
					}
				} catch (error) {
					console.error('❌ 获取提示词模板数据失败:', error);
					// 使用ErrorHandler统一错误处理
					errorHandler.handle(error, '提示词模板加载');
					// 网络错误时使用默认数据
					if (this.promptTemplates.length === 0 || this.promptTemplates.every(t => t.id.startsWith('default_'))) {
						this.promptTemplates = [...this.defaultPromptTemplates];
						console.log('🔄 使用默认提示词模板数据');
					}
				} finally {
					this.loadingPromptTemplates = false;
				}
			},
			
			// 加载热门推荐音乐数据
			async loadHotRecommendations() {
				if (this.loadingHotRecommendations) return;

				// 先尝试从缓存获取
				const cachedRecommendations = cacheManager.get('hotRecommendations', 'hotRecommendation');
				if (cachedRecommendations) {
					console.log('🔄 使用缓存的热门推荐数据');
					this.hotRecommendations = cachedRecommendations;
					return;
				}

				this.loadingHotRecommendations = true;

				try {
					console.log('🎵 开始加载热门推荐数据...');
					const response = await this.$minApi.getHotRecommendations({
						page: 1,
						pageSize: 10,
						isHot: 1
					});
					console.log('🎵 热门推荐API响应:', response);

					if (response.code === 200 && response.data && response.data.length > 0) {
						// 转换API数据格式为前端需要的格式
						this.hotRecommendations = response.data.map((music, index) => {
							// 处理封面图片URL
							let coverUrl = music.coverUrl || '';

							// 小程序环境：只使用本地静态图片，避免HTTP协议限制
							if (!coverUrl || !coverUrl.startsWith('/static/')) {
								// 使用本地静态图片池
								const defaultCovers = [
									'/static/img/covers/cover1.jpg',
									'/static/img/covers/cover2.jpg',
									'/static/img/covers/cover3.jpg',
									'/static/img/covers/cover4.jpg',
									'/static/img/covers/cover5.jpg'
								];
								coverUrl = defaultCovers[index % defaultCovers.length] || '/static/img/covers/default.jpg';
							}

							return {
								id: music.id,
								title: music.title,
								artist: music.artist || "未知艺术家",
								genre: music.genre || "流行",
								duration: music.duration || "3:30",
								coverUrl: coverUrl,
								playCount: music.playCount || 0,
								tags: music.tags || [],
								category: music.category || "流行",
								isHot: music.isHot !== false,
								sortOrder: music.sortOrder || 0,
								isActive: music.isActive !== false
							};
						});

						// 缓存热门推荐数据
						cacheManager.set('hotRecommendations', this.hotRecommendations, 'hotRecommendation');
						this.lastRefreshTime.hotRecommendation = Date.now();

						console.log(`✅ 热门推荐数据加载成功，共${this.hotRecommendations.length}首音乐`);
					} else {
						console.log('⚠️ API返回的热门推荐数据为空，使用默认数据');
						// 保持使用默认数据
						if (this.hotRecommendations.length === 0 || this.hotRecommendations.every(m => m.id.startsWith('default_'))) {
							this.hotRecommendations = [...this.defaultHotRecommendations];
						}
					}
				} catch (error) {
					console.error('❌ 获取热门推荐数据失败:', error);
					// 使用ErrorHandler统一错误处理
					errorHandler.handle(error, '热门推荐加载');
					// 网络错误时使用默认数据
					if (this.hotRecommendations.length === 0 || this.hotRecommendations.every(m => m.id.startsWith('default_'))) {
						this.hotRecommendations = [...this.defaultHotRecommendations];
						console.log('🔄 使用默认热门推荐数据');
					}
				} finally {
					this.loadingHotRecommendations = false;
				}
			},
			
			// 检查自动登录
			async checkAutoLogin() {
				try {
					// 首先检查Vuex中是否已有用户信息
					if (this.$store.getters.isLoggedIn) {
						console.log('✅ 用户已登录 (Vuex)');
						return;
					}
					
					// 检查本地存储中的登录状态
					const WeChatAuth = (await import('@/utils/wechatAuth')).default;
					const isLoggedIn = WeChatAuth.isLoggedIn();
					
					if (isLoggedIn) {
						// 如果本地有登录信息但Vuex没有，更新Vuex状态
						const userInfo = WeChatAuth.getUserInfo();
						const token = uni.getStorageSync('token');
						
						this.$store.commit('login', {
							...userInfo,
							token: token,
							ApiToken: token
						});
						
						console.log('✅ 从本地存储恢复登录状态');
					} else {
						console.log('ℹ️ 用户未登录，可以正常使用首页功能');
					}
				} catch (error) {
					console.error('❌ 自动登录检查失败:', error);
				}
			},
			
			// Banner图片加载错误处理
			onBannerImageError(event) {
				try {
					console.log('🖼️ Banner图片加载错误事件:', event);
					
					// 从event中获取index
					const index = parseInt(event.currentTarget.dataset.index);
					
					// 索引检查
					if (isNaN(index) || index < 0 || index >= this.banners.length) {
						console.error('❌ onBannerImageError: 无效的index参数', index);
						return;
					}
					
					const banner = this.banners[index];
					if (!banner) {
						console.error('❌ onBannerImageError: 找不到对应的Banner对象', index);
						return;
					}
					
					console.warn('❌ Banner图片加载失败:', banner.imageUrl);
					
					// 使用本地静态图片作为备用方案
					const fallbackBanners = [
						"/static/img/banner/banner1.jpg",
						"/static/img/banner/banner2.jpg", 
						"/static/img/banner/banner3.jpg"
					];
					const fallbackImageUrl = fallbackBanners[index % fallbackBanners.length];
					
					// 更新Banner对象的图片URL
					this.$set(this.banners, index, {
						...banner,
						imageUrl: fallbackImageUrl
					});
					
					console.log('🔄 Banner图片加载失败，已替换为本地静态图片:', fallbackImageUrl);
				} catch (error) {
					console.error('❌ onBannerImageError处理失败:', error);
				}
			},
			// 查看音乐详情
			viewMusicDetail(item) {
				// 参数检查，防止undefined错误
				if (!item || !item.title || !item.id) {
					console.error('❌ viewMusicDetail: 参数不完整:', item);
					uni.showToast({
						title: '数据加载中，请稍后再试',
						icon: 'none'
					});
					return;
				}
				
				console.log('🎵 查看音乐详情:', item.title);
				
				// 记录音乐点击统计
				this.trackMusicClick(item.id);
				
				uni.navigateTo({
					url: `/pages/user/work-detail?id=${item.id}&title=${encodeURIComponent(item.title)}&artist=${encodeURIComponent(item.artist || '未知艺术家')}`
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
			// 使用提示词模板
			usePromptTemplate(item) {
				// 参数检查，防止undefined错误
				if (!item || !item.title || !item.id || !item.content) {
					console.error('❌ usePromptTemplate: 参数不完整:', item);
					uni.showToast({
						title: '数据加载中，请稍后再试',
						icon: 'none'
					});
					return;
				}
				
				console.log('🎭 使用提示词模板:', item.title);
				
				// 记录提示词使用统计（如果有统计接口的话）
				this.trackPromptTemplateUsage(item.id);
				
				// 跳转到AI创作页面，传递提示词参数
				uni.navigateTo({
					url: `/pages/creation/ai?prompt=${encodeURIComponent(item.content)}&promptId=${item.id}&promptTitle=${encodeURIComponent(item.title)}`
				});
			},
			
			// 记录提示词使用统计
			async trackPromptTemplateUsage(templateId) {
				try {
					await this.$minApi.trackPromptTemplateUsage({
						templateId: templateId,
						timestamp: new Date().toISOString()
					});
				} catch (error) {
					// 统计失败不影响主流程
					console.log('提示词使用统计失败:', error);
				}
			},

			// 通过索引使用提示词模板（解决小程序事件参数传递问题）
			usePromptTemplateByIndex(event) {
				try {
					// 从event中获取index
					const index = parseInt(event.currentTarget.dataset.index);

					// 索引检查
					if (isNaN(index) || index < 0 || index >= this.promptTemplates.length) {
						console.error('❌ usePromptTemplateByIndex: 无效的index参数', index);
						uni.showToast({
							title: '数据加载中，请稍后再试',
							icon: 'none'
						});
						return;
					}

					// 获取提示词数据
					const item = this.promptTemplates[index];

					// 参数检查，防止undefined错误
					if (!item || !item.title || !item.id || !item.content) {
						console.error('❌ usePromptTemplateByIndex: 参数不完整:', { index, item });
						uni.showToast({
							title: '数据加载中，请稍后再试',
							icon: 'none'
						});
						return;
					}

					console.log('🎭 使用提示词模板:', item.title);

					// 记录提示词使用统计
					this.trackPromptTemplateUsage(item.id);

					// 跳转到AI创作页面，传递提示词参数
					uni.navigateTo({
						url: `/pages/creation/ai?prompt=${encodeURIComponent(item.content)}&promptId=${item.id}&promptTitle=${encodeURIComponent(item.title)}`
					});
				} catch (error) {
					console.error('❌ usePromptTemplateByIndex处理失败:', error);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				}
			},
			goToTool(tool) {
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
			},
			// 预览播放音乐
			previewMusic(item) {
				// 参数检查，防止undefined错误
				if (!item || !item.title || !item.id) {
					console.error('❌ previewMusic: 参数不完整:', item);
					uni.showToast({
						title: '数据加载中，请稍后再试',
						icon: 'none'
					});
					return;
				}
				
				console.log('🎵 预览播放音乐:', item.title);
				
				// 记录音乐播放统计
				this.trackMusicPlay(item.id);
				
				// 实际项目中应调用播放器API
				uni.showToast({
					title: `播放 ${item.title}`,
					icon: 'none'
				});
				
				// TODO: 集成音乐播放器
				// this.$store.dispatch('playMusic', item);
			},

			// 通过索引预览播放音乐（解决小程序事件参数传递问题）
			previewMusicByIndex(index) {
				// 获取音乐数据
				const item = this.hotRecommendations[index];
				
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
				
				// 实际项目中应调用播放器API
				uni.showToast({
					title: `播放 ${item.title}`,
					icon: 'none'
				});
				
				// TODO: 集成音乐播放器
				// this.$store.dispatch('playMusic', item);
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
					// 统计失败不影响主流程
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
					// 统计失败不影响主流程
					console.log('音乐播放统计失败:', error);
				}
			},
			viewTutorial(tutorial) {
				uni.navigateTo({
					url: `/pages/tutorial/index`
				});
			},
			
			// 音乐封面图片加载错误处理
			onMusicCoverError(event) {
				try {
					console.log('🎵 音乐封面加载错误事件:', event);
					
					// 从event中获取index
					const index = parseInt(event.currentTarget.dataset.index);
					
					// 索引检查
					if (isNaN(index) || index < 0 || index >= this.hotRecommendations.length) {
						console.error('❌ onMusicCoverError: 无效的index参数', index);
						return;
					}
					
					const music = this.hotRecommendations[index];
					if (!music) {
						console.error('❌ onMusicCoverError: 找不到对应的音乐对象', index);
						return;
					}
					
					console.warn('❌ 音乐封面图片加载失败:', music.coverUrl);
					
					// 使用本地默认图片 - 确保小程序能访问
					let defaultCoverUrl = "/static/img/covers/default.jpg";
					
					// 更新音乐对象的封面URL
					this.$set(this.hotRecommendations, index, {
						...music,
						coverUrl: defaultCoverUrl
					});
					
					console.log('🔄 已替换为本地默认封面:', defaultCoverUrl);
				} catch (error) {
					console.error('❌ onMusicCoverError处理失败:', error);
				}
			},
			
			// 格式化播放次数显示
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
			
			// 根据分类获取图标背景样式
			getCategoryIconBg(category) {
				const categoryColors = {
					'爱情': 'bg-theme-purple',
					'友情': 'bg-theme-blue',
					'励志': 'bg-theme-green',
					'思念': 'bg-theme-blue',
					'青春': 'bg-theme-pink',
					'情感': 'bg-theme-orange',
					'流行': 'bg-theme-purple',
					'电子': 'bg-theme-blue',
					'摇滚': 'bg-theme-red',
					'民谣': 'bg-theme-green',
					'古典': 'bg-theme-yellow',
					'爵士': 'bg-theme-indigo',
					'说唱': 'bg-theme-pink',
					'其他': 'bg-theme-gray'
				};
				return categoryColors[category] || 'bg-theme-blue';
			}
		}
	}
</script>

<style lang="scss">
.home-container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 120rpx; /* 为底部tabBar和新手指引预留更多空间 */
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

/* Banner点击提示 */
.banner-click-hint {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 16rpx;
	padding: 8rpx 12rpx;
}

.hint-text {
	font-size: 20rpx;
	color: #FFFFFF;
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
	min-height: 180rpx;
	background-color: #1E1E1E;
	border-radius: 20rpx;
	padding: 20rpx;
	margin-right: 16rpx;
	position: relative;
	transition: all 0.2s ease;
}

.prompt-card:hover {
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
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
	min-height: 40rpx;
	margin-bottom: 8rpx;
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

.prompt-category {
	font-size: 20rpx;
	color: #4C94FF;
	background-color: rgba(76, 148, 255, 0.1);
	border-radius: 12rpx;
	padding: 4rpx 12rpx;
	display: inline-block;
}

.category-text {
	font-size: 20rpx;
	color: #4C94FF;
}

/* 新手指引 */
.guide-section {
	padding: 0 32rpx;
	margin-top: 32rpx;
	margin-bottom: 40rpx; /* 底部增加更多间距，为tabBar预留空间 */
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