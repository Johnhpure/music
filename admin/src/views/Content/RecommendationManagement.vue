<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">推荐管理</h1>
        <p class="text-gray-400 mt-1">管理小程序首页的热门推荐音乐内容</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="refreshData"
          :loading="loading"
        >
          刷新
        </CyberButton>
        
        <CyberButton
          left-icon="mdi:plus"
          @click="showCreateModal = true"
        >
          添加推荐
        </CyberButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总推荐数"
        :value="stats.total"
        change="+3"
        trend="up"
        icon="mdi:star-circle"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="热门推荐"
        :value="stats.hot"
        change="+1"
        trend="up"
        icon="mdi:fire"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="总播放量"
        :value="stats.totalPlays.toLocaleString()"
        change="+15.2%"
        trend="up"
        icon="mdi:play-circle"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="平均时长"
        :value="stats.averageDuration"
        change="3:24"
        trend="neutral"
        icon="mdi:timer"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Filters -->
    <CyberCard title="筛选条件" :delay="400">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <CyberInput
            v-model="filters.search"
            placeholder="搜索标题或艺术家..."
            left-icon="mdi:magnify"
            @input="handleSearch"
          />
          
          <select 
            v-model="filters.genre"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部风格</option>
            <option v-for="genre in genres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
          
          <select 
            v-model="filters.status"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
          </select>
          
          <select 
            v-model="filters.isHot"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部类型</option>
            <option value="true">热门推荐</option>
            <option value="false">普通推荐</option>
          </select>
          
          <select 
            v-model="filters.sortBy"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="sortOrder">按排序权重</option>
            <option value="playCount">按播放量</option>
            <option value="createdAt">按创建时间</option>
            <option value="title">按标题</option>
          </select>
        </div>
        
        <!-- Batch Actions -->
        <div v-if="selectedItems.length > 0" class="flex items-center justify-between p-4 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">已选择 {{ selectedItems.length }} 项</span>
            <div class="flex items-center space-x-2">
              <CyberButton
                size="sm"
                variant="outline"
                left-icon="mdi:fire"
                @click="batchSetHot(true)"
              >
                设为热门
              </CyberButton>
              <CyberButton
                size="sm"
                variant="outline"
                left-icon="mdi:fire-off"
                @click="batchSetHot(false)"
              >
                取消热门
              </CyberButton>
              <CyberButton
                size="sm"
                variant="danger"
                left-icon="mdi:delete"
                @click="batchDelete"
              >
                批量删除
              </CyberButton>
            </div>
          </div>
          <button
            @click="selectedItems = []"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </CyberCard>

    <!-- Recommendations List -->
    <CyberCard 
      title="推荐列表" 
      :loading="loading"
      :delay="500"
    >
      <template #actions>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="flex items-center space-x-2 text-sm text-gray-400 cursor-pointer">
              <input
                v-model="selectAll"
                type="checkbox"
                class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple focus:ring-offset-gray-800"
                @change="handleSelectAll"
              />
              <span>全选</span>
            </label>
          </div>
          
          <div class="flex items-center space-x-2 text-sm text-gray-400">
            <Icon icon="mdi:music-note-multiple" class="w-4 h-4" />
            <span>共 {{ pagination.total }} 条记录</span>
          </div>
          
          <select 
            v-model="pagination.pageSize"
            class="bg-glass-white/10 border border-gray-700/30 rounded px-2 py-1 text-sm text-white"
            @change="handlePageSizeChange"
          >
            <option value="10">10 条/页</option>
            <option value="20">20 条/页</option>
            <option value="50">50 条/页</option>
          </select>
        </div>
      </template>
      
      <!-- List Items -->
      <div v-if="!loading && paginatedRecommendations.length > 0" class="space-y-4">
        <TransitionGroup
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
          move-class="transition-transform duration-300"
        >
          <RecommendationItem
            v-for="(recommendation, index) in paginatedRecommendations"
            :key="recommendation.id"
            :recommendation="recommendation"
            :selected="selectedItems.includes(recommendation.id)"
            @select="handleSelect"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle-status="handleToggleStatus"
            @toggle-hot="handleToggleHot"
            @preview="handlePreview"
            @play="handlePlay"
            :delay="600 + index * 50"
          />
        </TransitionGroup>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="!loading && paginatedRecommendations.length === 0"
        class="text-center py-12"
      >
        <Icon icon="mdi:music-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">暂无推荐</h3>
        <p class="text-gray-500 mb-6">
          {{ hasFilters ? '没有找到符合条件的推荐' : '还没有添加任何推荐，点击上方按钮开始添加' }}
        </p>
        <CyberButton 
          v-if="!hasFilters"
          left-icon="mdi:plus"
          @click="showCreateModal = true"
        >
          添加第一个推荐
        </CyberButton>
        <CyberButton 
          v-else
          variant="outline"
          left-icon="mdi:filter-remove"
          @click="clearFilters"
        >
          清除筛选条件
        </CyberButton>
      </div>
      
      <!-- Pagination -->
      <div 
        v-if="pagination.totalPages > 1"
        class="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/30"
      >
        <div class="text-sm text-gray-400">
          显示第 {{ (pagination.current - 1) * pagination.pageSize + 1 }} - 
          {{ Math.min(pagination.current * pagination.pageSize, pagination.total) }} 条，
          共 {{ pagination.total }} 条
        </div>
        
        <div class="flex items-center space-x-2">
          <CyberButton
            size="sm"
            variant="outline"
            :disabled="pagination.current <= 1"
            @click="handlePageChange(pagination.current - 1)"
          >
            上一页
          </CyberButton>
          
          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="typeof page === 'number' ? handlePageChange(page) : undefined"
              class="w-8 h-8 rounded-lg text-sm transition-all duration-200"
              :class="[
                page === pagination.current
                  ? 'bg-cyber-purple text-white'
                  : 'text-gray-400 hover:text-white hover:bg-glass-white/10'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <CyberButton
            size="sm"
            variant="outline"
            :disabled="pagination.current >= pagination.totalPages"
            @click="handlePageChange(pagination.current + 1)"
          >
            下一页
          </CyberButton>
        </div>
      </div>
    </CyberCard>

    <!-- Create/Edit Modal -->
    <RecommendationModal
      v-model:visible="showCreateModal"
      :recommendation="editingRecommendation"
      :genres="genres"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleModalCancel"
    />
    
    <!-- Preview Modal -->
    <RecommendationPreviewModal
      v-model:visible="showPreviewModal"
      :recommendation="previewRecommendation"
    />
    
    <!-- Delete Confirmation -->
    <ConfirmModal
      v-model:visible="showDeleteModal"
      title="删除推荐"
      :content="`确定要删除推荐 「${deletingRecommendation?.title}」 吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'
