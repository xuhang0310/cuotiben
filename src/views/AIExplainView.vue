<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import 'katex/dist/katex.min.css'
import * as emojiLib from 'node-emoji'

// 创建emoji对象的别名以便使用，并提供类型安全的接口
interface EmojiInterface {
  get(emoji: string): string | undefined;
}

const emoji: EmojiInterface = emojiLib

// 安全获取emoji的辅助函数
const getEmoji = (name: string): string => {
  return emoji.get(name) || ''
}

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {
        // 忽略高亮错误，使用原始文本
      }
    }
    return ''
  }
})

// 添加KaTeX支持
md.use(mdKatex)

// 定义题目类型
interface Question {
  id: number;
  title: string;
  content: string;
  subject: string;
  difficulty: string;
  status: string;
}

// 题目列表
const questions = ref<Question[]>([])
const selectedQuestion = ref<Question | null>(null)
const loading = ref<boolean>(false)
const explaining = ref<boolean>(false)
const explanation = ref<string>('')

// 过滤条件
const filters = reactive({
  subject: '',
  difficulty: '',
  status: ''
})

// 模拟获取题目列表
const fetchQuestions = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    questions.value = [
      {
        id: 1,
        title: '分数加法问题',
        content: '如果\(\frac{1}{3} + \frac{1}{4} = \)？求结果。',
        subject: '数学',
        difficulty: '简单',
        status: '未掌握'
      },
      {
        id: 2,
        title: '动物分类问题',
        content: '请说明哺乳动物和爬行动物的区别。',
        subject: '科学',
        difficulty: '中等',
        status: '未掌握'
      },
      {
        id: 3,
        title: '英语时态问题',
        content: '请用一般现在时和现在进行时造句，并说明区别。',
        subject: '英语',
        difficulty: '中等',
        status: '重点复习'
      },
      {
        id: 4,
        title: '面积计算问题',
        content: '一个长方形的长是8厘米，宽是5厘米，求它的面积。',
        subject: '数学',
        difficulty: '简单',
        status: '未掌握'
      },
      {
        id: 5,
        title: '古诗词理解',
        content: '解释"春眠不觉晓，处处闻啼鸟"的含义。',
        subject: '语文',
        difficulty: '中等',
        status: '重点复习'
      }
    ]
  } catch {
    message.error('获取题目失败')
  } finally {
    loading.value = false
  }
}

// 选择题目
const selectQuestion = (question: Question) => {
  selectedQuestion.value = question
  explanation.value = '' // 清空之前的解释
}

// 生成AI解释
const generateExplanation = async () => {
  if (!selectedQuestion.value) {
    message.warning('请先选择一个题目')
    return
  }
  
  explaining.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 根据不同题目生成不同的解释
    const questionId = Number(selectedQuestion.value.id)
    if (questionId === 1) {
      explanation.value = generateFractionExplanation()
    } else if (questionId === 2) {
      explanation.value = generateAnimalExplanation()
    } else if (questionId === 3) {
      explanation.value = generateEnglishExplanation()
    } else if (questionId === 4) {
      explanation.value = generateAreaExplanation()
    } else if (questionId === 5) {
      explanation.value = generatePoemExplanation()
    }
    
    message.success('解释生成成功!')
  } catch {
    message.error('生成解释失败')
  } finally {
    explaining.value = false
  }
}

