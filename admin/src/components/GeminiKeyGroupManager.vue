<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold text-white">Gemini密钥组管理</h3>
        <p class="text-gray-400 text-sm mt-1">支持多KEY轮询策略，提高调用成功率</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 rounded-lg transition-colors flex items-center space-x-2"
      >
        <Icon icon="mdi:plus" class="w-5 h-5" />
        <span>创建KEY组</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <Icon icon="mdi:loading" class="w-8 h-8 text-cyber-purple animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="keyGroups.length === 0" class="text-center py-12">
      <Icon icon="mdi:key-variant-off" class="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <p class="text-gray-400">还没有创建任何KEY组</p>
      <button
        @click="showCreateModal = true"
        class="mt-4 px-4 py-2 bg-cyber-purple/20 hover:bg-cyber-purple/30 text-cyber-purple rounded-lg transition-colors"
      >
        创建第一个KEY组
      </button>
    </div>

    <!-- Key Groups List -->
    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="group in keyGroups"
        :key="group.id"
        class="bg-glass-white/5 border border-gray-700 rounded-xl p-6 hover:border-cyber-purple/50 transition-all"
      >
        <div class="flex items-start justify-between">
          <!-- Group Info -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h4 class="text-lg font-semibold text-white">{{ group.groupName }}</h4>
              <span
                class="px-2 py-0.5 text-xs rounded-full"
                :class="group.isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'"
              >
                {{ group.isActive ? '已启用' : '已禁用' }}
              </span>
              <span
                class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400"
              >
                {{ group.rotationStrategy === 'sequential' ? '顺序轮询' : '故障切换' }}
              </span>
            </div>
            <p v-if="group.description" class="text-gray-400 text-sm mb-4">{{ group.description }}</p>

            <!-- Stats -->
            <div class="grid grid-cols-4 gap-4 mt-4">
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">KEY总数</div>
                <div class="text-xl font-bold text-white">{{ group.totalKeys }}</div>
              </div>
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">可用KEY</div>
                <div class="text-xl font-bold text-green-400">{{ group.activeKeys }}</div>
              </div>
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">总请求数</div>
                <div class="text-xl font-bold text-white">{{ group.requestsCountTotal }}</div>
              </div>
              <div class="bg-glass-white/5 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">成功率</div>
                <div class="text-xl font-bold text-cyber-purple">{{ group.successRate }}</div>
              </div>
            </div>

            <!-- Keys Preview -->
            <div class="mt-4">
              <div class="text-xs text-gray-400 mb-2">密钥列表（{{ group.keys.length }}个）</div>
              <div class="space-y-2">
                <div
                  v-for="(key, index) in group.keys"
                  :key="index"
                  class="flex items-center justify-between bg-glass-white/5 rounded-lg p-2 text-xs"
                >
                  <div class="flex items-center space-x-3">
                    <span class="text-gray-500">#{{ index + 1 }}</span>
                    <span class="font-mono text-gray-300">{{ key.keyPreview }}</span>
                    <span
                      class="px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-green-500/20 text-green-400': key.status === 'active',
                        'bg-red-500/20 text-red-400': key.status === 'error',
                        'bg-yellow-500/20 text-yellow-400': key.status === 'exhausted',
                      }"
                    >
                      {{ key.status }}
                    </span>
                    <span v-if="index === group.currentKeyIndex" class="text-cyber-purple">
                      [当前]
                    </span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-500">
                    <span v-if="key.errorCount > 0">错误: {{ key.errorCount }}</span>
                    <span v-if="key.lastUsedAt">{{ formatTime(key.lastUsedAt) }}</span>
                    <button
                      @click="removeKey(group.id, index)"
                      class="text-red-400 hover:text-red-300"
                      title="移除密钥"
                    >
                      <Icon icon="mdi:delete" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col space-y-2 ml-6">
            <button
              @click="editGroup(group)"
              class="p-2 hover:bg-glass-white/10 rounded-lg transition-colors"
              title="编辑"
            >
              <Icon icon="mdi:pencil" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              @click="resetGroupStatus(group.id)"
              class="p-2 hover:bg-glass-white/10 rounded-lg transition-colors"
              title="重置状态"
            >
              <Icon icon="mdi:refresh" class="w-5 h-5 text-blue-400" />
            </button>
            <button
              @click="deleteGroup(group.id)"
              class="p-2 hover:bg-glass-white/10 rounded-lg transition-colors"
              title="删除"
            >
              <Icon icon="mdi:delete" class="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div 
        v-if="showCreateModal || showEditModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="closeModals"
      >
        <div class="w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 p-6">
          <h3 class="text-xl font-bold text-white mb-6">
            {{ showEditModal ? '编辑KEY组' : '创建KEY组' }}
          </h3>

          <div class="space-y-4">
            <!-- Group Name -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">组名称</label>
              <input
                v-model="formData.groupName"
                type="text"
                class="w-full px-4 py-2 bg-glass-white/5 border border-gray-700 rounded-lg text-white focus:border-cyber-purple outline-none"
                placeholder="例如：Gemini生产环境KEY组"
              />
            </div>

            <!-- Rotation Strategy -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">轮询策略</label>
              <select
                v-model="formData.rotationStrategy"
                class="w-full px-4 py-2 bg-glass-white/5 border border-gray-700 rounded-lg text-white focus:border-cyber-purple outline-none"
              >
                <option value="sequential">顺序轮询 - 依次使用每个KEY</option>
                <option value="failover">故障切换 - 出错时才切换</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">
                {{ formData.rotationStrategy === 'sequential' 
                  ? '每次请求都使用下一个KEY，平均分配请求' 
                  : '使用当前KEY直到出错（429/503），然后自动切换' }}
              </p>
            </div>

            <!-- API Keys -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">API密钥列表（每行一个）</label>
              <textarea
                v-model="apiKeysText"
                rows="6"
                class="w-full px-4 py-2 bg-glass-white/5 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-cyber-purple outline-none"
                placeholder="AIzaSyC..."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                已输入 {{ apiKeysText.split('\n').filter(k => k.trim()).length }} 个密钥
              </p>
            </div>

            <!-- Base URL (Optional) -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">基础URL（可选）</label>
              <input
                v-model="formData.baseUrl"
                type="text"
                class="w-full px-4 py-2 bg-glass-white/5 border border-gray-700 rounded-lg text-white focus:border-cyber-purple outline-none"
                placeholder="留空使用默认值"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm text-gray-400 mb-2">描述（可选）</label>
              <textarea
                v-model="formData.description"
                rows="2"
                class="w-full px-4 py-2 bg-glass-white/5 border border-gray-700 rounded-lg text-white focus:border-cyber-purple outline-none"
                placeholder="备注信息..."
              ></textarea>
            </div>

            <!-- Is Active -->
            <div class="flex items-center space-x-3">
              <input
                v-model="formData.isActive"
                type="checkbox"
                class="w-4 h-4 text-cyber-purple"
              />
              <label class="text-sm text-gray-400">启用此KEY组</label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-4 mt-6">
            <button
              @click="closeModals"
              class="px-4 py-2 bg-glass-white/10 hover:bg-glass-white/20 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="submitForm"
              :disabled="submitting"
              class="px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ submitting ? '保存中...' : showEditModal ? '保存更改' : '创建KEY组' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { geminiKeyGroupAPI } from '@/api'

