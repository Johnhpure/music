<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="$emit('update:visible', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="visible && prompt"
            class="relative w-full max-w-4xl bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-600 flex items-center justify-center">
                  <span class="text-lg">{{ prompt.icon || '🎵' }}</span>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white">提示词预览</h3>
                  <p class="text-sm text-gray-400">{{ prompt.title }}</p>
                </div>
              </div>
              
              <button
                @click="$emit('update:visible', false)"
                class="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                <Icon icon="mdi:close" class="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <!-- Preview Content -->
            <div class="p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Left: Mobile Preview -->
                <div class="space-y-6">
                  <div class="text-center">
                    <h4 class="text-lg font-semibold text-white mb-4">小程序预览</h4>
                    
                    <!-- Mobile Frame -->
                    <div class="mx-auto w-80 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                      <!-- Status Bar -->
                      <div class="bg-black px-4 py-2 flex items-center justify-between text-white text-xs">
                        <div>9:41</div>
                        <div class="flex items-center space-x-1">
                          <Icon icon="mdi:signal" class="w-3 h-3" />
                          <Icon icon="mdi:wifi" class="w-3 h-3" />
                          <Icon icon="mdi:battery" class="w-3 h-3" />
                        </div>
                      </div>
                      
                      <!-- App Header -->
                      <div class="bg-cyber-dark px-4 py-3 border-b border-gray-700/30">
                        <h4 class="text-white font-medium text-center">创作提示词</h4>
                      </div>
                      
                      <!-- Prompt Card Preview -->
                      <div class="p-4 bg-cyber-dark">
                        <div class="bg-glass-white/10 rounded-lg p-4 border border-gray-700/30">
                          <!-- Header -->
                          <div class="flex items-center space-x-3 mb-3">
                            <div 
                              class="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                              :class="getIconBgClass()"
                            >
                              {{ prompt.icon || '🎵' }}
                            </div>
                            <div class="flex-1">
                              <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                                {{ prompt.category }}
                              </span>
                            </div>
                          </div>
                          
                          <!-- Title -->
                          <h3 class="text-white font-semibold mb-2">{{ prompt.title }}</h3>
                          
                          <!-- Content -->
                          <p class="text-gray-300 text-sm leading-relaxed mb-3">
                            {{ prompt.content }}
                          </p>
                          
                          <!-- Tags -->
                          <div v-if="prompt.tags && prompt.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
                            <span
                              v-for="tag in prompt.tags.slice(0, 3)"
                              :key="tag"
                              class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-300"
                            >
                              {{ tag }}
                            </span>
                            <span
                              v-if="prompt.tags.length > 3"
                              class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400"
                            >
                              +{{ prompt.tags.length - 3 }}
                            </span>
                          </div>
                          
                          <!-- Action Button -->
                          <button class="w-full py-2 bg-gradient-to-r from-cyber-purple to-purple-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                            使用此提示词
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Right: Details -->
                <div class="space-y-6">
                  <h4 class="text-lg font-semibold text-white">详细信息</h4>
                  
                  <!-- Basic Info -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:information" class="w-4 h-4 mr-2 text-cyber-purple" />
                      基本信息
                    </h5>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">标题:</span>
                        <span class="text-white">{{ prompt.title }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">分类:</span>
                        <span class="text-white">{{ prompt.category }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">状态:</span>
                        <span :class="prompt.isActive ? 'text-green-400' : 'text-gray-400'">
                          {{ prompt.isActive ? '启用' : '禁用' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">排序:</span>
                        <span class="text-white">{{ prompt.sortOrder }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">使用次数:</span>
                        <span class="text-white">{{ prompt.usageCount?.toLocaleString() || 0 }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Content Analysis -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:text-box" class="w-4 h-4 mr-2 text-cyber-purple" />
                      内容分析
                    </h5>
                    
                    <div class="space-y-3">
                      <!-- Content Preview -->
                      <div>
                        <label class="text-xs text-gray-500 mb-1 block">完整内容</label>
                        <div class="p-3 bg-gray-800/50 rounded border text-sm text-gray-300 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                          {{ prompt.content }}
                        </div>
                      </div>
                      
                      <!-- Stats -->
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-gray-400">字符数:</span>
                          <span class="text-white ml-2">{{ prompt.content.length }}</span>
                        </div>
                        <div>
                          <span class="text-gray-400">标签数:</span>
                          <span class="text-white ml-2">{{ prompt.tags?.length || 0 }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tags -->
                  <div v-if="prompt.tags && prompt.tags.length > 0" class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:tag-multiple" class="w-4 h-4 mr-2 text-cyber-purple" />
                      标签
                    </h5>
                    
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="tag in prompt.tags"
                        :key="tag"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Time Info -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:clock" class="w-4 h-4 mr-2 text-cyber-purple" />
                      时间信息
                    </h5>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">创建时间:</span>
                        <span class="text-white">{{ formatDateTime(prompt.createdAt) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">更新时间:</span>
                        <span class="text-white">{{ formatDateTime(prompt.updatedAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-between p-6 border-t border-gray-700/30 bg-cyber-darker/50">
              <div class="text-sm text-gray-400">
                预览效果仅供参考，实际效果以小程序为准
              </div>
              
              <div class="flex items-center space-x-3">
                <CyberButton
                  variant="outline"
                  size="sm"
                  left-icon="mdi:refresh"
                  @click="refreshPreview"
                >
                  刷新
                </CyberButton>
                
                <CyberButton
                  size="sm"
                  left-icon="mdi:pencil"
                  @click="handleEdit"
                >
                  编辑
                </CyberButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import type { PromptTemplate } from '@/types'

interface Props {
  visible: boolean
  prompt?: PromptTemplate | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  edit: [prompt: PromptTemplate]
}>()

const getIconBgClass = () => {
  if (!props.prompt) return 'bg-gradient-to-br from-gray-500 to-gray-600'
  
  const colorMap: Record<string, string> = {
    '流行音乐': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'R&B': 'bg-gradient-to-br from-pink-500 to-pink-600',
    '电子音乐': 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    '摇滚': 'bg-gradient-to-br from-red-500 to-red-600',
    '民谣': 'bg-gradient-to-br from-green-500 to-green-600',
    '古典': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    '爵士': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    '嘻哈': 'bg-gradient-to-br from-orange-500 to-orange-600',
    '乡村': 'bg-gradient-to-br from-amber-500 to-amber-600',
    '蓝调': 'bg-gradient-to-br from-blue-500 to-blue-600'
  }
  
  return colorMap[props.prompt.category] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshPreview = () => {
  console.log('Refresh preview for prompt:', props.prompt?.id)
}

const handleEdit = () => {
  if (props.prompt) {
    emit('edit', props.prompt)
    emit('update:visible', false)
  }
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 2px;
}
</style>