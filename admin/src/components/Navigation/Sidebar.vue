<template>
  <aside 
    class="h-screen bg-cyber-darker/80 backdrop-blur-xl border-r border-gray-700/30 transition-all duration-300"
    :class="[
      collapsed ? 'w-20' : 'w-80',
      'flex flex-col'
    ]"
  >
    <!-- Logo Section -->
    <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
      <div class="flex items-center space-x-3">
        <!-- Logo -->
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-purple to-cyber-pink flex items-center justify-center">
          <Icon 
            icon="mdi:music-note" 
            class="w-6 h-6 text-white"
          />
        </div>
        
        <!-- Brand Text -->
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="!collapsed" class="flex flex-col">
            <h1 class="text-lg font-bold text-white">
              AI音乐平台
            </h1>
            <p class="text-xs text-gray-400">
              管理控制台
            </p>
          </div>
        </Transition>
      </div>
      
      <!-- Close Button (Mobile) -->
      <button
        v-if="isMobile"
        @click="$emit('close')"
        class="lg:hidden p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
      >
        <Icon icon="mdi:close" class="w-5 h-5 text-gray-400" />
      </button>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
      <template v-for="item in navigation" :key="item.name">
        <!-- Single Level Menu Item -->
        <template v-if="!item.children && item.to">
          <router-link
            :to="item.to"
            class="nav-item group flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300"
            :class="[
              isActiveRoute(item.to!) 
                ? 'bg-gradient-to-r from-cyber-purple/20 to-purple-600/20 text-white border-r-4 border-cyber-purple' 
                : 'text-gray-300 hover:text-white hover:bg-glass-white/10'
            ]"
            active-class="active"
          >
            <Icon 
              :icon="item.icon" 
              class="w-5 h-5 transition-colors flex-shrink-0"
              :class="[
                isActiveRoute(item.to!) ? 'text-cyber-purple' : 'text-gray-400 group-hover:text-white'
              ]"
            />
            
            <Transition
              enter-active-class="transition-all duration-300"
              leave-active-class="transition-all duration-200"
              enter-from-class="opacity-0 translate-x-4"
              leave-to-class="opacity-0 translate-x-4"
            >
              <span 
                v-if="!collapsed" 
                class="font-medium truncate"
              >
                {{ item.name }}
              </span>
            </Transition>
            
            <!-- Badge -->
            <Transition
              enter-active-class="transition-all duration-300"
              leave-active-class="transition-all duration-200"
              enter-from-class="opacity-0 scale-75"
              leave-to-class="opacity-0 scale-75"
            >
              <span 
                v-if="item.badge && !collapsed"
                class="ml-auto px-2 py-1 text-xs rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30"
              >
                {{ item.badge }}
              </span>
            </Transition>
          </router-link>
        </template>
        
        <!-- Multi-level Menu Item -->
        <template v-else>
          <div class="space-y-1">
            <button
              @click="toggleSubmenu(item.name)"
              class="nav-item group w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300"
              :class="[
                isActiveParent(item) 
                  ? 'bg-glass-white/10 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-glass-white/10'
              ]"
            >
              <div class="flex items-center space-x-3">
                <Icon 
                  :icon="item.icon" 
                  class="w-5 h-5 transition-colors flex-shrink-0"
                  :class="[
                    isActiveParent(item) ? 'text-cyber-purple' : 'text-gray-400 group-hover:text-white'
                  ]"
                />
                <Transition
                  enter-active-class="transition-all duration-300"
                  leave-active-class="transition-all duration-200"
                  enter-from-class="opacity-0 translate-x-4"
                  leave-to-class="opacity-0 translate-x-4"
                >
                  <span 
                    v-if="!collapsed" 
                    class="font-medium truncate"
                  >
                    {{ item.name }}
                  </span>
                </Transition>
              </div>
              
              <Transition
                enter-active-class="transition-all duration-300"
                leave-active-class="transition-all duration-200"
                enter-from-class="opacity-0 scale-75"
                leave-to-class="opacity-0 scale-75"
              >
                <Icon 
                  v-if="!collapsed"
                  icon="mdi:chevron-right" 
                  class="w-4 h-4 transition-transform duration-300"
                  :class="[
                    openSubmenus.includes(item.name) ? 'rotate-90' : '',
                    'text-gray-400 group-hover:text-white'
                  ]"
                />
              </Transition>
            </button>
            
            <!-- Submenu Items -->
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 max-h-0"
              leave-to-class="opacity-0 max-h-0"
            >
              <div 
                v-if="(openSubmenus.includes(item.name) || isActiveParent(item)) && !collapsed"
                class="ml-8 space-y-1 border-l-2 border-gray-700/30 pl-4 max-h-96 overflow-hidden"
              >
                <router-link
                  v-for="child in item.children"
                  :key="child.name"
                  :to="child.to!"
                  class="nav-subitem flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                  :class="[
                    isActiveRoute(child.to!)
                      ? 'bg-cyber-purple/10 text-cyber-purple border-l-2 border-cyber-purple'
                      : 'text-gray-400 hover:text-white hover:bg-glass-white/10'
                  ]"
                  active-class="active"
                >
                  <Icon 
                    :icon="child.icon" 
                    class="w-4 h-4 flex-shrink-0"
                  />
                  <span class="truncate">{{ child.name }}</span>
                </router-link>
              </div>
            </Transition>
          </div>
        </template>
      </template>
    </nav>
    
    <!-- User Section -->
    <div class="p-4 border-t border-gray-700/30">
      <div class="flex items-center space-x-3">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-green to-green-400 flex items-center justify-center flex-shrink-0">
          <Icon icon="mdi:account" class="w-5 h-5 text-white" />
        </div>
        
        <!-- User Info -->
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 translate-x-4"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              管理员
            </p>
            <p class="text-xs text-gray-400 truncate">
              admin@example.com
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

