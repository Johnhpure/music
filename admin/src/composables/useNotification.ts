/**
 * Notification composable
 * Provides a simple notification system using browser notifications
 * You can replace this with a UI library notification system if available
 */

import { ref } from 'vue'

export interface NotificationOptions {
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const notifications = ref<NotificationOptions[]>([])

export function useNotification() {
  const showNotification = (options: NotificationOptions) => {
    const notification = {
      ...options,
      duration: options.duration || 3000,
      type: options.type || 'info'
    }
    
    notifications.value.push(notification)
    
    // Auto remove after duration
    setTimeout(() => {
      const index = notifications.value.indexOf(notification)
      if (index > -1) {
        notifications.value.splice(index, 1)
      }
    }, notification.duration)
    
    // Also log to console
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }[notification.type]
    
    console.log(`${emoji} ${notification.title}: ${notification.message}`)
  }

  const showSuccess = (message: string, title = '成功') => {
    showNotification({ title, message, type: 'success' })
  }

  const showError = (message: string, title = '错误') => {
    showNotification({ title, message, type: 'error' })
  }

  const showWarning = (message: string, title = '警告') => {
    showNotification({ title, message, type: 'warning' })
  }

  const showInfo = (message: string, title = '提示') => {
    showNotification({ title, message, type: 'info' })
  }

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
