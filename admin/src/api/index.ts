import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: Date }
  }
}

import type { 
  ApiResponse, 
  PaginatedApiResponse, 
  LoginRequest, 
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '@/types'

// API Configuration
// 根据环境自动选择API地址
const getApiBaseUrl = (): string => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 根据当前域名自动判断
  const hostname = window.location.hostname
  if (hostname === 'admin.jianzhile.vip') {
    return 'https://adminapi.jianzhile.vip/api'
  }
  
  // 本地开发环境
  return 'http://localhost:3000/api'
}

const API_BASE_URL = getApiBaseUrl()
const API_TIMEOUT = 30000

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Token management
let refreshTokenPromise: Promise<string> | null = null

const getToken = (): string | null => {
  return localStorage.getItem('token')
}

const setToken = (token: string): void => {
  localStorage.setItem('token', token)
}

const removeToken = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

const setRefreshToken = (token: string): void => {
  localStorage.setItem('refreshToken', token)
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    })
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const duration = new Date().getTime() - (response.config.metadata?.startTime?.getTime() || 0)
    
    console.log('📥 API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: `${duration}ms`,
      data: response.data
    })
    
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any
    
    console.error('❌ Response Error:', {
      method: originalRequest?.method?.toUpperCase(),
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken && !refreshTokenPromise) {
          refreshTokenPromise = refreshAccessToken(refreshToken)
        }
        
        if (refreshTokenPromise) {
          const newToken = await refreshTokenPromise
          refreshTokenPromise = null
          
          setToken(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError)
        removeToken()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other errors
    const apiError = {
      code: error.response?.status || 0,
      message: (error.response?.data as any)?.message || error.message,
      details: error.response?.data,
      requestId: error.response?.headers['x-request-id'],
      timestamp: new Date().toISOString(),
      path: originalRequest?.url,
      method: originalRequest?.method
    }
    
    return Promise.reject(apiError)
  }
)

// Refresh token function
const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 10000 }
    )
    
    const { token } = response.data
    return token
  } catch (error) {
    console.error('Refresh token failed:', error)
    throw error
  }
}

// API wrapper functions
export const apiRequest = {
  get: <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => 
    api.get(url, { params }).then(res => res.data),
    
  post: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => 
    api.post(url, data).then(res => res.data),
    
  put: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => 
    api.put(url, data).then(res => res.data),
    
  patch: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => 
    api.patch(url, data).then(res => res.data),
    
  delete: <T = any>(url: string): Promise<ApiResponse<T>> => 
    api.delete(url).then(res => res.data)
}

// Paginated API wrapper
export const paginatedRequest = {
  get: <T = any>(url: string, params?: any): Promise<PaginatedApiResponse<T>> =>
    api.get(url, { params }).then(res => res.data)
}

// Upload wrapper
export const uploadRequest = (
  url: string, 
  formData: FormData, 
  onProgress?: (progress: number) => void
): Promise<ApiResponse> => {
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(progress)
      }
    }
  }).then(res => res.data)
}

// File upload API
export const fileAPI = {
  uploadImage: (file: File, onProgress?: (progress: number) => void): Promise<ApiResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    return uploadRequest('/user/files/upload', formData, onProgress)
  }
}

