// Utility functions for question-related operations

export const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: '#52c41a',
    medium: '#fa8c16',
    hard: '#ff4d4f'
  }
  return colors[difficulty as keyof typeof colors] || '#1890ff'
}

export const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty as keyof typeof texts] || difficulty
}

export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

export const getProgressPercent = (practiceCount: number, correctCount: number) => {
  if (practiceCount === 0) return 0
  return Math.round((correctCount / practiceCount) * 100)
}

export const getProgressColor = (percent: number) => {
  if (percent >= 80) return '#52c41a' // 绿色
  if (percent >= 60) return '#fa8c16' // 橙色
  return '#ff4d4f' // 红色
}