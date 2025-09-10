<script setup lang="ts">
import { computed } from 'vue'
import { getProgressPercent, getProgressColor } from '@/utils/questionUtils'

interface Props {
  practiceCount: number
  correctCount: number
  size?: number
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 100,
  strokeWidth: 8
})

const progressPercent = computed(() => {
  return getProgressPercent(props.practiceCount, props.correctCount)
})

const progressColor = computed(() => {
  return getProgressColor(progressPercent.value)
})
</script>

<template>
  <a-progress
    type="circle"
    :percent="progressPercent"
    :size="size"
    :stroke-color="progressColor"
    :show-info="true"
    :stroke-width="strokeWidth"
  />
</template>

<style scoped>
</style>