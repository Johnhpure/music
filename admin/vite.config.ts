import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  // 根据模式确定端口
  const port = mode === 'test' ? 5174 : 5173
  
  return {
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/api': resolve(__dirname, 'src/api'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/assets': resolve(__dirname, 'src/assets')
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'axios',
      'date-fns',
      'lodash-es'
    ],
    exclude: ['@iconify/vue']
  },
  server: {
    host: '0.0.0.0',
    port: port,
    open: false,
    cors: true,
    strictPort: false, // 改为false，允许端口冲突时自动使用其他端口
    proxy: {
      '/api': {
        target: env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    // CSS 代码分割
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        // 优化后的代码分割策略
        manualChunks: (id) => {
          // Vue 核心
          if (id.includes('node_modules/vue') || 
              id.includes('node_modules/@vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')) {
            return 'vue-core'
          }
          
          // ECharts 核心
          if (id.includes('node_modules/echarts/core') ||
              id.includes('node_modules/echarts/renderers')) {
            return 'echarts-core'
          }
          
          // ECharts 图表组件
          if (id.includes('node_modules/echarts/charts') ||
              id.includes('node_modules/echarts/components')) {
            return 'echarts-charts'
          }
          
          // ECharts GL
          if (id.includes('node_modules/echarts-gl')) {
            return 'echarts-gl'
          }
          
          // UI 库
          if (id.includes('node_modules/@headlessui') ||
              id.includes('node_modules/@vueuse/core') ||
              id.includes('node_modules/@vueuse/motion')) {
            return 'ui-libs'
          }
          
          // 工具库
          if (id.includes('node_modules/lodash-es') ||
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/nanoid')) {
            return 'utils'
          }
          
          // Iconify
          if (id.includes('node_modules/@iconify')) {
            return 'iconify'
          }
          
          // 其他 node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,       // 生产环境移除 console
        drop_debugger: true,       // 移除 debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 移除特定函数
        passes: 2                  // 多次压缩优化
      },
      format: {
        comments: false            // 移除注释
      }
    }
  }
}})
