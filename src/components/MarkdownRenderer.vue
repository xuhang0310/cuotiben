<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import 'katex/dist/katex.min.css'

// 初始化Markdown解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (error) {
        // 语法高亮失败时返回原始字符串
        console.warn('Syntax highlighting failed:', error)
      }
    }
    return ''
  }
})

// 添加KaTeX支持
md.use(mdKatex)

interface Props {
  content: string
}

const props = defineProps<Props>()
const renderedContent = ref('')

const renderMarkdown = () => {
  if (!props.content) {
    renderedContent.value = ''
    return
  }
  renderedContent.value = md.render(props.content)
}

// 初始渲染
onMounted(() => {
  renderMarkdown()
})

// 监听内容变化
watch(() => props.content, () => {
  renderMarkdown()
})
</script>

<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 16px;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.markdown-content :deep(li) {
  margin-bottom: 8px;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e8e8e8;
  padding-left: 16px;
  color: #8c8c8c;
  margin-bottom: 16px;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e8e8e8;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #fafafa;
  font-weight: 500;
}
</style>