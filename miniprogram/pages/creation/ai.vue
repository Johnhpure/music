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
								maxlength="500"
								:disabled="isExpandingInspiration"
								class="inspiration-textarea"
							></textarea>
							
							<!-- AI灵感扩展按钮 -->
							<view class="ai-expand-btn" @click="expandInspiration" :class="{ 'generating': isExpandingInspiration, 'disabled': isExpandingInspiration }">
								<view class="ai-btn-content">
									<view class="ai-icon" :class="{ 'spinning': isExpandingInspiration }">
										<text v-if="!isExpandingInspiration">🤖</text>
										<view v-else class="loading-spinner"></view>
									</view>
									<text class="ai-text" v-if="!isExpandingInspiration">AI扩展灵感</text>
									<text class="ai-text" v-else>生成中...</text>
								</view>
								<view class="ai-glow" v-if="!isExpandingInspiration"></view>
							</view>
							
							<text class="char-count">{{customPrompt.length}}/500</text>
							
							<!-- 免费次数提示 -->
							<view class="inspiration-tips" v-if="showInspirationTips">
								<text class="tips-text">
									{{freeInspirationCount > 0 ? `剩余${freeInspirationCount}次免费AI灵感扩展` : '每次AI灵感扩展需要10点数'}}
								</text>
							</view>
						</view>
					</view>

					<!-- 选择创作模板 -->
					<view class="template-section">
						<view class="section-title">选择创作模版</view>
						
						<!-- 分类标签 -->
						<view class="category-tabs">
							<view 
								class="category-tab" 
								v-for="(category, index) in visibleCategories" 
								:key="index"
								@click="selectCategory(index)"
								:class="{'active': activeCategory === index}"
							>
								<text class="category-name">{{category.name}}</text>
							</view>
						</view>
						
						<!-- 模板网格 -->
						<view class="template-grid">
							<view 
								class="template-item" 
								v-for="(template, index) in visibleTemplates" 
								:key="template.id"
								@click="selectTemplate(template)"
								:class="{'selected': selectedTemplate === template}"
							>
								<view class="template-header">
									<view class="template-icon">
										<text class="icon-emoji">{{getCategoryIcon(template.category)}}</text>
									</view>
									<view class="template-category-badge">{{template.category}}</view>
								</view>
								<view class="template-content">{{template.content}}</view>
								<view class="template-footer">
									<view class="select-indicator" v-if="selectedTemplate === template">
										<text class="check-icon">✓</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 换一批按钮 -->
						<view class="change-batch-container" v-if="hasMoreTemplates">
							<view class="change-batch-btn" @click="changeTemplateBatch">
								<view class="batch-icon">🔄</view>
								<text class="batch-text">换一批</text>
								<text class="batch-info">({{currentBatchIndex + 1}}/{{totalBatches}})</text>
							</view>
						</view>
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
						<view class="tips">将消耗10音乐点数（生成2个版本）</view>
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
				currentRequestId: null, // 当前生成记录的ID
				
				// AI灵感扩展相关
				isExpandingInspiration: false, // 是否正在扩展灵感
				freeInspirationCount: 3, // 剩余免费次数
				showInspirationTips: true, // 是否显示免费次数提示
				inspirationCostPerTime: 10, // 每次扩展消耗的点数
				
				// 模板分页相关
				currentBatchIndex: 0, // 当前批次索引
				templatesPerBatch: 4, // 每批显示的模板数量
				categoriesPerPage: 6, // 每页显示的分类数量
				
				// 提示词分类
				promptCategories: [
					{name: '全部', id: 'all'}
				],
				
				// 提示词模板
				promptTemplates: [],
				
				// 生成的版本
				generatedVersions: []
			}
		},
		computed: {
			// 显示的分类（只显示前6个）
			visibleCategories() {
				return this.promptCategories.slice(0, this.categoriesPerPage);
			},
			
			// 根据分类过滤的提示词模板
			filteredTemplates() {
				if (this.activeCategory === 0) {
					return this.promptTemplates;
				} else {
					const category = this.promptCategories[this.activeCategory].name;
					return this.promptTemplates.filter(item => item.category === category);
				}
			},
			
			// 显示的模板（当前批次的4个）
			visibleTemplates() {
				const startIndex = this.currentBatchIndex * this.templatesPerBatch;
				const endIndex = startIndex + this.templatesPerBatch;
				return this.filteredTemplates.slice(startIndex, endIndex);
			},
			
			// 总批次数
			totalBatches() {
				return Math.ceil(this.filteredTemplates.length / this.templatesPerBatch);
			},
			
			// 是否有更多模板（显示换一批按钮）
			hasMoreTemplates() {
				return this.totalBatches > 1;
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
		async onLoad(options) {
			// 如果有主题ID参数，自动设置提示词
			if(options.themeId && options.themeName) {
				this.setThemePrompt(options.themeId, options.themeName);
			}
			
			// 加载创作模板数据
			await this.loadPromptData();
			
			// 加载用户免费AI扩展次数
			this.loadUserInspirationCount();
		},
		methods: {
			// 加载用户免费AI扩展次数
			async loadUserInspirationCount() {
				try {
					// 从本地存储获取用户免费次数
					const today = new Date().toDateString();
					const lastUseDate = uni.getStorageSync('inspiration_last_use_date');
					const storedCount = uni.getStorageSync('inspiration_free_count');
					
					// 如果是新的一天，重置免费次数
					if (lastUseDate !== today) {
						this.freeInspirationCount = 3;
						uni.setStorageSync('inspiration_last_use_date', today);
						uni.setStorageSync('inspiration_free_count', 3);
					} else {
						// 使用存储的次数
						this.freeInspirationCount = storedCount || 3;
					}
					
					console.log('🎯 用户免费AI扩展次数:', this.freeInspirationCount);
				} catch (error) {
					console.error('加载用户免费次数失败:', error);
					// 默认给3次免费机会
					this.freeInspirationCount = 3;
				}
			},

			// 加载创作模板数据
			async loadPromptData() {
				try {
					// 加载分类
					const categoriesResponse = await this.$api.getPromptCategories();
					if (categoriesResponse.code === 200 && categoriesResponse.data) {
						// 保留"全部"分类，添加后端返回的分类
						this.promptCategories = [
							{name: '全部', id: 'all'},
							...categoriesResponse.data.map(category => ({
								name: category,
								id: category.toLowerCase()
							}))
						];
					}

					// 加载模板
					const templatesResponse = await this.$api.getPromptTemplates();
					if (templatesResponse.code === 200 && templatesResponse.data) {
						this.promptTemplates = templatesResponse.data.map(template => ({
							id: template.id,
							title: template.title,
							category: template.category,
							content: template.content,
							icon: template.icon,
							sortOrder: template.sortOrder,
							usageCount: template.usageCount
						}));
					}

					console.log('🎵 加载创作模板成功:', {
						categories: this.promptCategories.length,
						templates: this.promptTemplates.length
					});
				} catch (error) {
					console.error('❌ 加载创作模板失败:', error);
					// 使用默认的分类图标映射
					this.promptCategories = [
						{name: '全部', id: 'all'},
						{name: '爱情', id: 'love'},
						{name: '友情', id: 'friendship'},
						{name: '励志', id: 'inspiration'},
						{name: '思念', id: 'missing'},
						{name: '青春', id: 'youth'},
						{name: '情感', id: 'emotion'}
					];
					
					// 提示用户
					uni.showToast({
						title: '模板加载失败，使用默认模板',
						icon: 'none'
					});
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
				// 切换分类时重置到第一批
				this.currentBatchIndex = 0;
			},
			
			// 换一批模板
			changeTemplateBatch() {
				this.currentBatchIndex = (this.currentBatchIndex + 1) % this.totalBatches;
			},
			// AI灵感扩展功能
			async expandInspiration() {
				try {
					// 检查用户输入是否为空
					if (!this.customPrompt.trim()) {
						uni.showToast({
							title: '请先输入创作主题',
							icon: 'none'
						});
						return;
					}

					// 检查登录状态
					const isLoggedIn = this.$store.getters.isLoggedIn;
					if (!isLoggedIn) {
						uni.showModal({
							title: '请先登录',
							content: '需要登录后才能使用AI灵感扩展功能',
							showCancel: false,
							success: () => {
								uni.navigateTo({
									url: '/pages/login/index'
								});
							}
						});
						return;
					}

					// 如果没有免费次数，提示用户需要消耗点数
					if (this.freeInspirationCount <= 0) {
						const confirmResult = await this.showConfirmDialog(
							'确认消费',
							`AI灵感扩展需要消耗${this.inspirationCostPerTime}点数，是否继续？`
						);
						if (!confirmResult) {
							return;
						}
					}

					// 开始扩展
					this.isExpandingInspiration = true;
					
					// 调用后端AI扩展API
					const response = await this.$api.expandInspiration({
						originalPrompt: this.customPrompt.trim()
					});

					if (response.code === 200 && response.data) {
						// 成功获取扩展内容
						const { expandedContent, remainingFreeCount, costCredits } = response.data;
						
						// 更新文本框内容
						this.customPrompt = expandedContent;
						
						// 更新免费次数（使用后端返回的值）
						this.freeInspirationCount = remainingFreeCount;
						
						// 更新本地存储
						const today = new Date().toDateString();
						uni.setStorageSync('inspiration_last_use_date', today);
						uni.setStorageSync('inspiration_free_count', remainingFreeCount);
						
						// 显示成功提示
						let toastMsg = 'AI灵感扩展成功！';
						if (costCredits > 0) {
							toastMsg += `（消耗${costCredits}点数）`;
						} else if (remainingFreeCount > 0) {
							toastMsg += `（剩余${remainingFreeCount}次免费）`;
						}
						
						uni.showToast({
							title: toastMsg,
							icon: 'success',
							duration: 2000
						});
						
					} else {
						// API返回错误
						let errorMsg = response.message || 'AI扩展失败，请重试';
						
						// 特殊处理点数不足错误
						if (response.code === 402 || errorMsg.includes('点数不足')) {
							uni.showModal({
								title: '点数不足',
								content: '您的点数余额不足，请先充值',
								showCancel: true,
								cancelText: '取消',
								confirmText: '去充值',
								success: (res) => {
									if (res.confirm) {
										uni.navigateTo({
											url: '/pages/credit/index'
										});
									}
								}
							});
							return;
						}
						
						uni.showToast({
							title: errorMsg,
							icon: 'none'
						});
					}

				} catch (error) {
					console.error('AI灵感扩展失败:', error);
					uni.showToast({
						title: '网络错误，请重试',
						icon: 'none'
					});
				} finally {
					this.isExpandingInspiration = false;
				}
			},

			// 获取用户积分
			async getUserPoints() {
				try {
					// 这里应该调用获取用户信息的API
					// 暂时返回模拟数据
					return 320; // 模拟用户有320点数
				} catch (error) {
					console.error('获取用户积分失败:', error);
					return 0;
				}
			},

			// 获取用户ID
			getUserId() {
				// 这里应该从存储或状态管理中获取用户ID
				// 暂时返回模拟ID
				return 'user_12345';
			},

			// 显示确认对话框
			showConfirmDialog(title, content) {
				return new Promise((resolve) => {
					uni.showModal({
						title: title,
						content: content,
						success: (res) => {
							resolve(res.confirm);
						},
						fail: () => {
							resolve(false);
						}
					});
				});
			},

			// 获取分类图标
			getCategoryIcon(category) {
				const iconMap = {
					'爱情': '💕',
					'友情': '🤝',
					'励志': '🌟',
					'思念': '🌙',
					'青春': '🌸',
					'情感': '💭',
					'全部': '🎵'
				};
				return iconMap[category] || '🎼';
			},

						// 选择提示词模板
			async selectTemplate(template) {
				this.selectedTemplate = template;
				// 将模板内容设置到自定义输入框，方便用户进一步修改
				this.customPrompt = template.content;
				
				// 记录模板使用
				try {
					await this.$api.recordTemplateUsage(template.id);
					console.log('✅ 模板使用记录成功:', template.id);
				} catch (error) {
					console.log('⚠️ 模板使用记录失败:', error);
					// 不影响用户体验，静默失败
				}
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
				const user = this.$store.getters.user;
				const isLoggedIn = this.$store.getters.isLoggedIn;
				console.log('🔐 登录状态检查:');
				console.log('  - user:', user);
				console.log('  - isLoggedIn:', isLoggedIn);
				console.log('  - token:', user?.token || user?.ApiToken);
				
				if(!isLoggedIn) {
					uni.showModal({
						title: '请先登录',
						content: '需要登录后才能使用AI歌词生成功能',
						showCancel: false,
						success: () => {
							uni.navigateTo({
								url: '/pages/login/index'
							});
						}
					});
					return;
				}
				
				// 设置生成状态
				this.isGenerating = true;
				
				// 获取提示词
				const prompt = this.customPrompt.trim();
				
				// 准备API请求参数
				const params = {
					theme: prompt,
					style: 'pop',
					mood: 'happy',
					language: 'chinese',
					versionsCount: 2,
					additionalRequirements: '请创作一首完整的歌曲，包含主歌和副歌结构'
				};
				
				try {
					// 检查API对象是否存在
					console.log('🔍 API对象检查:', this.$api);
					console.log('🎵 开始调用歌词生成API，参数:', params);
					
					// 调用后端AI歌词生成API
					const response = await this.$api.generateLyrics(params);
					
					if(response.code === 200 && response.data) {
						// 转换API返回的数据格式为前端需要的格式
						this.generatedVersions = response.data.versions.map(version => ({
							title: version.title,
							content: version.lyrics
						}));
						
						// 保存生成记录ID，用于后续操作
						this.currentRequestId = response.data.requestId;
						
						// 更新状态
						this.isGenerated = true;
						this.currentStep = 1;
						
						// 显示成功提示
						uni.showToast({
							title: '歌词生成成功',
							icon: 'success'
						});
					} else {
						// 处理API返回的错误
						let errorMessage = '歌词生成失败，请稍后重试';
						
						if(response.code === 402) {
							errorMessage = '点数不足，请先充值';
						} else if(response.message) {
							errorMessage = response.message;
						}
						
						uni.showModal({
							title: '生成失败',
							content: errorMessage,
							showCancel: false
						});
					}
				} catch (error) {
					console.error('AI歌词生成失败:', error);
					
					// 显示网络错误提示
					uni.showModal({
						title: '生成失败',
						content: '网络连接异常，请检查网络后重试',
						showCancel: false
					});
				} finally {
					// 无论成功失败都要重置生成状态
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

/* 模板选择区域样式 */
.template-section {
	margin-bottom: 40rpx;
}

/* 分类标签样式 */
.category-tabs {
	display: flex;
	flex-wrap: nowrap; /* 不换行 */
	gap: 16rpx;
	margin-bottom: 30rpx;
	padding: 0 10rpx;
	overflow-x: auto; /* 允许横向滚动 */
	scrollbar-width: none; /* 隐藏滚动条 Firefox */
	-ms-overflow-style: none; /* 隐藏滚动条 IE */
}

/* 隐藏webkit浏览器的滚动条 */
.category-tabs::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}

.category-tab {
	padding: 12rpx 24rpx;
	background: rgba(255, 255, 255, 0.1);
	border: 2rpx solid transparent;
	border-radius: 25rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	backdrop-filter: blur(10rpx);
	flex-shrink: 0; /* 防止标签被压缩 */
	white-space: nowrap; /* 文字不换行 */
}

.category-tab.active {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-color: rgba(255, 255, 255, 0.2);
	transform: translateY(-2rpx);
	box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
}

.category-name {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 500;
}

/* 模板网格样式 */
.template-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
	gap: 20rpx;
	padding: 0 10rpx;
}

.template-item {
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.1);
	border-radius: 20rpx;
	padding: 24rpx;
	cursor: pointer;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(20rpx);
	position: relative;
	overflow: hidden;
}

.template-item::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

.template-item:hover::before {
	opacity: 1;
}

.template-item:hover {
	transform: translateY(-8rpx);
	border-color: rgba(102, 126, 234, 0.3);
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
}

.template-item.selected {
	background: linear-gradient(145deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
	border-color: rgba(102, 126, 234, 0.5);
	transform: translateY(-4rpx);
	box-shadow: 0 12rpx 30rpx rgba(102, 126, 234, 0.4);
}

/* 模板头部 */
.template-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.template-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(10rpx);
}

.icon-emoji {
	font-size: 32rpx;
	line-height: 1;
}

.template-category-badge {
	padding: 6rpx 12rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 12rpx;
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: 500;
	backdrop-filter: blur(10rpx);
}

/* 模板内容 */
.template-content {
	font-size: 26rpx;
	color: #FFFFFF;
	line-height: 1.5;
	margin-bottom: 16rpx;
	opacity: 0.9;
}

/* 模板底部 */
.template-footer {
	display: flex;
	justify-content: flex-end;
	min-height: 30rpx;
}

.select-indicator {
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	animation: bounceIn 0.5s ease;
}

.check-icon {
	font-size: 18rpx;
	color: #FFFFFF;
	font-weight: bold;
}

/* 换一批按钮样式 */
.change-batch-container {
	display: flex;
	justify-content: center;
	margin-top: 30rpx;
	padding: 0 10rpx;
}

.change-batch-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 32rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.2);
	border-radius: 30rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	backdrop-filter: blur(15rpx);
}

.change-batch-btn:hover {
	transform: translateY(-4rpx);
	background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
	border-color: rgba(102, 126, 234, 0.4);
	box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.3);
}

