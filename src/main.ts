import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

// Import all components
import * as components from './components'

// 国际化配置
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      // 中文翻译
    },
    'en': {
      // 英文翻译
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(i18n)

// Register all components globally
Object.entries(components).forEach(([name, component]) => {
  app.component(name, component)
})

app.mount('#app')
