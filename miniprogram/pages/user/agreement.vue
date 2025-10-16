<template>
	<view class="container">
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="section">
					<view class="title">AI音乐创作小程序用户协议</view>
					<view class="date">生效日期：2023年12月1日</view>
					
					<view class="paragraph">欢迎使用AI音乐创作小程序。请您在使用我们的服务前，仔细阅读本用户协议（"协议"）。您访问或使用本服务，即表示您同意接受本协议的所有条款和条件。</view>
					
					<view class="sub-title">1. 服务描述</view>
					<view class="paragraph">AI音乐创作小程序是一个利用人工智能技术帮助用户创作音乐的平台。我们提供AI辅助创作和自主创作两种模式，帮助用户快速完成歌曲创作。</view>
					
					<view class="sub-title">2. 账户注册与安全</view>
					<view class="paragraph">2.1 您需要注册账户才能使用本服务的全部功能。</view>
					<view class="paragraph">2.2 您应当提供真实、准确、完整的注册信息，并保持信息更新。</view>
					<view class="paragraph">2.3 您应当妥善保管账户信息和密码，对账户下的所有活动负责。</view>
					
					<view class="sub-title">3. 用户内容</view>
					<view class="paragraph">3.1 您通过本服务创作的内容归您所有，但需遵守相关法律法规。</view>
					<view class="paragraph">3.2 您授予我们非独占、可转授权、全球范围内的许可，允许我们存储、使用、展示您的内容，以便提供服务。</view>
					
					<view class="sub-title">4. 音乐点数规则</view>
					<view class="paragraph">4.1 创建歌曲需消耗音乐点数，具体消耗标准见应用内说明。</view>
					<view class="paragraph">4.2 音乐点数可通过日常签到、分享作品、观看广告或付费购买获得。</view>
					<view class="paragraph">4.3 已购买的音乐点数不支持退款，请谨慎操作。</view>
					
					<view class="sub-title">5. 禁止行为</view>
					<view class="paragraph">5.1 禁止使用本服务创作、分发违反法律法规的内容。</view>
					<view class="paragraph">5.2 禁止未经授权商用AI创作的音乐作品。</view>
					<view class="paragraph">5.3 禁止干扰服务的正常运行或尝试未授权访问服务。</view>
					
					<view class="sub-title">6. 知识产权</view>
					<view class="paragraph">6.1 本服务及其内容（不包括用户内容）的知识产权归我们所有。</view>
					<view class="paragraph">6.2 未经我们书面许可，不得复制、修改、分发或商业使用我们的内容。</view>
					
					<view class="sub-title">7. 责任限制</view>
					<view class="paragraph">7.1 我们不对服务的中断或您可能遇到的其他问题负责。</view>
					<view class="paragraph">7.2 在法律允许的最大范围内，我们不对任何直接、间接损失承担责任。</view>
					
					<view class="sub-title">8. 协议修改</view>
					<view class="paragraph">我们可能会修改本协议，修改后的协议将在应用内公布。继续使用本服务即表示您接受修改后的条款。</view>
					
					<view class="sub-title">9. 终止</view>
					<view class="paragraph">我们保留在任何时候因任何原因暂停或终止您使用服务的权利。</view>
					
					<view class="sub-title">10. 适用法律</view>
					<view class="paragraph">本协议受中华人民共和国法律管辖。</view>
					
					<view class="contact">如有任何问题，请联系：support@aimusic.com</view>
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