.change-batch-btn:active {
	transform: translateY(-2rpx);
}

.batch-icon {
	font-size: 28rpx;
	line-height: 1;
	animation: rotate360 2s linear infinite;
}

.batch-text {
	font-size: 26rpx;
	color: #FFFFFF;
	font-weight: 500;
}

.batch-info {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
	font-weight: 400;
}

/* 动画定义 */
@keyframes bounceIn {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	50% {
		transform: scale(1.2);
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes rotate360 {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
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
/* AI灵感扩展按钮样式 */
.ai-expand-btn {
	position: absolute;
	bottom: 30rpx;
	right: 20rpx;
	width: 200rpx;
	height: 70rpx;
	border-radius: 35rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 8rpx 25rpx rgba(102, 126, 234, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	z-index: 10;
	overflow: hidden;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-expand-btn:hover {
	transform: translateY(-4rpx);
	box-shadow: 0 12rpx 35rpx rgba(102, 126, 234, 0.5);
}

.ai-expand-btn.generating {
	background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
	box-shadow: 0 8rpx 25rpx rgba(255, 154, 158, 0.4);
}

.ai-expand-btn.disabled {
	pointer-events: none;
}

/* 按钮内容容器 */
.ai-btn-content {
	display: flex;
	align-items: center;
	gap: 12rpx;
	z-index: 2;
	position: relative;
}

/* AI图标样式 */
.ai-icon {
	font-size: 32rpx;
	color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.3s ease;
}

.ai-icon.spinning {
	animation: pulse 1.5s ease-in-out infinite;
}

/* 按钮文字 */
.ai-text {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 600;
	white-space: nowrap;
	letter-spacing: 0.5rpx;
}

/* 发光效果 */
.ai-glow {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 35rpx;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
	animation: shimmer 2s ease-in-out infinite;
}

/* 加载动画图标 */
.loading-spinner {
	width: 24rpx;
	height: 24rpx;
	border: 3rpx solid rgba(255, 255, 255, 0.3);
	border-top: 3rpx solid #FFFFFF;
	border-radius: 50%;
	animation: rotate 1s linear infinite;
}

/* 加载动画样式 */
.loading-dots {
	display: flex;
	gap: 4rpx;
}

.dot {
	width: 4rpx;
	height: 4rpx;
	border-radius: 50%;
	background-color: #FFFFFF;
	animation: bounce 1.4s ease-in-out infinite both;
}

.dot1 {
	animation-delay: -0.32s;
}

.dot2 {
	animation-delay: -0.16s;
}

.dot3 {
	animation-delay: 0s;
}

/* 免费次数提示样式 */
.inspiration-tips {
	position: absolute;
	bottom: -40rpx;
	left: 0;
	right: 0;
	text-align: center;
}

.tips-text {
	font-size: 20rpx;
	color: #8E8E8E;
	background: rgba(0, 0, 0, 0.05);
	padding: 8rpx 12rpx;
	border-radius: 12rpx;
	display: inline-block;
}

/* 动画定义 */
@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

@keyframes shimmer {
	0% {
		opacity: 0.6;
		transform: translateX(-100%);
	}
	50% {
		opacity: 1;
	}
	100% {
		opacity: 0.6;
		transform: translateX(100%);
	}
}

@keyframes bounce {
	0%, 80%, 100% {
		transform: scale(0);
	}
	40% {
		transform: scale(1);
	}
}

/* 调整输入框容器样式，为AI按钮留出空间 */
.input-container {
	position: relative;
	padding-bottom: 60rpx; /* 为提示文本留出空间，减少因为固定高度 */
}

/* 通用textarea样式（如果有其他textarea不使用专用类） */
.input-container textarea:not(.inspiration-textarea) {
	padding-right: 220rpx; /* 为AI按钮留出水平空间 */
	padding-bottom: 30rpx; /* 为AI按钮留出垂直空间 */
	min-height: 120rpx; /* 确保有足够高度 */
}

/* 创作灵感文本框样式 */
.inspiration-textarea {
	width: 100%;
	height: 200rpx; /* 固定高度 */
	box-sizing: border-box;
	border: 2rpx solid #E8E8E8;
	border-radius: 12rpx;
	padding: 20rpx 220rpx 20rpx 20rpx; /* 右侧留出AI按钮空间 */
	font-size: 28rpx;
	line-height: 1.5;
	color: #333333;
	background-color: #FFFFFF;
	resize: none; /* 禁止调整大小 */
	overflow-y: auto; /* 允许垂直滚动 */
	word-wrap: break-word; /* 自动换行 */
	/* 隐藏滚动条但保持滚动功能 */
	scrollbar-width: none; /* Firefox */
	-ms-overflow-style: none; /* Internet Explorer 10+ */
}

/* 隐藏webkit浏览器的滚动条 */
.inspiration-textarea::-webkit-scrollbar {
	display: none;
	width: 0;
	height: 0;
}

</style> 