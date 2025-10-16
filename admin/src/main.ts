import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'

// Styles
import './assets/styles/main.css'

// Create Vue app
const app = createApp(App)

// 启用性能追踪（仅开发环境）
if (import.meta.env.DEV) {
  app.config.performance = true
  console.log('✅ 性能追踪已启用 - 请在 Chrome DevTools Performance 面板查看')
}

// Use plugins
app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

// Global properties
app.config.globalProperties.$version = '1.0.0'

// Error handling
app.config.errorHandler = (error, vm, info) => {
  console.error('Global error:', error, info)
  
  // 生产环境可以发送错误到监控服务
  if (import.meta.env.PROD) {
    // TODO: 发送到错误监控服务（如 Sentry）
    // sendToErrorTracking(error, info)
  }
}

// 性能监控：首次内容渲染和最大内容渲染
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('📊 LCP (最大内容渲染):', entry.startTime.toFixed(2), 'ms')
      }
      if (entry.entryType === 'first-contentful-paint') {
        console.log('📊 FCP (首次内容渲染):', entry.startTime.toFixed(2), 'ms')
      }
    }
  })
  
  try {
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint', 'paint'] })
  } catch (e) {
    // 某些浏览器可能不支持所有类型
  }
}

// Mount app
app.mount('#app')

console.log(
  '%c🎵 AI Music Platform Admin Dashboard %c v1.0.0 ',
  'background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
  'background: linear-gradient(90deg, #8b5cf6, #ec4899); color: white; padding: 4px 8px; border-radius: 0 4px 4px 0; font-weight: bold;'
)