import RecommendationItem from './components/RecommendationItem.vue'
import RecommendationModal from './components/RecommendationModal.vue'
import RecommendationPreviewModal from './components/RecommendationPreviewModal.vue'
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import type { HotRecommendation } from '@/types'

// State
const loading = ref(false)
const modalLoading = ref(false)
const showCreateModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)

const recommendations = ref<HotRecommendation[]>([])
const editingRecommendation = ref<HotRecommendation | null>(null)
const previewRecommendation = ref<HotRecommendation | null>(null)
const deletingRecommendation = ref<HotRecommendation | null>(null)
const selectedItems = ref<string[]>([])
const selectAll = ref(false)

const genres = ref([
  '流行', 'R&B', '电子', '摇滚', '民谣', 
  '古典', '爵士', '嘻哈', '乡村', '蓝调', '其他'
])

// Filters and pagination
const filters = ref({
  search: '',
  genre: '',
  status: '',
  isHot: '',
  sortBy: 'sortOrder'
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// Stats
const stats = ref({
  total: 16,
  hot: 8,
  totalPlays: 25600,
  averageDuration: '3:24'
})

// Computed
const filteredRecommendations = computed(() => {
  let result = recommendations.value
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(rec => 
      rec.title.toLowerCase().includes(search) ||
      rec.artist.toLowerCase().includes(search)
    )
  }
  
  if (filters.value.genre) {
    result = result.filter(rec => rec.genre === filters.value.genre)
  }
  
  if (filters.value.status) {
    const isActive = filters.value.status === 'active'
    result = result.filter(rec => rec.isActive === isActive)
  }
  
  if (filters.value.isHot) {
    const isHot = filters.value.isHot === 'true'
    result = result.filter(rec => rec.isHot === isHot)
  }
  
  // Sort
  result.sort((a, b) => {
    const field = filters.value.sortBy
    switch (field) {
      case 'playCount':
        return b.playCount - a.playCount
      case 'sortOrder':
        return a.sortOrder - b.sortOrder
      case 'title':
        return a.title.localeCompare(b.title)
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  
  return result
})

const paginatedRecommendations = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredRecommendations.value.slice(start, end)
})

const hasFilters = computed(() => {
  return filters.value.search || filters.value.genre || filters.value.status || filters.value.isHot
})

const visiblePages = computed(() => {
  const current = pagination.value.current
  const total = pagination.value.totalPages
  const delta = 2
  
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }
  
  rangeWithDots.push(...range)
  
  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    rangeWithDots.push(total)
  }
  
  return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
})

