<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/mock/questions'
import DifficultyTag from '@/components/DifficultyTag.vue'
import { getProgressPercent } from '@/utils/questionUtils'
import {
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

interface Props {
  question: Question
}

interface Emits {
  (e: 'view', id: string): void
  (e: 'edit', question: Question): void
  (e: 'delete', id: string): void
  (e: 'toggleFavorite', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算正确率
const accuracy = computed(() => {
  if (props.question.practiceCount === 0) return '-'
  return `${((props.question.correctCount / props.question.practiceCount) * 100).toFixed(1)}%`
})

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 事件处理函数
const viewQuestion = () => {
  emit('view', props.question.id)
}

const editQuestion = () => {
  emit('edit', props.question)
}

const deleteQuestion = () => {
  emit('delete', props.question.id)
}

const toggleFavorite = () => {
  emit('toggleFavorite', props.question.id)
}
</script>

<template>
  <tr>
    <td>
      <a @click="viewQuestion" style="cursor: pointer;">{{ question.title }}</a>
    </td>
    <td>
      <span>{{ question.subject }}</span>
    </td>
    <td>
      <DifficultyTag :difficulty="question.difficulty" />
    </td>
    <td>{{ question.practiceCount }}</td>
    <td>{{ accuracy }}</td>
    <td>
      <a-space wrap>
        <a-tag v-for="tag in question.tags" :key="tag" color="cyan" size="small">
          {{ tag }}
        </a-tag>
      </a-space>
    </td>
    <td>{{ formatDate(question.createdAt) }}</td>
    <td>
      <a-space>
        <a-button
          type="text"
          size="small"
          @click="toggleFavorite"
        >
          <HeartFilled v-if="question.isFavorite" style="color: #ff4d4f;" />
          <HeartOutlined v-else />
        </a-button>
        
        <a-button
          type="text"
          size="small"
          @click="viewQuestion"
        >
          <EyeOutlined />
        </a-button>
        
        <a-button
          type="text"
          size="small"
          @click="editQuestion"
        >
          <EditOutlined />
        </a-button>
        
        <a-popconfirm
          title="确定要删除这道题目吗？"
          @confirm="deleteQuestion"
        >
          <a-button type="text" size="small" danger>
            <DeleteOutlined />
          </a-button>
        </a-popconfirm>
      </a-space>
    </td>
  </tr>
</template>

<style scoped>
</style>