<template>
  <div class="space-y-6">
    <!-- Page Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Banner 管理</h1>
        <p class="text-gray-400 mt-1">管理首页轮播图的显示和排序</p>
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
          添加 Banner
        </CyberButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总 Banner 数"
        :value="stats.total"
        change="+2"
        trend="up"
        icon="mdi:image-multiple"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="活跃 Banner"
        :value="stats.active"
        change="+1"
        trend="up"
        icon="mdi:eye"
        color="success" 
        :delay="100"
      />
      
      <StatsCard
        title="总点击量"
        :value="stats.totalClicks.toLocaleString()"
        change="+12.5%"
        trend="up"
        icon="mdi:cursor-pointer"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="平均 CTR"
        :value="`${stats.averageCtr}%`"
        change="+0.8%"
        trend="up"
        icon="mdi:chart-line"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Filters -->
    <CyberCard title="筛选条件" :delay="400">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CyberInput
          v-model="filters.search"
          placeholder="搜索标题或描述..."
          left-icon="mdi:magnify"
          @input="handleSearch"
        />
        
        <select 
          v-model="filters.status"
          class="cyber-input"
          @change="handleFilter"
        >
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
        
        <CyberInput
          v-model="filters.startDate"
          type="date"
          placeholder="开始日期"
          @change="handleFilter"
        />
        
        <CyberInput
          v-model="filters.endDate"
          type="date"
          placeholder="结束日期"
          @change="handleFilter"
        />
      </div>
    </CyberCard>

    <!-- Banners List -->
    <CyberCard 
      title="Banner 列表" 
      :loading="loading"
      :delay="500"
    >
      <template #actions>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-400">
            共 {{ pagination.total }} 条记录
          </span>
          
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
      
      <!-- Drag and Drop List -->
      <div class="space-y-4">
        <TransitionGroup
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
          move-class="transition-transform duration-300"
        >
          <BannerItem
            v-for="(banner, index) in paginatedBanners"
            :key="banner.id"
            :banner="banner"
            :index="index"
            @edit="handleEdit"
            @delete="handleDelete"
            @toggle-status="handleToggleStatus"
            @preview="handlePreview"
            :delay="600 + index * 50"
          />
        </TransitionGroup>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="!loading && paginatedBanners.length === 0"
        class="text-center py-12"
      >
        <Icon icon="mdi:image-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">暂无 Banner</h3>
        <p class="text-gray-500 mb-6">还没有添加任何 Banner，点击上方按钮开始添加</p>
        <CyberButton 
          left-icon="mdi:plus"
          @click="showCreateModal = true"
        >
          添加第一个 Banner
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
              :disabled="typeof page !== 'number'"
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
    <BannerModal
      v-model:visible="showCreateModal"
      :banner="editingBanner"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleModalCancel"
    />
    
    <!-- Preview Modal -->
    <BannerPreviewModal
      v-model:visible="showPreviewModal"
      :banner="previewBanner"
    />
    
    <!-- Delete Confirmation -->
    <ConfirmModal
      v-model:visible="showDeleteModal"
      title="删除 Banner"
      :content="`确定要删除 Banner 「${deletingBanner?.title}」 吗？此操作不可撤销。`"
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
import BannerItem from './components/BannerItem.vue'
import BannerModal from './components/BannerModal.vue'
import BannerPreviewModal from './components/BannerPreviewModal.vue'
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import { adminContentAPI } from '@/api'
import type { Banner } from '@/types'

// State
const loading = ref(false)
const modalLoading = ref(false)
const showCreateModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)

const banners = ref<Banner[]>([])
const editingBanner = ref<Banner | null>(null)
const previewBanner = ref<Banner | null>(null)
const deletingBanner = ref<Banner | null>(null)

// Filters and pagination
const filters = ref({
  search: '',
  status: '',
  startDate: '',
  endDate: ''
})

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
})

// Stats
const stats = ref({
  total: 12,
  active: 8,
  totalClicks: 15420,
  averageCtr: 3.2
})

// Computed
const filteredBanners = computed(() => {
  let result = banners.value
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(banner => 
      banner.title.toLowerCase().includes(search) ||
      banner.description.toLowerCase().includes(search)
    )
  }
  
  if (filters.value.status) {
    const isActive = filters.value.status === 'active'
    result = result.filter(banner => banner.isActive === isActive)
  }
  
  if (filters.value.startDate) {
    result = result.filter(banner => 
      new Date(banner.createdAt) >= new Date(filters.value.startDate)
    )
  }
  
  if (filters.value.endDate) {
    result = result.filter(banner => 
      new Date(banner.createdAt) <= new Date(filters.value.endDate)
    )
  }
  
  return result
})

