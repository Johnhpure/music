<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleMaskClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="visible"
            class="relative w-full max-w-2xl max-h-[90vh] bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-purple to-purple-600 flex items-center justify-center">
                  <Icon icon="mdi:image-plus" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-xl font-semibold text-white">
                  {{ isEditing ? '编辑 Banner' : '添加 Banner' }}
                </h3>
              </div>
              
              <button
                @click="handleCancel"
                class="p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
                :disabled="loading"
              >
                <Icon icon="mdi:close" class="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Title -->
                <div>
                  <CyberInput
                    v-model="form.title"
                    label="标题"
                    placeholder="输入 Banner 标题"
                    required
                    :error="errors.title"
                    left-icon="mdi:format-title"
                  />
                </div>
                
                <!-- Description -->
                <div>
                  <CyberInput
                    v-model="form.description"
                    label="描述"
                    placeholder="输入 Banner 描述"
                    multiline
                    :rows="3"
                    :error="errors.description"
                    left-icon="mdi:text"
                  />
                </div>
                
                <!-- Image Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Banner 图片 <span class="text-red-400">*</span>
                  </label>
                  
                  <div class="space-y-4">
                    <!-- Upload Area -->
                    <div
                      class="relative border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-cyber-purple transition-colors"
                      :class="{ 'border-cyber-purple bg-cyber-purple/5': isDragOver }"
                      @dragover.prevent="isDragOver = true"
                      @dragleave.prevent="isDragOver = false"
                      @drop.prevent="handleFileDrop"
                    >
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        @change="handleFileSelect"
                      />
                      
                      <div v-if="!form.imageUrl" class="text-center">
                        <Icon icon="mdi:cloud-upload" class="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p class="text-gray-400 mb-2">点击上传或拖拽图片到此处</p>
                        <p class="text-sm text-gray-500">支持 JPG、PNG、WebP 格式，建议尺寸 1200x400</p>
                      </div>
                      
                      <!-- Image Preview -->
                      <div v-else class="relative">
                        <img
                          :src="form.imageUrl"
                          alt="Banner preview"
                          class="w-full h-40 object-cover rounded-lg"
                        />
                        <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                          <div class="flex items-center space-x-2">
                            <button
                              type="button"
                              @click="handleReUpload"
                              class="px-3 py-1 bg-cyber-purple rounded text-white text-sm hover:bg-purple-600 transition-colors"
                            >
                              重新上传
                            </button>
                            <button
                              type="button"
                              @click="form.imageUrl = ''"
                              class="px-3 py-1 bg-red-500 rounded text-white text-sm hover:bg-red-600 transition-colors"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Upload Progress -->
                    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="space-y-2">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-400">上传进度</span>
                        <span class="text-cyber-purple">{{ uploadProgress }}%</span>
                      </div>
                      <div class="w-full bg-gray-700 rounded-full h-2">
                        <div
                          class="bg-gradient-to-r from-cyber-purple to-purple-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${uploadProgress}%` }"
                        ></div>
                      </div>
                    </div>
                    
                    <p v-if="errors.imageUrl" class="text-sm text-red-400">{{ errors.imageUrl }}</p>
                  </div>
                </div>
                
                <!-- Link URL -->
                <div>
                  <CyberInput
                    v-model="form.linkUrl"
                    label="链接地址"
                    placeholder="输入点击跳转的链接 (可选)"
                    type="url"
                    :error="errors.linkUrl"
                    left-icon="mdi:link"
                  />
                </div>
                
                <!-- Date Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CyberInput
                    v-model="form.startDate"
                    label="开始日期"
                    type="date"
                    :error="errors.startDate"
                    left-icon="mdi:calendar-start"
                  />
                  
                  <CyberInput
                    v-model="form.endDate"
                    label="结束日期"
                    type="date"
                    :error="errors.endDate"
                    left-icon="mdi:calendar-end"
                  />
                </div>
                
                <!-- Sort Order -->
                <div>
                  <CyberInput
                    v-model.number="form.sortOrder"
                    label="排序权重"
                    type="number"
                    placeholder="数字越小越靠前"
                    :error="errors.sortOrder"
                    left-icon="mdi:sort-numeric-variant"
                  />
                </div>
                
                <!-- Active Status -->
                <div class="flex items-center justify-between p-4 bg-glass-white/5 rounded-lg border border-gray-700/30">
                  <div>
                    <h4 class="text-sm font-medium text-white">启用状态</h4>
                    <p class="text-xs text-gray-400 mt-1">启用后将在小程序首页显示</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-purple"></div>
                  </label>
                </div>
              </form>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/30 bg-cyber-darker/50">
              <CyberButton
                variant="ghost"
                @click="handleCancel"
                :disabled="loading"
              >
                取消
              </CyberButton>
              
              <CyberButton
                @click="handleSubmit"
                :loading="loading"
                left-icon="mdi:content-save"
              >
                {{ isEditing ? '保存' : '创建' }}
              </CyberButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import CyberInput from '@/components/UI/CyberInput.vue'
import CyberButton from '@/components/UI/CyberButton.vue'
import { fileAPI } from '@/api'
import type { Banner } from '@/types'

