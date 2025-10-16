<template>
	<view class="container">
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="section">
					<view class="title">AI音乐创作小程序版权说明</view>
					<view class="date">生效日期：2023年12月1日</view>
					
					<view class="paragraph">本版权说明旨在明确AI音乐创作小程序中用户创作内容的知识产权归属和使用规则。请您在使用我们的服务前，仔细阅读本说明。</view>
					
					<view class="sub-title">1. 人工创作内容</view>
					<view class="paragraph">1.1 用户通过本小程序完全自主创作的歌词、旋律等内容，其版权归用户所有。</view>
					<view class="paragraph">1.2 用户授权我们在提供服务过程中，可以存储、备份、展示这些内容。</view>
					<view class="paragraph">1.3 用户可以自由使用、分享、商用自己的原创内容，但需遵守相关法律法规。</view>
					
					<view class="sub-title">2. AI辅助创作内容</view>
					<view class="paragraph">2.1 用户使用AI辅助创作功能生成的内容，版权归属为用户与平台共有，其中：</view>
					<view class="paragraph">2.2 用户对内容拥有个人使用权，可用于个人欣赏、学习和非商业性质的分享。</view>
					<view class="paragraph">2.3 如需进行商业使用，请联系我们获取书面授权。</view>
					<view class="paragraph">2.4 平台保留对AI辅助创作内容的展示、推广和改进AI模型的权利。</view>
					
					<view class="sub-title">3. 平台内容</view>
					<view class="paragraph">3.1 平台自身的内容，包括但不限于界面设计、图标、音效、代码等，其知识产权归平台所有。</view>
					<view class="paragraph">3.2 未经平台书面许可，禁止复制、修改、分发或商业使用平台内容。</view>
					
					<view class="sub-title">4. 第三方内容使用规则</view>
					<view class="paragraph">4.1 用户在创作过程中，应确保不侵犯他人的知识产权。</view>
					<view class="paragraph">4.2 未经授权，不得使用他人享有版权的素材进行创作。</view>
					<view class="paragraph">4.3 若收到侵权投诉，我们将依法处理，可能删除相关内容。</view>
					
					<view class="sub-title">5. 权利声明和保证</view>
					<view class="paragraph">5.1 用户保证其上传的内容不侵犯任何第三方的合法权益。</view>
					<view class="paragraph">5.2 用户同意对因其上传的内容侵犯他人权益而导致的任何索赔负责。</view>
					
					<view class="sub-title">6. 作品下载与分享</view>
					<view class="paragraph">6.1 用户可以下载自己创作的作品。</view>
					<view class="paragraph">6.2 分享作品时，建议标明创作工具为"AI音乐创作小程序"。</view>
					<view class="paragraph">6.3 直接商业利用AI辅助创作的作品可能需要额外授权，请事先联系我们。</view>
					
					<view class="sub-title">7. 合理使用与限制</view>
					<view class="paragraph">7.1 请不要利用本工具生成包含仇恨、暴力、色情等不良内容的作品。</view>
					<view class="paragraph">7.2 禁止通过技术手段大量抓取平台内容或干扰平台正常运行。</view>
					
					<view class="sub-title">8. 平台权利</view>
					<view class="paragraph">8.1 我们保留在不另行通知的情况下修改本版权说明的权利。</view>
					<view class="paragraph">8.2 我们可能在必要时对内容进行审核，并删除违反法律法规的内容。</view>
					
					<view class="sub-title">9. 免责声明</view>
					<view class="paragraph">AI创作仅作为创意参考，本平台不对因使用本平台生成的内容而产生的任何纠纷承担责任。</view>
					
					<view class="contact">版权问题咨询：copyright@aimusic.com</view>
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
				uni.navigateBack()
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
	
	.section {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 30rpx;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin-bottom: 20rpx;
		text-align: center;
	}
	
	.date {
		font-size: 24rpx;
		color: #ACACAC;
		margin-bottom: 30rpx;
		text-align: center;
	}
	
	.sub-title {
		font-size: 30rpx;
		font-weight: bold;
		color: #FFFFFF;
		margin: 30rpx 0 10rpx 0;
	}
	
	.paragraph {
		font-size: 26rpx;
		color: #CCCCCC;
		line-height: 1.6;
		margin-bottom: 20rpx;
		text-align: justify;
	}
	
	.contact {
		font-size: 24rpx;
		color: #ACACAC;
		margin-top: 40rpx;
		text-align: center;
	}
</style> 