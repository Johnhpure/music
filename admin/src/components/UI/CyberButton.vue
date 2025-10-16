<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :disabled="disabled || loading"
    :class="buttonClass"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-75"
      leave-to-class="opacity-0 scale-75"
    >
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Transition>
    
    <!-- Content -->
    <div
      class="flex items-center justify-center space-x-2 transition-opacity duration-200"
      :class="{ 'opacity-0': loading }"
    >
      <!-- Left Icon -->
      <Icon 
        v-if="leftIcon" 
        :icon="leftIcon" 
        class="w-4 h-4 flex-shrink-0"
      />
      
      <!-- Text Content -->
      <span v-if="$slots.default" class="font-medium">
        <slot />
      </span>
      
      <!-- Right Icon -->
      <Icon 
        v-if="rightIcon" 
        :icon="rightIcon" 
        class="w-4 h-4 flex-shrink-0"
      />
    </div>
    
    <!-- Ripple Effect -->
    <div
      v-if="ripple"
      class="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
    >
      <div
        v-for="rippleEffect in ripples"
        :key="rippleEffect.id"
        class="absolute bg-white/20 rounded-full animate-ping"
        :style="{
          left: `${rippleEffect.x}px`,
          top: `${rippleEffect.y}px`,
          width: `${rippleEffect.size}px`,
          height: `${rippleEffect.size}px`,
          transform: 'translate(-50%, -50%)'
        }"
      ></div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

interface RippleEffect {
  id: number
  x: number
  y: number
  size: number
}

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  leftIcon?: string
  rightIcon?: string
  to?: string
  href?: string
  ripple?: boolean
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  ripple: true,
  glow: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const ripples = ref<RippleEffect[]>([])

const tag = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const buttonClass = computed(() => {
  const baseClass = [
    'relative overflow-hidden inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-dark',
    'transform hover:scale-[1.02] active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-gradient-to-r from-cyber-purple to-purple-600',
      'hover:from-purple-600 hover:to-pink-600',
      'text-white shadow-lg hover:shadow-cyber',
      'focus:ring-cyber-purple'
    ],
    secondary: [
      'bg-gradient-to-r from-gray-600 to-gray-700',
      'hover:from-gray-700 hover:to-gray-800',
      'text-white shadow-lg',
      'focus:ring-gray-500'
    ],
    outline: [
      'bg-transparent border-2 border-cyber-purple',
      'text-cyber-purple hover:bg-cyber-purple hover:text-white',
      'focus:ring-cyber-purple'
    ],
    ghost: [
      'bg-transparent text-gray-300',
      'hover:bg-glass-white/10 hover:text-white',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-gradient-to-r from-red-500 to-red-600',
      'hover:from-red-600 hover:to-red-700',
      'text-white shadow-lg',
      'focus:ring-red-500'
    ],
    success: [
      'bg-gradient-to-r from-green-500 to-green-600',
      'hover:from-green-600 hover:to-green-700',
      'text-white shadow-lg',
      'focus:ring-green-500'
    ]
  }

  // Glow effect
  const glowClass = props.glow ? 'animate-pulse-glow' : ''

  return [
    ...baseClass,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    glowClass
  ].filter(Boolean).join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return

  // Create ripple effect
  if (props.ripple) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const rippleEffect: RippleEffect = {
      id: Date.now(),
      x,
      y,
      size
    }

    ripples.value.push(rippleEffect)

    // Remove ripple after animation
    setTimeout(() => {
      const index = ripples.value.findIndex(r => r.id === rippleEffect.id)
      if (index > -1) {
        ripples.value.splice(index, 1)
      }
    }, 600)
  }

  emit('click', event)
}
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
</style>