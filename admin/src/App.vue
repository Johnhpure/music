<template>
  <div 
    id="app" 
    class="min-h-screen bg-cyber-dark text-white"
    :class="{ 'overflow-hidden': isLoading }"
  >
    <!-- Loading Screen -->
    <Transition
      enter-active-class="transition-opacity duration-500"
      leave-active-class="transition-opacity duration-500"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <LoadingScreen v-if="isLoading" />
    </Transition>
    
    <!-- Main App -->
    <router-view v-if="!isLoading" v-slot="{ Component }">
      <Transition
        enter-active-class="transition-all duration-700 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="opacity-0 scale-95"
        leave-to-class="opacity-0 scale-105"
      >
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoadingScreen from '@/components/LoadingScreen.vue'

const router = useRouter()
const isLoading = ref(true)

// Simulate app initialization
onMounted(async () => {
  try {
    // Initialize app (check auth, load config, etc.)
    await initializeApp()
  } catch (error) {
    console.error('App initialization failed:', error)
  } finally {
    // Minimum loading time for smooth UX
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  }
})

async function initializeApp() {
  // Simulate initialization tasks
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Add your initialization logic here:
  // - Check authentication
  // - Load user preferences
  // - Initialize stores
  // - Load system configuration
  
  console.log('🚀 App initialized successfully')
}

// Handle route changes
router.beforeEach((to, from, next) => {
  // Add route guards here if needed
  next()
})
</script>

<style scoped>
/* Custom app-level styles can go here */
</style>