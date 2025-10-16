<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">提示词管理</h1>
        <p class="text-gray-400 mt-1">管理创作提示词模板，帮助用户快速开始音乐创作</p>
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
          添加提示词
        </CyberButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总提示词数"
        :value="stats.total"
        change="+5"
        trend="up"
        icon="mdi:lightbulb-on"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="活跃提示词"
        :value="stats.active"
        change="+3"
        trend="up"
        icon="mdi:eye"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="总使用次数"
        :value="stats.totalUsage.toLocaleString()"
        change="+25.3%"
        trend="up"
        icon="mdi:cursor-pointer"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="热门分类"
        :value="stats.topCategory"
        change="流行音乐"
        trend="neutral"
        icon="mdi:tag-multiple"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Filters and Actions -->
    <CyberCard title="筛选和操作" :delay="400">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <CyberInput
            v-model="filters.search"
            placeholder="搜索标题或内容..."
            left-icon="mdi:magnify"
            @input="handleSearch"
          />
          
          <select 
            v-model="filters.category"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
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
            v-model="filters.sortBy"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="createdAt">按创建时间</option>
            <option value="usageCount">按使用次数</option>
            <option value="sortOrder">按排序权重</option>
            <option value="title">按标题</option>
          </select>
          
          <select 
            v-model="filters.sortOrder"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
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
                left-icon="mdi:eye"
                @click="batchToggleStatus(true)"
              >
                批量启用
              </CyberButton>
              <CyberButton
                size="sm"
                variant="outline"
                left-icon="mdi:eye-off"
                @click="batchToggleStatus(false)"
              >
                批量禁用
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

    <!-- Prompts Grid -->
    <CyberCard 
      title="提示词列表" 
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
            <Icon icon="mdi:view-grid" class="w-4 h-4" />
            <span>共 {{ pagination.total }} 条记录</span>
          </div>
          
          <select 
            v-model="pagination.pageSize"
            class="bg-glass-white/10 border border-gray-700/30 rounded px-2 py-1 text-sm text-white"
            @change="handlePageSizeChange"
          >
            <option value="12">12 条/页</option>
            <option value="24">24 条/页</option>
            <option value="48">48 条/页</option>
          </select>
        </div>
      </template>
      
      <!-- Grid Layout -->
      <div v-if="!loading && paginatedPrompts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <TransitionGroup
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 -translate-y-4"
          move-class="transition-transform duration-300"
        >
          <PromptCard
            v-for="(prompt, index) in paginatedPrompts"
            :key="prompt.id"
            :prompt="prompt"
            :selected="selectedItems.includes(prompt.id)"
            @select="handleSelect"
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
        v-if="!loading && paginatedPrompts.length === 0"
        class="text-center py-12"
      >
        <Icon icon="mdi:lightbulb-off-outline" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">暂无提示词</h3>
        <p class="text-gray-500 mb-6">
          {{ hasFilters ? '没有找到符合条件的提示词' : '还没有添加任何提示词，点击上方按钮开始添加' }}
        </p>
        <CyberButton 
          v-if="!hasFilters"
          left-icon="mdi:plus"
          @click="showCreateModal = true"
        >
          添加第一个提示词
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
    <PromptModal
      v-model:visible="showCreateModal"
      :prompt="editingPrompt"
      :categories="categories"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleModalCancel"
    />
    
    <!-- Preview Modal -->
    <PromptPreviewModal
      v-model:visible="showPreviewModal"
      :prompt="previewPrompt"
    />
    
    <!-- Delete Confirmation -->
    <ConfirmModal
      v-model:visible="showDeleteModal"
      title="删除提示词"
      :content="`确定要删除提示词 「${deletingPrompt?.title}」 吗？此操作不可撤销。`"
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
import PromptCard from './components/PromptCard.vue'
import PromptModal from './components/PromptModal.vue'
import PromptPreviewModal from './components/PromptPreviewModal.vue'
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import { adminContentAPI } from '@/api'
import type { PromptTemplate } from '@/types'

// State
const loading = ref(false)
const modalLoading = ref(false)
const showCreateModal = ref(false)
const showPreviewModal = ref(false)
const showDeleteModal = ref(false)

const prompts = ref<PromptTemplate[]>([])
const editingPrompt = ref<PromptTemplate | null>(null)
const previewPrompt = ref<PromptTemplate | null>(null)
const deletingPrompt = ref<PromptTemplate | null>(null)
const selectedItems = ref<string[]>([])
const selectAll = ref(false)

