<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">内容分析</h1>
        <p class="text-gray-400 mt-1">音乐内容数据分析和趋势统计</p>
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

    <!-- Content Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总生成次数"
        :value="contentStats.totalGenerations.toLocaleString()"
        change="+23.8%"
        trend="up"
        icon="mdi:music-note-plus"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="成功率"
        :value="`${contentStats.successRate}%`"
        change="+2.3%"
        trend="up"
        icon="mdi:check-circle"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="平均时长"
        :value="contentStats.avgDuration"
        change="+15s"
        trend="up"
        icon="mdi:timer"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="热门风格"
        :value="contentStats.topGenre"
        change="流行音乐"
        trend="neutral"
        icon="mdi:music"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Generation Trends -->
    <CyberCard title="生成趋势分析" :delay="400">
      <div class="h-80 flex items-center justify-center">
        <div class="text-center">
          <Icon icon="mdi:chart-line" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-400 mb-2">图表功能开发中</h3>
          <p class="text-gray-500">详细的生成趋势图表即将推出...</p>
        </div>
      </div>
    </CyberCard>

    <!-- Content Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Genre Distribution -->
      <CyberCard title="音乐风格分布" :delay="500">
        <div class="space-y-4">
          <div 
            v-for="genre in genreDistribution" 
            :key="genre.name"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-3">
              <div 
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: genre.color }"
              ></div>
              <span class="text-gray-300">{{ genre.name }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-500"
                  :style="{ 
                    width: `${genre.percentage}%`,
                    backgroundColor: genre.color
                  }"
                ></div>
              </div>
              <span class="text-white font-medium w-16 text-right">{{ genre.count.toLocaleString() }}</span>
              <span class="text-gray-400 text-sm w-12 text-right">({{ genre.percentage }}%)</span>
            </div>
          </div>
        </div>
      </CyberCard>

      <!-- Quality Metrics -->
      <CyberCard title="质量指标" :delay="600">
        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300">音频质量评分</span>
              <span class="text-2xl font-bold text-cyber-purple">8.7</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-gradient-to-r from-cyber-purple to-cyber-blue h-3 rounded-full" style="width: 87%"></div>
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300">创意度评分</span>
              <span class="text-2xl font-bold text-cyber-blue">7.9</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-gradient-to-r from-cyber-blue to-green-400 h-3 rounded-full" style="width: 79%"></div>
            </div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-300">用户满意度</span>
              <span class="text-2xl font-bold text-green-400">9.1</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-3">
              <div class="bg-gradient-to-r from-green-400 to-yellow-400 h-3 rounded-full" style="width: 91%"></div>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-glass-white/5 rounded-lg">
            <div class="text-center">
              <div class="text-3xl font-bold text-cyber-purple mb-1">8.6</div>
              <div class="text-sm text-gray-400">综合质量评分</div>
              <div class="text-xs text-green-400 mt-1">+0.3 较上期</div>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>

    <!-- Popular Content -->
    <CyberCard title="热门内容排行" :delay="700">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700/30">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">排名</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">内容</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">风格</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">播放次数</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">评分</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(content, index) in popularContent"
              :key="content.id"
              class="border-b border-gray-700/20 hover:bg-glass-white/5 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold"
                     :class="{
                       'bg-gradient-to-br from-yellow-500 to-yellow-600': index === 0,
                       'bg-gradient-to-br from-gray-400 to-gray-500': index === 1,
                       'bg-gradient-to-br from-amber-600 to-amber-700': index === 2,
                       'bg-gradient-to-br from-gray-600 to-gray-700': index > 2
                     }">
                  {{ index + 1 }}
                </div>
              </td>
              
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-cyber-purple to-cyber-blue flex items-center justify-center">
                    <Icon icon="mdi:music-note" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ content.title }}</div>
                    <div class="text-sm text-gray-400">{{ content.duration }}</div>
                  </div>
                </div>
              </td>
              
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30">
                  {{ content.genre }}
                </span>
              </td>
              
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <Icon icon="mdi:play-circle" class="w-4 h-4 text-gray-400" />
                  <span class="text-white font-medium">{{ content.playCount.toLocaleString() }}</span>
                </div>
              </td>
              
              <td class="py-3 px-4">
                <div class="flex items-center space-x-1">
                  <Icon 
                    v-for="i in 5" 
                    :key="i"
                    icon="mdi:star"
                    :class="i <= content.rating ? 'text-yellow-400' : 'text-gray-600'"
                    class="w-4 h-4"
                  />
                  <span class="text-sm text-gray-400 ml-2">{{ content.rating.toFixed(1) }}</span>
                </div>
              </td>
              
              <td class="py-3 px-4 text-sm text-gray-400">
                {{ formatDate(content.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CyberCard>

    <!-- Generation Performance -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Success/Failure Analysis -->
      <CyberCard title="生成成功率分析" :delay="800">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-300">成功生成</span>
            <div class="flex items-center space-x-3">
              <div class="w-32 bg-gray-700 rounded-full h-2">
                <div class="bg-green-400 h-2 rounded-full" style="width: 94.2%"></div>
              </div>
              <span class="text-white font-medium w-16 text-right">94.2%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-300">超时失败</span>
            <div class="flex items-center space-x-3">
              <div class="w-32 bg-gray-700 rounded-full h-2">
                <div class="bg-yellow-400 h-2 rounded-full" style="width: 3.5%"></div>
              </div>
              <span class="text-white font-medium w-16 text-right">3.5%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-300">模型错误</span>
            <div class="flex items-center space-x-3">
              <div class="w-32 bg-gray-700 rounded-full h-2">
                <div class="bg-red-400 h-2 rounded-full" style="width: 1.8%"></div>
              </div>
              <span class="text-white font-medium w-16 text-right">1.8%</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-300">系统错误</span>
            <div class="flex items-center space-x-3">
              <div class="w-32 bg-gray-700 rounded-full h-2">
                <div class="bg-orange-400 h-2 rounded-full" style="width: 0.5%"></div>
              </div>
              <span class="text-white font-medium w-16 text-right">0.5%</span>
            </div>
          </div>
        </div>
      </CyberCard>

      <!-- Response Time Analysis -->
      <CyberCard title="响应时间分析" :delay="900">
        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-cyber-purple">2.3s</div>
              <div class="text-sm text-gray-400">平均响应时间</div>
            </div>
            
            <div class="text-center">
              <div class="text-2xl font-bold text-cyber-blue">1.8s</div>
              <div class="text-sm text-gray-400">P95响应时间</div>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-300">< 1秒</span>
              <span class="text-green-400 font-medium">45%</span>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-300">1-3秒</span>
              <span class="text-blue-400 font-medium">38%</span>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-300">3-5秒</span>
              <span class="text-yellow-400 font-medium">12%</span>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-300">> 5秒</span>
              <span class="text-red-400 font-medium">5%</span>
            </div>
          </div>
        </div>
      </CyberCard>
    </div>
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
const contentStats = ref({
  totalGenerations: 45678,
  successRate: 94.2,
  avgDuration: '2:34',
  topGenre: '流行音乐'
})

const genreDistribution = ref([
  { name: '流行音乐', count: 12456, percentage: 35.8, color: '#8b5cf6' },
  { name: '电子音乐', count: 8932, percentage: 25.6, color: '#06b6d4' },
  { name: 'R&B', count: 5678, percentage: 16.3, color: '#10b981' },
  { name: '摇滚', count: 3421, percentage: 9.8, color: '#f59e0b' },
  { name: '古典', count: 2543, percentage: 7.3, color: '#ef4444' },
  { name: '其他', count: 1789, percentage: 5.2, color: '#6b7280' }
])

const popularContent = ref([
  { 
    id: 1, 
    title: '夜空中最亮的星', 
    genre: '流行', 
    duration: '3:42', 
    playCount: 15678, 
    rating: 4.8, 
    createdAt: '2024-01-15T10:30:00Z' 
  },
  { 
    id: 2, 
    title: '电子舞曲节拍', 
    genre: '电子', 
    duration: '4:15', 
    playCount: 12345, 
    rating: 4.6, 
    createdAt: '2024-01-14T15:22:00Z' 
  },
  { 
    id: 3, 
    title: '温柔的夜晚', 
    genre: 'R&B', 
    duration: '3:28', 
    playCount: 9876, 
    rating: 4.7, 
    createdAt: '2024-01-13T09:15:00Z' 
  },
  { 
    id: 4, 
    title: '摇滚狂想曲', 
    genre: '摇滚', 
    duration: '5:01', 
    playCount: 8765, 
    rating: 4.5, 
    createdAt: '2024-01-12T14:30:00Z' 
  },
  { 
    id: 5, 
    title: '古典幻想曲', 
    genre: '古典', 
    duration: '6:23', 
    playCount: 7654, 
    rating: 4.9, 
    createdAt: '2024-01-11T11:45:00Z' 
  }
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Content analytics data refreshed')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Add any custom styles here */
</style>