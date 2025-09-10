<script setup lang="ts">
import { RouterView, useRoute, useRouter, type RouteRecordNormalized } from 'vue-router'
import { ref, computed } from 'vue'

const route = useRoute()
const router = useRouter()

// 从路由配置中动态生成菜单项
const menuItems = computed(() => {
  return router.getRoutes()
    .filter((route: RouteRecordNormalized) => route.meta?.showInMenu)
    .map((route: RouteRecordNormalized) => ({
      key: route.path,
      icon: route.meta?.icon,
      label: route.meta?.label,
      path: route.path
    }))
})

// 当前选中的菜单项
const selectedKeys = computed(() => [route.path])

// 导航到指定路径
const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <a-layout class="app-layout">
    <!-- 顶部导航栏 -->
    <a-layout-header class="app-header">
      <!-- Logo区域 -->
      <div class="logo">
        <BookOutlined class="logo-icon" />
        <span class="logo-text">错题本</span>
      </div>
      
      <!-- 导航菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="horizontal"
        class="app-menu"
      >
        <a-menu-item
          v-for="item in menuItems"
          :key="item.key"
          @click="navigateTo(item.path)"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
      
      <!-- 右侧操作区域 -->
      <div class="header-actions">
        <!-- 这里可以添加用户头像、通知等 -->
      </div>
    </a-layout-header>
    
    <!-- 页面内容 -->
    <a-layout-content class="app-content">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  background: var(--background-color);
  padding: 0 24px;
  display: flex;
  align-items: center;
  box-shadow: var(--box-shadow-small);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  transition: background-color var(--transition-base), box-shadow var(--transition-base);
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
  color: var(--primary-color);
  font-size: var(--font-size-medium);
  font-weight: bold;
  transition: margin var(--transition-base);
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
  transition: margin var(--transition-base);
}

.logo-text {
  white-space: nowrap;
  transition: color var(--transition-base), font-size var(--transition-base);
}

.app-menu {
  flex: 1;
  border-bottom: none;
  background: transparent;
}

.app-menu .ant-menu-item {
  display: flex;
  align-items: center;
  margin: 0 4px;
  padding: 0 16px;
  border-radius: var(--border-radius-small);
  transition: all var(--transition-base);
  font-weight: 500;
  height: 40px;
}

.app-menu .ant-menu-item:hover {
  background: rgba(91, 143, 249, 0.1);
  color: var(--primary-color);
}

.app-menu .ant-menu-item-selected {
  background: var(--primary-color-light);
  color: var(--primary-color);
  font-weight: 600;
}

.app-menu .ant-menu-item-selected::after {
  border-bottom: 2px solid var(--primary-color);
}

.app-menu .ant-menu-item span {
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.app-content {
  min-height: calc(100vh - 64px);
  background: var(--background-color-light);
  overflow-x: hidden;
  transition: background-color var(--transition-base);
}

.content-wrapper {
  padding: 0 5%;
  min-height: 100%;
  width: 90%;
  margin: 0 auto;
  max-width: 1600px;
  transition: padding var(--transition-base), width var(--transition-base);
}

/* 响应式设计 */
@media (max-width: 1440px) {
  .content-wrapper {
    width: 90%;
    padding: 0 5%;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }
  
  .logo {
    margin-right: 20px;
  }
  
  .app-menu .ant-menu-item {
    margin: 0 4px;
    padding: 0 12px;
  }
  
  .app-menu .ant-menu-item span {
    display: none;
  }
  
  .content-wrapper {
    width: 94%;
    padding: 0 3%;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 12px;
  }
  
  .logo {
    margin-right: 16px;
  }
  
  .logo-text {
    display: none;
  }
  
  .app-menu .ant-menu-item {
    margin: 0 2px;
    padding: 0 8px;
  }
  
  .content-wrapper {
    width: 96%;
    padding: 0 2%;
  }
}
</style>