const categories = ref([
  '流行音乐', 'R&B', '电子音乐', '摇滚', '民谣', 
  '古典', '爵士', '嘻哈', '乡村', '蓝调'
])

// Filters and pagination
const filters = ref({
  search: '',
  category: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 0,
  totalPages: 0
})

// Stats
const stats = ref({
  total: 25,
  active: 22,
  totalUsage: 1580,
  topCategory: '流行音乐'
})

// Computed
const filteredPrompts = computed(() => {
  let result = prompts.value
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(prompt => 
      prompt.title.toLowerCase().includes(search) ||
      prompt.content.toLowerCase().includes(search) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(search))
    )
  }
  
  if (filters.value.category) {
    result = result.filter(prompt => prompt.category === filters.value.category)
  }
  
  if (filters.value.status) {
    const isActive = filters.value.status === 'active'
    result = result.filter(prompt => prompt.isActive === isActive)
  }
  
  // Sort
  result.sort((a, b) => {
    const field = filters.value.sortBy
    const order = filters.value.sortOrder === 'asc' ? 1 : -1
    
    switch (field) {
      case 'usageCount':
        return (a.usageCount - b.usageCount) * order
      case 'sortOrder':
        return (a.sortOrder - b.sortOrder) * order
      case 'title':
        return a.title.localeCompare(b.title) * order
      case 'createdAt':
      default:
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order
    }
  })
  
  return result
})

const paginatedPrompts = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredPrompts.value.slice(start, end)
})

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
const loadPrompts = async () => {
  loading.value = true
  try {
    console.log('🔄 开始加载提示词数据...')
    
    // 构建查询参数
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      keyword: filters.value.search || undefined,
      category: filters.value.category || undefined,
      status: filters.value.status || undefined
    }
    
    // 调用真实的API
    const response = await adminContentAPI.getPrompts(params)
    console.log('✅ 提示词API响应:', response)
    
    if (response.code === 200 && response.data) {
      // 处理API返回的数据
      if (response.data.items) {
        // 分页数据
        prompts.value = response.data.items.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          tags: typeof item.tags === 'string' ? item.tags.split(',') : (item.tags || []),
          icon: item.icon || '🎵',
          iconBg: getIconBg(item.category),
          isActive: item.isActive,
          usageCount: item.usageCount || 0,
          sortOrder: item.sortOrder || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
        
        // 更新分页信息
        pagination.value.total = response.data.total || 0
        pagination.value.totalPages = response.data.totalPages || 1
        pagination.value.current = response.data.page || 1
      } else {
        // 简单数组数据
        prompts.value = response.data.map(item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          tags: typeof item.tags === 'string' ? item.tags.split(',') : (item.tags || []),
          icon: item.icon || '🎵',
          iconBg: getIconBg(item.category),
          isActive: item.isActive,
          usageCount: item.usageCount || 0,
          sortOrder: item.sortOrder || 0,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
        updatePagination()
      }
      
      console.log(`✅ 提示词数据加载成功，共${prompts.value.length}条`)
    } else {
      console.warn('⚠️ API返回的提示词数据格式异常:', response)
      prompts.value = []
      updatePagination()
    }
  } catch (error) {
    console.error('❌ 加载提示词数据失败:', error)
    prompts.value = []
    updatePagination()
  } finally {
    loading.value = false
  }
}

// 根据分类获取图标背景样式
const getIconBg = (category) => {
  const categoryColors = {
    '流行': 'bg-gradient-to-br from-purple-500 to-purple-600',
    '电子': 'bg-gradient-to-br from-blue-500 to-blue-600',
    '摇滚': 'bg-gradient-to-br from-red-500 to-red-600',
    '民谣': 'bg-gradient-to-br from-green-500 to-green-600',
    '古典': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    '爵士': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    '说唱': 'bg-gradient-to-br from-pink-500 to-pink-600',
    '其他': 'bg-gradient-to-br from-cyan-500 to-cyan-600'
  }
  return categoryColors[category] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

const updatePagination = () => {
  pagination.value.total = filteredPrompts.value.length
  pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
  
  if (pagination.value.current > pagination.value.totalPages) {
    pagination.value.current = Math.max(1, pagination.value.totalPages)
  }
}

const refreshData = () => {
  loadPrompts()
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
    category: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
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
    selectedItems.value = paginatedPrompts.value.map(p => p.id)
  } else {
    selectedItems.value = []
  }
}

