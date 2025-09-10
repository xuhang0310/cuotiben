<script setup lang="ts">
import { PlayCircleOutlined } from '@ant-design/icons-vue'

interface PracticeConfig {
  mode: string
  count: number
  subject: string
  difficulty: string
}

interface Option {
  label: string
  value: string
}

interface Props {
  config: PracticeConfig
  subjectOptions: Option[]
  difficultyOptions: Option[]
  modeOptions: Option[]
}

interface Emits {
  (e: 'update:config', value: PracticeConfig): void
  (e: 'start'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const updateConfig = (field: keyof PracticeConfig, value: any) => {
  emit('update:config', { ...props.config, [field]: value })
}
</script>

<template>
  <a-card title="练习配置" class="config-card">
    <a-form layout="vertical" :model="config">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="练习模式">
            <a-select 
              :value="config.mode" 
              @change="(val) => updateConfig('mode', val)"
            >
              <a-select-option
                v-for="option in modeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="题目数量">
            <a-input-number
              :value="config.count"
              :min="1"
              :max="100"
              style="width: 100%;"
              @change="(val) => updateConfig('count', val)"
            />
          </a-form-item>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="科目筛选">
            <a-select
              :value="config.subject"
              placeholder="全部科目"
              allow-clear
              @change="(val) => updateConfig('subject', val)"
            >
              <a-select-option
                v-for="option in subjectOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-form-item label="难度筛选">
            <a-select
              :value="config.difficulty"
              placeholder="全部难度"
              allow-clear
              @change="(val) => updateConfig('difficulty', val)"
            >
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
      </a-row>
      
      <a-form-item>
        <a-button type="primary" size="large" @click="$emit('start')">
          <PlayCircleOutlined />
          开始练习
        </a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style scoped>
.config-card {
  border-radius: 8px;
}
</style>