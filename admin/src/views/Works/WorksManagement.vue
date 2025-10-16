<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">作品管理</h1>
        <p class="text-gray-400 mt-1">管理用户创作的音乐作品</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="refreshData"
        >
          刷新
        </CyberButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总作品数"
        value="2,468"
        change="+24"
        trend="up"
        icon="mdi:music-note"
        color="primary"
      />
      
      <StatsCard
        title="已发布"
        value="1,856"
        change="+18"
        trend="up"
        icon="mdi:publish"
        color="success"
      />
      
      <StatsCard
        title="审核中"
        value="312"
        change="+6"
        trend="up"
        icon="mdi:clock-outline"
        color="warning"
      />
      
      <StatsCard
        title="被拒绝"
        value="56"
        change="-3"
        trend="down"
        icon="mdi:close-circle"
        color="danger"
      />
    </div>

    <!-- Coming Soon Message -->
    <CyberCard title="作品管理功能">
      <div class="text-center py-12">
        <Icon icon="mdi:tools" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">功能开发中</h3>
        <p class="text-gray-500">
          作品管理功能正在开发中，敬请期待...
        </p>
      </div>
    </CyberCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'

const refreshData = () => {
  console.log('Refreshing works data...')
}
</script>