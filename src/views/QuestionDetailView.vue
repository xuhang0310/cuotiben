<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionStore, type Question } from '@/stores/question'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  EditOutlined,
  RobotOutlined,
  BulbOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import DifficultyTag from '@/components/DifficultyTag.vue'
import SubjectTag from '@/components/SubjectTag.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import PracticeStats from '@/components/PracticeStats.vue'
import { getQuestionById } from '@/mock/questions'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()

// 状态
const loading = ref(true)
const question = ref<Question | null>(null)
const aiAnalysisLoading = ref(false)
const aiAnalysis = ref('')
const relatedQuestions = ref<Question[]>([])

// 获取题目ID
const questionId = computed(() => route.params.id as string)

// 获取题目数据
const fetchQuestionData = async () => {
  loading.value = true
  try {
    const questionData = await getQuestionById(questionId.value)
    if (questionData) {
      question.value = questionData
      // 获取相关题目
      fetchRelatedQuestions()
    } else {
      message.error('题目不存在')
      router.push('/questions')
    }
  } catch (error) {
    console.error('获取题目失败:', error)
    message.error('获取题目失败')
  } finally {
    loading.value = false
  }
}

// 获取相关题目
const fetchRelatedQuestions = () => {
  if (!question.value) return
  
  // 基于相同科目和标签查找相关题目
  const related = questionStore.questions
    .filter(q => 
      q.id !== question.value?.id && 
      (q.subject === question.value?.subject || 
       q.tags.some(tag => question.value?.tags.includes(tag)))
    )
    .slice(0, 5) // 最多显示5个相关题目
  
  relatedQuestions.value = related
}

// 生成AI分析
const generateAIAnalysis = async () => {
  if (!question.value) return
  
  aiAnalysisLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 生成分析内容
    aiAnalysis.value = `
## 🤖 AI智能分析

### 📊 难度评估

根据题目内容和历史数据分析，这道题目的实际难度为 **${getAIDifficulty()}**。

### 🔍 知识点解析

这道题目涉及以下知识点：
${getAIKnowledgePoints()}

### 💡 解题思路

${getAISolutionApproach()}

### 📈 学习建议

${getAILearningAdvice()}

### 🔗 相关概念

${getAIRelatedConcepts()}
    `
    
    message.success('AI分析生成成功')
  } catch (error) {
    console.error('生成AI分析失败:', error)
    message.error('生成AI分析失败')
  } finally {
    aiAnalysisLoading.value = false
  }
}

// 模拟AI分析内容生成
const getAIDifficulty = () => {
  const difficulties = ['简单', '中等偏易', '中等', '中等偏难', '困难']
  const index = Math.floor(Math.random() * difficulties.length)
  return difficulties[index]
}

const getAIKnowledgePoints = () => {
  const subject = question.value?.subject || ''
  
  const knowledgePointsMap: Record<string, string[]> = {
    '数学': ['函数', '几何', '代数', '概率统计', '微积分', '三角函数'],
    '语文': ['文言文', '现代文阅读', '诗词鉴赏', '写作技巧', '修辞手法'],
    '英语': ['时态', '语法', '词汇', '阅读理解', '写作'],
    '物理': ['力学', '热学', '电磁学', '光学', '近代物理'],
    '化学': ['元素周期表', '化学反应', '有机化学', '物质结构', '化学平衡'],
    '生物': ['细胞结构', '遗传学', '生态学', '分子生物学', '人体系统']
  }
  
  const defaultPoints = ['基础概念', '应用能力', '解题技巧']
  const subjectPoints = knowledgePointsMap[subject] || defaultPoints
  
  // 随机选择2-4个知识点
  const count = Math.floor(Math.random() * 3) + 2
  const selectedPoints: string[] = []
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * subjectPoints.length)
    if (!selectedPoints.includes(subjectPoints[index])) {
      selectedPoints.push(subjectPoints[index])
    }
  }
  
  return selectedPoints
    .map(point => `- **${point}**: ${getRandomDescription(point)}`)
    .join('\n')
}

