<script setup lang="ts">
interface Props {
  subject: string
}

defineProps<Props>()
</script>

<template>
  <a-tag color="blue">{{ subject }}</a-tag>
</template>

<style scoped>
</style>