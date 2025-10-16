<template>
	<view class="container">
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="section">
					<view class="title">AI音乐创作小程序隐私政策</view>
					<view class="date">生效日期：2023年12月1日</view>
					
					<view class="paragraph">本隐私政策描述了我们如何收集、使用和保护您在使用AI音乐创作小程序服务过程中提供的个人信息。请您仔细阅读本隐私政策，了解我们对您个人信息的处理方式。</view>
					
					<view class="sub-title">1. 信息收集</view>
					<view class="paragraph">我们可能收集以下类型的信息：</view>
					<view class="paragraph">1.1 账户信息：注册账户时提供的用户名、电子邮件地址、密码等。</view>
					<view class="paragraph">1.2 用户内容：您创作的歌词、音乐作品等。</view>
					<view class="paragraph">1.3 使用数据：使用应用时的操作记录、偏好设置、设备信息等。</view>
					<view class="paragraph">1.4 位置信息：经您授权后获取的位置信息。</view>
					
					<view class="sub-title">2. 信息使用</view>
					<view class="paragraph">我们使用收集的信息用于：</view>
					<view class="paragraph">2.1 提供、维护和改进我们的服务。</view>
					<view class="paragraph">2.2 个性化您的体验，推荐可能感兴趣的内容。</view>
					<view class="paragraph">2.3 研究和分析用户行为，改进产品功能。</view>
					<view class="paragraph">2.4 与您沟通，提供客户支持和通知。</view>
					
					<view class="sub-title">3. 信息共享</view>
					<view class="paragraph">除以下情况外，我们不会与第三方共享您的个人信息：</view>
					<view class="paragraph">3.1 经您明确同意。</view>
					<view class="paragraph">3.2 为提供服务所必需，如与服务提供商合作。</view>
					<view class="paragraph">3.3 遵守法律法规要求。</view>
					<view class="paragraph">3.4 保护我们或他人的权利、财产或安全。</view>
					
					<view class="sub-title">4. 信息安全</view>
					<view class="paragraph">我们采取合理的安全措施保护您的个人信息不被未授权访问、篡改、披露或破坏。然而，没有任何网络传输或电子存储是完全安全的，我们无法保证信息的绝对安全。</view>
					
					<view class="sub-title">5. 数据保留</view>
					<view class="paragraph">我们会在必要的时间内保留您的个人信息，以实现本隐私政策中所述目的，除非法律要求或允许更长的保留期限。</view>
					
					<view class="sub-title">6. 儿童隐私</view>
					<view class="paragraph">我们的服务不面向13岁以下儿童。如果我们发现自己无意中收集了13岁以下儿童的个人信息，我们将采取措施尽快删除这些信息。</view>
					
					<view class="sub-title">7. 您的权利</view>
					<view class="paragraph">根据适用法律，您可能有权访问、更正、删除您的个人信息，或限制或反对我们对您个人信息的处理。请联系我们行使这些权利。</view>
					
					<view class="sub-title">8. 政策更新</view>
					<view class="paragraph">我们可能会更新本隐私政策。我们会通过应用内通知或其他方式告知您重大变更。</view>
					
					<view class="sub-title">9. 联系我们</view>
					<view class="paragraph">如果您对本隐私政策有任何疑问或建议，请联系我们：</view>
					<view class="contact">电子邮件：privacy@aimusic.com</view>
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
		margin-top: 20rpx;
		text-align: center;
	}
</style> 