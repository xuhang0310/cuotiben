<script setup lang="ts">
import { getDifficultyColor, getDifficultyText } from '@/utils/questionUtils'

interface Props {
  difficulty: string
}

const props = defineProps<Props>()
</script>

<template>
  <a-tag :color="getDifficultyColor(difficulty)">
    {{ getDifficultyText(difficulty) }}
  </a-tag>
</template>

<style scoped>
</style>