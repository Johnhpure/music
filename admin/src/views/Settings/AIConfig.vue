<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">AI配置管理</h1>
        <p class="text-gray-400 mt-1">统一管理AI供应商、模型和API密钥配置</p>
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

    <!-- Provider Selection -->
    <CyberCard title="AI供应商选择" :delay="0">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="provider in providers" 
            :key="provider.id"
            @click="selectProvider(provider)"
            class="relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300"
            :class="{
              'border-cyber-purple bg-cyber-purple/10': selectedProvider?.id === provider.id,
              'border-gray-700 bg-glass-white/5 hover:border-gray-600': selectedProvider?.id !== provider.id,
              'opacity-50': !provider.isActive
            }"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold text-white">{{ provider.providerName }}</h3>
              <div 
                class="w-2 h-2 rounded-full"
                :class="provider.isActive ? 'bg-green-400' : 'bg-gray-500'"
              ></div>
            </div>
            <p class="text-sm text-gray-400 mb-2">{{ provider.providerCode }}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ provider.modelsCount || 0 }} 个模型</span>
              <span>{{ provider.activeKeysCount || 0 }} 个密钥</span>
            </div>
          </div>
        </div>

        <div v-if="selectedProvider" class="pt-4 border-t border-gray-700/30">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-white font-semibold">{{ selectedProvider.providerName }}</h4>
              <p class="text-sm text-gray-400 mt-1">{{ selectedProvider.description || '暂无描述' }}</p>
              <p class="text-xs text-gray-500 mt-1">Base URL: {{ selectedProvider.baseUrl }}</p>
            </div>
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
        </div>
      </div>
    </CyberCard>

    <!-- Models Management -->
    <CyberCard v-if="selectedProvider" title="AI模型管理" :delay="100">
      <div class="space-y-4">
        <!-- Models List -->
        <div v-if="models.length > 0" class="space-y-3">
          <div 
            v-for="model in models" 
            :key="model.id"
            class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
            :class="{ 'border-cyber-purple': model.isDefault }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
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
                <p class="text-sm text-gray-400 mt-1">{{ model.modelCode }}</p>
                <div class="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                  <span v-if="model.maxInputTokens">输入: {{ model.maxInputTokens }} tokens</span>
                  <span v-if="model.maxOutputTokens">输出: {{ model.maxOutputTokens }} tokens</span>
                  <span v-if="model.supportsStreaming">流式输出</span>
                  <span v-if="model.supportsFunctionCall">函数调用</span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
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
                <button
                  @click="openModelConfig(model)"
                  class="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  配置参数
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <Icon icon="mdi:package-variant" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无模型，请点击"同步模型"按钮从供应商获取</p>
        </div>
      </div>
    </CyberCard>

    <!-- API Keys Management -->
    <CyberCard v-if="selectedProvider" title="API密钥管理" :delay="200">
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-400">管理当前供应商的API密钥和配额</p>
          <CyberButton
            left-icon="mdi:plus"
            @click="openAddKeyDialog"
            size="sm"
          >
            添加密钥
          </CyberButton>
        </div>

        <!-- API Keys List -->
        <div v-if="apiKeys.length > 0" class="space-y-3">
          <div 
            v-for="key in apiKeys" 
            :key="key.id"
            class="p-4 rounded-lg border border-gray-700/30 bg-glass-white/5"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3">
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
                <p class="text-sm text-gray-400 mt-1 font-mono">{{ key.apiKey }}</p>
                <div class="grid grid-cols-3 gap-4 mt-3">
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
    </CyberCard>

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

    <!-- Model Config Dialog -->
    <Teleport to="body">
      <div 
        v-if="showModelConfigDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        @click.self="closeModelConfigDialog"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl">
          <h3 class="text-xl font-bold text-white mb-4">
            配置模型参数 - {{ editingModel?.modelName }}
          </h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Temperature (创意度): {{ modelConfigForm.temperature }}
              </label>
              <input
                v-model.number="modelConfigForm.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守(0)</span>
                <span>创新(2)</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Top P (采样多样性): {{ modelConfigForm.topP }}
              </label>
              <input
                v-model.number="modelConfigForm.topP"
                type="range"
                min="0"
                max="1"
                step="0.05"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>集中(0)</span>
                <span>多样(1)</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Max Tokens (最大输出长度)
              </label>
              <input
                v-model.number="modelConfigForm.maxTokens"
                type="number"
                min="1"
                max="32000"
                class="cyber-input"
              />
            </div>
            
            <div class="flex items-center space-x-2">
              <input
                v-model="modelConfigForm.stream"
                type="checkbox"
                id="streamEnabled"
                class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              />
              <label for="streamEnabled" class="text-sm text-gray-300">启用流式输出</label>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button
              @click="closeModelConfigDialog"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <CyberButton
              @click="saveModelConfig"
              :loading="saving"
            >
              保存配置
            </CyberButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
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

// Dialogs
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

const showModelConfigDialog = ref(false)
const editingModel = ref<any>(null)
const modelConfigForm = ref({
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2000,
  stream: true
})

// Methods
const loadAllData = async () => {
  loading.value = true
  try {
    await loadProviders()
    if (selectedProvider.value) {
      await Promise.all([
        loadModels(selectedProvider.value.id),
        loadApiKeys(selectedProvider.value.id)
      ])
    }
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
      // 自动选择第一个启用的Provider
      if (!selectedProvider.value && providers.value.length > 0) {
        const firstActive = providers.value.find(p => p.isActive) || providers.value[0]
        await selectProvider(firstActive)
      }
    }
  } catch (error) {
    console.error('Failed to load providers:', error)
    throw error
  }
}

const selectProvider = async (provider: any) => {
  selectedProvider.value = provider
  models.value = []
  apiKeys.value = []
  
  if (provider) {
    await Promise.all([
      loadModels(provider.id),
      loadApiKeys(provider.id)
    ])
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

const openModelConfig = (model: any) => {
  editingModel.value = model
  
  // 从model的configJson加载配置
  const config = model.configJson || {}
  modelConfigForm.value = {
    temperature: config.temperature || 0.7,
    topP: config.topP || 0.9,
    maxTokens: config.maxTokens || 2000,
    stream: config.stream !== false
  }
  
  showModelConfigDialog.value = true
}

const closeModelConfigDialog = () => {
  showModelConfigDialog.value = false
  editingModel.value = null
}

const saveModelConfig = async () => {
  if (!editingModel.value) return
  
  saving.value = true
  try {
    const response = await aiModelAPI.updateModel(editingModel.value.id, {
      configJson: modelConfigForm.value
    })
    
    if (response.code === 200) {
      alert('模型配置保存成功')
      closeModelConfigDialog()
      await loadModels(selectedProvider.value.id)
    }
  } catch (error: any) {
    console.error('Failed to save model config:', error)
    alert(`保存失败: ${error.message || '未知错误'}`)
  } finally {
    saving.value = false
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
