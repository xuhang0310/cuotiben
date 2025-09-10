<script setup lang="ts">
import { ref } from 'vue'
import { SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  searchKeyword: string
  currentFilter: string
  filterOptions: string[]
  questionsCount: number
  completedCount: number
}

interface Emits {
  (e: 'update:searchKeyword', value: string): void
  (e: 'update:currentFilter', value: string): void
  (e: 'search', value: string): void
  (e: 'filter', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSearch = (value: string) => {
  emit('search', value)
}

const handleFilter = (filter: string) => {
  emit('filter', filter)
}

const addQuestion = () => {
  router.push('/questions/new')
}
</script>

<template>
  <div class="home-filter-section">
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
            @click="() => handleFilter(filter)"
          >
            {{ filter }}
          </a-button>
        </div>
      </div>
      <div class="header-right">
        <a-input-search
          :value="searchKeyword"
          placeholder="搜索题目..."
          class="search-input"
          @search="handleSearch"
          @update:value="(val) => emit('update:searchKeyword', val)"
        />
        <a-button type="primary" class="add-btn" @click="addQuestion">
          <PlusOutlined />
          新增题目
        </a-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-info">
      <span>共 {{ questionsCount }} 道题目，已完成 {{ completedCount }} 道</span>
    </div>
  </div>
</template>

<style scoped>
.home-filter-section {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 0;
}

/* 顶部区域样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
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

/* 响应式设计 */
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
  
  .stats-info {
    padding: 12px 20px;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding: 12px 16px;
  }
}
</style>