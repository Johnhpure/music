<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">AI配置</h1>
        <p class="text-gray-400 mt-1">管理AI模型和音乐生成参数设置</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="loadConfig"
          :loading="loading"
        >
          刷新配置
        </CyberButton>
        
        <CyberButton
          left-icon="mdi:content-save"
          @click="saveConfig"
          :loading="saving"
        >
          保存配置
        </CyberButton>
      </div>
    </div>

    <!-- Status Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="AI模型状态"
        :value="aiStatus.model"
        :change="aiStatus.modelVersion"
        trend="up"
        icon="mdi:brain"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="今日生成"
        :value="stats.todayGenerated.toLocaleString()"
        change="+25"
        trend="up"
        icon="mdi:music-note"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="队列长度"
        :value="stats.queueLength"
        change="-5"
        trend="down"
        icon="mdi:format-list-numbered"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="系统负载"
        :value="`${stats.systemLoad}%`"
        change="+3%"
        trend="up"
        icon="mdi:speedometer"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- AI Model Configuration -->
    <CyberCard title="AI模型配置" :delay="400">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              主模型选择
            </label>
            <select 
              v-model="config.primaryModel"
              class="cyber-input"
              @change="onConfigChange"
            >
              <option value="">选择AI模型...</option>
              <option v-for="model in availableModels" :key="model.id" :value="model.id">
                {{ model.name }} ({{ model.version }})
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">选择用于音乐生成的主要AI模型</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              备用模型
            </label>
            <select 
              v-model="config.backupModel"
              class="cyber-input"
              @change="onConfigChange"
            >
              <option value="">选择备用模型...</option>
              <option v-for="model in availableModels" :key="model.id" :value="model.id">
                {{ model.name }} ({{ model.version }})
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">主模型不可用时的备用模型</p>
          </div>
        </div>
        
        <div class="border-t border-gray-700/30 pt-6">
          <h4 class="text-lg font-semibold text-white mb-4">模型参数设置</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                创意度 (Temperature): {{ config.temperature }}
              </label>
              <input
                v-model.number="config.temperature"
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                @input="onConfigChange"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守(0.1)</span>
                <span>创新(2.0)</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                采样多样性 (Top-p): {{ config.topP }}
              </label>
              <input
                v-model.number="config.topP"
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                @input="onConfigChange"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>集中(0.1)</span>
                <span>多样(1.0)</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                最大长度 (秒): {{ config.maxLength }}
              </label>
              <input
                v-model.number="config.maxLength"
                type="range"
                min="30"
                max="300"
                step="30"
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                @input="onConfigChange"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>30秒</span>
                <span>300秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- Generation Settings -->
    <CyberCard title="生成设置" :delay="500">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              并发生成数量
            </label>
            <CyberInput
              v-model.number="config.concurrentGenerations"
              type="number"
              min="1"
              max="10"
              placeholder="输入并发数量..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">同时处理的音乐生成任务数量</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              队列超时时间 (分钟)
            </label>
            <CyberInput
              v-model.number="config.queueTimeout"
              type="number"
              min="5"
              max="60"
              placeholder="输入超时时间..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">任务在队列中的最大等待时间</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              重试次数
            </label>
            <CyberInput
              v-model.number="config.maxRetries"
              type="number"
              min="0"
              max="5"
              placeholder="输入重试次数..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">生成失败时的最大重试次数</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              音质设置
            </label>
            <select 
              v-model="config.audioQuality"
              class="cyber-input"
              @change="onConfigChange"
            >
              <option value="standard">标准质量 (128kbps)</option>
              <option value="high">高质量 (256kbps)</option>
              <option value="lossless">无损质量 (FLAC)</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">生成音乐的音频质量</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <h4 class="text-lg font-semibold text-white">高级选项</h4>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableCache"
              type="checkbox"
              id="enableCache"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="enableCache" class="text-sm text-gray-300">启用结果缓存</label>
            <p class="text-xs text-gray-500">缓存相似的生成请求以提高效率</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableGPUAcceleration"
              type="checkbox"
              id="enableGPU"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="enableGPU" class="text-sm text-gray-300">启用GPU加速</label>
            <p class="text-xs text-gray-500">使用GPU加速音乐生成过程</p>
          </div>
          
          <div class="flex items-center space-x-3">
            <input
              v-model="config.enableAutoScaling"
              type="checkbox"
              id="enableAutoScaling"
              class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
              @change="onConfigChange"
            />
            <label for="enableAutoScaling" class="text-sm text-gray-300">启用自动扩容</label>
            <p class="text-xs text-gray-500">根据负载自动调整计算资源</p>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- API Keys and Endpoints -->
    <CyberCard title="API配置" :delay="600">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              API端点
            </label>
            <CyberInput
              v-model="config.apiEndpoint"
              placeholder="输入API端点URL..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">AI服务的API端点地址</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              API密钥
            </label>
            <CyberInput
              v-model="config.apiKey"
              type="password"
              placeholder="输入API密钥..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">访问AI服务的认证密钥</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              请求超时 (秒)
            </label>
            <CyberInput
              v-model.number="config.requestTimeout"
              type="number"
              min="30"
              max="300"
              placeholder="输入超时时间..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">API请求的最大等待时间</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              速率限制 (请求/分钟)
            </label>
            <CyberInput
              v-model.number="config.rateLimit"
              type="number"
              min="10"
              max="1000"
              placeholder="输入速率限制..."
              @input="onConfigChange"
            />
            <p class="text-xs text-gray-500 mt-1">每分钟最大API请求数</p>
          </div>
        </div>
      </div>
    </CyberCard>

    <!-- System Monitoring -->
    <CyberCard title="系统监控" :delay="700">
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-glass-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">CPU使用率</span>
              <span class="text-lg font-bold text-cyber-blue">{{ monitoring.cpuUsage }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div 
                class="bg-cyber-blue h-2 rounded-full transition-all duration-500"
                :style="{ width: `${monitoring.cpuUsage}%` }"
              ></div>
            </div>
          </div>
          
          <div class="bg-glass-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">内存使用率</span>
              <span class="text-lg font-bold text-cyber-purple">{{ monitoring.memoryUsage }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div 
                class="bg-cyber-purple h-2 rounded-full transition-all duration-500"
                :style="{ width: `${monitoring.memoryUsage}%` }"
              ></div>
            </div>
          </div>
          
          <div class="bg-glass-white/5 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">GPU使用率</span>
              <span class="text-lg font-bold text-green-400">{{ monitoring.gpuUsage }}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
              <div 
                class="bg-green-400 h-2 rounded-full transition-all duration-500"
                :style="{ width: `${monitoring.gpuUsage}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 class="font-semibold text-white mb-3">最近生成记录</h5>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div 
                v-for="log in recentLogs" 
                :key="log.id"
                class="flex items-center justify-between p-2 bg-glass-white/5 rounded text-sm"
              >
                <div class="flex items-center space-x-2">
                  <Icon 
                    :icon="log.status === 'success' ? 'mdi:check-circle' : log.status === 'error' ? 'mdi:alert-circle' : 'mdi:clock'"
                    :class="{
                      'text-green-400': log.status === 'success',
                      'text-red-400': log.status === 'error',
                      'text-yellow-400': log.status === 'pending'
                    }"
                    class="w-4 h-4"
                  />
                  <span class="text-gray-300">{{ log.prompt.substring(0, 30) }}...</span>
                </div>
                <span class="text-gray-500 text-xs">{{ formatTime(log.timestamp) }}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 class="font-semibold text-white mb-3">系统健康状态</h5>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-300">AI模型状态</span>
                <span class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-green-400 text-sm">正常</span>
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-300">数据库连接</span>
                <span class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-green-400 text-sm">正常</span>
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-300">存储空间</span>
                <span class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span class="text-yellow-400 text-sm">75% 已使用</span>
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-300">API响应时间</span>
                <span class="text-gray-300 text-sm">{{ monitoring.apiResponseTime }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CyberCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'

// State
const loading = ref(false)
const saving = ref(false)
const hasChanges = ref(false)

// Configuration
const config = ref({
  primaryModel: 'musicgen-v2',
  backupModel: 'musicgen-v1',
  temperature: 0.8,
  topP: 0.9,
  maxLength: 180,
  concurrentGenerations: 3,
  queueTimeout: 30,
  maxRetries: 2,
  audioQuality: 'high',
  enableCache: true,
  enableGPUAcceleration: true,
  enableAutoScaling: false,
  apiEndpoint: 'https://api.musicgen.ai/v1',
  apiKey: '••••••••••••••••',
  requestTimeout: 120,
  rateLimit: 100
})

// Available models
const availableModels = ref([
  { id: 'musicgen-v2', name: 'MusicGen V2', version: '2.3.0' },
  { id: 'musicgen-v1', name: 'MusicGen V1', version: '1.5.2' },
  { id: 'jukebox-pro', name: 'Jukebox Pro', version: '3.1.0' },
  { id: 'wavenet-music', name: 'WaveNet Music', version: '2.0.1' }
])

// Status and statistics
const aiStatus = ref({
  model: 'MusicGen V2',
  modelVersion: 'v2.3.0'
})

const stats = ref({
  todayGenerated: 1247,
  queueLength: '23',
  systemLoad: 72
})

const monitoring = ref({
  cpuUsage: 68,
  memoryUsage: 82,
  gpuUsage: 45,
  apiResponseTime: 850
})

const recentLogs = ref([
  { id: 1, prompt: '生成一首充满活力的电子音乐', status: 'success', timestamp: Date.now() - 120000 },
  { id: 2, prompt: '创作一段舒缓的钢琴旋律', status: 'success', timestamp: Date.now() - 340000 },
  { id: 3, prompt: '制作一首摇滚风格的背景音乐', status: 'error', timestamp: Date.now() - 520000 },
  { id: 4, prompt: '生成一段中国风古典音乐', status: 'success', timestamp: Date.now() - 680000 },
  { id: 5, prompt: '创作一首适合冥想的环境音乐', status: 'pending', timestamp: Date.now() - 780000 }
])

// Methods
const loadConfig = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Config loaded')
  } catch (error) {
    console.error('Failed to load config:', error)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    hasChanges.value = false
    console.log('Config saved:', config.value)
    // TODO: Show success notification
  } catch (error) {
    console.error('Failed to save config:', error)
    // TODO: Show error notification
  } finally {
    saving.value = false
  }
}

const onConfigChange = () => {
  hasChanges.value = true
}

const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚才'
}

// Lifecycle
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}

.slider {
  background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 var(--value, 50%), #374151 var(--value, 50%), #374151 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: 2px solid #1f2937;
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}
</style>