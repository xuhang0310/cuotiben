<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchQuestions, type Question } from '@/mock/questions'
import { SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 当前筛选状态
const currentFilter = ref('全部题目')

// 筛选选项
const filterOptions = ['全部题目', '重点关注', '课程', '巨大', '已完成']

// 题目数据
const questionsList = ref<Question[]>([])

// 加载状态
const loading = ref(false)

// 获取题目数据
const loadQuestions = async () => {
  loading.value = true
  try {
    const data = await fetchQuestions()
    questionsList.value = data
  } catch (error) {
    console.error('获取题目数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索方法
const onSearch = (value: string) => {
  console.log('搜索:', value)
}

// 筛选方法
const onFilter = (filter: string) => {
  currentFilter.value = filter
  // 根据筛选条件更新题目列表
  filterQuestions()
}

// 筛选题目
const filterQuestions = () => {
  // 这里可以实现具体的筛选逻辑
  // 目前只是简单地重新加载数据
  loadQuestions()
}

// 添加题目方法
const addQuestion = () => {
  // 跳转到题目详情页，传递 'new' 作为ID表示新增题目
  router.push('/questions/new')
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    'correct': '#52c41a',
    'error': '#ff4d4f', 
    'pending': '#fa8c16',
    'not-started': '#d9d9d9'
  };
  return colorMap[status] || '#1890ff';
};

// 获取状态标签文本和颜色
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'correct':
      return { text: '正确', color: '#52c41a' }
    case 'error':
      return { text: '错误', color: '#ff4d4f' }
    case 'pending':
      return { text: '待做', color: '#fa8c16' }
    default:
      return { text: '未知', color: '#d9d9d9' }
  }
}

// 获取进度百分比
const getProgressPercent = (question: Question) => {
  if (question.practiceCount === 0) return 0;
  return Math.round((question.correctCount / question.practiceCount) * 100);
};

// 获取进度颜色
const getProgressColor = (question: Question) => {
  const percent = getProgressPercent(question);
  if (percent >= 80) return '#52c41a'; // 绿色
  if (percent >= 60) return '#fa8c16'; // 橙色
  return '#ff4d4f'; // 红色
};

// 获取难度标签颜色
const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: '#52c41a',
    medium: '#fa8c16',
    hard: '#ff4d4f'
  };
  return colors[difficulty as keyof typeof colors] || '#1890ff';
};

// 获取难度标签文本
const getDifficultyText = (difficulty: string) => {
  const texts = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return texts[difficulty as keyof typeof texts] || difficulty;
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取已完成题目数量
const getCompletedCount = () => {
  return questionsList.value.filter(q => q.practiceCount > 0).length;
};

// 页面加载时获取数据
onMounted(() => {
  loadQuestions();
});
</script>

<template>
  <div class="home-container">
    <!-- 顶部筛选区域 -->
    <div class="header-section">
      <div class="header-left">
        <h2 class="page-title">错题列表</h2>
        <div class="filter-tabs">
          <a-button 
            v-for="filter in filterOptions" 
            :key="filter"
            type="text" 
            :class="['filter-btn', { active: currentFilter === filter }]"
            @click="onFilter(filter)"
          >
            {{ filter }}
          </a-button>
        </div>
      </div>
      <div class="header-right">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索题目..."
          class="search-input"
          @search="onSearch"
        />
        <a-button type="primary" class="add-btn" @click="addQuestion">
          <PlusOutlined />
          新增题目
        </a-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-info">
      <span>共 {{ questionsList.length }} 道题目，已完成 {{ getCompletedCount() }} 道</span>
    </div>

    <!-- 题目卡片网格 -->
    <div class="questions-grid">
      <div 
        v-for="question in questionsList" 
        :key="question.id" 
        class="question-card"
      >
        <!-- 收藏标签 -->
        <div v-if="question.isFavorite" class="status-tag" style="background-color: #ff4d4f;">
          收藏
        </div>
        
        <!-- 进度环形图 -->
        <div class="progress-section">
          <a-progress
            type="circle"
            :percent="getProgressPercent(question)"
            :size="100"
            :stroke-color="getProgressColor(question)"
            :show-info="true"
            :stroke-width="8"
          />
        </div>
        
        <!-- 题目信息 -->
        <div class="question-info">
          <div class="question-number">{{ question.title }}</div>
          <div class="question-meta">
            <span class="subject">{{ question.subject }}</span>
            <span class="difficulty" :style="{ backgroundColor: getDifficultyColor(question.difficulty) }">
              {{ getDifficultyText(question.difficulty) }}
            </span>
            <span v-for="tag in question.tags.slice(0, 2)" :key="tag" class="tags">
              {{ tag }}
            </span>
          </div>
          <div class="question-date">{{ formatDate(question.createdAt) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 0;
  min-height: 100%;
  background: #f5f5f5;
}

/* 顶部区域样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #262626;
}

.filter-tabs {
  display: flex;
  gap: 0;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 0;
  color: #666;
  transition: all 0.3s ease;
  font-weight: 400;
  border: none;
  background: transparent;
}

.filter-btn.active {
  background: #1890ff;
  color: #fff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.filter-btn:hover:not(.active) {
  background: #f0f0f0;
  color: #40a9ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 统计信息样式 */
.stats-info {
  padding: 16px 24px;
  background: #fff;
  color: #666;
  font-size: 14px;
  border-bottom: 1px solid #e8e8e8;
}

/* 题目网格样式 - 优化大屏幕显示 */
.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
  background: #f5f5f5;
  max-width: 100%;
}

.question-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.question-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.status-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
  font-weight: 500;
}

.progress-section {
  margin: 20px 0;
}

/* 进度环样式增强 */
.progress-section .ant-progress-text {
  font-size: 14px;
  font-weight: 600;
}

/* 根据状态调整进度环文字颜色 */
.question-card .ant-progress-text {
  color: #1890ff;
}

.question-card[data-status="correct"] .ant-progress-text {
  color: #52c41a;
}

.question-card[data-status="error"] .ant-progress-text {
  color: #ff4d4f;
}

.question-card[data-status="pending"] .ant-progress-text {
  color: #fa8c16;
}

.question-info {
  width: 100%;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
}

.question-meta {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.question-meta span {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
}

.subject {
  background: #e6f7ff !important;
  color: #1890ff !important;
}

.difficulty {
  background: #fff2e8 !important;
  color: #fa8c16 !important;
}

.tags {
  background: #f6ffed !important;
  color: #52c41a !important;
}

.question-date {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 响应式设计 - 优化断点和布局 */
@media (max-width: 1600px) {
  .questions-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

@media (max-width: 1200px) {
  .questions-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 16px 20px;
  }
  
  .header-left {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-right {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-input {
    width: 100% !important;
  }
  
  .questions-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .questions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .question-card {
    padding: 16px;
  }
  
  .header-section {
    padding: 12px 16px;
  }
}
</style>
