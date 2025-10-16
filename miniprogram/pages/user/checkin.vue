<template>
	<view class="container">
		
		<!-- 月份导航控制 -->
		<view class="month-controls">
			<view class="control-btn prev" @click="prevMonth">
				<image src="/static/img/icon/plus.svg" class="control-icon"></image>
			</view>
			<view class="control-btn next" @click="nextMonth">
				<image src="/static/img/icon/minus.svg" class="control-icon"></image>
			</view>
		</view>
		
		<!-- 点数控制区域 -->
		<view class="control-panel">
			<view class="control-btn" @click="addPoints">
				<image src="/static/img/icon/plus.svg" class="control-icon"></image>
			</view>
			<view class="points-display">
				<text class="points-gained">+{{pointsToday}}</text>
				<text>今日签到获得</text>
			</view>
			<view class="control-btn" @click="reducePoints">
				<image src="/static/img/icon/minus.svg" class="control-icon"></image>
			</view>
		</view>
		
		<!-- 日历区域 - 星期几 -->
		<view class="calendar">
			<!-- 日历星期几标题 -->
			<view class="week-row">
				<view v-for="(day, index) in ['日','一','二','三','四','五','六']" :key="index" class="week-day">
					{{day}}
				</view>
			</view>
			
			<!-- 日历天数 -->
			<view class="days-container">
				<view v-for="(day, index) in calendarDays" :key="index" class="day-cell" :class="{ 'current-month': day.currentMonth, 'today': day.isToday, 'checked': day.checked }">
					<text class="day-number">{{day.day}}</text>
					<text v-if="isCheckedDay(day)" class="check-icon">
						<image src="/static/img/icon/check.svg" class="check-img"></image>
					</text>
				</view>
			</view>
		</view>
		
		<!-- 连续签到奖励 -->
		<view class="streak-rewards">
			<view class="streak-header">
				<text class="streak-title">连续签到奖励</text>
				<text class="streak-count">已连续签到 {{streakDays}} 天</text>
			</view>
			
			<view class="rewards-row">
				<view v-for="(reward, index) in streakRewards" :key="index" class="reward-item" :class="{ 'active': streakDays >= reward.days, 'claimed': reward.claimed }">
					<view class="reward-icon">
						<image src="/static/img/icon/calendar.svg" class="calendar-icon"></image>
					</view>
					<view class="reward-info">
						<text class="reward-day">{{reward.days}}天</text>
						<text class="reward-points">{{reward.points}}点</text>
					</view>
					<view v-if="reward.claimed" class="claimed-mark">已领</view>
					<view v-else-if="streakDays >= reward.days" class="claim-btn" @click="claimReward(index)">领取</view>
				</view>
			</view>
		</view>
		
		<!-- 签到按钮 -->
		<view class="checkin-footer">
			<button 
				class="checkin-button" 
				:class="{ 'disabled': isCheckedToday }"
				:disabled="isCheckedToday"
				@click="checkIn"
			>
				{{isCheckedToday ? '已签到' : '今日签到'}}
			</button>
			<text class="checkin-tip">每日签到可获得5点数，连续签到奖励更多</text>
		</view>
		
		<!-- 奖励弹窗 -->
		<view class="reward-popup" v-if="showRewardPopup">
			<view class="reward-card">
				<view class="reward-content">
					<view class="reward-left">
						<view class="reward-icon">
							<text class="iconfont">&#xe62f;</text>
						</view>
						<view class="reward-info">
							<text class="reward-title">签到成功</text>
							<text class="reward-subtitle">已连续签到{{streakDays}}天</text>
						</view>
					</view>
					<view class="reward-right">
						<text class="reward-points">+{{todayReward}}</text>
						<text class="reward-desc">音乐点数</text>
					</view>
				</view>
				
				<button class="claim-button" @click="claimReward">领取奖励</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			today: new Date().getDate(),
			weekdays: ['日', '一', '二', '三', '四', '五', '六'],
			streakDays: 3,
			checkedDays: [],
			isCheckedToday: false,
			showRewardPopup: false,
			todayReward: 10,
			milestones: [
				{ days: 1, points: 5 },
				{ days: 3, points: 10 },
				{ days: 7, points: 15 },
				{ days: 15, points: 30 },
				{ days: 30, points: 50 }
			]
		}
	},
	computed: {
		// 获取当月第一天是星期几(0-6)
		firstDayOfMonth() {
			const firstDay = new Date(this.year, this.month - 1, 1).getDay();
			return firstDay;
		},
		// 获取当月天数
		daysInMonth() {
			return new Date(this.year, this.month, 0).getDate();
		},
		// 计算进度条宽度
		progressWidth() {
			// 查找当前里程碑索引
			const currentIndex = this.milestones.findIndex((m, index) => {
				return this.streakDays >= m.days && 
					(index === this.milestones.length - 1 || 
					this.streakDays < this.milestones[index + 1].days);
			});
			
			if (currentIndex === -1) return 0;
			if (currentIndex === this.milestones.length - 1) return 100;
			
			const current = this.milestones[currentIndex].days;
			const next = this.milestones[currentIndex + 1].days;
			const progress = ((this.streakDays - current) / (next - current)) * 25;
			
			return (currentIndex * 25) + progress;
		}
	},
	onLoad() {
		// 初始化已签到日期
		this.initCheckedDays();
	},
	methods: {
		navigateBack() {
			uni.navigateBack();
		},
		initCheckedDays() {
			// 模拟已签到数据
			// 假设本月前14天已签到
			const checkedDays = [];
			const currentDate = new Date();
			
			if (currentDate.getMonth() + 1 === this.month && 
				currentDate.getFullYear() === this.year) {
				// 如果是当前月份
				for (let i = 1; i < currentDate.getDate(); i++) {
					checkedDays.push(i);
				}
				
				// 检查今天是否已签到
				const todayChecked = Math.random() > 0.5; // 随机模拟
				this.isCheckedToday = todayChecked;
				
				if (todayChecked) {
					checkedDays.push(currentDate.getDate());
				}
			}
			
			this.checkedDays = checkedDays;
		},
		prevMonth() {
			if (this.month === 1) {
				this.year--;
				this.month = 12;
			} else {
				this.month--;
			}
			this.initCheckedDays();
		},
		nextMonth() {
			if (this.month === 12) {
				this.year++;
				this.month = 1;
			} else {
				this.month++;
			}
			this.initCheckedDays();
		},
		isPastDay(day) {
			const now = new Date();
			if (this.year < now.getFullYear()) return true;
			if (this.year > now.getFullYear()) return false;
			
			if (this.month < now.getMonth() + 1) return true;
			if (this.month > now.getMonth() + 1) return false;
			
			return day < now.getDate();
		},
		isToday(day) {
			const now = new Date();
			return this.year === now.getFullYear() && 
				this.month === now.getMonth() + 1 && 
				day === now.getDate();
		},
		isFutureDay(day) {
			const now = new Date();
			if (this.year > now.getFullYear()) return true;
			if (this.year < now.getFullYear()) return false;
			
			if (this.month > now.getMonth() + 1) return true;
			if (this.month < now.getMonth() + 1) return false;
			
			return day > now.getDate();
		},
		isCheckedDay(day) {
			return this.checkedDays.includes(day);
		},
		getNextMilestone(index) {
			if (index >= this.milestones.length - 1) return Infinity;
			return this.milestones[index + 1].days;
		},
		checkIn() {
			if (this.isCheckedToday) return;
			
			// 模拟签到过程
			uni.showLoading({
				title: '签到中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				
				// 更新签到状态
				this.isCheckedToday = true;
				this.checkedDays.push(this.today);
				this.streakDays++;
				
				// 计算今日奖励
				this.calculateTodayReward();
				
				// 显示奖励弹窗
				this.showRewardPopup = true;
			}, 500);
		},
		calculateTodayReward() {
			// 基础奖励
			let reward = 5;
			
			// 连续签到额外奖励
			for (const milestone of this.milestones) {
				if (this.streakDays === milestone.days) {
					reward = milestone.points;
					break;
				}
			}
			
			this.todayReward = reward;
		},
		claimReward() {
			uni.showToast({
				title: `获得${this.todayReward}点数`,
				icon: 'none'
			});
			
			setTimeout(() => {
				this.showRewardPopup = false;
				
				// 返回上一页
				setTimeout(() => {
					uni.navigateBack();
				}, 500);
			}, 1500);
		}
	}
}
</script>

