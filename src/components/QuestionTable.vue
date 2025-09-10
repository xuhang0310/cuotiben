<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/mock/questions'
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import DifficultyTag from '@/components/DifficultyTag.vue'

interface Props {
  questions: Question[]
  searchForm: {
    keyword: string
    subject: string
    difficulty: string
    isFavorite: boolean
    tags: string[]
    dateRange: [string, string] | []
    practiceStatus: string
  }
  pagination: {
    current: number
    pageSize: number
    total: number
    showSizeChanger: boolean
    showQuickJumper: boolean
    showTotal: (total: number, range: number[]) => string
  }
  subjectOptions: { label: string; value: string }[]
  allTags: string[]
  difficultyOptions: { label: string; value: string }[]
  showAdvancedFilter: boolean
}

interface Emits {
  (e: 'update:searchForm', value: Props['searchForm']): void
  (e: 'update:pagination', value: Props['pagination']): void
  (e: 'update:showAdvancedFilter', value: boolean): void
  (e: 'search'): void
  (e: 'resetSearch'): void
  (e: 'view', id: string): void
  (e: 'edit', question: Question): void
  (e: 'delete', id: string): void
  (e: 'toggleFavorite', id: string): void
  (e: 'add'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 筛选后的题目列表
const filteredQuestions = computed(() => {
  let questionsData = props.questions
  
  // 关键词搜索
  if (props.searchForm.keyword) {
    questionsData = questionsData.filter(q => 
      q.title.toLowerCase().includes(props.searchForm.keyword.toLowerCase()) ||
      q.content.toLowerCase().includes(props.searchForm.keyword.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(props.searchForm.keyword.toLowerCase())
    )
  }
  
  // 科目筛选
  if (props.searchForm.subject) {
    questionsData = questionsData.filter(q => q.subject === props.searchForm.subject)
  }
  
  // 难度筛选
  if (props.searchForm.difficulty) {
    questionsData = questionsData.filter(q => q.difficulty === props.searchForm.difficulty)
  }
  
  // 收藏筛选
  if (props.searchForm.isFavorite) {
    questionsData = questionsData.filter(q => q.isFavorite)
  }
  
  // 标签筛选
  if (props.searchForm.tags.length > 0) {
    questionsData = questionsData.filter(q => 
      props.searchForm.tags.some(tag => q.tags.includes(tag))
    )
  }
  
  // 日期范围筛选
  if (props.searchForm.dateRange.length === 2) {
    const startDate = new Date(props.searchForm.dateRange[0])
    const endDate = new Date(props.searchForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
    
    questionsData = questionsData.filter(q => {
      const createdAt = new Date(q.createdAt)
      return createdAt >= startDate && createdAt <= endDate
    })
  }
  
  // 练习状态筛选
  if (props.searchForm.practiceStatus) {
    if (props.searchForm.practiceStatus === 'practiced') {
      questionsData = questionsData.filter(q => q.practiceCount > 0)
    } else if (props.searchForm.practiceStatus === 'not_practiced') {
      questionsData = questionsData.filter(q => q.practiceCount === 0)
    }
  }
  
  return questionsData
})

// 分页后的题目列表
const paginatedQuestions = computed(() => {
  const start = (props.pagination.current - 1) * props.pagination.pageSize
  const end = start + props.pagination.pageSize
  return filteredQuestions.value.slice(start, end)
})

// 计算正确率
const getAccuracy = (question: Question) => {
  if (question.practiceCount === 0) return '-'
  return `${((question.correctCount / question.practiceCount) * 100).toFixed(1)}%`
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 事件处理函数
const handleSearch = () => {
  emit('search')
}

const handleResetSearch = () => {
  emit('resetSearch')
}

const handleView = (id: string) => {
  emit('view', id)
}

const handleEdit = (question: Question) => {
  emit('edit', question)
}

const handleDelete = (id: string) => {
  emit('delete', id)
}

const handleToggleFavorite = (id: string) => {
  emit('toggleFavorite', id)
}

const handleAdd = () => {
  emit('add')
}

const toggleAdvancedFilter = () => {
  emit('update:showAdvancedFilter', !props.showAdvancedFilter)
}

const updateSearchForm = (field: keyof Props['searchForm'], value: any) => {
  emit('update:searchForm', { ...props.searchForm, [field]: value })
}

const updatePagination = (field: keyof Props['pagination'], value: any) => {
  emit('update:pagination', { ...props.pagination, [field]: value })
}
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
            @change="handleSearch"
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
            @change="(val) => updateSearchForm('subject', val)"
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
            @change="(val) => updateSearchForm('difficulty', val)"
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
          <a-checkbox 
            v-model:checked="searchForm.isFavorite"
            @change="(e) => updateSearchForm('isFavorite', e.target.checked)"
          >
            只看收藏
          </a-checkbox>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" @click="toggleAdvancedFilter">
            <template #icon><FilterOutlined /></template>
            高级筛选
          </a-button>
        </a-form-item>
        
        <a-form-item>
          <a-button @click="handleResetSearch">
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
                @change="(val) => updateSearchForm('tags', val)"
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
                @change="(val) => updateSearchForm('dateRange', val)"
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
                @change="(val) => updateSearchForm('practiceStatus', val)"
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
        <a-button type="primary" @click="handleAdd">
          <PlusOutlined />
          添加题目
        </a-button>
      </div>
    </div>

    <!-- 题目列表 -->
    <a-card :bordered="false">
      <a-table
        :columns="[
          {
            title: '题目标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            width: 200
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
        ]"
        :data-source="paginatedQuestions"
        :pagination="pagination"
        :scroll="{ x: 800 }"
        row-key="id"
        @change="(pagination) => {
          updatePagination('current', pagination.current)
          updatePagination('pageSize', pagination.pageSize)
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a @click="() => handleView(record.id)" style="cursor: pointer;">{{ record.title }}</a>
          </template>
          
          <template v-else-if="column.key === 'difficulty'">
            <DifficultyTag :difficulty="record.difficulty" />
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
                @click="() => handleToggleFavorite(record.id)"
              >
                <HeartFilled v-if="record.isFavorite" style="color: #ff4d4f;" />
                <HeartOutlined v-else />
              </a-button>
              
              <a-button
                type="text"
                size="small"
                @click="() => handleView(record.id)"
              >
                <EyeOutlined />
              </a-button>
              
              <a-button
                type="text"
                size="small"
                @click="() => handleEdit(record)"
              >
                <EditOutlined />
              </a-button>
              
              <a-popconfirm
                title="确定要删除这道题目吗？"
                @confirm="() => handleDelete(record.id)"
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