<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/mock/questions'
import DifficultyTag from '@/components/DifficultyTag.vue'
import SubjectTag from '@/components/SubjectTag.vue'
import { getProgressPercent } from '@/utils/questionUtils'

interface Props {
  question: Question
}

const props = defineProps<Props>()

const accuracy = computed(() => {
  if (props.question.practiceCount === 0) return '-'
  return `${((props.question.correctCount / props.question.practiceCount) * 100).toFixed(1)}%`
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="question-item" :key="question.id">
    <div class="question-title">{{ question.title }}</div>
    <div class="question-meta">
      <DifficultyTag :difficulty="question.difficulty" />
      <SubjectTag :subject="question.subject" />
      <a-tag v-for="tag in question.tags" :key="tag" color="cyan" size="small">
        {{ tag }}
      </a-tag>
    </div>
    <div class="question-stats">
      <span>练习次数: {{ question.practiceCount }}</span>
      <span>正确率: {{ accuracy }}</span>
      <span>创建时间: {{ formatDate(question.createdAt) }}</span>
    </div>
  </div>
</template>

<style scoped>
.question-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.question-item:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 16px;
}

.question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.question-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

@media (max-width: 768px) {
  .question-stats {
    flex-direction: column;
    gap: 4px;
  }
}
</style>