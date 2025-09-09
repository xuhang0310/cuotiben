<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message, Modal } from 'ant-design-vue'
import html2canvas from 'html2canvas'
import type { UploadProps } from 'ant-design-vue'

// 图片状态
const imageUrl = ref<string>('')
const loading = ref<boolean>(false)
const recognizing = ref<boolean>(false)
const recognizedText = ref<string>('')
const editedText = ref<string>('')
const currentStep = ref<number>(0)

// 图片处理参数
const imageParams = reactive({
  rotation: 0,
  crop: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    aspect: 1 / 1
  }
})

// 上传图片前的校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片!')
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片必须小于5MB!')
  }
  return isJpgOrPng && isLt5M
}

// 处理图片上传
const handleUpload = (info: any) => {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done') {
    // 模拟上传成功，直接进入下一步
    loading.value = false
    // 使用模拟图片URL
    imageUrl.value = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
    currentStep.value = 1 // 进入图片编辑步骤
    message.success('上传成功!')
  } else if (info.file.status === 'error') {
    loading.value = false
    message.error('上传失败，请重试!')
  }
}

// 将文件转换为Base64
const getBase64 = (img: Blob, callback: (base64Url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

// 旋转图片
const rotateImage = () => {
  imageParams.rotation = (imageParams.rotation + 90) % 360
}

// 裁剪图片
const cropImage = (cropData: any) => {
  imageParams.crop = cropData
}

// OCR识别图片
const recognizeImage = async () => {
  recognizing.value = true
  try {
    // 这里应该调用实际的OCR API
    // 模拟OCR识别过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    recognizedText.value = `这是一道数学题：

**题目：**
已知函数 f(x) = x² - 4x + 3，求：
1. 函数的零点
2. 函数的最小值
3. 函数在区间 [0, 5] 上的最大值

**解答：**
1. 求零点：令 f(x) = 0
   x² - 4x + 3 = 0
   (x - 1)(x - 3) = 0
   所以零点为 x = 1 和 x = 3

2. 求最小值：
   f(x) = x² - 4x + 3 = (x - 2)² - 1
   当 x = 2 时，函数取得最小值 -1

3. 求区间 [0, 5] 上的最大值：
   由于函数开口向上，对称轴为 x = 2
   在区间 [0, 5] 上，比较端点值：
   f(0) = 3
   f(5) = 25 - 20 + 3 = 8
   所以最大值为 8`
    editedText.value = recognizedText.value
    currentStep.value = 2 // 进入文本编辑步骤
    message.success('识别成功!')
  } catch (error) {
    message.error('识别失败，请重试!')
  } finally {
    recognizing.value = false
  }
}

// 保存题目
const saveQuestion = () => {
  if (!editedText.value.trim()) {
    message.warning('题目内容不能为空!')
    return
  }
  
  // 模拟保存过程
  message.loading('保存中...', 1.5).then(() => {
    message.success('保存成功!')
    // 重置状态，准备下一次拍照
    resetState()
  })
}

// 重置状态
const resetState = () => {
  imageUrl.value = ''
  recognizedText.value = ''
  editedText.value = ''
  currentStep.value = 0
  imageParams.rotation = 0
  imageParams.crop = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    aspect: 1 / 1
  }
}

// 确认放弃当前编辑
const confirmCancel = () => {
  if (currentStep.value > 0) {
    Modal.confirm({
      title: '确认放弃',
      content: '当前编辑尚未保存，确定要放弃吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        resetState()
      }
    })
  } else {
    resetState()
  }
}
</script>

<template>
  <div class="capture-container">
    <h1 class="page-title">拍照录题</h1>
    
    <!-- 步骤指示器 -->
    <a-steps class="capture-steps" :current="currentStep">
      <a-step title="上传图片" />
      <a-step title="编辑图片" />
      <a-step title="识别结果" />
      <a-step title="保存题目" />
    </a-steps>
    
    <div class="capture-content">
      <!-- 步骤1: 上传图片 -->
      <div v-if="currentStep === 0" class="upload-container">
        <a-upload
          name="avatar"
          list-type="picture-card"
          class="avatar-uploader"
          :show-upload-list="false"
          action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
          :before-upload="beforeUpload"
          @change="handleUpload"
        >
          <div v-if="loading">
            <a-spin />
          </div>
          <div v-else class="upload-area">
            <camera-outlined class="upload-icon" />
            <div class="upload-text">点击上传题目图片</div>
            <div class="upload-hint">支持JPG/PNG格式，小于5MB</div>
          </div>
        </a-upload>
        
        <div class="upload-tips">
          <h3>拍照小技巧：</h3>
          <ul>
            <li>保持光线充足，避免阴影</li>
            <li>确保题目文字清晰可见</li>
            <li>尽量保持纸面平整</li>
          </ul>
        </div>
      </div>
      
      <!-- 步骤2: 编辑图片 -->
      <div v-if="currentStep === 1" class="edit-container">
        <div class="image-preview">
          <img :src="imageUrl" :style="{ transform: `rotate(${imageParams.rotation}deg)` }" />
        </div>
        
        <div class="edit-tools">
          <a-button type="primary" @click="rotateImage">
            <template #icon><rotate-right-outlined /></template>
            旋转图片
          </a-button>
          
          <a-button type="primary" @click="recognizeImage" :loading="recognizing">
            <template #icon><scan-outlined /></template>
            开始识别
          </a-button>
          
          <a-button @click="confirmCancel">
            <template #icon><close-outlined /></template>
            取消
          </a-button>
        </div>
      </div>
      
      <!-- 步骤3: 识别结果 -->
      <div v-if="currentStep === 2" class="result-container">
        <a-textarea
          v-model:value="editedText"
          placeholder="识别结果将显示在这里，您可以进行编辑"
          :rows="10"
          :auto-size="{ minRows: 10, maxRows: 20 }"
        />
        
        <div class="result-tools">
          <a-button type="primary" @click="saveQuestion">
            <template #icon><save-outlined /></template>
            保存题目
          </a-button>
          
          <a-button @click="confirmCancel">
            <template #icon><close-outlined /></template>
            取消
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.capture-container {
  padding: var(--spacing-large);
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--font-size-xlarge);
  color: var(--primary-color);
  margin-bottom: var(--spacing-large);
  text-align: center;
}

.capture-steps {
  margin-bottom: var(--spacing-large);
}

.capture-content {
  background: var(--color-background);
  padding: var(--spacing-large);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-medium);
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-large);
}

.avatar-uploader {
  width: 100%;
  max-width: 500px;
}

.avatar-uploader :deep(.ant-upload) {
  width: 100%;
  height: 300px;
}

.upload-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.upload-icon {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-medium);
}

.upload-text {
  font-size: var(--font-size-large);
  margin-bottom: var(--spacing-small);
}

.upload-hint {
  color: var(--text-color-secondary);
}

.upload-tips {
  width: 100%;
  max-width: 500px;
  background: var(--color-background-soft);
  padding: var(--spacing-medium);
  border-radius: var(--border-radius-medium);
  border-left: 4px solid var(--primary-color);
}

.upload-tips h3 {
  color: var(--primary-color);
  margin-bottom: var(--spacing-small);
}

.edit-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-large);
}

.image-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-medium);
}

.image-preview img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.edit-tools, .result-tools {
  display: flex;
  gap: var(--spacing-medium);
  justify-content: center;
  margin-top: var(--spacing-medium);
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-large);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .capture-container {
    padding: var(--spacing-medium);
  }
  
  .capture-content {
    padding: var(--spacing-medium);
  }
  
  .avatar-uploader :deep(.ant-upload) {
    height: 200px;
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .capture-container {
    padding: var(--spacing-small);
  }
  
  .capture-content {
    padding: var(--spacing-small);
  }
  
  .edit-tools, .result-tools {
    flex-direction: column;
  }
}
</style>