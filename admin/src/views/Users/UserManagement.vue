<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">用户管理</h1>
        <p class="text-gray-400 mt-1">管理平台用户信息、权限和状态</p>
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
          left-icon="mdi:account-plus"
          @click="showCreateModal = true"
        >
          添加用户
        </CyberButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <StatsCard
        title="总用户数"
        :value="stats.total.toLocaleString()"
        change="+12"
        trend="up"
        icon="mdi:account-group"
        color="primary"
        :delay="0"
      />
      
      <StatsCard
        title="活跃用户"
        :value="stats.active.toLocaleString()"
        change="+8.2%"
        trend="up"
        icon="mdi:account-check"
        color="success"
        :delay="100"
      />
      
      <StatsCard
        title="新注册"
        :value="stats.newUsers"
        change="+15"
        trend="up"
        icon="mdi:account-plus"
        color="info"
        :delay="200"
      />
      
      <StatsCard
        title="VIP用户"
        :value="stats.vipUsers.toLocaleString()"
        change="+5"
        trend="up"
        icon="mdi:crown"
        color="warning"
        :delay="300"
      />
      
      <StatsCard
        title="封禁用户"
        :value="stats.bannedUsers"
        change="-2"
        trend="down"
        icon="mdi:account-cancel"
        color="danger"
        :delay="400"
      />
    </div>

    <!-- Filters and Actions -->
    <CyberCard title="筛选和操作" :delay="500">
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
          <CyberInput
            v-model="filters.search"
            placeholder="搜索用户名、邮箱或手机..."
            left-icon="mdi:magnify"
            @input="handleSearch"
          />
          
          <select 
            v-model="filters.status"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="banned">已封禁</option>
            <option value="pending">待激活</option>
          </select>
          
          <select 
            v-model="filters.userType"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部类型</option>
            <option value="free">普通用户</option>
            <option value="vip">VIP用户</option>
            <option value="admin">管理员</option>
          </select>
          
          <select 
            v-model="filters.registrationSource"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="">全部来源</option>
            <option value="wechat">微信小程序</option>
            <option value="web">网页注册</option>
            <option value="mobile">手机APP</option>
          </select>
          
          <select 
            v-model="filters.sortBy"
            class="cyber-input"
            @change="handleFilter"
          >
            <option value="createdAt">按注册时间</option>
            <option value="lastLoginAt">按最后登录</option>
            <option value="totalCredits">按积分总量</option>
            <option value="username">按用户名</option>
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
                left-icon="mdi:email"
                @click="batchSendEmail"
              >
                批量发邮件
              </CyberButton>
              <CyberButton
                size="sm"
                variant="outline"
                left-icon="mdi:account-off"
                @click="batchBanUsers"
              >
                批量封禁
              </CyberButton>
              <CyberButton
                size="sm"
                variant="outline"
                left-icon="mdi:account-check"
                @click="batchActivateUsers"
              >
                批量激活
              </CyberButton>
              <CyberButton
                size="sm"
                variant="danger"
                left-icon="mdi:delete"
                @click="batchDeleteUsers"
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

    <!-- Users Table -->
    <CyberCard 
      title="用户列表" 
      :loading="loading"
      :delay="600"
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
            <Icon icon="mdi:account-group" class="w-4 h-4" />
            <span>共 {{ pagination.total }} 位用户</span>
          </div>
          
          <select 
            v-model="pagination.pageSize"
            class="bg-glass-white/10 border border-gray-700/30 rounded px-2 py-1 text-sm text-white"
            @change="handlePageSizeChange"
          >
            <option value="20">20 条/页</option>
            <option value="50">50 条/页</option>
            <option value="100">100 条/页</option>
          </select>
        </div>
      </template>
      
      <!-- Table -->
      <div v-if="!loading && paginatedUsers.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <!-- v-once 优化静态表头 -->
          <thead v-once>
            <tr class="border-b border-gray-700/30">
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">
                <input
                  v-model="selectAll"
                  type="checkbox"
                  class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
                  @change="handleSelectAll"
                />
              </th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">用户信息</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">联系方式</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">状态</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">积分</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">注册信息</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">最后登录</th>
              <th class="text-left py-4 px-4 text-sm font-medium text-gray-400">操作</th>
            </tr>
          </thead>
          <!-- 使用 tbody 包裹 TransitionGroup -->
          <tbody>
            <TransitionGroup
              enter-active-class="transition-all duration-300"
              leave-active-class="transition-all duration-300"
              enter-from-class="opacity-0 translate-y-4"
              leave-to-class="opacity-0 -translate-y-4"
              move-class="transition-transform duration-300"
            >
              <!-- 使用 v-memo 优化行渲染，只在关键数据变化时更新 -->
              <tr
                v-for="(user, index) in paginatedUsers"
                :key="user.id"
                v-memo="[user.id, user.status, user.totalCredits, user.userType, selectedItems.includes(user.id)]"
                class="border-b border-gray-700/20 hover:bg-glass-white/5 transition-all duration-200"
                :style="{ animationDelay: `${Math.min(700 + index * 50, 1500)}ms` }"
              >
                <td class="py-4 px-4">
                  <input
                    v-model="selectedItems"
                    :value="user.id"
                    type="checkbox"
                    class="rounded border-gray-600 bg-gray-700 text-cyber-purple focus:ring-cyber-purple"
                  />
                </td>
                
                <!-- User Info -->
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-3">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
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
                        class="w-5 h-5"
                      />
                    </div>
                    <div>
                      <div class="font-medium text-white">{{ user.username }}</div>
                      <div class="text-sm text-gray-400">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>
                
                <!-- Contact -->
                <td class="py-4 px-4">
                  <div class="space-y-1">
                    <div v-if="user.email" class="text-sm text-white">{{ user.email }}</div>
                    <div v-if="user.phone" class="text-sm text-gray-400">{{ user.phone }}</div>
                    <div v-if="!user.email && !user.phone" class="text-sm text-gray-500">未绑定</div>
                  </div>
                </td>
                
                <!-- Status -->
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-500/20 text-green-400 border border-green-500/30': user.status === 'active',
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': user.status === 'inactive',
                        'bg-red-500/20 text-red-400 border border-red-500/30': user.status === 'banned',
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30': user.status === 'pending'
                      }"
                    >
                      {{ getStatusText(user.status) }}
                    </span>
                    <span
                      v-if="user.userType === 'vip'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30"
                    >
                      <Icon icon="mdi:crown" class="w-3 h-3 mr-1" />
                      VIP
                    </span>
                    <span
                      v-if="user.userType === 'admin'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30"
                    >
                      <Icon icon="mdi:shield-account" class="w-3 h-3 mr-1" />
                      管理员
                    </span>
                  </div>
                </td>
                
                <!-- Credits -->
                <td class="py-4 px-4">
                  <div class="text-center">
                    <div class="text-lg font-bold text-cyber-purple">{{ user.totalCredits.toLocaleString() }}</div>
                    <div class="text-xs text-gray-400">积分</div>
                  </div>
                </td>
                
                <!-- Registration -->
                <td class="py-4 px-4">
                  <div class="space-y-1">
                    <div class="text-sm text-white">{{ formatDate(user.createdAt) }}</div>
                    <div class="flex items-center space-x-1">
                      <Icon 
                        :icon="getSourceIcon(user.registrationSource)"
                        class="w-3 h-3 text-gray-400"
                      />
                      <span class="text-xs text-gray-400">{{ getSourceText(user.registrationSource) }}</span>
                    </div>
                  </div>
                </td>
                
                <!-- Last Login -->
                <td class="py-4 px-4">
                  <div class="text-sm text-gray-400">
                    {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录' }}
                  </div>
                </td>
                
                <!-- Actions -->
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="handleViewUser(user)"
                      class="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-glass-white/10"
                      title="查看详情"
                    >
                      <Icon icon="mdi:eye" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="handleEditUser(user)"
                      class="p-2 text-gray-400 hover:text-cyber-blue transition-colors rounded-lg hover:bg-glass-white/10"
                      title="编辑用户"
                    >
                      <Icon icon="mdi:pencil" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="handleToggleStatus(user)"
                      class="p-2 transition-colors rounded-lg hover:bg-glass-white/10"
                      :class="user.status === 'banned' ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'"
                      :title="user.status === 'banned' ? '解除封禁' : '封禁用户'"
                    >
                      <Icon :icon="user.status === 'banned' ? 'mdi:account-check' : 'mdi:account-off'" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="handleDeleteUser(user)"
                      class="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-glass-white/10"
                      title="删除用户"
                    >
                      <Icon icon="mdi:delete" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </TransitionGroup>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div 
        v-if="!loading && paginatedUsers.length === 0"
        class="text-center py-12"
      >
        <Icon icon="mdi:account-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-400 mb-2">暂无用户</h3>
        <p class="text-gray-500 mb-6">
          {{ hasFilters ? '没有找到符合条件的用户' : '还没有用户注册，等待用户注册...' }}
        </p>
        <CyberButton 
          v-if="hasFilters"
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

    <!-- User Detail Modal (placeholder) -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-glass-dark backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 w-full max-w-2xl m-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">用户详情</h3>
          <button
            @click="showDetailModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" class="w-6 h-6" />
          </button>
        </div>
        <div class="text-center py-12">
          <Icon icon="mdi:tools" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-400 mb-2">详情页开发中</h3>
          <p class="text-gray-500">用户详情页面正在开发中...</p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmModal
      v-model:visible="showDeleteModal"
      title="删除用户"
      :content="`确定要删除用户 「${deletingUser?.username}」 吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import CyberCard from '@/components/UI/CyberCard.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import StatsCard from '@/views/Dashboard/components/StatsCard.vue'
import ConfirmModal from '@/components/UI/ConfirmModal.vue'
import { adminUserAPI } from '@/api'
import type { User } from '@/types'

// State
const loading = shallowRef(false)
const showCreateModal = shallowRef(false)
const showDetailModal = shallowRef(false)
const showDeleteModal = shallowRef(false)

// 使用 shallowRef 优化大数组，避免深度响应式
const users = shallowRef<User[]>([])
const deletingUser = shallowRef<User | null>(null)
const selectedItems = shallowRef<string[]>([])
const selectAll = ref(false)

// Filters and pagination
const filters = shallowRef({
  search: '',
  status: '',
  userType: '',
  registrationSource: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

const pagination = shallowRef({
  current: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// Stats - 使用 shallowRef
const stats = shallowRef({
  total: 1234,
  active: 856,
  newUsers: '43',
  vipUsers: 127,
  bannedUsers: '12'
})

// Computed - 后端已经处理筛选和分页，前端直接显示
const paginatedUsers = computed(() => {
  return users.value
})

const hasFilters = computed(() => {
  return filters.value.search || filters.value.status || filters.value.userType || filters.value.registrationSource
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

// Helper functions
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': '活跃',
    'inactive': '非活跃',
    'banned': '已封禁',
    'pending': '待激活'
  }
  return statusMap[status] || status
}

const getSourceIcon = (source: string): string => {
  const iconMap: Record<string, string> = {
    'wechat': 'mdi:wechat',
    'web': 'mdi:web',
    'mobile': 'mdi:cellphone'
  }
  return iconMap[source] || 'mdi:help'
}

const getSourceText = (source: string): string => {
  const textMap: Record<string, string> = {
    'wechat': '微信小程序',
    'web': '网页注册',
    'mobile': '手机APP'
  }
  return textMap[source] || source
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await adminUserAPI.getUserList({
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      search: filters.value.search || undefined,
      status: filters.value.status || undefined,
      userType: filters.value.userType || undefined,
      registrationSource: filters.value.registrationSource || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder === 'asc' ? 'ASC' : 'DESC'
    })
    
    if (response.data && response.data.success && response.data.data) {
      // 修复：数据在 response.data.data 中，不是 response.data
      users.value = response.data.data.map((user: any) => ({
        id: user.id,
        username: user.username || user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        userType: user.user_type,
        registrationSource: user.registration_source,
        totalCredits: user.credit,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLoginAt: user.last_login_at
      }))
      
      // 修复：total在 response.data.total 中
      pagination.value.total = response.data.total || users.value.length
      pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.pageSize)
    }
  } catch (error: any) {
    console.error('Failed to load users:', error)
    alert(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const updatePagination = () => {
  // 分页信息已在loadUsers中设置，无需重新计算
}

const refreshData = () => {
  loadUsers()
}

const handleSearch = () => {
  pagination.value.current = 1
  loadUsers()
}

const handleFilter = () => {
  pagination.value.current = 1
  loadUsers()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    userType: '',
    registrationSource: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
  pagination.value.current = 1
  loadUsers()
}

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadUsers()
}

const handlePageSizeChange = () => {
  pagination.value.current = 1
  loadUsers()
}

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedUsers.value.map(u => u.id)
  } else {
    selectedItems.value = []
  }
}

const handleViewUser = (user: User) => {
  console.log('View user:', user.username)
  showDetailModal.value = true
}

const handleEditUser = (user: User) => {
  console.log('Edit user:', user.username)
  // TODO: Implement edit functionality
}

const handleToggleStatus = async (user: User) => {
  try {
    const response = await adminUserAPI.toggleBan(user.id)
    if (response.success) {
      await loadUsers()
    }
  } catch (error: any) {
    console.error('Failed to toggle user status:', error)
    alert(error.message || '切换用户状态失败')
  }
}

const handleDeleteUser = (user: User) => {
  deletingUser.value = user
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingUser.value) return
  
  try {
    const response = await adminUserAPI.deleteUser(deletingUser.value.id)
    if (response.success) {
      showDeleteModal.value = false
      deletingUser.value = null
      await loadUsers()
    }
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    alert(error.message || '删除用户失败')
  }
}

const batchSendEmail = () => {
  console.log('Batch send email to:', selectedItems.value.length, 'users')
  // TODO: Implement batch email functionality
}

const batchBanUsers = async () => {
  if (confirm(`确定要封禁选中的 ${selectedItems.value.length} 个用户吗？`)) {
    try {
      const response = await adminUserAPI.batchBan(selectedItems.value.map(id => Number(id)))
      if (response.success) {
        selectedItems.value = []
        selectAll.value = false
        await loadUsers()
      }
    } catch (error: any) {
      console.error('Failed to batch ban users:', error)
      alert(error.message || '批量封禁失败')
    }
  }
}

const batchActivateUsers = async () => {
  try {
    const response = await adminUserAPI.batchActivate(selectedItems.value.map(id => Number(id)))
    if (response.success) {
      selectedItems.value = []
      selectAll.value = false
      await loadUsers()
    }
  } catch (error: any) {
    console.error('Failed to batch activate users:', error)
    alert(error.message || '批量激活失败')
  }
}

const batchDeleteUsers = async () => {
  if (confirm(`确定要删除选中的 ${selectedItems.value.length} 个用户吗？此操作不可撤销。`)) {
    try {
      const response = await adminUserAPI.batchDelete(selectedItems.value.map(id => Number(id)))
      if (response.success) {
        selectedItems.value = []
        selectAll.value = false
        await loadUsers()
      }
    } catch (error: any) {
      console.error('Failed to batch delete users:', error)
      alert(error.message || '批量删除失败')
    }
  }
}

// Watch filters removed - 现在通过handleSearch/handleFilter手动触发

// Watch selectedItems to update selectAll
watch(() => selectedItems.value, () => {
  selectAll.value = selectedItems.value.length === paginatedUsers.value.length && paginatedUsers.value.length > 0
}, { deep: true })

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await adminUserAPI.getStats()
    if (response.success && response.data) {
      stats.value = {
        total: response.data.total,
        active: response.data.active,
        newUsers: response.data.newUsers.toString(),
        vipUsers: response.data.vipUsers,
        bannedUsers: response.data.bannedUsers.toString()
      }
    }
  } catch (error: any) {
    console.error('Failed to load stats:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadStats()
  loadUsers()
})
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-2 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}
</style>