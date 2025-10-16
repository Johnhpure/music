<template>
	<view class="container">
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<view class="search-box">
					<uni-icons type="search" size="18" color="#787878"></uni-icons>
					<input type="text" v-model="searchText" placeholder="搜索问题" @input="searchFAQ" />
				</view>
				
				<view class="section">
					<view class="category-tabs">
						<view 
							v-for="(category, index) in categories" 
							:key="index"
							:class="['category-tab', activeCategory === category ? 'active' : '']"
							@click="selectCategory(category)"
						>
							{{ category }}
						</view>
					</view>
					
					<view class="faq-list">
						<view 
							v-for="(faq, index) in filteredFAQs" 
							:key="index"
							class="faq-item"
							@click="toggleFAQ(index)"
						>
							<view class="faq-header">
								<text class="faq-question">{{ faq.question }}</text>
								<text class="faq-icon">{{ faq.expanded ? '▲' : '▼' }}</text>
							</view>
							<view v-if="faq.expanded" class="faq-answer">
								{{ faq.answer }}
							</view>
						</view>
					</view>
				</view>
				
				<view class="contact-section">
					<view class="contact-title">未解决您的问题？</view>
					<button class="contact-button" @click="contactSupport">联系客服</button>
				</view>
			</view>
		</scroll-view>
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
				searchText: '',
				activeCategory: '常见问题',
				categories: ['常见问题', '创作相关', '账户管理', '音乐点数', '技术支持'],
				faqs: [
					{
						category: '常见问题',
						question: '如何开始创作第一首歌曲？',
						answer: '在首页点击"创作"按钮，选择AI辅助创作或自主创作模式，按照提示步骤完成创作即可。',
						expanded: false
					},
					{
						category: '常见问题',
						question: 'AI创作和自主创作有什么区别？',
						answer: 'AI辅助创作会帮您生成歌词和曲调，自主创作则需要您提供完整歌词，AI仅负责生成配乐。',
						expanded: false
					},
					{
						category: '创作相关',
						question: '创作一首歌需要消耗多少音乐点数？',
						answer: '一般情况下，创建一首完整歌曲需要消耗20点音乐点数。',
						expanded: false
					},
					{
						category: '创作相关',
						question: '能否修改已创作的歌曲？',
						answer: '目前版本暂不支持直接修改已创作的歌曲，您可以基于原有创意重新创作。',
						expanded: false
					},
					{
						category: '账户管理',
						question: '忘记密码怎么办？',
						answer: '在登录页面点击"忘记密码"，按照提示完成身份验证后可以重置密码。',
						expanded: false
					},
					{
						category: '账户管理',
						question: '如何修改个人资料？',
						answer: '在"个人中心"页面点击头像或用户名，进入个人资料页面进行修改。',
						expanded: false
					},
					{
						category: '音乐点数',
						question: '如何获取更多音乐点数？',
						answer: '您可以通过日常签到、分享作品、观看广告或直接购买获取更多音乐点数。',
						expanded: false
					},
					{
						category: '音乐点数',
						question: '购买的音乐点数有有效期吗？',
						answer: '购买的音乐点数长期有效，没有使用期限。',
						expanded: false
					},
					{
						category: '技术支持',
						question: '创作过程中遇到卡顿怎么办？',
						answer: '请检查网络连接是否稳定，或尝试重启应用。如问题持续，请联系客服。',
						expanded: false
					},
					{
						category: '技术支持',
						question: '为什么我无法下载我的作品？',
						answer: '请确保您的设备有足够的存储空间，并且已授予应用存储权限。',
						expanded: false
					}
				]
			}
		},
		computed: {
			filteredFAQs() {
				if (this.searchText) {
					return this.faqs.filter(faq => 
						faq.question.toLowerCase().includes(this.searchText.toLowerCase()) || 
						faq.answer.toLowerCase().includes(this.searchText.toLowerCase())
					);
				} else {
					return this.faqs.filter(faq => faq.category === this.activeCategory);
				}
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			selectCategory(category) {
				this.activeCategory = category;
				this.searchText = '';
			},
			toggleFAQ(index) {
				this.filteredFAQs[index].expanded = !this.filteredFAQs[index].expanded;
			},
			searchFAQ() {
				// 搜索时重置所有FAQ的展开状态
				this.faqs.forEach(faq => {
					faq.expanded = false;
				});
			},
			contactSupport() {
				uni.showModal({
					title: '联系客服',
					content: '您可以通过以下方式联系我们：\n电子邮件: support@aimusic.com\n工作时间: 周一至周五 9:00-18:00',
					showCancel: false,
					confirmText: '知道了'
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
	
	.search-box {
		display: flex;
		align-items: center;
		background-color: #2D2D2D;
		border-radius: 30rpx;
		padding: 15rpx 25rpx;
		margin-bottom: 30rpx;
		
		input {
			flex: 1;
			height: 40rpx;
			margin-left: 15rpx;
			color: #FFFFFF;
			font-size: 26rpx;
		}
	}
	
	.section {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.category-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.category-tab {
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
	
	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}
	
	.faq-item {
		background-color: #2D2D2D;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.faq-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
	}
	
	.faq-question {
		font-size: 28rpx;
		color: #FFFFFF;
		flex: 1;
	}
	
	.faq-icon {
		font-size: 24rpx;
		color: #787878;
	}
	
	.faq-answer {
		font-size: 26rpx;
		color: #ACACAC;
		padding: 0 20rpx 20rpx;
		line-height: 1.6;
	}
	
	.contact-section {
		background-color: #1E1E1E;
		border-radius: 16rpx;
		padding: 30rpx;
		text-align: center;
	}
	
	.contact-title {
		font-size: 28rpx;
		color: #FFFFFF;
		margin-bottom: 20rpx;
	}
	
	.contact-button {
		background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
		color: #FFFFFF;
		border-radius: 30rpx;
		padding: 15rpx 0;
		width: 80%;
		font-size: 28rpx;
		margin: 0 auto;
	}
</style> 