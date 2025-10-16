<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-cyber-dark">
    <!-- Background Animation -->
    <div class="absolute inset-0 overflow-hidden">
      <div 
        class="absolute w-96 h-96 bg-cyber-purple/20 rounded-full blur-3xl"
        :class="['animate-pulse']"
        :style="{ 
          left: '10%', 
          top: '20%',
          animationDelay: '0s',
          animationDuration: '3s'
        }"
      ></div>
      <div 
        class="absolute w-72 h-72 bg-cyber-pink/20 rounded-full blur-3xl"
        :class="['animate-pulse']"
        :style="{ 
          right: '10%', 
          bottom: '20%',
          animationDelay: '1s',
          animationDuration: '3s'
        }"
      ></div>
      <div 
        class="absolute w-64 h-64 bg-cyber-cyan/20 rounded-full blur-3xl"
        :class="['animate-pulse']"
        :style="{ 
          left: '60%', 
          top: '60%',
          animationDelay: '2s',
          animationDuration: '3s'
        }"
      ></div>
    </div>
    
    <!-- Loading Content -->
    <div class="relative z-10 text-center">
      <!-- Logo/Brand -->
      <div class="mb-8">
        <div class="w-24 h-24 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyber-purple to-cyber-pink flex items-center justify-center">
          <Icon 
            icon="mdi:music-note" 
            class="w-12 h-12 text-white"
          />
        </div>
        <h1 class="text-3xl font-bold text-gradient mb-2">
          AI音乐平台
        </h1>
        <p class="text-gray-400 text-lg">
          管理控制台
        </p>
      </div>
      
      <!-- Loading Animation -->
      <div class="mb-8">
        <!-- Spinner -->
        <div class="relative w-16 h-16 mx-auto mb-6">
          <div class="absolute inset-0 rounded-full border-4 border-cyber-purple/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-cyber-purple animate-spin"></div>
          <div class="absolute inset-2 rounded-full border-2 border-transparent border-t-cyber-pink animate-spin animate-reverse" style="animation-duration: 0.8s;"></div>
        </div>
        
        <!-- Loading Text -->
        <div class="space-y-2">
          <p class="text-white font-medium">
            {{ loadingText }}
          </p>
          <div class="flex justify-center space-x-1">
            <div 
              v-for="i in 3" 
              :key="i"
              class="w-2 h-2 bg-cyber-purple rounded-full animate-bounce"
              :style="{ animationDelay: `${i * 0.2}s` }"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-64 mx-auto">
        <div class="w-full bg-gray-700/30 rounded-full h-1 overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-cyber-purple to-cyber-pink transition-all duration-1000 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          {{ progress }}%
        </p>
      </div>
      
      <!-- Feature List -->
      <div class="mt-8 text-sm text-gray-400 space-y-1">
        <div 
          v-for="(feature, index) in features" 
          :key="feature"
          class="flex items-center justify-center space-x-2 transition-all duration-300"
          :class="{ 
            'text-cyber-purple': index <= currentFeatureIndex,
            'opacity-50': index > currentFeatureIndex 
          }"
        >
          <Icon 
            :icon="index <= currentFeatureIndex ? 'mdi:check-circle' : 'mdi:circle-outline'" 
            class="w-4 h-4"
          />
          <span>{{ feature }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const progress = ref(100) // 直接显示完成状态
const currentFeatureIndex = ref(4) // 显示所有功能已加载
const loadingText = ref('加载完成!')

const features = [
  '加载系统配置',
  '连接数据服务',
  '初始化用户界面',
  '准备数据分析',
  '启动管理控制台'
]

const loadingTexts = [
  '正在初始化...',
  '加载核心模块...',
  '连接后端服务...',
  '准备用户界面...',
  '即将完成...'
]

// 移除所有 setInterval 动画，使用纯 CSS 动画
</script>

<style scoped>
.animate-reverse {
  animation-direction: reverse;
}
</style>