<template>
  <div class="cyber-input-container" :class="containerClass">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-400 ml-1">*</span>
    </label>
    
    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div
        v-if="leftIcon"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
      >
        <Icon :icon="leftIcon" class="w-5 h-5 text-gray-400" />
      </div>
      
      <!-- Input Element -->
      <component
        :is="inputComponent"
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :cols="cols"
        :class="inputClass"
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup.enter="$emit('enter', $event)"
      />
      
      <!-- Right Icon / Action -->
      <div
        v-if="rightIcon || showPassword || clearable"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2"
      >
        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue"
          @click="handleClear"
          class="p-1 rounded-full hover:bg-gray-700/30 transition-colors"
        >
          <Icon icon="mdi:close" class="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
        
        <!-- Password Toggle -->
        <button
          v-if="showPassword"
          @click="togglePasswordVisibility"
          class="p-1 rounded-full hover:bg-gray-700/30 transition-colors"
        >
          <Icon 
            :icon="isPasswordVisible ? 'mdi:eye-off' : 'mdi:eye'" 
            class="w-4 h-4 text-gray-400 hover:text-white" 
          />
        </button>
        
        <!-- Right Icon -->
        <Icon
          v-if="rightIcon"
          :icon="rightIcon"
          class="w-5 h-5 text-gray-400"
        />
      </div>
      
      <!-- Loading Spinner -->
      <div
        v-if="loading"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <div class="w-4 h-4 border-2 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
    
    <!-- Helper Text / Error -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-1"
      leave-to-class="opacity-0 translate-y-1"
    >
      <p
        v-if="helperText || error"
        class="mt-2 text-sm"
        :class="error ? 'text-red-400' : 'text-gray-400'"
      >
        {{ error || helperText }}
      </p>
    </Transition>
    
    <!-- Character Count -->
    <div
      v-if="maxLength && showCount"
      class="mt-1 text-xs text-gray-500 text-right"
    >
      {{ String(modelValue || '').length }} / {{ maxLength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date'
  label?: string
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  leftIcon?: string
  rightIcon?: string
  clearable?: boolean
  loading?: boolean
  variant?: 'default' | 'outline' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  multiline?: boolean
  rows?: number
  cols?: number
  maxLength?: number
  showCount?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  variant: 'default',
  size: 'md',
  rows: 3,
  showCount: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  enter: [event: KeyboardEvent]
  clear: []
}>()

const isFocused = ref(false)
const isPasswordVisible = ref(false)

const inputId = computed(() => `cyber-input-${Math.random().toString(36).substr(2, 9)}`)

const inputComponent = computed(() => {
  return props.multiline ? 'textarea' : 'input'
})

const showPassword = computed(() => {
  return props.type === 'password'
})

const actualType = computed(() => {
  if (props.type === 'password') {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const containerClass = computed(() => {
  return [
    'cyber-input-container',
    props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  ].filter(Boolean).join(' ')
})

const inputClass = computed(() => {
  const baseClass = [
    'w-full bg-glass-white/10 backdrop-blur-xl border rounded-lg',
    'text-white placeholder-gray-400 transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-0'
  ]

  // Size classes
  const sizeClasses = {
    sm: props.multiline ? 'px-3 py-2 text-sm' : 'px-3 py-2 text-sm h-9',
    md: props.multiline ? 'px-4 py-3 text-base' : 'px-4 py-3 text-base h-11',
    lg: props.multiline ? 'px-5 py-4 text-lg' : 'px-5 py-4 text-lg h-13'
  }

  // Variant classes
  const variantClasses = {
    default: [
      'border-gray-700/30',
      isFocused.value 
        ? 'border-cyber-purple bg-glass-white/20' 
        : 'hover:border-gray-600/50',
      'focus:border-cyber-purple focus:ring-cyber-purple/20'
    ],
    outline: [
      'border-2 border-cyber-purple/50 bg-transparent',
      isFocused.value 
        ? 'border-cyber-purple bg-cyber-purple/5' 
        : 'hover:border-cyber-purple/70',
      'focus:border-cyber-purple focus:ring-cyber-purple/20'
    ],
    filled: [
      'border-transparent bg-gray-700/30',
      isFocused.value 
        ? 'bg-gray-700/50 ring-2 ring-cyber-purple' 
        : 'hover:bg-gray-700/40',
      'focus:ring-cyber-purple'
    ]
  }

  // Error state
  const errorClass = props.error ? [
    'border-red-500 bg-red-500/5',
    'focus:border-red-500 focus:ring-red-500/20'
  ] : []

  // Padding adjustments for icons
  const paddingClass = []
  if (props.leftIcon) {
    paddingClass.push('pl-10')
  }
  if (props.rightIcon || props.clearable || showPassword.value || props.loading) {
    paddingClass.push('pr-10')
  }

  // Disabled state
  const disabledClass = props.disabled ? [
    'cursor-not-allowed opacity-50'
  ] : []

  return [
    ...baseClass,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    ...errorClass,
    ...paddingClass,
    ...disabledClass
  ].filter(Boolean).join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let value: string | number = target.value

  // Handle number type
  if (props.type === 'number') {
    value = (target as HTMLInputElement).valueAsNumber || 0
  }

  // Handle maxLength for textarea (HTML maxlength doesn't work on textarea)
  if (props.multiline && props.maxLength) {
    value = String(value).slice(0, props.maxLength)
    target.value = String(value)
  }

  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  
  // Focus input after clear
  nextTick(() => {
    const input = document.getElementById(inputId.value)
    if (input) {
      input.focus()
    }
  })
}

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea.cyber-input {
  resize: vertical;
  min-height: 80px;
}

textarea.cyber-input::-webkit-scrollbar {
  width: 6px;
}

textarea.cyber-input::-webkit-scrollbar-track {
  background: transparent;
}

textarea.cyber-input::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

textarea.cyber-input::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}
</style>