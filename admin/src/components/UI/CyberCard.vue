<template>
  <div
    class="cyber-card-container"
    :class="containerClass"
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: delay } }"
  >
    <!-- Card Header -->
    <div v-if="$slots.header || title" class="cyber-card-header">
      <slot name="header">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Icon -->
            <div
              v-if="icon"
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="iconBgClass"
            >
              <Icon :icon="icon" class="w-5 h-5 text-white" />
            </div>
            
            <!-- Title -->
            <div>
              <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-gray-400">{{ subtitle }}</p>
            </div>
          </div>
          
          <!-- Header Actions -->
          <div v-if="$slots.actions" class="flex items-center space-x-2">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>
    
    <!-- Card Content -->
    <div class="cyber-card-content" :class="contentClass">
      <slot />
    </div>
    
    <!-- Card Footer -->
    <div v-if="$slots.footer" class="cyber-card-footer">
      <slot name="footer" />
    </div>
    
    <!-- Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="w-8 h-8 border-2 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-400">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>
    
    <!-- Hover Glow Effect -->
    <div
      v-if="glow"
      class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      :class="glowClass"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: string
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  variant?: 'default' | 'gradient' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  loadingText?: string
  glow?: boolean
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  variant: 'default',
  size: 'md',
  hoverable: true,
  loadingText: '加载中...',
  delay: 0
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const containerClass = computed(() => {
  const baseClass = [
    'relative bg-glass-white/10 backdrop-blur-xl border rounded-lg transition-all duration-300',
    'group'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  // Variant classes
  const variantClasses = {
    default: [
      'border-gray-700/30',
      props.hoverable ? 'hover:bg-glass-white/20 hover:border-gray-600/50' : ''
    ],
    gradient: [
      'bg-gradient-to-br from-cyber-purple/10 to-cyber-pink/10',
      'border-cyber-purple/30',
      props.hoverable ? 'hover:from-cyber-purple/20 hover:to-cyber-pink/20' : ''
    ],
    outline: [
      'bg-transparent border-2 border-cyber-purple/50',
      props.hoverable ? 'hover:bg-cyber-purple/10 hover:border-cyber-purple' : ''
    ],
    glass: [
      'bg-glass-white/5 border-glass-white/10',
      'backdrop-blur-2xl',
      props.hoverable ? 'hover:bg-glass-white/15' : ''
    ]
  }

  // Interactive classes
  const interactiveClass = props.clickable 
    ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' 
    : ''

  // Shadow classes
  const shadowClass = props.hoverable 
    ? 'shadow-lg hover:shadow-cyber-lg' 
    : 'shadow-lg'

  return [
    ...baseClass,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    interactiveClass,
    shadowClass
  ].filter(Boolean).join(' ')
})

const contentClass = computed(() => {
  const hasHeader = props.title || props.icon
  const hasFooter = !!document.querySelector('slot[name="footer"]')
  
  return [
    hasHeader ? 'pt-0' : '',
    hasFooter ? 'pb-0' : ''
  ].filter(Boolean).join(' ')
})

const iconBgClass = computed(() => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-cyber-purple to-purple-600',
    secondary: 'bg-gradient-to-br from-gray-500 to-gray-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600'
  }
  return colorClasses[props.iconColor]
})

const glowClass = computed(() => {
  const glowColors = {
    primary: 'shadow-[0_0_30px_rgba(99,102,241,0.3)]',
    secondary: 'shadow-[0_0_30px_rgba(107,114,128,0.3)]',
    success: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
    warning: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]',
    danger: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
    info: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
  }
  return glowColors[props.iconColor]
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.cyber-card-container {
  position: relative;
  /* GPU 加速优化 */
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: auto;
  /* 渲染隔离优化 */
  contain: layout style paint;
}

/* 悬停时启用 will-change */
.cyber-card-container:hover {
  will-change: transform, opacity;
}

.cyber-card-header {
  @apply pb-4 mb-4 border-b border-gray-700/30;
}

.cyber-card-content {
  @apply flex-1;
}

.cyber-card-footer {
  @apply pt-4 mt-4 border-t border-gray-700/30;
}

/* 优化后的发光动画 - 使用 GPU 加速 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    transform: translateZ(0) scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.8);
    transform: translateZ(0) scale(1.001);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
  will-change: transform, box-shadow;
}
</style>