<style lang="scss">
.container {
	min-height: 100vh;
	background-color: #121212;
	padding-bottom: 40rpx;
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
	width: 40rpx;
	height: 40rpx;
	color: #FFFFFF;
}

.title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* 月份导航控制 */
.month-controls {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20rpx 0 40rpx;
}

.control-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 32rpx;
	background-color: #2D2D2D;
	display: flex;
	align-items: center;
	justify-content: center;
}

.control-icon {
	width: 40rpx;
	height: 40rpx;
	color: #ACACAC;
}

/* 点数控制区域 */
.control-panel {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20rpx 0 40rpx;
}

.points-display {
	font-size: 28rpx;
	color: #FFFFFF;
	margin: 0 20rpx;
}

/* 日历区域 - 星期几 */
.calendar {
	padding: 0 30rpx;
	margin-bottom: 40rpx;
}

.week-row {
	display: flex;
	margin-bottom: 16rpx;
}

.week-day {
	flex: 1;
	text-align: center;
	font-size: 24rpx;
	color: #787878;
}

.days-container {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 16rpx;
}

.day-cell {
	aspect-ratio: 1/1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	border-radius: 16rpx;
	font-size: 28rpx;
	position: relative;
}

.day-cell.current-month {
	background-color: #2D2D2D;
	color: #FFFFFF;
}

