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
        @click="handleMaskClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="visible"
            class="relative w-full max-w-md bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <!-- Icon -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center"
                  :class="iconBgClass"
                >
                  <Icon :icon="typeIcon" class="w-5 h-5 text-white" />
                </div>
                
                <!-- Title -->
                <h3 class="text-lg font-semibold text-white">
                  {{ title }}
                </h3>
              </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
              <p class="text-gray-300 leading-relaxed">
                {{ content }}
              </p>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/30">
              <CyberButton
                variant="ghost"
                @click="handleCancel"
                :disabled="loading"
              >
                {{ cancelText }}
              </CyberButton>
              
              <CyberButton
                :variant="confirmVariant"
                @click="handleConfirm"
                :loading="loading"
              >
                {{ confirmText }}
              </CyberButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import CyberButton from './CyberButton.vue'

interface Props {
  visible: boolean
  title: string
  content: string
  type?: 'info' | 'success' | 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
  loading?: boolean
  maskClosable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: '确认',
  cancelText: '取消',
  maskClosable: true
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  confirm: []
  cancel: []
}>()

const typeIcon = computed(() => {
  const icons = {
    info: 'mdi:information',
    success: 'mdi:check-circle',
    warning: 'mdi:alert-circle',
    danger: 'mdi:close-circle'
  }
  return icons[props.type]
})

const iconBgClass = computed(() => {
  const classes = {
    info: 'bg-blue-500/20',
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    danger: 'bg-red-500/20'
  }
  return classes[props.type]
})

const confirmVariant = computed(() => {
  return props.type === 'danger' ? 'danger' : 'primary'
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleMaskClick = () => {
  if (props.maskClosable && !props.loading) {
    handleCancel()
  }
}
</script>