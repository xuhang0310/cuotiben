<script setup lang="ts">
interface Recommendation {
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  content: string
  icon: string
}

interface Props {
  recommendations: Recommendation[]
}

defineProps<Props>()
</script>

<template>
  <a-card title="学习建议" class="recommendations-card">
    <div v-if="recommendations.length === 0" class="empty-state">
      <a-empty description="暂无建议" />
    </div>
    <div v-else class="recommendations-list">
      <a-alert
        v-for="(recommendation, index) in recommendations"
        :key="index"
        :type="recommendation.type"
        :message="recommendation.title"
        :description="recommendation.content"
        show-icon
        class="recommendation-item"
      />
    </div>
  </a-card>
</template>

<style scoped>
.recommendations-card {
  margin-top: 16px;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  border-radius: 6px;
}
</style>