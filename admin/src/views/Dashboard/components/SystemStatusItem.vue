<template>
  <div
    class="system-status-item p-4 rounded-lg bg-glass-white/5 border border-gray-700/30 hover:bg-glass-white/10 transition-all duration-300 group"
    v-motion
    :initial="{ opacity: 0, scale: 0.95 }"
    :enter="{ opacity: 1, scale: 1, transition: { duration: 300, delay: delay } }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-sm font-medium text-white group-hover:text-cyber-purple transition-colors">
        {{ service.name }}
      </h4>
      <div 
        class="flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300"
        :class="statusBadgeClass"
      >
        <div 
          class="w-2 h-2 rounded-full"
          :class="statusDotClass"
        ></div>
        <span>{{ statusText }}</span>
      </div>
    </div>
    
    <!-- Metrics -->
    <div class="space-y-2">
      <!-- Uptime -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-400">运行时间</span>
        <span class="text-white font-medium">{{ service.uptime }}</span>
      </div>
      
      <!-- Response Time -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-400">响应时间</span>
        <span 
          class="font-medium"
          :class="responseTimeClass"
        >
          {{ service.responseTime }}
        </span>
      </div>
      
      <!-- Progress Bar for Uptime -->
      <div class="mt-3">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-gray-500">健康度</span>
          <span class="text-gray-400">{{ healthPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
          <div 
            class="h-full transition-all duration-1000 ease-out rounded-full"
            :class="healthBarClass"
            :style="{ width: `${healthPercentage}%` }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="mt-4 flex items-center justify-between">
      <button
        @click="viewDetails"
        class="text-xs text-cyber-purple hover:text-cyber-pink transition-colors underline hover:no-underline"
      >
        查看详情
      </button>
      
      <div class="flex items-center space-x-1">
        <button
          @click="refresh"
          class="p-1 rounded-full hover:bg-gray-700/30 transition-colors"
          :disabled="refreshing"
        >
          <Icon 
            icon="mdi:refresh" 
            class="w-4 h-4 text-gray-400 hover:text-white transition-colors"
            :class="{ 'animate-spin': refreshing }"
          />
        </button>
        
        <button
          v-if="service.status === 'error'"
          @click="restart"
          class="p-1 rounded-full hover:bg-red-500/20 transition-colors"
        >
          <Icon 
            icon="mdi:restart" 
            class="w-4 h-4 text-red-400 hover:text-red-300 transition-colors"
          />
        </button>
      </div>
    </div>
    
    <!-- Connection Lines (Visual Effect) -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      <div 
        class="absolute w-full h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent -top-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>
      <div 
        class="absolute w-full h-px bg-gradient-to-r from-transparent via-cyber-purple/30 to-transparent -bottom-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Service {
  name: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  responseTime: string
}

interface Props {
  service: Service
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0
})

const emit = defineEmits<{
  viewDetails: [service: Service]
  refresh: [service: Service]
  restart: [service: Service]
}>()

const refreshing = ref(false)

import { ref } from 'vue'

const statusText = computed(() => {
  const statusMap = {
    healthy: '正常',
    warning: '警告',
    error: '异常'
  }
  return statusMap[props.service.status]
})

const statusBadgeClass = computed(() => {
  const classes = {
    healthy: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30'
  }
  return classes[props.service.status]
})

const statusDotClass = computed(() => {
  const classes = {
    healthy: 'bg-green-400 animate-pulse',
    warning: 'bg-yellow-400 animate-pulse',
    error: 'bg-red-400 animate-pulse'
  }
  return classes[props.service.status]
})

const responseTimeClass = computed(() => {
  const responseTime = parseInt(props.service.responseTime)
  if (responseTime < 100) return 'text-green-400'
  if (responseTime < 300) return 'text-yellow-400'
  return 'text-red-400'
})

const healthPercentage = computed(() => {
  const uptimeFloat = parseFloat(props.service.uptime.replace('%', ''))
  return Math.round(uptimeFloat)
})

const healthBarClass = computed(() => {
  const classes = {
    healthy: 'bg-gradient-to-r from-green-500 to-green-400',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-400',
    error: 'bg-gradient-to-r from-red-500 to-red-400'
  }
  return classes[props.service.status]
})

const viewDetails = () => {
  emit('viewDetails', props.service)
}

const refresh = async () => {
  refreshing.value = true
  
  try {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('refresh', props.service)
  } finally {
    refreshing.value = false
  }
}

const restart = () => {
  emit('restart', props.service)
}

// 移除所有 setInterval 动画，使用 CSS transition
</script>

<style scoped>
.system-status-item {
  position: relative;
}

/* Custom pulse animation for status dots */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Hover glow effect */
.system-status-item:hover {
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}
</style>