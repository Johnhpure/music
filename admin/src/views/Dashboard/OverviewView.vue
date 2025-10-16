<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="relative overflow-hidden">
      <CyberCard
        variant="gradient"
        class="relative"
        :delay="0"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">
              欢迎回来，管理员 👋
            </h1>
            <p class="text-gray-300 text-lg">
              今天是 {{ formatDate(new Date()) }}，让我们看看平台的运行情况
            </p>
          </div>
          <div class="hidden lg:block">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-cyber-purple/20 to-cyber-pink/20 flex items-center justify-center">
              <Icon icon="mdi:chart-line" class="w-16 h-16 text-cyber-purple" />
            </div>
          </div>
        </div>
        
        <!-- Floating particles background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute w-2 h-2 bg-cyber-purple/30 rounded-full animate-float" style="top: 20%; left: 10%; animation-delay: 0s;"></div>
          <div class="absolute w-1 h-1 bg-cyber-pink/40 rounded-full animate-float" style="top: 60%; left: 80%; animation-delay: 1s;"></div>
          <div class="absolute w-1.5 h-1.5 bg-cyber-cyan/30 rounded-full animate-float" style="top: 80%; left: 20%; animation-delay: 2s;"></div>
        </div>
      </CyberCard>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        v-for="(stat, index) in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :trend="stat.trend"
        :icon="stat.icon"
        :color="stat.color"
        :delay="index * 100"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Growth Chart -->
      <CyberCard
        title="用户增长趋势"
        subtitle="最近30天用户注册情况"
        icon="mdi:account-multiple-plus"
        icon-color="primary"
        :delay="400"
      >
        <template #actions>
          <select class="bg-glass-white/10 border border-gray-700/30 rounded-lg px-3 py-1 text-sm text-white">
            <option value="30">30天</option>
            <option value="7">7天</option>
            <option value="90">90天</option>
          </select>
        </template>
        
        <div class="h-80">
          <UserGrowthChart :data="userGrowthData" />
        </div>
      </CyberCard>

      <!-- Content Analytics -->
      <CyberCard
        title="内容分析"
        subtitle="各类内容的使用情况"
        icon="mdi:chart-donut"
        icon-color="success"
        :delay="500"
      >
        <div class="h-80">
          <ContentAnalyticsChart :data="contentAnalyticsData" />
        </div>
      </CyberCard>
    </div>

    <!-- Activity Feed & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2">
        <CyberCard
          title="最近活动"
          subtitle="系统最新动态"
          icon="mdi:timeline"
          icon-color="info"
          :delay="600"
        >
          <template #actions>
            <CyberButton size="sm" variant="ghost" left-icon="mdi:refresh">
              刷新
            </CyberButton>
          </template>
          
          <div class="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            <ActivityItem
              v-for="(activity, index) in recentActivities"
              :key="index"
              :activity="activity"
              :delay="700 + index * 50"
            />
          </div>
        </CyberCard>
      </div>

      <!-- Quick Actions -->
      <CyberCard
        title="快速操作"
        subtitle="常用功能快捷入口"
        icon="mdi:lightning-bolt"
        icon-color="warning"
        :delay="700"
      >
        <div class="space-y-3">
          <CyberButton
            v-for="action in quickActions"
            :key="action.name"
            :left-icon="action.icon"
            variant="outline"
            size="sm"
            class="w-full justify-start"
            @click="handleQuickAction(action)"
          >
            {{ action.name }}
          </CyberButton>
        </div>
      </CyberCard>
    </div>

    <!-- System Status -->
    <CyberCard
      title="系统状态"
      subtitle="服务运行状况监控"
      icon="mdi:server"
      icon-color="success"
      :delay="800"
    >
      <template #actions>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-sm text-green-300">所有服务正常</span>
        </div>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemStatusItem
          v-for="(service, index) in systemServices"
          :key="service.name"
          :service="service"
          :delay="900 + index * 100"
        />
      </div>
    </CyberCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import StatsCard from './components/StatsCard.vue'
import UserGrowthChart from './components/UserGrowthChart.vue'
import ContentAnalyticsChart from './components/ContentAnalyticsChart.vue'
import ActivityItem from './components/ActivityItem.vue'
import SystemStatusItem from './components/SystemStatusItem.vue'

