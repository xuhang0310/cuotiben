import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import {
  HomeOutlined,
  BookOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  CameraOutlined,
  RobotOutlined,
  FileTextOutlined,
  LoginOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { 
        title: '错题本首页',
        label: '首页',
        icon: HomeOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/capture',
      name: 'capture',
      component: () => import('../views/CaptureView.vue'),
      meta: { 
        title: '拍照录题',
        label: '拍照录题',
        icon: CameraOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/ai-explain',
      name: 'ai-explain',
      component: () => import('../views/AIExplainView.vue'),
      meta: { 
        title: 'AI讲解',
        label: 'AI讲解',
        icon: RobotOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {      path: '/questions',
      name: 'questions',
      component: () => import('../views/QuestionsView.vue'),
      meta: { 
        title: '题目管理',
        label: '题目管理',
        icon: BookOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/questions/:id',
      name: 'question-detail',
      component: () => import('../views/QuestionDetailView.vue'),
      meta: { 
        title: '题目详情',
        label: '题目详情',
        icon: FileTextOutlined,
        showInMenu: false,
        requiresAuth: true
      }
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/PracticeView.vue'),
      meta: { 
        title: '练习模式',
        label: '练习模式',
        icon: PlayCircleOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
      meta: { 
        title: '统计分析',
        label: '统计分析',
        icon: BarChartOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { 
        title: '设置',
        label: '设置',
        icon: SettingOutlined,
        showInMenu: true,
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        title: '用户登录',
        label: '登录',
        icon: LoginOutlined,
        showInMenu: false,
        requiresAuth: false
      }
    }
  ],
})

// 路由守卫 - 保护需要登录的页面
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查目标路由是否需要登录
  if (to.meta.requiresAuth) {
    // 如果用户未登录，重定向到登录页面
    if (!authStore.isLoggedIn) {
      next({
        name: 'login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以重定向回来
      })
      return
    }
  }
  
  // 如果已经登录且访问登录页面，重定向到首页
  if (to.name === 'login' && authStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }
  
  // 允许访问
  next()
})

export default router
