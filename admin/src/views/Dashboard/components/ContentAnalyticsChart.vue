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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

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

const chartContainer = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const legendData = computed(() => {
  if (!props.data.datasets[0]) return []
  
  const total = props.data.datasets[0].data.reduce((sum, value) => sum + value, 0)
  
  return props.data.labels.map((label, index) => ({
    name: label,
    value: Math.round((props.data.datasets[0].data[index] / total) * 100),
    color: props.data.datasets[0].backgroundColor[index]
  }))
})

const initChart = async () => {
  if (!chartContainer.value || !props.data) return

  await nextTick()

  // Dispose existing chart
  if (chartInstance) {
    chartInstance.dispose()
  }

  // Create new chart instance
  chartInstance = echarts.init(chartContainer.value, 'dark')

  const seriesData = props.data.labels.map((label, index) => ({
    value: props.data.datasets[0].data[index],
    name: label,
    itemStyle: {
      color: props.data.datasets[0].backgroundColor[index],
      shadowBlur: 10,
      shadowColor: props.data.datasets[0].backgroundColor[index]
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

  chartInstance.setOption(option)

  // Handle resize
  const handleResize = () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }

  window.addEventListener('resize', handleResize)

  // Add hover effects
  chartInstance.on('mouseover', (params) => {
    if (params.dataIndex !== undefined) {
      chartInstance?.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      })
    }
  })

  chartInstance.on('mouseout', (params) => {
    if (params.dataIndex !== undefined) {
      chartInstance?.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      })
    }
  })

  // Auto rotate highlight
  let currentIndex = 0
  const autoHighlight = () => {
    chartInstance?.dispatchAction({
      type: 'downplay',
      seriesIndex: 0,
      dataIndex: currentIndex
    })
    
    currentIndex = (currentIndex + 1) % seriesData.length
    
    chartInstance?.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: currentIndex
    })
  }

  // Start auto highlight after initial animation
  setTimeout(() => {
    setInterval(autoHighlight, 3000)
  }, 2000)
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