interface Props {
  visible: boolean
  banner?: Banner | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  submit: [data: Partial<Banner>]
  cancel: []
}>()

// State
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const uploadProgress = ref(0)

const form = ref({
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  startDate: '',
  endDate: '',
  sortOrder: 1,
  isActive: true
})

const errors = ref<Record<string, string>>({})

// Computed
const isEditing = computed(() => !!props.banner?.id)

// 获取API基础URL，与api/index.ts中的逻辑保持一致
const getApiBaseUrl = (): string => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  }
  
  // 根据当前域名自动判断
  const hostname = window.location.hostname
  if (hostname === 'admin.jianzhile.vip') {
    return 'https://adminapi.jianzhile.vip'
  }
  
  // 本地开发环境
  return 'http://localhost:3000'
}

// Methods
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    sortOrder: 1,
    isActive: true
  }
  errors.value = {}
  uploadProgress.value = 0
}

const loadBannerData = () => {
  if (props.banner) {
    form.value = {
      title: props.banner.title || '',
      description: props.banner.description || '',
      imageUrl: props.banner.imageUrl || '',
      linkUrl: props.banner.linkUrl || '',
      // 后端使用startTime/endTime，需要正确读取
      startDate: (props.banner as any).startTime ? new Date((props.banner as any).startTime).toISOString().split('T')[0] : '',
      endDate: (props.banner as any).endTime ? new Date((props.banner as any).endTime).toISOString().split('T')[0] : '',
      sortOrder: props.banner.sortOrder || 1,
      isActive: props.banner.isActive ?? true
    }
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = '请输入标题'
  }
  
  if (!form.value.imageUrl) {
    errors.value.imageUrl = '请上传 Banner 图片'
  }
  
  if (form.value.linkUrl && !isValidUrl(form.value.linkUrl)) {
    errors.value.linkUrl = '请输入有效的链接地址'
  }
  
  if (form.value.startDate && form.value.endDate) {
    if (new Date(form.value.startDate) > new Date(form.value.endDate)) {
      errors.value.endDate = '结束日期不能早于开始日期'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    uploadFile(files[0])
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    uploadFile(files[0])
  }
}

const uploadFile = async (file: File) => {
  // Validate file
  if (!file.type.startsWith('image/')) {
    errors.value.imageUrl = '只能上传图片文件'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    errors.value.imageUrl = '图片大小不能超过 5MB'
    return
  }
  
  // 清除之前的错误
  delete errors.value.imageUrl
  uploadProgress.value = 0
  
  try {
    console.log('📤 开始上传文件:', file.name, file.size)
    
    // 调用上传API
    const result = await fileAPI.uploadImage(file, (progress) => {
      uploadProgress.value = progress
    })
    
    console.log('📁 完整上传响应:', result)
    console.log('📁 响应data字段:', result.data)
    
    // 处理不同的响应结构
    let fileUrl = ''
    if (result.code === 200 || result.code === 201) {
      // 尝试多种可能的响应结构
      if (result.data?.data?.fileUrl) {
        fileUrl = result.data.data.fileUrl
      } else if (result.data?.fileUrl) {
        fileUrl = result.data.fileUrl
      } else if (result.data) {
        // 如果data直接是fileUrl字符串
        if (typeof result.data === 'string') {
          fileUrl = result.data
        } else {
          console.error('❌ 未找到fileUrl字段，响应结构:', result)
        }
      }
    }
    
    if (fileUrl) {
      // 上传成功 - 处理相对路径和绝对路径
      if (!fileUrl.startsWith('http')) {
        // 相对路径，添加基础URL（使用动态获取的API地址）
        const apiBaseUrl = getApiBaseUrl()
        form.value.imageUrl = `${apiBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
      } else {
        // 绝对路径
        form.value.imageUrl = fileUrl
      }
      
      uploadProgress.value = 100
      
      // 短暂显示完成状态后清除进度条
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
      
      console.log('✅ 图片上传成功，最终URL:', form.value.imageUrl)
    } else {
      throw new Error(result.message || '上传失败')
    }
    
  } catch (error) {
    console.error('❌ 图片上传失败:', error)
    errors.value.imageUrl = error.message || '图片上传失败，请重试'
    uploadProgress.value = 0
  }
}

const handleReUpload = () => {
  fileInput.value?.click()
}

const handleSubmit = () => {
  if (!validateForm()) return
  
  const submitData: any = {
    title: form.value.title.trim(),
    imageUrl: form.value.imageUrl,
    linkUrl: form.value.linkUrl.trim() || undefined,
    // 后端使用startTime/endTime字段名
    startTime: form.value.startDate || undefined,
    endTime: form.value.endDate || undefined,
    sortOrder: form.value.sortOrder,
    isActive: form.value.isActive
  }
  
  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}

const handleMaskClick = () => {
  if (!props.loading) {
    handleCancel()
  }
}

// Watch for banner changes
watch(() => props.banner, () => {
  if (props.visible) {
    nextTick(() => {
      if (props.banner) {
        loadBannerData()
      } else {
        resetForm()
      }
    })
  }
}, { immediate: true })

// Watch for modal visibility
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.banner) {
      loadBannerData()
    } else {
      resetForm()
    }
  }
})
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}
</style>