const getRandomDescription = (point: string) => {
  const descriptions = [
    `这是理解${point}的关键基础`,
    `掌握${point}对解决此类问题至关重要`,
    `这道题目考察了${point}的应用能力`,
    `需要灵活运用${point}相关知识`,
    `这是${point}在实际问题中的体现`
  ]
  
  const index = Math.floor(Math.random() * descriptions.length)
  return descriptions[index]
}

const getAISolutionApproach = () => {
  const approaches = [
    '首先理解题目要求，分析已知条件和目标，然后选择合适的解题方法进行求解。',
    '可以采用逐步分析法，将复杂问题分解为若干简单步骤，逐一解决。',
    '建议使用图表辅助思考，将抽象概念可视化，有助于理清思路。',
    '这类题目可以使用公式直接求解，但需要注意单位换算和数据处理。',
    '可以尝试多种解法，比较不同方法的效率和适用性，选择最优解法。'
  ]
  
  const index = Math.floor(Math.random() * approaches.length)
  return approaches[index]
}

const getAILearningAdvice = () => {
  const advice = [
    '建议多做类似题目，加强对相关知识点的理解和应用。',
    '可以尝试创建知识图谱，将相关概念联系起来，形成系统性认知。',
    '这类题目需要注重基础知识的掌握，建议回顾相关章节内容。',
    '建议结合实际场景理解抽象概念，提高知识迁移能力。',
    '可以尝试教会他人这个知识点，这有助于深化理解和记忆。'
  ]
  
  const index = Math.floor(Math.random() * advice.length)
  return advice[index]
}

const getAIRelatedConcepts = () => {
  const concepts = [
    '概念A: 与本题密切相关，是理解更深层次问题的基础',
    '概念B: 本题的延伸应用，在高级题目中常见',
    '概念C: 解决此类问题的另一种思路，值得学习',
    '概念D: 与本题知识点相关联，建议一并掌握',
    '概念E: 本题的理论基础，理解它有助于举一反三'
  ]
  
  // 随机选择2-3个概念
  const count = Math.floor(Math.random() * 2) + 2
  const selectedConcepts: string[] = []
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * concepts.length)
    if (!selectedConcepts.includes(concepts[index])) {
      selectedConcepts.push(concepts[index])
    }
  }
  
  return selectedConcepts.map(concept => `- ${concept}`).join('\n')
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!question.value) return
  
  try {
    const updatedQuestion = await questionStore.toggleFavorite(question.value.id)
    if (updatedQuestion) {
      question.value.isFavorite = updatedQuestion.isFavorite
      message.success(updatedQuestion.isFavorite ? '已添加到收藏' : '已取消收藏')
    } else {
      message.error('操作失败')
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    message.error('操作失败')
  }
}

// 返回列表页
const goBack = () => {
  router.push('/questions')
}

// 编辑题目
const editQuestion = () => {
  if (!question.value) return
  router.push({ 
    path: '/questions', 
    query: { edit: question.value.id } 
  })
}