const router = useRouter()

// Stats data
const stats = ref([
  {
    title: '总用户数',
    value: '12,847',
    change: '+12.5%',
    trend: 'up' as const,
    icon: 'mdi:account-group',
    color: 'primary' as const
  },
  {
    title: '音乐作品',
    value: '3,421',
    change: '+8.2%',
    trend: 'up' as const,
    icon: 'mdi:music-note',
    color: 'success' as const
  },
  {
    title: '今日活跃',
    value: '1,267',
    change: '-2.1%',
    trend: 'down' as const,
    icon: 'mdi:pulse',
    color: 'warning' as const
  },
  {
    title: '总收入',
    value: '¥24,580',
    change: '+15.3%',
    trend: 'up' as const,
    icon: 'mdi:currency-cny',
    color: 'info' as const
  }
])

// Chart data
const userGrowthData = ref({
  labels: Array.from({ length: 30 }, (_, i) => `${i + 1}日`),
  datasets: [{
    label: '新增用户',
    data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 20),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    tension: 0.4
  }]
})

const contentAnalyticsData = ref({
  labels: ['提示词模板', 'Banner轮播', '热门推荐', '用户作品'],
  datasets: [{
    data: [35, 25, 20, 20],
    backgroundColor: [
      'rgba(99, 102, 241, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)'
    ],
    borderWidth: 0
  }]
})

// Activity data
const recentActivities = ref([
  {
    id: '1',
    type: 'user' as const,
    title: '新用户注册',
    description: 'user_12847 完成注册',
    time: '2分钟前',
    icon: 'mdi:account-plus',
    color: 'success' as const
  },
  {
    id: '2',
    type: 'content' as const,
    title: '内容审核',
    description: '音乐作品 "夏日回忆" 已通过审核',
    time: '5分钟前',
    icon: 'mdi:check-circle',
    color: 'primary' as const
  },
  {
    id: '3',
    type: 'system' as const,
    title: '系统更新',
    description: 'AI模型配置已更新',
    time: '10分钟前',
    icon: 'mdi:cog',
    color: 'info' as const
  },
  {
    id: '4',
    type: 'alert' as const,
    title: '存储警告',
    description: '存储使用率达到85%',
    time: '1小时前',
    icon: 'mdi:alert-circle',
    color: 'warning' as const
  }
])

// Quick actions
const quickActions = ref([
  { name: '创建Banner', icon: 'mdi:image-plus', action: 'create-banner' },
  { name: '添加提示词', icon: 'mdi:lightbulb-plus', action: 'create-prompt' },
  { name: '用户管理', icon: 'mdi:account-cog', action: 'manage-users' },
  { name: '系统设置', icon: 'mdi:cog', action: 'system-settings' },
  { name: '数据导出', icon: 'mdi:download', action: 'export-data' }
])

// System services
const systemServices = ref([
  {
    name: 'API服务',
    status: 'healthy' as const,
    uptime: '99.9%',
    responseTime: '120ms',
    lastCheck: new Date().toISOString()
  },
  {
    name: '数据库',
    status: 'healthy' as const,
    uptime: '100%',
    responseTime: '45ms',
    lastCheck: new Date().toISOString()
  },
  {
    name: 'Redis缓存',
    status: 'healthy' as const,
    uptime: '99.8%',
    responseTime: '12ms',
    lastCheck: new Date().toISOString()
  },
  {
    name: 'AI服务',
    status: 'warning' as const,
    uptime: '98.2%',
    responseTime: '350ms',
    lastCheck: new Date().toISOString()
  }
])

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'create-banner':
      router.push('/content/banners')
      break
    case 'create-prompt':
      router.push('/content/prompts')
      break
    case 'manage-users':
      router.push('/users')
      break
    case 'system-settings':
      router.push('/settings/system')
      break
    case 'export-data':
      // Handle data export
      console.log('Export data clicked')
      break
  }
}

// Load data on mount
onMounted(async () => {
  // TODO: Load real data from API
  console.log('Dashboard mounted, loading data...')
})
</script>

<style scoped>
/* Custom animations for floating particles */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>