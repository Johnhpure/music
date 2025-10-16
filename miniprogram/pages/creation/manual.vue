<template>
	<view class="manual-creation">
		<!-- 创作表单 -->
		<view class="creation-form">
			<!-- 标题输入 -->
			<view class="form-item title-input">
				<text class="label">歌曲标题</text>
				<view class="input-wrapper">
					<input 
						type="text" 
						v-model="songTitle" 
						placeholder="请输入歌曲标题（最多20字）" 
						placeholder-style="color: #8E8E8E;" 
						maxlength="20"
						class="title-input-field"
					/>
					<text class="char-count">{{songTitle.length}}/20</text>
				</view>
			</view>
			
			<text class="tips">请勿输入违规、侵权或敏感内容，系统将自动审核</text>
			<!-- 歌词输入 -->
			<view class="form-item lyrics-input">
				<view class="label-row">
					<text class="label">歌词内容</text>
					<view class="label-row-right">
						<text>最多400字</text>
						<image src="/static/img/icon/copy.svg"></image>
					</view>
				</view>
				

				<view class="textarea-container">
					<textarea 
						v-model="lyrics" 
						placeholder="请输入歌词内容..."
						placeholder-style="color: #8E8E8E;"
						maxlength="400"
					></textarea>
					<text class="char-count" :class="{'warning': lyricsLength > 360, 'error': lyricsLength > 400}">{{lyricsLength}}/400</text>
				</view>
			</view>
		</view>
		
		<!-- 底部按钮 -->
		<view class="bottom-action">
			<button class="next-btn" :disabled="!canProceed" @click="proceedToNext">
				下一步
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				songTitle: '', // 歌曲标题
				lyrics: '', // 歌词内容
				lastSaveTime: '刚刚', // 最后保存时间
				autoSaveTimer: null, // 自动保存定时器
				isDirty: false, // 是否有未保存的修改
				textareaHeight: '400rpx' // 文本框高度
			}
		},
		computed: {
			// 歌词长度
			lyricsLength() {
				return this.lyrics.length;
			},
			// 是否可以进行下一步
			canProceed() {
				return this.songTitle.trim().length > 0 && 
					   this.lyrics.trim().length > 0 && 
					   this.lyrics.length <= 400;
			},
			// 进行下一步的提示信息
			proceedTips() {
				if(this.songTitle.trim().length === 0) {
					return '请输入歌曲标题';
				}
				if(this.lyrics.trim().length === 0) {
					return '请输入歌词内容';
				}
				if(this.lyrics.length > 400) {
					return '歌词内容已超出字数限制';
				}
				return '';
			}
		},
		onLoad() {
			// 恢复草稿
			this.restoreDraft();
			// 设置自动保存
			this.setupAutoSave();
		},
		onUnload() {
			// 清除自动保存定时器
			if(this.autoSaveTimer) {
				clearInterval(this.autoSaveTimer);
				this.autoSaveTimer = null;
			}
			
			// 如果有未保存的修改，自动保存
			if(this.isDirty) {
				this.saveDraft(true);
			}
		},
		methods: {
			// 返回上一页
			goBack() {
				// 如果有未保存的修改，提示保存
				if(this.isDirty && (this.songTitle.trim().length > 0 || this.lyrics.trim().length > 0)) {
					uni.showModal({
						title: '保存提示',
						content: '您有未保存的内容，是否保存后再离开？',
						confirmText: '保存',
						cancelText: '不保存',
						success: (res) => {
							if(res.confirm) {
								this.saveDraft(true);
								uni.navigateBack();
							} else {
								uni.navigateBack();
							}
						}
					});
				} else {
					uni.navigateBack();
				}
			},
			// 显示帮助
			showHelp() {
				uni.showModal({
					title: '创作帮助',
					content: '自主创作功能允许您自由编写歌词，系统将根据您的创作内容生成完整的音乐作品。\n\n建议：\n1. 将歌词分为主歌(Verse)和副歌(Chorus)部分\n2. 注意押韵和节奏感\n3. 字数控制在400字以内\n4. 可以添加[Verse]、[Chorus]等标记来划分段落',
					showCancel: false,
					confirmText: '我知道了'
				});
			},
			// 清空歌词
			clearLyrics() {
				if(this.lyrics.trim().length > 0) {
					uni.showModal({
						title: '确认清空',
						content: '确定要清空当前歌词吗？此操作不可恢复。',
						success: (res) => {
							if(res.confirm) {
								this.lyrics = '';
								this.isDirty = true;
							}
						}
					});
				}
			},
			// 复制歌词
			copyLyrics() {
				if(this.lyrics.trim().length === 0) {
					uni.showToast({
						title: '没有可复制的内容',
						icon: 'none'
					});
					return;
				}
				
				uni.setClipboardData({
					data: this.lyrics,
					success: () => {
						uni.showToast({
							title: '歌词已复制',
							icon: 'success'
						});
					}
				});
			},
			// 保存草稿
			saveDraft(silent = false) {
				try {
					// 保存到本地存储
					uni.setStorageSync('manual_draft', {
						songTitle: this.songTitle,
						lyrics: this.lyrics,
						saveTime: new Date().getTime()
					});
					
					// 更新保存时间
					this.updateSaveTime();
					
					// 标记为已保存
					this.isDirty = false;
					
					// 显示保存成功提示
					if(!silent) {
						uni.showToast({
							title: '草稿已保存',
							icon: 'success'
						});
					}
				} catch(e) {
					// 保存失败
					if(!silent) {
						uni.showToast({
							title: '草稿保存失败',
							icon: 'none'
						});
					}
					console.error('保存草稿失败:', e);
				}
			},
			// 恢复草稿
			restoreDraft() {
				try {
					const draft = uni.getStorageSync('manual_draft');
					if(draft) {
						this.songTitle = draft.songTitle || '';
						this.lyrics = draft.lyrics || '';
						
						// 更新保存时间
						if(draft.saveTime) {
							this.formatSaveTime(draft.saveTime);
						}
					}
				} catch(e) {
					console.error('恢复草稿失败:', e);
				}
			},
			// 设置自动保存
			setupAutoSave() {
				// 每30秒自动保存一次
				this.autoSaveTimer = setInterval(() => {
					if(this.isDirty) {
						this.saveDraft(true);
					}
				}, 30000);
				
				// 监听输入变化
				this.$watch('songTitle', () => {
					this.isDirty = true;
				});
				
				this.$watch('lyrics', () => {
					this.isDirty = true;
				});
			},
			// 更新保存时间
			updateSaveTime() {
				this.formatSaveTime(new Date().getTime());
			},
			// 格式化保存时间
			formatSaveTime(timestamp) {
				const now = new Date().getTime();
				const diff = now - timestamp;
				
				if(diff < 60000) { // 小于1分钟
					this.lastSaveTime = '刚刚';
				} else if(diff < 3600000) { // 小于1小时
					const minutes = Math.floor(diff / 60000);
					this.lastSaveTime = `${minutes}分钟前`;
				} else if(diff < 86400000) { // 小于1天
					const hours = Math.floor(diff / 3600000);
					this.lastSaveTime = `${hours}小时前`;
				} else {
					const date = new Date(timestamp);
					this.lastSaveTime = `${date.getMonth() + 1}月${date.getDate()}日`;
				}
			},
			// 进行下一步
			proceedToNext() {
				if(!this.canProceed) return;
				
				uni.navigateTo({
					url: `/pages/creation/style?type=manual&title=${encodeURIComponent(this.songTitle)}&lyrics=${encodeURIComponent(this.lyrics)}`
				});
			},
			// 处理行数变化
			handleLineChange(e) {
				const minHeight = 400;
				const height = Math.max(e.detail.height, minHeight);
				this.textareaHeight = `${height}rpx`;
			}
		}
	}
