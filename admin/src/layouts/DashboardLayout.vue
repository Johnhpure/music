<template>
  <div class="min-h-screen bg-cyber-dark flex">
    <!-- Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300"
      leave-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
    >
      <Sidebar
        v-show="!isMobile || sidebarOpen"
        :collapsed="sidebarCollapsed"
        @toggle="toggleSidebar"
        @close="closeSidebar"
        class="fixed lg:relative z-30"
      />
    </Transition>
    
    <!-- Mobile Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobile && sidebarOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
        @click="closeSidebar"
      ></div>
    </Transition>
    
    <!-- Main Content -->
    <div 
      class="flex-1 flex flex-col min-w-0 transition-all duration-300"
    >
      <!-- Header -->
      <Header
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="toggleSidebar"
        @toggle-collapse="toggleSidebarCollapse"
        class="sticky top-0 z-10"
      />
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto custom-scrollbar">
        <!-- Page Header -->
        <PageHeader
          :title="pageTitle"
          :breadcrumb="breadcrumb"
          class="mb-6"
        />
        
        <!-- Router View with Transitions -->
        <router-view v-slot="{ Component, route }">
          <Transition
            :name="transitionName"
            mode="out-in"
            @before-enter="onBeforeEnter"
            @after-enter="onAfterEnter"
          >
            <component 
              :is="Component" 
              :key="route.path"
              class="animate-fade-in"
            />
          </Transition>
        </router-view>
      </main>
    </div>
    
    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Navigation/Sidebar.vue'
import Header from '@/components/Navigation/Header.vue'
import PageHeader from '@/components/Navigation/PageHeader.vue'
import NotificationContainer from '@/components/Notifications/NotificationContainer.vue'

// Reactive state
const route = useRoute()
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const transitionName = ref('slide-fade')

// Computed properties
const pageTitle = computed(() => {
  return route.meta?.title as string || '管理控制台'
})

const breadcrumb = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map(item => ({
    name: item.meta?.title as string,
    path: item.path,
    active: item.path === route.path
  }))
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const toggleSidebarCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // Store preference
  localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed.value))
}

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

const onBeforeEnter = () => {
  // Optional: Add any pre-transition logic
}

const onAfterEnter = () => {
  // Optional: Add any post-transition logic
  // Scroll to top after route change
  const mainContent = document.querySelector('main')
  if (mainContent) {
    mainContent.scrollTop = 0
  }
}

// Watch route changes for transitions
watch(() => route.path, (newPath, oldPath) => {
  // Determine transition direction
  const routes = [
    '/dashboard',
    '/content',
    '/users', 
    '/works',
    '/analytics',
    '/settings'
  ]
  
  const newIndex = routes.findIndex(r => newPath.startsWith(r))
  const oldIndex = routes.findIndex(r => oldPath?.startsWith(r))
  
  if (newIndex > oldIndex) {
    transitionName.value = 'slide-left'
  } else if (newIndex < oldIndex) {
    transitionName.value = 'slide-right'
  } else {
    transitionName.value = 'fade'
  }
})

// Lifecycle
onMounted(() => {
  // Initialize responsive state
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // Restore sidebar state
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved) {
    sidebarCollapsed.value = saved === 'true'
  }
  
  // Handle keyboard shortcuts
  const handleKeyboard = (e: KeyboardEvent) => {
    // Ctrl/Cmd + B to toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault()
      toggleSidebarCollapse()
    }
    // Escape to close mobile sidebar
    if (e.key === 'Escape' && isMobile.value && sidebarOpen.value) {
      closeSidebar()
    }
  }
  
  window.addEventListener('keydown', handleKeyboard)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeyboard)
  })
})
</script>

<style scoped>
/* Page Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>