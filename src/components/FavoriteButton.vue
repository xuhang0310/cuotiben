<script setup lang="ts">
import { HeartOutlined, HeartFilled } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

interface Props {
  isFavorite: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleFavorite = () => {
  emit('toggle')
}
</script>

<template>
  <a-button 
    type="text" 
    size="large"
    @click="toggleFavorite"
  >
    <HeartFilled v-if="isFavorite" style="color: #ff4d4f; font-size: 20px;" />
    <HeartOutlined v-else style="font-size: 20px;" />
  </a-button>
</template>

<style scoped>
</style>