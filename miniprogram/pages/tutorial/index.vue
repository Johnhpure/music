<template>
	<view class="tutorial-container">
		
		<!-- 主内容区 -->
		<scroll-view class="content-scroll" scroll-y>
			<!-- 分类筛选 -->
			<view class="category-section">
				<scroll-view class="category-scroll" scroll-x enable-flex>
					<view 
						class="category-pill" 
						:class="{'active': activeCategory === index}"
						v-for="(category, index) in categories" 
						:key="index"
						@click="selectCategory(index)"
					>
						{{category.name}}
					</view>
				</scroll-view>
			</view>
			
			<!-- 视频教程 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">视频教程</text>
				</view>
				<view class="video-list">
					<view class="tutorial-card" v-for="(item, index) in videoTutorials" :key="index" @click="viewTutorial(item)">
						<view class="tutorial-card-cover" :style="{'background-image': `url(${item.coverUrl})`}">
							<view class="gradient-overlay"></view>
							<view class="play-icon">
								<text class="iconfont icon-play"></text>
							</view>
						</view>
						<view class="tutorial-card-info">
							<text class="tutorial-title">{{item.title}}</text>
							<text class="tutorial-desc">{{item.description}}</text>
							<view class="tutorial-meta">
								<text class="meta-item">时长: {{item.duration}}</text>
								<text class="meta-item">观看: {{item.views}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 图文教程 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">图文教程</text>
				</view>
				<view class="guide-card">
					<text class="guide-title">AI辅助创作完整指南</text>
					<text class="guide-desc">通过AI技术快速创作一首完整的歌曲</text>
					
					<view class="steps-list">
						<view class="step-item" v-for="(step, index) in guideSteps" :key="index">
							<view class="step-number">{{index + 1}}</view>
							<view class="step-content">
								<text class="step-title">{{step.title}}</text>
								<text class="step-desc">{{step.description}}</text>
							</view>
						</view>
					</view>
					
					<view class="guide-action">
						<button class="gradient-button" @click="viewDetailGuide">查看详细步骤</button>
					</view>
				</view>
				
				<view class="guide-card" style="margin-top: 30rpx;">
					<text class="guide-title">自主创作完整指南</text>
					<text class="guide-desc">通过自主创作一首完整的歌曲</text>
					
					<view class="steps-list">
						<view class="step-item" v-for="(step, index) in selfSteps" :key="index">
							<view class="step-number">{{index + 1}}</view>
							<view class="step-content">
								<text class="step-title">{{step.title}}</text>
								<text class="step-desc">{{step.description}}</text>
							</view>
						</view>
					</view>
					
					<view class="guide-action">
						<button class="gradient-button" @click="viewDetailSelf">查看详细步骤</button>
					</view>
				</view>
			</view>
			
			<!-- 常见问题 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">常见问题</text>
				</view>
				<view class="faq-list">
					<view class="faq-item" v-for="(faq, index) in faqs" :key="index" @click="toggleFaq(index)">
						<text class="faq-question">{{faq.question}}</text>
						<text class="faq-answer" :class="{expanded: faq.expanded}">{{faq.answer}}</text>
					</view>
				</view>
			</view>
			
			<!-- 进阶教程 -->
			<view class="section">
				<view class="section-header">
					<text class="section-title">进阶教程</text>
				</view>
				<view class="advanced-list">
					<view class="advanced-card" v-for="(item, index) in advancedTutorials" :key="index" @click="viewTutorial(item)">
						<view class="card-icon">
							<text class="iconfont" :class="item.icon"></text>
						</view>
						<view class="card-content">
							<text class="card-title">{{item.title}}</text>
							<text class="card-desc">{{item.description}}</text>
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
				activeCategory: 0,
				categories: [
					{ name: "全部", id: "all" },
					{ name: "新手入门", id: "beginner" },
					{ name: "AI辅助创作", id: "ai" },
					{ name: "自主创作", id: "manual" },
					{ name: "进阶技巧", id: "advanced" }
				],
				videoTutorials: [
					{
						id: "1",
						title: "AI辅助创作入门教程",
						description: "学习如何使用AI快速创作一首歌曲",
						coverUrl: "/static/img/tutorials/tutorial-ai.jpg",
						duration: "5:30",
						views: "1.2万",
						type: "video",
						category: "ai"
					},
					{
						id: "2",
						title: "自主创作教程：歌词创作技巧",
						description: "学习如何写出打动人心的歌词",
						coverUrl: "/static/img/tutorials/tutorial-lyrics.jpg",
						duration: "8:15",
						views: "8.5千",
						type: "video",
						category: "manual"
					}
				],
				guideSteps: [
					{
						title: "选择创作模式",
						description: "在首页点击\"创作中心\"，然后选择\"AI辅助创作\"模式。"
					},
					{
						title: "输入创作提示",
						description: "在提示框中输入你想要的音乐风格、情感或主题，例如\"一首关于夏日海滩的轻快歌曲\"。"
					},
					{
						title: "选择音乐风格",
						description: "从推荐的风格中选择一种，或者自定义你喜欢的音乐风格。"
					},
					{
						title: "生成音乐",
						description: "点击\"生成音乐\"按钮，等待AI创作完成。"
					},
					{
						title: "预览与调整",
						description: "预览生成的音乐，如果需要调整，可以修改参数后重新生成。"
					},
					{
						title: "保存作品",
						description: "满意后点击\"保存\"按钮，将作品保存到你的作品库中。"
					}
				],
				selfSteps: [
					{
						title: "选择创作模式",
						description: "在首页点击\"创作中心\"，然后选择\"自己写歌词\"模式。"
					},
					{
						title: "输入自主创作的歌词",
						description: "在提示框中输入你自己创作的歌词，例如\"我想我是海，冬天大大海....\"。"
					},
					{
						title: "选择音乐风格",
						description: "从推荐的风格中选择一种，或者自定义你喜欢的音乐风格。"
					},
					{
						title: "生成音乐",
						description: "点击\"生成音乐\"按钮，等待AI创作完成。"
					},
					{
						title: "预览与调整",
						description: "预览生成的音乐，如果需要调整，可以修改参数后重新生成。"
					},
					{
						title: "保存作品",
						description: "满意后点击\"保存\"按钮，将作品保存到你的作品库中。"
					}
				],
				faqs: [
					{
						question: "如何获取更多创作点数？",
						answer: "你可以通过完成每日任务、分享作品或购买点数包来获取更多创作点数。",
						expanded: true
					},
					{
						question: "如何修改已生成的音乐？",
						answer: "在音乐预览页面，你可以点击\"编辑\"按钮进行旋律、节奏或音色的微调。",
						expanded: true
					},
					{
						question: "创作的音乐可以商用吗？",
						answer: "基础创作的音乐仅供个人使用，如需商用，请购买商用授权。",
						expanded: true
					}
				],
				advancedTutorials: [
					{
						id: "3",
						title: "音乐混音技巧",
						description: "学习如何调整音轨平衡",
						icon: "icon-music",
						type: "text",
						category: "advanced"
					},
					{
						id: "4",
						title: "音色调整指南",
						description: "掌握音色参数调整方法",
						icon: "icon-sound",
						type: "text",
						category: "advanced"
					},
					{
						id: "5",
						title: "歌词创作进阶",
						description: "学习专业歌词创作技巧",
						icon: "icon-edit",
						type: "text",
						category: "advanced"
					}
				]
			}
		},
		computed: {
			filteredTutorials() {
				if (this.activeCategory === 0) {
					return [...this.videoTutorials, ...this.advancedTutorials];
				} else {
					const categoryId = this.categories[this.activeCategory].id;
					return [...this.videoTutorials, ...this.advancedTutorials].filter(
						item => item.category === categoryId
					);
				}
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			selectCategory(index) {
				this.activeCategory = index;
			},
			viewTutorial(tutorial) {
				uni.navigateTo({
					url: `/pages/tutorial/detail?id=${tutorial.id}&type=${tutorial.type}`
				});
			},
			viewDetailGuide() {
				uni.navigateTo({
					url: '/pages/tutorial/ai'
				});
			},
			viewDetailSelf(){
				uni.navigateTo({
					url: '/pages/tutorial/self'
				});
			},
			toggleFaq(index) {
				this.faqs[index].expanded = !this.faqs[index].expanded;
				this.$forceUpdate();
			}
		}
	}
