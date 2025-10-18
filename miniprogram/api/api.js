import Vue from 'vue'
import MinRequest from '@/utils/MinRequest'
import globalConfig from '@/config'

const minRequest = new MinRequest()

// 请求拦截器
minRequest.interceptors.request((request) => {
	// 优先从 localStorage 获取 token（微信登录）
	const token = uni.getStorageSync('token')
	if (token) {
		request.header = {
			...request.header,
			'Authorization': `Bearer ${token}`
		}
	} else {
		// 兼容老系统的 WC-Token
		const user = Vue.prototype.$store.getters.user
		if (user && user.ApiToken) {
			request.header = {
				...request.header,
				'WC-Token': user.ApiToken
			}
		}
	}
	return request
})

// 响应拦截器
minRequest.interceptors.response((response) => {
	return response.data
})

// 设置默认配置
minRequest.setConfig((config) => {
	config.baseURL = globalConfig.baseUrl
	return config
})

export default {
	// 这里统一管理api请求
	apis: {
		login(params) {
			return minRequest.post('/User/Login', params)
		},
		logout() {
			return minRequest.post('/User/LoginOff')
		},
		checkLoginState() {
			return minRequest.post('/User/CheckLoginState')
		},
		// 微信小程序登录
		wechatLogin(params) {
			return minRequest.post('/auth/wechat-login', params)
		},
		// 获取用户手机号
		getUserPhone(params) {
			return minRequest.post('/auth/wechat/phone', params)
		},
		// 更新用户资料
		updateUserProfile(params) {
			return minRequest.put('/user/profile', params)
		},
		// 获取用户信息
		getUserInfo() {
			return minRequest.get('/v1/user/info')
		},
		// 获取用户点数
		getUserPoints() {
			return minRequest.get('/v1/user/points')
		},
		// Banner相关接口
		// 获取首页Banner列表
		getBanners() {
			return minRequest.get('/public/banner/list')
		},
		
		// 提示词相关接口
		// 获取提示词模板列表（公开接口）
		getPromptTemplates(params) {
			return minRequest.get('/public/prompt-template/list', params)
		},
		// 获取提示词分类
		getPromptCategories() {
			return minRequest.get('/public/prompt-template/categories')
		},
		// 记录提示词使用
		recordPromptUsage(params) {
			return minRequest.post('/public/prompt-template/usage', params)
		},
		
		// 热门推荐相关接口
		// 获取热门推荐列表（公开接口）
		getHotRecommendations(params) {
			return minRequest.get('/public/hot-recommendation/list', params)
		},
		// 获取推荐分类
		getRecommendationCategories() {
			return minRequest.get('/public/hot-recommendation/categories')
		},
		// 按分类获取推荐
		getRecommendationsByCategory(categoryId, params) {
			return minRequest.get(`/public/hot-recommendation/category/${categoryId}`, params)
		},
		// 记录播放
		trackMusicPlay(params) {
			return minRequest.post('/public/hot-recommendation/play', params)
		},
		// 切换点赞
		toggleRecommendationLike(id) {
			return minRequest.post(`/public/hot-recommendation/${id}/toggle-like`)
		},
		// 上传头像
		uploadAvatar(filePath) {
			const token = uni.getStorageSync('token')
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: globalConfig.baseUrl + '/upload/avatar',
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						console.log('上传头像响应:', res)
						if(typeof res.data === 'string') {
							try {
								res.data = JSON.parse(res.data)
							} catch (e) {
								console.error('解析响应失败:', e)
								reject({
									code: 500,
									msg: '响应格式错误'
								})
								return
							}
						}
						if(res.data.code === 200) {
							resolve(res.data)
						} else {
							reject(res.data)
						}
					},
					fail: (err) => {
						console.error('上传头像失败:', err)
						reject({
							code: 500,
							msg: err.errMsg || '上传失败'
						})
					}
				})
			})
		},
		listUser(params) {
			return minRequest.get('/User/GetUserList',params)
		},
		listRole() {
			return minRequest.get('/User/GetRoleList')
		},
		settingRole(params){
			return minRequest.post('/User/SettingRole',params)
		},
		listContractor(params) {
			return minRequest.get('/Task/GetContractorList',params)
		},
		getContractor(params) {
			return minRequest.get('/Task/GetContractorInfo',params)
		},
		listStaff(params) {
			return minRequest.get('/Task/GetStaffList',params)
		},
		getStaff(params) {
			return minRequest.get('/Task/GetStaffInfo',params)
		},
		saveStaff(params){
			return minRequest.post('/Task/StaffSave',params)
		},
		saveContractor(params){
			return minRequest.post('/Task/ContractorSave',params)
		},
		delStaff(params){
			return minRequest.post('/Task/DelStaffInfo',params)
		},
		userPwdModify(params) {
			return minRequest.post('/post/user/pwd/modify', params)
		},
		// 项目审批列表
		listAuditProject() {
			return minRequest.get('/get/audit/project/list')
		},
		// 用户审批列表
		listAuditUser() {
			return minRequest.get('/get/audit/user/list')
		},
		// 事故模块接口
		// 获取事故列表
		getEventList(params) {
			return minRequest.get('/Event/GetEventList', params)
		},
		// 获取事故详情
		getEventInfo(eventId) {
			return minRequest.get('/Event/GetEventInfo', { eventId })
		},
		// 保存事故信息
		saveEvent(params) {
			return minRequest.post('/Event/EventSave', params)
		},
		getEventDays() {
			return minRequest.get('/Event/GetDays')
		},
		// 任务模块接口
		// 获取任务列表
		getTaskList(params) {
			return minRequest.get('/Task/GetTaskList', params)
		},
		// 获取分组任务详情
		getGroupTaskInfo(taskId) {
			return minRequest.get('/Task/GetGroupTaskInfo', { taskId })
		},
		// 获取simple任务详情
		getSimpleTaskInfo(taskId) {
			return minRequest.get('/Task/GetSimpleTaskInfo', { taskId })
		},
		// 获取任务详情
		getTaskInfo(taskId) {
			return minRequest.get('/Task/GetTaskInfo', { taskId })
		},
		// 保存任务信息
		saveTask(params) {
			return minRequest.post('/Task/SaveTask', params)
		},
		loadBarCharts(params){
			return minRequest.get('/Event/GetChartsJson', params)
		},
		loadTableCharts(params){
			return minRequest.get('/Event/GetChartsByYearJson', params)
		},
		loadEventByMonth(params){
			return minRequest.get('/Event/GetChartsByMonthJson',params)
		},
		loadEventByDay(params){
			return minRequest.get('/Event/GetChartsByDayJson',params)
		},
		loadTaskCharts(params){
			return minRequest.get('/Task/GetChartsJson',params)
		},
		loadIndexData(){
			return minRequest.get('/Task/GetIndexData')
		},
		/**
		 * 文件上传
		 * @param {Object} params - 上传参数
		 * @param {File} params.filePath - 文件路径
		 * @param {String} params.name - 文件参数名
		 * @param {String} params.fileby - 文件用途
		 * @param {Number} [params.filetype=1] - 文件类型：1图片，2excel，3template，4文档
		 * @returns {Promise}
		 */
		uploadFile(params) {
			const user = Vue.prototype.$store.getters.user
			return new Promise((resolve, reject) => {
				console.log('params', params)

				uni.uploadFile({
					url: globalConfig.baseUrl + '/File/Upload?'+'filetype=4&fileby'+params.fileby,
					filePath: params.filePath,
					name: params.name || 'file',
					header: {
						'WC-Token': user.ApiToken
					},
					formData: {
						fileby: params.fileby || 'default',
						filetype: params.filetype || 1
					},
					success: (res) => {
						if(typeof res.data === 'string') {
							res.data = JSON.parse(res.data)
						}
						if(res.data.code === 0) {
							resolve({
								code: 200,
								msg: '上传成功',
								data: res.data.data[0].src // 返回文件路径
							})
						} else {
							reject({
								code: res.data.code,
								msg: res.data.msg || '上传失败'
							})
						}
					},
					fail: (err) => {
						reject({
							code: 500,
							msg: err.errMsg || '上传失败'
						})
					}
				})
			})
		}
	}
}
