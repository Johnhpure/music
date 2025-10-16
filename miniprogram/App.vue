<script>
	import Vue from 'vue'
	// import { mapGetters } from 'vuex'
	export default {
		// computed: {
		// 	...mapGetters(['themeBgColor', 'darkMode']),
		// },
		// onShow: function() {
		//   // 延迟获取页面路径，确保页面栈已加载
		//   setTimeout(() => {
		//     const pages = getCurrentPages();
		//     const currentPage = pages.length ? pages[pages.length - 1].route : '';
		
		//     // 排除启动页
		//     if (currentPage !== 'pages/start/index') {
		//       // 初始化系统
		//       this.initSystem();
		//       this.setTabBarText();
		//       // 自动登录检测
		//       this.autoLogin();
		//       // 处理推送消息
		//       this.handlePush();
		//     }
		//   }, 100); // 100ms 确保页面栈加载完成
		// },

		onLaunch: function() {
			console.log('App Launch')
			// setNavBarColor();
			const pages = getCurrentPages();
			const currentPage = pages.length ? pages[pages.length - 1].route : '';
			
			// 初始化系统
			this.initSystem();
			console.log('currentPage',currentPage)
			// 排除启动页
			if (currentPage !== 'pages/start/index') {
				// this.setTabBarText();
				// 检查登录状态
				this.checkLoginStatus();
				// 处理推送消息
				this.handlePush();
			}
		},
		// onShow: function() {
		// 	// 延迟获取页面路径，确保页面栈已加载
		// 	setTimeout(() => {
		// 		const pages = getCurrentPages();
		// 		const currentPage = pages.length ? pages[pages.length - 1].route : '';
		// 		console.log('currentPage', currentPage);
				
		// 		// 排除启动页
		// 		if (currentPage !== 'pages/start/index') {
		// 			// this.setTabBarText();
		// 			// 自动登录检测
		// 			this.autoLogin();
		// 			// 处理推送消息
		// 			this.handlePush();
		// 		}
		// 	}, 100); // 100ms 确保页面栈加载完成
		// },
		methods: {
			/**
			 * 处理推送消息
			 */
			handlePush() {
				// #ifdef APP-PLUS
				const _self = this
				const _handlePush = function(message) {
					// 获取自定义信息
					let payload = message.payload
					try {
						// JSON解析
						payload = JSON.parse(payload)
						// 携带自定义信息跳转应用页面
						uni.navigateTo({
							url: '/pages/xxx?data=' + JSON.stringify(payload)
						})
						
					} catch(e) {}	
				}
				// 事件处理
				plus.push.addEventListener('click', _handlePush)
				plus.push.addEventListener('receive', _handlePush)
				// #endif
			},
			/**
			 * app整包更新检测
			 */
			appUpgrade(platform) {
				if (platform !== 'android') {
					return
				}
				//#ifdef APP-PLUS
				plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
					let params = {
						appid: plus.runtime.appid,
						version: wgtinfo.versionCode,
						platform: platform
					}
					this.$minApi.findUpgradeApp(params).then(appRes => {
						if (appRes.appid) {
							uni.showModal({
								title: "下载更新提示",
								content: appRes.note,
								showCancel: false,
								confirmText: '确定',
								success: sucRes => {
									if (sucRes.confirm) {
										plus.runtime.openURL(appRes.url)
										// uni.downloadFile({
										//     url: appRes.url,
										//     success: res => {}
										// })
									}
								}
							})
						}
					})
				})
				//#endif
			},
			/**
			 * 自动登录
			 * 判断本地是否有账号信息，如果有，就自动重新登录
			 */
			autoLogin() {
				this.$store.dispatch('autoLogin')
			},
			/**
			 * 初始化系统
			 */
			initSystem() {
				const self = this
				// 使用新的API替代过时的getSystemInfo
				Promise.all([
					uni.getDeviceInfo(),
					uni.getWindowInfo(),
					uni.getAppBaseInfo()
				]).then(([deviceInfo, windowInfo, appInfo]) => {
					const e = {
						...deviceInfo,
						...windowInfo, 
						...appInfo
					}
					// app整包更新检测
					self.appUpgrade(e.platform)

						// #ifndef MP
						Vue.prototype.StatusBar = e.statusBarHeight;
						if (e.platform == 'android') {
							Vue.prototype.CustomBar = e.statusBarHeight + 50;
						} else {
							Vue.prototype.CustomBar = e.statusBarHeight + 45;
						};
						// #endif

						// #ifdef MP-WEIXIN
						Vue.prototype.StatusBar = e.statusBarHeight;
						let custom = wx.getMenuButtonBoundingClientRect();
						Vue.prototype.Custom = custom;
						Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
						// #endif		

						// #ifdef MP-ALIPAY
						Vue.prototype.StatusBar = e.statusBarHeight;
						Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
						// #endif
					}).catch(err => {
						console.warn('获取系统信息失败:', err)
						// 降级处理，使用旧API
						uni.getSystemInfo({
							success: function(e) {
								self.appUpgrade(e.platform)
								Vue.prototype.StatusBar = e.statusBarHeight;
								// #ifdef MP-WEIXIN
								let custom = wx.getMenuButtonBoundingClientRect();
								Vue.prototype.Custom = custom;
								Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
								// #endif
							}
						})
					})
			},
			/**
			 * 检查登录状态
			 */
			async checkLoginStatus() {
				try {
					// 暂时注释掉API检查，避免干扰微信登录
					console.log('⏩ 跳过传统登录状态检查，使用微信登录');
					return;
					
					// const res = await this.$minApi.checkLoginState();
					// if (res.state === 'error') {
					// 	// 登录状态失效，清除登录信息并跳转到登录页
					// 	uni.removeStorageSync('token');
					// 	uni.removeStorageSync('userInfo');
					// 	uni.redirectTo({
					// 		url: '/pages/login/index'
					// 	});
					// }
				} catch (e) {
					console.error('检查登录状态失败', e);
					// 暂时不清除微信登录信息
					// uni.removeStorageSync('token');
					// uni.removeStorageSync('userInfo');
					// uni.redirectTo({
					// 	url: '/pages/login/index'
					// });
				}
			}
		}
	}
</script>

<style lang="less">
	@import "common/css/uni.css";
	@import "colorui/main.css";
	@import "colorui/icon.css";
	@import "common/css/iconfont.css";
	@import "common/css/common.css";
	@import "common/css/custom-dark.less";
	@import "common/css/custom-light.less";
</style>
