<template>
	<view class="login login-bg w-h-100" :class="darkMode?'custom-dark':'custom-light'">
		<view class="content">
			<!-- 头部logo -->
			<view class="header">
				<image :src="logoImage"></image>
				<text class="title">EHS-掌上观纹</text>
			</view>
			<!-- 主体表单 -->
			<view class="main">
				<wInput v-model="phoneData" type="text" maxlength="20" placeholder="请输入账号"></wInput>
				<wInput v-model="passData" type="password" maxlength="20" placeholder="请输入登录密码" isShowPass></wInput>
			</view>
			<wButton text="登 录" :rotate="isRotate" @click.native="startLogin()"></wButton>
		</view>
	</view>
</template>

<script>
	import { mapGetters } from 'vuex'
	import wInput from '@/components/watch-login/watch-input.vue'
	import wButton from '@/components/watch-login/watch-button.vue'
	import md5 from '@/common/lib/md5.min.js'

	export default {
		computed: {
			...mapGetters(['themeBgColor', 'darkMode']),
		},
		data() {
			return {
				// logo图片
				logoImage: '/static/img/logo.png',
				phoneData: '', //用户/电话
				passData: '', //密码
				isRotate: false, //是否加载旋转
			};
		},
		components: {
			wInput,
			wButton,
		},
		onLoad(options) {
			if (options.errorMsg) {
				uni.showToast({
					title: options.errorMsg,
					icon: 'none'
				})
			}
		},
		onReady() {
			this.setNavBarColor()
		},
		onShow() {
			this.setNavBarColor()
		},
		methods: {
			login(params) {
				if (params) {
					this.isRotate = true
					this.$store.dispatch('login', params).then(res => {
						this.isRotate = false
						console.log('res:==>',res)
						uni.reLaunch({
							url: '/pages/home/index',
						})
					}).catch(() => {
						this.isRotate = false
					})
				}
			},
			startLogin() {
				//登录
				if (this.isRotate) {
					//判断是否加载中，避免重复点击请求
					return false;
				}
				if (this.phoneData.length == "") {
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '用户名不能为空'
					});
					return;
				}
				if (this.passData.length == "") {
					uni.showToast({
						icon: 'none',
						position: 'bottom',
						title: '密码不能为空'
					});
					return;
				}

				// 网络请求
				const params = {
					userName: this.phoneData,
					password: this.passData
				}
				this.login(params)
			},
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
	}
</script>

<style>
	@import url("../../components/watch-login/css/icon.css");
	@import url("./css/main.css");

	.login-bg {
		/* width: 100%;
		height: 100%;
		background-image: url('/static/img/login-bg.png');
		background-size: cover;
		background-position: 50%;
		position: absolute; */
	}

	.login-bg .content .header image {
		width: 160rpx;
		height: 160rpx;
	}

	/* .login-bg .content .header {
		width: 241rpx;
		height: 241rpx;
		background-size: 241rpx;
		background-image: url('/static/img/logo.png');
	} */
</style>
