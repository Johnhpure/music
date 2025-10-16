<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">用户分析</h1>
        <p class="text-gray-400 mt-1">用户行为数据分析和增长趋势</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="refreshData"
          :loading="loading"
        >
          刷新数据
        </CyberButton>
      </div>
    </div>

    <!-- User Growth Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总用户数"
        :value="userStats.totalUsers.toLocaleString()"
        change="+8.2%"
        trend="up"
        icon="mdi:account-group"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="新增用户"
        :value="userStats.newUsers.toLocaleString()"
        change="+15.6%"
        trend="up"
        icon="mdi:account-plus"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="活跃用户"
        :value="userStats.activeUsers.toLocaleString()"
        change="+12.3%"
        trend="up"
        icon="mdi:account-check"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="用户留存率"
        :value="`${userStats.retentionRate}%`"
        change="+2.1%"
        trend="up"
        icon="mdi:account-heart"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- User Growth Trends -->
    <CyberCard title="用户增长趋势" :delay="400">
      <div class="h-80 flex items-center justify-center">
        <div class="text-center">
          <Icon icon="mdi:chart-line" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-400 mb-2">图表功能开发中</h3>
          <p class="text-gray-500">详细的增长趋势图表即将推出...</p>
        </div>
      </div>
    </CyberCard>

    <!-- User Distribution and Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Distribution -->
      <CyberCard title="用户分布" :delay="500">
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-semibold text-white mb-4">用户类型分布</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 rounded bg-blue-500"></div>
                  <span class="text-gray-300">普通用户</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">12,890</span>
                  <span class="text-gray-400 text-sm">(82.2%)</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 rounded bg-yellow-500"></div>
                  <span class="text-gray-300">VIP用户</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">2,456</span>
                  <span class="text-gray-400 text-sm">(15.7%)</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-4 h-4 rounded bg-red-500"></div>
                  <span class="text-gray-300">管理员</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">332</span>
                  <span class="text-gray-400 text-sm">(2.1%)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-lg font-semibold text-white mb-4">注册来源分布</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Icon icon="mdi:wechat" class="w-4 h-4 text-green-400" />
                  <span class="text-gray-300">微信小程序</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">9,876</span>
                  <span class="text-gray-400 text-sm">(63.0%)</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Icon icon="mdi:web" class="w-4 h-4 text-blue-400" />
                  <span class="text-gray-300">网页注册</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">3,421</span>
                  <span class="text-gray-400 text-sm">(21.8%)</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Icon icon="mdi:cellphone" class="w-4 h-4 text-purple-400" />
                  <span class="text-gray-300">手机APP</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-white font-medium">2,381</span>
                  <span class="text-gray-400 text-sm">(15.2%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CyberCard>

      <!-- User Activity -->
      <CyberCard title="用户活跃度" :delay="600">
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-semibold text-white mb-4">最近活跃用户</h4>
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div 
                v-for="user in activeUsers" 
                :key="user.id"
                class="flex items-center justify-between p-3 bg-glass-white/5 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    :class="[
                      user.userType === 'vip' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      user.userType === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    ]"
                  >
                    <Icon 
                      :icon="user.userType === 'vip' ? 'mdi:crown' : 
                             user.userType === 'admin' ? 'mdi:shield-account' : 
                             'mdi:account'"
                      class="w-4 h-4"
                    />
                  </div>
                  <div>
                    <div class="text-white font-medium">{{ user.username }}</div>
                    <div class="text-xs text-gray-400">{{ user.lastActivity }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-cyber-purple font-medium">{{ user.activityScore }}</span>
                  <span class="text-xs text-gray-400">活跃度</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>

    <!-- User Engagement Metrics -->
    <CyberCard title="用户参与度指标" :delay="700">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-cyber-purple mb-2">12:34</div>
          <div class="text-sm text-gray-400">平均会话时长</div>
          <div class="text-xs text-green-400 mt-1">+5.2% 较上期</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-cyber-blue mb-2">3.2</div>
          <div class="text-sm text-gray-400">人均生成次数</div>
          <div class="text-xs text-green-400 mt-1">+12.8% 较上期</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-green-400 mb-2">28.7%</div>
          <div class="text-sm text-gray-400">日活跃率</div>
          <div class="text-xs text-yellow-400 mt-1">-1.3% 较上期</div>
        </div>
        
        <div class="text-center">
          <div class="text-3xl font-bold text-yellow-400 mb-2">65.3%</div>
          <div class="text-sm text-gray-400">周留存率</div>
          <div class="text-xs text-green-400 mt-1">+3.7% 较上期</div>
        </div>
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

// State
const loading = ref(false)

// Data
const userStats = ref({
  totalUsers: 15678,
  newUsers: 1234,
  activeUsers: 8945,
  retentionRate: 73.2
})

const activeUsers = ref([
  { id: 1, username: '音乐达人001', userType: 'vip', lastActivity: '5分钟前', activityScore: 95 },
  { id: 2, username: '创作者小王', userType: 'free', lastActivity: '12分钟前', activityScore: 87 },
  { id: 3, username: '管理员张三', userType: 'admin', lastActivity: '23分钟前', activityScore: 92 },
  { id: 4, username: '音乐爱好者', userType: 'vip', lastActivity: '35分钟前', activityScore: 78 },
  { id: 5, username: '新手用户', userType: 'free', lastActivity: '1小时前', activityScore: 65 }
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('User analytics data refreshed')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>