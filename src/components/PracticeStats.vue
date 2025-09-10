<script setup lang="ts">
import { computed } from 'vue'
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'

interface Props {
  practiceCount: number
  correctCount: number
  lastPracticeAt?: Date
}

const props = defineProps<Props>()

const accuracy = computed(() => {
  if (props.practiceCount === 0) return '-'
  return `${((props.correctCount / props.practiceCount) * 100).toFixed(1)}%`
})

const formatDate = (date?: Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="stats-grid">
    <div class="stat-item">
      <ClockCircleOutlined />
      <div class="stat-content">
        <div class="stat-value">{{ practiceCount }}</div>
        <div class="stat-label">练习次数</div>
      </div>
    </div>
    
    <div class="stat-item">
      <CheckCircleOutlined />
      <div class="stat-content">
        <div class="stat-value">{{ accuracy }}</div>
        <div class="stat-label">正确率</div>
      </div>
    </div>
    
    <div class="stat-item">
      <div class="stat-content">
        <div class="stat-value">{{ formatDate(lastPracticeAt) }}</div>
        <div class="stat-label">最近练习</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>