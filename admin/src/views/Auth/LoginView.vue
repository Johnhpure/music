<template>
  <div class="min-h-screen flex items-center justify-center bg-cyber-darker">
    <div class="w-full max-w-md">
      <div class="bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white mb-2">管理控制台</h1>
          <p class="text-gray-400">登录到音乐平台管理后台</p>
        </div>
        
        <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {{ error }}
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <CyberInput
            v-model="form.username"
            label="用户名"
            placeholder="请输入用户名"
            required
            left-icon="mdi:account"
          />
          
          <CyberInput
            v-model="form.password"
            label="密码"
            type="password"
            placeholder="请输入密码"
            required
            left-icon="mdi:lock"
          />
          
          <CyberButton
            type="submit"
            class="w-full"
            :loading="loading"
          >
            登录
          </CyberButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CyberInput from '@/components/UI/CyberInput.vue'
import CyberButton from '@/components/UI/CyberButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.login({
      username: form.value.username,
      password: form.value.password
    })
    
    // 登录成功，跳转到首页
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err?.message || '登录失败，请检查用户名和密码'
    console.error('Login failed:', err)
  } finally {
    loading.value = false
  }
}
</script>