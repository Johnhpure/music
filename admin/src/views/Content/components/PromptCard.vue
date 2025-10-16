<template>
  <div
    class="prompt-card group relative bg-glass-white/5 border border-gray-700/30 rounded-lg p-5 hover:bg-glass-white/10 hover:border-gray-600/50 transition-all duration-300"
    v-motion
    :initial="{ opacity: 0, scale: 0.95, y: 20 }"
    :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300, delay: delay } }"
  >
    <!-- Selection Checkbox -->
    <div class="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <label class="flex items-center cursor-pointer">
        <input
          :checked="selected"
          type="checkbox"
          class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple focus:ring-offset-gray-800"
          @change="$emit('select', prompt.id, ($event.target as HTMLInputElement).checked)"
        />
      </label>
    </div>
    
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <!-- Icon and Category -->
      <div class="flex items-center space-x-3">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110"
          :class="iconBgClass"
        >
          {{ prompt.icon }}
        </div>
        
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
              {{ prompt.category }}
            </span>
            <div 
              class="w-2 h-2 rounded-full"
              :class="prompt.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Action Menu -->
      <div class="relative">
        <button
          @click="showActions = !showActions"
          class="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-700/30 transition-all duration-200"
        >
          <Icon icon="mdi:dots-vertical" class="w-4 h-4 text-gray-400" />
        </button>
        
        <!-- Actions Dropdown -->
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="showActions"
            v-click-outside="() => showActions = false"
            class="absolute top-full right-0 mt-2 w-32 bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg z-10"
          >
            <div class="p-2 space-y-1">
              <button
                @click="handlePreview"
                class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
              >
                <Icon icon="mdi:eye" class="w-4 h-4" />
                <span>预览</span>
              </button>
              
              <button
                @click="handleEdit"
                class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
              >
                <Icon icon="mdi:pencil" class="w-4 h-4" />
                <span>编辑</span>
              </button>
              
              <button
                @click="handleToggleStatus"
                class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-glass-white/10 rounded-lg transition-colors"
              >
                <Icon :icon="prompt.isActive ? 'mdi:eye-off' : 'mdi:eye'" class="w-4 h-4" />
                <span>{{ prompt.isActive ? '禁用' : '启用' }}</span>
              </button>
              
              <div class="border-t border-gray-700/30 my-1"></div>
              
              <button
                @click="handleDelete"
                class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Icon icon="mdi:delete" class="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
    
    <!-- Title -->
    <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-cyber-purple transition-colors line-clamp-1">
      {{ prompt.title }}
    </h3>
    
    <!-- Content Preview -->
    <p class="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
      {{ prompt.content }}
    </p>
    
    <!-- Tags -->
    <div v-if="prompt.tags && prompt.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="tag in displayTags"
        :key="tag"
        class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-300 border border-gray-600/30"
      >
        {{ tag }}
      </span>
      <span
        v-if="prompt.tags.length > maxDisplayTags"
        class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400 border border-gray-600/30"
      >
        +{{ prompt.tags.length - maxDisplayTags }}
      </span>
    </div>
    
    <!-- Footer Stats -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-700/30">
      <div class="flex items-center space-x-4 text-xs text-gray-500">
        <div class="flex items-center space-x-1">
          <Icon icon="mdi:cursor-pointer" class="w-3 h-3" />
          <span>{{ formatUsageCount(prompt.usageCount) }}</span>
        </div>
        
        <div class="flex items-center space-x-1">
          <Icon icon="mdi:sort-numeric-variant" class="w-3 h-3" />
          <span>{{ prompt.sortOrder }}</span>
        </div>
        
        <div class="flex items-center space-x-1">
          <Icon icon="mdi:calendar" class="w-3 h-3" />
          <span>{{ formatDate(prompt.createdAt) }}</span>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          @click="handleToggleStatus"
          class="p-1.5 rounded-lg transition-all duration-200"
          :class="[
            prompt.isActive 
              ? 'text-green-400 hover:bg-green-500/20' 
              : 'text-gray-500 hover:bg-gray-500/20'
          ]"
          :title="prompt.isActive ? '点击禁用' : '点击启用'"
        >
          <Icon 
            :icon="prompt.isActive ? 'mdi:eye' : 'mdi:eye-off'" 
            class="w-4 h-4"
          />
        </button>
        
        <button
          @click="handleEdit"
          class="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
          title="编辑"
        >
          <Icon icon="mdi:pencil" class="w-4 h-4" />
        </button>
        
        <button
          @click="handleDelete"
          class="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all duration-200"
          title="删除"
        >
          <Icon icon="mdi:delete" class="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div class="absolute inset-0 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]"></div>
    </div>
    
    <!-- Status Indicator -->
    <div 
      v-if="!prompt.isActive"
      class="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
      <div class="bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-600">
        <span class="text-xs text-gray-400 font-medium">已禁用</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { PromptTemplate } from '@/types'

interface Props {
  prompt: PromptTemplate
  selected?: boolean
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  delay: 0
})

const emit = defineEmits<{
  select: [id: string, selected: boolean]
  edit: [prompt: PromptTemplate]
  delete: [prompt: PromptTemplate]
  toggleStatus: [prompt: PromptTemplate]
  preview: [prompt: PromptTemplate]
}>()

const showActions = ref(false)
const maxDisplayTags = 3

const iconBgClass = computed(() => {
  // Parse the iconBg string or provide default
  if (props.prompt.iconBg) {
    return props.prompt.iconBg
  }
  
  // Default gradient based on category
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
})

const displayTags = computed(() => {
  return props.prompt.tags.slice(0, maxDisplayTags)
})

const formatUsageCount = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const handleEdit = () => {
  emit('edit', props.prompt)
  showActions.value = false
}

const handleDelete = () => {
  emit('delete', props.prompt)
  showActions.value = false
}

const handleToggleStatus = () => {
  emit('toggleStatus', props.prompt)
  showActions.value = false
}

const handlePreview = () => {
  emit('preview', props.prompt)
  showActions.value = false
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
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prompt-card {
  position: relative;
  min-height: 280px;
}

.prompt-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.prompt-card:hover::before {
  opacity: 1;
}
</style>