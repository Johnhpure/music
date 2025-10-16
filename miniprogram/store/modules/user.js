import Vue from 'vue'
import _ from 'lodash'
import WeChatAuth from '@/utils/wechatAuth'
import minApi from '@/api/api'

export default {
	state: {
		user: null,
		creditBalance: 0,
		lastCreditUpdate: null
	},
	mutations: {
		login(state, user) {
			state.user = user
			// 如果用户数据中包含点数信息，同时更新点数
			if (user.creditBalance !== undefined) {
				state.creditBalance = user.creditBalance
				state.lastCreditUpdate = Date.now()
			}
			// 缓存用户信息
			Vue.prototype.$cache.set('_userInfo', user, 0)
		},
		logout(state) {
			state.user = null
			state.creditBalance = 0
			state.lastCreditUpdate = null
			// 清理缓存用户信息
			Vue.prototype.$cache.delete('_userInfo')
			// 清理微信登录信息
			WeChatAuth.logout()
		},
		// 更新用户点数
		updateCreditBalance(state, balance) {
			state.creditBalance = balance
			state.lastCreditUpdate = Date.now()
			// 同时更新用户信息中的点数（如果用户已登录）
			if (state.user) {
				state.user.creditBalance = balance
				Vue.prototype.$cache.set('_userInfo', state.user, 0)
			}
		}
	},
	actions: {
		// 微信自动登录检查
		async autoLogin({ commit, getters }) {
			try {
				// 优先检查微信登录状态
				if (WeChatAuth.isLoggedIn()) {
					const userInfo = WeChatAuth.getUserInfo()
					if (userInfo) {
						commit('login', {
							...userInfo,
							// 兼容现有代码结构
							ApiToken: uni.getStorageSync('token')
						})
						console.log('✅ 微信自动登录成功')
						return true
					}
				}

				// 兼容原有的账号密码登录逻辑
				if (getters.user && getters.user.F_Id && getters.user.userName && getters.user.password) {
					const params = {
						name: getters.user.userName,
						passwd: getters.user.password
					}
					uni.showLoading({
						title: '自动登录中...'
					})
					
					try {
						const res = await Vue.prototype.$minApi.login(params)
						uni.hideLoading()
						
						if (res.state == "success") {
							const userData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
							let tmp = { ...params, ...userData }
							commit('login', tmp)
							return true
						} else {
							throw new Error(res.message)
						}
					} catch (error) {
						uni.hideLoading()
						console.log('传统登录失败:', error.message)
						return false
					}
				}

				console.log('❌ 用户未登录')
				return false
				
			} catch (error) {
				console.error('自动登录检查失败:', error)
				return false
			}
		},

		// 微信登录
		async wechatLogin({ commit }, options = {}) {
			try {
				const result = await WeChatAuth.login(options)
				
				if (result.success) {
					commit('login', {
						...result.userInfo,
						ApiToken: result.token
					})
					return result
				} else {
					throw new Error(result.message)
				}
			} catch (error) {
				console.error('微信登录失败:', error)
				throw error
			}
		},

		// 兼容原有登录接口
		login({ commit }, params) {
			return new Promise((resolve, reject) => {
				Vue.prototype.$minApi.login(params).then(res => {
					if (res.state == "success") {
						// 如果 res.data 是字符串，需要解析成对象
						const userData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
						let tmp = { ...params, ...userData }
						commit('login', tmp)

						// 关于消息推送的保存
						// 保存clientid到服务器
						// #ifdef APP-PLUS
						const clientInfo = plus.push.getClientInfo()
						let pushUser = {
							clientid: clientInfo.clientid,
							appid: clientInfo.appid,
							appkey: clientInfo.appkey,
							userName: tmp.F_NickName,
							userRole: tmp.F_RoleName
						}
						// 提交api请求，服务端保存客户端角色信息
						// Vue.prototype.$minApi.savePushUser(pushUser)
						// #endif

						resolve(res)
					} else {
						uni.showToast({
							icon: 'none',
							position: 'bottom',
							title: res.message
						});
						reject(res)
					}
				}).catch(err => {
					reject(err)
				})
			})
		},

		logout({ commit }) {
			commit('logout')
			// 微信登录的退出逻辑已在 mutation 中处理
			
			// 暂时注释掉强制跳转到登录页，因为小程序没有专门的登录页
			// uni.reLaunch({
			// 	url: '/pages/login/login'
			// })
		},

		// 获取用户点数余额
		async getCreditBalance({ commit, getters }) {
			if (!getters.isLoggedIn) {
				throw new Error('用户未登录')
			}

			try {
				const response = await minApi.apis.getCreditBalance()
				
				if (response.code === 200) {
					const balance = response.data.balance || 0
					commit('updateCreditBalance', balance)
					return balance
				} else {
					throw new Error(response.message || '获取点数失败')
				}
			} catch (error) {
				console.error('获取点数余额失败:', error)
				throw error
			}
		}
	},
	getters: {
		user: state => {
			if (state.user) {
				return state.user
			}
			
			// 优先从缓存获取
			const cachedUser = Vue.prototype.$cache.get('_userInfo')
			if (cachedUser) {
				return cachedUser
			}
			
			// 尝试从微信登录信息获取
			if (WeChatAuth.isLoggedIn()) {
				const wechatUser = WeChatAuth.getUserInfo()
				if (wechatUser) {
					return {
						...wechatUser,
						ApiToken: uni.getStorageSync('token')
					}
				}
			}
			
			return null
		},
		
		// 检查是否已登录
		isLoggedIn: (state, getters) => {
			return !!(getters.user && (getters.user.ApiToken || getters.user.token))
		},
		
		// 获取用户头像
		userAvatar: (state, getters) => {
			if (getters.user && getters.user.avatarUrl) {
				return getters.user.avatarUrl
			}
			return '/static/img/profile.svg'
		},
		
		// 获取用户昵称
		userNickname: (state, getters) => {
			if (getters.user && getters.user.nickName) {
				return getters.user.nickName
			}
			return '音乐创作者'
		},
		
		// 获取用户点数余额
		userCreditBalance: (state) => {
			return state.creditBalance
		},
		
		// 获取点数最后更新时间
		lastCreditUpdateTime: (state) => {
			return state.lastCreditUpdate
		}
	}
}
