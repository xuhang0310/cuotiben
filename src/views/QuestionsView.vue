<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { questionAPI } from '../services/api'
import { message } from 'ant-design-vue'
import { QuestionTable, QuestionForm } from '../components'

const router = useRouter()
const route = useRoute()

// 题目数据
const questions = ref<any[]>([])

// 加载状态
const loading = ref(false)

// 高级筛选显示状态
const showAdvancedFilter = ref(false)

// 搜索和筛选
const searchForm = reactive({
  keyword: '',
  subject: '',
  difficulty: '',
  isFavorite: false,
  tags: [] as string[],
  dateRange: [] as [string, string] | [],
  practiceStatus: '' // 'all', 'practiced', 'not_practiced'
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 科目选项
const subjectOptions = computed(() => {
  const subjects = Array.from(new Set(questions.value.map(q => q.subject)))
  return subjects.map(subject => ({ label: subject, value: subject }))
})

// 所有标签
const allTags = computed(() => {
  const tagsSet = new Set<string>()
  questions.value.forEach(q => {
    if (q.tags && Array.isArray(q.tags)) {
      q.tags.forEach((tag: string) => tagsSet.add(tag))
    }
  })
  return Array.from(tagsSet)
})

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

// 弹窗状态
const modalVisible = ref(false)
const editingQuestion = ref<any | null>(null)
const isEditing = computed(() => !!editingQuestion.value)

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
  difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  subject: '',
  tags: [] as string[]
})

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    subject: '',
    difficulty: '',
    isFavorite: false,
    tags: [],
    dateRange: [],
    practiceStatus: ''
  })
  pagination.current = 1
  loadQuestions()
}

// 打开添加/编辑弹窗
const openModal = (question?: any) => {
  if (question) {
    editingQuestion.value = question
    Object.assign(formData, {
      title: question.title || '',
      content: question.content || '',
      options: question.options && Array.isArray(question.options) ? [...question.options] : ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || '',
      difficulty: question.difficulty || 'medium',
      subject: question.subject || '',
      tags: question.tags && Array.isArray(question.tags) ? [...question.tags] : []
    })
  } else {
    editingQuestion.value = null
    Object.assign(formData, {
      title: '',
      content: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      difficulty: 'medium',
      subject: '',
      tags: []
    })
  }
  modalVisible.value = true
}

// 关闭弹窗
const closeModal = () => {
  modalVisible.value = false
  editingQuestion.value = null
}

