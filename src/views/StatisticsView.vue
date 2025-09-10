<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestionStore } from '@/stores/question'
import {
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BookOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

const questionStore = useQuestionStore()

// 时间范围选择
const timeRange = ref('week') // week, month, all
const selectedSubject = ref('')

// 时间范围选项
const timeRangeOptions = [
  { label: '最近一周', value: 'week' },
  { label: '最近一月', value: 'month' },
  { label: '全部时间', value: 'all' }
]

// 科目选项
const subjectOptions = computed(() => {
  const subjects = Array.from(new Set(questionStore.questions.map(q => q.subject)))
  return [{ label: '全部科目', value: '' }, ...subjects.map(subject => ({ label: subject, value: subject }))]
})

// 获取时间范围的开始时间
const getTimeRangeStart = () => {
  const now = new Date()
  switch (timeRange.value) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(0)
  }
}

// 过滤练习记录
const filteredRecords = computed(() => {
  const startTime = getTimeRangeStart()
  return questionStore.practiceRecords.filter(record => {
    const recordTime = new Date(record.practiceAt)
    const timeMatch = recordTime >= startTime
    
    if (!selectedSubject.value) return timeMatch
    
    const question = questionStore.questions.find(q => q.id === record.questionId)
    return timeMatch && question?.subject === selectedSubject.value
  })
})

// 基础统计数据
const basicStats = computed(() => {
  const records = filteredRecords.value
  const totalQuestions = questionStore.questions.length
  const totalPracticed = new Set(records.map(r => r.questionId)).size
  const totalAttempts = records.length
  const correctAttempts = records.filter(r => r.isCorrect).length
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
  const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0)
  const averageTime = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0
  
  return {
    totalQuestions,
    totalPracticed,
    totalAttempts,
    correctAttempts,
    wrongAttempts: totalAttempts - correctAttempts,
    accuracy,
    totalTime,
    averageTime
  }
})

// 科目统计
const subjectStats = computed(() => {
  const stats = new Map()
  
  filteredRecords.value.forEach(record => {
    const question = questionStore.questions.find(q => q.id === record.questionId)
    if (!question) return
    
    const subject = question.subject
    if (!stats.has(subject)) {
      stats.set(subject, {
        subject,
        total: 0,
        correct: 0,
        totalTime: 0
      })
    }
    
    const stat = stats.get(subject)
    stat.total++
    if (record.isCorrect) stat.correct++
    stat.totalTime += record.timeSpent
  })
  
  return Array.from(stats.values()).map(stat => ({
    ...stat,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    averageTime: stat.total > 0 ? Math.round(stat.totalTime / stat.total) : 0
  })).sort((a, b) => b.total - a.total)
})

// 难度统计
const difficultyStats = computed(() => {
  const stats = new Map()
  
  filteredRecords.value.forEach(record => {
    const question = questionStore.questions.find(q => q.id === record.questionId)
    if (!question) return
    
    const difficulty = question.difficulty
    if (!stats.has(difficulty)) {
      stats.set(difficulty, {
        difficulty,
        total: 0,
        correct: 0
      })
    }
    
    const stat = stats.get(difficulty)
    stat.total++
    if (record.isCorrect) stat.correct++
  })
  
  return Array.from(stats.values()).map(stat => ({
    ...stat,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
  }))
})