// 分数加法解释
const generateFractionExplanation = (): string => {
  return `# 分数加法问题 ${getEmoji('star')}

## 题目
如果$\frac{1}{3} + \frac{1}{4} = $？求结果。

## 解析 ${getEmoji('bulb')}

### 错误原因 ${getEmoji('x')}
很多同学会直接把分子和分母分别相加，得到$\frac{1+1}{3+4} = \frac{2}{7}$，这是**错误**的！

### 正确思路 ${getEmoji('white_check_mark')}

分数相加时，我们需要先找到**最小公倍数**，将分母统一，然后再相加分子。

#### 步骤1：找最小公倍数 ${getEmoji('1234')}
3和4的最小公倍数是12

#### 步骤2：统一分母 ${getEmoji('arrows_counterclockwise')}
$\frac{1}{3} = \frac{1 \times 4}{3 \times 4} = \frac{4}{12}$

$\frac{1}{4} = \frac{1 \times 3}{4 \times 3} = \frac{3}{12}$

#### 步骤3：相加分子 ${getEmoji('heavy_plus_sign')}
$\frac{4}{12} + \frac{3}{12} = \frac{4+3}{12} = \frac{7}{12}$

### 图解 ${getEmoji('art')}

想象一个披萨被分成12块：

- $\frac{1}{3}$ 表示吃了4块（因为$\frac{4}{12} = \frac{1}{3}$）
- $\frac{1}{4}$ 表示吃了3块（因为$\frac{3}{12} = \frac{1}{4}$）
- 总共吃了4+3=7块，也就是$\frac{7}{12}$

### 答案 ${getEmoji('tada')}
$\frac{1}{3} + \frac{1}{4} = \frac{7}{12}$

### 小贴士 ${getEmoji('pushpin')}
记住：分数相加，分母不同时，需要先通分（找最小公倍数），再相加分子哦！`
}

// 动物分类解释
const generateAnimalExplanation = (): string => {
  return `# 动物分类问题 ${getEmoji('star')}

## 题目
请说明哺乳动物和爬行动物的区别。

## 解析 ${getEmoji('bulb')}

### 错误原因 ${getEmoji('x')}
很多同学只知道哺乳动物有毛发，爬行动物有鳞片，但这只是表面特征，不够全面！

### 正确思路 ${getEmoji('white_check_mark')}

我们需要从多个方面比较哺乳动物和爬行动物的区别：

#### 1. 体温调节 ${getEmoji('thermometer')}
- 哺乳动物：**恒温动物**，能自己调节体温
- 爬行动物：**变温动物**，体温随环境变化

#### 2. 皮肤覆盖物 ${getEmoji('skin-tone-2')}
- 哺乳动物：有**毛发**
- 爬行动物：有**鳞片**

#### 3. 生殖方式 ${getEmoji('baby')}
- 哺乳动物：大多数**胎生**，少数卵生（如鸭嘴兽）
- 爬行动物：**卵生**，产卵

#### 4. 喂养后代 ${getEmoji('milk_glass')}
- 哺乳动物：有**乳腺**，用乳汁喂养后代
- 爬行动物：**没有乳腺**，不喂养后代

#### 5. 呼吸系统 ${getEmoji('lungs')}
- 哺乳动物：肺部发达，呼吸效率高
- 爬行动物：肺部简单，呼吸效率较低

### 举例说明 ${getEmoji('point_down')}

#### 哺乳动物例子：
- 猫 ${getEmoji('cat')}
- 狗 ${getEmoji('dog')}
- 人类 ${getEmoji('person')}
- 大象 ${getEmoji('elephant')}

#### 爬行动物例子：
- 蛇 ${getEmoji('snake')}
- 乌龟 ${getEmoji('turtle')}
- 鳄鱼 ${getEmoji('crocodile')}
- 蜥蜴 ${getEmoji('lizard')}

### 小贴士 ${getEmoji('pushpin')}
记住这些区别，就能轻松分辨哺乳动物和爬行动物啦！`
}

