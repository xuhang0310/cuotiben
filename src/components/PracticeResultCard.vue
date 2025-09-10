<script setup lang="ts">
import { ReloadOutlined } from '@ant-design/icons-vue'

interface PracticeStats {
  total: number
  correct: number
  wrong: number
  accuracy: number
  totalTime: number
  averageTime: number
}

interface Props {
  stats: PracticeStats
}

interface Emits {
  (e: 'restart'): void
  (e: 'backToConfig'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <a-card title="练习完成" class="result-card">
    <div class="result-summary">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="总题数"
            :value="stats.total"
            suffix="题"
          />
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="正确数"
            :value="stats.correct"
            suffix="题"
            :value-style="{ color: '#52c41a' }"
          />
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="正确率"
            :value="stats.accuracy"
            suffix="%"
            :value-style="{ color: stats.accuracy >= 80 ? '#52c41a' : stats.accuracy >= 60 ? '#fa8c16' : '#ff4d4f' }"
          />
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-statistic
            title="平均用时"
            :value="stats.averageTime"
            suffix="秒"
            :value-style="{ color: '#1890ff' }"
          />
        </a-col>
      </a-row>
    </div>
    
    <a-divider />
    
    <div class="result-actions">
      <a-space>
        <a-button type="primary" @click="$emit('restart')">
          <ReloadOutlined />
          重新练习
        </a-button>
        <a-button @click="$emit('backToConfig')">
          返回配置
        </a-button>
      </a-space>
    </div>
  </a-card>
</template>

<style scoped>
.result-card {
  border-radius: 8px;
}

.result-summary {
  margin-bottom: 16px;
}

.result-actions {
  text-align: center;
}
</style>