// 每日练习统计
const dailyStats = computed(() => {
  const stats = new Map()
  const startTime = getTimeRangeStart()
  
  // 初始化日期范围
  const days = timeRange.value === 'week' ? 7 : timeRange.value === 'month' ? 30 : 90
  for (let i = 0; i < days; i++) {
    const date = new Date(startTime.getTime() + i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    stats.set(dateStr, {
      date: dateStr,
      total: 0,
      correct: 0
    })
  }
  
  filteredRecords.value.forEach(record => {
    const date = new Date(record.practiceAt).toISOString().split('T')[0]
    if (stats.has(date)) {
      const stat = stats.get(date)
      stat.total++
      if (record.isCorrect) stat.correct++
    }
  })
  
  return Array.from(stats.values()).map(stat => ({
    ...stat,
    accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
  }))
})

// 错题分析
const wrongQuestionAnalysis = computed(() => {
  const wrongRecords = filteredRecords.value.filter(r => !r.isCorrect)
  const questionStats = new Map()
  
  wrongRecords.forEach(record => {
    const question = questionStore.questions.find(q => q.id === record.questionId)
    if (!question) return
    
    if (!questionStats.has(record.questionId)) {
      questionStats.set(record.questionId, {
        question,
        wrongCount: 0,
        totalCount: 0
      })
    }
    
    questionStats.get(record.questionId).wrongCount++
  })
  
  // 计算总练习次数
  filteredRecords.value.forEach(record => {
    if (questionStats.has(record.questionId)) {
      questionStats.get(record.questionId).totalCount++
    }
  })
  
  return Array.from(questionStats.values())
    .map(stat => ({
      ...stat,
      errorRate: stat.totalCount > 0 ? Math.round((stat.wrongCount / stat.totalCount) * 100) : 0
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 10) // 只显示前10个
})

// 学习建议
const studyRecommendations = computed(() => {
  const recommendations = []
  const stats = basicStats.value
  
  if (stats.accuracy < 60) {
    recommendations.push({
      type: 'warning',
      title: '正确率偏低',
      content: '建议加强基础知识学习，多做练习题提高正确率',
      icon: 'CloseCircleOutlined'
    })
  } else if (stats.accuracy >= 90) {
    recommendations.push({
      type: 'success',
      title: '正确率优秀',
      content: '保持良好的学习状态，可以尝试更有挑战性的题目',
      icon: 'TrophyOutlined'
    })
  }
  
  if (stats.averageTime > 120) {
    recommendations.push({
      type: 'info',
      title: '答题速度较慢',
      content: '建议多做限时练习，提高答题速度和效率',
      icon: 'ClockCircleOutlined'
    })
  }
  
  const weakSubjects = subjectStats.value.filter(s => s.accuracy < 70)
  if (weakSubjects.length > 0) {
    recommendations.push({
      type: 'warning',
      title: '薄弱科目',
      content: `${weakSubjects.map(s => s.subject).join('、')} 需要重点关注`,
      icon: 'BookOutlined'
    })
  }
  
  if (stats.totalAttempts === 0) {
    recommendations.push({
      type: 'info',
      title: '开始练习',
      content: '还没有练习记录，建议开始刷题练习',
      icon: 'BookOutlined'
    })
  }
  
  return recommendations
})

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[difficulty as keyof typeof colors] || 'default'
}

// 获取难度文本
const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty as keyof typeof texts] || difficulty
}

// 格式化时间
const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 获取图标组件
const getIconComponent = (iconName: string) => {
  const icons = {
    CloseCircleOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    BookOutlined
  }
  return icons[iconName as keyof typeof icons] || BookOutlined
}

onMounted(() => {
  // 组件挂载时可以做一些初始化工作
})
</script>

