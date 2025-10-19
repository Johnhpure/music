<template>
	<view class="ai-creation">
		<!-- 新手指引 -->
		<view class="guide-container" v-if="showGuide">
			<view class="guide-header">
				<text class="guide-title">AI创作指南</text>
				<text class="guide-close" @click="closeGuide">×</text>
			</view>
			
			<view class="guide-steps">
				<view class="guide-step">
					<view class="guide-step-number">1</view>
					<view class="guide-step-content">
						<text class="guide-step-title">选择创作提示词</text>
						<text class="guide-step-desc">选择一个模板或输入自定义提示词，描述你想创作的歌曲</text>
					</view>
				</view>
				
				<view class="guide-step">
					<view class="guide-step-number">2</view>
					<view class="guide-step-content">
						<text class="guide-step-title">生成并编辑歌词</text>
						<text class="guide-step-desc">AI会为你创作歌词，你可以选择合适的版本并进行修改</text>
					</view>
				</view>
				
				<view class="guide-step">
					<view class="guide-step-number">3</view>
					<view class="guide-step-content">
						<text class="guide-step-title">选择音乐风格</text>
						<text class="guide-step-desc">为你的歌词选择合适的音乐风格和声音类型</text>
					</view>
				</view>
				
				<view class="guide-step">
					<view class="guide-step-number">4</view>
					<view class="guide-step-content">
						<text class="guide-step-title">生成并保存音乐</text>
						<text class="guide-step-desc">AI将根据歌词和风格生成音乐，你可以保存并分享</text>
					</view>
				</view>
			</view>
			
			<view class="guide-footer">
				<button class="gradient-button" @click="closeGuide">我知道了</button>
			</view>
		</view>
		
		<!-- 主要内容区 -->
		<view class="content-container">
			<!-- 生成前的提示词输入 -->
			<block v-if="!isGenerating && !isGenerated">
				<view class="prompt-section">
					<view class="tishici">
						<view class="section-title">告诉AI你想创作什么样的歌曲...</view>
						<view class="input-container">
							<textarea 
								v-model="customPrompt" 
								placeholder="例如：一首关于夏日海边回忆的轻快歌曲"
								placeholder-style="color: #8E8E8E;"
								maxlength="100"
								auto-height
							></textarea>
							<text class="char-count">{{customPrompt.length}}/100</text>
						</view>
					</view>

					<!-- 选择创作模板 -->
					<view class="template">
					<view class="section-title">选择创作模版</view>
					<scroll-view class="scroll-view-x" scroll-x enable-flex>
						<view class="template-cards">
						<view 
							class="template-card" 
							v-for="(template, index) in filteredTemplates" 
							:key="index"
							@click="selectTemplate(template)"
							:class="{'active': selectedTemplate === template}"
						>
							<view class="template-header">
								<view class="template-icon">{{template.icon}}</view>
								<view class="template-category-tag">#{{template.category}}</view>
							</view>
							<view class="template-content">{{template.content}}</view>
						</view>
						</view>
					</scroll-view>
					</view>

					<!-- 生成按钮 -->
					<view class="action-container">
						<button 
							class="gradient-button" 
							:disabled="!canGenerate" 
							@click="generateLyrics"
						>
							生成歌词
						</button>
						<view class="tips">将消耗10音乐点数</view>
					</view>
				</view>
			</block>
			
			<!-- 生成中的加载状态 -->
			<block v-if="isGenerating">
				<view class="loading-container">
					<view class="loading-animation">
						<view class="loading-circle"></view>
						<view class="loading-text">正在创作中，请稍候...</view>
					</view>
					<view class="tips-container">
						<view class="tip-item">
							<text class="tip-icon">⏱️</text>
							<text>预计需要10-15秒完成创作</text>
						</view>
					</view>
				</view>
			</block>
			
			<!-- 生成后的结果展示 -->
			<block v-if="!isGenerating && isGenerated">
				<view class="result-container">
					<view class="version-header">
						<view class="version-tabs">
							<view 
								class="version-tab" 
								:class="{'active': activeVersion === index}"
								v-for="(version, index) in generatedVersions" 
								:key="index"
								@click="selectVersion(index)"
							>
								版本{{index + 1}}
							</view>
						</view>
					</view>
					
					<!-- 歌词展示 -->
					<view class="lyrics-display">
						<view class="title-input">
							<text class="input-label">歌曲标题</text>
							<input 
								type="text" 
								v-model="currentVersion.title" 
								placeholder="请输入歌曲标题" 
								placeholder-style="color: #8E8E8E;"
								maxlength="30"
								class="title-input-field"
							/>
						</view>
						<view class="lyrics-content">
							<view class="section-header">
								<text class="section-title">歌词内容</text>
								<text class="char-count">{{currentVersion.content.length}}/400</text>
							</view>
							<view class="lyrics-text-area">
								<text>{{currentVersion.content}}</text>
							</view>
						</view>
					</view>
					
					<!-- 底部操作按钮 -->
					<view class="bottom-actions">
						<button class="secondary-button" @click="backToPrompt">
							返回修改提示词
						</button>
						<button class="gradient-button" @click="proceedToNext">
							继续创作
						</button>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentStep: 1, // 当前步骤
				activeCategory: 0, // 当前选中的提示词分类
				selectedTemplate: null, // 当前选中的提示词模板
				customPrompt: '', // 自定义提示词
				isGenerating: false, // 是否正在生成
				isGenerated: false, // 是否已生成结果
				activeVersion: 0, // 当前选中的版本
				isEditing: false, // 是否正在编辑歌词
				showGuide: true, // 是否显示新手指引
				
				// 提示词分类
				promptCategories: [
					{name: '全部', id: 'all'},
					{name: '爱情', id: 'love'},
					{name: '友情', id: 'friendship'},
					{name: '励志', id: 'inspiration'},
					{name: '思念', id: 'missing'},
					{name: '青春', id: 'youth'},
					{name: '情感', id: 'emotion'}
				],
				
				// 提示词模板
				promptTemplates: [
					{
						id: 1,
						category: '爱情',
						content: '写一首关于初次见面就心动的爱情歌曲'
					},
					{
						id: 2,
						category: '爱情',
						content: '写一首表达对爱人思念的歌曲'
					},
					{
						id: 3,
						category: '友情',
						content: '写一首关于多年老友重逢的歌曲'
					},
					{
						id: 4,
						category: '励志',
						content: '写一首关于追逐梦想永不放弃的歌曲'
					},
					{
						id: 5,
						category: '思念',
						content: '写一首关于思念远方亲人的歌曲'
					},
					{
						id: 6,
						category: '青春',
						content: '写一首关于青春校园回忆的歌曲'
					},
					{
						id: 7,
						category: '情感',
						content: '写一首关于生活中小确幸的歌曲'
					},
					{
						id: 8,
						category: '情感',
						content: '写一首表达对生活感悟的歌曲'
					}
				],
				
				// 生成的版本
				generatedVersions: []
			}
		},
		computed: {
			// 根据分类过滤的提示词模板
			filteredTemplates() {
				if (this.activeCategory === 0) {
					return this.promptTemplates;
				} else {
					const category = this.promptCategories[this.activeCategory].name;
					return this.promptTemplates.filter(item => item.category === category);
				}
			},
			// 当前选中的版本
			currentVersion() {
				return this.generatedVersions[this.activeVersion] || {title: '', content: ''};
			},
			// 是否可以生成
			canGenerate() {
				return this.selectedTemplate !== null || this.customPrompt.trim().length > 0;
			}
		},
		onLoad(options) {
			// 加载提示词模板
			this.loadPromptTemplates();
			// 如果有主题ID参数，自动设置提示词
			if(options.themeId && options.themeName) {
				this.setThemePrompt(options.themeId, options.themeName);
			}
		},
		methods: {
			// 加载提示词模板列表
			async loadPromptTemplates() {
				try {
					const res = await this.$minApi.getPromptTemplates();
					if (res.code === 200 && res.data && res.data.length > 0) {
						// 映射API数据到页面数据格式
						this.promptTemplates = res.data.map((item) => {
							return {
								id: item.id,
								category: item.category,
								content: item.title + '：' + item.content,
								icon: item.icon || '🎵'  // 添加icon字段
							};
						});
						console.log('AI创作页：提示词加载成功，共', this.promptTemplates.length, '条');
					}
				} catch (err) {
					console.error('获取提示词列表失败:', err);
					// 失败时保留默认的mock数据
				}
			},
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},
			// 显示帮助
			showHelp() {
				uni.showModal({
					title: 'AI辅助创作说明',
					content: 'AI辅助创作功能通过您提供的提示词，智能生成歌词内容。\n\n提示：\n1. 您可以选择系统提供的提示词模板\n2. 也可以输入自定义提示词表达您的创作想法\n3. 生成后可以查看多个版本，选择您喜欢的继续创作\n4. 您还可以对生成的歌词进行编辑修改',
					showCancel: false,
					confirmText: '我知道了'
				});
			},
			// 选择提示词分类
			selectCategory(index) {
				this.activeCategory = index;
			},
			// 选择提示词模板
			selectTemplate(template) {
				this.selectedTemplate = template;
				// 将模板内容设置到自定义输入框，方便用户进一步修改
				this.customPrompt = template.content;
			},
			// 设置主题提示词
			setThemePrompt(themeId, themeName) {
				// 根据主题设置提示词
				switch(themeId) {
					case '1': // 生日祝福
						this.customPrompt = `写一首生日祝福歌曲，表达对${themeName}的美好祝愿`;
						break;
					case '2': // 告白情书
						this.customPrompt = `写一首表达爱意的歌曲，适合用作告白`;
						break;
					case '3': // 毕业季
						this.customPrompt = `写一首关于毕业季的歌曲，表达对青春和同窗的不舍`;
						break;
					case '4': // 旅途记忆
						this.customPrompt = `写一首关于旅行途中美好记忆的歌曲`;
						break;
					default:
						this.customPrompt = `写一首关于${themeName}的歌曲`;
				}
			},
			// 生成歌词
			async generateLyrics() {
				if(!this.canGenerate) return;
				
				// 检查登录状态
				const token = uni.getStorageSync('token');
				if (!token) {
					uni.showModal({
						title: '提示',
						content: '请先登录后再使用AI创作功能',
						confirmText: '去登录',
						success: (res) => {
							if (res.confirm) {
								uni.switchTab({
									url: '/pages/user/index'
								});
							}
						}
					});
					return;
				}
				
				const prompt = this.customPrompt.trim();
				
				this.isGenerating = true;
				
				try {
					const res = await this.$minApi.promptCompletion({
						messages: [
							{
								role: 'system',
								content: '你是一位专业的歌词创作者，擅长创作富有情感和诗意的中文歌词。请根据用户的提示词创作一首完整的歌词，包含verse和chorus部分。'
							},
							{
								role: 'user',
								content: prompt
							}
						],
						maxTokens: 1000,
						temperature: 0.8
					});
					
					if (res.code === 200 && res.data) {
						const lyricsContent = res.data.content || '';
						
						if (!lyricsContent) {
							throw new Error('生成的歌词内容为空');
						}
						
						this.generatedVersions = [
							{
								title: '生成的歌词',
								content: lyricsContent
							}
						];
						
						this.isGenerated = true;
						this.currentStep = 1;
						
						console.log('歌词生成成功，使用模型:', res.data.usedProvider?.name);
					} else {
						throw new Error(res.message || 'AI服务调用失败');
					}
				} catch (error) {
					console.error('生成歌词失败:', error);
					uni.showToast({
						title: error.message || '生成失败，请重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.isGenerating = false;
				}
			},
			// 选择版本
			selectVersion(index) {
				this.activeVersion = index;
			},
			// 重新生成
			regenerate() {
				uni.showModal({
					title: '重新生成',
					content: '确定要重新生成歌词吗？当前编辑的内容将会丢失。',
					success: (res) => {
						if(res.confirm) {
							this.isGenerated = false;
							this.isEditing = false;
							this.generatedVersions = [];
						}
					}
				});
			},
			// 编辑歌词
			editLyrics() {
				this.isEditing = !this.isEditing;
			},
			// 返回修改提示词
			backToPrompt() {
				uni.showModal({
					title: '返回修改',
					content: '确定要返回修改提示词吗？当前生成的内容将会丢失。',
					success: (res) => {
						if(res.confirm) {
							this.isGenerated = false;
							this.isEditing = false;
							this.generatedVersions = [];
						}
					}
				});
			},
			// 进行下一步
			proceedToNext() {
				// 更新当前步骤
				this.currentStep = 2;
				
				// 跳转到风格选择页面
				uni.navigateTo({
					url: `/pages/creation/style?type=ai&title=${encodeURIComponent(this.currentVersion.title)}&lyrics=${encodeURIComponent(this.currentVersion.content)}`
				});
			},
			// 关闭新手指引
			closeGuide() {
				this.showGuide = false;
			}
		}
	}
