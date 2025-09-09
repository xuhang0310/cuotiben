<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion as deleteMockQuestion, type Question } from '@/mock/questions'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

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

// 表格列配置
const columns = [
  {
    title: '题目标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
    width: 200,
    customRender: ({ text, record }: { text: string, record: Question }) => {
      return h(
        'a',
        {
          onClick: () => viewQuestionDetail(record.id),
          style: { cursor: 'pointer' }
        },
        text
      )
    }
  },
  {
    title: '科目',
    dataIndex: 'subject',
    key: 'subject',
    width: 100
  },
  {
    title: '难度',
    dataIndex: 'difficulty',
    key: 'difficulty',
    width: 80
  },
  {
    title: '练习次数',
    dataIndex: 'practiceCount',
    key: 'practiceCount',
    width: 100
  },
  {
    title: '正确率',
    key: 'accuracy',
    width: 100
  },
  {
    title: '标签',
    key: 'tags',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right'
  }
]

// 筛选后的题目列表
const filteredQuestions = computed(() => {
  let questionsData = questions.value
  
  // 关键词搜索
  if (searchForm.keyword) {
    questionsData = questionsData.filter(q => 
      q.title.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      q.content.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(searchForm.keyword.toLowerCase())
    )
  }
  
  // 科目筛选
  if (searchForm.subject) {
    questionsData = questionsData.filter(q => q.subject === searchForm.subject)
  }
  
  // 难度筛选
  if (searchForm.difficulty) {
    questionsData = questionsData.filter(q => q.difficulty === searchForm.difficulty)
  }
  
  // 收藏筛选
  if (searchForm.isFavorite) {
    questionsData = questionsData.filter(q => q.isFavorite)
  }
  
  // 标签筛选
  if (searchForm.tags.length > 0) {
    questionsData = questionsData.filter(q => 
      searchForm.tags.some(tag => q.tags.includes(tag))
    )
  }
  
  // 日期范围筛选
  if (searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0])
    const endDate = new Date(searchForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    questionsData = questionsData.filter(q => {
      const createdAt = new Date(q.createdAt)
      return createdAt >= startDate && createdAt <= endDate
    })
  }
  
  // 练习状态筛选
  if (searchForm.practiceStatus) {
    if (searchForm.practiceStatus === 'practiced') {
      questionsData = questionsData.filter(q => q.practiceCount > 0)
    } else if (searchForm.practiceStatus === 'not_practiced') {
      questionsData = questionsData.filter(q => q.practiceCount === 0)
    }
  }
  
  return questionsData
})

// 分页后的题目列表
const paginatedQuestions = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredQuestions.value.slice(start, end)
})

// 监听筛选结果变化，更新分页总数
watch(filteredQuestions, (newQuestions: Question[]) => {
  pagination.total = newQuestions.length
  // 如果当前页超出范围，重置到第一页
  if (pagination.current > Math.ceil(newQuestions.length / pagination.pageSize)) {
    pagination.current = 1
  }
}, { immediate: true })

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

// 获取难度标签颜色
const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'green',
    medium: 'orange',
    hard: 'red'
  }
  return colors[difficulty as keyof typeof colors] || 'default'
}

