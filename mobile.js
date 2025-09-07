// 移动端错题本应用 - Ant Design风格
class MobileApp {
    constructor() {
        this.currentPage = 'questions';
        this.touchStart = { x: 0, y: 0, time: 0 };
        this.touchEnd = { x: 0, y: 0, time: 0 };
        this.isDrawerOpen = false;
        this.selectedQuestions = new Set();
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupGestureHandlers();
        this.setupQuestionCards();
        this.setupDrawer();
        this.setupFilters();
        this.setupSearch();
        this.setupPullToRefresh();
        this.setupVibration();
        this.setupProfileMenu();
    }
    
    // 设置底部导航
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-page]');
        const addBtn = document.querySelector('.nav-item.add-btn');
        const fabBtn = document.getElementById('addQuestionFab');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.dataset.page;
                this.switchPage(targetPage);
                this.updateActiveNav(item);
                this.vibrate('light');
            });
        });
        
        // 添加题目按钮
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddQuestionModal();
                this.vibrate('medium');
            });
        }
        
        if (fabBtn) {
            fabBtn.addEventListener('click', () => {
                this.showAddQuestionModal();
                this.vibrate('medium');
            });
        }
    }
    
    // 页面切换
    switchPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.mobile-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // 页面切换动画
            this.animatePageTransition(targetPage);
            
            // 根据页面类型执行特定逻辑
            this.handlePageSpecificActions(pageId);
        }
    }
    
    // 更新底部导航激活状态
    updateActiveNav(activeItem) {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
    
    // 页面切换动画
    animatePageTransition(page) {
        page.style.opacity = '0';
        page.style.transform = 'translateX(20px)';
        
        requestAnimationFrame(() => {
            page.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            page.style.opacity = '1';
            page.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                page.style.transition = '';
            }, 300);
        });
    }
    
    // 页面特定操作
    handlePageSpecificActions(pageId) {
        switch(pageId) {
            case 'questions':
                this.loadQuestions();
                break;
            case 'review':
                this.loadReviewData();
                break;
            case 'ai':
                this.checkAIStatus();
                break;
            case 'profile':
                this.loadProfile();
                this.animateStatsOverview();
                break;
        }
    }
    
    // 设置手势识别
    setupGestureHandlers() {
        const mainElement = document.querySelector('.mobile-main');
        
        mainElement.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        mainElement.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        mainElement.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
    }
    
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStart = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
    }
    
    handleTouchMove(e) {
        // 阻止某些情况下的默认滚动行为
        if (this.isDrawerOpen) {
            const touch = e.touches[0];
            const deltaY = touch.clientY - this.touchStart.y;
            
            // 在抽屉打开时，如果是向下滑动且在顶部，允许关闭抽屉
            if (deltaY > 0 && this.isAtDrawerTop()) {
                e.preventDefault();
            }
        }
    }
    
    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        this.touchEnd = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now()
        };
        
        this.recognizeGesture();
    }
    
    // 手势识别
    recognizeGesture() {
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const deltaTime = this.touchEnd.time - this.touchStart.time;
        
        // 滑动阈值
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;
        
        if (Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
        } else if (Math.abs(deltaY) > minSwipeDistance && deltaTime < maxSwipeTime) {
            // 垂直滑动
            if (deltaY > 0) {
                this.handleSwipeDown();
            } else {
                this.handleSwipeUp();
            }
        }
    }
    
    handleSwipeLeft() {
        // 在错题列表页面左滑删除
        if (this.currentPage === 'questions') {
            this.showSwipeActions('delete');
        }
    }
    
    handleSwipeRight() {
        // 在错题列表页面右滑标记已掌握
        if (this.currentPage === 'questions') {
            this.showSwipeActions('mastered');
        }
        // 或者返回操作
        if (this.isDrawerOpen) {
            this.closeDrawer();
        }
    }
    
    handleSwipeDown() {
        // 下拉刷新
        if (!this.isDrawerOpen && this.isAtPageTop()) {
            this.triggerPullToRefresh();
        }
        // 或者关闭抽屉
        if (this.isDrawerOpen && this.isAtDrawerTop()) {
            this.closeDrawer();
        }
    }
    
    handleSwipeUp() {
        // 向上滑动可能的操作
        if (this.currentPage === 'questions' && !this.isDrawerOpen) {
            // 可以添加快速筛选等功能
        }
    }
    
    // 设置错题卡片交互
    setupQuestionCards() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.mobile-question-card');
            if (card) {
                const questionId = card.dataset.id;
                
                // 检查是否点击的是操作按钮
                if (e.target.closest('.action-btn')) {
                    const isViewBtn = e.target.closest('.action-btn.primary');
                    const isEditBtn = e.target.closest('.action-btn.secondary');
                    
                    if (isViewBtn) {
                        this.showQuestionDetail(questionId);
                        this.vibrate('light');
                    } else if (isEditBtn) {
                        this.editQuestion(questionId);
                        this.vibrate('light');
                    }
                } else {
                    // 点击卡片其他区域显示详情
                    this.showQuestionDetail(questionId);
                    this.vibrate('light');
                }
            }
        });
        
        // 长按选择
        this.setupLongPress();
    }
    
    // 设置长按选择
    setupLongPress() {
        let pressTimer;
        let pressStarted = false;
        
        document.addEventListener('touchstart', (e) => {
            const card = e.target.closest('.mobile-question-card');
            if (card) {
                pressStarted = false;
                pressTimer = setTimeout(() => {
                    pressStarted = true;
                    this.toggleQuestionSelection(card);
                    this.vibrate('heavy');
                }, 500);
            }
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            if (pressStarted) {
                // 阻止点击事件
                setTimeout(() => {
                    pressStarted = false;
                }, 100);
            }
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
            pressStarted = false;
        });
    }
    
    // 切换题目选择状态
    toggleQuestionSelection(card) {
        const questionId = card.dataset.id;
        
        if (this.selectedQuestions.has(questionId)) {
            this.selectedQuestions.delete(questionId);
            card.classList.remove('selected');
        } else {
            this.selectedQuestions.add(questionId);
            card.classList.add('selected');
        }
        
        this.updateSelectionUI();
    }
    
    // 更新选择UI
    updateSelectionUI() {
        const selectedCount = this.selectedQuestions.size;
        
        if (selectedCount > 0) {
            this.showSelectionToolbar(selectedCount);
        } else {
            this.hideSelectionToolbar();
        }
    }
    
    // 显示选择工具栏
    showSelectionToolbar(count) {
        let toolbar = document.querySelector('.selection-toolbar');
        
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'selection-toolbar';
            toolbar.innerHTML = `
                <div class="selection-info">已选择 <span class="count">${count}</span> 项</div>
                <div class="selection-actions">
                    <button class="toolbar-btn" data-action="delete">删除</button>
                    <button class="toolbar-btn" data-action="export">导出</button>
                    <button class="toolbar-btn" data-action="cancel">取消</button>
                </div>
            `;
            document.body.appendChild(toolbar);
            
            // 添加事件监听
            toolbar.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleSelectionAction(action);
            });
        }
        
        toolbar.querySelector('.count').textContent = count;
        toolbar.classList.add('active');
    }
    
    // 隐藏选择工具栏
    hideSelectionToolbar() {
        const toolbar = document.querySelector('.selection-toolbar');
        if (toolbar) {
            toolbar.classList.remove('active');
        }
    }
    
    // 处理选择操作
    handleSelectionAction(action) {
        switch(action) {
            case 'delete':
                this.deleteSelectedQuestions();
                break;
            case 'export':
                this.exportSelectedQuestions();
                break;
            case 'cancel':
                this.clearSelection();
                break;
        }
    }
    
    // 清除选择
    clearSelection() {
        this.selectedQuestions.clear();
        document.querySelectorAll('.mobile-question-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.hideSelectionToolbar();
    }
    
    // 设置抽屉交互
    setupDrawer() {
        const drawer = document.getElementById('questionDrawer');
        const overlay = document.getElementById('overlay');
        const closeBtn = document.getElementById('drawerClose');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeDrawer();
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeDrawer();
            });
        }
        
        // 设置掌握度评分
        this.setupMasteryRating();
    }
    
    // 显示题目详情
    showQuestionDetail(questionId) {
        const drawer = document.getElementById('questionDrawer');
        const overlay = document.getElementById('overlay');
        
        if (drawer && overlay) {
            // 加载题目数据
            this.loadQuestionDetail(questionId);
            
            // 显示抽屉
            drawer.classList.add('active');
            overlay.classList.add('active');
            this.isDrawerOpen = true;
            
            // 禁用背景滚动
            document.body.style.overflow = 'hidden';
        }
    }
    
    // 关闭抽屉
    closeDrawer() {
        const drawer = document.getElementById('questionDrawer');
        const overlay = document.getElementById('overlay');
        
        if (drawer && overlay) {
            drawer.classList.remove('active');
            overlay.classList.remove('active');
            this.isDrawerOpen = false;
            
            // 恢复背景滚动
            document.body.style.overflow = '';
        }
    }
    
    // 设置掌握度评分
    setupMasteryRating() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mastery-rating .star')) {
                const rating = parseInt(e.target.dataset.rating);
                const stars = e.target.parentElement.querySelectorAll('.star');
                
                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('filled');
                    } else {
                        star.classList.remove('filled');
                    }
                });
                
                this.saveMasteryRating(rating);
                this.vibrate('light');
            }
        });
    }
    
    // 设置筛选器
    setupFilters() {
        const filterChips = document.querySelectorAll('.filter-chip');
        
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // 更新激活状态
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                // 执行筛选
                const filter = chip.dataset.filter;
                this.applyFilter(filter);
                this.vibrate('light');
            });
        });
    }
    
    // 设置搜索
    setupSearch() {
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showSearchModal();
                this.vibrate('light');
            });
        }
    }
    
    // 设置下拉刷新
    setupPullToRefresh() {
        let startY = 0;
        let pullDistance = 0;
        let isPulling = false;
        const refreshThreshold = 80;
        
        const mainElement = document.querySelector('.mobile-main');
        
        mainElement.addEventListener('touchstart', (e) => {
            if (this.isAtPageTop()) {
                startY = e.touches[0].clientY;
            }
        });
        
        mainElement.addEventListener('touchmove', (e) => {
            if (this.isAtPageTop() && !this.isDrawerOpen) {
                pullDistance = e.touches[0].clientY - startY;
                
                if (pullDistance > 0) {
                    isPulling = true;
                    this.updatePullToRefreshUI(pullDistance, refreshThreshold);
                    
                    // 添加阻尼效果
                    if (pullDistance > refreshThreshold) {
                        e.preventDefault();
                    }
                }
            }
        });
        
        mainElement.addEventListener('touchend', () => {
            if (isPulling) {
                if (pullDistance > refreshThreshold) {
                    this.triggerRefresh();
                }
                this.resetPullToRefresh();
                isPulling = false;
                pullDistance = 0;
            }
        });
    }
    
    // 设置震动反馈
    setupVibration() {
        // 检查是否支持震动API
        this.supportsVibration = 'vibrate' in navigator;
    }

    // 设置个人中心菜单
    setupProfileMenu() {
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item[data-action]');
            if (menuItem) {
                const action = menuItem.dataset.action;
                this.handleMenuAction(action);
                this.vibrate('light');
            }
        });

        // 设置统计模态框
        const statsModalClose = document.getElementById('statsModalClose');
        if (statsModalClose) {
            statsModalClose.addEventListener('click', () => {
                this.closeStatsModal();
            });
        }

        // 时间选择器
        document.addEventListener('click', (e) => {
            if (e.target.matches('.time-btn')) {
                const timeButtons = e.target.parentElement.querySelectorAll('.time-btn');
                timeButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // 重新加载统计数据
                this.loadStatsData(e.target.textContent);
                this.vibrate('light');
            }
        });
    }

    // 处理菜单操作
    handleMenuAction(action) {
        switch(action) {
            case 'stats':
                this.showStatsModal();
                break;
            case 'export':
                this.showExportOptions();
                break;
            case 'share':
                this.shareToTeacher();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }

    // 显示统计模态框
    showStatsModal() {
        const modal = document.getElementById('statsModal');
        const overlay = document.getElementById('overlay');
        
        if (modal && overlay) {
            modal.classList.add('active');
            overlay.classList.add('active');
            
            // 禁用背景滚动
            document.body.style.overflow = 'hidden';
            
            // 加载并动画显示统计数据
            this.loadStatsData('本周');
            setTimeout(() => {
                this.animateStatsCounters();
                this.animateCharts();
            }, 300);
        }
    }

    // 关闭统计模态框
    closeStatsModal() {
        const modal = document.getElementById('statsModal');
        const overlay = document.getElementById('overlay');
        
        if (modal && overlay) {
            modal.classList.remove('active');
            overlay.classList.remove('active');
            
            // 恢复背景滚动
            document.body.style.overflow = '';
        }
    }
    
    // 震动反馈
    vibrate(type = 'light') {
        if (!this.supportsVibration) return;
        
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [50],
            success: [10, 50, 10],
            error: [100, 50, 100]
        };
        
        navigator.vibrate(patterns[type] || patterns.light);
    }
    
    // 工具方法
    isAtPageTop() {
        return window.scrollY === 0;
    }
    
    isAtDrawerTop() {
        const drawerContent = document.querySelector('.drawer-content');
        return drawerContent ? drawerContent.scrollTop === 0 : true;
    }
    
    // 数据加载方法
    loadQuestions() {
        // 模拟加载错题数据
        console.log('Loading questions...');
        
        // 添加加载动画
        this.showLoadingState('questions');
        
        setTimeout(() => {
            this.hideLoadingState('questions');
            console.log('Questions loaded');
        }, 1000);
    }
    
    loadQuestionDetail(questionId) {
        console.log('Loading question detail:', questionId);
        // 实际应用中这里会从API加载详细数据
    }
    
    loadReviewData() {
        console.log('Loading review data...');
        this.showLoadingState('review');
        
        setTimeout(() => {
            this.hideLoadingState('review');
        }, 800);
    }
    
    loadStats() {
        console.log('Loading statistics...');
        this.showLoadingState('stats');
        
        setTimeout(() => {
            this.hideLoadingState('stats');
            this.animateStatsCounters();
        }, 1000);
    }
    
    loadProfile() {
        console.log('Loading profile...');
    }
    
    checkAIStatus() {
        console.log('Checking AI status...');
    }
    
    // UI 交互方法
    showLoadingState(section) {
        const element = document.getElementById(section);
        if (element) {
            element.classList.add('loading');
        }
    }
    
    hideLoadingState(section) {
        const element = document.getElementById(section);
        if (element) {
            element.classList.remove('loading');
        }
    }
    
    animateStatsCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(element => {
            const target = element.textContent;
            const isPercentage = target.includes('%');
            const numericTarget = parseInt(target.replace('%', ''));
            
            let current = 0;
            const increment = numericTarget / 30;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericTarget) {
                    current = numericTarget;
                    clearInterval(timer);
                }
                
                element.textContent = Math.floor(current) + (isPercentage ? '%' : '');
            }, 50);
        });
    }

    // 动画显示个人中心统计概览
    animateStatsOverview() {
        const statNumbers = document.querySelectorAll('.stat-mini-number');
        
        statNumbers.forEach((element, index) => {
            setTimeout(() => {
                const target = element.textContent;
                const isPercentage = target.includes('%');
                const numericTarget = parseInt(target.replace('%', ''));
                
                let current = 0;
                const increment = numericTarget / 20;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericTarget) {
                        current = numericTarget;
                        clearInterval(timer);
                    }
                    
                    element.textContent = Math.floor(current) + (isPercentage ? '%' : '');
                }, 30);
            }, index * 100);
        });
    }

    // 动画显示图表
    animateCharts() {
        // 动画趋势图
        const trendBars = document.querySelectorAll('.trend-bar');
        trendBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.height = bar.style.height || '60%';
            }, index * 100);
        });

        // 动画学科分布图
        const chartBars = document.querySelectorAll('.chart-bar');
        chartBars.forEach((bar, index) => {
            const originalWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = originalWidth;
            }, index * 150);
        });
    }

    // 加载统计数据
    loadStatsData(period) {
        console.log('Loading stats data for:', period);
        // 这里可以根据时间周期加载不同的数据
        // 实际应用中会调用API获取数据
    }

    // 其他菜单功能
    showExportOptions() {
        this.showToast('导出功能开发中...');
    }

    shareToTeacher() {
        // 模拟分享功能
        if (navigator.share) {
            navigator.share({
                title: '我的错题本',
                text: '这是我最近的学习情况，请老师查看指导',
                url: window.location.href
            });
        } else {
            this.showToast('分享功能开发中...');
        }
    }

    showHelp() {
        this.showToast('帮助页面开发中...');
    }

    showAbout() {
        this.showToast('关于我们页面开发中...');
    }
    
    applyFilter(filterType) {
        console.log('Applying filter:', filterType);
        
        const cards = document.querySelectorAll('.mobile-question-card');
        
        cards.forEach(card => {
            const shouldShow = this.cardMatchesFilter(card, filterType);
            card.style.display = shouldShow ? 'block' : 'none';
        });
        
        // 添加筛选动画
        this.animateFilterResults();
    }
    
    cardMatchesFilter(card, filterType) {
        if (filterType === 'all') return true;
        
        const subjectTag = card.querySelector('.subject-tag');
        const reviewBadge = card.querySelector('.review-badge');
        
        switch(filterType) {
            case 'math':
                return subjectTag && subjectTag.classList.contains('math');
            case 'chinese':
                return subjectTag && subjectTag.classList.contains('chinese');
            case 'english':
                return subjectTag && subjectTag.classList.contains('english');
            case 'need-review':
                return reviewBadge && (reviewBadge.classList.contains('urgent') || reviewBadge.classList.contains('normal'));
            default:
                return true;
        }
    }
    
    animateFilterResults() {
        const visibleCards = document.querySelectorAll('.mobile-question-card[style*="block"], .mobile-question-card:not([style*="none"])');
        
        visibleCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    // 业务逻辑方法
    showAddQuestionModal() {
        console.log('Show add question modal');
        // 这里可以显示添加题目的模态框
        this.showToast('添加新错题功能');
    }
    
    editQuestion(questionId) {
        console.log('Edit question:', questionId);
        this.showToast('编辑题目功能');
    }
    
    deleteSelectedQuestions() {
        const count = this.selectedQuestions.size;
        console.log('Delete selected questions:', Array.from(this.selectedQuestions));
        
        this.showConfirmDialog(
            '确认删除',
            `确定要删除选中的 ${count} 道题目吗？`,
            () => {
                // 执行删除
                this.clearSelection();
                this.showToast(`已删除 ${count} 道题目`);
                this.vibrate('success');
            }
        );
    }
    
    exportSelectedQuestions() {
        const count = this.selectedQuestions.size;
        console.log('Export selected questions:', Array.from(this.selectedQuestions));
        this.showToast(`正在导出 ${count} 道题目...`);
    }
    
    saveMasteryRating(rating) {
        console.log('Save mastery rating:', rating);
        this.showToast(`已设置掌握度：${rating}星`);
    }
    
    showSearchModal() {
        console.log('Show search modal');
        this.showToast('搜索功能');
    }
    
    triggerRefresh() {
        console.log('Trigger refresh');
        this.showToast('正在刷新...');
        this.vibrate('light');
        
        // 模拟刷新
        setTimeout(() => {
            this.loadQuestions();
            this.showToast('刷新完成');
        }, 1000);
    }
    
    updatePullToRefreshUI(distance, threshold) {
        // 更新下拉刷新UI
        const progress = Math.min(distance / threshold, 1);
        console.log('Pull to refresh progress:', progress);
    }
    
    resetPullToRefresh() {
        // 重置下拉刷新状态
        console.log('Reset pull to refresh');
    }
    
    // UI 组件方法
    showToast(message, duration = 2000) {
        // 移除现有的Toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 创建新的Toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            zIndex: '10000',
            opacity: '0',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
        });
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
    
    showConfirmDialog(title, message, onConfirm, onCancel) {
        // 创建确认对话框
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay"></div>
            <div class="dialog-content">
                <h3 class="dialog-title">${title}</h3>
                <p class="dialog-message">${message}</p>
                <div class="dialog-actions">
                    <button class="dialog-btn cancel">取消</button>
                    <button class="dialog-btn confirm">确认</button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .confirm-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .dialog-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            .dialog-content {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin: 20px;
                max-width: 300px;
                width: 100%;
                position: relative;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            .dialog-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }
            .dialog-message {
                font-size: 14px;
                color: #666;
                margin-bottom: 20px;
                text-align: center;
                line-height: 1.5;
            }
            .dialog-actions {
                display: flex;
                gap: 12px;
            }
            .dialog-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .dialog-btn.cancel {
                background: #f5f5f5;
                color: #666;
            }
            .dialog-btn.confirm {
                background: #1677ff;
                color: white;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        dialog.querySelector('.cancel').addEventListener('click', () => {
            dialog.remove();
            style.remove();
            if (onCancel) onCancel();
        });
        
        dialog.querySelector('.confirm').addEventListener('click', () => {
            dialog.remove();
            style.remove();
            if (onConfirm) onConfirm();
        });
        
        dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
            dialog.remove();
            style.remove();
            if (onCancel) onCancel();
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new MobileApp();
    
    // 暴露到全局作用域用于调试
    window.mobileApp = app;
    
    // 添加选择工具栏样式
    const selectionToolbarStyle = document.createElement('style');
    selectionToolbarStyle.textContent = `
        .selection-toolbar {
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            background: var(--primary);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1001;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        }
        .selection-toolbar.active {
            transform: translateY(0);
        }
        .selection-info {
            font-size: 14px;
            font-weight: 500;
        }
        .selection-actions {
            display: flex;
            gap: 12px;
        }
        .toolbar-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .mobile-question-card.selected {
            border-color: var(--primary);
            background: var(--primary-light);
        }
        .mobile-question-card.selected::before {
            content: '✓';
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--primary);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(selectionToolbarStyle);
    
    console.log('Mobile app initialized successfully');
});