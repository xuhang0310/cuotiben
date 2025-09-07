/**
 * 错题本应用路由管理模块
 * 提供单页应用的路由功能
 */

/**
 * 路由管理器
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
    this.errorHandlers = [];
    this.defaultRoute = '/questions/list';
    this.notFoundRoute = '/404';
    
    this.init();
  }

  /**
   * 初始化路由
   */
  init() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', (event) => {
      this.handlePopState(event);
    });

    // 监听页面加载
    window.addEventListener('DOMContentLoaded', () => {
      this.start();
    });

    // 注册默认路由
    this.registerDefaultRoutes();
  }

  /**
   * 注册默认路由
   */
  registerDefaultRoutes() {
    // 错题列表页
    this.register('/questions/list', {
      title: '错题列表',
      component: 'pages/questions/list.html',
      icon: 'list',
      showInNav: true,
      requireAuth: false
    });

    // 数据看板
    this.register('/dashboard', {
      title: '数据看板',
      component: 'pages/dashboard.html',
      icon: 'dashboard',
      showInNav: true,
      requireAuth: false
    });

    // AI讲解
    this.register('/ai-explanation', {
      title: 'AI讲解',
      component: 'pages/ai-explanation.html',
      icon: 'robot',
      showInNav: true,
      requireAuth: false
    });

    // 重复题簇
    this.register('/clusters', {
      title: '重复题簇',
      component: 'pages/clusters.html',
      icon: 'cluster',
      showInNav: true,
      requireAuth: false
    });

    // 艾宾浩斯日历
    this.register('/calendar', {
      title: '复习日历',
      component: 'pages/calendar.html',
      icon: 'calendar',
      showInNav: true,
      requireAuth: false
    });

    // 错题详情
    this.register('/questions/:id', {
      title: '错题详情',
      component: 'pages/questions/detail.html',
      icon: 'detail',
      showInNav: false,
      requireAuth: false
    });

    // 设置页面
    this.register('/settings', {
      title: '设置',
      component: 'pages/settings.html',
      icon: 'settings',
      showInNav: false,
      requireAuth: false
    });

    // 404页面
    this.register('/404', {
      title: '页面不存在',
      component: 'pages/404.html',
      icon: 'error',
      showInNav: false,
      requireAuth: false
    });

    // 根路径重定向
    this.register('/', {
      redirect: this.defaultRoute
    });
  }

  /**
   * 注册路由
   * @param {string} path - 路由路径
   * @param {Object} config - 路由配置
   */
  register(path, config) {
    // 解析路径参数
    const paramNames = [];
    const regexPath = path.replace(/:([^/]+)/g, (match, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const route = {
      path,
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      ...config
    };

    this.routes.set(path, route);
  }

  /**
   * 启动路由
   */
  start() {
    const currentPath = this.getCurrentPath();
    this.navigate(currentPath, { replace: true });
  }

  /**
   * 获取当前路径
   * @returns {string} 当前路径
   */
  getCurrentPath() {
    return window.location.hash.slice(1) || '/';
  }

  /**
   * 导航到指定路径
   * @param {string} path - 目标路径
   * @param {Object} options - 选项
   */
  async navigate(path, options = {}) {
    try {
      // 执行前置钩子
      const shouldContinue = await this.executeBeforeHooks(path, this.currentRoute);
      if (!shouldContinue) {
        return;
      }

      // 查找匹配的路由
      const route = this.findRoute(path);
      if (!route) {
        this.navigate(this.notFoundRoute, { replace: true });
        return;
      }

      // 处理重定向
      if (route.redirect) {
        this.navigate(route.redirect, options);
        return;
      }

      // 检查权限
      if (route.requireAuth && !this.checkAuth()) {
        this.navigate('/login', { replace: true });
        return;
      }

      // 解析路径参数
      const params = this.parseParams(path, route);
      
      // 更新浏览器历史
      if (!options.replace) {
        window.history.pushState({ path }, '', `#${path}`);
      } else {
        window.history.replaceState({ path }, '', `#${path}`);
      }

      // 保存当前路由信息
      const previousRoute = this.currentRoute;
      this.currentRoute = {
        ...route,
        path,
        params,
        query: this.parseQuery()
      };

      // 加载页面组件
      await this.loadComponent(route.component);

      // 更新页面标题
      this.updateTitle(route.title);

      // 更新导航状态
      this.updateNavigation();

      // 执行后置钩子
      await this.executeAfterHooks(this.currentRoute, previousRoute);

      // 触发路由变更事件
      this.emit('routeChanged', {
        current: this.currentRoute,
        previous: previousRoute
      });

    } catch (error) {
      console.error('路由导航失败:', error);
      this.handleError(error);
    }
  }

  /**
   * 查找匹配的路由
   * @param {string} path - 路径
   * @returns {Object|null} 匹配的路由
   */
  findRoute(path) {
    for (const route of this.routes.values()) {
      if (route.regex.test(path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * 解析路径参数
   * @param {string} path - 路径
   * @param {Object} route - 路由配置
   * @returns {Object} 参数对象
   */
  parseParams(path, route) {
    const matches = path.match(route.regex);
    const params = {};

    if (matches && route.paramNames) {
      route.paramNames.forEach((name, index) => {
        params[name] = matches[index + 1];
      });
    }

    return params;
  }

  /**
   * 解析查询参数
   * @returns {Object} 查询参数对象
   */
  parseQuery() {
    const query = {};
    const search = window.location.search.slice(1);
    
    if (search) {
      search.split('&').forEach(param => {
        const [key, value] = param.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    return query;
  }

  /**
   * 加载页面组件
   * @param {string} componentPath - 组件路径
   */
  async loadComponent(componentPath) {
    try {
      const response = await fetch(componentPath);
      if (!response.ok) {
        throw new Error(`组件加载失败: ${response.status}`);
      }

      const html = await response.text();
      const mainContent = document.getElementById('main-content');
      
      if (mainContent) {
        mainContent.innerHTML = html;
        
        // 执行页面中的脚本
        this.executePageScripts(mainContent);
        
        // 触发页面加载完成事件
        this.emit('pageLoaded', {
          path: componentPath,
          element: mainContent
        });
      }

    } catch (error) {
      console.error('组件加载失败:', error);
      throw error;
    }
  }

  /**
   * 执行页面脚本
   * @param {Element} container - 容器元素
   */
  executePageScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      try {
        if (script.src) {
          // 外部脚本
          const newScript = document.createElement('script');
          newScript.src = script.src;
          newScript.async = false;
          document.head.appendChild(newScript);
        } else {
          // 内联脚本
          eval(script.textContent);
        }
      } catch (error) {
        console.error('脚本执行失败:', error);
      }
    });
  }

  /**
   * 更新页面标题
   * @param {string} title - 标题
   */
  updateTitle(title) {
    document.title = title ? `${title} - 错题本` : '错题本';
  }

  /**
   * 更新导航状态
   */
  updateNavigation() {
    // 更新导航菜单的激活状态
    const navItems = document.querySelectorAll('[data-route]');
    navItems.forEach(item => {
      const routePath = item.getAttribute('data-route');
      if (routePath === this.currentRoute.path) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 更新面包屑
    this.updateBreadcrumb();
  }

  /**
   * 更新面包屑
   */
  updateBreadcrumb() {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;

    const items = this.generateBreadcrumbItems();
    breadcrumb.innerHTML = items.map(item => 
      `<span class="breadcrumb-item">
        ${item.link ? `<a href="#${item.path}">${item.title}</a>` : item.title}
      </span>`
    ).join('<span class="breadcrumb-separator">/</span>');
  }

  /**
   * 生成面包屑项目
   * @returns {Array} 面包屑项目
   */
  generateBreadcrumbItems() {
    const items = [{ title: '首页', path: '/', link: true }];
    
    if (this.currentRoute && this.currentRoute.title) {
      items.push({
        title: this.currentRoute.title,
        path: this.currentRoute.path,
        link: false
      });
    }

    return items;
  }

  /**
   * 处理浏览器前进后退
   * @param {PopStateEvent} event - 事件对象
   */
  handlePopState(event) {
    const path = event.state?.path || this.getCurrentPath();
    this.navigate(path, { replace: true });
  }

  /**
   * 检查用户权限
   * @returns {boolean} 是否有权限
   */
  checkAuth() {
    // 这里可以添加实际的权限检查逻辑
    return true;
  }

  /**
   * 添加前置钩子
   * @param {Function} hook - 钩子函数
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
  }

  /**
   * 添加后置钩子
   * @param {Function} hook - 钩子函数
   */
  afterEach(hook) {
    this.afterHooks.push(hook);
  }

  /**
   * 添加错误处理器
   * @param {Function} handler - 错误处理函数
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * 执行前置钩子
   * @param {string} to - 目标路径
   * @param {Object} from - 当前路由
   * @returns {boolean} 是否继续导航
   */
  async executeBeforeHooks(to, from) {
    for (const hook of this.beforeHooks) {
      try {
        const result = await hook(to, from);
        if (result === false) {
          return false;
        }
      } catch (error) {
        console.error('前置钩子执行失败:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * 执行后置钩子
   * @param {Object} to - 目标路由
   * @param {Object} from - 来源路由
   */
  async executeAfterHooks(to, from) {
    for (const hook of this.afterHooks) {
      try {
        await hook(to, from);
      } catch (error) {
        console.error('后置钩子执行失败:', error);
      }
    }
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('错误处理器执行失败:', handlerError);
      }
    }
  }

  /**
   * 获取所有路由
   * @returns {Array} 路由列表
   */
  getRoutes() {
    return Array.from(this.routes.values());
  }

  /**
   * 获取导航菜单路由
   * @returns {Array} 导航菜单路由
   */
  getNavRoutes() {
    return this.getRoutes().filter(route => route.showInNav);
  }

  /**
   * 返回上一页
   */
  back() {
    window.history.back();
  }

  /**
   * 前进到下一页
   */
  forward() {
    window.history.forward();
  }

  /**
   * 刷新当前页面
   */
  refresh() {
    if (this.currentRoute) {
      this.navigate(this.currentRoute.path, { replace: true });
    }
  }

  /**
   * 事件发射器
   */
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件处理器执行失败:', error);
        }
      });
    }
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners) {
      this.listeners = {};
    }
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.listeners && this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }
}

// 创建全局路由实例
const router = new Router();

// 导出到全局
window.Router = router;

// 兼容模块化导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Router,
    router
  };
}