</script>

<style lang="scss">
.ai-creation {
	min-height: 100vh;
	background-color: #121212;
	color: #FFFFFF;
	padding: 0 30rpx;
}

.status-bar-height {
	height: var(--status-bar-height);
	width: 100%;
}

.nav-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	
	.left, .right {
		width: 80rpx;
		
		.iconfont {
			font-size: 40rpx;
		}
	}
	
	.center {
		flex: 1;
		text-align: center;
		
		.title {
			font-size: 34rpx;
			font-weight: 600;
		}
	}
}

/* 步骤指示器样式 */
.steps-container {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 0 40rpx;
}

.step-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	
	.step-number {
		width: 50rpx;
		height: 50rpx;
		border-radius: 50%;
		background-color: #2D2D2D;
		color: #ACACAC;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 26rpx;
		margin-bottom: 10rpx;
	}
	
	.step-text {
		font-size: 24rpx;
		color: #ACACAC;
	}
	
	&.active {
		.step-number {
			background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
			color: #FFFFFF;
		}
		
		.step-text {
			color: #FFFFFF;
		}
	}
}

.step-line {
	width: 100rpx;
	height: 2rpx;
	background-color: #2D2D2D;
	margin: 0 20rpx;
	margin-bottom: 20rpx;
}

/* 主内容区样式 */
.content-container {
	padding-bottom: 40rpx;
}

