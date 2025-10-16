<template>
	<view class="container">
		<view class="content">
			<view class="section">
				<view class="form-item">
					<view class="form-label">问题类型</view>
					<view class="type-selector">
						<view 
							v-for="(type, index) in feedbackTypes" 
							:key="index"
							:class="['type-item', selectedType === type ? 'active' : '']"
							@click="selectType(type)"
						>
							{{ type }}
						</view>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">问题描述</view>
					<textarea 
						class="feedback-textarea" 
						v-model="feedbackContent" 
						placeholder="请详细描述您遇到的问题或建议..." 
						maxlength="500"
					></textarea>
					<view class="word-count">{{ feedbackContent.length }}/500</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">上传截图（选填）</view>
					<view class="image-uploader">
						<view class="upload-list">
							<view 
								v-for="(image, index) in uploadedImages" 
								:key="index"
								class="upload-item"
							>
								<image :src="image" mode="aspectFill"></image>
								<view class="delete-btn" @click.stop="deleteImage(index)">×</view>
							</view>
							<view 
								v-if="uploadedImages.length < 3" 
								class="upload-btn"
								@click="chooseImage"
							>
								<uni-icons type="plus" size="30" color="#787878"></uni-icons>
							</view>
						</view>
						<view class="upload-tips">最多上传3张图片</view>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">联系方式（选填）</view>
					<input 
						class="contact-input" 
						v-model="contactInfo" 
						placeholder="请输入您的邮箱或手机号"
					/>
				</view>
				
				<button 
					class="submit-btn" 
					:disabled="!selectedType || !feedbackContent" 
					:style="{ opacity: (!selectedType || !feedbackContent) ? 0.5 : 1 }"
					@click="submitFeedback"
				>
					提交反馈
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue'
	import uniIcons from '@/components/uni-icons/uni-icons.vue'
	
	export default {
		components: {
			uniNavBar,
			uniIcons
		},
		data() {
			return {
				feedbackTypes: ['功能建议', '操作问题', '内容质量', '界面设计', '其他问题'],
				selectedType: '',
				feedbackContent: '',
				contactInfo: '',
				uploadedImages: []
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			selectType(type) {
				this.selectedType = type;
			},
			chooseImage() {
				uni.chooseImage({
					count: 3 - this.uploadedImages.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths];
					}
				});
			},
			deleteImage(index) {
				this.uploadedImages.splice(index, 1);
			},
			submitFeedback() {
				if (!this.selectedType || !this.feedbackContent) {
					return;
				}
				
				// 这里应该有上传图片和提交反馈的API调用
				// 示例仅展示UI交互
				uni.showLoading({
					title: '提交中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '反馈提交成功',
						icon: 'success',
						duration: 2000,
						success: () => {
							setTimeout(() => {
								uni.navigateBack();
							}, 2000);
						}
					});
				}, 1500);
			}
		}
	}
</script>

<style lang="less">
	.container {
		background-color: #121212;
		min-height: 100vh;
	}
	
	.content {
		padding: 120rpx 30rpx 30rpx;
	}
	
	.section {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 30rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 28rpx;
		color: #FFFFFF;
		margin-bottom: 15rpx;
	}
	
	.type-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.type-item {
		background-color: #2D2D2D;
		color: #ACACAC;
		font-size: 24rpx;
		padding: 10rpx 20rpx;
		border-radius: 30rpx;
		transition: all 0.3s;
		
		&.active {
			background-color: #0B67EC;
			color: #FFFFFF;
		}
	}
	
	.feedback-textarea {
		width: 100%;
		height: 300rpx;
		background-color: #2D2D2D;
		border-radius: 12rpx;
		padding: 20rpx;
		color: #FFFFFF;
		font-size: 26rpx;
		box-sizing: border-box;
	}
	
	.word-count {
		text-align: right;
		font-size: 24rpx;
		color: #787878;
		margin-top: 10rpx;
	}
	
	.image-uploader {
		margin-top: 15rpx;
	}
	
	.upload-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.upload-item {
		width: 180rpx;
		height: 180rpx;
		position: relative;
		
		image {
			width: 100%;
			height: 100%;
			border-radius: 8rpx;
		}
		
		.delete-btn {
			position: absolute;
			top: -20rpx;
			right: -20rpx;
			width: 40rpx;
			height: 40rpx;
			background-color: #FF5C5C;
			color: #FFFFFF;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 24rpx;
		}
	}
	
	.upload-btn {
		width: 180rpx;
		height: 180rpx;
		background-color: #2D2D2D;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.upload-tips {
		font-size: 24rpx;
		color: #787878;
		margin-top: 15rpx;
	}
	
	.contact-input {
		width: 100%;
		height: 80rpx;
		background-color: #2D2D2D;
		border-radius: 12rpx;
		padding: 0 20rpx;
		color: #FFFFFF;
		font-size: 26rpx;
		box-sizing: border-box;
	}
	
	.submit-btn {
		width: 100%;
		height: 90rpx;
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
		border-radius: 45rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		margin-top: 50rpx;
	}
</style> 