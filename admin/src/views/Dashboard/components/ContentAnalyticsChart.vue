<template>
  <div class="relative w-full h-full">
    <div
      ref="chartContainer"
      class="w-full h-full"
    ></div>
    
    <!-- Legend -->
    <div class="absolute top-4 right-4 space-y-2">
      <div
        v-for="(item, index) in legendData"
        :key="index"
        class="flex items-center space-x-2 text-xs"
      >
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: item.color }"
        ></div>
        <span class="text-gray-300">{{ item.name }}</span>
        <span class="text-white font-medium">{{ item.value }}%</span>
      </div>
    </div>
    
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
    >
      <div class="flex flex-col items-center space-y-2">
        <div class="w-6 h-6 border-2 border-cyber-purple border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-gray-400">加载图表中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, markRaw, onMounted, watch, nextTick, onUnmounted } from 'vue'
// 按需导入 ECharts 模块（性能优化）
import { init } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import { useDebounceFn } from '@vueuse/core'

// 注册必需的组件
use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

interface ChartData {
  labels: string[]
  datasets: Array<{
    data: number[]
    backgroundColor: string[]
    borderWidth?: number
  }>
}

interface Props {
  data: ChartData
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 使用 shallowRef 避免深度响应式
const chartContainer = shallowRef<HTMLDivElement>()
let chartInstance: ReturnType<typeof init> | null = null
let resizeHandler: (() => void) | null = null

// 使用 shallowRef 存储图表数据
const chartData = shallowRef(props.data)

// 优化 computed，使用手动比较避免不必要更新
const legendData = computed(() => {
  if (!chartData.value.datasets[0]) return []
  
  const total = chartData.value.datasets[0].data.reduce((sum, value) => sum + value, 0)
  
  return chartData.value.labels.map((label, index) => ({
    name: label,
    value: Math.round((chartData.value.datasets[0].data[index] / total) * 100),
    color: chartData.value.datasets[0].backgroundColor[index]
  }))
})

// 防抖更新图表
const updateChart = useDebounceFn(() => {
  if (!chartInstance || !chartData.value) return

  const seriesData = chartData.value.labels.map((label, index) => ({
    value: chartData.value.datasets[0].data[index],
    name: label,
    itemStyle: {
      color: chartData.value.datasets[0].backgroundColor[index],
      shadowBlur: 10,
      shadowColor: chartData.value.datasets[0].backgroundColor[index]
    }
  }))

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      show: false // We use custom legend
    },
    series: [
      {
        name: '内容分布',
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(15, 23, 42, 0.8)',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#ffffff',
            formatter: '{b}\n{d}%'
          },
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          }
        },
        labelLine: {
          show: false
        },
        data: seriesData,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100
      }
    ]
  }

  // 使用增量更新和延迟更新提升性能
  chartInstance.setOption(option, {
    notMerge: false,
    lazyUpdate: true
  })

  // 添加鼠标交互事件（移除自动高亮 setInterval）
  chartInstance.off('mouseover')
  chartInstance.off('mouseout')
  
  chartInstance.on('mouseover', (params) => {
    if (params.dataIndex !== undefined && chartInstance && !chartInstance.isDisposed()) {
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      })
    }
  })

  chartInstance.on('mouseout', (params) => {
    if (params.dataIndex !== undefined && chartInstance && !chartInstance.isDisposed()) {
      chartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      })
    }
  })
}, 100)

const initChart = async () => {
  if (!chartContainer.value || !chartData.value) return

  await nextTick()

  // Dispose existing chart
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  // 使用 markRaw 创建图表实例，避免响应式追踪
  chartInstance = markRaw(init(chartContainer.value, 'dark', {
    renderer: 'canvas',
    useDirtyRect: true
  }))

  // 初始化图表
  updateChart()

  // 使用防抖处理 resize
  resizeHandler = useDebounceFn(() => {
    if (chartInstance && !chartInstance.isDisposed()) {
      chartInstance.resize()
    }
  }, 200)

  window.addEventListener('resize', resizeHandler)
}

// Watch for data changes - 使用浅层监听
watch(() => props.data, (newData) => {
  chartData.value = newData
  if (chartInstance) {
    updateChart()
  }
}, { deep: false })

watch(() => props.loading, (loading) => {
  if (!loading) {
    nextTick(initChart)
  }
})

// Lifecycle
onMounted(() => {
  if (!props.loading) {
    initChart()
  }
})

// Cleanup（移除所有 setInterval 相关清理）
onUnmounted(() => {
  // 移除事件监听器
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }

  // 销毁图表实例
  if (chartInstance && !chartInstance.isDisposed()) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.chart-container {
  background: transparent !important;
}
</style>