import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

/**
 * 用户信息接口
 */
export interface User {
  id: string
  email: string
  username?: string
  avatar?: string
  createdAt?: Date
}

/**
 * 登录表单接口
 */
export interface LoginForm {
  email: string
  password: string
}

/**
 * 用户认证状态管理
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态定义
  const user = ref<User | null>(null)
  const token = ref<string>('')
  const tokenType = ref<string>('Bearer')
  const isLoading = ref<boolean>(false)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  /**
   * 初始化认证状态
   * 从localStorage恢复token和用户信息
   */
  const initAuth = () => {
    const savedToken = localStorage.getItem('access_token')
    const savedTokenType = localStorage.getItem('token_type')
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      token.value = savedToken
      tokenType.value = savedTokenType || 'Bearer'
    }

    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearAuth()
      }
    }
  }

  /**
   * 用户登录
   */
  const login = async (loginForm: LoginForm) => {
    try {
      isLoading.value = true
      
      // 调用登录API
      const response = await authAPI.login(loginForm)
      
      // 保存token信息
      token.value = response.access_token
      tokenType.value = response.token_type
      
      // 保存到localStorage
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('token_type', response.token_type)
      
      // 获取用户信息
      await getCurrentUser()
      
      return { success: true, message: '登录成功' }
    } catch (error: any) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败，请检查邮箱和密码' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取当前用户信息
   */
  const getCurrentUser = async () => {
    try {
      const userData: any = await authAPI.getCurrentUser()
      user.value = userData
      
      // 保存用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取用户信息失败，清除认证状态
      clearAuth()
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    clearAuth()
    // 可以在这里调用后端登出API
    // await authAPI.logout()
  }

  /**
   * 清除认证状态
   */
  const clearAuth = () => {
    user.value = null
    token.value = ''
    tokenType.value = 'Bearer'
    
    // 清除localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user')
  }

  /**
   * 检查token是否有效
   */
  const checkTokenValidity = async () => {
    if (!token.value) return false
    
    try {
      await getCurrentUser()
      return true
    } catch (error) {
      clearAuth()
      return false
    }
  }

  return {
    // 状态
    user,
    token,
    tokenType,
    isLoading,
    
    // 计算属性
    isLoggedIn,
    
    // 方法
    initAuth,
    login,
    logout,
    getCurrentUser,
    clearAuth,
    checkTokenValidity
  }
})