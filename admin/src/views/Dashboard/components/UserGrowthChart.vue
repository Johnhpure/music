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
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

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

const chartContainer = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = async () => {
  if (!chartContainer.value || !props.data) return

  await nextTick()

  // Dispose existing chart
  if (chartInstance) {
    chartInstance.dispose()
  }

  // Create new chart instance
  chartInstance = echarts.init(chartContainer.value, 'dark')

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
      data: props.data.labels,
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
    series: props.data.datasets.map(dataset => ({
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

  chartInstance.setOption(option)

  // Handle resize
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  window.addEventListener('resize', handleResize)

  // Animate on load
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: props.data.datasets[0].data.length - 1
      })
    }
  }, 1000)
}

// Watch for data changes
watch(() => props.data, initChart, { deep: true })
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
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
})
</script>

<style scoped>
.chart-container {
  background: transparent !important;
}
</style>