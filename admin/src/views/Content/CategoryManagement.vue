<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">提示词分类管理</h1>
        <p class="text-gray-400 mt-1">管理提示词分类，用于组织和分类提示词模板</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <CyberButton
          variant="outline"
          left-icon="mdi:refresh"
          @click="loadCategories"
          :loading="loading"
        >
          刷新
        </CyberButton>
        
        <CyberButton
          left-icon="mdi:plus"
          @click="openCreateModal"
        >
          添加分类
        </CyberButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="总分类数"
        :value="stats.total"
        icon="mdi:folder-multiple"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="启用分类"
        :value="stats.active"
        icon="mdi:check-circle"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="提示词总数"
        :value="stats.totalTemplates"
        icon="mdi:lightbulb-on"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="最热分类"
        :value="stats.topCategory"
        icon="mdi:fire"
        color="warning"
        :delay="300"
      />
    </div>

    <!-- Categories List -->
    <CyberCard title="分类列表" :loading="loading" :delay="400">
      <template #actions>
        <div class="text-sm text-gray-400">
          共 {{ categories.length }} 个分类
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          class="group p-4 bg-glass-white/5 border border-gray-700/30 rounded-lg hover:border-cyber-purple/30 transition-all duration-300"
          :style="{ animationDelay: `${500 + index * 50}ms` }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-purple to-purple-600 flex items-center justify-center flex-shrink-0">
                <Icon :icon="category.icon || 'mdi:folder'" class="w-6 h-6 text-white" />
              </div>
              
              <!-- Info -->
              <div class="flex-1">
                <div class="flex items-center space-x-3">
                  <h3 class="text-lg font-semibold text-white">{{ category.name }}</h3>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      category.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    ]"
                  >
                    {{ category.isActive ? '启用' : '禁用' }}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {{ category.templates?.length || 0 }} 个提示词
                  </span>
                </div>
                <p class="text-sm text-gray-400 mt-1">{{ category.description || '暂无描述' }}</p>
                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>排序: {{ category.sortOrder }}</span>
                  <span>创建: {{ formatDate(category.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CyberButton
                size="sm"
                variant="ghost"
                left-icon="mdi:pencil"
                @click="openEditModal(category)"
              >
                编辑
              </CyberButton>
              
              <CyberButton
                size="sm"
                variant="outline"
                :left-icon="category.isActive ? 'mdi:eye-off' : 'mdi:eye'"
                @click="toggleStatus(category)"
              >
                {{ category.isActive ? '禁用' : '启用' }}
              </CyberButton>
              
              <CyberButton
                size="sm"
                variant="danger"
                left-icon="mdi:delete"
                @click="openDeleteModal(category)"
                :disabled="(category.templates?.length || 0) > 0"
              >
                删除
              </CyberButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && categories.length === 0" class="text-center py-12">
        <Icon icon="mdi:folder-off-outline" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">暂无分类</h3>
        <p class="text-gray-500 mb-6">还没有添加任何分类，点击上方按钮开始添加</p>
        <CyberButton left-icon="mdi:plus" @click="openCreateModal">
          添加第一个分类
        </CyberButton>
      </div>
    </CyberCard>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click="closeModal"
        >
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          
          <div
            class="relative w-full max-w-md bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg"
            @click.stop
          >
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <h3 class="text-xl font-semibold text-white">
                {{ isEditing ? '编辑分类' : '添加分类' }}
              </h3>
              <button
                @click="closeModal"
                class="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                <Icon icon="mdi:close" class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div class="p-6 space-y-4">
              <CyberInput
                v-model="form.name"
                label="分类名称"
                placeholder="输入分类名称"
                required
                left-icon="mdi:tag"
              />
              
              <CyberInput
                v-model="form.description"
                label="分类描述"
                placeholder="输入分类描述（可选）"
                multiline
                :rows="2"
                left-icon="mdi:text"
              />
              
              <CyberInput
                v-model="form.icon"
                label="图标"
                placeholder="输入图标名称，如: mdi:music-note"
                left-icon="mdi:palette"
              />
              
              <CyberInput
                v-model.number="form.sortOrder"
                label="排序权重"
                type="number"
                placeholder="输入排序权重，数字越小越靠前"
                left-icon="mdi:sort"
              />
              
              <div>
                <label class="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
                  />
                  <span>启用分类</span>
                </label>
              </div>
            </div>
            
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/30">
              <CyberButton variant="ghost" @click="closeModal">
                取消
              </CyberButton>
              <CyberButton @click="handleSubmit" :loading="modalLoading">
                {{ isEditing ? '保存' : '创建' }}
              </CyberButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation -->
    <ConfirmModal
      v-model:visible="showDeleteModal"
      title="删除分类"
      :content="`确定要删除分类「${deletingCategory?.name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import { adminContentAPI } from '@/api'
import { format } from 'date-fns'

interface PromptCategory {
  id: number
  name: string
  description: string
  icon: string
  sortOrder: number
  isActive: boolean
  templates?: any[]
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const modalLoading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)

const categories = ref<PromptCategory[]>([])
const editingCategory = ref<PromptCategory | null>(null)
const deletingCategory = ref<PromptCategory | null>(null)

const form = ref({
  name: '',
  description: '',
  icon: 'mdi:folder',
  sortOrder: 0,
  isActive: true
})

const isEditing = computed(() => !!editingCategory.value)

const stats = computed(() => {
  const total = categories.value.length
  const active = categories.value.filter(c => c.isActive).length
  const totalTemplates = categories.value.reduce((sum, c) => sum + (c.templates?.length || 0), 0)
  const topCategory = categories.value.length > 0
    ? categories.value.sort((a, b) => (b.templates?.length || 0) - (a.templates?.length || 0))[0]?.name || '-'
    : '-'
  
  return { total, active, totalTemplates, topCategory }
})

const formatDate = (date: string) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm')
}

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await adminContentAPI.getPromptCategories()
    if (response.code === 200) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingCategory.value = null
  form.value = {
    name: '',
    description: '',
    icon: 'mdi:folder',
    sortOrder: 0,
    isActive: true
  }
  showModal.value = true
}

const openEditModal = (category: PromptCategory) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    icon: category.icon || 'mdi:folder',
    sortOrder: category.sortOrder,
    isActive: category.isActive
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
}

