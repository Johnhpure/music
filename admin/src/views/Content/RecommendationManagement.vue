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
        title="启用中"
        :value="stats.active"
        change="-"
        trend="neutral"
        icon="mdi:check-circle"
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
        title="总点赞数"
        :value="stats.totalLikes.toLocaleString()"
        change="-"
        trend="neutral"
        icon="mdi:heart"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Filters -->
    <CyberCard title="筛选条件" :delay="400">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CyberInput
            v-model="filters.search"
            placeholder="搜索标题或艺术家..."
            left-icon="mdi:magnify"
            @input="handleSearch"
          />
          
          <select 
            v-model="filters.category"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.code" :value="category.code">
              {{ category.name }}
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
        </div>
        
        <!-- Batch Actions -->
        <div v-if="selectedItems.length > 0" class="flex items-center justify-between p-4 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">已选择 {{ selectedItems.length }} 项</span>
            <div class="flex items-center space-x-2">
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
            @hide="handleHide"
            @show="handleShow"
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
      :categories="categories"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleModalCancel"
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
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import { adminContentAPI } from '@/api'
import { useNotification } from '@/composables/useNotification'
import type { HotRecommendation } from '@/types'

// Notification
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const modalLoading = ref(false)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)

const recommendations = ref<HotRecommendation[]>([])
const editingRecommendation = ref<HotRecommendation | null>(null)
const deletingRecommendation = ref<HotRecommendation | null>(null)
const selectedItems = ref<number[]>([])
const selectAll = ref(false)

const categories = ref<{code: string, name: string}[]>([])

// Filters and pagination
const filters = ref({
  search: '',
  category: '',
  status: ''
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// Stats
const stats = computed(() => ({
  total: pagination.value.total,
  active: recommendations.value.filter(r => r.isActive).length,
  totalPlays: recommendations.value.reduce((sum, r) => sum + r.playCount, 0),
  totalLikes: recommendations.value.reduce((sum, r) => sum + r.likeCount, 0)
}))

// Computed - 直接使用API返回的数据
const paginatedRecommendations = computed(() => recommendations.value)

const hasFilters = computed(() => {
  return filters.value.search || filters.value.category || filters.value.status
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
const loadCategories = async () => {
  try {
    const response = await adminContentAPI.getRecommendationCategories()
    if (response.code === 200 && response.data) {
      // 保存完整的分类数据（包含code和name）
      categories.value = response.data
        .filter((cat: any) => cat.code !== 'all') // 过滤掉"全部"分类
        .map((cat: any) => ({ code: cat.code, name: cat.name }))
      console.log('分类加载成功，共', categories.value.length, '个')
    }
  } catch (error: any) {
    console.error('Failed to load categories:', error)
    // 失败时使用默认分类
    categories.value = [
      { code: 'pop', name: '流行音乐' },
      { code: 'electronic', name: '电子音乐' },
      { code: 'rock', name: '摇滚音乐' },
      { code: 'folk', name: '民谣音乐' },
      { code: 'hiphop', name: '说唱音乐' },
      { code: 'classical', name: '古典音乐' }
    ]
  }
}

const loadRecommendations = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: filters.value.search || undefined,
      category: filters.value.category || undefined,
      status: filters.value.status || undefined
    }
    
    const response = await adminContentAPI.getRecommendations(params)
    
    if (response.code === 200 && response.data) {
      recommendations.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      pagination.value.totalPages = response.data.totalPages || 0
    }
  } catch (error: any) {
    console.error('Failed to load recommendations:', error)
    showError(error.response?.data?.message || '加载推荐列表失败')
  } finally {
    loading.value = false
  }
}



const refreshData = () => {
  loadRecommendations()
}

const handleSearch = () => {
  pagination.value.current = 1
  loadRecommendations()
}

const handleFilter = () => {
  pagination.value.current = 1
  loadRecommendations()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: ''
  }
  pagination.value.current = 1
  loadRecommendations()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadRecommendations()
}

const handlePageSizeChange = () => {
  pagination.value.current = 1
  loadRecommendations()
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedRecommendations.value.map(r => r.id)
  } else {
    selectedItems.value = []
  }
}

const handleSelect = (recId: number, selected: boolean) => {
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

const handleHide = async (recommendation: HotRecommendation) => {
  try {
    const response = await adminContentAPI.updateRecommendation(
      recommendation.id.toString(),
      { isActive: false }
    )
    if (response.code === 200) {
      showSuccess('隐藏成功，小程序将不再显示此推荐')
      await loadRecommendations()
    }
  } catch (error: any) {
    console.error('Failed to hide recommendation:', error)
    showError(error.response?.data?.message || '隐藏失败')
  }
}

const handleShow = async (recommendation: HotRecommendation) => {
  try {
    const response = await adminContentAPI.updateRecommendation(
      recommendation.id.toString(),
      { isActive: true }
    )
    if (response.code === 200) {
      showSuccess('取消隐藏成功，小程序将显示此推荐')
      await loadRecommendations()
    }
  } catch (error: any) {
    console.error('Failed to show recommendation:', error)
    showError(error.response?.data?.message || '取消隐藏失败')
  }
}

const handlePlay = (recommendation: HotRecommendation) => {
  console.log('Play recommendation:', recommendation.title)
  // Implement audio playback logic
}

const handleSubmit = async (recommendationData: Partial<HotRecommendation>) => {
  modalLoading.value = true
  try {
    if (editingRecommendation.value) {
      const response = await adminContentAPI.updateRecommendation(
        editingRecommendation.value.id.toString(),
        recommendationData
      )
      if (response.code === 200) {
        showSuccess('更新推荐成功')
      }
    } else {
      const response = await adminContentAPI.createRecommendation(recommendationData)
      if (response.code === 201 || response.code === 200) {
        showSuccess('创建推荐成功')
      }
    }
    
    showCreateModal.value = false
    editingRecommendation.value = null
    await loadRecommendations()
  } catch (error: any) {
    console.error('Failed to save recommendation:', error)
    showError(error.response?.data?.message || '保存推荐失败')
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
    const response = await adminContentAPI.deleteRecommendation(
      deletingRecommendation.value.id.toString()
    )
    if (response.code === 204 || response.code === 200) {
      showSuccess('删除推荐成功')
      showDeleteModal.value = false
      deletingRecommendation.value = null
      await loadRecommendations()
    }
  } catch (error: any) {
    console.error('Failed to delete recommendation:', error)
    showError(error.response?.data?.message || '删除推荐失败')
  }
}



const batchDelete = async () => {
  if (!confirm(`确定要删除选中的 ${selectedItems.value.length} 个推荐吗？`)) {
    return
  }
  
  try {
    const deletePromises = selectedItems.value.map(id =>
      adminContentAPI.deleteRecommendation(id.toString())
    )
    
    await Promise.all(deletePromises)
    showSuccess(`成功删除 ${selectedItems.value.length} 个推荐`)
    selectedItems.value = []
    selectAll.value = false
    await loadRecommendations()
  } catch (error: any) {
    console.error('Failed to batch delete:', error)
    showError(error.response?.data?.message || '批量删除失败')
  }
}

// Watch filters for auto-update
watch(() => filters.value, () => {
  pagination.value.current = 1
  loadRecommendations()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadCategories()
  loadRecommendations()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>