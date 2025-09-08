import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 题目接口定义
export interface Question {
  id: string
  title: string
  content: string
  options?: string[] // 选择题选项
  correctAnswer: string
  userAnswer?: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  practiceCount: number // 练习次数
  correctCount: number // 正确次数
  lastPracticeAt?: Date
  isFavorite: boolean
}

// 练习记录接口
export interface PracticeRecord {
  id: string
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number // 用时（秒）
  practiceAt: Date
}

/**
 * 错题本状态管理
 * 管理题目数据、练习记录等核心功能
 */
export const useQuestionStore = defineStore('question', () => {
  // 状态定义
  const questions = ref<Question[]>([])
  const practiceRecords = ref<PracticeRecord[]>([])
  const currentQuestion = ref<Question | null>(null)
  const loading = ref(false)
  
  // 计算属性
  const totalQuestions = computed(() => questions.value.length)
  
  const wrongQuestions = computed(() => 
    questions.value.filter(q => q.practiceCount > 0 && q.correctCount < q.practiceCount)
  )
  
  const favoriteQuestions = computed(() => 
    questions.value.filter(q => q.isFavorite)
  )
  
  const questionsBySubject = computed(() => {
    const subjects: Record<string, Question[]> = {}
    questions.value.forEach(q => {
      if (!subjects[q.subject]) {
        subjects[q.subject] = []
      }
      subjects[q.subject].push(q)
    })
    return subjects
  })
  
  const accuracyRate = computed(() => {
    const totalPractice = questions.value.reduce((sum, q) => sum + q.practiceCount, 0)
    const totalCorrect = questions.value.reduce((sum, q) => sum + q.correctCount, 0)
    return totalPractice > 0 ? (totalCorrect / totalPractice * 100).toFixed(1) : '0'
  })
  
  // 方法定义
  
  /**
   * 添加新题目
   */
  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'correctCount'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      practiceCount: 0,
      correctCount: 0,
      isFavorite: false
    }
    questions.value.push(newQuestion)
    return newQuestion
  }
  
  /**
   * 更新题目
   */
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const index = questions.value.findIndex(q => q.id === id)
    if (index !== -1) {
      questions.value[index] = {
        ...questions.value[index],
        ...updates,
        updatedAt: new Date()
      }
      return questions.value[index]
    }
    return null
  }
  
  /**
   * 删除题目
   */
  const deleteQuestion = (id: string) => {
    const index = questions.value.findIndex(q => q.id === id)
    if (index !== -1) {
      questions.value.splice(index, 1)
      // 同时删除相关的练习记录
      practiceRecords.value = practiceRecords.value.filter(r => r.questionId !== id)
      return true
    }
    return false
  }
  
  /**
   * 根据ID获取题目
   */
  const getQuestionById = (id: string) => {
    return questions.value.find(q => q.id === id) || null
  }
  
  /**
   * 记录练习结果
   */
  const recordPractice = (questionId: string, userAnswer: string, timeSpent: number) => {
    const question = getQuestionById(questionId)
    if (!question) return false
    
    const isCorrect = userAnswer === question.correctAnswer
    
    // 更新题目统计
    question.practiceCount++
    if (isCorrect) {
      question.correctCount++
    }
    question.userAnswer = userAnswer
    question.lastPracticeAt = new Date()
    question.updatedAt = new Date()
    
    // 添加练习记录
    const record: PracticeRecord = {
      id: Date.now().toString(),
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      practiceAt: new Date()
    }
    practiceRecords.value.push(record)
    
    return isCorrect
  }
  
  /**
   * 切换收藏状态
   */
  const toggleFavorite = (id: string) => {
    const question = getQuestionById(id)
    if (question) {
      question.isFavorite = !question.isFavorite
      question.updatedAt = new Date()
      return question.isFavorite
    }
    return false
  }
  
  /**
   * 获取练习统计
   */
  const getPracticeStats = (days: number = 7) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const recentRecords = practiceRecords.value.filter(
      r => r.practiceAt >= startDate
    )
    
    return {
      totalPractice: recentRecords.length,
      correctCount: recentRecords.filter(r => r.isCorrect).length,
      averageTime: recentRecords.length > 0 
        ? recentRecords.reduce((sum, r) => sum + r.timeSpent, 0) / recentRecords.length 
        : 0
    }
  }
  
  /**
   * 清空所有数据
   */
  const clearAllData = () => {
    questions.value = []
    practiceRecords.value = []
    currentQuestion.value = null
  }
  
  return {
    // 状态
    questions,
    practiceRecords,
    currentQuestion,
    loading,
    
    // 计算属性
    totalQuestions,
    wrongQuestions,
    favoriteQuestions,
    questionsBySubject,
    accuracyRate,
    
    // 方法
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
    recordPractice,
    toggleFavorite,
    getPracticeStats,
    clearAllData
  }
})