<template>
  <div class="relative w-full h-full">
    <div
      ref="chartContainer"
      class="w-full h-full"
    ></div>
    
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
import { shallowRef, markRaw, onMounted, watch, nextTick, onUnmounted } from 'vue'
// 按需导入 ECharts 模块（性能优化）
import { init } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type {
  LineSeriesOption,
  GridComponentOption,
  TooltipComponentOption
} from 'echarts'
import { use } from 'echarts/core'
import { useDebounceFn } from '@vueuse/core'

// 注册必需的组件
use([LineChart, GridComponent, TooltipComponent, DatasetComponent, CanvasRenderer])

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension?: number
  }>
}

interface Props {
  data: ChartData
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// 使用 shallowRef 避免深度响应式追踪容器元素
const chartContainer = shallowRef<HTMLDivElement>()
// 使用 markRaw 标记的图表实例，避免响应式追踪
let chartInstance: ReturnType<typeof init> | null = null
let highlightTimer: number | null = null
let resizeHandler: (() => void) | null = null

// 使用 shallowRef 存储图表数据，避免深度响应式
const chartData = shallowRef(props.data)

// 防抖更新图表，避免频繁重绘
const updateChart = useDebounceFn(() => {
  if (!chartInstance || !chartData.value) return

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(99, 102, 241, 0.5)'
        }
      }
    },
    xAxis: {
      type: 'category',
      data: chartData.value.labels,
      axisLine: {
        lineStyle: {
          color: 'rgba(156, 163, 175, 0.3)'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: 'rgba(156, 163, 175, 0.8)',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: 'rgba(156, 163, 175, 0.8)',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(156, 163, 175, 0.1)',
          type: 'dashed'
        }
      }
    },
    series: chartData.value.datasets.map(dataset => ({
      name: dataset.label,
      type: 'line',
      data: dataset.data,
      smooth: true,
      lineStyle: {
        color: dataset.borderColor,
        width: 3,
        shadowBlur: 10,
        shadowColor: dataset.borderColor
      },
      itemStyle: {
        color: dataset.borderColor,
        borderWidth: 2,
        shadowBlur: 5,
        shadowColor: dataset.borderColor
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: dataset.backgroundColor.replace('0.1', '0.3')
            },
            {
              offset: 1,
              color: dataset.backgroundColor.replace('0.1', '0.05')
            }
          ]
        }
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowColor: dataset.borderColor
        }
      },
      animationDuration: 2000,
      animationEasing: 'cubicOut'
    }))
  }

  // 使用 notMerge: false 和 lazyUpdate: true 提升性能
  chartInstance.setOption(option, {
    notMerge: false,  // 增量更新
    lazyUpdate: true  // 延迟更新
  })

  // 延迟高亮动画
  if (highlightTimer) {
    clearTimeout(highlightTimer)
  }
  highlightTimer = window.setTimeout(() => {
    if (chartInstance && !chartInstance.isDisposed() && chartData.value.datasets[0]) {
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: chartData.value.datasets[0].data.length - 1
      })
    }
  }, 1000)
}, 100)

const initChart = async () => {
  if (!chartContainer.value || !chartData.value) return

  await nextTick()

  // 清理旧的定时器
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }

  // Dispose existing chart
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  // 使用 markRaw 创建图表实例，避免响应式追踪
  chartInstance = markRaw(init(chartContainer.value, 'dark', {
    renderer: 'canvas',  // 使用 Canvas 渲染器（性能更好）
    useDirtyRect: true   // 启用脏矩形优化
  }))

  // 初始化图表配置
  updateChart()

  // 使用防抖处理 resize 事件
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

// Cleanup
onUnmounted(() => {
  // 清理定时器
  if (highlightTimer) {
    clearTimeout(highlightTimer)
    highlightTimer = null
  }

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