// 英语时态解释
const generateEnglishExplanation = (): string => {
  return `# 英语时态问题 ${getEmoji('star')}

## 题目
请用一般现在时和现在进行时造句，并说明区别。

## 解析 ${getEmoji('bulb')}

### 错误原因 ${getEmoji('x')}
很多同学混淆一般现在时和现在进行时，不清楚什么时候用哪个时态！

### 正确思路 ${getEmoji('white_check_mark')}

#### 一般现在时 (Simple Present) ${getEmoji('calendar')}

**用法**：表示经常性、习惯性的动作或状态，以及客观事实。

**结构**：主语 + 动词原形（第三人称单数加s）

**时间状语**：usually, always, every day, often 等

**例句**：
1. I **go** to school every day. (我每天去学校。)
2. She **likes** ice cream. (她喜欢冰淇淋。)
3. The sun **rises** in the east. (太阳从东方升起。)

#### 现在进行时 (Present Continuous) ${getEmoji('hourglass_flowing_sand')}

**用法**：表示正在进行的动作或暂时的状态。

**结构**：主语 + am/is/are + 动词ing形式

**时间状语**：now, at the moment, right now 等

**例句**：
1. I **am studying** English now. (我现在正在学英语。)
2. She **is playing** the piano at the moment. (她此刻正在弹钢琴。)
3. They **are watching** TV right now. (他们此刻正在看电视。)

### 区别对比 ${getEmoji('left_right_arrow')}

| 一般现在时 | 现在进行时 |
|---------|----------|
| 表示习惯性、经常性的动作 | 表示正在进行的动作 |
| 表示客观事实或真理 | 表示暂时的状态 |
| I eat breakfast every morning. | I am eating breakfast now. |
| 我每天早上吃早餐。 | 我现在正在吃早餐。 |

### 小贴士 ${getEmoji('pushpin')}

想区分这两种时态，可以问自己：
- 这个动作是经常发生的吗？→ 用一般现在时
- 这个动作是现在正在进行的吗？→ 用现在进行时`
}

// 面积计算解释
const generateAreaExplanation = (): string => {
  return `# 面积计算问题 ${getEmoji('star')}

## 题目
一个长方形的长是8厘米，宽是5厘米，求它的面积。

## 解析 ${getEmoji('bulb')}

### 错误原因 ${getEmoji('x')}
有些同学会把长和宽相加，得到周长，而不是面积！或者直接把8和5相乘，但单位写错。

### 正确思路 ${getEmoji('white_check_mark')}

#### 步骤1：回忆公式 ${getEmoji('1234')}
长方形的面积公式：**面积 = 长 × 宽**

#### 步骤2：代入数据 ${getEmoji('input_numbers')}
- 长 = 8厘米
- 宽 = 5厘米

#### 步骤3：计算 ${getEmoji('heavy_multiplication_x')}
面积 = 8厘米 × 5厘米 = 40平方厘米

### 图解 ${getEmoji('art')}

想象一个长方形被分成小方格，每个小方格是1平方厘米：

\`\`\`
+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |
+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |
+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |
+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |
+--+--+--+--+--+--+--+--+
|  |  |  |  |  |  |  |  |
+--+--+--+--+--+--+--+--+
\`\`\`

横向有8个格子，纵向有5个格子，总共有8×5=40个小方格，所以面积是40平方厘米。

### 单位说明 ${getEmoji('straight_ruler')}

注意：面积的单位是**平方厘米**（cm²），不是厘米（cm）！

- 长度单位：米(m)、厘米(cm)、毫米(mm)
- 面积单位：平方米(m²)、平方厘米(cm²)、平方毫米(mm²)

### 答案 ${getEmoji('tada')}
长方形的面积是40平方厘米(cm²)。

### 小贴士 ${getEmoji('pushpin')}
记住：长方形面积 = 长 × 宽，单位是平方单位！`
}

// 古诗词解释
const generatePoemExplanation = (): string => {
  return `# 古诗词理解 ${getEmoji('star')}

## 题目
解释"春眠不觉晓，处处闻啼鸟"的含义。

## 解析 ${getEmoji('bulb')}

### 错误原因 ${getEmoji('x')}
很多同学只是简单翻译句子，没有理解诗句的意境和作者的情感！

### 正确思路 ${getEmoji('white_check_mark')}

#### 诗句出处 ${getEmoji('book')}
这两句诗出自唐代诗人孟浩然的《春晓》。完整的诗是：

> 春眠不觉晓，处处闻啼鸟。  
> 夜来风雨声，花落知多少。

#### 字面意思 ${getEmoji('page_facing_up')}

- **春眠不觉晓**：春天睡觉，不知不觉天就亮了
- **处处闻啼鸟**：到处都能听到鸟儿的叫声

#### 深层含义 ${getEmoji('thinking')}

1. **春天的舒适感**：春天的睡眠特别香甜，以至于诗人睡得很沉，不知不觉天就亮了

2. **自然的生机**：春天到处都是鸟儿的叫声，表现了春天的生机勃勃

3. **感官体验**：诗人通过听觉（鸟叫声）来感受春天，而不是视觉

4. **闲适的心境**：诗人的心情闲适、平和，能够安然入睡，被自然唤醒

### 意境描绘 ${getEmoji('art')}

想象一下：春天的早晨，你在温暖的被窝里睡得正香，不知不觉天已经亮了。你不是被闹钟吵醒，而是被窗外各种鸟儿清脆的叫声自然唤醒。这种感觉多么美好啊！

### 现代联系 ${getEmoji('bulb')}

这种体验就像我们放假时，不用早起，自然醒来，听到窗外的鸟叫声，感受到大自然的美好。

### 小贴士 ${getEmoji('pushpin')}

理解古诗词，不仅要知道字面意思，还要体会诗人的情感和诗句的意境哦！`
}

