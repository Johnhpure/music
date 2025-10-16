<template>
  <view class="container">
    <image class="logo" src="/static/img/logo.png" mode="aspectFit"></image>
    <text class="title">EHS-掌上观纹</text>
    <!-- <view class="wave-loader">
      <view class="wave"></view>
    </view> -->
	<view class="dot-loader">
	  <view class="dot"></view>
	  <view class="dot"></view>
	  <view class="dot"></view>
	</view>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	
	computed: {
		...mapGetters(['user','themeBgColor', 'darkMode']),
	},
	onLoad() {
		setTimeout(() => {
			this.$minApi.checkLoginState().then(res=>{
				if(res.state == 'success'){
					uni.reLaunch({
						url: '/pages/home/index'
					});
				} else{
					uni.reLaunch({
						url: '/pages/login/login'
					});
				}
			})
		}, 1000); // 2秒后跳转
	},
	onReady() {
		this.setNavBarColor()
	},
	onShow() {
		this.setNavBarColor()
	},
	methods:{
		setNavBarColor() {
			// navBar-bg-color
			uni.setNavigationBarColor({
			    frontColor: '#000000',
			    backgroundColor: this.themeBgColor,
			    animation: {
			        duration: 400,
			        timingFunc: 'easeIn'
			    }
			})
		},
	}
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  padding-top:200rpx;
  height: 100vh;
  background-color: #ffffff;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}
.dot-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  background-color: #00984a;
  border-radius: 50%;
  opacity: 0;
  animation: dot-animation 1.5s infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}
.dot:nth-child(2) {
  animation-delay: 0.3s;
}
.dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes dot-animation {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
/* .wave-loader {
  position: relative;
  width: 100px;
  height: 20px;
  overflow: hidden;
}

.wave {
  width: 200%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 255, 0.2), rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0.2));
  position: absolute;
  left: -50%;
  animation: wave-animation 1.5s infinite linear;
}

@keyframes wave-animation {
  0% {
    left: -50%;
  }
  100% {
    left: 50%;
  }
} */
</style>