// 保存题目
const saveQuestion = async () => {
  try {
    if (isEditing.value && editingQuestion.value) {
      const updatedQuestion = await questionAPI.updateQuestion(editingQuestion.value.id, {
        title: formData.title,
        content: formData.content,
        options: formData.options.filter((opt: string) => opt.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        subject: formData.subject,
        tags: formData.tags
      })
      
      if (updatedQuestion) {
        message.success('题目更新成功')
        loadQuestions() // 重新加载数据
      } else {
        message.error('题目更新失败')
      }
    } else {
      const newQuestion = await questionAPI.createQuestion({
        title: formData.title,
        content: formData.content,
        options: formData.options.filter((opt: string) => opt.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        subject: formData.subject,
        tags: formData.tags,
        isFavorite: false
      })
      
      message.success('题目添加成功')
      loadQuestions() // 重新加载数据
    }
    closeModal()
  } catch (error) {
    console.error('保存题目失败:', error)
    message.error('保存题目失败')
  }
}

// 删除题目
const handleDeleteQuestion = async (id: string) => {
  try {
    await questionAPI.deleteQuestion(id)
    message.success('题目删除成功')
    loadQuestions() // 重新加载数据
  } catch (error) {
    console.error('删除题目失败:', error)
    message.error('删除题目失败')
  }
}

// 切换收藏状态
const handleToggleFavorite = async (id: string) => {
  try {
    await questionAPI.toggleFavorite(id)
    message.success('操作成功')
    loadQuestions() // 重新加载数据
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    message.error('操作失败')
  }
}

// 查看题目详情
const viewQuestionDetail = (id: string) => {
  router.push(`/questions/${id}`)
}

// 检查URL参数，处理编辑请求
const checkRouteQuery = () => {
  const editId = route.query.edit as string
  if (editId) {
    const question = questions.value.find(q => q.id === editId)
    if (question) {
      openModal(question)
    }
  }
}

// 获取题目数据
const loadQuestions = async () => {
  try {
    loading.value = true
    
    // 构造查询参数
    const params: any = {
      page: pagination.current,
      limit: pagination.pageSize
    }
    
    // 添加搜索和筛选条件
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.subject) params.subject = searchForm.subject
    if (searchForm.difficulty) params.difficulty = searchForm.difficulty
    if (searchForm.isFavorite) params.isFavorite = searchForm.isFavorite
    if (searchForm.tags && searchForm.tags.length > 0) params.tags = searchForm.tags.join(',')
    if (searchForm.practiceStatus) params.practiceStatus = searchForm.practiceStatus
    
    // 添加日期范围
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    const response: any = await questionAPI.getAllQuestions(params)
    console.log('API响应:', response)
    if (response && response.success) {
      questions.value = response.data.questions || []
      pagination.total = response.data.total || 0
    } else {
      questions.value = []
      pagination.total = 0
      message.error('获取题目数据失败')
    }
  } catch (error) {
    console.error('获取题目数据失败:', error)
    questions.value = []
    pagination.total = 0
    message.error('获取题目数据失败')
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watch(
  () => route.query,
  () => {
    checkRouteQuery()
  }
)

// 生命周期钩子
onMounted(() => {
  loadQuestions()
  checkRouteQuery()
})
</script>

<template>
  <div class="questions-container">
    <QuestionTable
      :questions="questions"
      :search-form="searchForm"
      :pagination="pagination"
      :subject-options="subjectOptions"
      :all-tags="allTags"
      :difficulty-options="difficultyOptions"
      :show-advanced-filter="showAdvancedFilter"
      @update:searchForm="(val) => Object.assign(searchForm, val)"
      @update:pagination="(val) => Object.assign(pagination, val)"
      @update:showAdvancedFilter="(val) => showAdvancedFilter = val"
      @search="loadQuestions"
      @resetSearch="resetSearch"
      @view="viewQuestionDetail"
      @edit="openModal"
      @delete="handleDeleteQuestion"
      @toggleFavorite="handleToggleFavorite"
      @add="openModal"
    />

    <!-- 添加/编辑题目弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? '编辑题目' : '添加题目'"
      width="800px"
      @ok="saveQuestion"
      @cancel="closeModal"
    >
      <QuestionForm
        v-model="formData"
        :difficulty-options="difficultyOptions"
        :is-editing="isEditing"
      />
    </a-modal>
  </div>
</template>

<style scoped>
.questions-container {
  margin: 0 auto;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.advanced-filter {
  margin-top: 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 0;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  min-width: 24px;
  font-weight: 500;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .questions-container {
    max-width: 100%;
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .questions-container {
    padding: 0 12px;
  }
  
  .search-card {
    margin-bottom: 12px;
  }
  
  .search-card .ant-form {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-card .ant-form-item {
    margin-bottom: 0;
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    padding: 12px 0;
  }
  
  .toolbar-left,
  .toolbar-right {
    text-align: center;
  }
  
  /* 表格在移动端的优化 */
  .ant-table {
    font-size: 12px;
  }
  
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 8px 4px;
  }
}

@media (max-width: 480px) {
  .questions-container {
    padding: 0 8px;
  }
  
  .search-card .ant-input,
  .search-card .ant-select {
    width: 100% !important;
  }
  
  /* 在小屏幕上隐藏部分列 */
  .ant-table-thead > tr > th:nth-child(3),
  .ant-table-tbody > tr > td:nth-child(3),
  .ant-table-thead > tr > th:nth-child(4),
  .ant-table-tbody > tr > td:nth-child(4),
  .ant-table-thead > tr > th:nth-child(6),
  .ant-table-tbody > tr > td:nth-child(6) {
    display: none;
  }
}
</style>