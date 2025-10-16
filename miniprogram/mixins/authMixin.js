/**
 * 登录认证 Mixin
 * 用于各个页面统一处理登录拦截
 */
export default {
	data() {
		return {
			// 登录弹窗显示状态
			showAuthModal: false
		}
	},
	
	methods: {
		/**
		 * 检查用户是否登录
		 * @returns {boolean}
		 */
		isUserLoggedIn() {
			const token = uni.getStorageSync('token')
			const userInfo = uni.getStorageSync('userInfo')
			return !!(token && userInfo)
		},
		
		/**
		 * 需要登录才能执行的操作
		 * @param {Function} callback - 登录成功后执行的回调
		 * @param {Object} options - 配置选项
		 * @returns {boolean} 是否已登录
		 */
		requireAuth(callback, options = {}) {
			if (this.isUserLoggedIn()) {
				// 已登录，直接执行回调
				if (callback && typeof callback === 'function') {
					callback()
				}
				return true
			} else {
				// 未登录，显示登录弹窗
				this.showAuthModal = true
				
				// 保存回调，登录成功后执行
				this._authCallback = callback
				this._authOptions = options
				
				return false
			}
		},
		
		/**
		 * 登录成功回调
		 * @param {Object} data - 登录返回的数据
		 */
		handleAuthSuccess(data) {
			console.log('登录成功:', data)
			
			// 执行之前保存的回调
			if (this._authCallback && typeof this._authCallback === 'function') {
				this._authCallback(data)
			}
			
			// 清除回调
			this._authCallback = null
			this._authOptions = null
			
			// 可以在这里触发全局事件
			uni.$emit('userLoggedIn', data)
		},
		
		/**
		 * 退出登录
		 */
		logout() {
			// 清除本地存储
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
			
			// 提示
			uni.showToast({
				title: '已退出登录',
				icon: 'success',
				duration: 2000
			})
			
			// 可以在这里触发全局事件
			uni.$emit('userLoggedOut')
			
			// 跳转到首页或登录页
			uni.reLaunch({
				url: '/pages/index/index'
			})
		},
		
		/**
		 * 获取当前用户信息
		 * @returns {Object|null}
		 */
		getCurrentUser() {
			return uni.getStorageSync('userInfo') || null
		},
		
		/**
		 * 更新用户信息到本地存储
		 * @param {Object} userInfo - 用户信息
		 */
		updateUserInfo(userInfo) {
			const currentInfo = this.getCurrentUser() || {}
			const updatedInfo = { ...currentInfo, ...userInfo }
			uni.setStorageSync('userInfo', updatedInfo)
			
			// 触发全局事件
			uni.$emit('userInfoUpdated', updatedInfo)
		}
	}
}
