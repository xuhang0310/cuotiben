<script setup lang="ts">
import { getDifficultyColor, getDifficultyText } from '@/utils/questionUtils'
import DifficultyTag from '@/components/DifficultyTag.vue'

interface WrongQuestion {
  question: {
    id: string
    title: string
    subject: string
    difficulty: string
  }
  wrongCount: number
  totalCount: number
  errorRate: number
}

interface Props {
  questions: WrongQuestion[]
}

defineProps<Props>()
</script>

<template>
  <a-card title="错题分析" class="analysis-card">
    <div v-if="questions.length === 0" class="empty-state">
      <a-empty description="暂无错题数据" />
    </div>
    <div v-else>
      <a-table
        :columns="[
          { title: '题目', dataIndex: 'question', key: 'question', width: '40%' },
          { title: '科目', dataIndex: 'subject', key: 'subject', width: '15%' },
          { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: '15%' },
          { title: '错误次数', dataIndex: 'wrongCount', key: 'wrongCount', width: '15%' },
          { title: '错误率', dataIndex: 'errorRate', key: 'errorRate', width: '15%' }
        ]"
        :data-source="questions.map((item, index) => ({
          key: index,
          question: item.question.title,
          subject: item.question.subject,
          difficulty: item.question.difficulty,
          wrongCount: item.wrongCount,
          errorRate: item.errorRate
        }))"
        :pagination="{ pageSize: 5 }"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'question'">
            <div class="question-cell">
              <div class="question-title">{{ record.question }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'difficulty'">
            <DifficultyTag :difficulty="record.difficulty" />
          </template>
          <template v-else-if="column.key === 'errorRate'">
            <span :class="{
              'error-rate-high': record.errorRate >= 70,
              'error-rate-medium': record.errorRate >= 40 && record.errorRate < 70,
              'error-rate-low': record.errorRate < 40
            }">
              {{ record.errorRate }}%
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<style scoped>
.analysis-card {
  margin-top: 16px;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.question-cell {
  max-width: 300px;
}

.question-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-rate-high {
  color: #ff4d4f;
  font-weight: 600;
}

.error-rate-medium {
  color: #fa8c16;
  font-weight: 500;
}

.error-rate-low {
  color: #52c41a;
}
</style>