import Vue from 'vue'
import MinRequest from '@/utils/MinRequest'
import globalConfig from '@/config'
import requestQueue from '@/utils/requestQueue'
import errorHandler from '@/utils/errorHandler'
import tokenManager from '@/utils/tokenManager'
import type {
	APIResponse,
	CreditBalanceData,
	CreditPackageData,
	CreditLogData,
	BannerData,
	PromptTemplateData,
	HotRecommendationData,
	UserData,
	UserProfileData,
	WechatLoginRequest,
	WechatAuthRequest,
	LoginResponseData,
	MusicTaskData,
	CreateMusicTaskRequest,
	GenerateLyricsRequest,
	LyricsGenerationData,
	QueryHotRecommendationDto,
	QueryPromptTemplateDto,
	QueryCreditLogsDto,
	CreateOrderRequest,
	OrderData,
	UploadFileResponse,
	TrackPromptTemplateUsageDto,
	TrackMusicPlayDto
} from '@/types/api.d'

const minRequest = new MinRequest()

// Request interceptor with token management
minRequest.interceptors.request((request: any) => {
	const user = Vue.prototype.$store.getters.user
	// Prioritize token, then ApiToken (compatibility)
	const token = user?.token || user?.ApiToken || tokenManager.getToken();

	console.log('📤 API Request Interceptor:');
	console.log('  - URL:', request.url);
	console.log('  - Token exists:', !!token);

	if (token) {
		request.header = {
			...request.header,
			'Authorization': `Bearer ${token}`
		}
		console.log('  - Authorization header added');
	} else {
		console.log('  - ⚠️ No token, skipping Authorization header');
	}
	return request
})

// Response interceptor with error handling and token refresh
minRequest.interceptors.response(async (response: any): Promise<any> => {
	console.log('📥 API Response Interceptor:');
	console.log('  - Status Code:', response.statusCode);
	console.log('  - Response Data:', response.data);

	// 401 Unauthorized - Handle with automatic token refresh
	if (response.statusCode === 401) {
		console.log('🔐 Received 401 Unauthorized, attempting token refresh...');

		try {
			// Refresh token using TokenManager
			const newToken = await tokenManager.refreshToken(minRequest.apis);

			// Update token in Vuex store
			const user = Vue.prototype.$store.getters.user;
			if (user) {
				Vue.prototype.$store.commit('login', {
					...user,
					token: newToken,
					ApiToken: newToken
				});
			}

			console.log('✅ Token refreshed successfully, retry not implemented yet');
			// Note: Actual request retry would require restructuring the interceptor
			// For now, the token is refreshed but the original request fails
			// The next request will use the new token
		} catch (error) {
			console.error('❌ Token refresh failed:', error);
			// ErrorHandler will handle the redirect to login
			errorHandler.handle(error, '401 Token Refresh');
		}
	}

	return response.data
})

// Set default configuration
minRequest.setConfig((config: any) => {
	config.baseURL = globalConfig.baseUrl
	return config
})

