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
            class="relative w-full max-w-4xl max-h-[90vh] bg-cyber-darker/90 backdrop-blur-xl border border-gray-700/30 rounded-lg shadow-cyber-lg overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/30">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Icon icon="mdi:music-note" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-xl font-semibold text-white">
                  {{ isEditing ? '编辑推荐' : '添加推荐' }}
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
            <div class="overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                <!-- Left: Basic Info -->
                <div class="space-y-6">
                  <h4 class="text-lg font-semibold text-white flex items-center">
                    <Icon icon="mdi:information" class="w-5 h-5 mr-2 text-cyan-400" />
                    基本信息
                  </h4>
                  
                  <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Title -->
                    <CyberInput
                      v-model="form.title"
                      label="歌曲标题"
                      placeholder="输入歌曲标题"
                      required
                      :error="errors.title"
                      left-icon="mdi:music-note"
                    />
                    
                    <!-- Artist -->
                    <CyberInput
                      v-model="form.artist"
                      label="艺术家"
                      placeholder="输入艺术家名称"
                      required
                      :error="errors.artist"
                      left-icon="mdi:account-music"
                    />
                    
                    <!-- Genre -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        分类 <span class="text-red-400">*</span>
                      </label>
                      <select 
                        v-model="form.category"
                        class="cyber-input w-full"
                        required
                      >
                        <option value="">请选择分类</option>
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category }}
                        </option>
                      </select>
                      <p v-if="errors.category" class="text-red-400 text-xs mt-1">{{ errors.category }}</p>
                    </div>
                    
                    <!-- Duration -->
                    <CyberInput
                      v-model="form.duration"
                      label="时长"
                      placeholder="例: 3:24"
                      required
                      :error="errors.duration"
                      left-icon="mdi:timer"
                      pattern="[0-9]:[0-5][0-9]"
                    />
                    
                    <!-- Cover Upload/URL -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        封面图片 <span class="text-red-400">*</span>
                      </label>
                      
                      <!-- 上传方式切换 -->
                      <div class="flex items-center space-x-4 mb-3">
                        <button
                          type="button"
                          @click="coverUploadMode = 'file'"
                          class="px-3 py-1 rounded text-sm transition-colors"
                          :class="coverUploadMode === 'file' ? 'bg-cyber-purple text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                        >
                          本地上传
                        </button>
                        <button
                          type="button"
                          @click="coverUploadMode = 'url'"
                          class="px-3 py-1 rounded text-sm transition-colors"
                          :class="coverUploadMode === 'url' ? 'bg-cyber-purple text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                        >
                          URL输入
                        </button>
                      </div>
                      
                      <!-- 文件上传 -->
                      <div v-if="coverUploadMode === 'file'" class="space-y-3">
                        <div
                          class="relative border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-cyber-purple transition-colors"
                          :class="{ 'border-cyber-purple bg-cyber-purple/5': isCoverDragOver }"
                          @dragover.prevent="isCoverDragOver = true"
                          @dragleave.prevent="isCoverDragOver = false"
                          @drop.prevent="handleCoverDrop"
                        >
                          <input
                            ref="coverInput"
                            type="file"
                            accept="image/*"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            @change="handleCoverSelect"
                          />
                          
                          <div v-if="!form.coverUrl" class="text-center">
                            <Icon icon="mdi:cloud-upload" class="w-10 h-10 text-gray-500 mx-auto mb-2" />
                            <p class="text-gray-400 text-sm mb-1">点击或拖拽上传封面</p>
                            <p class="text-xs text-gray-500">支持 JPG、PNG、WebP，最大 5MB</p>
                          </div>
                          
                          <div v-else class="relative">
                            <img
                              :src="form.coverUrl"
                              alt="封面预览"
                              class="w-full h-32 object-cover rounded"
                              @error="handleImageError"
                            />
                            <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <button
                                type="button"
                                @click.stop="coverInput?.click()"
                                class="px-2 py-1 bg-cyber-purple rounded text-white text-sm mr-2"
                              >
                                重新上传
                              </button>
                              <button
                                type="button"
                                @click.stop="form.coverUrl = ''"
                                class="px-2 py-1 bg-red-500 rounded text-white text-sm"
                              >
                                移除
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 上传进度 -->
                        <div v-if="coverUploadProgress > 0 && coverUploadProgress < 100" class="space-y-1">
                          <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-400">上传进度</span>
                            <span class="text-cyber-purple">{{ coverUploadProgress }}%</span>
                          </div>
                          <div class="w-full bg-gray-700 rounded-full h-2">
                            <div
                              class="bg-gradient-to-r from-cyber-purple to-purple-600 h-2 rounded-full transition-all"
                              :style="{ width: `${coverUploadProgress}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- URL输入 -->
                      <CyberInput
                        v-else
                        v-model="form.coverUrl"
                        placeholder="输入图片URL地址"
                        left-icon="mdi:link"
                      />
                      
                      <p v-if="errors.coverUrl" class="text-red-400 text-xs mt-1">{{ errors.coverUrl }}</p>
                    </div>
                    
                    <!-- Audio Upload/URL -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">
                        音频文件 <span class="text-red-400">*</span>
                      </label>
                      
                      <!-- 上传方式切换 -->
                      <div class="flex items-center space-x-4 mb-3">
                        <button
                          type="button"
                          @click="audioUploadMode = 'file'"
                          class="px-3 py-1 rounded text-sm transition-colors"
                          :class="audioUploadMode === 'file' ? 'bg-cyber-purple text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                        >
                          本地上传
                        </button>
                        <button
                          type="button"
                          @click="audioUploadMode = 'url'"
                          class="px-3 py-1 rounded text-sm transition-colors"
                          :class="audioUploadMode === 'url' ? 'bg-cyber-purple text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
                        >
                          URL输入
                        </button>
                      </div>
                      
                      <!-- 文件上传 -->
                      <div v-if="audioUploadMode === 'file'" class="space-y-3">
                        <div
                          class="relative border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-cyber-purple transition-colors"
                          :class="{ 'border-cyber-purple bg-cyber-purple/5': isAudioDragOver }"
                          @dragover.prevent="isAudioDragOver = true"
                          @dragleave.prevent="isAudioDragOver = false"
                          @drop.prevent="handleAudioDrop"
                        >
                          <input
                            ref="audioInput"
                            type="file"
                            accept="audio/*"
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            @change="handleAudioSelect"
                          />
                          
                          <div v-if="!form.audioUrl" class="text-center">
                            <Icon icon="mdi:music-box-outline" class="w-10 h-10 text-gray-500 mx-auto mb-2" />
                            <p class="text-gray-400 text-sm mb-1">点击或拖拽上传音频</p>
                            <p class="text-xs text-gray-500">支持 MP3、WAV、OGG，最大 50MB</p>
                          </div>
                          
                          <div v-else class="flex items-center justify-between">
                            <div class="flex items-center space-x-3 flex-1 min-w-0">
                              <Icon icon="mdi:file-music" class="w-8 h-8 text-cyan-400 flex-shrink-0" />
                              <div class="flex-1 min-w-0">
                                <p class="text-white text-sm truncate">{{ audioFileName }}</p>
                                <p class="text-gray-400 text-xs">{{ audioDuration || '时长未知' }}</p>
                              </div>
                            </div>
                            <div class="flex items-center space-x-2">
                              <button
                                type="button"
                                @click.stop="audioInput?.click()"
                                class="px-2 py-1 bg-cyber-purple rounded text-white text-sm"
                              >
                                重新上传
                              </button>
                              <button
                                type="button"
                                @click.stop="form.audioUrl = ''; audioFileName = ''; audioDuration = ''"
                                class="px-2 py-1 bg-red-500 rounded text-white text-sm"
                              >
                                移除
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <!-- 上传进度 -->
                        <div v-if="audioUploadProgress > 0 && audioUploadProgress < 100" class="space-y-1">
                          <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-400">上传进度</span>
                            <span class="text-cyber-purple">{{ audioUploadProgress }}%</span>
                          </div>
                          <div class="w-full bg-gray-700 rounded-full h-2">
                            <div
                              class="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                              :style="{ width: `${audioUploadProgress}%` }"
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- URL输入 -->
                      <CyberInput
                        v-else
                        v-model="form.audioUrl"
                        placeholder="输入音频URL地址"
                        left-icon="mdi:link"
                      />
                      
                      <p v-if="errors.audioUrl" class="text-red-400 text-xs mt-1">{{ errors.audioUrl }}</p>
                    </div>
                    
                    <!-- Description -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">描述</label>
                      <textarea
                        v-model="form.description"
                        class="cyber-input w-full"
                        rows="3"
                        placeholder="输入推荐描述..."
                      ></textarea>
                    </div>
                  </form>
                </div>
                
                <!-- Right: Settings and Preview -->
                <div class="space-y-6">
                  <h4 class="text-lg font-semibold text-white flex items-center">
                    <Icon icon="mdi:cog" class="w-5 h-5 mr-2 text-purple-400" />
                    设置与预览
                  </h4>
                  
                  <!-- Preview -->
                  <div class="bg-glass-white/5 rounded-lg p-4 border border-gray-700/30">
                    <h5 class="text-white font-medium mb-3">预览效果</h5>
                    
                    <div class="bg-cyber-dark rounded-lg p-4 border border-gray-700/30">
                      <!-- Cover -->
                      <div class="flex items-center space-x-4 mb-4">
                        <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            v-if="form.coverUrl"
                            :src="form.coverUrl"
                            :alt="form.title || '歌曲封面'"
                            class="w-full h-full object-cover"
                            @error="handleImageError"
                          />
                          <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
                            <Icon icon="mdi:music-note" class="w-6 h-6" />
                          </div>
                        </div>
                        
                        <div class="flex-1 min-w-0">
                          <h6 class="font-semibold text-white truncate">
                            {{ form.title || '歌曲标题' }}
                          </h6>
                          <p class="text-sm text-gray-400 truncate">
                            {{ form.artist || '艺术家' }}
                          </p>
                          <div class="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                            <span>{{ form.category || '未分类' }}</span>
                            <span>{{ form.duration || '0:00' }}</span>
                          </div>
                        </div>
                        
                        <button class="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
                          <Icon icon="mdi:play" class="w-4 h-4" />
                        </button>
                      </div>
                      

                    </div>
                  </div>
                  
                  <!-- Settings -->
                  <div class="space-y-4">
                    <!-- Active Status -->
                    <div class="flex items-center justify-between p-4 bg-glass-white/5 rounded-lg border border-gray-700/30">
                      <div class="flex items-center space-x-3">
                        <Icon icon="mdi:eye" class="w-5 h-5 text-green-400" />
                        <div>
                          <h6 class="text-white font-medium">启用状态</h6>
                          <p class="text-xs text-gray-400">禁用后用户将无法在小程序中看到此推荐</p>
                        </div>
                      </div>
                      
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          v-model="form.isActive"
                          type="checkbox"
                          class="sr-only peer"
                        />
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    
                    <!-- Sort Order -->
                    <div>
                      <label class="block text-sm font-medium text-gray-300 mb-2">排序权重</label>
                      <CyberInput
                        v-model.number="form.sortOrder"
                        type="number"
                        placeholder="数字越小越靠前"
                        min="1"
                        max="999"
                        left-icon="mdi:sort-numeric-variant"
                      />
                      <p class="text-xs text-gray-500 mt-1">数字越小，在列表中的位置越靠前</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-700/30">
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
import type { HotRecommendation } from '@/types'

