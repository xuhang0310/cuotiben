/**
 * 应用控制器 - 负责整体应用的初始化和路由管理
 */
class AppController {
    constructor() {
        this.currentPage = null;
        this.pageControllers = new Map();
        this.isInitialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // 初始化事件监听
            this.initEventListeners();
            
            // 标记为已初始化
            this.isInitialized = true;
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
        }
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 导航点击事件
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.dataset.page) {
                e.preventDefault();
                this.navigateTo(navItem.dataset.page);
            }
        });

        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    /**
     * 页面导航
     * @param {string} pageName - 页面名称
     */
    async navigateTo(pageName) {
        try {
            // 更新导航状态
            this.updateNavigation(pageName);
            
            // 加载页面内容
            await this.loadPage(pageName);
            
            // 初始化页面控制器
            await this.initPageController(pageName);
            
            this.currentPage = pageName;
            
            console.log(`导航到页面: ${pageName}`);
        } catch (error) {
            console.error(`页面导航失败: ${pageName}`, error);
        }
    }

    /**
     * 更新导航状态
     * @param {string} activePage - 当前激活的页面
     */
    updateNavigation(activePage) {
        // 移除所有active状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加当前页面的active状态
        const activeNavItem = document.querySelector(`[data-page="${activePage}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    /**
     * 加载页面内容
     * @param {string} pageName - 页面名称
     */
    async loadPage(pageName) {
        const pageContainer = document.getElementById('page-container');
        if (!pageContainer) {
            throw new Error('页面容器未找到');
        }

        try {
            // 构建页面路径
            const pagePath = `pages/${pageName}.html`;
            
            // 获取页面内容
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`页面加载失败: ${response.status}`);
            }
            
            const html = await response.text();
            pageContainer.innerHTML = html;
            
        } catch (error) {
            // 如果页面不存在，显示默认内容
            pageContainer.innerHTML = `
                <div class="page-error">
                    <h3>页面暂未实现</h3>
                    <p>页面 "${pageName}" 正在开发中...</p>
                </div>
            `;
            console.warn(`页面加载失败: ${pageName}`, error);
        }
    }

    /**
     * 初始化页面控制器
     * @param {string} pageName - 页面名称
     */
    async initPageController(pageName) {
        try {
            // 清理之前的控制器
            if (this.pageControllers.has(this.currentPage)) {
                const prevController = this.pageControllers.get(this.currentPage);
                if (prevController && typeof prevController.destroy === 'function') {
                    prevController.destroy();
                }
            }

            // 动态加载页面脚本
            const scriptPath = `scripts/pages/${pageName}.js`;
            
            // 检查脚本是否已加载
            if (!document.querySelector(`script[src="${scriptPath}"]`)) {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.onload = () => {
                    this.createPageController(pageName);
                };
                script.onerror = () => {
                    console.warn(`页面脚本加载失败: ${scriptPath}`);
                };
                document.head.appendChild(script);
            } else {
                this.createPageController(pageName);
            }
            
        } catch (error) {
            console.warn(`页面控制器初始化失败: ${pageName}`, error);
        }
    }

    /**
     * 创建页面控制器实例
     * @param {string} pageName - 页面名称
     */
    createPageController(pageName) {
        try {
            // 根据页面名称获取控制器类
            const controllerClassName = this.getControllerClassName(pageName);
            const ControllerClass = window[controllerClassName];
            
            if (ControllerClass) {
                const controller = new ControllerClass();
                if (typeof controller.init === 'function') {
                    controller.init();
                }
                this.pageControllers.set(pageName, controller);
            }
        } catch (error) {
            console.warn(`页面控制器创建失败: ${pageName}`, error);
        }
    }

    /**
     * 获取控制器类名
     * @param {string} pageName - 页面名称
     * @returns {string} 控制器类名
     */
    getControllerClassName(pageName) {
        // 将页面名称转换为控制器类名
        // 例如: questions -> QuestionsController
        //      ai-explanation -> AiExplanationController
        return pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('') + 'Controller';
    }

    /**
     * 处理搜索
     * @param {string} query - 搜索关键词
     */
    handleSearch(query) {
        // 触发当前页面的搜索功能
        if (this.currentPage && this.pageControllers.has(this.currentPage)) {
            const controller = this.pageControllers.get(this.currentPage);
            if (controller && typeof controller.handleSearch === 'function') {
                controller.handleSearch(query);
            }
        }
    }

    /**
     * 获取当前页面控制器
     * @returns {Object|null} 当前页面控制器实例
     */
    getCurrentPageController() {
        return this.pageControllers.get(this.currentPage) || null;
    }

    /**
     * 销毁应用
     */
    destroy() {
        // 清理所有页面控制器
        this.pageControllers.forEach(controller => {
            if (controller && typeof controller.destroy === 'function') {
                controller.destroy();
            }
        });
        this.pageControllers.clear();
        
        this.isInitialized = false;
        console.log('应用已销毁');
    }
}

// 导出到全局作用域
window.AppController = AppController;