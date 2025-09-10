<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuestionStore } from '@/stores/question'
import type { Question } from '@/stores/question'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { message, Skeleton } from 'ant-design-vue'
import DifficultyTag from '@/components/DifficultyTag.vue'
import SubjectTag from '@/components/SubjectTag.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

const questionStore = useQuestionStore()

// 调试信息
console.log('PracticeView: questionStore initialized', questionStore.questions.length)

// 练习状态
const practiceState = ref<'idle' | 'practicing' | 'finished'>('idle')
const currentQuestionIndex = ref(0)
const userAnswer = ref('')
const showAnswer = ref(false)
const startTime = ref(0)
const timeSpent = ref(0)
const timer = ref<number | null>(null)

// 练习配置
const practiceConfig = ref({
  mode: 'all', // all, wrong, favorite, random
  count: 10,
  subject: '',
  difficulty: ''
})

// 练习题目列表
const practiceQuestions = ref<Question[]>([])

// 练习结果
const practiceResults = ref<{
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
}[]>([])

// 当前题目
const currentQuestion = computed(() => {
  if (practiceQuestions.value.length === 0 || currentQuestionIndex.value >= practiceQuestions.value.length) {
    return null
  }
  return practiceQuestions.value[currentQuestionIndex.value]
})

// 进度信息
const progress = computed(() => {
  if (practiceQuestions.value.length === 0) return { current: 0, total: 0, percentage: 0 }
  const current = currentQuestionIndex.value + 1
  const total = practiceQuestions.value.length
  const percentage = Math.round((current / total) * 100)
  return { current, total, percentage }
})

// 练习统计
const practiceStats = computed(() => {
  const total = practiceResults.value.length
  const correct = practiceResults.value.filter(r => r.isCorrect).length
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const totalTime = practiceResults.value.reduce((sum, r) => sum + r.timeSpent, 0)
  const averageTime = total > 0 ? Math.round(totalTime / total) : 0
  
  return {
    total,
    correct,
    wrong: total - correct,
    accuracy,
    totalTime,
    averageTime
  }
})

// 科目选项
const subjectOptions = computed(() => {
  // 确保问题数据存在
  console.log('PracticeView: calculating subjectOptions', questionStore.questions.length)
  if (!questionStore.questions || questionStore.questions.length === 0) {
    console.log('PracticeView: no questions found')
    return []
  }
  const subjects = Array.from(new Set(questionStore.questions.map(q => q.subject)))
  console.log('PracticeView: subjects found', subjects)
  return subjects.map(subject => ({ label: subject, value: subject }))
})

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

// 练习模式选项
const modeOptions = [
  { label: '全部题目', value: 'all' },
  { label: '错题练习', value: 'wrong' },
  { label: '收藏题目', value: 'favorite' },
  { label: '随机练习', value: 'random' }
]

// 开始计时
const startTimer = () => {
  startTime.value = Date.now()
  timer.value = setInterval(() => {
    timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

// 停止计时
const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

// 获取练习题目
const getPracticeQuestions = () => {
  let questions: Question[] = []
  
  switch (practiceConfig.value.mode) {
    case 'all':
      questions = [...questionStore.questions]
      break
    case 'wrong':
      questions = [...questionStore.wrongQuestions]
      break
    case 'favorite':
      questions = [...questionStore.favoriteQuestions]
      break
    case 'random':
      questions = [...questionStore.questions]
      break
  }
  
  // 科目筛选
  if (practiceConfig.value.subject) {
    questions = questions.filter(q => q.subject === practiceConfig.value.subject)
  }
  
  // 难度筛选
  if (practiceConfig.value.difficulty) {
    questions = questions.filter(q => q.difficulty === practiceConfig.value.difficulty)
  }
  
  // 随机打乱
  if (practiceConfig.value.mode === 'random') {
    questions = questions.sort(() => Math.random() - 0.5)
  }
  
  // 限制数量
  if (practiceConfig.value.count > 0) {
    questions = questions.slice(0, practiceConfig.value.count)
  }
  
  return questions
}

// 开始练习
const startPractice = () => {
  const questions = getPracticeQuestions()
  
  if (questions.length === 0) {
    message.warning('没有找到符合条件的题目')
    return
  }
  
  practiceQuestions.value = questions
  practiceResults.value = []
  currentQuestionIndex.value = 0
  userAnswer.value = ''
  showAnswer.value = false
  practiceState.value = 'practicing'
  startTimer()
}

// 提交答案
const submitAnswer = () => {
  if (!currentQuestion.value || !userAnswer.value.trim()) {
    message.warning('请输入答案')
    return
  }
  
  stopTimer()
  
  const isCorrect = userAnswer.value.trim() === currentQuestion.value.correctAnswer
  const questionTimeSpent = timeSpent.value
  
  // 记录结果
  practiceResults.value.push({
    questionId: currentQuestion.value.id,
    userAnswer: userAnswer.value.trim(),
    isCorrect,
    timeSpent: questionTimeSpent
  })
  
  // 更新题目统计
  questionStore.recordPractice(currentQuestion.value.id, userAnswer.value.trim(), questionTimeSpent)
  
  showAnswer.value = true
  
  if (isCorrect) {
    message.success('回答正确！')
  } else {
    message.error('回答错误')
  }
}

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < practiceQuestions.value.length - 1) {
    currentQuestionIndex.value++
    userAnswer.value = ''
    showAnswer.value = false
    timeSpent.value = 0
    startTimer()
  } else {
    finishPractice()
  }
}

// 结束练习
const finishPractice = () => {
  stopTimer()
  practiceState.value = 'finished'
}

// 重新开始
const restartPractice = () => {
  practiceState.value = 'idle'
  currentQuestionIndex.value = 0
  userAnswer.value = ''
  showAnswer.value = false
  timeSpent.value = 0
  practiceQuestions.value = []
  practiceResults.value = []
}

// 切换收藏状态
const toggleFavorite = (questionId: string) => {
  const isFavorite = questionStore.toggleFavorite(questionId)
  message.success(isFavorite ? '已添加到收藏' : '已取消收藏')
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 组件卸载时清理定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopTimer()
})