// WebSocket connection
export const createWebSocketConnection = (
  endpoint: string,
  protocols?: string[]
): WebSocket => {
  const token = getToken()
  const wsUrl = new URL(endpoint, API_BASE_URL.replace('http', 'ws'))
  
  if (token) {
    wsUrl.searchParams.set('token', token)
  }
  
  return new WebSocket(wsUrl.toString(), protocols)
}

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await api.get('/health', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

// Export the axios instance for advanced usage
export { api }

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    apiRequest.post('/auth/login', data),
    
  logout: (): Promise<ApiResponse> => 
    apiRequest.post('/auth/logout'),
    
  refreshToken: (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> =>
    apiRequest.post('/auth/refresh', data),
    
  getProfile: (): Promise<ApiResponse> => 
    apiRequest.get('/auth/profile'),
    
  updateProfile: (data: any): Promise<ApiResponse> => 
    apiRequest.put('/auth/profile', data)
}
// Admin User API
export const adminUserAPI = {
  // 获取用户列表
  getUserList: (params: any): Promise<PaginatedApiResponse<any>> =>
    paginatedRequest.get('/admin/users', params),
    
  // 获取用户详情
  getUserById: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.get(`/admin/users/${id}`),
    
  // 创建用户
  createUser: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/users', data),
    
  // 更新用户
  updateUser: (id: string, data: any): Promise<ApiResponse<any>> =>
    apiRequest.put(`/admin/users/${id}`, data),
    
  // 删除用户
  deleteUser: (id: string): Promise<ApiResponse> =>
    apiRequest.delete(`/admin/users/${id}`),
    
  // 切换用户状态
  toggleUserStatus: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/users/${id}/toggle-status`),
    
  // 重置密码
  resetPassword: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/users/${id}/reset-password`),
    
  // 调整积分
  adjustCredits: (id: string, data: { amount: number; reason: string }): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/users/${id}/adjust-credits`, data),
    
  // 批量操作
  bulkOperation: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/users/bulk-operation', data),
    
  // 用户统计
  getUserStats: (): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/users/stats/overview'),
    
  // 用户增长统计
  getUserGrowthStats: (params: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/users/stats/growth', params),
    
  // 导出用户
  exportUsers: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/users/export', data)
}

// Admin Work API
export const adminWorkAPI = {
  // 获取作品列表
  getWorkList: (params: any): Promise<PaginatedApiResponse<any>> =>
    paginatedRequest.get('/admin/works', params),
    
  // 获取作品详情
  getWorkById: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.get(`/admin/works/${id}`),
    
  // 更新作品
  updateWork: (id: string, data: any): Promise<ApiResponse<any>> =>
    apiRequest.put(`/admin/works/${id}`, data),
    
  // 删除作品
  deleteWork: (id: string): Promise<ApiResponse> =>
    apiRequest.delete(`/admin/works/${id}`),
    
  // 切换热门状态
  toggleHotStatus: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/works/${id}/toggle-hot`),
    
  // 切换发布状态
  togglePublishStatus: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/works/${id}/toggle-publish`),
    
  // 批量操作
  bulkOperation: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/works/bulk-operation', data),
    
  // 作品统计
  getWorkStats: (): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/works/stats/overview'),
    
  // 作品分析
  getWorkAnalytics: (params: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/works/stats/analytics', params),
    
  // 热门作品
  getPopularWorks: (params: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/works/stats/popular', params),
    
  // 导出作品
  exportWorks: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/works/export', data)
}

// Admin Content API (for existing content management)
export const adminContentAPI = {
  // Banner management
  getBanners: (params?: any): Promise<PaginatedApiResponse<any>> =>
    paginatedRequest.get('/admin/banner/list', params),
    
  getBanner: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.get(`/admin/banner/${id}`),
    
  createBanner: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/banner', data),
    
  updateBanner: (id: string, data: any): Promise<ApiResponse<any>> =>
    apiRequest.patch(`/admin/banner/${id}`, data),
    
  deleteBanner: (id: string): Promise<ApiResponse> =>
    apiRequest.delete(`/admin/banner/${id}`),
    
  // Prompt management
  getPrompts: (params?: any): Promise<PaginatedApiResponse<any>> =>
    paginatedRequest.get('/admin/prompt-template/list', params),
    
  getPrompt: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.get(`/admin/prompt-template/${id}`),
    
  createPrompt: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/prompt-template', data),
    
  updatePrompt: (id: string, data: any): Promise<ApiResponse<any>> =>
    apiRequest.patch(`/admin/prompt-template/${id}`, data),
    
  deletePrompt: (id: string): Promise<ApiResponse> =>
    apiRequest.delete(`/admin/prompt-template/${id}`),
    
  togglePromptStatus: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/prompt-template/${id}/toggle`),
    
  restorePrompt: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/prompt-template/${id}/restore`),
    
  // Hot recommendation management  
  getRecommendations: (params?: any): Promise<PaginatedApiResponse<any>> =>
    paginatedRequest.get('/admin/hot-recommendation/list', params),
    
  getRecommendation: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.get(`/admin/hot-recommendation/${id}`),
    
  createRecommendation: (data: any): Promise<ApiResponse<any>> =>
    apiRequest.post('/admin/hot-recommendation', data),
    
  updateRecommendation: (id: string, data: any): Promise<ApiResponse<any>> =>
    apiRequest.patch(`/admin/hot-recommendation/${id}`, data),
    
  deleteRecommendation: (id: string): Promise<ApiResponse> =>
    apiRequest.delete(`/admin/hot-recommendation/${id}`),
    
  toggleRecommendationStatus: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/hot-recommendation/${id}/toggle`),
    
  restoreRecommendation: (id: string): Promise<ApiResponse<any>> =>
    apiRequest.post(`/admin/hot-recommendation/${id}/restore`)
}

// Dashboard Stats API
export const dashboardAPI = {
  getOverviewStats: (): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/dashboard/overview'),
    
  getSystemStatus: (): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/dashboard/system-status'),
    
  getRecentActivity: (params?: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/dashboard/activity', params),
    
  getUserGrowthChart: (params?: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/dashboard/user-growth', params),
    
  getContentAnalyticsChart: (params?: any): Promise<ApiResponse<any>> =>
    apiRequest.get('/admin/dashboard/content-analytics', params)
}

// Notification helper
export const showNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  title?: string
): void => {
  // This will be implemented by the notification system
  if ((window as any).$notify) {
    (window as any).$notify[type](message, { title })
  }
}

// Request queue for handling concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running = false
  private concurrency = 6

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process(): Promise<void> {
    if (this.running || this.queue.length === 0) return
    
    this.running = true
    const running: Promise<any>[] = []
    
    while (this.queue.length > 0 && running.length < this.concurrency) {
      const request = this.queue.shift()!
      running.push(request())
    }
    
    if (running.length > 0) {
      await Promise.allSettled(running)
      this.running = false
      this.process() // Process remaining queue
    } else {
      this.running = false
    }
  }
}

export const requestQueue = new RequestQueue()

// Export utility functions
export {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled API Error:', event.reason)
  
  // Show user-friendly error message
  if (event.reason?.code >= 500) {
    showNotification('error', '服务器内部错误，请稍后重试')
  } else if (event.reason?.code === 429) {
    showNotification('warning', '请求过于频繁，请稍后重试')
  } else if (event.reason?.code >= 400) {
    showNotification('error', event.reason?.message || '请求失败')
  }
})

console.log('🌐 API Service initialized:', {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  hasToken: !!getToken()
})