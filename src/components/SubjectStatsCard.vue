<script setup lang="ts">
import { getDifficultyColor } from '@/utils/questionUtils'

interface SubjectStat {
  subject: string
  total: number
  correct: number
  totalTime: number
  accuracy: number
  averageTime: number
}

interface Props {
  stats: SubjectStat[]
}

defineProps<Props>()
</script>

<template>
  <a-card title="科目统计" class="chart-card">
    <div v-if="stats.length === 0" class="empty-state">
      <a-empty description="暂无数据" />
    </div>
    <div v-else class="subject-stats">
      <div
        v-for="subject in stats"
        :key="subject.subject"
        class="subject-item"
      >
        <div class="subject-header">
          <span class="subject-name">{{ subject.subject }}</span>
          <span class="subject-accuracy" :class="{
            'high': subject.accuracy >= 80,
            'medium': subject.accuracy >= 60 && subject.accuracy < 80,
            'low': subject.accuracy < 60
          }">
            {{ subject.accuracy }}%
          </span>
        </div>
        <div class="subject-details">
          <span>练习 {{ subject.total }} 题</span>
          <span>正确 {{ subject.correct }} 题</span>
          <span>平均 {{ subject.averageTime }} 秒</span>
        </div>
        <a-progress
          :percent="subject.accuracy"
          :show-info="false"
          :stroke-color="subject.accuracy >= 80 ? '#52c41a' : subject.accuracy >= 60 ? '#fa8c16' : '#ff4d4f'"
        />
      </div>
    </div>
  </a-card>
</template>

<style scoped>
.chart-card {
  border-radius: 8px;
  height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.subject-stats {
  max-height: 320px;
  overflow-y: auto;
}

.subject-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.subject-name {
  font-weight: 500;
  font-size: 14px;
}

.subject-accuracy {
  font-weight: 600;
  font-size: 16px;
}

.subject-accuracy.high {
  color: #52c41a;
}

.subject-accuracy.medium {
  color: #fa8c16;
}

.subject-accuracy.low {
  color: #ff4d4f;
}

.subject-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .subject-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .chart-card {
    height: auto;
  }
  
  .subject-stats {
    max-height: none;
  }
}
</style>