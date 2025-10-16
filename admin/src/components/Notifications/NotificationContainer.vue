<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-4 max-w-sm">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-full scale-95"
        leave-to-class="opacity-0 translate-x-full scale-95"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="relative overflow-hidden rounded-lg backdrop-blur-xl border shadow-cyber-lg"
          :class="getNotificationClass(notification.type)"
        >
          <!-- Progress Bar -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="absolute top-0 left-0 h-1 bg-current transition-all ease-linear"
            :style="{ 
              width: `${notification.progress}%`,
              transitionDuration: `${notification.duration}ms`
            }"
          ></div>
          
          <!-- Content -->
          <div class="p-4 pr-12">
            <div class="flex items-start space-x-3">
              <!-- Icon -->
              <div class="flex-shrink-0">
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="getIconClass(notification.type)"
                >
                  <Icon 
                    :icon="getIcon(notification.type)" 
                    class="w-4 h-4 text-white"
                  />
                </div>
              </div>
              
              <!-- Message -->
              <div class="flex-1 min-w-0">
                <h4 
                  v-if="notification.title"
                  class="text-sm font-semibold text-white mb-1"
                >
                  {{ notification.title }}
                </h4>
                <p class="text-sm text-gray-200">
                  {{ notification.message }}
                </p>
                
                <!-- Action Button -->
                <button
                  v-if="notification.action"
                  @click="handleAction(notification)"
                  class="mt-2 text-xs font-medium text-current underline hover:no-underline"
                >
                  {{ notification.action.text }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="removeNotification(notification.id)"
            class="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <Icon icon="mdi:close" class="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

interface NotificationAction {
  text: string
  handler: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: NotificationAction
  progress?: number
}

const notifications = ref<Notification[]>([])

const getNotificationClass = (type: string) => {
  const classes = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIconClass = (type: string) => {
  const classes = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }
  return classes[type as keyof typeof classes] || classes.info
}

const getIcon = (type: string) => {
  const icons = {
    success: 'mdi:check-circle',
    error: 'mdi:close-circle',
    warning: 'mdi:alert-circle',
    info: 'mdi:information'
  }
  return icons[type as keyof typeof icons] || icons.info
}

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = `notification-${Date.now()}-${Math.random()}`
  const duration = notification.duration ?? 5000
  
  const newNotification: Notification = {
    ...notification,
    id,
    duration,
    progress: 100
  }
  
  notifications.value.push(newNotification)
  
  if (duration > 0) {
    // Start progress countdown
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.max(0, 100 - (elapsed / duration) * 100)
      
      const notif = notifications.value.find(n => n.id === id)
      if (notif) {
        notif.progress = progress
      }
      
      if (progress <= 0) {
        clearInterval(interval)
        removeNotification(id)
      }
    }, 16) // ~60fps
  }
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const handleAction = (notification: Notification) => {
  if (notification.action?.handler) {
    notification.action.handler()
    removeNotification(notification.id)
  }
}

// Global notification methods
const notificationMethods = {
  success: (message: string, options?: Partial<Notification>) => {
    addNotification({ type: 'success', message, ...options })
  },
  error: (message: string, options?: Partial<Notification>) => {
    addNotification({ type: 'error', message, duration: 0, ...options })
  },
  warning: (message: string, options?: Partial<Notification>) => {
    addNotification({ type: 'warning', message, ...options })
  },
  info: (message: string, options?: Partial<Notification>) => {
    addNotification({ type: 'info', message, ...options })
  }
}

// Expose methods globally
onMounted(() => {
  // @ts-ignore
  window.$notify = notificationMethods
})

onUnmounted(() => {
  // @ts-ignore
  delete window.$notify
})

// Also provide through provide/inject
import { provide } from 'vue'
provide('notify', notificationMethods)
</script>

<style scoped>
/* Custom styles for progress animation */
</style>