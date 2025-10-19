<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">AI配置管理</h1>
        <p class="text-gray-400 mt-1">统一管理AI大模型配置和API密钥</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="loadAllData"
          :loading="loading"
        >
          刷新数据
        </CyberButton>
      </div>
    </div>

    <!-- AI Providers Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="provider in providers" 
        :key="provider.id"
        class="relative group cursor-pointer"
        @click="openProviderDetail(provider)"
      >
        <!-- Provider Card -->
        <div 
          class="relative p-8 rounded-2xl border-2 transition-all duration-300 h-full"
          :class="{
            'border-cyber-purple bg-cyber-purple/10': provider.isActive,
            'border-gray-700 bg-glass-white/5 hover:border-gray-600': !provider.isActive,
          }"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center space-x-4">
              <div 
                class="w-16 h-16 rounded-xl flex items-center justify-center"
                :class="provider.isActive ? 'bg-cyber-purple/20' : 'bg-gray-700/50'"
              >
                <Icon 
                  :icon="getProviderIcon(provider.providerCode)" 
                  class="w-10 h-10"
                  :class="provider.isActive ? 'text-cyber-purple' : 'text-gray-400'"
                />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">{{ provider.providerName }}</h3>
                <p class="text-sm text-gray-400 mt-1">{{ provider.providerCode }}</p>
              </div>
            </div>
            
            <!-- Enable Toggle Button -->
            <div @click.stop>
              <button
                @click="toggleProviderActive(provider)"
                class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
                :class="provider.isActive ? 'bg-cyber-purple' : 'bg-gray-600'"
              >
                <span
                  class="inline-block h-6 w-6 transform rounded-full bg-white transition-transform"
                  :class="provider.isActive ? 'translate-x-7' : 'translate-x-1'"
                ></span>
              </button>
            </div>
          </div>

          <!-- Card Content -->
          <div class="space-y-4">
            <p class="text-gray-300 text-sm line-clamp-2 min-h-[2.5rem]">
              {{ provider.description || '暂无描述' }}
            </p>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="flex items-center space-x-2 mb-1">
                  <Icon icon="mdi:cube-outline" class="w-4 h-4 text-gray-400" />
                  <span class="text-xs text-gray-400">模型数量</span>
                </div>
                <p class="text-2xl font-bold text-white">{{ provider.modelsCount || 0 }}</p>
              </div>
              
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="flex items-center space-x-2 mb-1">
                  <Icon icon="mdi:key-variant" class="w-4 h-4 text-gray-400" />
                  <span class="text-xs text-gray-400">API密钥</span>
                </div>
                <p class="text-2xl font-bold text-white">{{ provider.activeKeysCount || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Click hint -->
          <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="flex items-center space-x-1 text-cyber-purple text-sm">
              <span>点击配置</span>
              <Icon icon="mdi:chevron-right" class="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Provider Detail Drawer -->
    <Teleport to="body">
      <div 
        v-if="showDetailDrawer" 
        class="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm"
        @click.self="closeDetailDrawer"
      >
        <div 
          class="w-full max-w-4xl h-full bg-gray-900 border-l border-gray-700 overflow-y-auto"
          @click.stop
        >
          <!-- Detail Header -->
          <div class="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div 
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="selectedProvider?.isActive ? 'bg-cyber-purple/20' : 'bg-gray-700/50'"
                >
                  <Icon 
                    :icon="getProviderIcon(selectedProvider?.providerCode)" 
                    class="w-8 h-8"
                    :class="selectedProvider?.isActive ? 'text-cyber-purple' : 'text-gray-400'"
                  />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ selectedProvider?.providerName }}</h2>
                  <p class="text-sm text-gray-400 mt-1">{{ selectedProvider?.description }}</p>
                </div>
              </div>
              
              <button
                @click="closeDetailDrawer"
                class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Icon icon="mdi:close" class="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          <!-- Detail Content -->
          <div class="p-6 space-y-6">
            <!-- Base URL -->
            <div class="bg-glass-white/5 rounded-lg p-4">
              <div class="flex items-center space-x-2 mb-2">
                <Icon icon="mdi:web" class="w-5 h-5 text-gray-400" />
                <span class="text-sm text-gray-400">API地址</span>
              </div>
              <p class="text-white font-mono text-sm">{{ selectedProvider?.baseUrl }}</p>
            </div>

            <!-- Models Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">AI模型</h3>
                <CyberButton
                  variant="outline"
                  left-icon="mdi:sync"
                  @click="syncModels"
                  :loading="syncing"
                  size="sm"
                >
                  同步模型
                </CyberButton>
              </div>

              <div v-if="models.length > 0" class="space-y-3">
                <div 
                  v-for="model in models" 
                  :key="model.id"
                  class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
                  :class="{ 'border-cyber-purple': model.isDefault }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-white font-semibold">{{ model.modelName }}</h4>
                        <span 
                          v-if="model.isDefault"
                          class="px-2 py-0.5 text-xs bg-cyber-purple/20 text-cyber-purple rounded"
                        >
                          默认
                        </span>
                        <span 
                          class="px-2 py-0.5 text-xs rounded"
                          :class="model.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'"
                        >
                          {{ model.isActive ? '已启用' : '已停用' }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-400 mb-2">{{ model.modelCode }}</p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span v-if="model.maxInputTokens">输入: {{ model.maxInputTokens }} tokens</span>
                        <span v-if="model.maxOutputTokens">输出: {{ model.maxOutputTokens }} tokens</span>
                        <span v-if="model.supportsStreaming">流式输出</span>
                        <span v-if="model.supportsFunctionCall">函数调用</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 ml-4">
                      <button
                        v-if="!model.isDefault"
                        @click="setDefaultModel(model.id)"
                        class="px-3 py-1 text-xs bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple rounded transition-colors"
                      >
                        设为默认
                      </button>
                      <button
                        @click="toggleModelActive(model.id, model.isActive)"
                        class="px-3 py-1 text-xs rounded transition-colors"
                        :class="model.isActive ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'"
                      >
                        {{ model.isActive ? '停用' : '启用' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <Icon icon="mdi:package-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无模型，请点击"同步模型"按钮</p>
              </div>
            </div>

            <!-- API Keys Section -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">API密钥</h3>
                <CyberButton
                  left-icon="mdi:plus"
                  @click="openAddKeyDialog"
                  size="sm"
                >
                  添加密钥
                </CyberButton>
              </div>

              <div v-if="apiKeys.length > 0" class="space-y-3">
                <div 
                  v-for="key in apiKeys" 
                  :key="key.id"
                  class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h4 class="text-white font-semibold">{{ key.keyName }}</h4>
                        <span 
                          class="px-2 py-0.5 text-xs rounded"
                          :class="{
                            'bg-green-500/20 text-green-400': key.status === 'normal',
                            'bg-yellow-500/20 text-yellow-400': key.status === 'rate_limited',
                            'bg-red-500/20 text-red-400': key.status === 'error',
                            'bg-gray-500/20 text-gray-400': key.status === 'exhausted'
                          }"
                        >
                          {{ getKeyStatusText(key.status) }}
                        </span>
                        <span 
                          v-if="!key.isActive"
                          class="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded"
                        >
                          已停用
                        </span>
                      </div>
                      <p class="text-sm text-gray-400 font-mono mb-3">{{ key.apiKey }}</p>
                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <p class="text-xs text-gray-500">今日请求</p>
                          <p class="text-sm text-white mt-1">{{ key.requestsCountToday }} / {{ key.rateLimitRpd }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500">今日Token</p>
                          <p class="text-sm text-white mt-1">{{ key.tokensCountToday }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-500">优先级</p>
                          <p class="text-sm text-white mt-1">{{ key.priority }}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2 ml-4">
                      <button
                        @click="validateKey(key.id)"
                        class="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                        title="验证密钥"
                      >
                        验证
                      </button>
                      <button
                        @click="openEditKeyDialog(key)"
                        class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        @click="deleteKey(key.id, key.keyName)"
                        class="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center py-8 text-gray-500">
                <Icon icon="mdi:key-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无API密钥，请点击"添加密钥"按钮</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add/Edit API Key Dialog -->
    <Teleport to="body">
      <div 
        v-if="showKeyDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeKeyDialog"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl">
          <h3 class="text-xl font-bold text-white mb-4">
            {{ editingKey ? '编辑API密钥' : '添加API密钥' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">密钥名称</label>
              <input
                v-model="keyForm.keyName"
                type="text"
                class="cyber-input"
                placeholder="例如: 主密钥、备用密钥"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">API密钥</label>
              <input
                v-model="keyForm.apiKey"
                type="password"
                class="cyber-input"
                placeholder="输入API密钥"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Base URL (可选)</label>
              <input
                v-model="keyForm.baseUrl"
                type="text"
                class="cyber-input"
                placeholder="留空使用供应商默认URL"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">优先级 (0-100)</label>
                <input
                  v-model.number="keyForm.priority"
                  type="number"
                  min="0"
                  max="100"
                  class="cyber-input"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">每日请求限制</label>
                <input
                  v-model.number="keyForm.rateLimitRpd"
                  type="number"
                  min="1"
                  class="cyber-input"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <input
                v-model="keyForm.isActive"
                type="checkbox"
                id="keyActive"
                class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              />
              <label for="keyActive" class="text-sm text-gray-300">启用此密钥</label>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button
              @click="closeKeyDialog"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <CyberButton
              @click="saveKey"
              :loading="saving"
            >
              {{ editingKey ? '保存' : '添加' }}
            </CyberButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import { aiProviderAPI, aiModelAPI, aiApiKeyAPI } from '@/api'

// State
const loading = ref(false)
const syncing = ref(false)
const saving = ref(false)

// Data
const providers = ref<any[]>([])
const selectedProvider = ref<any>(null)
const models = ref<any[]>([])
const apiKeys = ref<any[]>([])

// Drawer & Dialogs
const showDetailDrawer = ref(false)
const showKeyDialog = ref(false)
const editingKey = ref<any>(null)
const keyForm = ref({
  keyName: '',
  apiKey: '',
  baseUrl: '',
  priority: 50,
  rateLimitRpd: 10000,
  isActive: true
})

// Methods
const loadAllData = async () => {
  loading.value = true
  try {
    await loadProviders()
  } catch (error) {
    console.error('Failed to load data:', error)
    alert('加载数据失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadProviders = async () => {
  try {
    const response = await aiProviderAPI.getProviders()
    if (response.code === 200) {
      providers.value = response.data
    }
  } catch (error) {
    console.error('Failed to load providers:', error)
    throw error
  }
}

const openProviderDetail = async (provider: any) => {
  selectedProvider.value = provider
  showDetailDrawer.value = true
  models.value = []
  apiKeys.value = []
  
  await Promise.all([
    loadModels(provider.id),
    loadApiKeys(provider.id)
  ])
}

const closeDetailDrawer = () => {
  showDetailDrawer.value = false
  selectedProvider.value = null
  models.value = []
  apiKeys.value = []
}

const toggleProviderActive = async (provider: any) => {
  try {
    // 如果要启用，先禁用其他所有provider
    if (!provider.isActive) {
      for (const p of providers.value) {
        if (p.id !== provider.id && p.isActive) {
          await aiProviderAPI.updateProvider(p.id, { isActive: false })
        }
      }
    }
    
    // 切换当前provider状态
    const response = await aiProviderAPI.updateProvider(provider.id, { 
      isActive: !provider.isActive 
    })
    
    if (response.code === 200) {
      alert(`${provider.providerName} 已${provider.isActive ? '停用' : '启用'}`)
      await loadProviders()
    }
  } catch (error: any) {
    console.error('Failed to toggle provider:', error)
    alert(`操作失败: ${error.message || '未知错误'}`)
  }
}

const loadModels = async (providerId: number) => {
  try {
    const response = await aiModelAPI.getModels({ providerId, isActive: undefined })
    if (response.code === 200) {
      models.value = response.data
    }
  } catch (error) {
    console.error('Failed to load models:', error)
  }
}

const loadApiKeys = async (providerId: number) => {
  try {
    const response = await aiApiKeyAPI.getKeys(providerId)
    if (response.code === 200) {
      apiKeys.value = response.data
    }
  } catch (error) {
    console.error('Failed to load API keys:', error)
  }
}

const syncModels = async () => {
  if (!selectedProvider.value) return
  
  syncing.value = true
  try {
    const response = await aiProviderAPI.syncModels(selectedProvider.value.id)
    if (response.code === 200) {
      alert(`成功同步 ${response.data.count} 个模型`)
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to sync models:', error)
    alert(`同步模型失败: ${error.message || '未知错误'}`)
  } finally {
    syncing.value = false
  }
}

const setDefaultModel = async (modelId: number) => {
  try {
    const response = await aiModelAPI.setDefault(modelId)
    if (response.code === 200) {
      alert('默认模型设置成功')
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to set default model:', error)
    alert(`设置失败: ${error.message || '未知错误'}`)
  }
}

const toggleModelActive = async (modelId: number, currentState: boolean) => {
  try {
    const response = await aiModelAPI.toggleActive(modelId)
    if (response.code === 200) {
      alert(`模型已${currentState ? '停用' : '启用'}`)
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to toggle model:', error)
    alert(`操作失败: ${error.message || '未知错误'}`)
  }
}

const openAddKeyDialog = () => {
  editingKey.value = null
  keyForm.value = {
    keyName: '',
    apiKey: '',
    baseUrl: '',
    priority: 50,
    rateLimitRpd: 10000,
    isActive: true
  }
  showKeyDialog.value = true
}

const openEditKeyDialog = (key: any) => {
  editingKey.value = key
  keyForm.value = {
    keyName: key.keyName,
    apiKey: '', // 不回显密钥
    baseUrl: key.baseUrl || '',
    priority: key.priority,
    rateLimitRpd: key.rateLimitRpd,
    isActive: key.isActive
  }
  showKeyDialog.value = true
}

const closeKeyDialog = () => {
  showKeyDialog.value = false
  editingKey.value = null
}

const saveKey = async () => {
  if (!selectedProvider.value) return
  
  // 验证必填字段
  if (!keyForm.value.keyName || (!editingKey.value && !keyForm.value.apiKey)) {
    alert('请填写必填字段')
    return
  }
  
  saving.value = true
  try {
    if (editingKey.value) {
      // 更新密钥
      const updateData: any = {
        keyName: keyForm.value.keyName,
        baseUrl: keyForm.value.baseUrl || null,
        priority: keyForm.value.priority,
        rateLimitRpd: keyForm.value.rateLimitRpd,
        isActive: keyForm.value.isActive
      }
      
      // 只在有新密钥时才更新
      if (keyForm.value.apiKey) {
        updateData.apiKey = keyForm.value.apiKey
      }
      
      const response = await aiApiKeyAPI.updateKey(editingKey.value.id, updateData)
      if (response.code === 200) {
        alert('密钥更新成功')
        closeKeyDialog()
        await loadApiKeys(selectedProvider.value.id)
      }
    } else {
      // 创建新密钥
      const response = await aiApiKeyAPI.createKey(selectedProvider.value.id, {
        keyName: keyForm.value.keyName,
        apiKey: keyForm.value.apiKey,
        baseUrl: keyForm.value.baseUrl || undefined,
        priority: keyForm.value.priority,
        rateLimitRpd: keyForm.value.rateLimitRpd,
        isActive: keyForm.value.isActive
      })
      
      if (response.code === 201 || response.code === 200) {
        alert('密钥添加成功')
        closeKeyDialog()
        await loadApiKeys(selectedProvider.value.id)
      }
    }
  } catch (error: any) {
    console.error('Failed to save key:', error)
    alert(`保存失败: ${error.message || '未知错误'}`)
  } finally {
    saving.value = false
  }
}

const deleteKey = async (keyId: number, keyName: string) => {
  if (!confirm(`确定要删除密钥 "${keyName}" 吗？`)) return
  
  try {
    const response = await aiApiKeyAPI.deleteKey(keyId)
    if (response.code === 200) {
      alert('密钥删除成功')
      await loadApiKeys(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to delete key:', error)
    alert(`删除失败: ${error.message || '未知错误'}`)
  }
}

const validateKey = async (keyId: number) => {
  try {
    const response = await aiApiKeyAPI.validateKey(keyId)
    if (response.code === 200) {
      alert(response.data.isValid ? '密钥验证通过' : '密钥无效')
    }
  } catch (error: any) {
    console.error('Failed to validate key:', error)
    alert(`验证失败: ${error.message || '未知错误'}`)
  }
}

const getKeyStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'normal': '正常',
    'rate_limited': '限流中',
    'error': '错误',
    'exhausted': '已耗尽'
  }
  return statusMap[status] || status
}

const getProviderIcon = (providerCode: string): string => {
  const iconMap: Record<string, string> = {
    'openai': 'simple-icons:openai',
    'anthropic': 'simple-icons:anthropic',
    'claude': 'simple-icons:anthropic',
    'deepseek': 'mdi:brain',
    'gemini': 'simple-icons:google'
  }
  return iconMap[providerCode] || 'mdi:robot'
}

// Lifecycle
onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>