interface Props {
  visible: boolean
  recommendation?: HotRecommendation | null
  categories: string[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  submit: [data: Partial<HotRecommendation>]
  cancel: []
}>()

// State
const coverInput = ref<HTMLInputElement>()
const audioInput = ref<HTMLInputElement>()
const isCoverDragOver = ref(false)
const isAudioDragOver = ref(false)
const coverUploadProgress = ref(0)
const audioUploadProgress = ref(0)
const coverUploadMode = ref<'file' | 'url'>('file')
const audioUploadMode = ref<'file' | 'url'>('file')
const audioFileName = ref('')
const audioDuration = ref('')

const form = ref({
  title: '',
  artist: '',
  category: '',
  duration: '',
  coverUrl: '',
  audioUrl: '',
  description: '',
  isActive: true,
  sortOrder: 1
})

const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.recommendation?.id)

// 获取API基础URL
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  }
  const hostname = window.location.hostname
  if (hostname === 'admin.jianzhile.vip') {
    return 'https://adminapi.jianzhile.vip'
  }
  return 'http://localhost:3000'
}

// File upload handlers
const handleCoverSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    uploadCoverFile(files[0])
  }
}

const handleCoverDrop = (event: DragEvent) => {
  isCoverDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    uploadCoverFile(files[0])
  }
}

const uploadCoverFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    errors.value.coverUrl = '只能上传图片文件'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.value.coverUrl = '图片大小不能超过 5MB'
    return
  }
  
  delete errors.value.coverUrl
  coverUploadProgress.value = 0
  
  try {
    const result = await fileAPI.uploadImage(file, (progress) => {
      coverUploadProgress.value = progress
    })
    
    let fileUrl = ''
    if (result.code === 200 || result.code === 201) {
      if (result.data?.data?.fileUrl) {
        fileUrl = result.data.data.fileUrl
      } else if (result.data?.fileUrl) {
        fileUrl = result.data.fileUrl
      } else if (typeof result.data === 'string') {
        fileUrl = result.data
      }
    }
    
    if (fileUrl) {
      if (!fileUrl.startsWith('http')) {
        const apiBaseUrl = getApiBaseUrl()
        form.value.coverUrl = `${apiBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
      } else {
        form.value.coverUrl = fileUrl
      }
      coverUploadProgress.value = 100
      setTimeout(() => { coverUploadProgress.value = 0 }, 1000)
    } else {
      throw new Error(result.message || '上传失败')
    }
  } catch (error: any) {
    errors.value.coverUrl = error.message || '封面上传失败'
    coverUploadProgress.value = 0
  }
}

const handleAudioSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files[0]) {
    uploadAudioFile(files[0])
  }
}

const handleAudioDrop = (event: DragEvent) => {
  isAudioDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    uploadAudioFile(files[0])
  }
}

const uploadAudioFile = async (file: File) => {
  if (!file.type.startsWith('audio/')) {
    errors.value.audioUrl = '只能上传音频文件'
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    errors.value.audioUrl = '音频大小不能超过 50MB'
    return
  }
  
  delete errors.value.audioUrl
  audioUploadProgress.value = 0
  audioFileName.value = file.name
  
  // 提取音频时长
  try {
    const duration = await getAudioDuration(file)
    audioDuration.value = formatDuration(duration)
    form.value.duration = formatDuration(duration)
  } catch (err) {
    console.warn('无法获取音频时长:', err)
  }
  
  try {
    const result = await fileAPI.uploadImage(file, (progress) => {
      audioUploadProgress.value = progress
    })
    
    let fileUrl = ''
    if (result.code === 200 || result.code === 201) {
      if (result.data?.data?.fileUrl) {
        fileUrl = result.data.data.fileUrl
      } else if (result.data?.fileUrl) {
        fileUrl = result.data.fileUrl
      } else if (typeof result.data === 'string') {
        fileUrl = result.data
      }
    }
    
    if (fileUrl) {
      if (!fileUrl.startsWith('http')) {
        const apiBaseUrl = getApiBaseUrl()
        form.value.audioUrl = `${apiBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
      } else {
        form.value.audioUrl = fileUrl
      }
      audioUploadProgress.value = 100
      setTimeout(() => { audioUploadProgress.value = 0 }, 1000)
    } else {
      throw new Error(result.message || '上传失败')
    }
  } catch (error: any) {
    errors.value.audioUrl = error.message || '音频上传失败'
    audioUploadProgress.value = 0
  }
}