const handleSelect = (promptId: string, selected: boolean) => {
  if (selected) {
    if (!selectedItems.value.includes(promptId)) {
      selectedItems.value.push(promptId)
    }
  } else {
    const index = selectedItems.value.indexOf(promptId)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
  
  selectAll.value = selectedItems.value.length === paginatedPrompts.value.length
}

const handleEdit = (prompt: PromptTemplate) => {
  editingPrompt.value = { ...prompt }
  showCreateModal.value = true
}

const handleDelete = (prompt: PromptTemplate) => {
  deletingPrompt.value = prompt
  showDeleteModal.value = true
}

const handleToggleStatus = async (prompt: PromptTemplate) => {
  try {
    console.log('🔄 切换提示词状态:', prompt.id, '当前状态:', prompt.isActive)
    
    // 调用后端API切换状态
    const response = await adminContentAPI.updatePrompt(prompt.id, {
      isActive: !prompt.isActive
    })
    
    if (response.code === 200) {
      // 更新本地数据
      const index = prompts.value.findIndex(p => p.id === prompt.id)
      if (index > -1) {
        prompts.value[index].isActive = !prompts.value[index].isActive
      }
      console.log('✅ 提示词状态切换成功')
    } else {
      console.error('❌ 提示词状态切换失败:', response.message)
    }
  } catch (error) {
    console.error('❌ 切换提示词状态失败:', error)
  }
}

const handlePreview = (prompt: PromptTemplate) => {
  previewPrompt.value = prompt
  showPreviewModal.value = true
}

const handleSubmit = async (promptData: Partial<PromptTemplate>) => {
  modalLoading.value = true
  try {
    if (editingPrompt.value) {
      // 编辑模式
      console.log('🔄 更新提示词:', editingPrompt.value.id, promptData)
      
      const response = await adminContentAPI.updatePrompt(editingPrompt.value.id, promptData)
      
      if (response.code === 200) {
        // 更新本地数据
        const index = prompts.value.findIndex(p => p.id === editingPrompt.value!.id)
        if (index > -1) {
          prompts.value[index] = { ...prompts.value[index], ...promptData, updatedAt: new Date().toISOString() }
        }
        console.log('✅ 提示词更新成功')
      } else {
        console.error('❌ 提示词更新失败:', response.message)
        return
      }
    } else {
      // 创建模式
      console.log('🔄 创建新提示词:', promptData)
      
      const response = await adminContentAPI.createPrompt(promptData)
      
      if (response.code === 201 || response.code === 200) {
        // 添加到本地数据
        const newPrompt = {
          ...response.data,
          iconBg: getIconBg(response.data.category)
        }
        prompts.value.unshift(newPrompt)
        console.log('✅ 提示词创建成功')
      } else {
        console.error('❌ 提示词创建失败:', response.message)
        return
      }
    }
    
    showCreateModal.value = false
    editingPrompt.value = null
    updatePagination()
  } catch (error) {
    console.error('❌ 保存提示词失败:', error)
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  showCreateModal.value = false
  editingPrompt.value = null
}

const confirmDelete = async () => {
  if (!deletingPrompt.value) return
  
  try {
    console.log('🔄 删除提示词:', deletingPrompt.value.id)
    
    const response = await adminContentAPI.deletePrompt(deletingPrompt.value.id)
    
    if (response.code === 200) {
      // 从本地数据中移除
      const index = prompts.value.findIndex(p => p.id === deletingPrompt.value!.id)
      if (index > -1) {
        prompts.value.splice(index, 1)
      }
      
      console.log('✅ 提示词删除成功')
      showDeleteModal.value = false
      deletingPrompt.value = null
      updatePagination()
    } else {
      console.error('❌ 提示词删除失败:', response.message)
    }
  } catch (error) {
    console.error('❌ 删除提示词失败:', error)
  }
}

const batchToggleStatus = async (active: boolean) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    selectedItems.value.forEach(id => {
      const index = prompts.value.findIndex(p => p.id === id)
      if (index > -1) {
        prompts.value[index].isActive = active
      }
    })
    
    selectedItems.value = []
    selectAll.value = false
  } catch (error) {
    console.error('Failed to batch toggle status:', error)
  }
}

const batchDelete = async () => {
  if (confirm(`确定要删除选中的 ${selectedItems.value.length} 个提示词吗？`)) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      prompts.value = prompts.value.filter(p => !selectedItems.value.includes(p.id))
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
  loadPrompts()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>