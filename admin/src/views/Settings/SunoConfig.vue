<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">SUNO配置管理</h1>
        <p class="text-gray-400 mt-1">管理SUNO API密钥和接口地址</p>
      </div>
      
      <CyberButton
        left-icon="mdi:plus"
        @click="openCreateModal"
      >
        新增配置
      </CyberButton>
    </div>

    <!-- Config List -->
    <div class="glass-panel p-6">
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
        <div class="flex items-start space-x-3">
          <Icon icon="mdi:alert-circle" class="text-red-500 text-2xl flex-shrink-0" />
          <div class="flex-1">
            <h4 class="text-red-400 font-semibold mb-1">加载失败</h4>
            <p class="text-gray-300 text-sm">{{ errorMessage }}</p>
            <button 
              @click="loadConfigs" 
              class="mt-2 text-sm text-primary-400 hover:text-primary-300 underline"
            >
              重试
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p class="text-gray-400 mt-2">加载中...</p>
      </div>

      <div v-else-if="configs.length === 0" class="text-center py-12">
        <Icon icon="mdi:database-off" class="text-6xl text-gray-600 mb-4" />
        <p class="text-gray-400">暂无配置，请添加第一个SUNO配置</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="config in configs"
          :key="config.id"
          class="glass-panel p-4 hover:border-primary-500/50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <span
                  :class="[
                    'w-3 h-3 rounded-full',
                    config.is_active ? 'bg-green-500' : 'bg-gray-500'
                  ]"
                />
                <h3 class="text-lg font-semibold text-white">
                  {{ config.description || '默认配置' }}
                </h3>
                <span
                  v-if="config.is_active"
                  class="px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded"
                >
                  已激活
                </span>
              </div>
              
              <div class="mt-2 space-y-1 text-sm">
                <div class="flex items-center text-gray-400">
                  <Icon icon="mdi:key" class="mr-2" />
                  <span>API Key: {{ config.api_key }}</span>
                </div>
                <div class="flex items-center text-gray-400">
                  <Icon icon="mdi:link" class="mr-2" />
                  <span>{{ config.api_url }}</span>
                </div>
                <div class="flex items-center text-gray-500 text-xs">
                  <Icon icon="mdi:clock" class="mr-2" />
                  <span>创建于: {{ formatDate(config.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <CyberButton
                v-if="!config.is_active"
                variant="outline"
                size="sm"
                @click="activateConfig(config.id)"
              >
                激活
              </CyberButton>
              
              <CyberButton
                variant="outline"
                size="sm"
                @click="openEditModal(config)"
              >
                编辑
              </CyberButton>
              
              <CyberButton
                v-if="!config.is_active"
                variant="danger"
                size="sm"
                @click="deleteConfig(config.id)"
              >
                删除
              </CyberButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="glass-panel w-full max-w-2xl p-6">
                <DialogTitle class="text-xl font-bold text-white mb-6">
                  {{ isEdit ? '编辑配置' : '新增配置' }}
                </DialogTitle>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      描述 <span class="text-gray-500">(可选)</span>
                    </label>
                    <input
                      v-model="formData.description"
                      type="text"
                      placeholder="例如：生产环境配置"
                      class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      API Key <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.api_key"
                      type="text"
                      placeholder="sk-xxxxxxxxxxxxxxxx"
                      class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      API接口地址 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="formData.api_url"
                      type="url"
                      placeholder="https://api.sunoapi.org"
                      class="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div class="flex items-center">
                    <input
                      v-model="formData.is_active"
                      type="checkbox"
                      id="is_active"
                      class="w-4 h-4 text-primary-600 bg-dark-800 border-gray-700 rounded focus:ring-primary-500"
                    />
                    <label for="is_active" class="ml-2 text-sm text-gray-300">
                      创建后立即激活
                    </label>
                  </div>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <CyberButton variant="outline" @click="closeModal">
                    取消
                  </CyberButton>
                  <CyberButton @click="submitForm" :loading="submitting">
                    {{ isEdit ? '更新' : '创建' }}
                  </CyberButton>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import CyberButton from "@/components/UI/CyberButton.vue"

import { sunoConfigAPI, showNotification } from "@/api"
import { format } from 'date-fns'

interface SunoConfig {
  id: number
  api_key: string
  api_url: string
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

const loading = ref(false)
const submitting = ref(false)
const configs = ref<SunoConfig[]>([])
const errorMessage = ref('')
const isModalOpen = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: 0,
  api_key: '',
  api_url: 'https://api.sunoapi.org',
  is_active: false,
  description: ''
})

const loadConfigs = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    // === 调试信息：检查Token和用户权限 ===
    console.log('='.repeat(60))
    console.log('🔍 Token存在:', !!localStorage.getItem('token'))
    
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      console.log('👤 当前用户:', user)
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('🎫 JWT Payload:', payload)
      } catch (e) {
        console.error('❌ JWT解析失败:', e)
      }
    } else {
      console.warn('⚠️ 未找到Token，请先登录')
    }
    console.log('='.repeat(60))
    // === 调试信息结束 ===
    
    console.log('🔄 开始加载SUNO配置...')
    const res = await sunoConfigAPI.getConfigs()
    console.log('✅ API响应:', res)
    if (res.code === 200) {
      configs.value = res.data
      console.log('✅ 配置列表:', configs.value)
    } else {
      const msg = res.message || '加载配置失败'
      console.error('❌ API返回非200状态码:', res)
      errorMessage.value = msg
      showNotification('error', msg)
    }
  } catch (error: any) {
    console.error('❌ 加载配置失败:', error)
    console.error('错误详情:', error.response || error)
    const msg = error.response?.data?.message || error.message || '加载配置失败'
    errorMessage.value = `${msg}${error.response?.status ? ` (${error.response.status})` : ''}`
    showNotification('error', msg)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEdit.value = false
  formData.value = {
    id: 0,
    api_key: '',
    api_url: 'https://api.sunoapi.org',
    is_active: false,
    description: ''
  }
  isModalOpen.value = true
}

const openEditModal = (config: SunoConfig) => {
  isEdit.value = true
  formData.value = {
    id: config.id,
    api_key: config.api_key,
    api_url: config.api_url,
    is_active: config.is_active,
    description: config.description || ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  if (!formData.value.api_key || !formData.value.api_url) {
    showNotification('warning', '请填写必填项')
    return
  }

  submitting.value = true
  try {
    const data = {
      api_key: formData.value.api_key,
      api_url: formData.value.api_url,
      is_active: formData.value.is_active,
      description: formData.value.description || undefined
    }

    if (isEdit.value) {
      await sunoConfigAPI.updateConfig(formData.value.id, data)
      showNotification('success', '更新成功')
    } else {
      await sunoConfigAPI.createConfig(data)
      showNotification('success', '创建成功')
    }

    closeModal()
    await loadConfigs()
  } catch (error: any) {
    showNotification('error', error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const activateConfig = async (id: number) => {
  try {
    await sunoConfigAPI.activateConfig(id)
    showNotification('success', '配置已激活')
    await loadConfigs()
  } catch (error: any) {
    showNotification('error', error.message || '激活失败')
  }
}

const deleteConfig = async (id: number) => {
  if (!confirm('确定要删除此配置吗？')) return

  try {
    await sunoConfigAPI.deleteConfig(id)
    showNotification('success', '删除成功')
    await loadConfigs()
  } catch (error: any) {
    showNotification('error', error.message || '删除失败')
  }
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.glass-panel {
  @apply bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg;
}
</style>