// 渲染Markdown内容
const renderMarkdown = (content: string) => {
  if (!content) return ''
  return md.render(content)
}

// 初始化
onMounted(() => {
  fetchQuestions()
})
</script>

<template>
  <div class="ai-explain-container">
    <h1 class="page-title">AI讲解</h1>
    
    <div class="explain-layout">
      <!-- 左侧题目列表 -->
      <div class="question-list">
        <div class="list-header">
          <h2>题目列表</h2>
          <div class="filters">
            <a-select
              v-model:value="filters.subject"
              placeholder="学科"
              style="width: 100px"
              allowClear
            >
              <a-select-option value="数学">数学</a-select-option>
              <a-select-option value="语文">语文</a-select-option>
              <a-select-option value="英语">英语</a-select-option>
              <a-select-option value="科学">科学</a-select-option>
            </a-select>
            
            <a-select
              v-model:value="filters.difficulty"
              placeholder="难度"
              style="width: 100px"
              allowClear
            >
              <a-select-option value="简单">简单</a-select-option>
              <a-select-option value="中等">中等</a-select-option>
              <a-select-option value="困难">困难</a-select-option>
            </a-select>
            
            <a-select
              v-model:value="filters.status"
              placeholder="状态"
              style="width: 120px"
              allowClear
            >
              <a-select-option value="已掌握">已掌握</a-select-option>
              <a-select-option value="未掌握">未掌握</a-select-option>
              <a-select-option value="重点复习">重点复习</a-select-option>
            </a-select>
          </div>
        </div>
        
        <a-spin :spinning="loading">
          <div class="question-items">
            <div 
              v-for="question in questions" 
              :key="question.id"
              class="question-item"
              :class="{ 'selected': selectedQuestion && selectedQuestion.id === question.id }"
              @click="selectQuestion(question)"
            >
              <div class="question-title">{{ question.title }}</div>
              <div class="question-meta">
                <a-tag color="blue">{{ question.subject }}</a-tag>
                <a-tag color="orange">{{ question.difficulty }}</a-tag>
                <a-tag :color="question.status === '已掌握' ? 'green' : (question.status === '重点复习' ? 'red' : 'default')">
                  {{ question.status }}
                </a-tag>
              </div>
            </div>
            
            <a-empty v-if="questions.length === 0" description="暂无题目" />
          </div>
        </a-spin>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 题目详情 -->
        <div v-if="selectedQuestion" class="question-detail">
          <h2>{{ selectedQuestion.title }}</h2>
          <div class="question-content" v-html="selectedQuestion.content"></div>
          
          <a-button 
            type="primary" 
            @click="generateExplanation"
            :loading="explaining"
            class="explain-button"
          >
            <template #icon><robot-outlined /></template>
            生成AI讲解
          </a-button>
        </div>
        
        <!-- 解释内容 -->
        <div v-if="explanation" class="explanation-content">
          <div class="markdown-body" v-html="renderMarkdown(explanation)"></div>
        </div>
        
        <!-- 未选择题目时的提示 -->
        <div v-if="!selectedQuestion" class="empty-state">
          <a-empty description="请从左侧选择一个题目进行讲解">
            <template #image>
              <robot-outlined style="font-size: 64px; color: #1890ff;" />
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* 全局样式，不使用scoped，确保Markdown渲染正确 */
.markdown-body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--color-background);
  padding: var(--spacing-medium);
  border-radius: var(--border-radius-medium);
}

