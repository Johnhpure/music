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
      
      if (response.code === 200 && response.data) {
        token.value = response.data.access_token
        user.value = response.data.user
        setToken(response.data.access_token)
        
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

  const logout = () => {
    user.value = null
    token.value = null
    removeToken()
    console.log('👋 已登出')
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
