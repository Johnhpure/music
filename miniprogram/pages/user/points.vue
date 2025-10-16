<template>
	<view class="container">
		
		<!-- 点数余额显示 -->
		<view class="points-balance">
			<text class="balance-label">当前点数余额</text>
			<text class="balance-value">{{userPoints}}</text>
			<text class="balance-update-time">上次更新：{{lastUpdateTime}}</text>
		</view>
		
		<!-- 标签页导航 -->
		<view class="tabs">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'free' }" 
				@click="switchTab('free')"
			>免费获取</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'rules' }" 
				@click="switchTab('rules')"
			>使用规则</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'history' }" 
				@click="switchTab('history')"
			>点数明细</view>
		</view>
		
		<!-- 标签页内容区 -->
		<view class="tab-content">
			<!-- 免费获取标签内容 -->
			<view v-if="activeTab === 'free'" class="free-methods">
				<!-- 转发作品 -->
				<view class="method-card">
					<view class="method-info">
						<view class="method-icon share-icon">
							<image src="/static/img/icon/share.svg" mode="aspectFit"></image>
						</view>
						<view class="method-text">
							<text class="method-title">转发作品</text>
							<text class="method-desc">每次转发获得5点，每日上限30点</text>
						</view>
					</view>
					<button class="method-button" @click="shareWork">去转发</button>
				</view>
				
				<!-- 观看广告 -->
				<view class="method-card">
					<view class="method-info">
						<view class="method-icon ad-icon">
							<text class="iconfont">&#xe633;</text>
						</view>
						<view class="method-text">
							<text class="method-title">观看广告</text>
							<text class="method-desc">每次观看获得10点，今日还可观看{{adWatchRemaining}}次</text>
						</view>
					</view>
					<button class="method-button gradient" @click="watchAd">观看广告</button>
				</view>
				
				<!-- 每日签到 -->
				<view class="method-card">
					<view class="method-info">
						<view class="method-icon checkin-icon">
							<text class="iconfont">&#xe62f;</text>
						</view>
						<view class="method-text">
							<text class="method-title">每日签到</text>
							<text class="method-desc">每日签到获得5点，连续签到奖励翻倍</text>
						</view>
					</view>
					<button class="method-button success" v-if="checkedInToday" disabled>已签到</button>
					<button class="method-button success" v-else @click="checkIn">签到</button>
				</view>
				
				<!-- 邀请好友 -->
				<view class="method-card">
					<view class="method-info">
						<view class="method-icon invite-icon">
							<text class="iconfont">&#xe612;</text>
						</view>
						<view class="method-text">
							<text class="method-title">邀请好友</text>
							<text class="method-desc">每邀请一位好友获得20点，无上限</text>
						</view>
					</view>
					<button class="method-button warning" @click="inviteFriend">邀请好友</button>
				</view>
				
				<!-- 购买点数 -->
				<view class="purchase-section">
					<view class="section-title">购买点数</view>
					
					<view class="packages-grid">
						<!-- 300点套餐 -->
						<view 
							class="package-item" 
							:class="{ selected: selectedPackage === 0 }" 
							@click="selectPackage(0)"
						>
							<view class="package-header">
								<text class="package-points">300点</text>
								<text class="package-tag">首充特惠</text>
							</view>
							<text class="package-original">原价：¥30</text>
							<text class="package-price">¥19.9</text>
							<text class="package-bonus">赠送30点</text>
						</view>
						
						<!-- 600点套餐 -->
						<view 
							class="package-item" 
							:class="{ selected: selectedPackage === 1 }" 
							@click="selectPackage(1)"
						>
							<view class="package-header">
								<text class="package-points">600点</text>
								<text class="package-tag">热门</text>
							</view>
							<text class="package-original">原价：¥60</text>
							<text class="package-price">¥49.9</text>
							<text class="package-bonus">赠送80点</text>
						</view>
						
						<!-- 1200点套餐 -->
						<view 
							class="package-item" 
							:class="{ selected: selectedPackage === 2 }" 
							@click="selectPackage(2)"
						>
							<view class="package-header">
								<text class="package-points">1200点</text>
							</view>
							<text class="package-original">原价：¥120</text>
							<text class="package-price">¥99.9</text>
							<text class="package-bonus">赠送200点</text>
						</view>
						
						<!-- 3000点套餐 -->
						<view 
							class="package-item" 
							:class="{ selected: selectedPackage === 3 }" 
							@click="selectPackage(3)"
						>
							<view class="package-header">
								<text class="package-points">3000点</text>
							</view>
							<text class="package-original">原价：¥300</text>
							<text class="package-price">¥239.9</text>
							<text class="package-bonus">赠送600点</text>
						</view>
					</view>
					
					<button class="purchase-button gradient" @click="buyPoints">立即购买</button>
					<text class="purchase-agreement">购买即表示同意《音乐点数购买协议》</text>
				</view>
			</view>
			
			<!-- 使用规则标签内容 -->
			<view v-if="activeTab === 'rules'" class="rules-content">
				<!-- 这里将在下一步实现 -->
				<text>使用规则内容区</text>
			</view>
			
			<!-- 点数明细标签内容 -->
			<view v-if="activeTab === 'history'" class="history-content">
				<!-- 筛选日期 -->
				<view class="history-header">
					<text class="history-period">近30天的点数记录</text>
					<view class="filter-date" @click="showDatePicker">
						<text class="iconfont calendar-icon">&#xe62f;</text>
						<text class="filter-text">筛选日期</text>
					</view>
				</view>
				
				<!-- 点数变动汇总 -->
				<view class="points-summary">
					<view class="summary-item">
						<text class="summary-label">获取</text>
						<text class="summary-value add">+{{summary.added}}</text>
					</view>
					<view class="summary-divider"></view>
					<view class="summary-item">
						<text class="summary-label">消耗</text>
						<text class="summary-value minus">-{{summary.used}}</text>
					</view>
					<view class="summary-divider"></view>
					<view class="summary-item">
						<text class="summary-label">净变动</text>
						<text class="summary-value">+{{summary.net}}</text>
					</view>
				</view>
				
				<!-- 明细记录列表 -->
				<view class="history-list">
					<block v-for="(group, date) in groupedRecords" :key="date">
						<!-- 日期分组 -->
						<view class="date-group">{{formatDateLabel(date)}}</view>
						
						<!-- 当日记录列表 -->
						<view class="records-card">
							<view 
								class="record-item" 
								v-for="(record, index) in group" 
								:key="index"
								:class="{'last-item': index === group.length - 1}"
							>
								<view class="record-info">
									<text class="record-title">{{record.title}}</text>
									<text v-if="record.subtitle" class="record-subtitle">{{record.subtitle}}</text>
									<text v-else class="record-time">{{formatTime(record.time)}}</text>
								</view>
								<text class="record-points" :class="record.type === 'add' ? 'add' : 'minus'">
									{{record.type === 'add' ? '+' : '-'}}{{record.points}}
								</text>
							</view>
						</view>
					</block>
					
					<!-- 加载更多 -->
					<view class="load-more" @click="loadMoreRecords">
						<text class="load-more-text">加载更多</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userPoints: 320,
			lastUpdateTime: '今天 10:30',
			activeTab: 'free',
			selectedPackage: 0,
			adWatchRemaining: 3,
			checkedInToday: true,
			pointsPackages: [
				{
					points: 300,
					originalPrice: 30,
					price: 19.9,
					bonus: 30,
					tag: '首充特惠'
				},
				{
					points: 600,
					originalPrice: 60,
					price: 49.9,
					bonus: 80,
					tag: '热门'
				},
				{
					points: 1200,
					originalPrice: 120,
					price: 99.9,
					bonus: 200
				},
				{
					points: 3000,
					originalPrice: 300,
					price: 239.9,
					bonus: 600
				}
			],
			// 点数明细相关数据
			pointRecords: [],
			summary: {
				added: 285,
				used: 140,
				net: 145
			},
			hasMoreRecords: true
		}
	},
	computed: {
		// 按日期分组的记录
		groupedRecords() {
			const grouped = {};
			
			// 获取今天和昨天的日期
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			
			const todayStr = this.formatDate(today);
			const yesterdayStr = this.formatDate(yesterday);
			
			// 对记录进行分组
			this.pointRecords.forEach(record => {
				const recordDate = this.formatDate(new Date(record.time));
				
				// 使用"今天"、"昨天"或实际日期作为键
				let dateKey;
				if (recordDate === todayStr) {
					dateKey = 'today';
				} else if (recordDate === yesterdayStr) {
					dateKey = 'yesterday';
				} else {
					dateKey = recordDate;
				}
				
				if (!grouped[dateKey]) {
					grouped[dateKey] = [];
				}
				grouped[dateKey].push(record);
			});
			
			return grouped;
		}
	},
	onLoad(options) {
		// 处理URL参数，切换到指定标签页
		if (options && options.activeTab) {
			// 确保activeTab值是有效的
			if (['free', 'rules', 'history'].includes(options.activeTab)) {
				this.activeTab = options.activeTab;
			}
		}
		
		// 生成模拟数据
		this.generateMockRecords();
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		switchTab(tab) {
			this.activeTab = tab;
		},
		selectPackage(index) {
			this.selectedPackage = index;
		},
		shareWork() {
			uni.showToast({
				title: '转发功能开发中',
				icon: 'none'
			});
		},
		watchAd() {
			if (this.adWatchRemaining <= 0) {
				uni.showToast({
					title: '今日观看次数已用完',
					icon: 'none'
				});
				return;
			}
			
			uni.showLoading({
				title: '广告加载中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				
				// 增加点数
				this.userPoints += 10;
				this.adWatchRemaining -= 1;
				
				// 更新最后更新时间
				const now = new Date();
				const hours = now.getHours().toString().padStart(2, '0');
				const minutes = now.getMinutes().toString().padStart(2, '0');
				this.lastUpdateTime = `今天 ${hours}:${minutes}`;
				
				uni.showToast({
					title: '获得10点数',
					icon: 'success'
				});
			}, 2000);
		},
		checkIn() {
			// 跳转到签到页面
			uni.navigateTo({
				url: '/pages/user/checkin'
			});
		},
		inviteFriend() {
			uni.showToast({
				title: '分享邀请功能开发中',
				icon: 'none'
			});
		},
		buyPoints() {
			// 获取选中的套餐信息
			const selectedPackage = this.pointsPackages[this.selectedPackage];
			
			// 跳转到购买点数页面，并传递套餐信息
			uni.navigateTo({
				url: '/pages/user/purchase',
				success: (res) => {
					// 传递套餐信息
					res.eventChannel.emit('selectPackage', { package: selectedPackage });
				}
			});
		},
		// 生成模拟数据
		generateMockRecords() {
			const today = new Date();
			
			// 今天的记录
			this.pointRecords = [
				{
					title: '观看广告',
					time: `${this.formatDate(today)} 10:30`,
					points: 10,
					type: 'add'
				},
				{
					title: '每日签到',
					time: `${this.formatDate(today)} 09:15`,
					points: 5,
					type: 'add'
				}
			];
			
			// 昨天的记录
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			this.pointRecords.push(
				{
					title: '创作歌曲',
					subtitle: '《夏日晚风》',
					time: `${this.formatDate(yesterday)} 16:30`,
					points: 20,
					type: 'minus'
				},
				{
					title: '观看广告',
					time: `${this.formatDate(yesterday)} 15:40`,
					points: 10,
					type: 'add'
				},
				{
					title: '每日签到',
					time: `${this.formatDate(yesterday)} 09:22`,
					points: 5,
					type: 'add'
				}
			);
			
			// 更早的记录
			const earlierDate = new Date('2023-06-15');
			this.pointRecords.push(
				{
					title: '下载歌曲',
					subtitle: '《城市霓虹》',
					time: `${this.formatDate(earlierDate)} 14:20`,
					points: 5,
					type: 'minus'
				},
				{
					title: '购买点数',
					subtitle: '套餐：300点',
					time: `${this.formatDate(earlierDate)} 10:15`,
					points: 330,
					type: 'add'
				}
			);
		},
		
		// 格式化日期
		formatDate(date) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		
		// 格式化日期标签
		formatDateLabel(dateKey) {
			if (dateKey === 'today') {
				return '今天';
			} else if (dateKey === 'yesterday') {
				return '昨天';
			} else {
				return dateKey;
			}
		},
		
		// 格式化时间
		formatTime(dateTimeStr) {
			// 提取时间部分
			const timePart = dateTimeStr.split(' ')[1];
			return timePart;
		},
		
		// 显示日期选择器
		showDatePicker() {
			uni.showToast({
				title: '日期筛选功能开发中',
				icon: 'none'
			});
		},
		
		// 加载更多记录
		loadMoreRecords() {
			if (!this.hasMoreRecords) return;
			
			uni.showLoading({
				title: '加载中...'
			});
			
			// 模拟加载更多数据
			setTimeout(() => {
				uni.hideLoading();
				
				// 添加更多模拟数据
				const olderDate = new Date('2023-06-10');
				this.pointRecords.push(
					{
						title: '转发作品',
						time: `${this.formatDate(olderDate)} 16:45`,
						points: 5,
						type: 'add'
					},
					{
						title: '邀请好友',
						subtitle: '用户：音乐爱好者',
						time: `${this.formatDate(olderDate)} 14:30`,
						points: 20,
						type: 'add'
					}
				);
				
				// 如果已加载足够多的记录，禁用加载更多
				if (this.pointRecords.length > 10) {
					this.hasMoreRecords = false;
				}
				
				uni.showToast({
					title: '加载成功',
					icon: 'success'
				});
			}, 1000);
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 50rpx;
}

/* 导航栏样式 */
.navbar {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	padding: 20rpx 30rpx;
}

.left {
	position: absolute;
	left: 30rpx;
	height: 60rpx;
	width: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-back {
	font-size: 40rpx;
	color: #FFFFFF;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 点数余额显示 */
.points-balance {
	padding: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.balance-label {
	font-size: 28rpx;
	color: #ACACAC;
	margin-bottom: 10rpx;
}

.balance-value {
	font-size: 80rpx;
	font-weight: 700;
	color: #FFFFFF;
	margin-bottom: 10rpx;
}

.balance-update-time {
	font-size: 24rpx;
	color: #787878;
}

/* 标签页导航 */
.tabs {
	display: flex;
	border-bottom: 1rpx solid #2D2D2D;
	margin-bottom: 20rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 30rpx;
	color: #ACACAC;
	position: relative;
}

.tab-item.active {
	color: #FFFFFF;
	font-weight: 500;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 30%;
	height: 4rpx;
	background-color: #3B7EFF;
	border-radius: 2rpx;
}

/* 标签页内容区 */
.tab-content {
	padding: 0 30rpx;
}

/* 免费获取标签内容 */
.free-methods {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.method-card {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.method-info {
	display: flex;
	align-items: center;
}

.method-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.share-icon {
	background-color: rgba(59, 126, 255, 0.2);
}

.share-icon image {
	width: 40rpx;
	height: 40rpx;
	filter: invert(40%) sepia(67%) saturate(3486%) hue-rotate(203deg) brightness(103%) contrast(103%);
}

.ad-icon {
	background-color: rgba(115, 66, 204, 0.2);
}

.ad-icon .iconfont {
	font-size: 40rpx;
	color: #7342CC;
}

.checkin-icon {
	background-color: rgba(54, 209, 166, 0.2);
}

.checkin-icon .iconfont {
	font-size: 40rpx;
	color: #36D1A6;
}

.invite-icon {
	background-color: rgba(255, 180, 67, 0.2);
}

.invite-icon .iconfont {
	font-size: 40rpx;
	color: #FFB443;
}

.method-text {
	display: flex;
	flex-direction: column;
}

.method-title {
	font-size: 30rpx;
	font-weight: 500;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.method-desc {
	font-size: 24rpx;
	color: #ACACAC;
}

.method-button {
	min-width: 180rpx;
	height: 72rpx;
	font-size: 28rpx;
	border-radius: 36rpx;
	background-color: #2D2D2D;
	color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
}

.method-button.gradient {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
}

.method-button.success {
	background-color: #36D1A6;
	color: #FFFFFF;
}

.method-button.warning {
	background-color: #FFB443;
	color: #FFFFFF;
}

.method-button[disabled] {
	opacity: 0.7;
}

/* 购买点数部分 */
.purchase-section {
	margin-top: 30rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 30rpx;
}

.packages-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20rpx;
	margin-bottom: 30rpx;
}

.package-item {
	background-color: #2D2D2D;
	border-radius: 16rpx;
	padding: 30rpx;
	position: relative;
	border: 2rpx solid transparent;
}

.package-item.selected {
	border-color: #3B7EFF;
	background-color: rgba(59, 126, 255, 0.1);
}

.package-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 10rpx;
}

.package-points {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.package-tag {
	font-size: 20rpx;
	color: #FFFFFF;
	background-color: #3B7EFF;
	padding: 4rpx 12rpx;
	border-radius: 10rpx;
}

.package-original {
	font-size: 24rpx;
	color: #ACACAC;
	margin-bottom: 8rpx;
	display: block;
}

.package-price {
	font-size: 36rpx;
	color: #FFB443;
	font-weight: 600;
	margin-bottom: 8rpx;
	display: block;
}

.package-bonus {
	font-size: 24rpx;
	color: #36D1A6;
	display: block;
}

.purchase-button {
	width: 100%;
	height: 90rpx;
	font-size: 32rpx;
	font-weight: 500;
	border-radius: 45rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 15rpx;
}

.purchase-agreement {
	font-size: 24rpx;
	color: #787878;
	text-align: center;
}

.gradient {
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
}

/* 点数明细样式 */
.history-content {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.history-period {
	font-size: 24rpx;
	color: #787878;
}

.filter-date {
	display: flex;
	align-items: center;
	color: #3B7EFF;
}

.calendar-icon {
	font-size: 28rpx;
	margin-right: 8rpx;
}

.filter-text {
	font-size: 24rpx;
}

.points-summary {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	padding: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.summary-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
}

.summary-label {
	font-size: 24rpx;
	color: #787878;
	margin-bottom: 8rpx;
}

.summary-value {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.summary-value.add {
	color: #36D1A6;
}

.summary-value.minus {
	color: #FF5C5C;
}

.summary-divider {
	width: 2rpx;
	height: 50rpx;
	background-color: #2D2D2D;
}

.date-group {
	font-size: 24rpx;
	color: #787878;
	padding: 20rpx 10rpx 10rpx;
}

.records-card {
	background-color: #1E1E1E;
	border-radius: 16rpx;
	overflow: hidden;
}

.record-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #2D2D2D;
}

.record-item.last-item {
	border-bottom: none;
}

.record-info {
	display: flex;
	flex-direction: column;
}

.record-title {
	font-size: 28rpx;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.record-subtitle, .record-time {
	font-size: 24rpx;
	color: #787878;
}

.record-points {
	font-size: 32rpx;
	font-weight: 600;
}

.record-points.add {
	color: #36D1A6;
}

.record-points.minus {
	color: #FF5C5C;
}

.load-more {
	text-align: center;
	padding: 30rpx 0;
}

.load-more-text {
	font-size: 28rpx;
	color: #3B7EFF;
}
</style> 