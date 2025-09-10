<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/mock/questions'

interface Props {
  modelValue: {
    title: string
    content: string
    options: string[]
    correctAnswer: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    subject: string
    tags: string[]
  }
  difficultyOptions: { label: string; value: string }[]
  isEditing: boolean
}

interface Emits {
  (e: 'update:modelValue', value: Props['modelValue']): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性用于双向绑定
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <a-form
    :model="formData"
    layout="vertical"
  >
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item label="题目标题" name="title">
          <a-input 
            v-model:value="formData.title" 
            placeholder="请输入题目标题" 
          />
        </a-form-item>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item label="题目内容" name="content">
          <a-textarea
            v-model:value="formData.content"
            placeholder="请输入题目内容"
            :rows="4"
          />
        </a-form-item>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item label="选项（选择题）">
          <div class="options-container">
            <div
              v-for="(option, index) in formData.options"
              :key="index"
              class="option-item"
            >
              <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              <a-input
                v-model:value="formData.options[index]"
                :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
              />
            </div>
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item label="正确答案" name="correctAnswer">
          <a-input 
            v-model:value="formData.correctAnswer" 
            placeholder="请输入正确答案" 
          />
        </a-form-item>
      </a-col>
      
      <a-col :span="6">
        <a-form-item label="难度" name="difficulty">
          <a-select v-model:value="formData.difficulty">
            <a-select-option
              v-for="option in difficultyOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      
      <a-col :span="6">
        <a-form-item label="科目" name="subject">
          <a-input 
            v-model:value="formData.subject" 
            placeholder="请输入科目" 
          />
        </a-form-item>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item label="解析">
          <a-textarea
            v-model:value="formData.explanation"
            placeholder="请输入题目解析（可选）"
            :rows="3"
          />
        </a-form-item>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="24">
        <a-form-item label="标签">
          <a-select
            v-model:value="formData.tags"
            mode="tags"
            placeholder="请输入标签"
            style="width: 100%;"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>

<style scoped>
.options-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  min-width: 24px;
  font-weight: 500;
  color: #666;
}
</style>