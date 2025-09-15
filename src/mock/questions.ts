import type { Question as StoreQuestion } from '@/stores/question'
import api, { questionAPI } from '@/services/api'

// 重新导出Question类型
export type { Question } from '@/stores/question'

// 从API获取题目列表
export const fetchQuestions = async (): Promise<StoreQuestion[]> => {
  try {
    const response = await questionAPI.getAllQuestions()
    // 根据后端API返回的数据结构进行转换
    if (response.success) {
      return response.data.questions.map((question: any) => ({
        id: question.id.toString(),
        title: question.title,
        content: question.content,
        options: question.options || [],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        subject: question.subject,
        tags: question.tags || [],
        createdAt: new Date(question.createdAt),
        updatedAt: new Date(question.updatedAt),
        practiceCount: question.practiceCount || 0,
        correctCount: question.correctCount || 0,
        lastPracticeAt: question.lastPracticeAt ? new Date(question.lastPracticeAt) : undefined,
        isFavorite: question.isFavorite
      }))
    } else {
      throw new Error(response.error?.message || '获取题目列表失败')
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    throw error
  }
}

// 添加题目
export const addQuestion = async (question: Omit<StoreQuestion, 'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'correctCount'>): Promise<StoreQuestion> => {
  try {
    const response = await questionAPI.createQuestion({
      title: question.title,
      content: question.content,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      subject: question.subject,
      tags: question.tags,
      isFavorite: question.isFavorite
    })
    
    if (response.success) {
      const questionData = response.data.question
      return {
        id: questionData.id.toString(),
        title: questionData.title,
        content: questionData.content,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        subject: questionData.subject,
        tags: questionData.tags || [],
        createdAt: new Date(questionData.createdAt),
        updatedAt: new Date(questionData.updatedAt),
        practiceCount: questionData.practiceCount || 0,
        correctCount: questionData.correctCount || 0,
        lastPracticeAt: questionData.lastPracticeAt ? new Date(questionData.lastPracticeAt) : undefined,
        isFavorite: questionData.isFavorite
      }
    } else {
      throw new Error(response.error?.message || '添加题目失败')
    }
  } catch (error) {
    console.error('添加题目失败:', error)
    throw error
  }
}

// 更新题目
export const updateQuestion = async (id: string, updates: Partial<StoreQuestion>): Promise<StoreQuestion | null> => {
  try {
    const response = await questionAPI.updateQuestion(id, updates)
    
    if (response.success) {
      const questionData = response.data.question
      return {
        id: questionData.id.toString(),
        title: questionData.title,
        content: questionData.content,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        subject: questionData.subject,
        tags: questionData.tags || [],
        createdAt: new Date(questionData.createdAt),
        updatedAt: new Date(questionData.updatedAt),
        practiceCount: questionData.practiceCount || 0,
        correctCount: questionData.correctCount || 0,
        lastPracticeAt: questionData.lastPracticeAt ? new Date(questionData.lastPracticeAt) : undefined,
        isFavorite: questionData.isFavorite
      }
    } else {
      throw new Error(response.error?.message || '更新题目失败')
    }
  } catch (error) {
    console.error('更新题目失败:', error)
    throw error
  }
}

// 删除题目
export const deleteQuestion = async (id: string): Promise<boolean> => {
  try {
    const response = await questionAPI.deleteQuestion(id)
    return response.success || false
  } catch (error) {
    console.error('删除题目失败:', error)
    return false
  }
}

// 根据ID获取题目
export const getQuestionById = async (id: string): Promise<StoreQuestion | null> => {
  try {
    const response = await questionAPI.getQuestionById(id)
    
    if (response.success) {
      const questionData = response.data.question
      return {
        id: questionData.id.toString(),
        title: questionData.title,
        content: questionData.content,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty,
        subject: questionData.subject,
        tags: questionData.tags || [],
        createdAt: new Date(questionData.createdAt),
        updatedAt: new Date(questionData.updatedAt),
        practiceCount: questionData.practiceCount || 0,
        correctCount: questionData.correctCount || 0,
        lastPracticeAt: questionData.lastPracticeAt ? new Date(questionData.lastPracticeAt) : undefined,
        isFavorite: questionData.isFavorite
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    return null
  }
}