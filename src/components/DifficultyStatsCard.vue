<script setup lang="ts">
import { getDifficultyColor, getDifficultyText } from '@/utils/questionUtils'
import DifficultyTag from '@/components/DifficultyTag.vue'

interface DifficultyStat {
  difficulty: string
  total: number
  correct: number
  accuracy: number
}

interface Props {
  stats: DifficultyStat[]
}

defineProps<Props>()
</script>

<template>
  <a-card title="难度统计" class="chart-card">
    <div v-if="stats.length === 0" class="empty-state">
      <a-empty description="暂无数据" />
    </div>
    <div v-else class="difficulty-stats">
      <div
        v-for="difficulty in stats"
        :key="difficulty.difficulty"
        class="difficulty-item"
      >
        <div class="difficulty-header">
          <DifficultyTag :difficulty="difficulty.difficulty" />
          <span class="difficulty-accuracy">
            {{ difficulty.accuracy }}%
          </span>
        </div>
        <div class="difficulty-details">
          <span>练习 {{ difficulty.total }} 题</span>
          <span>正确 {{ difficulty.correct }} 题</span>
        </div>
        <a-progress
          :percent="difficulty.accuracy"
          :show-info="false"
          :stroke-color="getDifficultyColor(difficulty.difficulty)"
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

.difficulty-stats {
  max-height: 320px;
  overflow-y: auto;
}

.difficulty-item {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.difficulty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.difficulty-accuracy {
  font-weight: 600;
  font-size: 16px;
  color: #262626;
}

.difficulty-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .difficulty-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .chart-card {
    height: auto;
  }
  
  .difficulty-stats {
    max-height: none;
  }
}
</style>