// 获取难度标签文本
const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return texts[difficulty as keyof typeof texts] || difficulty
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
const deleteQuestion = async (id: string) => {
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
const toggleFavorite = async (id: string) => {
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
    <!-- 搜索和筛选区域 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchForm">
        <a-form-item>
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="搜索题目标题或内容"
            style="width: 250px;"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item>
          <a-select
            v-model:value="searchForm.subject"
            placeholder="选择科目"
            style="width: 120px;"
            allow-clear
          >
            <a-select-option
              v-for="option in subjectOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item>
          <a-select
            v-model:value="searchForm.difficulty"
            placeholder="选择难度"
            style="width: 100px;"
            allow-clear
          >
            <a-select-option
              v-for="option in difficultyOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item>
          <a-checkbox v-model:checked="searchForm.isFavorite">
            只看收藏
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" @click="() => showAdvancedFilter = !showAdvancedFilter">
            <template #icon><FilterOutlined /></template>
            高级筛选
          </a-button>
        </a-form-item>
        
        <a-form-item>
          <a-button @click="resetSearch">
            重置
          </a-button>
        </a-form-item>
      </a-form>
      
      <!-- 高级筛选选项 -->
      <div v-if="showAdvancedFilter" class="advanced-filter">
        <a-divider style="margin: 12px 0" />
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="标签筛选">
              <a-select
                v-model:value="searchForm.tags"
                mode="multiple"
                placeholder="选择标签"
                style="width: 100%"
                allow-clear
              >
                <a-select-option
                  v-for="tag in allTags"
                  :key="tag"
                  :value="tag"
                >
                  {{ tag }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="创建日期">
              <a-range-picker
                v-model:value="searchForm.dateRange"
                style="width: 100%"
                format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          
          <a-col :xs="24" :sm="12" :md="8">
            <a-form-item label="练习状态">
              <a-select
                v-model:value="searchForm.practiceStatus"
                placeholder="选择练习状态"
                style="width: 100%"
                allow-clear
              >
                <a-select-option value="all">全部</a-select-option>
                <a-select-option value="practiced">已练习</a-select-option>
                <a-select-option value="not_practiced">未练习</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </div>
    </a-card>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="total-count">共 {{ filteredQuestions.length }} 道题目</span>
      </div>
      <div class="toolbar-right">
        <a-button type="primary" @click="openModal()">
          <PlusOutlined />
          添加题目
        </a-button>
      </div>
    </div>

    <!-- 题目列表 -->
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="paginatedQuestions"
        :pagination="pagination"
        :scroll="{ x: 800 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'difficulty'">
            <a-tag :color="getDifficultyColor(record.difficulty)">
              {{ getDifficultyText(record.difficulty) }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'accuracy'">
            {{ getAccuracy(record) }}
          </template>
          
          <template v-else-if="column.key === 'tags'">
            <a-space wrap>
              <a-tag v-for="tag in record.tags" :key="tag" color="cyan" size="small">
                {{ tag }}
              </a-tag>
            </a-space>
          </template>
          
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                type="text"
                size="small"
                @click="toggleFavorite(record.id)"
              >
                <HeartFilled v-if="record.isFavorite" style="color: #ff4d4f;" />
                <HeartOutlined v-else />
              </a-button>
              
              <a-button
                type="text"
                size="small"
                @click="viewQuestionDetail(record.id)"
              >
                <EyeOutlined />
              </a-button>
              
              <a-button
                type="text"
                size="small"
                @click="openModal(record)"
              >
                <EditOutlined />
              </a-button>
              
              <a-popconfirm
                title="确定要删除这道题目吗？"
                @confirm="deleteQuestion(record.id)"
              >
                <a-button type="text" size="small" danger>
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 添加/编辑题目弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? '编辑题目' : '添加题目'"
      width="800px"
      @ok="saveQuestion"
      @cancel="closeModal"
    >
      <a-form
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="题目标题" name="title">
              <a-input v-model:value="formData.title" placeholder="请输入题目标题" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="题目内容" name="content">
              <a-textarea
                v-model:value="formData.content"
                placeholder="请输入题目内容"
                :rows="4"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="选项（选择题）">
              <div class="options-container">
                <div
                  v-for="(option, index) in formData.options"
                  :key="index"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                  <a-input
                    v-model:value="formData.options[index]"
                    :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                  />
                </div>
              </div>
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="正确答案" name="correctAnswer">
              <a-input v-model:value="formData.correctAnswer" placeholder="请输入正确答案" />
            </a-form-item>
          </a-col>
          
          <a-col :span="6">
            <a-form-item label="难度" name="difficulty">
              <a-select v-model:value="formData.difficulty">
                <a-select-option
                  v-for="option in difficultyOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="6">
            <a-form-item label="科目" name="subject">
              <a-input v-model:value="formData.subject" placeholder="请输入科目" />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="解析">
              <a-textarea
                v-model:value="formData.explanation"
                placeholder="请输入题目解析（可选）"
                :rows="3"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="标签">
              <a-select
                v-model:value="formData.tags"
                mode="tags"
                placeholder="请输入标签"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
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