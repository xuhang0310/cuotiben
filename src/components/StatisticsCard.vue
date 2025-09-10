<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

interface StatItem {
  title: string
  value: number | string
  suffix?: string
  prefixIcon?: string
  valueStyle?: Record<string, string>
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  stats: {
    type: Array as PropType<StatItem[]>,
    required: true
  }
})
</script>

<template>
  <a-card :title="title" class="stats-card">
    <a-row :gutter="[16, 16]">
      <a-col 
        v-for="(stat, index) in stats" 
        :key="index"
        :xs="24" 
        :sm="12" 
        :md="6"
      >
        <a-statistic
          :title="stat.title"
          :value="stat.value"
          :suffix="stat.suffix"
          :value-style="stat.valueStyle"
        >
          <template v-if="stat.prefixIcon" #prefix>
            <component :is="stat.prefixIcon" />
          </template>
        </a-statistic>
      </a-col>
    </a-row>
  </a-card>
</template>

<style scoped>
.stats-card {
  margin-bottom: 16px;
  border-radius: 8px;
}
</style>