<template>
  <div class="statistics-container">
    <!-- 筛选条件 -->
    <a-card class="filter-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="时间范围">
            <a-select v-model:value="timeRange">
              <a-select-option
                v-for="option in timeRangeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="8">
          <a-form-item label="科目筛选">
            <a-select v-model:value="selectedSubject">
              <a-select-option
                v-for="option in subjectOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-card>

    <!-- 基础统计 -->
    <a-card title="学习概览" class="stats-card">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="总题数"
            :value="basicStats.totalQuestions"
            suffix="题"
          >
            <template #prefix>
              <BookOutlined style="color: #1890ff;" />
            </template>
          </a-statistic>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="已练习"
            :value="basicStats.totalPracticed"
            suffix="题"
          >
            <template #prefix>
              <CheckCircleOutlined style="color: #52c41a;" />
            </template>
          </a-statistic>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="正确率"
            :value="basicStats.accuracy"
            suffix="%"
            :value-style="{ color: basicStats.accuracy >= 80 ? '#52c41a' : basicStats.accuracy >= 60 ? '#fa8c16' : '#ff4d4f' }"
          >
            <template #prefix>
              <TrophyOutlined :style="{ color: basicStats.accuracy >= 80 ? '#52c41a' : basicStats.accuracy >= 60 ? '#fa8c16' : '#ff4d4f' }" />
            </template>
          </a-statistic>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="平均用时"
            :value="basicStats.averageTime"
            suffix="秒"
          >
            <template #prefix>
              <ClockCircleOutlined style="color: #722ed1;" />
            </template>
          </a-statistic>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="[16, 16]">
      <!-- 科目统计 -->
      <a-col :xs="24" :lg="12">
        <a-card title="科目统计" class="chart-card">
          <div v-if="subjectStats.length === 0" class="empty-state">
            <a-empty description="暂无数据" />
          </div>
          <div v-else class="subject-stats">
            <div
              v-for="subject in subjectStats"
              :key="subject.subject"
              class="subject-item"
            >
              <div class="subject-header">
                <span class="subject-name">{{ subject.subject }}</span>
                <span class="subject-accuracy" :class="{
                  'high': subject.accuracy >= 80,
                  'medium': subject.accuracy >= 60 && subject.accuracy < 80,
                  'low': subject.accuracy < 60
                }">
                  {{ subject.accuracy }}%
                </span>
              </div>
              <div class="subject-details">
                <span>练习 {{ subject.total }} 题</span>
                <span>正确 {{ subject.correct }} 题</span>
                <span>平均 {{ subject.averageTime }} 秒</span>
              </div>
              <a-progress
                :percent="subject.accuracy"
                :show-info="false"
                :stroke-color="subject.accuracy >= 80 ? '#52c41a' : subject.accuracy >= 60 ? '#fa8c16' : '#ff4d4f'"
              />
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 难度统计 -->
      <a-col :xs="24" :lg="12">
        <a-card title="难度统计" class="chart-card">
          <div v-if="difficultyStats.length === 0" class="empty-state">
            <a-empty description="暂无数据" />
          </div>
          <div v-else class="difficulty-stats">
            <div
              v-for="difficulty in difficultyStats"
              :key="difficulty.difficulty"
              class="difficulty-item"
            >
              <div class="difficulty-header">
                <a-tag :color="getDifficultyColor(difficulty.difficulty)">
                  {{ getDifficultyText(difficulty.difficulty) }}
                </a-tag>
                <span class="difficulty-accuracy">
                  {{ difficulty.accuracy }}%
                </span>
              </div>
              <div class="difficulty-details">
                <span>练习 {{ difficulty.total }} 题</span>
                <span>正确 {{ difficulty.correct }} 题</span>
              </div>
              <a-progress
                :percent="difficulty.accuracy"
                :show-info="false"
                :stroke-color="getDifficultyColor(difficulty.difficulty)"
              />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 错题分析 -->
    <a-card title="错题分析" class="analysis-card">
      <div v-if="wrongQuestionAnalysis.length === 0" class="empty-state">
        <a-empty description="暂无错题数据" />
      </div>
      <div v-else>
        <a-table
          :columns="[
            { title: '题目', dataIndex: 'question', key: 'question', width: '40%' },
            { title: '科目', dataIndex: 'subject', key: 'subject', width: '15%' },
            { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: '15%' },
            { title: '错误次数', dataIndex: 'wrongCount', key: 'wrongCount', width: '15%' },
            { title: '错误率', dataIndex: 'errorRate', key: 'errorRate', width: '15%' }
          ]"
          :data-source="wrongQuestionAnalysis.map((item, index) => ({
            key: index,
            question: item.question.title,
            subject: item.question.subject,
            difficulty: item.question.difficulty,
            wrongCount: item.wrongCount,
            errorRate: item.errorRate
          }))"
          :pagination="{ pageSize: 5 }"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'question'">
              <div class="question-cell">
                <div class="question-title">{{ record.question }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'difficulty'">
              <a-tag :color="getDifficultyColor(record.difficulty)">
                {{ getDifficultyText(record.difficulty) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'errorRate'">
              <span :class="{
                'error-rate-high': record.errorRate >= 70,
                'error-rate-medium': record.errorRate >= 40 && record.errorRate < 70,
                'error-rate-low': record.errorRate < 40
              }">
                {{ record.errorRate }}%
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 学习建议 -->
    <a-card title="学习建议" class="recommendations-card">
      <div v-if="studyRecommendations.length === 0" class="empty-state">
        <a-empty description="暂无建议" />
      </div>
      <div v-else class="recommendations-list">
        <a-alert
          v-for="(recommendation, index) in studyRecommendations"
          :key="index"
          :type="recommendation.type"
          :message="recommendation.title"
          :description="recommendation.content"
          show-icon
          class="recommendation-item"
        />
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.statistics-container {
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.stats-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.chart-card {
  border-radius: 8px;
  height: 400px;
}

.analysis-card {
  margin-top: 16px;
  border-radius: 8px;
}

.recommendations-card {
  margin-top: 16px;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.subject-stats {
  max-height: 320px;
  overflow-y: auto;
}

.subject-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.subject-name {
  font-weight: 500;
  font-size: 14px;
}

.subject-accuracy {
  font-weight: 600;
  font-size: 16px;
}

.subject-accuracy.high {
  color: #52c41a;
}

.subject-accuracy.medium {
  color: #fa8c16;
}

.subject-accuracy.low {
  color: #ff4d4f;
}

.subject-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.difficulty-stats {
  max-height: 320px;
  overflow-y: auto;
}

.difficulty-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.difficulty-accuracy {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.difficulty-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.question-cell {
  max-width: 300px;
}

.question-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-rate-high {
  color: #ff4d4f;
  font-weight: 600;
}

.error-rate-medium {
  color: #fa8c16;
  font-weight: 500;
}

.error-rate-low {
  color: #52c41a;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .subject-details,
  .difficulty-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .chart-card {
    height: auto;
  }
  
  .subject-stats,
  .difficulty-stats {
    max-height: none;
  }
}
</style>