export default {
	// 这里统一管理api请求
	apis: {
		// ============= 认证相关接口 =============
		// 微信小程序登录 (旧版本,兼容保留)
		wechatLogin(params: WechatLoginRequest): Promise<APIResponse<LoginResponseData>> {
			return minRequest.post('/auth/wechat-login', params)
		},
		// 微信小程序授权登录 (新版本,支持手机号获取)
		wechatAuth(params: WechatAuthRequest): Promise<APIResponse<LoginResponseData>> {
			return minRequest.post('/auth/wechat-auth', params)
		},
		// 检查登录状态
		checkLoginState(): Promise<APIResponse<{ isLoggedIn: boolean }>> {
			return minRequest.get('/auth/check')
		},
		// Refresh token
		refreshToken(): Promise<APIResponse<{ token: string }>> {
			return minRequest.post('/auth/refresh-token')
		},
		// 退出登录
		logout(): Promise<APIResponse<null>> {
			return minRequest.post('/auth/logout')
		},

		// ============= 用户相关接口 =============
		// 获取用户信息
		getUserProfile(): Promise<APIResponse<UserProfileData>> {
			return minRequest.get('/user/profile')
		},
		// 更新用户信息
		updateUserProfile(params: Partial<UserData>): Promise<APIResponse<UserData>> {
			return minRequest.put('/user/profile', params)
		},
		// 每日签到
		checkin(): Promise<APIResponse<{ credits: number; message: string }>> {
			return minRequest.post('/user/checkin')
		},
		// 获取用户统计
		getUserStats(): Promise<APIResponse<{ totalWorks: number; totalLikes: number; totalPlays: number }>> {
			return minRequest.get('/user/stats')
		},
		// 修改密码
		changePassword(params: { oldPassword: string; newPassword: string }): Promise<APIResponse<null>> {
			return minRequest.put('/user/password', params)
		},

		// ============= 音乐生成接口 =============
		// 创建音乐生成任务
		createMusicTask(params: CreateMusicTaskRequest): Promise<APIResponse<MusicTaskData>> {
			return minRequest.post('/user/music/generate', params)
		},
		// 获取任务详情
		getMusicTask(id: number): Promise<APIResponse<MusicTaskData>> {
			return minRequest.get(`/user/music/${id}`)
		},
		// 获取任务状态
		getMusicTaskStatus(id: number): Promise<APIResponse<{ status: string }>> {
			return minRequest.get(`/user/music/${id}/status`)
		},
		// 获取用户音乐任务列表
		getMusicTasks(params: { page?: number; pageSize?: number }): Promise<APIResponse<MusicTaskData[]>> {
			return minRequest.get('/user/music/list', params)
		},
		// 删除音乐任务
		deleteMusicTask(id: number): Promise<APIResponse<null>> {
			return minRequest.delete(`/user/music/${id}`)
		},

		// ============= AI歌词生成接口 =============
		// 生成AI歌词
		generateLyrics(params: GenerateLyricsRequest): Promise<APIResponse<LyricsGenerationData>> {
			return minRequest.post('/user/ai/lyrics/generate', params)
		},
		// 获取歌词生成历史
		getLyricsHistory(params: { page?: number; pageSize?: number }): Promise<APIResponse<LyricsGenerationData[]>> {
			return minRequest.get('/user/ai/lyrics/history', params)
		},
		// 获取歌词详情
		getLyricsDetail(requestId: string): Promise<APIResponse<LyricsGenerationData>> {
			return minRequest.get(`/user/ai/lyrics/${requestId}`)
		},
		// 评价歌词
		rateLyrics(requestId: string, params: { rating: number }): Promise<APIResponse<null>> {
			return minRequest.post(`/user/ai/lyrics/${requestId}/rate`, params)
		},
		// 收藏/取消收藏歌词
		toggleLyricsFavorite(requestId: string): Promise<APIResponse<{ isFavorite: boolean }>> {
			return minRequest.post(`/user/ai/lyrics/${requestId}/favorite`)
		},
		// 检查Gemini服务状态
		checkGeminiStatus(): Promise<APIResponse<{ status: string; available: boolean }>> {
			return minRequest.get('/user/ai/gemini/status')
		},

		// ============= 作品管理接口 =============
		// 获取用户作品列表
		getUserWorks(params: { page?: number; pageSize?: number }): Promise<APIResponse<any[]>> {
			return minRequest.get('/work/list', params)
		},
		// 获取公开作品列表
		getPublicWorks(params: { page?: number; pageSize?: number }): Promise<APIResponse<any[]>> {
			return minRequest.get('/work/public', params)
		},
		// 获取作品详情
		getWorkDetail(id: number): Promise<APIResponse<any>> {
			return minRequest.get(`/work/${id}`)
		},
		// 更新作品信息
		updateWork(id: number, params: any): Promise<APIResponse<any>> {
			return minRequest.put(`/work/${id}`, params)
		},
		// 删除作品
		deleteWork(id: number): Promise<APIResponse<null>> {
			return minRequest.delete(`/work/${id}`)
		},
		// 分享作品
		shareWork(id: number, params: any): Promise<APIResponse<any>> {
			return minRequest.post(`/work/${id}/share`, params)
		},
		// 点赞作品
		likeWork(id: number): Promise<APIResponse<{ liked: boolean }>> {
			return minRequest.post(`/work/${id}/like`)
		},

		// ============= 点数系统接口 =============
		// Get credit balance (with request deduplication)
		getCreditBalance(): Promise<APIResponse<CreditBalanceData>> {
			const key = 'creditBalance';
			return requestQueue.enqueue(key, () => minRequest.get('/user/credit/balance'));
		},
		// 获取点数记录
		getCreditLogs(params: QueryCreditLogsDto): Promise<APIResponse<CreditLogData[]>> {
			return minRequest.get('/user/credit/logs', params)
		},
		// 获取点数统计
		getCreditStats(): Promise<APIResponse<any>> {
			return minRequest.get('/user/credit/stats')
		},
		// 获取点数套餐
		getCreditPackages(): Promise<APIResponse<CreditPackageData[]>> {
			return minRequest.get('/user/credit/packages')
		},
		// 消费点数
		consumeCredit(params: { amount: number; reason: string }): Promise<APIResponse<CreditBalanceData>> {
			return minRequest.post('/user/credit/consume', params)
		},
		// 奖励点数
		rewardCredit(params: { amount: number; reason: string }): Promise<APIResponse<CreditBalanceData>> {
			return minRequest.post('/user/credit/reward', params)
		},

		// ============= 素材管理接口 =============
		// 获取素材列表(歌词模板、灵感推荐等)
		getMaterials(params: any): Promise<APIResponse<any[]>> {
			return minRequest.get('/material/list', params)
		},
		// 获取推荐素材
		getRecommendedMaterials(params: any): Promise<APIResponse<any[]>> {
			return minRequest.get('/material/recommended', params)
		},
		// 获取素材详情
		getMaterialDetail(id: number): Promise<APIResponse<any>> {
			return minRequest.get(`/material/${id}`)
		},
		// 收藏/取消收藏素材
		toggleMaterialFavorite(id: number): Promise<APIResponse<{ isFavorite: boolean }>> {
			return minRequest.post(`/material/${id}/favorite`)
		},
		// 使用素材
		useMaterial(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/material/use', params)
		},
		// 获取首页数据(提示词模板)
		getHomePageData(): Promise<APIResponse<any>> {
			return minRequest.get('/material/home-data')
		},
		// 获取热门推荐作品(旧接口,保留兼容)
		getHotRecommendationsOld(params: any): Promise<APIResponse<any[]>> {
			return minRequest.get('/work/hot-recommendations', params)
		},

		// ============= Banner轮播图管理接口 =============
		// Get banner list (with request deduplication)
		getBanners(): Promise<APIResponse<BannerData[]>> {
			const key = 'banners';
			return requestQueue.enqueue(key, () => minRequest.get('/public/banner/list'));
		},
		// Get active banners (with request deduplication)
		getActiveBanners(): Promise<APIResponse<BannerData[]>> {
			const key = 'activeBanners';
			return requestQueue.enqueue(key, () => minRequest.get('/banners/active'));
		},
		// 创建轮播图
		createBanner(params: Partial<BannerData>): Promise<APIResponse<BannerData>> {
			return minRequest.post('/banner/create', params)
		},
		// 更新轮播图
		updateBanner(id: number, params: Partial<BannerData>): Promise<APIResponse<BannerData>> {
			return minRequest.put(`/banner/${id}`, params)
		},
		// 删除轮播图
		deleteBanner(id: number): Promise<APIResponse<null>> {
			return minRequest.delete(`/banner/${id}`)
		},
		// 更新轮播图状态(启用/禁用)
		toggleBannerStatus(id: number): Promise<APIResponse<BannerData>> {
			return minRequest.post(`/banner/${id}/toggle`)
		},
		// 更新轮播图排序
		updateBannerSort(sortData: any): Promise<APIResponse<null>> {
			return minRequest.post('/banner/sort', sortData)
		},

		// ============= 创作提示词管理接口 =============
		// Get active prompt templates (with request deduplication)
		getActivePromptTemplates(params?: QueryPromptTemplateDto): Promise<APIResponse<PromptTemplateData[]>> {
			const key = requestQueue.generateKey('promptTemplates', params);
			console.log('📋 Calling prompt template API:', '/public/prompt-template/list', params);
			return requestQueue.enqueue(key, () => minRequest.get('/public/prompt-template/list', params || {}));
		},
		// 获取所有提示词列表(管理后台用)
		getPromptTemplates(params?: QueryPromptTemplateDto | string): Promise<APIResponse<PromptTemplateData[]>> {
			if (typeof params === 'string') {
				// Legacy support: string parameter as category
				const category = params;
				console.log('📋 调用模板列表API:', '/public/prompt-template/list', { category });
				const queryParams = category ? { category } : {};
				return minRequest.get('/public/prompt-template/list', queryParams);
			}
			return minRequest.get('/', {}).then((response: APIResponse<any>) => {
				if (response.code === 200 && response.data.promptTemplates) {
					const templates = response.data.promptTemplates.templates;
					if (params && (params as QueryPromptTemplateDto).category && (params as QueryPromptTemplateDto).category !== '全部') {
						return {
							...response,
							data: templates.filter((t: PromptTemplateData) => t.category === (params as QueryPromptTemplateDto).category)
						};
					}
					return { ...response, data: templates };
				}
				return response;
			});
		},
		// 根据标签获取提示词
		getPromptTemplatesByTag(tag: string): Promise<APIResponse<PromptTemplateData[]>> {
			return minRequest.get(`/prompt-template/tag/${tag}`)
		},
		// 创建提示词
		createPromptTemplate(params: Partial<PromptTemplateData>): Promise<APIResponse<PromptTemplateData>> {
			return minRequest.post('/prompt-template/create', params)
		},
		// 更新提示词
		updatePromptTemplate(id: number, params: Partial<PromptTemplateData>): Promise<APIResponse<PromptTemplateData>> {
			return minRequest.put(`/prompt-template/${id}`, params)
		},
		// 删除提示词
		deletePromptTemplate(id: number): Promise<APIResponse<null>> {
			return minRequest.delete(`/prompt-template/${id}`)
		},
		// 更新提示词状态(启用/禁用)
		togglePromptTemplateStatus(id: number): Promise<APIResponse<PromptTemplateData>> {
			return minRequest.post(`/prompt-template/${id}/toggle`)
		},
		// 更新提示词排序
		updatePromptTemplateSort(sortData: any): Promise<APIResponse<null>> {
			return minRequest.post('/prompt-template/sort', sortData)
		},
		// 批量操作提示词
		batchPromptTemplateOperation(params: any): Promise<APIResponse<null>> {
			return minRequest.post('/prompt-template/batch', params)
		},
		// 记录提示词使用统计
		trackPromptTemplateUsage(params: TrackPromptTemplateUsageDto): Promise<APIResponse<null>> {
			console.log('📊 记录提示词使用统计:', params);
			return minRequest.post('/public/prompt-template/usage', params);
		},

		// ============= AI灵感扩展接口 =============
		// AI灵感扩展
		expandInspiration(params: { theme: string; keywords?: string[] }): Promise<APIResponse<any>> {
			return minRequest.post('/user/ai/expand-inspiration', params)
		},

		// ============= 创作模板接口 =============
		// 获取模板分类
		getPromptCategories(): Promise<APIResponse<string[]>> {
			console.log('📋 调用分类列表API:', '/public/prompt-template/categories');
			return minRequest.get('/public/prompt-template/categories');
		},
		// 记录模板使用
		recordTemplateUsage(templateId: number): Promise<APIResponse<null>> {
			return minRequest.post('/public/prompt-template/usage', { templateId })
		},
		// 管理后台:获取模板列表
		getAdminPromptTemplates(params: any): Promise<APIResponse<PromptTemplateData[]>> {
			return minRequest.get('/prompt-template/admin/list', params)
		},
		// 切换模板启用状态
		togglePromptTemplate(id: number): Promise<APIResponse<PromptTemplateData>> {
			return minRequest.post(`/prompt-template/${id}/toggle`)
		},

		// ============= 热门推荐管理接口 =============
		// Get hot recommendations (with request deduplication)
		getHotRecommendations(params: QueryHotRecommendationDto): Promise<APIResponse<HotRecommendationData[]>> {
			const key = requestQueue.generateKey('hotRecommendations', params);
			return requestQueue.enqueue(key, () => minRequest.get('/public/hot-recommendation/list', params));
		},
		// 获取推荐分类标签
		getRecommendationCategories(): Promise<APIResponse<string[]>> {
			return minRequest.get('/public/hot-recommendation/categories')
		},
		// 根据分类获取推荐音乐
		getRecommendationsByCategory(categoryId: number, params: any): Promise<APIResponse<HotRecommendationData[]>> {
			return minRequest.get(`/public/hot-recommendation/category/${categoryId}`, params)
		},
		// 获取所有推荐音乐(管理后台用)
		getAllRecommendations(params: any): Promise<APIResponse<HotRecommendationData[]>> {
			return minRequest.get('/hot-recommendation/admin/list', params)
		},
		// 创建推荐音乐
		createRecommendation(params: Partial<HotRecommendationData>): Promise<APIResponse<HotRecommendationData>> {
			return minRequest.post('/hot-recommendation/create', params)
		},
		// 更新推荐音乐
		updateRecommendation(id: number, params: Partial<HotRecommendationData>): Promise<APIResponse<HotRecommendationData>> {
			return minRequest.put(`/hot-recommendation/${id}`, params)
		},
		// 删除推荐音乐
		deleteRecommendation(id: number): Promise<APIResponse<null>> {
			return minRequest.delete(`/hot-recommendation/${id}`)
		},
		// 更新推荐音乐状态(启用/禁用)
		toggleRecommendationStatus(id: number): Promise<APIResponse<HotRecommendationData>> {
			return minRequest.post(`/hot-recommendation/${id}/toggle`)
		},
		// 更新推荐音乐排序
		updateRecommendationSort(sortData: any): Promise<APIResponse<null>> {
			return minRequest.post('/hot-recommendation/sort', sortData)
		},
		// 批量操作推荐音乐
		batchRecommendationOperation(params: any): Promise<APIResponse<null>> {
			return minRequest.post('/hot-recommendation/batch', params)
		},
		// 记录音乐播放统计
		trackMusicPlay(params: TrackMusicPlayDto): Promise<APIResponse<null>> {
			return minRequest.post('/public/hot-recommendation/play', params)
		},

		// ============= 支付相关接口 =============
		// 创建订单
		createOrder(params: CreateOrderRequest): Promise<APIResponse<OrderData>> {
			return minRequest.post('/user/payment/order', params)
		},
		// 创建微信支付
		createWechatPayment(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/user/payment/wechat-pay', params)
		},
		// 获取订单详情
		getOrderDetail(id: number): Promise<APIResponse<OrderData>> {
			return minRequest.get(`/user/payment/order/${id}`)
		},
		// 获取订单列表
		getOrders(params: { page?: number; pageSize?: number }): Promise<APIResponse<OrderData[]>> {
			return minRequest.get('/user/payment/orders', params)
		},
		// 查询订单状态
		queryOrderStatus(orderNo: string): Promise<APIResponse<{ status: string }>> {
			return minRequest.get(`/user/payment/query/${orderNo}`)
		},
		// 取消订单
		cancelOrder(orderNo: string): Promise<APIResponse<null>> {
			return minRequest.post(`/user/payment/cancel/${orderNo}`)
		},

		// ============= 文件管理接口 =============
		// 文件上传
		uploadFile(filePath: string, fileName: string, fileType: string, purpose: string): Promise<UploadFileResponse> {
			const user = Vue.prototype.$store.getters.user
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: globalConfig.baseUrl + '/user/files/upload',
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': `Bearer ${user.ApiToken}`
					},
					formData: {
						type: fileType || 'audio',
						purpose: purpose || 'music_upload'
					},
					success: (res: any) => {
						if (typeof res.data === 'string') {
							res.data = JSON.parse(res.data)
						}
						if (res.data.code === 200) {
							resolve(res.data)
						} else {
							reject(res.data)
						}
					},
					fail: (err: any) => {
						reject({
							code: 500,
							message: err.errMsg || '上传失败'
						})
					}
				})
			})
		},
		// 获取文件信息
		getFileInfo(id: number): Promise<APIResponse<any>> {
			return minRequest.get(`/user/files/${id}`)
		},
		// 文件下载
		downloadFile(id: number): Promise<APIResponse<any>> {
			return minRequest.get(`/user/files/${id}/download`)
		},
		// 文件预览
		previewFile(id: number): Promise<APIResponse<any>> {
			return minRequest.get(`/user/files/${id}/preview`)
		},

		listUser(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/User/GetUserList', params)
		},
		listRole(): Promise<APIResponse<any>> {
			return minRequest.get('/User/GetRoleList')
		},
		settingRole(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/User/SettingRole', params)
		},
		listContractor(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetContractorList', params)
		},
		getContractor(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetContractorInfo', params)
		},
		listStaff(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetStaffList', params)
		},
		getStaff(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetStaffInfo', params)
		},
		saveStaff(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/Task/StaffSave', params)
		},
		saveContractor(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/Task/ContractorSave', params)
		},
		delStaff(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/Task/DelStaffInfo', params)
		},
		userPwdModify(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/post/user/pwd/modify', params)
		},
		// 项目审批列表
		listAuditProject(): Promise<APIResponse<any>> {
			return minRequest.get('/get/audit/project/list')
		},
		// 用户审批列表
		listAuditUser(): Promise<APIResponse<any>> {
			return minRequest.get('/get/audit/user/list')
		},
		// 事故模块接口
		// 获取事故列表
		getEventList(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetEventList', params)
		},
		// 获取事故详情
		getEventInfo(eventId: number): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetEventInfo', { eventId })
		},
		// 保存事故信息
		saveEvent(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/Event/EventSave', params)
		},
		getEventDays(): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetDays')
		},
		// 任务模块接口
		// 获取任务列表
		getTaskList(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetTaskList', params)
		},
		// 获取分组任务详情
		getGroupTaskInfo(taskId: number): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetGroupTaskInfo', { taskId })
		},
		// 获取simple任务详情
		getSimpleTaskInfo(taskId: number): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetSimpleTaskInfo', { taskId })
		},
		// 获取任务详情
		getTaskInfo(taskId: number): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetTaskInfo', { taskId })
		},
		// 保存任务信息
		saveTask(params: any): Promise<APIResponse<any>> {
			return minRequest.post('/Task/SaveTask', params)
		},
		loadBarCharts(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetChartsJson', params)
		},
		loadTableCharts(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetChartsByYearJson', params)
		},
		loadEventByMonth(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetChartsByMonthJson', params)
		},
		loadEventByDay(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Event/GetChartsByDayJson', params)
		},
		loadTaskCharts(params: any): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetChartsJson', params)
		},
		loadIndexData(): Promise<APIResponse<any>> {
			return minRequest.get('/Task/GetIndexData')
		}
	}
}
