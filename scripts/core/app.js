/**
 * 错题本应用核心模块
 * 负责应用初始化、路由管理、组件加载等核心功能
 */

class CuotibenApp {
  constructor() {
    this.currentPage = null;
    this.components = new Map();
    this.eventBus = new EventTarget();
    this.config = {
      apiBase: '/api',
      pageContainer: '#page-container',
      headerContainer: '#header-container',
      sidebarContainer: '#sidebar-container'
    };
    
    this.init();
  }

  /**
   * 应用初始化
   */
  async init() {
    try {
      console.log('🚀 错题本应用启动中...');
      
      // 加载公共组件
      await this.loadComponents();
      
      // 初始化路由
      this.initRouter();
      
      // 绑定全局事件
      this.bindGlobalEvents();
      
      // 加载默认页面
      await this.loadDefaultPage();
      
      console.log('✅ 错题本应用启动完成');
    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      this.showError('应用启动失败，请刷新页面重试');
    }
  }

  /**
   * 加载公共组件
   */
  async loadComponents() {
    const components = [
      { name: 'header', url: '/components/header.html', container: this.config.headerContainer },
      { name: 'sidebar', url: '/components/sidebar.html', container: this.config.sidebarContainer }
    ];

    for (const component of components) {
      try {
        const html = await this.fetchHTML(component.url);
        const container = document.querySelector(component.container);
        if (container) {
          container.innerHTML = html;
          this.components.set(component.name, container);
          console.log(`📦 组件 ${component.name} 加载完成`);
        }
      } catch (error) {
        console.error(`❌ 组件 ${component.name} 加载失败:`, error);
      }
    }

    // 初始化组件功能
    this.initHeaderComponent();
    this.initSidebarComponent();
  }

