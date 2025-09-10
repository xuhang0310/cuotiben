<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons-vue'
import { Skeleton } from 'ant-design-vue'
import DifficultyTag from '@/components/DifficultyTag.vue'
import SubjectTag from '@/components/SubjectTag.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import type { Question } from '@/stores/question'

interface Props {
  question: Question | null
  userAnswer: string
  showAnswer: boolean
  timeSpent: number
  isCorrect?: boolean
  isFavorite: boolean
}

interface Emits {
  (e: 'update:userAnswer', value: string): void
  (e: 'submit'): void
  (e: 'next'): void
  (e: 'toggleFavorite'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const handleUserAnswerChange = (value: string) => {
  emit('update:userAnswer', value)
}
</script>

<template>
  <div class="practice-question-card">
    <!-- 进度条 -->
    <a-card class="progress-card" :bordered="false">
      <div class="progress-info">
        <div class="time-info">
          <ClockCircleOutlined />
          {{ formatTime(timeSpent) }}
        </div>
      </div>
    </a-card>

    <!-- 题目内容 -->
    <a-card class="question-card" v-if="question">
      <div class="question-header">
        <div class="question-meta">
          <DifficultyTag :difficulty="question.difficulty" />
          <SubjectTag :subject="question.subject" />
        </div>
        <FavoriteButton 
          :is-favorite="isFavorite"
          @toggle="$emit('toggleFavorite')"
        />
      </div>
      
      <div class="question-content">
        <h3>{{ question.title }}</h3>
        <div class="question-text">{{ question.content }}</div>
        
        <!-- 选择题选项 -->
        <div v-if="question.options && question.options.length > 0" class="options-list">
          <a-radio-group 
            :value="userAnswer" 
            class="options-group"
            @update:value="handleUserAnswerChange"
          >
            <div
              v-for="(option, index) in question.options"
              :key="index"
              class="option-item"
            >
              <a-radio :value="String.fromCharCode(65 + index)">
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                {{ option }}
              </a-radio>
            </div>
          </a-radio-group>
        </div>
        
        <!-- 填空题输入 -->
        <div v-else class="answer-input">
          <a-input
            :value="userAnswer"
            placeholder="请输入答案"
            size="large"
            @update:value="handleUserAnswerChange"
            @press-enter="$emit('submit')"
          />
        </div>
      </div>
      
      <!-- 答案解析 -->
      <div v-if="showAnswer" class="answer-section">
        <a-divider />
        <div class="answer-result">
          <div class="result-header">
            <CheckCircleOutlined v-if="isCorrect" class="correct-icon" />
            <CloseCircleOutlined v-else class="wrong-icon" />
            <span class="result-text">
              {{ isCorrect ? '回答正确' : '回答错误' }}
            </span>
          </div>
          
          <div class="answer-details">
            <p><strong>正确答案：</strong>{{ question.correctAnswer }}</p>
            <p v-if="!isCorrect">
              <strong>您的答案：</strong>{{ userAnswer }}
            </p>
            <div v-if="question.explanation" class="explanation">
              <strong>解析：</strong>
              <div class="explanation-content">{{ question.explanation }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="question-actions">
        <a-button
          v-if="!showAnswer"
          type="primary"
          size="large"
          @click="$emit('submit')"
          :disabled="!userAnswer.trim()"
        >
          提交答案
        </a-button>
        
        <a-button
          v-if="showAnswer"
          type="primary"
          size="large"
          @click="$emit('next')"
        >
          <slot name="nextButtonText">
            <span>下一题</span>
          </slot>
        </a-button>
      </div>
    </a-card>
    
    <!-- Loading state -->
    <a-card class="question-card" v-else>
      <a-skeleton active />
    </a-card>
  </div>
</template>

<style scoped>
.practice-question-card {
  margin-bottom: 16px;
}

.progress-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.question-card {
  border-radius: 8px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  gap: 8px;
}

.question-content h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: #262626;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.options-list {
  margin-bottom: 20px;
}

.options-group {
  width: 100%;
}

.option-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: #d9d9d9;
  background: #fafafa;
}

.option-label {
  font-weight: 500;
  margin-right: 8px;
}

.answer-input {
  margin-bottom: 20px;
}

.answer-section {
  margin-top: 16px;
}

.answer-result {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 6px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.correct-icon {
  color: #52c41a;
  font-size: 18px;
}

.wrong-icon {
  color: #ff4d4f;
  font-size: 18px;
}

.result-text {
  font-size: 16px;
  font-weight: 500;
}

.answer-details p {
  margin: 8px 0;
  font-size: 14px;
}

.explanation {
  margin-top: 12px;
}

.explanation-content {
  margin-top: 4px;
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
  line-height: 1.6;
}

.question-actions {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .question-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .option-item {
    padding: 8px;
  }
}
</style>