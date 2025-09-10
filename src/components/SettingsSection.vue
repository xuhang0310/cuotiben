<script setup lang="ts">
import { UploadOutlined, DownloadOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { h } from 'vue'

interface Props {
  title: string
  icon: string
  onSave?: () => void
  showDataOperations?: boolean
  onExport?: () => void
  onImport?: (file: File) => void
  onClear?: () => void
  onReset?: () => void
  exportLoading?: boolean
  importLoading?: boolean
}

interface Emits {
  (e: 'save'): void
  (e: 'export'): void
  (e: 'import', file: File): void
  (e: 'clear'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSave = () => {
  if (props.onSave) {
    props.onSave()
  }
  emit('save')
}

const handleExport = () => {
  if (props.onExport) {
    props.onExport()
  }
  emit('export')
}

const handleClear = () => {
  Modal.confirm({
    title: '确认清空所有数据？',
    content: '此操作将删除所有题目和练习记录，且无法恢复。',
    icon: h('div', { class: 'anticon' }, h(DeleteOutlined)),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      if (props.onClear) {
        props.onClear()
      }
      emit('clear')
    }
  })
}

const handleReset = () => {
  Modal.confirm({
    title: '确认重置所有设置？',
    content: '此操作将恢复所有设置到默认值。',
    icon: h('div', { class: 'anticon' }, h(SettingOutlined)),
    okText: '确认',
    cancelText: '取消',
    onOk() {
      if (props.onReset) {
        props.onReset()
      }
      emit('reset')
    }
  })
}

const handleFileUpload = (info: any) => {
  const file = info.file.originFileObj || info.file
  if (file) {
    if (props.onImport) {
      props.onImport(file)
    }
    emit('import', file)
  }
}
</script>

<template>
  <a-card :title="title" class="settings-card">
    <template #extra>
      <component :is="icon" />
    </template>
    
    <slot />
    
    <div v-if="onSave" class="save-button">
      <a-button type="primary" @click="handleSave">
        保存设置
      </a-button>
    </div>
    
    <a-divider v-if="showDataOperations" />
    
    <!-- 数据操作 -->
    <div v-if="showDataOperations" class="data-operations">
      <h4>数据操作</h4>
      
      <a-space direction="vertical" style="width: 100%;">
        <a-button
          v-if="onExport"
          type="primary"
          @click="handleExport"
          :loading="exportLoading"
          block
        >
          <DownloadOutlined />
          导出数据
        </a-button>
        
        <a-upload
          v-if="onImport"
          :before-upload="() => false"
          @change="handleFileUpload"
          accept=".json"
          :show-upload-list="false"
        >
          <a-button
            :loading="importLoading"
            block
          >
            <UploadOutlined />
            导入数据
          </a-button>
        </a-upload>
        
        <a-button
          v-if="onClear"
          danger
          @click="handleClear"
          block
        >
          <DeleteOutlined />
          清空所有数据
        </a-button>
        
        <a-button
          v-if="onReset"
          @click="handleReset"
          block
        >
          <SettingOutlined />
          重置设置
        </a-button>
      </a-space>
    </div>
  </a-card>
</template>

<style scoped>
.settings-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.save-button {
  margin-top: 16px;
}

.data-operations {
  margin-top: 16px;
}

.data-operations h4 {
  margin-bottom: 16px;
  color: #262626;
  font-weight: 600;
}
</style>