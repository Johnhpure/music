<template>
  <div class="min-h-screen flex items-center justify-center bg-cyber-darker">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-pink-500">
          404
        </h1>
      </div>
      
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-white mb-4">页面未找到</h2>
        <p class="text-gray-400 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。
        </p>
      </div>
      
      <div class="space-x-4">
        <router-link
          to="/dashboard"
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyber-purple to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
        >
          返回首页
        </router-link>
        
        <button
          @click="$router.go(-1)"
          class="inline-flex items-center px-6 py-3 bg-glass-white/10 text-white font-medium rounded-lg border border-gray-600 hover:bg-glass-white/20 transition-all duration-300"
        >
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 Error Page
</script>