const paginatedBanners = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredBanners.value.slice(start, end)
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
const loadStats = async () => {
  try {
    // 这里可以调用统计API，暂时使用默认值
    // const response = await adminContentAPI.getBannerStats()
    // if (response.code === 200) {
    //   stats.value = response.data
    // }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadBanners = async () => {
  loading.value = true
  try {
    // 调用真实的Banner API
    const response = await adminContentAPI.getBanners({
      page: pagination.value.current,
      limit: pagination.value.pageSize
    })
    
    console.log('📋 Banner列表响应:', response)
    
    if (response.code === 200 && response.data) {
      banners.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
      
      // 更新统计数据
      stats.value.total = response.data.total || 0
      stats.value.active = banners.value.filter(b => b.isActive).length
      await loadStats()
    } else {
      console.error('获取Banner列表失败:', response.message)
      // 如果API调用失败，使用默认数据作为后备
      banners.value = []
    }
    
    updatePagination()
  } catch (error) {
    console.error('Failed to load banners:', error)
    
    // API调用失败时显示错误通知
    if ((window as any).$notify) {
      (window as any).$notify.error('获取Banner列表失败，请检查网络连接')
    }
    
    // 使用空数组而不是Mock数据
    banners.value = []
  } finally {
    loading.value = false
  }
}

const updatePagination = () => {
  pagination.value.total = filteredBanners.value.length
  pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
  
  if (pagination.value.current > pagination.value.totalPages) {
    pagination.value.current = Math.max(1, pagination.value.totalPages)
  }
}

const refreshData = () => {
  loadBanners()
}

const handleSearch = () => {
  pagination.value.current = 1
  updatePagination()
}

const handleFilter = () => {
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

const handleEdit = (banner: Banner) => {
  editingBanner.value = { ...banner }
  showCreateModal.value = true
}

const handleDelete = (banner: Banner) => {
  deletingBanner.value = banner
  showDeleteModal.value = true
}

const handleToggleStatus = async (banner: Banner) => {
  try {
    console.log('🔄 切换Banner状态:', banner.id, !banner.isActive)
    
    const response = await adminContentAPI.updateBanner(banner.id, {
      isActive: !banner.isActive
    })
    
    console.log('🔄 Banner状态切换响应:', response)
    
    if (response.code === 200) {
      // 状态切换成功
      if ((window as any).$notify) {
        (window as any).$notify.success(
          banner.isActive ? 'Banner已禁用' : 'Banner已启用'
        )
      }
      
      // 重新加载Banner列表
      await loadBanners()
    } else {
      // 状态切换失败
      console.error('Banner状态切换失败:', response.message)
      if ((window as any).$notify) {
        (window as any).$notify.error(response.message || 'Banner状态切换失败')
      }
    }
  } catch (error) {
    console.error('Failed to toggle banner status:', error)
    
    // 显示错误通知
    if ((window as any).$notify) {
      (window as any).$notify.error('Banner状态切换失败，请检查网络连接')
    }
  }
}

const handlePreview = (banner: Banner) => {
  previewBanner.value = banner
  showPreviewModal.value = true
}

const handleSubmit = async (bannerData: Partial<Banner>) => {
  modalLoading.value = true
  try {
    let response
    const isUpdating = !!editingBanner.value  // 保存编辑状态
    
    if (editingBanner.value) {
      // 更新现有Banner
      console.log('🔄 更新Banner:', editingBanner.value.id, bannerData)
      response = await adminContentAPI.updateBanner(editingBanner.value.id, bannerData)
    } else {
      // 创建新Banner
      console.log('✨ 创建新Banner:', bannerData)
      response = await adminContentAPI.createBanner(bannerData)
    }
    
    console.log('💾 Banner保存响应:', response)
    
    if (response.code === 200 || response.code === 201) {
      // 保存成功
      showCreateModal.value = false
      editingBanner.value = null
      
      // 显示成功通知
      if ((window as any).$notify) {
        (window as any).$notify.success(
          isUpdating ? 'Banner更新成功' : 'Banner创建成功'
        )
      }
      
      // 重新加载Banner列表
      await loadBanners()
    } else {
      // 保存失败
      console.error('Banner保存失败:', response.message)
      if ((window as any).$notify) {
        (window as any).$notify.error(response.message || 'Banner保存失败')
      }
    }
  } catch (error) {
    console.error('Failed to save banner:', error)
    
    // 显示错误通知
    if ((window as any).$notify) {
      (window as any).$notify.error('Banner保存失败，请检查网络连接')
    }
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  showCreateModal.value = false
  editingBanner.value = null
}

const confirmDelete = async () => {
  if (!deletingBanner.value) return
  
  try {
    console.log('🗑️ 删除Banner:', deletingBanner.value.id)
    const response = await adminContentAPI.deleteBanner(deletingBanner.value.id)
    
    console.log('🗑️ Banner删除响应:', response)
    
    if (response.code === 200) {
      // 删除成功
      showDeleteModal.value = false
      deletingBanner.value = null
      
      // 显示成功通知
      if ((window as any).$notify) {
        (window as any).$notify.success('Banner删除成功')
      }
      
      // 重新加载Banner列表
      await loadBanners()
    } else {
      // 删除失败
      console.error('Banner删除失败:', response.message)
      if ((window as any).$notify) {
        (window as any).$notify.error(response.message || 'Banner删除失败')
      }
    }
  } catch (error) {
    console.error('Failed to delete banner:', error)
    
    // 显示错误通知
    if ((window as any).$notify) {
      (window as any).$notify.error('Banner删除失败，请检查网络连接')
    }
  }
}

// Watch filters for auto-update
watch(() => filters.value, () => {
  updatePagination()
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadBanners()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>