  /**
   * 初始化头部组件
   */
  initHeaderComponent() {
    const header = this.components.get('header');
    if (!header) return;

    // 搜索功能
    const searchInput = header.querySelector('.nav-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        this.handleSearch(e.target.value);
      }, 300));

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearch(e.target.value);
        }
      });
    }

    // 用户菜单
    const userTrigger = header.querySelector('.nav-user-trigger');
    const userDropdown = header.querySelector('.nav-user');
    if (userTrigger && userDropdown) {
      userTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        userDropdown.classList.remove('open');
      });
    }

    // 通知按钮
    const notificationBtn = header.querySelector('.nav-action-btn[data-action="notifications"]');
    if (notificationBtn) {
      notificationBtn.addEventListener('click', () => {
        this.showNotifications();
      });
    }

    // 移动端菜单按钮
    const mobileMenuBtn = header.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        this.toggleMobileSidebar();
      });
    }
  }

  /**
   * 初始化侧边栏组件
   */
  initSidebarComponent() {
    const sidebar = this.components.get('sidebar');
    if (!sidebar) return;

    // 筛选器事件
    const filterSelects = sidebar.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
      select.addEventListener('change', () => {
        this.handleFilterChange();
      });
    });

    // 重置按钮
    const resetBtn = sidebar.querySelector('.reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // 应用筛选按钮
    const applyBtn = sidebar.querySelector('.apply-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyFilters();
      });
    }
  }

  /**
   * 初始化路由
   */
  initRouter() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.loadPage(e.state.page, false);
      }
    });

    // 监听导航链接点击
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-page]');
      if (link) {
        e.preventDefault();
        const page = link.dataset.page;
        this.loadPage(page);
      }
    });
  }

  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.focusSearch();
      }
      
      // ESC 关闭模态框
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });

    // 窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // 网络状态变化
    window.addEventListener('online', () => {
      this.showNotification('网络连接已恢复', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('网络连接已断开', 'warning');
    });
  }

  /**
   * 加载页面
   */
  async loadPage(pageName, pushState = true) {
    try {
      console.log(`📄 加载页面: ${pageName}`);
      
      // 显示加载状态
      this.showLoading();
      
      // 获取页面配置
      console.log(`🔍 查找页面配置: ${pageName}`);
      const pageConfig = this.getPageConfig(pageName);
      console.log(`📋 页面配置:`, pageConfig);
      if (!pageConfig) {
        throw new Error(`未找到页面配置: ${pageName}`);
      }
      
      // 加载页面HTML
      const html = await this.fetchHTML(pageConfig.url);
      
      // 更新页面容器
      const container = document.querySelector(this.config.pageContainer);
      if (container) {
        container.innerHTML = html;
      }
      
      // 加载页面脚本
      if (pageConfig.script) {
        await this.loadScript(pageConfig.script);
      }
      
      // 更新当前页面
      this.currentPage = pageName;
      
      // 更新导航状态
      this.updateNavigation(pageName);
      
      // 更新浏览器历史
      if (pushState) {
        history.pushState({ page: pageName }, '', `#${pageName}`);
      }
      
      // 触发页面加载完成事件
      this.eventBus.dispatchEvent(new CustomEvent('pageLoaded', {
        detail: { page: pageName }
      }));
      
      console.log(`✅ 页面 ${pageName} 加载完成`);
    } catch (error) {
      console.error(`❌ 页面 ${pageName} 加载失败:`, error);
      this.showError(`页面加载失败: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 获取页面配置
   */
  getPageConfig(pageName) {
    const pages = {
      '/questions/list': {
        url: '/pages/questions/list.html',
        script: '/scripts/pages/questions.js',
        title: '错题列表'
      },
      '/dashboard': {
        url: '/pages/dashboard.html',
        script: '/scripts/pages/dashboard.js',
        title: '数据看板'
      },
      '/ai-explanation': {
        url: '/pages/ai-explanation.html',
        script: '/scripts/pages/ai-explanation.js',
        title: 'AI讲解'
      },
      '/clusters': {
        url: '/pages/clusters.html',
        script: '/scripts/pages/clusters.js',
        title: '重复题簇'
      },
      '/calendar': {
        url: '/pages/calendar.html',
        script: '/scripts/pages/calendar.js',
        title: '艾宾浩斯日历'
      },
      // 兼容旧的路径格式
      'questions': {
        url: '/pages/questions/list.html',
        script: '/scripts/pages/questions.js',
        title: '错题列表'
      },
      'dashboard': {
        url: '/pages/dashboard.html',
        script: '/scripts/pages/dashboard.js',
        title: '数据看板'
      },
      'ai-explanation': {
        url: '/pages/ai-explanation.html',
        script: '/scripts/pages/ai-explanation.js',
        title: 'AI讲解'
      },
      'clusters': {
        url: '/pages/clusters.html',
        script: '/scripts/pages/clusters.js',
        title: '重复题簇'
      },
      'calendar': {
        url: '/pages/calendar.html',
        script: '/scripts/pages/calendar.js',
        title: '艾宾浩斯日历'
      }
    };
    
    return pages[pageName];
  }

  /**
   * 加载默认页面
   */
  async loadDefaultPage() {
    const hash = window.location.hash.slice(1);
    const defaultPage = hash || '/questions/list';
    await this.loadPage(defaultPage, false);
  }

  /**
   * 更新导航状态
   */
  updateNavigation(activePage) {
    // 更新主导航
    const navLinks = document.querySelectorAll('.nav-menu-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === activePage) {
        link.classList.add('active');
      }
    });

    // 更新页面标题
    const pageConfig = this.getPageConfig(activePage);
    if (pageConfig && pageConfig.title) {
      document.title = `${pageConfig.title} - 错题本`;
    }
  }

  /**
   * 获取HTML内容
   */
  async fetchHTML(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * 动态加载脚本
   */
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      // 检查脚本是否已加载
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * 处理搜索
   */
  handleSearch(query) {
    console.log('🔍 搜索:', query);
    this.eventBus.dispatchEvent(new CustomEvent('search', {
      detail: { query }
    }));
  }

  /**
   * 聚焦搜索框
   */
  focusSearch() {
    const searchInput = document.querySelector('.nav-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  /**
   * 处理筛选器变化
   */
  handleFilterChange() {
    const filters = this.getFilters();
    console.log('🔧 筛选器变化:', filters);
    this.eventBus.dispatchEvent(new CustomEvent('filterChange', {
      detail: { filters }
    }));
  }

  /**
   * 获取当前筛选器值
   */
  getFilters() {
    const sidebar = this.components.get('sidebar');
    if (!sidebar) return {};

    const filters = {};
    const selects = sidebar.querySelectorAll('.filter-select');
    selects.forEach(select => {
      if (select.value) {
        filters[select.name] = select.value;
      }
    });

    return filters;
  }

  /**
   * 重置筛选器
   */
  resetFilters() {
    const sidebar = this.components.get('sidebar');
    if (!sidebar) return;

    const selects = sidebar.querySelectorAll('.filter-select');
    selects.forEach(select => {
      select.value = '';
    });

    this.handleFilterChange();
  }

  /**
   * 应用筛选器
   */
  applyFilters() {
    this.handleFilterChange();
  }

  /**
   * 显示通知
   */
  showNotifications() {
    console.log('🔔 显示通知');
    // TODO: 实现通知面板
  }

  /**
   * 切换移动端侧边栏
   */
  toggleMobileSidebar() {
    const sidebar = this.components.get('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  /**
   * 显示加载状态
   */
  showLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
      loading.classList.add('show');
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
      loading.classList.remove('show');
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * 显示通知消息
   */
  showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">
          <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
          ${this.getNotificationTitle(type)}
        </div>
        <button class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notification-content">${message}</div>
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // 绑定关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });

    // 自动关闭
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);
  }

  /**
   * 隐藏通知
   */
  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * 获取通知图标
   */
  getNotificationIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      error: 'fas fa-times-circle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  /**
   * 获取通知标题
   */
  getNotificationTitle(type) {
    const titles = {
      success: '成功',
      warning: '警告',
      error: '错误',
      info: '提示'
    };
    return titles[type] || titles.info;
  }

  /**
   * 关闭模态框
   */
  closeModals() {
    const modals = document.querySelectorAll('.modal-overlay.show');
    modals.forEach(modal => {
      modal.classList.remove('show');
    });
  }

  /**
   * 处理窗口大小变化
   */
  handleResize() {
    // 移动端适配
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
    
    // 触发窗口大小变化事件
    this.eventBus.dispatchEvent(new CustomEvent('resize', {
      detail: { width: window.innerWidth, height: window.innerHeight, isMobile }
    }));
  }

  /**
   * 防抖函数
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * 节流函数
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 获取事件总线
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * 获取当前页面
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * 获取组件
   */
  getComponent(name) {
    return this.components.get(name);
  }
}

// 全局应用实例
window.CuotibenApp = CuotibenApp;

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CuotibenApp();
});

// 导出应用类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CuotibenApp;
}