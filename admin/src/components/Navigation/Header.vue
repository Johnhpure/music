<template>
  <header class="h-16 bg-cyber-darker/80 backdrop-blur-xl border-b border-gray-700/30 flex items-center justify-between px-6">
    <!-- Left Section -->
    <div class="flex items-center space-x-4">
      <!-- Mobile Menu Toggle -->
      <button
        @click="$emit('toggleSidebar')"
        class="lg:hidden p-2 rounded-lg hover:bg-glass-white/10 transition-colors"
      >
        <Icon icon="mdi:menu" class="w-5 h-5 text-gray-300" />
      </button>
      
      <!-- Desktop Collapse Toggle -->
      <button
        @click="$emit('toggleCollapse')"
        class="hidden lg:flex p-2 rounded-lg hover:bg-glass-white/10 transition-colors"
        :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <Icon 
          :icon="sidebarCollapsed ? 'mdi:menu-open' : 'mdi:menu'" 
          class="w-5 h-5 text-gray-300"
        />
      </button>
      
      <!-- Search -->
      <div class="relative hidden md:block">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon icon="mdi:magnify" class="w-5 h-5 text-gray-400" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索功能、用户或内容..."
          class="w-64 pl-10 pr-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300"
          @keyup.enter="handleSearch"
        />
        
        <!-- Search Results -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="searchQuery && searchResults.length > 0"
            class="absolute top-full left-0 right-0 mt-2 bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg z-50 max-h-80 overflow-y-auto custom-scrollbar"
          >
            <div class="p-2 space-y-1">
              <button
                v-for="result in searchResults"
                :key="result.path"
                @click="navigateToResult(result)"
                class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-glass-white/10 transition-colors"
              >
                <Icon :icon="result.icon" class="w-4 h-4 text-cyber-purple flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white truncate">{{ result.title }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ result.description }}</p>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <!-- Right Section -->
    <div class="flex items-center space-x-4">
      <!-- System Status -->
      <div class="hidden lg:flex items-center space-x-2">
        <div class="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-xs text-green-300 font-medium">系统正常</span>
        </div>
      </div>
      
      <!-- Notifications -->
      <div class="relative">
        <button
          @click="showNotifications = !showNotifications"
          class="relative p-2 rounded-lg hover:bg-glass-white/10 transition-colors"
        >
          <Icon icon="mdi:bell-outline" class="w-5 h-5 text-gray-300" />
          <!-- Badge -->
          <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>
        
        <!-- Notification Dropdown -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="showNotifications"
            v-click-outside="() => showNotifications = false"
            class="absolute top-full right-0 mt-2 w-80 bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg z-50"
          >
            <div class="p-4 border-b border-gray-700/30">
              <h3 class="text-sm font-semibold text-white">通知</h3>
            </div>
            <div class="max-h-80 overflow-y-auto custom-scrollbar">
              <div
                v-if="notifications.length === 0"
                class="p-4 text-center text-gray-400 text-sm"
              >
                暂无新通知
              </div>
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 border-b border-gray-700/30 hover:bg-glass-white/10 transition-colors cursor-pointer"
                @click="handleNotificationClick(notification)"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div 
                      class="w-8 h-8 rounded-full flex items-center justify-center"
                      :class="getNotificationIconBg(notification.type)"
                    >
                      <Icon 
                        :icon="getNotificationIcon(notification.type)" 
                        class="w-4 h-4 text-white"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-white">{{ notification.title }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatTime(notification.time) }}</p>
                  </div>
                  <button
                    v-if="!notification.read"
                    @click.stop="markAsRead(notification.id)"
                    class="w-2 h-2 bg-cyber-purple rounded-full flex-shrink-0"
                  ></button>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-gray-700/30">
              <button
                @click="clearAllNotifications"
                class="text-sm text-cyber-purple hover:text-cyber-pink transition-colors"
              >
                清空所有通知
              </button>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- User Menu -->
      <div class="relative">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-glass-white/10 transition-colors"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-green to-green-400 flex items-center justify-center">
            <Icon icon="mdi:account" class="w-4 h-4 text-white" />
          </div>
          <div class="hidden md:block text-left">
            <p class="text-sm text-white font-medium">管理员</p>
            <p class="text-xs text-gray-400">在线</p>
          </div>
          <Icon 
            icon="mdi:chevron-down" 
            class="w-4 h-4 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': showUserMenu }"
          />
        </button>
        
        <!-- User Dropdown -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="showUserMenu"
            v-click-outside="() => showUserMenu = false"
            class="absolute top-full right-0 mt-2 w-48 bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg z-50"
          >
            <div class="p-2 space-y-1">
              <button
                v-for="item in userMenuItems"
                :key="item.name"
                @click="handleUserMenuClick(item)"
                class="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-glass-white/10 transition-colors"
              >
                <Icon :icon="item.icon" class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-white">{{ item.name }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