.markdown-body h1 {
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-small);
  margin-top: var(--spacing-large);
  margin-bottom: var(--spacing-medium);
}

.markdown-body h2 {
  color: var(--primary-color-dark);
  margin-top: var(--spacing-large);
  margin-bottom: var(--spacing-medium);
}

.markdown-body h3 {
  color: var(--primary-color-light);
  margin-top: var(--spacing-medium);
  margin-bottom: var(--spacing-small);
}

.markdown-body ul, .markdown-body ol {
  padding-left: var(--spacing-large);
}

.markdown-body li {
  margin-bottom: var(--spacing-mini);
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: var(--spacing-medium) 0;
}

.markdown-body table th, .markdown-body table td {
  border: 1px solid var(--border-color);
  padding: var(--spacing-small);
  text-align: left;
}

.markdown-body table th {
  background-color: var(--color-background-soft);
}

.markdown-body code {
  background-color: var(--color-background-mute);
  padding: 2px 4px;
  border-radius: var(--border-radius-small);
  font-family: monospace;
}

.markdown-body pre {
  background-color: var(--color-background-mute);
  padding: var(--spacing-medium);
  border-radius: var(--border-radius-medium);
  overflow-x: auto;
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--primary-color-light);
  padding-left: var(--spacing-medium);
  color: var(--text-color-secondary);
  font-style: italic;
  margin: var(--spacing-medium) 0;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: var(--spacing-medium) auto;
}
</style>

<style scoped>
.ai-explain-container {
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

.explain-layout {
  display: flex;
  gap: var(--spacing-large);
  height: calc(100vh - 200px);
}

.question-list {
  width: 300px;
  background: var(--color-background);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-small);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: var(--spacing-medium);
  border-bottom: 1px solid var(--border-color);
}

.list-header h2 {
  margin: 0 0 var(--spacing-medium) 0;
  font-size: var(--font-size-large);
  color: var(--primary-color);
}

.filters {
  display: flex;
  gap: var(--spacing-small);
  flex-wrap: wrap;
}

.question-items {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-small);
}

.question-item {
  padding: var(--spacing-medium);
  border-radius: var(--border-radius-medium);
  margin-bottom: var(--spacing-small);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.question-item:hover {
  background: var(--color-background-soft);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-small);
}

.question-item.selected {
  background: var(--primary-color-light);
  border-color: var(--primary-color);
}

.question-title {
  font-weight: bold;
  margin-bottom: var(--spacing-small);
}

.question-meta {
  display: flex;
  gap: var(--spacing-mini);
  flex-wrap: wrap;
}

.content-area {
  flex: 1;
  background: var(--color-background);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--box-shadow-small);
  padding: var(--spacing-large);
  overflow-y: auto;
}

.question-detail {
  margin-bottom: var(--spacing-large);
  padding-bottom: var(--spacing-large);
  border-bottom: 1px solid var(--border-color);
}

.question-detail h2 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: var(--spacing-medium);
}

.question-content {
  font-size: var(--font-size-medium);
  line-height: 1.6;
  margin-bottom: var(--spacing-large);
}

.explain-button {
  margin-top: var(--spacing-medium);
}

.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-lg)) {
  .explain-layout {
    flex-direction: column;
    height: auto;
  }
  
  .question-list {
    width: 100%;
    max-height: 400px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .ai-explain-container {
    padding: var(--spacing-medium);
  }
  
  .content-area {
    padding: var(--spacing-medium);
  }
}

@media (max-width: var(--breakpoint-xs)) {
  .ai-explain-container {
    padding: var(--spacing-small);
  }
  
  .filters {
    flex-direction: column;
  }
  
  .content-area {
    padding: var(--spacing-small);
  }
}
</style>