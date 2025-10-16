<template>
	<view class="container">
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="header">
					<image class="logo" src="/static/img/logo.png" mode="aspectFit"></image>
					<view class="app-name">AI音乐创作</view>
					<view class="app-version">版本 1.0.0</view>
				</view>
				
				<view class="section">
					<view class="section-title">应用简介</view>
					<view class="section-content">
						<text class="paragraph">AI音乐创作是一款利用人工智能技术帮助用户轻松创作音乐的应用。无论您是音乐爱好者还是专业音乐人，都能通过我们的应用快速将创意转化为完整的音乐作品。</text>
						<text class="paragraph">我们提供AI辅助创作和自主创作两种模式，满足不同用户的创作需求。您可以选择自己填写歌词，或者让AI帮助您完成从歌词到曲调的全流程创作。</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">我们的团队</view>
					<view class="section-content">
						<text class="paragraph">我们是一支热爱音乐与技术的团队，致力于将最前沿的AI技术应用于音乐创作领域，让音乐创作变得更加简单、高效和有趣。</text>
						<text class="paragraph">团队成员来自音乐、计算机科学和产品设计等多个领域，拥有丰富的专业经验和创意激情。</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">技术支持</view>
					<view class="section-content">
						<text class="paragraph">我们的音乐生成技术基于最先进的AI模型，经过大量音乐数据训练，能够创作出符合音乐理论和审美标准的作品。</text>
						<text class="paragraph">系统支持多种音乐风格和声音特点，并持续优化算法以提供更好的创作体验。</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">联系我们</view>
					<view class="contact-list">
						<view class="contact-item" @click="copyEmail('support@aimusic.com')">
							<text class="contact-icon">📧</text>
							<text class="contact-text">support@aimusic.com</text>
						</view>
						<view class="contact-item" @click="copyWechat('ai_music_official')">
							<text class="contact-icon">💬</text>
							<text class="contact-text">微信公众号：ai_music_official</text>
						</view>
					</view>
				</view>
				
				<view class="links">
					<view class="link-item" @click="openLink('/pages/user/agreement')">
						<text>用户协议</text>
					</view>
					<view class="link-divider"></view>
					<view class="link-item" @click="openLink('/pages/user/privacy')">
						<text>隐私政策</text>
					</view>
					<view class="link-divider"></view>
					<view class="link-item" @click="openLink('/pages/user/copyright')">
						<text>版权说明</text>
					</view>
				</view>
				
				<view class="copyright">
					<text>Copyright © 2023 AI音乐创作团队</text>
					<text>All Rights Reserved</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import uniNavBar from '@/components/uni-nav-bar/uni-nav-bar.vue'
	
	export default {
		components: {
			uniNavBar
		},
		data() {
			return {}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			copyEmail(email) {
				uni.setClipboardData({
					data: email,
					success: () => {
						uni.showToast({
							title: '邮箱已复制',
							icon: 'success'
						});
					}
				});
			},
			copyWechat(wechat) {
				uni.setClipboardData({
					data: wechat,
					success: () => {
						uni.showToast({
							title: '微信号已复制',
							icon: 'success'
						});
					}
				});
			},
			openLink(url) {
				uni.navigateTo({
					url: url
				});
			}
		}
	}
</script>

<style lang="less">
	.container {
		background-color: #121212;
		min-height: 100vh;
	}
	
	.content-scroll {
		height: calc(100vh - 90rpx);
	}
	
	.content {
		padding: 30rpx;
	}
	
	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 50rpx;
	}
	
	.logo {
		width: 150rpx;
		height: 150rpx;
		margin-bottom: 20rpx;
	}
	
	.app-name {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 10rpx;
	}
	
	.app-version {
		font-size: 24rpx;
		color: #ACACAC;
	}
	
	.section {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.section-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 20rpx;
		position: relative;
		padding-left: 20rpx;
		
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 8rpx;
			height: 30rpx;
			background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
			border-radius: 4rpx;
		}
	}
	
	.section-content {
		padding: 0 10rpx;
	}
	
	.paragraph {
		font-size: 26rpx;
		color: #CCCCCC;
		line-height: 1.6;
		margin-bottom: 20rpx;
		text-align: justify;
		display: block;
	}
	
	.contact-list {
		padding: 0 10rpx;
	}
	
	.contact-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.contact-icon {
		font-size: 30rpx;
		margin-right: 15rpx;
	}
	
	.contact-text {
		font-size: 26rpx;
		color: #4C94FF;
	}
	
	.links {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.link-item {
		font-size: 24rpx;
		color: #4C94FF;
		padding: 0 20rpx;
	}
	
	.link-divider {
		width: 2rpx;
		height: 20rpx;
		background-color: #3D3D3D;
	}
	
	.copyright {
		text-align: center;
		font-size: 22rpx;
		color: #787878;
		margin-bottom: 50rpx;
		
		text {
			display: block;
			line-height: 1.5;
		}
	}
</style> 