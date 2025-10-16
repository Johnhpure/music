<template>
  <div
    class="cyber-card-container"
    :class="containerClass"
    v-bind="motionProps"
    @click="handleClick"
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
      v-if="loading"
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        class="absolute inset-0 bg-cyber-dark/80 rounded-lg flex items-center justify-center"
        :class="isChrome ? 'disable-in-chrome' : 'backdrop-blur-sm'"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="w-8 h-8 border-2 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
          <p class="text-sm text-gray-400">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>
    
    <!-- Hover Glow Effect (仅非Chrome或高优先级) -->
    <div
      v-if="glow && (!isChrome || priority === 'high')"
      class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      :class="glowClass"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useMotion } from '@vueuse/motion'

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
  priority?: 'high' | 'medium' | 'low'
  disableAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  variant: 'default',
  size: 'md',
  hoverable: true,
  loadingText: '加载中...',
  delay: 0,
  priority: 'medium',
  disableAnimation: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 检测是否为Chrome浏览器
const isChrome = computed(() => {
  if (typeof window === 'undefined') return false
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
})

// 动态决定是否使用动画
const shouldUseAnimation = computed(() => {
  if (props.disableAnimation) return false
  if (isChrome.value && props.priority !== 'high') return false
  return true
})

// 动画配置 - 使用v-bind代替v-motion指令
const motionProps = computed(() => {
  if (!shouldUseAnimation.value) return {}
  
  return {
    'data-motion-initial': JSON.stringify({ opacity: 0, y: 10 }),
    'data-motion-enter': JSON.stringify({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 300, 
        delay: props.delay,
        ease: 'easeOut'
      } 
    })
  }
})

// 如果需要动画，手动初始化
let motionInstance: any = null

onMounted(() => {
  if (shouldUseAnimation.value) {
    // 延迟加载动画，避免初始渲染阻塞
    requestIdleCallback(() => {
      const element = document.querySelector('.cyber-card-container')
      if (element && window.motionOne) {
        // 使用更轻量的动画库或CSS动画
        element.classList.add('motion-enter')
      }
    }, { timeout: 100 })
  }
})

onUnmounted(() => {
  // 清理动画实例
  if (motionInstance) {
    motionInstance.stop()
    motionInstance = null
  }
})

const containerClass = computed(() => {
  const baseClass = [
    'relative bg-glass-white/10 border rounded-lg transition-all duration-300',
    'group',
    isChrome.value ? 'chrome-optimized' : 'backdrop-blur-xl'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  // Variant classes - 针对Chrome优化
  const variantClasses = {
    default: [
      'border-gray-700/30',
      props.hoverable && !isChrome.value ? 'hover:bg-glass-white/20 hover:border-gray-600/50' : '',
      props.hoverable && isChrome.value ? 'hover:border-gray-600/50' : ''
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
      isChrome.value ? 'bg-cyber-dark/95' : 'bg-glass-white/5',
      'border-glass-white/10',
      !isChrome.value ? 'backdrop-blur-2xl' : '',
      props.hoverable && !isChrome.value ? 'hover:bg-glass-white/15' : ''
    ]
  }

  // Interactive classes
  const interactiveClass = props.clickable 
    ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]' 
    : ''

  // Shadow classes - Chrome优化
  const shadowClass = props.hoverable && !isChrome.value
    ? 'shadow-lg hover:shadow-cyber-lg' 
    : 'shadow-md'

  return [
    baseClass,
    sizeClasses[props.size],
    variantClasses[props.variant],
    interactiveClass,
    shadowClass
  ].flat().filter(Boolean).join(' ')
})

const iconBgClass = computed(() => {
  const colors = {
    primary: 'bg-gradient-to-br from-cyber-purple to-purple-600',
    secondary: 'bg-gradient-to-br from-gray-600 to-gray-700',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
    info: 'bg-gradient-to-br from-cyber-blue to-blue-600'
  }
  
  return colors[props.iconColor]
})

const contentClass = computed(() => {
  return props.variant === 'glass' ? 'relative z-10' : ''
})

const glowClass = computed(() => {
  const glows = {
    primary: 'bg-gradient-to-r from-cyber-purple/20 to-purple-600/20 blur-xl',
    secondary: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 blur-xl',
    success: 'bg-gradient-to-r from-green-500/20 to-green-600/20 blur-xl',
    warning: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 blur-xl',
    danger: 'bg-gradient-to-r from-red-500/20 to-red-600/20 blur-xl',
    info: 'bg-gradient-to-r from-cyber-blue/20 to-blue-600/20 blur-xl'
  }
  
  return glows[props.iconColor] || glows.primary
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础样式 */
.cyber-card-header {
  @apply pb-4 mb-4 border-b border-gray-700/20;
}

.cyber-card-footer {
  @apply pt-4 mt-4 border-t border-gray-700/20;
}

/* Chrome优化的动画 */
.chrome-optimized {
  transform: translateZ(0);
  will-change: transform;
  contain: layout style paint;
}

/* 轻量级进入动画 */
.motion-enter {
  animation: card-enter 0.3s ease-out forwards;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 禁用Chrome中的模糊效果 */
@supports (-webkit-appearance: none) and (not (-moz-appearance: none)) {
  .disable-in-chrome {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
</style>
