<template>
  <CyberCard
    :clickable="true"
    :glow="true"
    :delay="delay"
    class="stats-card group"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <!-- Icon -->
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        :class="iconBgClass"
      >
        <Icon :icon="icon" class="w-6 h-6 text-white" />
      </div>
      
      <!-- Trend Indicator -->
      <div class="flex items-center space-x-1">
        <Icon 
          :icon="trendIcon" 
          class="w-4 h-4"
          :class="trendColorClass"
        />
        <span 
          class="text-sm font-medium"
          :class="trendColorClass"
        >
          {{ change }}
        </span>
      </div>
    </div>
    
    <!-- Value -->
    <div class="mt-4">
      <h3 class="text-3xl font-bold text-white mb-1 group-hover:text-gradient transition-all duration-300">
        {{ value }}
      </h3>
      <p class="text-gray-400 text-sm">{{ title }}</p>
    </div>
    
    <!-- Progress Bar (Optional) -->
    <div v-if="progress !== undefined" class="mt-4">
      <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
        <span>进度</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
        <div 
          class="h-full transition-all duration-1000 ease-out rounded-full"
          :class="progressBarClass"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Sparkline Chart (Optional) -->
    <div v-if="sparklineData" class="mt-4 h-8">
      <canvas
        ref="sparklineCanvas"
        class="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
      ></canvas>
    </div>
  </CyberCard>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'

interface Props {
  title: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  delay?: number
  progress?: number
  sparklineData?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0
})

const emit = defineEmits<{
  click: []
}>()

const sparklineCanvas = ref<HTMLCanvasElement>()

// Computed properties
const iconBgClass = computed(() => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-cyber-purple to-purple-600 shadow-lg shadow-cyber-purple/30',
    success: 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30'
  }
  return colorClasses[props.color]
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'mdi:trending-up'
    case 'down':
      return 'mdi:trending-down'
    default:
      return 'mdi:trending-neutral'
  }
})

const trendColorClass = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'text-green-400'
    case 'down':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
})

const progressBarClass = computed(() => {
  const colorClasses = {
    primary: 'bg-gradient-to-r from-cyber-purple to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600'
  }
  return colorClasses[props.color]
})

// 移除所有 setInterval 动画，直接显示数值

const drawSparkline = () => {
  if (!sparklineCanvas.value || !props.sparklineData) return

  const canvas = sparklineCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

  const width = rect.width
  const height = rect.height
  const data = props.sparklineData

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  if (data.length < 2) return

  // Calculate points
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - minValue) / range) * height
  }))

  // Draw line
  ctx.beginPath()
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${props.color}`) || '#6366f1'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  })

  ctx.stroke()

  // Draw area fill
  ctx.beginPath()
  ctx.fillStyle = `${ctx.strokeStyle}20`
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, height)
      ctx.lineTo(point.x, point.y)
    } else {
      ctx.lineTo(point.x, point.y)
    }
  })
  ctx.lineTo(points[points.length - 1].x, height)
  ctx.closePath()
  ctx.fill()
}

// Lifecycle
onMounted(() => {
  drawSparkline()
})

watch(() => props.sparklineData, drawSparkline)
</script>

<style scoped>
.stats-card {
  @apply hover:shadow-cyber-lg transform hover:scale-[1.02] transition-all duration-300;
}

.text-gradient {
  @apply bg-gradient-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent;
}
</style>