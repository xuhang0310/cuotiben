<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/mock/questions'
import { getDifficultyColor, getDifficultyText, formatDate } from '@/utils/questionUtils'

interface Props {
  question: Question
}

const props = defineProps<Props>()

const progressPercent = computed(() => {
  if (props.question.practiceCount === 0) return 0
  return Math.round((props.question.correctCount / props.question.practiceCount) * 100)
})

const progressColor = computed(() => {
  const percent = progressPercent.value
  if (percent >= 80) return '#52c41a' // 绿色
  if (percent >= 60) return '#fa8c16' // 橙色
  return '#ff4d4f' // 红色
})
</script>

<template>
  <div class="question-card">
    <!-- 收藏标签 -->
    <div v-if="question.isFavorite" class="status-tag" style="background-color: #ff4d4f;">
      收藏
    </div>
    
    <!-- 进度环形图 -->
    <div class="progress-section">
      <a-progress
        type="circle"
        :percent="progressPercent"
        :size="100"
        :stroke-color="progressColor"
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
</template>

<style scoped>
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

.progress-section .ant-progress-text {
  font-size: 14px;
  font-weight: 600;
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
</style>