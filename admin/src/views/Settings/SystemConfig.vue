<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">系统配置</h1>
        <p class="text-gray-400 mt-1">管理系统基础配置和参数</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="refreshData"
        >
          刷新
        </CyberButton>
        
        <CyberButton
          left-icon="mdi:content-save"
          @click="saveConfig"
        >
          保存配置
        </CyberButton>
      </div>
    </div>

    <!-- Coming Soon Message -->
    <CyberCard title="系统配置功能">
      <div class="text-center py-12">
        <Icon icon="mdi:cog-outline" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">功能开发中</h3>
        <p class="text-gray-500">
          系统配置功能正在开发中，敬请期待...
        </p>
      </div>
    </CyberCard>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'

const refreshData = () => {
  console.log('Refreshing system config...')
}

const saveConfig = () => {
  console.log('Saving system config...')
}
</script>