</script>

<style lang="scss">
.tutorial-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #121212;
}

/* 内容区域 */
.content-scroll {
	flex: 1;
	height: 100%;
}

/* 分类筛选 */
.category-section {
	padding: 20rpx 30rpx 40rpx;
}

.category-scroll {
	display: flex;
	white-space: nowrap;
}

.category-pill {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 12rpx 24rpx;
	border-radius: 48rpx;
	font-size: 28rpx;
	margin-right: 16rpx;
	background-color: #2D2D2D;
	color: #ACACAC;
	transition: background-color 0.2s;
	height: 60rpx;
	
	&.active {
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
	}
}

/* 通用部分样式 */
.section {
	display: flex;
	flex-direction: column;
	padding: 0 30rpx;
	margin-bottom: 0;
}

.section-header {
	padding: 30rpx 0;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 视频教程卡片 */
.video-list {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.tutorial-card {
	background-color: #1E1E1E;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
	margin-bottom: 24rpx;
}

.tutorial-card-cover {
	height: 280rpx;
	background-size: cover;
	background-position: center;
	position: relative;
}

.gradient-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(to bottom, rgba(18, 18, 18, 0.2), rgba(18, 18, 18, 0.8));
}

.play-icon {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	
	.iconfont {
		font-size: 40rpx;
		color: #FFFFFF;
	}
}

.tutorial-card-info {
	padding: 24rpx;
	display: flex;
	flex-direction: column;
}

.tutorial-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.tutorial-desc {
	font-size: 24rpx;
	color: #ACACAC;
	margin-bottom: 16rpx;
}

.tutorial-meta {
	display: flex;
	justify-content: space-between;
}

.meta-item {
	font-size: 22rpx;
	color: #787878;
}

/* 图文教程样式 */
.guide-card {
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 30rpx;
	display: flex;
	flex-direction: column;
}

.guide-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.guide-desc {
	font-size: 24rpx;
	color: #ACACAC;
	margin-bottom: 40rpx;
}

.steps-list {
	display: flex;
	flex-direction: column;
	margin-bottom: 40rpx;
}

.step-item {
	display: flex;
	position: relative;
	padding-bottom: 48rpx;
	padding-left: 60rpx;
	
	&::before {
		content: '';
		position: absolute;
		left: 32rpx;
		top: 0;
		bottom: 0;
		width: 4rpx;
		background-color: #2D2D2D;
	}
	
	&:last-child {
		padding-bottom: 0;
		
		&::before {
			height: 32rpx;
		}
	}
}

.step-number {
	position: absolute;
	left: 0;
	top: 0;
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	font-weight: 600;
	color: #FFFFFF;
	z-index: 1;
}

.step-content {
	display: flex;
	flex-direction: column;
	margin-left: 20rpx;
}

.step-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.step-desc {
	font-size: 24rpx;
	color: #ACACAC;
}

.guide-action {
	display: flex;
	justify-content: center;
}

.gradient-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	border: none;
	border-radius: 48rpx;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
	font-weight: 600;
}

/* 常见问题样式 */
.faq-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.faq-item {
	background-color: #1E1E1E;
	border-radius: 24rpx;
	padding: 24rpx;
}

.faq-question {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.faq-answer {
	font-size: 24rpx;
	color: #ACACAC;
	display: none;
	
	&.expanded {
		display: block;
	}
}

/* 进阶教程样式 */
.advanced-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding-bottom: 30rpx;
}

.advanced-card {
	display: flex;
	align-items: center;
	background-color: #1E1E1E;
	border-radius: 24rpx;
	padding: 24rpx;
}

.card-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	
	.iconfont {
		font-size: 40rpx;
		color: #FFFFFF;
	}
}

.card-content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.card-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.card-desc {
	font-size: 24rpx;
	color: #ACACAC;
}
</style> 