/**
 * 性能优化工具模块
 * 针对Chrome浏览器的特殊优化
 */

import type { App } from 'vue'

/**
 * 检测浏览器类型
 */
export const browserDetector = {
  isChrome: () => {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  },
  isSafari: () => {
    return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
  },
  isFirefox: () => {
    return /Firefox/.test(navigator.userAgent)
  },
  isEdge: () => {
    return /Edg/.test(navigator.userAgent)
  }
}

/**
 * Chrome性能优化配置
 */
export const chromeOptimizations = {
  // 加载Chrome专用样式
  loadChromeStyles: () => {
    if (browserDetector.isChrome()) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/src/assets/styles/chrome-optimized.css'
      document.head.appendChild(link)
      console.log('✅ Chrome优化样式已加载')
    }
  },

  // 禁用Chrome中的高开销动画
  disableExpensiveAnimations: () => {
    if (browserDetector.isChrome()) {
      document.documentElement.classList.add('reduce-motion-chrome')
      console.log('✅ Chrome动画优化已启用')
    }
  },

  // 优化Chrome滚动性能
  optimizeScrolling: () => {
    if (browserDetector.isChrome()) {
      // 启用被动事件监听器
      const originalAddEventListener = EventTarget.prototype.addEventListener
      EventTarget.prototype.addEventListener = function(type: string, listener: any, options: any) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
          if (typeof options !== 'object') {
            options = { passive: true, capture: !!options }
          } else {
            options.passive = true
          }
        }
        originalAddEventListener.call(this, type, listener, options)
      }
      console.log('✅ Chrome滚动优化已启用')
    }
  },

  // 清理未使用的观察器
  cleanupObservers: () => {
    let intersectionObservers = new WeakMap()
    let resizeObservers = new WeakMap()
    
    // 追踪和自动清理IntersectionObserver
    const originalIntersectionObserver = window.IntersectionObserver
    window.IntersectionObserver = class extends originalIntersectionObserver {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options)
        // 自动清理逻辑
        setTimeout(() => {
          if (!document.body.contains((this as any)._root)) {
            this.disconnect()
          }
        }, 30000) // 30秒后检查
      }
    }
  }
}

/**
 * 内存管理优化
 */
export const memoryOptimizer = {
  // 定期清理未使用的事件监听器
  setupEventCleanup: () => {
    const listeners = new Map<Element, Map<string, EventListener[]>>()
    
    // 包装addEventListener
    const originalAdd = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      if (this instanceof Element) {
        if (!listeners.has(this)) {
          listeners.set(this, new Map())
        }
        const elementListeners = listeners.get(this)!
        if (!elementListeners.has(type)) {
          elementListeners.set(type, [])
        }
        elementListeners.get(type)!.push(listener)
      }
      return originalAdd.call(this, type, listener, options)
    }

    // 定期检查并清理
    setInterval(() => {
      listeners.forEach((elementListeners, element) => {
        if (!document.body.contains(element)) {
          elementListeners.forEach((listenersArray, type) => {
            listenersArray.forEach(listener => {
              element.removeEventListener(type, listener)
            })
          })
          listeners.delete(element)
        }
      })
    }, 60000) // 每分钟清理一次
  },

  // 优化定时器管理
  setupTimerCleanup: () => {
    const timers = new Set<number>()
    
    const originalSetInterval = window.setInterval
    window.setInterval = function(...args: any[]): number {
      const id = originalSetInterval.apply(window, args)
      timers.add(id)
      return id
    }
    
    const originalClearInterval = window.clearInterval
    window.clearInterval = function(id: number): void {
      timers.delete(id)
      return originalClearInterval.call(window, id)
    }
    
    // 页面卸载时清理所有定时器
    window.addEventListener('beforeunload', () => {
      timers.forEach(id => clearInterval(id))
    })
  }
}

/**
 * Vue性能优化
 */
