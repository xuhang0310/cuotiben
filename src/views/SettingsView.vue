<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  EyeOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { useQuestionStore } from '@/stores/question'

const questionStore = useQuestionStore()

// 用户设置
const userSettings = reactive({
  username: '学习者',
  email: '',
  avatar: '',
  studyGoal: 10, // 每日学习目标
  preferredSubjects: [] as string[],
  difficulty: 'medium'
})

// 通知设置
const notificationSettings = reactive({
  enableNotifications: true,
  studyReminder: true,
  reminderTime: '20:00',
  achievementNotification: true,
  weeklyReport: true
})

// 显示设置
const displaySettings = reactive({
  theme: 'light', // light, dark, auto
  language: 'zh-CN',
  fontSize: 'medium', // small, medium, large
  showAnimation: true,
  compactMode: false
})

// 数据设置
const dataSettings = reactive({
  autoBackup: true,
  backupFrequency: 'daily', // daily, weekly, monthly
  maxBackupCount: 10,
  syncEnabled: false
})

// 导入导出状态
const importExportState = reactive({
  importing: false,
  exporting: false
})

// 主题选项
const themeOptions = [
  { label: '浅色主题', value: 'light' },
  { label: '深色主题', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

// 语言选项
const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// 字体大小选项
const fontSizeOptions = [
  { label: '小', value: 'small' },
  { label: '中', value: 'medium' },
  { label: '大', value: 'large' }
]

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

// 备份频率选项
const backupFrequencyOptions = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

// 科目选项
const subjectOptions = [
  { label: '数学', value: 'math' },
  { label: '语文', value: 'chinese' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '生物', value: 'biology' },
  { label: '历史', value: 'history' },
  { label: '地理', value: 'geography' },
  { label: '政治', value: 'politics' }
]

// 保存用户设置
const saveUserSettings = () => {
  try {
    localStorage.setItem('userSettings', JSON.stringify(userSettings))
    message.success('用户设置已保存')
  } catch (error) {
    message.error('保存失败')
  }
}

// 保存通知设置
const saveNotificationSettings = () => {
  try {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
    message.success('通知设置已保存')
  } catch (error) {
    message.error('保存失败')
  }
}

// 保存显示设置
const saveDisplaySettings = () => {
  try {
    localStorage.setItem('displaySettings', JSON.stringify(displaySettings))
    message.success('显示设置已保存')
    // 这里可以添加主题切换逻辑
    applyTheme(displaySettings.theme)
  } catch (error) {
    message.error('保存失败')
  }
}

// 保存数据设置
const saveDataSettings = () => {
  try {
    localStorage.setItem('dataSettings', JSON.stringify(dataSettings))
    message.success('数据设置已保存')
  } catch (error) {
    message.error('保存失败')
  }
}

// 应用主题
const applyTheme = (theme: string) => {
  const html = document.documentElement
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark')
  } else if (theme === 'light') {
    html.setAttribute('data-theme', 'light')
  } else {
    // auto - 跟随系统
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
}

// 导出数据
const exportData = async () => {
  importExportState.exporting = true
  try {
    const data = {
      questions: questionStore.questions,
      practiceRecords: questionStore.practiceRecords,
      settings: {
        user: userSettings,
        notification: notificationSettings,
        display: displaySettings,
        data: dataSettings
      },
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `错题本数据_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    message.success('数据导出成功')
  } catch (error) {
    message.error('导出失败')
  } finally {
    importExportState.exporting = false
  }
}

// 导入数据
const importData = (file: File) => {
  importExportState.importing = true
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // 验证数据格式
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('数据格式不正确')
      }
      
      // 导入题目数据
      data.questions.forEach((question: any) => {
        questionStore.addQuestion(question)
      })
      
      // 导入练习记录
      if (data.practiceRecords && Array.isArray(data.practiceRecords)) {
        // 这里需要在store中添加批量导入练习记录的方法
        // questionStore.importPracticeRecords(data.practiceRecords)
      }
      
      // 导入设置
      if (data.settings) {
        if (data.settings.user) Object.assign(userSettings, data.settings.user)
        if (data.settings.notification) Object.assign(notificationSettings, data.settings.notification)
        if (data.settings.display) Object.assign(displaySettings, data.settings.display)
        if (data.settings.data) Object.assign(dataSettings, data.settings.data)
      }
      
      message.success('数据导入成功')
    } catch (error) {
      message.error('导入失败：数据格式不正确')
    } finally {
      importExportState.importing = false
    }
  }
  
  reader.onerror = () => {
    message.error('文件读取失败')
    importExportState.importing = false
  }
  
  reader.readAsText(file)
}

// 清空所有数据
const clearAllData = () => {
  Modal.confirm({
    title: '确认清空所有数据？',
    content: '此操作将删除所有题目和练习记录，且无法恢复。',
    icon: h(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      try {
        questionStore.clearAllData()
        localStorage.clear()
        message.success('数据已清空')
      } catch (error) {
        message.error('清空失败')
      }
    }
  })
}

// 重置设置
const resetSettings = () => {
  Modal.confirm({
    title: '确认重置所有设置？',
    content: '此操作将恢复所有设置到默认值。',
    icon: h(ExclamationCircleOutlined),
    okText: '确认',
    cancelText: '取消',
    onOk() {
      try {
        // 重置为默认值
        Object.assign(userSettings, {
          username: '学习者',
          email: '',
          avatar: '',
          studyGoal: 10,
          preferredSubjects: [],
          difficulty: 'medium'
        })
        
        Object.assign(notificationSettings, {
          enableNotifications: true,
          studyReminder: true,
          reminderTime: '20:00',
          achievementNotification: true,
          weeklyReport: true
        })
        
        Object.assign(displaySettings, {
          theme: 'light',
          language: 'zh-CN',
          fontSize: 'medium',
          showAnimation: true,
          compactMode: false
        })
        
        Object.assign(dataSettings, {
          autoBackup: true,
          backupFrequency: 'daily',
          maxBackupCount: 10,
          syncEnabled: false
        })
        
        // 清除本地存储的设置
        localStorage.removeItem('userSettings')
        localStorage.removeItem('notificationSettings')
        localStorage.removeItem('displaySettings')
        localStorage.removeItem('dataSettings')
        
        message.success('设置已重置')
      } catch (error) {
        message.error('重置失败')
      }
    }
  })
}

// 加载设置
const loadSettings = () => {
  try {
    const savedUserSettings = localStorage.getItem('userSettings')
    if (savedUserSettings) {
      Object.assign(userSettings, JSON.parse(savedUserSettings))
    }
    
    const savedNotificationSettings = localStorage.getItem('notificationSettings')
    if (savedNotificationSettings) {
      Object.assign(notificationSettings, JSON.parse(savedNotificationSettings))
    }
    
    const savedDisplaySettings = localStorage.getItem('displaySettings')
    if (savedDisplaySettings) {
      Object.assign(displaySettings, JSON.parse(savedDisplaySettings))
      applyTheme(displaySettings.theme)
    }
    
    const savedDataSettings = localStorage.getItem('dataSettings')
    if (savedDataSettings) {
      Object.assign(dataSettings, JSON.parse(savedDataSettings))
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 文件上传处理
const handleFileUpload = (info: any) => {
  const file = info.file.originFileObj || info.file
  if (file) {
    importData(file)
  }
}

// 组件挂载时加载设置
onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="settings-container">
    <a-row :gutter="[16, 16]">
      <!-- 用户设置 -->
      <a-col :xs="24" :lg="12">
        <a-card title="用户设置" class="settings-card">
          <template #extra>
            <UserOutlined />
          </template>
          
          <a-form layout="vertical" :model="userSettings">
            <a-form-item label="用户名">
              <a-input v-model:value="userSettings.username" placeholder="请输入用户名" />
            </a-form-item>
            
            <a-form-item label="邮箱">
              <a-input v-model:value="userSettings.email" placeholder="请输入邮箱" type="email" />
            </a-form-item>
            
            <a-form-item label="每日学习目标">
              <a-input-number
                v-model:value="userSettings.studyGoal"
                :min="1"
                :max="100"
                addon-after="题"
                style="width: 100%;"
              />
            </a-form-item>
            
            <a-form-item label="偏好科目">
              <a-select
                v-model:value="userSettings.preferredSubjects"
                mode="multiple"
                placeholder="选择偏好科目"
                style="width: 100%;"
              >
                <a-select-option
                  v-for="subject in subjectOptions"
                  :key="subject.value"
                  :value="subject.value"
                >
                  {{ subject.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="默认难度">
              <a-select v-model:value="userSettings.difficulty" style="width: 100%;">
                <a-select-option
                  v-for="option in difficultyOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" @click="saveUserSettings">
                保存用户设置
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 通知设置 -->
      <a-col :xs="24" :lg="12">
        <a-card title="通知设置" class="settings-card">
          <template #extra>
            <BellOutlined />
          </template>
          
          <a-form layout="vertical" :model="notificationSettings">
            <a-form-item label="启用通知">
              <a-switch v-model:checked="notificationSettings.enableNotifications" />
            </a-form-item>
            
            <a-form-item label="学习提醒">
              <a-switch v-model:checked="notificationSettings.studyReminder" />
            </a-form-item>
            
            <a-form-item label="提醒时间" v-if="notificationSettings.studyReminder">
              <a-time-picker
                v-model:value="notificationSettings.reminderTime"
                format="HH:mm"
                style="width: 100%;"
              />
            </a-form-item>
            
            <a-form-item label="成就通知">
              <a-switch v-model:checked="notificationSettings.achievementNotification" />
            </a-form-item>
            
            <a-form-item label="周报推送">
              <a-switch v-model:checked="notificationSettings.weeklyReport" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" @click="saveNotificationSettings">
                保存通知设置
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 显示设置 -->
      <a-col :xs="24" :lg="12">
        <a-card title="显示设置" class="settings-card">
          <template #extra>
            <EyeOutlined />
          </template>
          
          <a-form layout="vertical" :model="displaySettings">
            <a-form-item label="主题">
              <a-select v-model:value="displaySettings.theme" style="width: 100%;">
                <a-select-option
                  v-for="option in themeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="语言">
              <a-select v-model:value="displaySettings.language" style="width: 100%;">
                <a-select-option
                  v-for="option in languageOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="字体大小">
              <a-select v-model:value="displaySettings.fontSize" style="width: 100%;">
                <a-select-option
                  v-for="option in fontSizeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="显示动画">
              <a-switch v-model:checked="displaySettings.showAnimation" />
            </a-form-item>
            
            <a-form-item label="紧凑模式">
              <a-switch v-model:checked="displaySettings.compactMode" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" @click="saveDisplaySettings">
                保存显示设置
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>

      <!-- 数据管理 -->
      <a-col :xs="24" :lg="12">
        <a-card title="数据管理" class="settings-card">
          <template #extra>
            <DatabaseOutlined />
          </template>
          
          <a-form layout="vertical" :model="dataSettings">
            <a-form-item label="自动备份">
              <a-switch v-model:checked="dataSettings.autoBackup" />
            </a-form-item>
            
            <a-form-item label="备份频率" v-if="dataSettings.autoBackup">
              <a-select v-model:value="dataSettings.backupFrequency" style="width: 100%;">
                <a-select-option
                  v-for="option in backupFrequencyOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            
            <a-form-item label="最大备份数量" v-if="dataSettings.autoBackup">
              <a-input-number
                v-model:value="dataSettings.maxBackupCount"
                :min="1"
                :max="50"
                style="width: 100%;"
              />
            </a-form-item>
            
            <a-form-item label="云同步">
              <a-switch v-model:checked="dataSettings.syncEnabled" />
            </a-form-item>
            
            <a-form-item>
              <a-button type="primary" @click="saveDataSettings">
                保存数据设置
              </a-button>
            </a-form-item>
          </a-form>
          
          <a-divider />
          
          <!-- 数据操作 -->
          <div class="data-operations">
            <h4>数据操作</h4>
            
            <a-space direction="vertical" style="width: 100%;">
              <a-button
                type="primary"
                @click="exportData"
                :loading="importExportState.exporting"
                block
              >
                <DownloadOutlined />
                导出数据
              </a-button>
              
              <a-upload
                :before-upload="() => false"
                @change="handleFileUpload"
                accept=".json"
                :show-upload-list="false"
              >
                <a-button
                  :loading="importExportState.importing"
                  block
                >
                  <UploadOutlined />
                  导入数据
                </a-button>
              </a-upload>
              
              <a-button
                danger
                @click="clearAllData"
                block
              >
                <DeleteOutlined />
                清空所有数据
              </a-button>
              
              <a-button
                @click="resetSettings"
                block
              >
                <SettingOutlined />
                重置设置
              </a-button>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.data-operations {
  margin-top: 16px;
}

.data-operations h4 {
  margin-bottom: 16px;
  color: #262626;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .settings-container {
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .settings-container {
    padding: 0 12px;
  }
  
  .settings-card {
    margin-bottom: 12px;
  }
  
  .settings-card .ant-card-body {
    padding: 16px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .setting-label {
    margin-bottom: 4px;
  }
  
  .setting-control {
    width: 100%;
  }
  
  .data-operations {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 0 8px;
  }
  
  .settings-card .ant-card-body {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .page-header p {
    font-size: 13px;
  }
}
</style>