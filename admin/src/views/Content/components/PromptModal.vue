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
                  <Icon icon="mdi:lightbulb-on" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-xl font-semibold text-white">
                  {{ isEditing ? '编辑提示词' : '添加提示词' }}
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
                    label="提示词标题"
                    placeholder="输入提示词标题"
                    required
                    :error="errors.title"
                    left-icon="mdi:format-title"
                  />
                </div>
                
                <!-- Content -->
                <div>
                  <CyberInput
                    v-model="form.content"
                    label="提示词内容"
                    placeholder="输入详细的创作提示词内容..."
                    multiline
                    :rows="4"
                    required
                    :error="errors.content"
                    left-icon="mdi:text"
                    :max-length="500"
                    show-count
                  />
                </div>
                
                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    分类 <span class="text-red-400">*</span>
                  </label>
                  <select 
                    v-model="form.category"
                    class="cyber-input w-full"
                  >
                    <option value="">请选择分类</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
                
                <!-- Tags -->
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">标签</label>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="(tag, index) in form.tags"
                      :key="index"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30"
                    >
                      {{ tag }}
                      <button
                        type="button"
                        @click="removeTag(index)"
                        class="ml-2 hover:text-red-400 transition-colors"
                      >
                        <Icon icon="mdi:close" class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <CyberInput
                      v-model="newTag"
                      placeholder="输入标签按回车添加"
                      @keyup.enter="addTag"
                      class="flex-1"
                    />
                    <CyberButton
                      type="button"
                      size="sm"
                      variant="outline"
                      @click="addTag"
                      :disabled="!newTag.trim()"
                    >
                      添加
                    </CyberButton>
                  </div>
                </div>
              </form>
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
import type { PromptTemplate } from '@/types'

interface Props {
  visible: boolean
  prompt?: PromptTemplate | null
  categories: string[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  submit: [data: Partial<PromptTemplate>]
  cancel: []
}>()

const newTag = ref('')
const form = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[],
  icon: '🎵',
  sortOrder: 1,
  isActive: true
})

const errors = ref<Record<string, string>>({})

const isEditing = computed(() => !!props.prompt?.id)

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const validateForm = (): boolean => {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = '请输入标题'
  if (!form.value.content.trim()) errors.value.content = '请输入内容'
  if (!form.value.category) errors.value.category = '请选择分类'
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validateForm()) return
  emit('submit', form.value)
}

const handleCancel = () => {
  emit('cancel')
}

const handleMaskClick = () => {
  if (!props.loading) {
    handleCancel()
  }
}

watch(() => props.prompt, () => {
  if (props.visible) {
    nextTick(() => {
      if (props.prompt) {
        form.value = { ...props.prompt }
      } else {
        form.value = {
          title: '',
          content: '',
          category: '',
          tags: [],
          icon: '🎵',
          sortOrder: 1,
          isActive: true
        }
      }
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