// State
const loading = ref(false)
const submitting = ref(false)
const keyGroups = ref<any[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingGroupId = ref<number | null>(null)
const apiKeysText = ref('')

// Form Data
const formData = ref({
  groupName: '',
  rotationStrategy: 'sequential' as 'sequential' | 'failover',
  baseUrl: '',
  description: '',
  isActive: true,
})

// Methods
const loadKeyGroups = async () => {
  loading.value = true
  try {
    const response = await geminiKeyGroupAPI.getAllKeyGroups()
    if (response && response.data) {
      keyGroups.value = response.data
    }
  } catch (error: any) {
    console.error('Failed to load key groups:', error)
    alert('加载KEY组失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  const apiKeys = apiKeysText.value.split('\n').filter(k => k.trim())
  
  if (!formData.value.groupName.trim()) {
    alert('请输入组名称')
    return
  }
  
  if (apiKeys.length === 0) {
    alert('请至少添加一个API密钥')
    return
  }

  submitting.value = true
  try {
    const data = {
      ...formData.value,
      apiKeys,
    }

    if (showEditModal.value && editingGroupId.value) {
      await geminiKeyGroupAPI.updateKeyGroup(editingGroupId.value, data)
      alert('KEY组更新成功')
    } else {
      await geminiKeyGroupAPI.createKeyGroup(data)
      alert('KEY组创建成功')
    }

    closeModals()
    loadKeyGroups()
  } catch (error: any) {
    console.error('Failed to submit form:', error)
    alert('操作失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const editGroup = (group: any) => {
  formData.value = {
    groupName: group.groupName,
    rotationStrategy: group.rotationStrategy,
    baseUrl: group.baseUrl || '',
    description: group.description || '',
    isActive: group.isActive,
  }
  
  // 无法显示原始密钥，只能让用户重新输入
  apiKeysText.value = ''
  editingGroupId.value = group.id
  showEditModal.value = true
}

const deleteGroup = async (id: number) => {
  if (!confirm('确定要删除此KEY组吗？此操作不可撤销。')) {
    return
  }

  try {
    await geminiKeyGroupAPI.deleteKeyGroup(id)
    alert('KEY组删除成功')
    loadKeyGroups()
  } catch (error: any) {
    console.error('Failed to delete key group:', error)
    alert('删除失败: ' + (error.message || '未知错误'))
  }
}

const removeKey = async (groupId: number, keyIndex: number) => {
  if (!confirm('确定要从此KEY组移除该密钥吗？')) {
    return
  }

  try {
    await geminiKeyGroupAPI.removeKeyFromGroup(groupId, keyIndex)
    alert('密钥移除成功')
    loadKeyGroups()
  } catch (error: any) {
    console.error('Failed to remove key:', error)
    alert('移除失败: ' + (error.message || '未知错误'))
  }
}

const resetGroupStatus = async (id: number) => {
  if (!confirm('确定要重置此KEY组的所有状态吗？这将清除所有错误记录。')) {
    return
  }

  try {
    await geminiKeyGroupAPI.resetKeyGroupStatus(id)
    alert('KEY组状态重置成功')
    loadKeyGroups()
  } catch (error: any) {
    console.error('Failed to reset key group:', error)
    alert('重置失败: ' + (error.message || '未知错误'))
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingGroupId.value = null
  apiKeysText.value = ''
  formData.value = {
    groupName: '',
    rotationStrategy: 'sequential',
    baseUrl: '',
    description: '',
    isActive: true,
  }
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

// Lifecycle
onMounted(() => {
  loadKeyGroups()
})
</script>