.day-cell.today {
	background-color: #0B67EC;
	color: #FFFFFF;
}

.day-cell.checked {
	background-color: #36D1A6;
	color: #FFFFFF;
}

.day-number {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 28rpx;
}

/* 连续签到奖励 */
.streak-rewards {
	padding: 0 30rpx;
	margin-bottom: 40rpx;
}

.streak-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.streak-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.streak-count {
	font-size: 24rpx;
	color: #787878;
}

.rewards-row {
	display: flex;
	gap: 16rpx;
}

.reward-item {
	width: 100%;
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 40rpx 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.reward-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 32rpx;
	background-color: #3D3D3D;
	display: flex;
	align-items: center;
	justify-content: center;
}

.calendar-icon {
	width: 48rpx;
	height: 48rpx;
}

.reward-info {
	display: flex;
	flex-direction: column;
}

.reward-day {
	font-size: 24rpx;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.reward-points {
	font-size: 24rpx;
	color: #36D1A6;
}

.claimed-mark {
	font-size: 24rpx;
	color: #787878;
}

.claim-btn {
	width: 100%;
	height: 90rpx;
	border-radius: 45rpx;
	background-color: #36D1A6;
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 签到按钮 */
.checkin-footer {
	padding: 0 30rpx;
}

.checkin-button {
	width: 100%;
	height: 90rpx;
	border-radius: 45rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16rpx;
}

.checkin-button.disabled {
	opacity: 0.6;
}

.checkin-tip {
	font-size: 24rpx;
	color: #787878;
	text-align: center;
	display: block;
}

/* 奖励弹窗 */
.reward-popup {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
}

.reward-card {
	width: 80%;
	background-color: #1E1E1E;
	border-radius: 32rpx;
	padding: 40rpx 30rpx;
}

.reward-content {
	display: flex;
	justify-content: space-between;
	margin-bottom: 40rpx;
}

.reward-left {
	display: flex;
	align-items: center;
}

.reward-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	background: linear-gradient(135deg, #0B67EC 0%, #7342CC 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.reward-icon .iconfont {
	font-size: 40rpx;
	color: #FFFFFF;
}

.reward-info {
	display: flex;
	flex-direction: column;
}

.reward-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.reward-subtitle {
	font-size: 24rpx;
	color: #ACACAC;
}

.reward-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: center;
}

.reward-points {
	font-size: 48rpx;
	font-weight: 700;
	color: #36D1A6;
	margin-bottom: 8rpx;
}

.reward-desc {
	font-size: 24rpx;
	color: #ACACAC;
}

.claim-button {
	width: 100%;
	height: 90rpx;
	border-radius: 45rpx;
	background-color: #36D1A6;
	color: #FFFFFF;
	font-size: 32rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 图标样式设置 */
.check-img {
	width: 20rpx;
	height: 20rpx;
	color: #36D1A6;
}
</style> 