</script>

<style lang="scss">
.manual-creation {
	min-height: 100vh;
	background-color: #121212;
	color: #FFFFFF;
	display: flex;
	flex-direction: column;
	padding: 20rpx 40rpx;
}

.status-bar-height {
	height: var(--status-bar-height);
	width: 100%;
}

.nav-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 30rpx;
	
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

.steps-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 40rpx 40rpx;
	
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		
		.step-icon {
			width: 50rpx;
			height: 50rpx;
			border-radius: 50%;
			background-color: #282828;
			color: #CCCCCC;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 26rpx;
			margin-bottom: 10rpx;
		}
		
		.step-text {
			font-size: 24rpx;
			color: #CCCCCC;
		}
		
		&.active {
			.step-icon {
				background-color: #3B7EFF;
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
		background-color: #282828;
		margin: 0 20rpx;
		margin-bottom: 20rpx;
	}
}

.creation-form {
	flex: 1;
	padding: 0;
	
	.form-item {
		margin-bottom: 40rpx;
		
		.label {
			font-size: 32rpx;
			color: #8E8E8E;
			margin-bottom: 24rpx;
			font-weight: 500;
		}
	}
	
	.title-input {
		color: #8E8E8E;
		.input-wrapper {
			position: relative;
			display: flex;
			align-items: center;
			background-color: #1E1E1E;
			border-radius: 20rpx;
			padding: 0 32rpx;
			height: 100rpx;
		}
		
		.title-input-field {
			flex: 1;
			height: 100rpx;
			line-height: 100rpx;
			font-size: 32rpx;
			color: #FFFFFF;
			background: transparent;
		}
		
		.char-count {
			font-size: 28rpx;
			color: #8E8E8E;
			margin-left: 20rpx;
		}
	}
	.tips {
		font-size: 26rpx;
		color: #8E8E8E;
		margin-top: 24rpx;
		line-height: 1.4;
		margin-bottom: 10rpx;
	}
	.lyrics-input {
		background-color: #1E1E1E;
		border-radius: 20rpx;
		padding: 20rpx;
		color: #8E8E8E;
		.label-row-right{
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20rpx;
			.text{
				font-size: 28rpx;
				color: #8E8E8E;
			}
			image{
				width: 32rpx;
				height: 32rpx;
			}
		}
		.label-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 24rpx;
			
			.label {
				margin-bottom: 0;
			}
			
			
		}
		
		.textarea-container {
			background-color: #1E1E1E;
			border-radius: 20rpx;
			padding: 32rpx;
			min-height: 400rpx;
			
			.char-count {
				font-size: 28rpx;
				color: #8E8E8E;
				float: right;
				
				&.warning {
					color: #FFB545;
				}
				
				&.error {
					color: #FF5E94;
				}
			}
			textarea {
				width: 100%;
				min-height: 400rpx;
				font-size: 32rpx;
				color: #FFFFFF;
				line-height: 1.6;
				padding: 0;
				height: 53vh;
			}
		}
	}
	
	.actions {
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
		
		.action-btn {
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.iconfont {
				font-size: 40rpx;
				color: #CCCCCC;
				margin-bottom: 10rpx;
			}
			
			text {
				font-size: 24rpx;
				color: #CCCCCC;
			}
		}
	}
	
	.auto-save-tip {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 22rpx;
		color: #8E8E8E;
		
		text:first-child {
			margin-right: 10rpx;
		}
	}
}

.bottom-action {
	padding: 40rpx 0;
	
	.next-btn {
		background: linear-gradient(135deg, #4080FF 0%, #9F7FFF 100%);
		color: #FFFFFF;
		border-radius: 100rpx;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 34rpx;
		font-weight: 600;
		
		&[disabled] {
			opacity: 0.5;
			background: #666666;
		}
	}
}
</style> 