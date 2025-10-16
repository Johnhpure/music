<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Left Section: Title & Breadcrumb -->
    <div class="flex-1">
      <!-- Breadcrumb -->
      <nav v-if="breadcrumb.length > 1" class="mb-2">
        <ol class="flex items-center space-x-2 text-sm">
          <li
            v-for="(item, index) in breadcrumb"
            :key="item.path"
            class="flex items-center"
          >
            <!-- Breadcrumb Item -->
            <router-link
              v-if="!item.active && item.path"
              :to="item.path"
              class="text-gray-400 hover:text-white transition-colors"
            >
              {{ item.name }}
            </router-link>
            <span
              v-else
              class="text-cyber-purple font-medium"
            >
              {{ item.name }}
            </span>
            
            <!-- Separator -->
            <Icon
              v-if="index < breadcrumb.length - 1"
              icon="mdi:chevron-right"
              class="w-4 h-4 text-gray-500 mx-2"
            />
          </li>
        </ol>
      </nav>
      
      <!-- Page Title -->
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-white">
          {{ title }}
        </h1>
        
        <!-- Optional Badge -->
        <span
          v-if="badge"
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="getBadgeClass(badge.type)"
        >
          {{ badge.text }}
        </span>
      </div>
      
      <!-- Optional Description -->
      <p v-if="description" class="mt-1 text-gray-400 text-sm">
        {{ description }}
      </p>
    </div>
    
    <!-- Right Section: Actions -->
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface BreadcrumbItem {
  name: string
  path?: string
  active?: boolean
}

interface Badge {
  text: string
  type: 'success' | 'warning' | 'error' | 'info' | 'primary'
}

interface Props {
  title: string
  description?: string
  breadcrumb?: BreadcrumbItem[]
  badge?: Badge
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumb: () => []
})

const getBadgeClass = (type: string) => {
  const classes = {
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    primary: 'bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30'
  }
  return classes[type as keyof typeof classes] || classes.info
}
</script>