const handleSubmit = async () => {
  modalLoading.value = true
  try {
    if (isEditing.value && editingCategory.value) {
      const response = await adminContentAPI.updatePromptCategory(editingCategory.value.id, form.value)
      if (response.code === 200) {
        const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
        if (index > -1) {
          categories.value[index] = { ...categories.value[index], ...form.value }
        }
      }
    } else {
      const response = await adminContentAPI.createPromptCategory(form.value)
      if (response.code === 201 || response.code === 200) {
        categories.value.unshift(response.data)
      }
    }
    closeModal()
  } catch (error) {
    console.error('保存分类失败:', error)
  } finally {
    modalLoading.value = false
  }
}

const toggleStatus = async (category: PromptCategory) => {
  try {
    const response = await adminContentAPI.togglePromptCategoryStatus(category.id)
    if (response.code === 200) {
      const index = categories.value.findIndex(c => c.id === category.id)
      if (index > -1) {
        categories.value[index].isActive = !categories.value[index].isActive
      }
    }
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

const openDeleteModal = (category: PromptCategory) => {
  deletingCategory.value = category
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingCategory.value) return
  
  try {
    const response = await adminContentAPI.deletePromptCategory(deletingCategory.value.id)
    if (response.code === 200 || response.code === 204) {
      const index = categories.value.findIndex(c => c.id === deletingCategory.value!.id)
      if (index > -1) {
        categories.value.splice(index, 1)
      }
    }
    showDeleteModal.value = false
    deletingCategory.value = null
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

onMounted(() => {
  loadCategories()
})
</script>