interface NavigationItem {
  name: string
  to?: string
  icon: string
  badge?: string
  children?: NavigationItem[]
}

// Props
interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  toggle: []
  close: []
}>()

// Composables
const route = useRoute()

// State
const openSubmenus = ref<string[]>(['内容管理', '数据分析', '系统设置'])

// Computed
const isMobile = computed(() => {
  return window.innerWidth < 1024
})

// Navigation configuration
const navigation: NavigationItem[] = [
  {
    name: '数据概览',
    to: '/dashboard',
    icon: 'mdi:view-dashboard'
  },
  {
    name: '内容管理',
    icon: 'mdi:content-copy',
    children: [
      {
        name: 'Banner管理',
        to: '/content/banners',
        icon: 'mdi:image-multiple'
      },
      {
        name: '提示词管理',
        to: '/content/prompts',
        icon: 'mdi:lightbulb-on'
      },
      {
        name: '推荐管理',
        to: '/content/recommendations',
        icon: 'mdi:star-circle'
      }
    ]
  },
  {
    name: '用户管理',
    to: '/users',
    icon: 'mdi:account-group',
    badge: 'New'
  },
  {
    name: '作品管理',
    to: '/works',
    icon: 'mdi:music-note'
  },
  {
    name: '数据分析',
    icon: 'mdi:chart-line',
    children: [
      {
        name: '用户分析',
        to: '/analytics/users',
        icon: 'mdi:account-analytics'
      },
      {
        name: '内容分析',
        to: '/analytics/content',
        icon: 'mdi:chart-box'
      }
    ]
  },
  {
    name: '系统设置',
    icon: 'mdi:cog',
    children: [
      {
        name: '系统配置',
        to: '/settings/system',
        icon: 'mdi:cog-outline'
      },
      {
        name: 'AI配置',
        to: '/settings/ai',
        icon: 'mdi:robot'
      },
      {
        name: '积分配置',
        to: '/settings/credits',
        icon: 'mdi:coin'
      }
    ]
  }
]

// Methods
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const isActiveParent = (item: NavigationItem) => {
  if (!item.children) return false
  return item.children.some(child => isActiveRoute(child.to!))
}

const toggleSubmenu = (name: string) => {
  const index = openSubmenus.value.indexOf(name)
  if (index > -1) {
    openSubmenus.value.splice(index, 1)
  } else {
    openSubmenus.value.push(name)
  }
}

// Watch for active parent to auto-open submenus
watch(() => route.path, () => {
  navigation.forEach(item => {
    if (item.children && isActiveParent(item)) {
      if (!openSubmenus.value.includes(item.name)) {
        openSubmenus.value.push(item.name)
      }
    }
  })
}, { immediate: true })
</script>

<style scoped>
.nav-item {
  position: relative;
}

.nav-item.active {
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  border-radius: 0 2px 2px 0;
}
</style>