// Props
interface Props {
  sidebarCollapsed: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggleSidebar: []
  toggleCollapse: []
}>()

// Composables
const router = useRouter()

// State
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: '系统更新',
    message: '管理后台已更新到 v1.0.1',
    time: new Date(),
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: '存储空间警告',
    message: '系统存储空间使用率已达85%',
    time: new Date(Date.now() - 3600000),
    read: false
  },
  {
    id: 3,
    type: 'success',
    title: '备份完成',
    message: '数据库备份已成功完成',
    time: new Date(Date.now() - 7200000),
    read: true
  }
])

// Computed
const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  const results = [
    { path: '/dashboard', title: '数据概览', description: '查看平台整体数据', icon: 'mdi:view-dashboard' },
    { path: '/content/banners', title: 'Banner管理', description: '管理首页轮播图', icon: 'mdi:image-multiple' },
    { path: '/content/prompts', title: '提示词管理', description: '管理创作提示词模板', icon: 'mdi:lightbulb-on' },
    { path: '/users', title: '用户管理', description: '管理平台用户', icon: 'mdi:account-group' },
    { path: '/works', title: '作品管理', description: '管理用户音乐作品', icon: 'mdi:music-note' },
    { path: '/analytics/users', title: '用户分析', description: '用户行为数据分析', icon: 'mdi:account-analytics' },
    { path: '/settings/system', title: '系统配置', description: '系统参数设置', icon: 'mdi:cog-outline' }
  ]
  
  return results.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  ).slice(0, 6)
})

const userMenuItems = [
  { name: '个人设置', icon: 'mdi:account-cog', action: 'profile' },
  { name: '系统设置', icon: 'mdi:cog', action: 'settings' },
  { name: '帮助文档', icon: 'mdi:help-circle', action: 'help' },
  { name: '退出登录', icon: 'mdi:logout', action: 'logout' }
]

// Methods
const handleSearch = () => {
  if (searchResults.value.length > 0) {
    navigateToResult(searchResults.value[0])
  }
}

const navigateToResult = (result: any) => {
  router.push(result.path)
  searchQuery.value = ''
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success': return 'mdi:check-circle'
    case 'warning': return 'mdi:alert-circle'
    case 'error': return 'mdi:close-circle'
    default: return 'mdi:information'
  }
}

const getNotificationIconBg = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-500/20'
    case 'warning': return 'bg-yellow-500/20'
    case 'error': return 'bg-red-500/20'
    default: return 'bg-blue-500/20'
  }
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const clearAllNotifications = () => {
  notifications.value = []
  showNotifications.value = false
}

const handleNotificationClick = (notification: any) => {
  markAsRead(notification.id)
  // Handle notification navigation if needed
}

const handleUserMenuClick = (item: any) => {
  showUserMenu.value = false
  
  switch (item.action) {
    case 'profile':
      // Handle profile navigation
      break
    case 'settings':
      router.push('/settings/system')
      break
    case 'help':
      // Open help documentation
      break
    case 'logout':
      // Handle logout
      console.log('Logout clicked')
      break
  }
}

// Custom directive for click outside
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

// Register directive globally or use it locally
const vClickOutside = clickOutside

// Watch for search query to show/hide results
watch(searchQuery, (newVal) => {
  if (!newVal) {
    // Clear search results
  }
})
</script>

<style scoped>
/* Add any custom styles here */
</style>