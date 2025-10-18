import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Layout - 同步加载主布局
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// 直接使用动态导入，Vue Router会自动处理异步组件

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardLayout,
    redirect: '/dashboard',
    children: [
      // Dashboard
      {
        path: '/dashboard',
        name: 'Overview',
        component: () => import('@/views/Dashboard/OverviewView.vue'),
        meta: {
          title: '数据概览',
          icon: 'mdi:view-dashboard',
          requiresAuth: true
        }
      },
      
      // Content Management
      {
        path: '/content',
        name: 'ContentManagement',
        meta: {
          title: '内容管理',
          icon: 'mdi:content-copy',
          requiresAuth: true
        },
        children: [
          {
            path: '/content/banners',
            name: 'BannerManagement',
            component: () => import('@/views/Content/BannerManagement.vue'),
            meta: {
              title: 'Banner管理',
              icon: 'mdi:image-multiple',
              requiresAuth: true
            }
          },
          {
            path: '/content/prompts',
            name: 'PromptManagement',
            component: () => import('@/views/Content/PromptManagement.vue'),
            meta: {
              title: '提示词管理',
              icon: 'mdi:lightbulb-on',
              requiresAuth: true
            }
          },
          {
            path: '/content/recommendations',
            name: 'RecommendationManagement',
            component: () => import('@/views/Content/RecommendationManagement.vue'),
            meta: {
              title: '推荐管理',
              icon: 'mdi:star-circle',
              requiresAuth: true
            }
          }
        ]
      },
      
      // User Management
      {
        path: '/users',
        name: 'UserManagement',
        component: () => import('@/views/Users/UserManagement.vue'),
        meta: {
          title: '用户管理',
          icon: 'mdi:account-group',
          requiresAuth: true
        }
      },
      
      // Works Management
      {
        path: '/works',
        name: 'WorksManagement',
        component: () => import('@/views/Works/WorksManagement.vue'),
        meta: {
          title: '作品管理',
          icon: 'mdi:music-note',
          requiresAuth: true
        }
      },
      
      // Analytics
      {
        path: '/analytics',
        name: 'Analytics',
        meta: {
          title: '数据分析',
          icon: 'mdi:chart-line',
          requiresAuth: true
        },
        children: [
          {
            path: '/analytics/users',
            name: 'UserAnalytics',
            component: () => import('@/views/Analytics/UserAnalytics.vue'),
            meta: {
              title: '用户分析',
              icon: 'mdi:account-analytics',
              requiresAuth: true
            }
          },
          {
            path: '/analytics/content',
            name: 'ContentAnalytics',
            component: () => import('@/views/Analytics/ContentAnalytics.vue'),
            meta: {
              title: '内容分析',
              icon: 'mdi:chart-box',
              requiresAuth: true
            }
          }
        ]
      },
      
      // System Settings
      {
        path: '/settings',
        name: 'Settings',
        meta: {
          title: '系统设置',
          icon: 'mdi:cog',
          requiresAuth: true
        },
        children: [
          {
            path: '/settings/system',
            name: 'SystemConfig',
            component: () => import('@/views/Settings/SystemConfig.vue'),
            meta: {
              title: '系统配置',
              icon: 'mdi:cog-outline',
              requiresAuth: true
            }
          },
          {
            path: '/settings/ai',
            name: 'AIConfig',
            component: () => import('@/views/Settings/AIConfig.vue'),
            meta: {
              title: 'AI配置',
              icon: 'mdi:robot',
              requiresAuth: true
            }
          },
          {
            path: '/settings/credits',
            name: 'CreditConfig',
            component: () => import('@/views/Settings/CreditConfig.vue'),
            meta: {
              title: '音乐点数配置',
              icon: 'mdi:coin',
              requiresAuth: true
            }
          }
        ]
      }
    ]
  },
  
  // Auth Routes
  {
    path: '/auth',
    name: 'Auth',
    children: [
      {
        path: '/auth/login',
        name: 'Login',
        component: () => import('@/views/Auth/LoginView.vue'),
        meta: {
          title: '登录',
          hideNavigation: true
        }
      }
    ]
  },
  
  // Error Pages
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/Error/404View.vue'),
    meta: {
      title: '页面未找到',
      hideNavigation: true
    }
  },
  
  // Catch all 404s
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Route guards
router.beforeEach(async (to, from, next) => {
  // Set page title
  const title = to.meta?.title as string
  if (title) {
    document.title = `${title} - AI音乐平台管理控制台`
  }
  
  // Check authentication
  if (to.meta?.requiresAuth) {
    const { getToken } = await import('@/api')
    const token = getToken()
    
    if (!token) {
      console.log('🔒 需要登录，重定向到登录页')
      return next('/auth/login')
    }
  }
  
  next()
})

export default router