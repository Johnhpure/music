<template>
  <div
    class="banner-item group relative bg-glass-white/5 border border-gray-700/30 rounded-lg p-6 hover:bg-glass-white/10 hover:border-gray-600/50 transition-all duration-300"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: delay } }"
  >
    <!-- Banner Content -->
    <div class="flex items-center space-x-6">
      <!-- Image Preview -->
      <div class="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-gray-800">
        <img
          :src="banner.imageUrl"
          :alt="banner.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          @error="handleImageError"
        />
        
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="absolute bottom-2 left-2 right-2">
            <button
              @click="$emit('preview', banner)"
              class="w-full py-1 text-xs text-white bg-black/50 rounded backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              预览
            </button>
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="absolute top-2 right-2">
          <div 
            class="px-2 py-1 text-xs font-medium rounded-full transition-all duration-300"
            :class="statusBadgeClass"
          >
            {{ banner.isActive ? '启用' : '禁用' }}
          </div>
        </div>
      </div>
      
      <!-- Banner Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <!-- Title -->
            <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-cyber-purple transition-colors">
              {{ banner.title }}
            </h3>
            
            <!-- Description -->
            <p class="text-gray-400 text-sm mb-3 line-clamp-2">
              {{ banner.description }}
            </p>
            
            <!-- Meta Info -->
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:cursor-pointer" class="w-4 h-4" />
                <span>{{ formatNumber(banner.clickCount) }} 次点击</span>
              </div>
              
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:sort-numeric-variant" class="w-4 h-4" />
                <span>排序: {{ banner.sortOrder }}</span>
              </div>
              
              <div class="flex items-center space-x-1">
                <Icon icon="mdi:calendar" class="w-4 h-4" />
                <span>{{ formatDate(banner.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 ml-4">
            <!-- Toggle Status -->
            <button
              @click="$emit('toggleStatus', banner)"
              class="p-2 rounded-lg transition-all duration-200"
              :class="[
                banner.isActive 
                  ? 'text-green-400 hover:bg-green-500/20 hover:text-green-300' 
                  : 'text-gray-500 hover:bg-gray-500/20 hover:text-gray-400'
              ]"
              :title="banner.isActive ? '点击禁用' : '点击启用'"
            >
              <Icon 
                :icon="banner.isActive ? 'mdi:eye' : 'mdi:eye-off'" 
                class="w-5 h-5"
              />
            </button>
            
            <!-- Edit -->
            <button
              @click="$emit('edit', banner)"
              class="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200"
              title="编辑"
            >
              <Icon icon="mdi:pencil" class="w-5 h-5" />
            </button>
            
            <!-- Delete -->
            <button
              @click="$emit('delete', banner)"
              class="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
              title="删除"
            >
              <Icon icon="mdi:delete" class="w-5 h-5" />
            </button>
            
            <!-- More Actions -->
            <div class="relative">
              <button
                @click="showMoreActions = !showMoreActions"
                class="p-2 rounded-lg text-gray-400 hover:bg-gray-500/20 hover:text-gray-300 transition-all duration-200"
                title="更多操作"
              >
                <Icon icon="mdi:dots-vertical" class="w-5 h-5" />
              </button>
              
              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition-all duration-200"
                leave-active-class="transition-all duration-200"
                enter-from-class="opacity-0 scale-95 translate-y-2"
                leave-to-class="opacity-0 scale-95 translate-y-2"
              >
                <div
                  v-if="showMoreActions"
                  v-click-outside="() => showMoreActions = false"
                  class="absolute top-full right-0 mt-2 w-40 bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg z-10"
                >
                  <div class="p-2 space-y-1">
                    <button
                      @click="handleCopyLink"
                      class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
                    >
                      <Icon icon="mdi:link" class="w-4 h-4" />
                      <span>复制链接</span>
                    </button>
                    
                    <button
                      @click="handleDuplicate"
                      class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
                    >
                      <Icon icon="mdi:content-copy" class="w-4 h-4" />
                      <span>复制</span>
                    </button>
                    
                    <button
                      @click="handleViewStats"
                      class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
                    >
                      <Icon icon="mdi:chart-line" class="w-4 h-4" />
                      <span>查看统计</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
        
        <!-- Tags (if any) -->
        <div v-if="banner.tags && banner.tags.length > 0" class="mt-3 flex items-center space-x-2">
          <span
            v-for="tag in banner.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30"
          >
            {{ tag }}
          </span>
        </div>
        
        <!-- Link URL (if any) -->
        <div v-if="banner.linkUrl" class="mt-2">
          <a
            :href="banner.linkUrl"
            target="_blank"
            class="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Icon icon="mdi:open-in-new" class="w-3 h-3" />
            <span class="truncate max-w-xs">{{ banner.linkUrl }}</span>
          </a>
        </div>
      </div>
    </div>
    
    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div class="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { Banner } from '@/types'

interface Props {
  banner: Banner
  index: number
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0
})

const emit = defineEmits<{
  edit: [banner: Banner]
  delete: [banner: Banner]
  toggleStatus: [banner: Banner]
  preview: [banner: Banner]
}>()

const showMoreActions = ref(false)

const statusBadgeClass = computed(() => {
  return props.banner.isActive
    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
})

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
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
    // 使用base64编码的1x1像素灰色图片作为fallback
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik00MCA0MEw1NiA1Nkw3MiA0MEw4OCA1NiIgc3Ryb2tlPSIjNkI3Mjg0IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPHN2Zz4='
  }
}

const handleCopyLink = async () => {
  if (props.banner.linkUrl) {
    try {
      await navigator.clipboard.writeText(props.banner.linkUrl)
      // Show success notification
      console.log('Link copied to clipboard')
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }
  showMoreActions.value = false
}

const handleDuplicate = () => {
  // Emit duplicate event
  emit('edit', { ...props.banner, id: '', title: `${props.banner.title} - 副本` })
  showMoreActions.value = false
}

const handleViewStats = () => {
  // Navigate to stats page or show stats modal
  console.log('View stats for banner:', props.banner.id)
  showMoreActions.value = false
}

// Click outside directive
const clickOutside = {
  beforeMount(el: any, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el._clickOutside)
  }
}

const vClickOutside = clickOutside
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>