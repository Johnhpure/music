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
            v-if="visible && banner"
            class="relative w-full max-w-4xl bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-600 flex items-center justify-center">
                  <Icon icon="mdi:eye" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white">Banner 预览</h3>
                  <p class="text-sm text-gray-400">{{ banner.title }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Device Toggle -->
                <div class="flex items-center bg-glass-white/10 rounded-lg p-1">
                  <button
                    v-for="device in devices"
                    :key="device.name"
                    @click="currentDevice = device.name"
                    class="px-3 py-1 text-sm rounded-md transition-all duration-200"
                    :class="[
                      currentDevice === device.name
                        ? 'bg-cyber-purple text-white'
                        : 'text-gray-400 hover:text-white'
                    ]"
                  >
                    <Icon :icon="device.icon" class="w-4 h-4 mr-1" />
                    {{ device.label }}
                  </button>
                </div>
                
                <button
                  @click="$emit('update:visible', false)"
                  class="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                >
                  <Icon icon="mdi:close" class="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            <!-- Preview Content -->
            <div class="p-6">
              <!-- Device Frame -->
              <div 
                class="mx-auto bg-gray-900 rounded-lg overflow-hidden transition-all duration-300"
                :class="deviceFrameClass"
              >
                <!-- Status Bar (Mobile only) -->
                <div v-if="currentDevice === 'mobile'" class="bg-black px-4 py-2 flex items-center justify-between text-white text-xs">
                  <div class="flex items-center space-x-1">
                    <span>9:41</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <Icon icon="mdi:signal" class="w-3 h-3" />
                    <Icon icon="mdi:wifi" class="w-3 h-3" />
                    <Icon icon="mdi:battery" class="w-3 h-3" />
                  </div>
                </div>
                
                <!-- App Header (Mobile only) -->
                <div v-if="currentDevice === 'mobile'" class="bg-cyber-dark px-4 py-3 border-b border-gray-700/30">
                  <div class="flex items-center justify-between">
                    <h4 class="text-white font-medium">AI音乐创作</h4>
                    <div class="flex items-center space-x-1 text-cyber-purple text-sm">
                      <Icon icon="mdi:music-note" class="w-4 h-4" />
                      <span>100点</span>
                    </div>
                  </div>
                </div>
                
                <!-- Banner Container -->
                <div class="relative">
                  <!-- Banner Image -->
                  <div 
                    class="relative overflow-hidden"
                    :class="bannerContainerClass"
                  >
                    <img
                      :src="banner.imageUrl"
                      :alt="banner.title"
                      class="w-full h-full object-cover banner-preview"
                      @error="handleImageError"
                    />
                    
                    <!-- Banner Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <!-- Banner Content -->
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                      <h3 class="text-white font-bold text-lg mb-1">{{ banner.title }}</h3>
                      <p class="text-white/80 text-sm">{{ banner.description }}</p>
                      
                      <!-- Click Indicator -->
                      <div v-if="banner.linkUrl" class="mt-2">
                        <span class="inline-flex items-center px-2 py-1 bg-white/20 rounded-full text-white text-xs">
                          <Icon icon="mdi:open-in-new" class="w-3 h-3 mr-1" />
                          点击查看详情
                        </span>
                      </div>
                    </div>
                    
                    <!-- Banner Indicators (if multiple) -->
                    <div class="absolute bottom-4 right-4 flex space-x-1">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                      <div class="w-2 h-2 bg-white/50 rounded-full"></div>
                      <div class="w-2 h-2 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                  
                  <!-- Content Below Banner (Mobile only) -->
                  <div v-if="currentDevice === 'mobile'" class="p-4 bg-cyber-dark">
                    <div class="mb-6">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="text-white font-medium">为您推荐创作作品</h4>
                      </div>
                      
                      <!-- Mock Content -->
                      <div class="grid grid-cols-2 gap-3">
                        <div v-for="i in 2" :key="i" class="bg-gray-800 rounded-lg p-3">
                          <div class="w-full h-16 bg-gray-700 rounded mb-2"></div>
                          <div class="h-3 bg-gray-700 rounded mb-1"></div>
                          <div class="h-2 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Banner Info -->
              <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Banner Details -->
                <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                  <h4 class="text-white font-medium mb-3 flex items-center">
                    <Icon icon="mdi:information" class="w-4 h-4 mr-2 text-cyber-purple" />
                    Banner 信息
                  </h4>
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-400">标题:</span>
                      <span class="text-white">{{ banner.title }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">状态:</span>
                      <span :class="banner.isActive ? 'text-green-400' : 'text-gray-400'">
                        {{ banner.isActive ? '启用' : '禁用' }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">排序:</span>
                      <span class="text-white">{{ banner.sortOrder }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">点击量:</span>
                      <span class="text-white">{{ banner.clickCount?.toLocaleString() || 0 }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Technical Info -->
                <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                  <h4 class="text-white font-medium mb-3 flex items-center">
                    <Icon icon="mdi:cog" class="w-4 h-4 mr-2 text-cyber-purple" />
                    技术信息
                  </h4>
                  
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-400">设备:</span>
                      <span class="text-white">{{ getCurrentDeviceInfo().label }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">尺寸:</span>
                      <span class="text-white">{{ getCurrentDeviceInfo().size }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400">比例:</span>
                      <span class="text-white">{{ getCurrentDeviceInfo().ratio }}</span>
                    </div>
                    <div v-if="banner.linkUrl" class="flex justify-between">
                      <span class="text-gray-400">链接:</span>
                      <a 
                        :href="banner.linkUrl" 
                        target="_blank"
                        class="text-cyber-purple hover:text-cyber-pink transition-colors text-xs truncate max-w-32"
                      >
                        {{ banner.linkUrl }}
                      </a>
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
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import type { Banner } from '@/types'

interface Props {
  visible: boolean
  banner?: Banner | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  edit: [banner: Banner]
}>()

// State
const currentDevice = ref('mobile')

const devices = [
  {
    name: 'mobile',
    label: '手机',
    icon: 'mdi:cellphone',
    width: 'w-80',
    size: '375x667',
    ratio: '16:9'
  },
  {
    name: 'tablet',
    label: '平板',
    icon: 'mdi:tablet',
    width: 'w-96',
    size: '768x1024',
    ratio: '4:3'
  },
  {
    name: 'desktop',
    label: '桌面',
    icon: 'mdi:monitor',
    width: 'w-full max-w-2xl',
    size: '1200x400',
    ratio: '3:1'
  }
]

// Computed
const deviceFrameClass = computed(() => {
  const device = devices.find(d => d.name === currentDevice.value)
  return device?.width || 'w-80'
})

const bannerContainerClass = computed(() => {
  switch (currentDevice.value) {
    case 'mobile':
      return 'h-48' // 192px
    case 'tablet':
      return 'h-56' // 224px
    case 'desktop':
      return 'h-64' // 256px
    default:
      return 'h-48'
  }
})

const getCurrentDeviceInfo = () => {
  return devices.find(d => d.name === currentDevice.value) || devices[0]
}

// Methods
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 防止无限重试，只设置一次fallback
  if (!img.dataset.fallback) {
    img.dataset.fallback = 'true'
    // 使用base64编码的SVG图片作为fallback，避免额外网络请求
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNjAgODBMMTkyIDExMkwyMjQgODBMMjU2IDExMiIgc3Ryb2tlPSIjNkI3Mjg0IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHN2ZyBjbGFzcz0idzggaDggdGV4dC1ncmF5LTUwMCIgdmlld0JveD0iMTUwIDcwIDEwMCA2MCI+Cjx0ZXh0IHg9IjIwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg0Ij7lm77niYfmlKDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPgo='
  }
}

const refreshPreview = () => {
  // 刷新预览：重置图片错误状态并强制重新加载
  if (props.banner?.imageUrl) {
    const previewImg = document.querySelector('.banner-preview img') as HTMLImageElement
    if (previewImg) {
      // 清除fallback标记，允许重新尝试
      delete previewImg.dataset.fallback
      // 添加时间戳强制刷新
      previewImg.src = props.banner.imageUrl + '?t=' + Date.now()
    }
  }
}

const handleEdit = () => {
  if (props.banner) {
    emit('edit', props.banner)
    emit('update:visible', false)
  }
}
</script>

<style scoped>
/* Custom scrollbar for mobile preview */
.mobile-preview {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-preview::-webkit-scrollbar {
  display: none;
}
</style>