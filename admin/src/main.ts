import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

import App from './App.vue'
import router from './router'

// Styles
import './assets/styles/main.css'

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

// Global properties
app.config.globalProperties.$version = '1.0.0'

// Error handling
app.config.errorHandler = (error, vm, info) => {
  console.error('Global error:', error, info)
}

// Mount app
app.mount('#app')

console.log(
  '%c🎵 AI Music Platform Admin Dashboard %c v1.0.0 ',
  'background: linear-gradient(90deg, #6366f1, #8b5cf6); color: white; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
  'background: linear-gradient(90deg, #8b5cf6, #ec4899); color: white; padding: 4px 8px; border-radius: 0 4px 4px 0; font-weight: bold;'
)