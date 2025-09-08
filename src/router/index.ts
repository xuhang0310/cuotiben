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
  FileTextOutlined
} from '@ant-design/icons-vue'

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
        showInMenu: true
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
        showInMenu: true
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
        showInMenu: true
      }
    },
    {      path: '/questions',
      name: 'questions',
      component: () => import('../views/QuestionsView.vue'),
      meta: { 
        title: '题目管理',
        label: '题目管理',
        icon: BookOutlined,
        showInMenu: true
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
        showInMenu: false
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
        showInMenu: true
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
        showInMenu: true
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
        showInMenu: true
      }
    }
  ],
})

export default router