// Methods
const loadRecommendations = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock recommendations
    recommendations.value = Array.from({ length: 16 }, (_, i) => ({
      id: `rec_${i + 1}`,
      title: `推荐音乐 ${i + 1}`,
      artist: `艺术家 ${Math.floor(i / 2) + 1}`,
      genre: genres.value[i % genres.value.length],
      duration: `${Math.floor(Math.random() * 3) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      coverUrl: `/static/img/music/cover${(i % 5) + 1}.jpg`,
      audioUrl: `/static/audio/music${(i % 3) + 1}.mp3`,
      isHot: Math.random() > 0.5,
      tags: ['推荐', '热门', genres.value[i % genres.value.length]],
      playCount: Math.floor(Math.random() * 5000) + 100,
      sortOrder: i + 1,
      isActive: Math.random() > 0.2,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    updatePagination()
  } catch (error) {
    console.error('Failed to load recommendations:', error)
  } finally {
    loading.value = false
  }
}

const updatePagination = () => {
  pagination.value.total = filteredRecommendations.value.length
  pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
  
  if (pagination.value.current > pagination.value.totalPages) {
    pagination.value.current = Math.max(1, pagination.value.totalPages)
  }
}

const refreshData = () => {
  loadRecommendations()
}

const handleSearch = () => {
  pagination.value.current = 1
  updatePagination()
}

const handleFilter = () => {
  pagination.value.current = 1
  updatePagination()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    genre: '',
    status: '',
    isHot: '',
    sortBy: 'sortOrder'
  }
  pagination.value.current = 1
  updatePagination()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
}

const handlePageSizeChange = () => {
  pagination.value.current = 1
  updatePagination()
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedRecommendations.value.map(r => r.id)
  } else {
    selectedItems.value = []
  }
}

const handleSelect = (recId: string, selected: boolean) => {
  if (selected) {
    if (!selectedItems.value.includes(recId)) {
      selectedItems.value.push(recId)
    }
  } else {
    const index = selectedItems.value.indexOf(recId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
  
  selectAll.value = selectedItems.value.length === paginatedRecommendations.value.length
}

const handleEdit = (recommendation: HotRecommendation) => {
  editingRecommendation.value = { ...recommendation }
  showCreateModal.value = true
}

const handleDelete = (recommendation: HotRecommendation) => {
  deletingRecommendation.value = recommendation
  showDeleteModal.value = true
}

const handleToggleStatus = async (recommendation: HotRecommendation) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index > -1) {
      recommendations.value[index].isActive = !recommendations.value[index].isActive
    }
  } catch (error) {
    console.error('Failed to toggle recommendation status:', error)
  }
}

const handleToggleHot = async (recommendation: HotRecommendation) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index > -1) {
      recommendations.value[index].isHot = !recommendations.value[index].isHot
    }
  } catch (error) {
    console.error('Failed to toggle hot status:', error)
  }
}

const handlePreview = (recommendation: HotRecommendation) => {
  previewRecommendation.value = recommendation
  showPreviewModal.value = true
}

const handlePlay = (recommendation: HotRecommendation) => {
  console.log('Play recommendation:', recommendation.title)
  // Implement audio playback logic
}

const handleSubmit = async (recommendationData: Partial<HotRecommendation>) => {
  modalLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (editingRecommendation.value) {
      const index = recommendations.value.findIndex(r => r.id === editingRecommendation.value!.id)
      if (index > -1) {
        recommendations.value[index] = { ...recommendations.value[index], ...recommendationData }
      }
    } else {
      const newRecommendation: HotRecommendation = {
        id: `rec_${Date.now()}`,
        ...recommendationData,
        isActive: true,
        playCount: 0,
        sortOrder: recommendations.value.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as HotRecommendation
      
      recommendations.value.unshift(newRecommendation)
    }
    
    showCreateModal.value = false
    editingRecommendation.value = null
    updatePagination()
  } catch (error) {
    console.error('Failed to save recommendation:', error)
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  showCreateModal.value = false
  editingRecommendation.value = null
}

const confirmDelete = async () => {
  if (!deletingRecommendation.value) return
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = recommendations.value.findIndex(r => r.id === deletingRecommendation.value!.id)
    if (index > -1) {
      recommendations.value.splice(index, 1)
    }
    
    showDeleteModal.value = false
    deletingRecommendation.value = null
    updatePagination()
  } catch (error) {
    console.error('Failed to delete recommendation:', error)
  }
}

const batchSetHot = async (isHot: boolean) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    selectedItems.value.forEach(id => {
      const index = recommendations.value.findIndex(r => r.id === id)
      if (index > -1) {
        recommendations.value[index].isHot = isHot
      }
    })
    
    selectedItems.value = []
    selectAll.value = false
  } catch (error) {
    console.error('Failed to batch set hot:', error)
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedItems.value.length} 个推荐吗？`)) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      recommendations.value = recommendations.value.filter(r => !selectedItems.value.includes(r.id))
      selectedItems.value = []
      selectAll.value = false
      updatePagination()
    } catch (error) {
      console.error('Failed to batch delete:', error)
    }
  }
}

// Watch filters for auto-update
watch(() => filters.value, () => {
  updatePagination()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadRecommendations()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>