// 计算正确率
const getAccuracy = (question: Question) => {
  if (question.practiceCount === 0) return '-'
  return `${((question.correctCount / question.practiceCount) * 100).toFixed(1)}%`
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期钩子
onMounted(() => {
  fetchQuestionData()
})
</script>

<template>
  <div class="question-detail-container">
    <!-- 返回按钮 -->
    <div class="back-button">
      <a-button type="text" @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        返回题目列表
      </a-button>
    </div>
    
    <!-- 加载状态 -->
    <a-skeleton :loading="loading" active :paragraph="{ rows: 10 }" v-if="loading">
    </a-skeleton>
    
    <!-- 题目详情 -->
    <template v-if="!loading && question">
      <div class="question-header">
        <div class="question-title">
          <h1>{{ question.title }}</h1>
          <div class="question-actions">
            <FavoriteButton 
              :is-favorite="question.isFavorite"
              @toggle="toggleFavorite"
            />
            
            <a-button 
              type="text" 
              size="large"
              @click="editQuestion"
            >
              <EditOutlined style="font-size: 20px;" />
            </a-button>
          </div>
        </div>
        
        <div class="question-meta">
          <DifficultyTag :difficulty="question.difficulty" />
          <SubjectTag :subject="question.subject" />
          <a-tag v-for="tag in question.tags" :key="tag" color="cyan">
            {{ tag }}
          </a-tag>
        </div>
      </div>
      
      <a-divider />
      
      <div class="question-content">
        <div class="content-section">
          <h2>题目内容</h2>
          <MarkdownRenderer :content="question.content" />
        </div>
        
        <div class="content-section" v-if="question.options && question.options.length > 0">
          <h3>选项</h3>
          <div class="options-list">
            <div 
              v-for="(option, index) in question.options" 
              :key="index"
              class="option-item"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <span>{{ option }}</span>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <h3>正确答案</h3>
          <div class="answer-box">{{ question.correctAnswer }}</div>
        </div>
        
        <div class="content-section" v-if="question.explanation">
          <h3>解析</h3>
          <MarkdownRenderer :content="question.explanation" />
        </div>
      </div>
      
      <a-divider />
      
      <div class="question-stats">
        <h2>练习统计</h2>
        <PracticeStats 
          :practice-count="question.practiceCount"
          :correct-count="question.correctCount"
          :last-practice-at="question.lastPracticeAt"
        />
      </div>
      
      <a-divider />
      
      <!-- AI分析 -->
      <div class="ai-analysis">
        <div class="section-header">
          <h2><RobotOutlined /> AI智能分析</h2>
          <a-button 
            type="primary" 
            @click="generateAIAnalysis"
            :loading="aiAnalysisLoading"
            v-if="!aiAnalysis"
          >
            <template #icon><ThunderboltOutlined /></template>
            生成AI分析
          </a-button>
        </div>
        
        <a-skeleton :loading="aiAnalysisLoading" active :paragraph="{ rows: 6 }" v-if="aiAnalysisLoading">
        </a-skeleton>
        
        <div v-if="aiAnalysis && !aiAnalysisLoading">
          <MarkdownRenderer :content="aiAnalysis" />
        </div>
        
        <div v-if="!aiAnalysis && !aiAnalysisLoading" class="empty-analysis">
          <BulbOutlined style="font-size: 48px; color: #faad14;" />
          <p>点击"生成AI分析"按钮，获取智能解析和学习建议</p>
        </div>
      </div>
      
      <a-divider />
      
      <!-- 相关题目 -->
      <div class="related-questions" v-if="relatedQuestions.length > 0">
        <h2>相关题目</h2>
        <div class="related-list">
          <a-card 
            v-for="relatedQ in relatedQuestions" 
            :key="relatedQ.id"
            hoverable
            class="related-card"
            @click="router.push(`/questions/${relatedQ.id}`)"
          >
            <template #title>
              <div class="related-title">{{ relatedQ.title }}</div>
            </template>
            <template #extra>
              <DifficultyTag :difficulty="relatedQ.difficulty" />
            </template>
            <div class="related-subject">{{ relatedQ.subject }}</div>
          </a-card>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.question-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.back-button {
  margin-bottom: 24px;
}

.question-header {
  margin-bottom: 24px;
}

.question-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color, #1890ff);
}

.question-actions {
  display: flex;
  gap: 8px;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.content-section {
  margin-bottom: 24px;
}

.content-section h2,
.content-section h3 {
  margin-bottom: 16px;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.option-label {
  font-weight: 500;
  min-width: 24px;
}

.answer-box {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 12px 16px;
  border-radius: 4px;
  font-weight: 500;
}

.question-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-item :deep(svg) {
  font-size: 24px;
  color: var(--primary-color, #1890ff);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
}

.ai-analysis {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  background-color: #fafafa;
  border-radius: 8px;
  text-align: center;
}

.empty-analysis p {
  margin-top: 16px;
  color: #8c8c8c;
}

.related-questions {
  margin-bottom: 24px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.related-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.related-card:hover {
  transform: translateY(-4px);
}

.related-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.related-subject {
  color: #8c8c8c;
  font-size: 14px;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e8e8e8;
  padding-left: 16px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #fafafa;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-detail-container {
    padding: 16px;
  }
  
  .question-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .question-title h1 {
    font-size: 20px;
  }
  
  .question-actions {
    align-self: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>