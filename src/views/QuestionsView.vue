<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion as deleteMockQuestion, type Question } from '@/mock/questions'
import { message } from 'ant-design-vue'
import QuestionTable from '@/components/QuestionTable.vue'

const router = useRouter()
const route = useRoute()

// 题目数据
const questions = ref<Question[]>([])

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
    q.tags.forEach(tag => tagsSet.add(tag))
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
const editingQuestion = ref<Question | null>(null)
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

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  correctAnswer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择科目', trigger: 'change' }]
}

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
}

// 打开添加/编辑弹窗
const openModal = (question?: Question) => {
  if (question) {
    editingQuestion.value = question
    Object.assign(formData, {
      title: question.title,
      content: question.content,
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      subject: question.subject,
      tags: [...question.tags]
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
      const updatedQuestion = await updateQuestion(editingQuestion.value.id, {
        title: formData.title,
        content: formData.content,
        options: formData.options.filter(opt => opt.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        subject: formData.subject,
        tags: formData.tags
      })
      if (updatedQuestion) {
        // 更新本地数据
        const index = questions.value.findIndex(q => q.id === editingQuestion.value?.id)
        if (index !== -1) {
          questions.value[index] = updatedQuestion
        }
        message.success('题目更新成功')
      } else {
        message.error('题目更新失败')
      }
    } else {
      const newQuestion = await addQuestion({
        title: formData.title,
        content: formData.content,
        options: formData.options.filter(opt => opt.trim()),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        subject: formData.subject,
        tags: formData.tags,
        isFavorite: false
      })
      // 添加到本地数据
      questions.value.push(newQuestion)
      message.success('题目添加成功')
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
    const success = await deleteMockQuestion(id)
    if (success) {
      // 从本地数据中移除
      questions.value = questions.value.filter(q => q.id !== id)
      message.success('题目删除成功')
    } else {
      message.error('题目删除失败')
    }
  } catch (error) {
    console.error('删除题目失败:', error)
    message.error('删除题目失败')
  }
}

// 切换收藏状态
const handleToggleFavorite = async (id: string) => {
  try {
    const question = questions.value.find(q => q.id === id)
    if (question) {
      const updatedQuestion = await updateQuestion(id, {
        isFavorite: !question.isFavorite
      })
      if (updatedQuestion) {
        question.isFavorite = updatedQuestion.isFavorite
        message.success(updatedQuestion.isFavorite ? '已添加到收藏' : '已取消收藏')
      } else {
        message.error('操作失败')
      }
    }
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
    const data = await fetchQuestions()
    questions.value = data
    // 更新分页总数
    pagination.total = data.length
  } catch (error) {
    console.error('获取题目数据失败:', error)
    message.error('获取题目数据失败')
  }
}

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
      @update:searchForm="(val: typeof searchForm) => searchForm = val"
      @update:pagination="(val: typeof pagination) => pagination = val"
      @update:showAdvancedFilter="(val: boolean) => showAdvancedFilter = val"
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