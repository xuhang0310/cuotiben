import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // 后端API的基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token并添加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (data: { username: string; email: string; password: string }) => 
    api.post('/auth/register', data),

  // 用户登录
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),

  // 获取当前用户信息
  getCurrentUser: () => 
    api.get('/auth/me')
}

// 题目相关API
export const questionAPI = {
  // 获取所有题目
  getAllQuestions: (params?: any) => 
    api.get('/questions', { params }),

  // 根据ID获取题目
  getQuestionById: (id: string) => 
    api.get(`/questions/${id}`),

  // 创建题目
  createQuestion: (data: any) => 
    api.post('/questions', data),

  // 更新题目
  updateQuestion: (id: string, data: any) => 
    api.put(`/questions/${id}`, data),

  // 删除题目
  deleteQuestion: (id: string) => 
    api.delete(`/questions/${id}`),

  // 切换收藏状态
  toggleFavorite: (id: string) => 
    api.post(`/questions/${id}/toggle-favorite`)
}

// 练习相关API
export const practiceAPI = {
  // 开始练习
  startPractice: (data: any) => 
    api.post('/practice/start', data),

  // 提交答案
  submitAnswer: (data: any) => 
    api.post('/practice/submit', data),

  // 获取练习统计数据
  getPracticeStats: (params?: any) => 
    api.get('/practice/stats', { params })
}

// 统计相关API
export const statisticsAPI = {
  // 获取统计数据
  getStatistics: (params?: any) => 
    api.get('/statistics', { params })
}

// OCR相关API
export const ocrAPI = {
  // OCR识别
  recognize: (formData: FormData) => 
    api.post('/ocr/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),

  // 保存OCR识别的题目
  saveQuestion: (data: any) => 
    api.post('/ocr/save-question', data)
}

export default api