// 监听练习状态变化
watch(practiceState, (newState) => {
  if (newState !== 'practicing') {
    stopTimer()
  }
})
</script>

<template>
  <div class="practice-container">
    <!-- 练习配置 -->
    <div v-if="practiceState === 'idle'" class="config-section">
      <PracticeConfigCard
        :config="practiceConfig"
        :subject-options="subjectOptions"
        :difficulty-options="difficultyOptions"
        :mode-options="modeOptions"
        @update:config="(val) => practiceConfig = val"
        @start="startPractice"
      />
    </div>

    <!-- 练习进行中 -->
    <div v-else-if="practiceState === 'practicing' && currentQuestion" class="practice-section">
      <PracticeQuestionCard
        :question="currentQuestion"
        :user-answer="userAnswer"
        :show-answer="showAnswer"
        :time-spent="timeSpent"
        :is-favorite="currentQuestion?.isFavorite || false"
        :is-correct="practiceResults.length > 0 ? practiceResults[practiceResults.length - 1]?.isCorrect : undefined"
        @update:userAnswer="(val) => userAnswer = val"
        @submit="submitAnswer"
        @next="nextQuestion"
        @toggleFavorite="() => currentQuestion && toggleFavorite(currentQuestion.id)"
      >
        <template #nextButtonText>
          {{ currentQuestionIndex < practiceQuestions.length - 1 ? '下一题' : '完成练习' }}
        </template>
      </PracticeQuestionCard>
    </div>

    <!-- 练习结果 -->
    <div v-else-if="practiceState === 'finished'" class="result-section">
      <PracticeResultCard
        :stats="practiceStats"
        @restart="restartPractice"
        @backToConfig="() => practiceState = 'idle'"
      />
    </div>
    
    <!-- 加载状态 -->
    <div v-else class="loading-section">
      <a-spin size="large" />
    </div>
  </div>
</template>

<style scoped>
.practice-container {
  margin: 5px auto;
}

.config-card {
  border-radius: 8px;
}

.progress-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-text {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.question-card {
  border-radius: 8px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  gap: 8px;
}

.question-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: #262626;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.options-list {
  margin-bottom: 20px;
}

.options-group {
  width: 100%;
}

.option-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #d9d9d9;
  background: #fafafa;
}

.option-label {
  font-weight: 500;
  margin-right: 8px;
}

.answer-input {
  margin-bottom: 20px;
}

.answer-section {
  margin-top: 16px;
}

.answer-result {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 6px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.correct-icon {
  color: #52c41a;
  font-size: 18px;
}

.wrong-icon {
  color: #ff4d4f;
  font-size: 18px;
}

.result-text {
  font-size: 16px;
  font-weight: 500;
}

.answer-details p {
  margin: 8px 0;
  font-size: 14px;
}

.explanation {
  margin-top: 12px;
}

.explanation-content {
  margin-top: 4px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
  line-height: 1.6;
}

.question-actions {
  margin-top: 20px;
  text-align: center;
}

.result-card {
  border-radius: 8px;
}

.result-summary {
  margin-bottom: 16px;
}

.result-actions {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-info {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .option-item {
    padding: 8px;
  }
}
</style>