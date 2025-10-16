<template>
  <div
    class="recommendation-item group relative bg-glass-white/5 border border-gray-700/30 rounded-lg p-5 hover:bg-glass-white/10 hover:border-gray-600/50 transition-all duration-300"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: delay } }"
  >
    <!-- Selection Checkbox -->
    <div class="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <label class="flex items-center cursor-pointer">
        <input
          :checked="selected"
          type="checkbox"
          class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple focus:ring-offset-gray-800"
          @change="$emit('select', recommendation.id, ($event.target as HTMLInputElement).checked)"
        />
      </label>
    </div>
    
    <!-- Main Content -->
    <div class="flex items-center space-x-6">
      <!-- Cover Image -->
      <div class="relative flex-shrink-0">
        <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 group-hover:scale-105 transition-transform duration-300">
          <img
            :src="recommendation.coverUrl"
            :alt="recommendation.title"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
        
        <!-- Play Button Overlay -->
        <button
          @click="$emit('play', recommendation)"
          class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        >
          <Icon icon="mdi:play-circle" class="w-8 h-8 text-white" />
        </button>
        
        <!-- Hot Badge -->
        <div v-if="recommendation.isHot" class="absolute -top-2 -right-2">
          <div class="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Icon icon="mdi:fire" class="w-3 h-3 text-white" />
          </div>
        </div>
        
        <!-- Status Indicator -->
        <div 
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cyber-darker"
          :class="recommendation.isActive ? 'bg-green-400' : 'bg-gray-500'"
        ></div>
      </div>
      
      <!-- Music Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <!-- Title and Artist -->
            <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-cyber-purple transition-colors truncate">
              {{ recommendation.title }}
            </h3>
            <p class="text-gray-400 text-sm mb-2 truncate">
              {{ recommendation.artist }}
            </p>
            
            <!-- Genre and Duration -->
            <div class="flex items-center space-x-4 text-xs text-gray-500 mb-3">
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:music-clef-treble" class="w-3 h-3" />
                <span>{{ recommendation.genre }}</span>
              </div>
              
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:timer" class="w-3 h-3" />
                <span>{{ recommendation.duration }}</span>
              </div>
              
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:play-circle" class="w-3 h-3" />
                <span>{{ formatPlayCount(recommendation.playCount) }} 播放</span>
              </div>
              
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:sort-numeric-variant" class="w-3 h-3" />
                <span>排序: {{ recommendation.sortOrder }}</span>
              </div>
            </div>
            
            <!-- Tags -->
            <div v-if="recommendation.tags && recommendation.tags.length > 0" class="flex items-center space-x-2 mb-3">
              <span
                v-for="tag in recommendation.tags.slice(0, 3)"
                :key="tag"
                class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/30"
              >
                {{ tag }}
              </span>
              <span
                v-if="recommendation.tags.length > 3"
                class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30"
              >
                +{{ recommendation.tags.length - 3 }}
              </span>
            </div>
            
            <!-- Created Date -->
            <div class="text-xs text-gray-500">
              创建于 {{ formatDate(recommendation.createdAt) }}
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 ml-4">
            <!-- Hot Toggle -->
            <button
              @click="$emit('toggleHot', recommendation)"
              class="p-2 rounded-lg transition-all duration-200"
              :class="[
                recommendation.isHot 
                  ? 'text-red-400 hover:bg-red-500/20' 
                  : 'text-gray-500 hover:bg-gray-500/20'
              ]"
              :title="recommendation.isHot ? '取消热门' : '设为热门'"
            >
              <Icon 
                :icon="recommendation.isHot ? 'mdi:fire' : 'mdi:fire-off'" 
                class="w-5 h-5"
              />
            </button>
            
            <!-- Status Toggle -->
            <button
              @click="$emit('toggleStatus', recommendation)"
              class="p-2 rounded-lg transition-all duration-200"
              :class="[
                recommendation.isActive 
                  ? 'text-green-400 hover:bg-green-500/20' 
                  : 'text-gray-500 hover:bg-gray-500/20'
              ]"
              :title="recommendation.isActive ? '点击禁用' : '点击启用'"
            >
              <Icon 
                :icon="recommendation.isActive ? 'mdi:eye' : 'mdi:eye-off'" 
                class="w-5 h-5"
              />
            </button>
            
            <!-- Preview -->
            <button
              @click="$emit('preview', recommendation)"
              class="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-200"
              title="预览"
            >
              <Icon icon="mdi:eye-outline" class="w-5 h-5" />
            </button>
            
            <!-- Edit -->
            <button
              @click="$emit('edit', recommendation)"
              class="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200"
              title="编辑"
            >
              <Icon icon="mdi:pencil" class="w-5 h-5" />
            </button>
            
            <!-- Delete -->
            <button
              @click="$emit('delete', recommendation)"
              class="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
              title="删除"
            >
              <Icon icon="mdi:delete" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Audio Preview (Hidden) -->
    <audio
      ref="audioPlayer"
      :src="recommendation.audioUrl"
      preload="none"
      @loadstart="handleAudioLoadStart"
      @canplay="handleAudioCanPlay"
      @error="handleAudioError"
    ></audio>
    
    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div class="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]"></div>
    </div>
    
    <!-- Inactive Overlay -->
    <div 
      v-if="!recommendation.isActive"
      class="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <div class="bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-600">
        <span class="text-xs text-gray-400 font-medium">已禁用</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { HotRecommendation } from '@/types'

interface Props {
  recommendation: HotRecommendation
  selected?: boolean
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  delay: 0
})

const emit = defineEmits<{
  select: [id: string, selected: boolean]
  edit: [recommendation: HotRecommendation]
  delete: [recommendation: HotRecommendation]
  toggleStatus: [recommendation: HotRecommendation]
  toggleHot: [recommendation: HotRecommendation]
  preview: [recommendation: HotRecommendation]
  play: [recommendation: HotRecommendation]
}>()

const audioPlayer = ref<HTMLAudioElement>()

const formatPlayCount = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 防止无限重试，只设置一次fallback
  if (!img.dataset.fallback) {
    img.dataset.fallback = 'true'
    // 使用base64编码的音乐placeholder SVG，避免网络请求
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIiByeD0iOCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3Mjg0IiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyBjbGFzcz0idGV4dC1ncmF5LTQwMCI+4paqPC9zdmc+CjxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjQiIGZpbGw9IiM2Qjc2ODQiLz4KPHN2Zz4K'
  }
}

const handleAudioLoadStart = () => {
  console.log('Audio loading started for:', props.recommendation.title)
}

const handleAudioCanPlay = () => {
  console.log('Audio can play:', props.recommendation.title)
}

const handleAudioError = (event: Event) => {
  console.error('Audio error for:', props.recommendation.title, event)
}

// Audio playback control
const playAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.play().catch(error => {
      console.error('Failed to play audio:', error)
    })
  }
}

const pauseAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
}

// Expose audio controls for parent component if needed
defineExpose({
  playAudio,
  pauseAudio
})
</script>

<style scoped>
.recommendation-item {
  position: relative;
}

.recommendation-item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recommendation-item:hover::before {
  opacity: 1;
}

/* Hot badge pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>