<template>
	<view class="tutorial-steps-container">
		
		<!-- 步骤指示器 -->
		<view class="step-indicator">
			<view 
				class="step-dot" 
				:class="{'active': currentStep === index + 1}"
				v-for="(step, index) in steps" 
				:key="index"
				@click="jumpToStep(index + 1)"
			></view>
		</view>
		
		<!-- 步骤内容 -->
		<scroll-view class="step-content" scroll-y @scroll="onScroll">
			<view class="step-container" :id="`step${currentStep}`">
				<view class="step-header">
					<view class="step-number">{{ currentStep }}</view>
					<text class="step-title">{{ currentStepData.title }}</text>
				</view>
				
				<view class="step-image" :style="{'background-image': `url(${currentStepData.image})`}"></view>
				
				<view class="step-description">
					<text class="desc-text">{{ currentStepData.description }}</text>
				</view>
				
				<view class="operation-steps">
					<text class="operation-title">操作步骤：</text>
					<view class="operation-list">
						<view class="operation-item" v-for="(item, index) in currentStepData.operations" :key="index">
							<text class="operation-number">{{ index + 1 }}</text>
							<text class="operation-text">{{ item }}</text>
						</view>
					</view>
				</view>
				
				<view class="step-tip">
					<text class="tip-icon iconfont icon-bulb"></text>
					<view class="tip-content">
						<text class="tip-label">小提示：</text>
						<text class="tip-text">{{ currentStepData.tip }}</text>
					</view>
				</view>
				
				<view class="action-button-container" v-if="currentStep === steps.length">
					<button class="gradient-button" @click="startCreation">开始创作</button>
				</view>
			</view>
		</scroll-view>
		
		<!-- 步骤导航 -->
		<view class="step-navigation">
			<button 
				class="nav-button prev-button" 
				:disabled="currentStep === 1"
				@click="prevStep"
			>
				<text class="iconfont icon-left"></text>
				<text>上一步</text>
			</button>
			
			<text class="step-counter">{{ currentStep }}/{{ steps.length }}</text>
			
			<button 
				class="nav-button next-button" 
				@click="nextStep"
			>
				<text v-if="currentStep < steps.length">下一步</text>
				<text v-else>完成</text>
				<text class="iconfont" :class="currentStep < steps.length ? 'icon-right' : 'icon-check'"></text>
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentStep: 1,
				scrollTop: 0,
				steps: [
					{
						title: "选择创作模式",
						image: "/static/img/tutorials/ai-step1.jpg",
						description: "在开始AI辅助创作之前，你需要进入正确的创作模式。AI辅助创作模式可以帮助你快速生成音乐作品，即使你没有专业的音乐知识。",
						operations: [
							"打开AI音乐创作小程序",
							"在底部导航栏中点击\"创作\"按钮",
							"在创作中心页面，选择\"AI辅助创作\"选项"
						],
						tip: "你也可以直接在首页的快捷入口中点击\"AI创作\"按钮，直接进入AI辅助创作页面。"
					},
					{
						title: "输入创作提示",
						image: "/static/img/tutorials/ai-step2.jpg",
						description: "进入AI辅助创作页面后，你需要输入创作提示，告诉AI你想要什么样的音乐。提示越具体，生成的音乐就越符合你的期望。",
						operations: [
							"在提示输入框中，描述你想要的音乐风格、情感或主题",
							"可以输入如\"一首轻快的夏日海滩音乐\"或\"忧伤的钢琴曲，适合雨天聆听\"",
							"尽量使用具体的形容词和场景描述，而不是抽象的概念"
						],
						tip: "你可以参考页面下方的\"热门提示\"获取灵感，这些是其他用户常用的有效提示。"
					},
					{
						title: "选择音乐风格",
						image: "/static/img/tutorials/ai-step3.jpg",
						description: "选择合适的音乐风格可以让AI更准确地理解你的创作意图。不同的风格会影响音乐的节奏、和声结构和音色选择。",
						operations: [
							"在\"风格选择\"区域，浏览可用的音乐风格",
							"点击你喜欢的风格卡片进行选择",
							"你可以选择主流风格如流行、摇滚、电子、古典等",
							"也可以选择更具体的子风格，如EDM、爵士蓝调、民谣等"
						],
						tip: "如果不确定选择哪种风格，可以点击\"风格推荐\"按钮，AI会根据你的创作提示推荐合适的风格。"
					},
					{
						title: "生成音乐",
						image: "/static/img/tutorials/ai-step4.jpg",
						description: "完成前面的设置后，就可以开始生成音乐了。AI会根据你的提示和选择的风格，创作出一首独特的音乐作品。",
						operations: [
							"检查你的创作提示和风格选择是否符合预期",
							"点击页面底部的\"生成音乐\"按钮",
							"等待AI处理，这通常需要10-30秒的时间"
						],
						tip: "生成音乐会消耗创作点数，请确保你有足够的点数。每次生成一首完整歌曲通常需要10个点数。"
					},
					{
						title: "预览与调整",
						image: "/static/img/tutorials/ai-step5.jpg",
						description: "AI生成音乐后，你可以预览并决定是否需要进一步调整。如果生成的音乐不完全符合你的期望，可以进行微调或重新生成。",
						operations: [
							"在预览页面，点击播放按钮聆听生成的音乐",
							"使用进度条跳转到音乐的不同部分",
							"如需调整，点击\"编辑\"按钮进入编辑模式",
							"如果完全不满意，可以点击\"重新生成\"按钮"
						],
						tip: "在编辑模式中，你可以调整音乐的节奏、音色、混音效果等参数，使音乐更符合你的期望。"
					},
					{
						title: "保存作品",
						image: "/static/img/tutorials/ai-step6.jpg",
						description: "当你对生成的音乐满意后，就可以保存作品了。保存后的作品会出现在你的作品库中，你可以随时访问、分享或进一步编辑。",
						operations: [
							"在预览页面，点击\"保存\"按钮",
							"输入作品标题、描述和标签",
							"选择是否公开分享你的作品",
							"点击\"确认保存\"按钮完成保存"
						],
						tip: "添加准确的标签可以帮助其他用户更容易地发现你的作品。如果你的作品获得点赞和分享，你还可以获得额外的创作点数奖励。"
					}
				]
			}
		},
		computed: {
			currentStepData() {
				return this.steps[this.currentStep - 1] || {};
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			shareGuide() {
				uni.showToast({
					title: '分享功能开发中',
					icon: 'none'
				});
			},
			jumpToStep(step) {
				if (step >= 1 && step <= this.steps.length) {
					this.currentStep = step;
					this.scrollTop = 0;
				}
			},
			prevStep() {
				if (this.currentStep > 1) {
					this.currentStep--;
					this.scrollTop = 0;
				}
			},
			nextStep() {
				if (this.currentStep < this.steps.length) {
					this.currentStep++;
					this.scrollTop = 0;
				} else {
					// 最后一步，点击完成按钮
					this.goBack();
				}
			},
			onScroll(e) {
				this.scrollTop = e.detail.scrollTop;
			},
			startCreation() {
				uni.navigateTo({
					url: '/pages/creation/ai'
				});
			}
		}
	}
