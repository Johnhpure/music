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
            v-if="visible && recommendation"
            class="relative w-full max-w-5xl bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Icon icon="mdi:music-note" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white">推荐预览</h3>
                  <p class="text-sm text-gray-400">{{ recommendation.title }} - {{ recommendation.artist }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Hot Badge -->
                <div 
                  v-if="recommendation.isHot"
                  class="flex items-center space-x-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30"
                >
                  <Icon icon="mdi:fire" class="w-3 h-3" />
                  <span>热门</span>
                </div>
                
                <button
                  @click="$emit('update:visible', false)"
                  class="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <Icon icon="mdi:close" class="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            <!-- Content -->
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
                        <h4 class="text-white font-medium text-center">热门推荐</h4>
                      </div>
                      
                      <!-- Recommendation Item Preview -->
                      <div class="p-4 bg-cyber-dark">
                        <div class="bg-glass-white/10 rounded-lg p-4 border border-gray-700/30 relative">
                          <!-- Hot Badge -->
                          <div 
                            v-if="recommendation.isHot"
                            class="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center"
                          >
                            <Icon icon="mdi:fire" class="w-3 h-3 text-white" />
                          </div>
                          
                          <!-- Main Content -->
                          <div class="flex items-center space-x-3">
                            <!-- Cover -->
                            <div class="relative flex-shrink-0">
                              <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                                <img
                                  :src="recommendation.coverUrl"
                                  :alt="recommendation.title"
                                  class="w-full h-full object-cover"
                                  @error="handleImageError"
                                />
                              </div>
                              
                              <!-- Play Button -->
                              <button 
                                @click="togglePreviewPlay"
                                class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
                              >
                                <Icon 
                                  :icon="isPlaying ? 'mdi:pause' : 'mdi:play'" 
                                  class="w-6 h-6 text-white" 
                                />
                              </button>
                            </div>
                            
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                              <h5 class="font-semibold text-white truncate mb-1">{{ recommendation.title }}</h5>
                              <p class="text-sm text-gray-400 truncate mb-2">{{ recommendation.artist }}</p>
                              
                              <!-- Tags -->
                              <div class="flex items-center space-x-2 text-xs">
                                <span class="px-2 py-1 bg-gray-700/50 text-gray-300 rounded">{{ recommendation.genre }}</span>
                                <span class="text-gray-500">{{ recommendation.duration }}</span>
                                <span class="text-gray-500">{{ formatPlayCount(recommendation.playCount) }} 播放</span>
                              </div>
                            </div>
                            
                            <!-- Action Button -->
                            <button class="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                              <Icon icon="mdi:heart-outline" class="w-4 h-4" />
                            </button>
                          </div>
                          
                          <!-- Additional Tags -->
                          <div v-if="recommendation.tags && recommendation.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
                            <span
                              v-for="tag in recommendation.tags.slice(0, 4)"
                              :key="tag"
                              class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/30 text-gray-400"
                            >
                              {{ tag }}
                            </span>
                            <span
                              v-if="recommendation.tags.length > 4"
                              class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/30 text-gray-500"
                            >
                              +{{ recommendation.tags.length - 4 }}
                            </span>
                          </div>
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
                      <Icon icon="mdi:information" class="w-4 h-4 mr-2 text-red-400" />
                      基本信息
                    </h5>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">歌曲:</span>
                        <span class="text-white">{{ recommendation.title }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">艺术家:</span>
                        <span class="text-white">{{ recommendation.artist }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">风格:</span>
                        <span class="text-white">{{ recommendation.genre }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">时长:</span>
                        <span class="text-white">{{ recommendation.duration }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">状态:</span>
                        <span :class="recommendation.isActive ? 'text-green-400' : 'text-gray-400'">
                          {{ recommendation.isActive ? '启用' : '禁用' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">热门推荐:</span>
                        <span :class="recommendation.isHot ? 'text-red-400' : 'text-gray-400'">
                          {{ recommendation.isHot ? '是' : '否' }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">排序:</span>
                        <span class="text-white">{{ recommendation.sortOrder }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Stats -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:chart-line" class="w-4 h-4 mr-2 text-red-400" />
                      数据统计
                    </h5>
                    
                    <div class="space-y-3">
                      <!-- Play Count -->
                      <div class="flex justify-between items-center">
                        <span class="text-gray-400 text-sm">播放次数</span>
                        <div class="flex items-center space-x-2">
                          <Icon icon="mdi:play-circle" class="w-4 h-4 text-green-400" />
                          <span class="text-white font-semibold">{{ recommendation.playCount.toLocaleString() }}</span>
                        </div>
                      </div>
                      
                      <!-- Play Count Bar -->
                      <div class="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          class="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                          :style="{ width: `${Math.min((recommendation.playCount / 10000) * 100, 100)}%` }"
                        ></div>
                      </div>
                      
                      <!-- Engagement -->
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center p-2 bg-gray-800/50 rounded">
                          <Icon icon="mdi:thumb-up" class="w-4 h-4 text-blue-400 mx-auto mb-1" />
                          <div class="text-white font-semibold">{{ Math.floor(recommendation.playCount * 0.12) }}</div>
                          <div class="text-gray-400 text-xs">点赞</div>
                        </div>
                        <div class="text-center p-2 bg-gray-800/50 rounded">
                          <Icon icon="mdi:heart" class="w-4 h-4 text-red-400 mx-auto mb-1" />
                          <div class="text-white font-semibold">{{ Math.floor(recommendation.playCount * 0.08) }}</div>
                          <div class="text-gray-400 text-xs">收藏</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tags -->
                  <div v-if="recommendation.tags && recommendation.tags.length > 0" class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:tag-multiple" class="w-4 h-4 mr-2 text-red-400" />
                      标签
                    </h5>
                    
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="tag in recommendation.tags"
                        :key="tag"
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Files -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:file-multiple" class="w-4 h-4 mr-2 text-red-400" />
                      文件资源
                    </h5>
                    
                    <div class="space-y-3">
                      <!-- Cover Image -->
                      <div class="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                        <div class="flex items-center space-x-2">
                          <Icon icon="mdi:image" class="w-4 h-4 text-purple-400" />
                          <span class="text-sm text-gray-300">封面图片</span>
                        </div>
                        <a 
                          :href="recommendation.coverUrl" 
                          target="_blank"
                          class="text-xs text-blue-400 hover:text-blue-300"
                        >
                          查看
                        </a>
                      </div>
                      
                      <!-- Audio File -->
                      <div class="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                        <div class="flex items-center space-x-2">
                          <Icon icon="mdi:file-music" class="w-4 h-4 text-green-400" />
                          <span class="text-sm text-gray-300">音频文件</span>
                        </div>
                        <button 
                          @click="togglePreviewPlay"
                          class="text-xs text-green-400 hover:text-green-300"
                        >
                          {{ isPlaying ? '暂停' : '播放' }}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Time Info -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3 flex items-center">
                      <Icon icon="mdi:clock" class="w-4 h-4 mr-2 text-red-400" />
                      时间信息
                    </h5>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-400">创建时间:</span>
                        <span class="text-white">{{ formatDateTime(recommendation.createdAt) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-400">更新时间:</span>
                        <span class="text-white">{{ formatDateTime(recommendation.updatedAt) }}</span>
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
            
            <!-- Audio Element (Hidden) -->
            <audio
              ref="audioPlayer"
              :src="recommendation.audioUrl"
              preload="none"
              @ended="isPlaying = false"
            ></audio>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import type { HotRecommendation } from '@/types'

interface Props {
  visible: boolean
  recommendation?: HotRecommendation | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  edit: [recommendation: HotRecommendation]
}>()

const audioPlayer = ref<HTMLAudioElement>()
const isPlaying = ref(false)

const formatPlayCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 防止无限重试，只设置一次fallback
  if (!img.dataset.fallback) {
    img.dataset.fallback = 'true'
    // 使用base64编码的音乐placeholder SVG，避免网络请求
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIiByeD0iOCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3Mjg0IiBzdHJva2Utd2lkdGg9IjIiLz4KPGJ1dHRvbiBjbGFzcz0idGV4dC1ncmF5LTQwMCI+4paqPC9idXR0b24+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjQiIGZpbGw9IiM2Qjc2ODQiLz4KPHN2Zz4K'
  }
}

const togglePreviewPlay = () => {
  if (!audioPlayer.value) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play().then(() => {
      isPlaying.value = true
    }).catch(error => {
      console.error('Failed to play audio:', error)
    })
  }
}

const refreshPreview = () => {
  console.log('Refresh preview for recommendation:', props.recommendation?.id)
}

const handleEdit = () => {
  if (props.recommendation) {
    emit('edit', props.recommendation)
    emit('update:visible', false)
  }
}
</script>

<style scoped>
/* Progress animation */
.transition-all {
  transition-property: width, opacity, transform;
}
</style>