.prompt-section {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.scroll-view-x {
	white-space: nowrap;
	padding-bottom: 10px;
}

/* 标题样式 */
.section-title {
	font-size: 28rpx;
	font-weight: 400;
	color: #8E8E8E;
	padding-bottom: 10rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.char-count {
	font-size: 24rpx;
	color: #8E8E8E;
	
	&.warning {
		color: #FFB443;
	}
	
	&.error {
		color: #FF5C5C;
	}
}

/* 分类标签样式 */
.category-scroll {
	white-space: nowrap;
	margin-top: 15rpx;
}

.category-pill {
	display: inline-block;
	padding: 12rpx 30rpx;
	background-color: #1E1E1E;
	border-radius: 60rpx;
	margin-right: 20rpx;
	font-size: 26rpx;
	color: #ACACAC;
	
	&.active {
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
	}
}

/* 提示词模板卡片样式 */
.template-cards {
	display: flex;
	overflow-y: auto;
	gap: 20rpx;
}

.template-card {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 20rpx;
	border: 2rpx solid transparent;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	min-width: 280rpx;
	
	&.active {
		border-color: #0B67EC;
		background-color: rgba(11, 103, 236, 0.1);
	}
	
	.template-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}
	
	.template-icon {
		width: 56rpx;
		height: 56rpx;
		border-radius: 12rpx;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		flex-shrink: 0;
	}
	
	.template-category-tag {
		font-size: 22rpx;
		color: #ACACAC;
		background-color: rgba(255, 255, 255, 0.05);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}
	
	.template-content {
		font-size: 26rpx;
		color: #FFFFFF;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

/* 自定义提示词区域样式 */
.custom-prompt-section {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.input-container {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 20rpx;
	
	textarea {
		width: 100%;
		min-height: 200rpx;
		font-size: 28rpx;
		color: #FFFFFF;
		line-height: 1.5;
	}
}

.prompt-tip {
	font-size: 24rpx;
	color: #8E8E8E;
	padding: 0 10rpx;
}

/* 按钮样式 */
.action-container {
	// display: flex;
	// flex-direction: column;
	// gap: 15rpx;
	padding: 40rpx 0;
	.tips{
		text-align: center;
		color: #8E8E8E;
		line-height: 60rpx;
	}
}

.gradient-button {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	border-radius: 100rpx;
	padding: 20rpx 0;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	justify-content: center;
	align-items: center;
	
	.icon-right {
		margin-left: 10rpx;
	}
	
	&[disabled] {
		opacity: 0.5;
		background: #666666;
	}
}

.secondary-button {
	background-color: #2D2D2D;
	color: #ACACAC;
	border-radius: 100rpx;
	padding: 20rpx 0;
	font-size: 32rpx;
}

.button-tip {
	text-align: center;
	font-size: 24rpx;
	color: #FF5C5C;
}

/* 加载状态样式 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 60rpx;
	padding: 80rpx 0;
}

.loading-animation {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 30rpx;
	
	.loading-circle {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 6rpx solid rgba(11, 103, 236, 0.1);
		border-top-color: #0B67EC;
		animation: spin 1.5s linear infinite;
	}
	
	.loading-text {
		font-size: 34rpx;
		font-weight: 600;
		color: #FFFFFF;
	}
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.tips-container {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 30rpx;
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.tip-item {
	display: flex;
	align-items: center;
	
	.tip-icon {
		font-size: 30rpx;
		margin-right: 15rpx;
	}
	
	text {
		font-size: 26rpx;
		color: #ACACAC;
	}
}

/* 结果展示样式 */
.result-container {
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.version-header {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.version-tabs {
	display: flex;
	
	.version-tab {
		flex: 1;
		text-align: center;
		padding: 15rpx 0;
		font-size: 28rpx;
		color: #ACACAC;
		border-bottom: 2rpx solid #2D2D2D;
		
		&.active {
			color: #FFFFFF;
			border-bottom-color: #0B67EC;
		}
	}
}

.action-buttons {
	display: flex;
	justify-content: flex-end;
	gap: 30rpx;
}

.action-button {
	display: flex;
	align-items: center;
	
	.button-icon {
		font-size: 26rpx;
		margin-right: 8rpx;
	}
	
	text {
		font-size: 24rpx;
		color: #0B67EC;
	}
}

/* 歌词展示样式 */
.lyrics-display {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.title-input {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
	
	.input-label {
		font-size: 28rpx;
		color: #FFFFFF;
	}
	
	.title-input-field {
		flex: 1;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 32rpx;
		color: #FFFFFF;
		background: transparent;
	}
}

.lyrics-content {
	display: flex;
	flex-direction: column;
	gap: 15rpx;
}

.lyrics-text-area, .lyrics-edit-area {
	background-color: #2D2D2D;
	border-radius: 10rpx;
	padding: 20rpx;
	min-height: 400rpx;
	
	text, textarea {
		font-size: 28rpx;
		color: #FFFFFF;
		line-height: 1.8;
		width: 100%;
	}
}

/* 底部操作按钮 */
.bottom-actions {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
	
	button {
		flex: 1;
	}
}

/* 新手指引样式 */
.guide-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	z-index: 999;
	padding: 40rpx;
}

.guide-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	margin-bottom: 30rpx;
	
	.guide-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #FFFFFF;
	}
	
	.guide-close {
		font-size: 40rpx;
		color: #FFFFFF;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

.guide-steps {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	width: 100%;
	padding: 30rpx;
	margin-bottom: 30rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.guide-step {
	display: flex;
	position: relative;
	
	.guide-step-number {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
	}
	
	.guide-step-content {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		
		.guide-step-title {
			font-size: 28rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
		
		.guide-step-desc {
			font-size: 24rpx;
			color: #ACACAC;
			line-height: 1.4;
		}
	}
}

.guide-footer {
	width: 100%;
	display: flex;
	justify-content: center;
	
	button {
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
		border-radius: 100rpx;
		padding: 20rpx 0;
		font-size: 32rpx;
		font-weight: 600;
		width: 60%;
	}
}
</style> 