// 获取音频时长
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    
    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src)
      resolve(audio.duration)
    }
    
    audio.onerror = () => {
      window.URL.revokeObjectURL(audio.src)
      reject(new Error('无法加载音频'))
    }
    
    audio.src = window.URL.createObjectURL(file)
  })
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (!img.dataset.fallback) {
    img.dataset.fallback = 'true'
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMzc0MTUxIiByeD0iOCIvPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3Mjg0IiBzdHJva2Utd2lkdGg9IjIiLz4KPHA+4paqPC9wPgo8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSI0IiBmaWxsPSIjNkI3Mjg0Ii8+Cjwvc3ZnPgo='
  }
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = '请输入歌曲标题'
  }
  
  if (!form.value.artist.trim()) {
    errors.value.artist = '请输入艺术家'
  }
  
  if (!form.value.category) {
    errors.value.category = '请选择分类'
  }
  
  if (!form.value.duration.trim()) {
    errors.value.duration = '请输入时长'
  } else if (!/^\d:[0-5]\d$/.test(form.value.duration)) {
    errors.value.duration = '时长格式不正确，应为 M:SS 格式'
  }
  
  if (!form.value.coverUrl.trim()) {
    errors.value.coverUrl = '请输入封面图片'
  }
  
  if (!form.value.audioUrl.trim()) {
    errors.value.audioUrl = '请输入音频文件'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) return
  // 确保数据类型正确
  const submitData = {
    ...form.value,
    isActive: Boolean(form.value.isActive),
    sortOrder: Number(form.value.sortOrder)
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

watch(() => props.recommendation, () => {
  if (props.visible) {
    nextTick(() => {
      if (props.recommendation) {
        form.value = {
          title: props.recommendation.title,
          artist: props.recommendation.artist,
          category: props.recommendation.category,
          duration: props.recommendation.duration,
          coverUrl: props.recommendation.coverUrl,
          audioUrl: props.recommendation.audioUrl,
          description: props.recommendation.description || '',
          isActive: Boolean(props.recommendation.isActive),
          sortOrder: props.recommendation.sortOrder
        }
      } else {
        form.value = {
          title: '',
          artist: '',
          category: '',
          duration: '',
          coverUrl: '',
          audioUrl: '',
          description: '',
          isActive: true,
          sortOrder: 1
        }
      }
      errors.value = {}
    })
  }
}, { immediate: true })
</script>

<style scoped>
.cyber-input {
  @apply w-full px-4 py-3 bg-glass-white/10 backdrop-blur-xl border border-gray-700/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all duration-300;
}

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