export const vueOptimizer = {
  // 配置Vue性能选项
  setupVuePerformance: (app: App) => {
    // 开发环境启用性能追踪
    if (import.meta.env.DEV) {
      app.config.performance = true
    }
    
    // 配置异步组件错误处理
    app.config.errorHandler = (error, vm, info) => {
      console.error('Vue Error:', error, info)
      // 在Chrome中减少错误日志的详细程度
      if (browserDetector.isChrome() && import.meta.env.PROD) {
        console.log('Error occurred, check console for details')
      }
    }
    
    // 配置警告处理
    app.config.warnHandler = (msg, vm, trace) => {
      if (import.meta.env.DEV && !browserDetector.isChrome()) {
        console.warn(msg, trace)
      }
    }
  },

  // 延迟非关键组件加载
  lazyLoadComponents: () => {
    return {
      // 延迟加载图表组件
      ContentAnalyticsChart: () => import('@/views/Dashboard/components/ContentAnalyticsChart.vue'),
      UserGrowthChart: () => import('@/views/Dashboard/components/UserGrowthChart.vue'),
      
      // 延迟加载模态框
      UserModal: () => import('@/views/Users/components/UserModal.vue'),
      BannerModal: () => import('@/views/Content/components/BannerModal.vue')
    }
  }
}

/**
 * 性能监控
 */
export const performanceMonitor = {
  // 监控长任务
  monitorLongTasks: () => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('⚠️ 长任务检测:', {
                duration: entry.duration.toFixed(2) + 'ms',
                startTime: entry.startTime.toFixed(2) + 'ms'
              })
            }
          }
        })
        observer.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        // 某些浏览器可能不支持
      }
    }
  },

  // 监控内存使用
  monitorMemory: () => {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        const usedMemory = memory.usedJSHeapSize / 1048576
        const totalMemory = memory.jsHeapSizeLimit / 1048576
        
        if (usedMemory > totalMemory * 0.9) {
          console.error('⚠️ 内存使用过高:', {
            used: usedMemory.toFixed(2) + 'MB',
            total: totalMemory.toFixed(2) + 'MB',
            percentage: ((usedMemory / totalMemory) * 100).toFixed(2) + '%'
          })
        }
      }, 30000) // 每30秒检查一次
    }
  },

  // 获取性能指标
  getMetrics: () => {
    const metrics: any = {}
    
    // Navigation Timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart
    }
    
    // Paint Timing
    const paintEntries = performance.getEntriesByType('paint')
    paintEntries.forEach(entry => {
      metrics[entry.name] = entry.startTime
    })
    
    // Memory (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      metrics.memory = {
        used: (memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
        total: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + 'MB'
      }
    }
    
    return metrics
  }
}

/**
 * 初始化所有优化
 */
export const initializeOptimizations = (app: App) => {
  console.log('🚀 初始化性能优化...')
  
  // 检测浏览器
  const browser = browserDetector.isChrome() ? 'Chrome' : 
                  browserDetector.isSafari() ? 'Safari' : 
                  browserDetector.isFirefox() ? 'Firefox' : 
                  browserDetector.isEdge() ? 'Edge' : 'Unknown'
  console.log(`📱 检测到浏览器: ${browser}`)
  
  // Chrome特定优化
  if (browserDetector.isChrome()) {
    chromeOptimizations.loadChromeStyles()
    chromeOptimizations.disableExpensiveAnimations()
    chromeOptimizations.optimizeScrolling()
    chromeOptimizations.cleanupObservers()
  }
  
  // 通用内存优化
  memoryOptimizer.setupEventCleanup()
  memoryOptimizer.setupTimerCleanup()
  
  // Vue优化
  vueOptimizer.setupVuePerformance(app)
  
  // 性能监控
  if (import.meta.env.DEV) {
    performanceMonitor.monitorLongTasks()
    performanceMonitor.monitorMemory()
    
    // 5秒后输出性能指标
    setTimeout(() => {
      console.log('📊 性能指标:', performanceMonitor.getMetrics())
    }, 5000)
  }
  
  console.log('✅ 性能优化初始化完成')
}

export default {
  browserDetector,
  chromeOptimizations,
  memoryOptimizer,
  vueOptimizer,
  performanceMonitor,
  initializeOptimizations
}
