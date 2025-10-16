<template>
  <div
    class="activity-item flex items-start space-x-4 p-4 rounded-lg hover:bg-glass-white/5 transition-all duration-300 group"
    v-motion
    :initial="{ opacity: 0, x: -20 }"
    :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: delay } }"
  >
    <!-- Icon -->
    <div 
      class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
      :class="iconBgClass"
    >
      <Icon :icon="activity.icon" class="w-5 h-5 text-white" />
    </div>
    
    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-white mb-1 group-hover:text-cyber-purple transition-colors">
            {{ activity.title }}
          </h4>
          <p class="text-sm text-gray-400 leading-relaxed">
            {{ activity.description }}
          </p>
        </div>
        
        <!-- Time -->
        <div class="flex-shrink-0 ml-4">
          <span class="text-xs text-gray-500">
            {{ activity.time }}
          </span>
        </div>
      </div>
      
      <!-- Action Buttons (if any) -->
      <div v-if="activity.actions" class="mt-3 flex items-center space-x-2">
        <button
          v-for="action in activity.actions"
          :key="action.label"
          @click="handleAction(action)"
          class="text-xs px-3 py-1 rounded-full border transition-all duration-200"
          :class="getActionClass(action.type)"
        >
          {{ action.label }}
        </button>
      </div>
      
      <!-- Tags (if any) -->
      <div v-if="activity.tags" class="mt-2 flex items-center space-x-2">
        <span
          v-for="tag in activity.tags"
          :key="tag"
          class="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-700/30 text-gray-300"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    
    <!-- Status Indicator -->
    <div
      v-if="activity.status"
      class="flex-shrink-0"
    >
      <div 
        class="w-2 h-2 rounded-full"
        :class="getStatusClass(activity.status)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface ActivityAction {
  label: string
  type: 'primary' | 'secondary' | 'danger'
  handler: () => void
}

interface Activity {
  type: string
  title: string
  description: string
  time: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  status?: 'pending' | 'completed' | 'failed'
  actions?: ActivityAction[]
  tags?: string[]
}

interface Props {
  activity: Activity
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  delay: 0
})

const emit = defineEmits<{
  action: [action: ActivityAction]
}>()

const iconBgClass = computed(() => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-cyber-purple/20 to-purple-600/20 border border-cyber-purple/30',
    success: 'bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30',
    warning: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30',
    danger: 'bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30',
    info: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
  }
  return colorClasses[props.activity.color]
})

const getStatusClass = (status: string) => {
  const statusClasses = {
    pending: 'bg-yellow-400 animate-pulse',
    completed: 'bg-green-400',
    failed: 'bg-red-400'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-400'
}

const getActionClass = (type: string) => {
  const actionClasses = {
    primary: 'border-cyber-purple text-cyber-purple hover:bg-cyber-purple hover:text-white',
    secondary: 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white',
    danger: 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'
  }
  return actionClasses[type as keyof typeof actionClasses] || actionClasses.secondary
}

const handleAction = (action: ActivityAction) => {
  action.handler()
  emit('action', action)
}
</script>

<style scoped>
.activity-item {
  position: relative;
}

.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.5), transparent);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.activity-item:hover::before {
  opacity: 1;
}

/* Custom pulse animation for pending status */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>