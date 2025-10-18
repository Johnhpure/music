import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, setToken, removeToken, getToken } from '@/api'
import type { LoginRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<any>(null)
  const token = ref<string | null>(getToken())
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  const login = async (credentials: LoginRequest) => {
    loading.value = true
    try {
      const response = await authAPI.login(credentials)
      
      console.log('🔍 登录API响应:', response)
      console.log('🔍 response.data:', response.data)
      
      if (response.code === 200 && response.data) {
        // 处理嵌套的响应结构: response.data 可能本身就包含 code/message/data
        const actualData = response.data.data || response.data
        console.log('🔍 实际数据层:', actualData)
        
        // 兼容token和access_token两种字段
        const accessToken = actualData.token || actualData.access_token
        const userData = actualData.user || actualData.userInfo
        
        console.log('🔑 提取的token:', accessToken)
        console.log('👤 提取的用户:', userData)
        
        if (!accessToken) {
          throw new Error('登录响应中未找到token')
        }
        
        token.value = accessToken
        user.value = userData
        setToken(accessToken)
        
        console.log('✅ 登录成功:', user.value)
        return true
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('❌ 登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // 调用后端退出登录接口
      await authAPI.logout()
      console.log('✅ 后端退出登录成功')
    } catch (error) {
      console.warn('⚠️  后端退出登录失败，但继续清理本地状态:', error)
    } finally {
      // 无论后端是否成功，都清理本地状态
      user.value = null
      token.value = null
      removeToken()
      console.log('👋 已登出')
    }
  }

  const checkAuth = async () => {
    const savedToken = getToken()
    if (!savedToken) {
      return false
    }

    try {
      const response = await authAPI.getProfile()
      if (response.code === 200 && response.data) {
        user.value = response.data
        token.value = savedToken
        return true
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      logout()
    }
    
    return false
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    checkAuth
  }
})
