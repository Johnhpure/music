<template>
	<view class="test-container">
		<view class="header">
			<text class="title">API测试页面</text>
		</view>
		
		<view class="test-section">
			<text class="section-title">配置信息</text>
			<text class="config-info">baseURL: {{baseURL}}</text>
			<text class="config-info">API可用性: {{apiAvailable ? '✅可用' : '❌不可用'}}</text>
		</view>
		
		<view class="test-section">
			<text class="section-title">提示词模板测试</text>
			<button class="test-btn" @click="testPromptTemplates">测试提示词API</button>
			<text class="result-text">结果: {{promptResult}}</text>
		</view>
		
		<view class="test-section">
			<text class="section-title">热门推荐测试</text>
			<button class="test-btn" @click="testHotRecommendations">测试热门推荐API</button>
			<text class="result-text">结果: {{hotResult}}</text>
		</view>
		
		<view class="test-section">
			<text class="section-title">直接HTTP测试</text>
			<button class="test-btn" @click="testDirectHttp">直接HTTP请求</button>
			<text class="result-text">结果: {{httpResult}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				baseURL: '',
				apiAvailable: false,
				promptResult: '未测试',
				hotResult: '未测试',
				httpResult: '未测试'
			}
		},
		
		onLoad() {
			console.log('🧪 测试页面加载');
			this.checkConfig();
		},
		
		methods: {
			checkConfig() {
				// 检查API配置
				this.baseURL = this.$minApi ? 'API对象存在' : 'API对象不存在';
				this.apiAvailable = !!(this.$minApi && this.$minApi.getActivePromptTemplates);
				
				console.log('🔍 API配置检查:');
				console.log('  - $minApi存在:', !!this.$minApi);
				console.log('  - $api存在:', !!this.$api);
				console.log('  - getActivePromptTemplates方法存在:', !!(this.$minApi && this.$minApi.getActivePromptTemplates));
			},
			
			async testPromptTemplates() {
				try {
					console.log('🎭 测试提示词API...');
					const response = await this.$minApi.getActivePromptTemplates();
					this.promptResult = `成功：获取到${response.data ? response.data.length : 0}个模板`;
					console.log('✅ 提示词API测试成功:', response);
				} catch (error) {
					this.promptResult = `失败：${error.message}`;
					console.error('❌ 提示词API测试失败:', error);
				}
			},
			
			async testHotRecommendations() {
				try {
					console.log('🎵 测试热门推荐API...');
					const response = await this.$minApi.getHotRecommendations();
					this.hotResult = `成功：获取到${response.data ? response.data.length : 0}首音乐`;
					console.log('✅ 热门推荐API测试成功:', response);
				} catch (error) {
					this.hotResult = `失败：${error.message}`;
					console.error('❌ 热门推荐API测试失败:', error);
				}
			},
			
			async testDirectHttp() {
				try {
					console.log('📡 测试直接HTTP请求...');
					const result = await uni.request({
						url: 'http://192.168.1.118:3000/api/prompt-template/list',
						method: 'GET',
						header: {
							'Content-Type': 'application/json'
						}
					});
					this.httpResult = `成功：状态码${result[1].statusCode}`;
					console.log('✅ 直接HTTP测试成功:', result[1]);
				} catch (error) {
					this.httpResult = `失败：${error.message}`;
					console.error('❌ 直接HTTP测试失败:', error);
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.test-container {
		padding: 20rpx;
		background-color: #000000;
		color: #FFFFFF;
		min-height: 100vh;
	}
	
	.header {
		text-align: center;
		padding: 40rpx 0;
	}
	
	.title {
		font-size: 36rpx;
		font-weight: 600;
	}
	
	.test-section {
		margin-bottom: 40rpx;
		padding: 20rpx;
		background-color: #1E1E1E;
		border-radius: 12rpx;
	}
	
	.section-title {
		font-size: 28rpx;
		font-weight: 500;
		margin-bottom: 20rpx;
		display: block;
	}
	
	.config-info, .result-text {
		font-size: 24rpx;
		color: #ACACAC;
		margin-bottom: 10rpx;
		display: block;
	}
	
	.test-btn {
		background: linear-gradient(135deg, #36D1A6 0%, #0B67EC 100%);
		color: #FFFFFF;
		border: none;
		border-radius: 8rpx;
		padding: 20rpx;
		font-size: 26rpx;
		margin: 20rpx 0;
	}
</style>