</script>

<style lang="scss">
.tutorial-steps-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #121212;
}

.status-bar-height {
	height: var(--status-bar-height);
	width: 100%;
}

/* 顶部导航栏 */
.nav-bar {
	display: flex;
	align-items: center;
	padding: 16rpx 30rpx;
	
	.left, .right {
		width: 80rpx;
		display: flex;
		justify-content: center;
		
		.iconfont {
			font-size: 40rpx;
			color: #FFFFFF;
		}
	}
	
	.center {
		flex: 1;
		text-align: center;
		
		.title {
			font-size: 34rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
	}
}

/* 步骤指示器 */
.step-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 0 40rpx;
}

.step-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: #3D3D3D;
	margin: 0 8rpx;
	transition: all 0.3s ease;
	
	&.active {
		width: 48rpx;
		border-radius: 8rpx;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	}
}

/* 步骤内容 */
.step-content {
	flex: 1;
	height: 100%;
	padding: 0 30rpx;
}

.step-container {
	display: flex;
	flex-direction: column;
	padding-bottom: 160rpx;
}

.step-header {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.step-number {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-right: 20rpx;
}

.step-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.step-image {
	width: 100%;
	height: 320rpx;
	background-size: cover;
	background-position: center;
	border-radius: 32rpx;
	margin-bottom: 30rpx;
	position: relative;
	
	&::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(18, 18, 18, 0.1), rgba(18, 18, 18, 0.4));
		border-radius: 32rpx;
	}
}

.step-description {
	margin-bottom: 30rpx;
	
	.desc-text {
		font-size: 28rpx;
		color: #ACACAC;
		line-height: 1.6;
	}
}

.operation-steps {
	margin-bottom: 30rpx;
}

.operation-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 20rpx;
	display: block;
}

.operation-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.operation-item {
	display: flex;
	align-items: flex-start;
}

.operation-number {
	width: 40rpx;
	height: 40rpx;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	background-color: #2D2D2D;
	border-radius: 50%;
	font-size: 24rpx;
	color: #FFFFFF;
	margin-right: 16rpx;
}

.operation-text {
	flex: 1;
	font-size: 28rpx;
	color: #ACACAC;
	line-height: 1.5;
}

.step-tip {
	background-color: rgba(11, 103, 236, 0.1);
	border-left: 8rpx solid #0B67EC;
	border-radius: 0 16rpx 16rpx 0;
	padding: 24rpx;
	display: flex;
	margin-bottom: 40rpx;
}

.tip-icon {
	color: #0B67EC;
	font-size: 40rpx;
	margin-right: 16rpx;
}

.tip-content {
	flex: 1;
}

.tip-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-right: 8rpx;
}

.tip-text {
	font-size: 26rpx;
	color: #ACACAC;
	line-height: 1.5;
}

.action-button-container {
	display: flex;
	justify-content: center;
	margin-top: 60rpx;
}

.gradient-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	border: none;
	border-radius: 96rpx;
	padding: 0 60rpx;
	height: 90rpx;
	line-height: 90rpx;
	font-size: 32rpx;
	font-weight: 600;
}

/* 步骤导航 */
.step-navigation {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #1E1E1E;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.2);
}

.step-counter {
	font-size: 28rpx;
	color: #787878;
}

.nav-button {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 40rpx;
	border-radius: 48rpx;
	height: 90rpx;
	font-size: 28rpx;
	font-weight: 600;
	
	.iconfont {
		font-size: 28rpx;
	}
}

.prev-button {
	background-color: #2D2D2D;
	color: #ACACAC;
	
	.iconfont {
		margin-right: 8rpx;
	}
	
	&:disabled {
		opacity: 0.5;
	}
}

.next-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	
	.iconfont {
		margin-left: 8rpx;
	}
}
</style>
