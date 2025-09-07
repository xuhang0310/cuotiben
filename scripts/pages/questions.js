/**
 * 错题列表页面脚本
 * 处理错题列表的显示、筛选、搜索等功能
 */

(function() {
  'use strict';

  /**
   * 错题列表页面控制器
   */
  class QuestionsPageController {
    constructor() {
      this.currentFilters = {
        subject: '',
        difficulty: '',
        status: '',
        dateRange: ''
      };
      this.currentPage = 1;
      this.pageSize = 10;
      this.sortBy = 'createTime';
      this.sortOrder = 'desc';
      
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('📚 初始化错题列表页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载数据
      this.loadQuestions();
      
      // 初始化组件
      this.initComponents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 搜索事件
      const searchInput = document.querySelector('#search-input');
      if (searchInput) {
        searchInput.addEventListener('input', this.debounce((e) => {
          this.handleSearch(e.target.value);
        }, 300));
      }

      // 筛选事件
      const filterSelects = document.querySelectorAll('.filter-select');
      filterSelects.forEach(select => {
        select.addEventListener('change', (e) => {
          this.handleFilterChange(e.target.name, e.target.value);
        });
      });

      // 排序事件
      const sortButtons = document.querySelectorAll('.sort-btn');
      sortButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const sortBy = e.target.dataset.sort;
          this.handleSort(sortBy);
        });
      });

      // 分页事件
      const paginationContainer = document.querySelector('.pagination');
      if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
          if (e.target.classList.contains('page-btn')) {
            const page = parseInt(e.target.dataset.page);
            this.handlePageChange(page);
          }
        });
      }

      // 错题操作事件
      const questionsContainer = document.querySelector('.questions-list');
      if (questionsContainer) {
        questionsContainer.addEventListener('click', (e) => {
          const questionId = e.target.closest('.question-item')?.dataset.id;
          if (!questionId) return;

          if (e.target.classList.contains('btn-edit')) {
            this.handleEdit(questionId);
          } else if (e.target.classList.contains('btn-delete')) {
            this.handleDelete(questionId);
          } else if (e.target.classList.contains('btn-view')) {
            this.handleView(questionId);
          } else if (e.target.classList.contains('btn-practice')) {
            this.handlePractice(questionId);
          }
        });
      }

      // 添加错题按钮
      const addBtn = document.querySelector('#add-question-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          this.handleAdd();
        });
      }

      // 批量操作
      const batchActions = document.querySelector('.batch-actions');
      if (batchActions) {
        batchActions.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-batch-delete')) {
            this.handleBatchDelete();
          } else if (e.target.classList.contains('btn-batch-export')) {
            this.handleBatchExport();
          }
        });
      }
    }

    /**
     * 初始化组件
     */
    initComponents() {
      // 初始化日期选择器
      this.initDatePicker();
      
      // 初始化工具提示
      this.initTooltips();
      
      // 初始化拖拽排序
      this.initDragSort();
    }

    /**
     * 加载错题数据
     */
    async loadQuestions() {
      try {
        console.log('📊 加载错题数据...');
        
        // 显示加载状态
        this.showLoading();
        
        // 构建查询参数
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          ...this.currentFilters
        };
        
        // 获取数据
        const result = window.questionManager ? 
          window.questionManager.getQuestions(params) : 
          this.getMockData();
        
        // 渲染数据
        this.renderQuestions(result.data);
        this.renderPagination(result.pagination);
        this.renderStats(result.stats);
        
        console.log('✅ 错题数据加载完成');
        
      } catch (error) {
        console.error('❌ 加载错题数据失败:', error);
        this.showError('加载数据失败，请稍后重试');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 渲染错题列表
     */
    renderQuestions(questions) {
      const container = document.querySelector('.questions-list');
      if (!container) return;

      if (!questions || questions.length === 0) {
        container.innerHTML = this.renderEmptyState();
        return;
      }

      const html = questions.map(question => this.renderQuestionItem(question)).join('');
      container.innerHTML = html;
    }

    /**
     * 渲染单个错题项
     */
    renderQuestionItem(question) {
      const difficultyClass = {
        'easy': 'difficulty-easy',
        'medium': 'difficulty-medium',
        'hard': 'difficulty-hard'
      }[question.difficulty] || 'difficulty-medium';

      const statusClass = {
        'new': 'status-new',
        'reviewing': 'status-reviewing', 
        'mastered': 'status-mastered'
      }[question.status] || 'status-new';

      return `
        <div class="question-item" data-id="${question.id}">
          <div class="question-header">
            <div class="question-meta">
              <span class="subject-tag">${this.getSubjectName(question.subject)}</span>
              <span class="difficulty-tag ${difficultyClass}">${this.getDifficultyName(question.difficulty)}</span>
              <span class="status-tag ${statusClass}">${this.getStatusName(question.status)}</span>
            </div>
            <div class="question-actions">
              <button class="btn btn-sm btn-view" title="查看详情">
                <i class="icon-eye"></i>
              </button>
              <button class="btn btn-sm btn-edit" title="编辑">
                <i class="icon-edit"></i>
              </button>
              <button class="btn btn-sm btn-practice" title="练习">
                <i class="icon-play"></i>
              </button>
              <button class="btn btn-sm btn-delete" title="删除">
                <i class="icon-trash"></i>
              </button>
            </div>
          </div>
          <div class="question-content">
            <div class="question-title">${question.title || '无标题'}</div>
            <div class="question-preview">${this.truncateText(question.content, 100)}</div>
          </div>
          <div class="question-footer">
            <div class="question-stats">
              <span class="stat-item">
                <i class="icon-calendar"></i>
                ${this.formatDate(question.createTime)}
              </span>
              <span class="stat-item">
                <i class="icon-repeat"></i>
                练习 ${question.practiceCount || 0} 次
              </span>
              <span class="stat-item">
                <i class="icon-clock"></i>
                最后练习: ${question.lastPracticeTime ? this.formatDate(question.lastPracticeTime) : '未练习'}
              </span>
            </div>
          </div>
        </div>
      `;
    }

    /**
     * 渲染空状态
     */
    renderEmptyState() {
      return `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="icon-inbox"></i>
          </div>
          <div class="empty-title">暂无错题</div>
          <div class="empty-description">开始添加你的第一道错题吧</div>
          <button class="btn btn-primary" id="add-first-question">
            <i class="icon-plus"></i>
            添加错题
          </button>
        </div>
      `;
    }

    /**
     * 渲染分页
     */
    renderPagination(pagination) {
      const container = document.querySelector('.pagination');
      if (!container || !pagination) return;

      const { current, total, pageSize, totalCount } = pagination;
      const totalPages = Math.ceil(totalCount / pageSize);

      if (totalPages <= 1) {
        container.innerHTML = '';
        return;
      }

      let html = `
        <div class="pagination-info">
          共 ${totalCount} 条记录，第 ${current} / ${totalPages} 页
        </div>
        <div class="pagination-controls">
      `;

      // 上一页
      html += `
        <button class="page-btn" data-page="${current - 1}" ${current <= 1 ? 'disabled' : ''}>
          <i class="icon-chevron-left"></i>
        </button>
      `;

      // 页码
      const startPage = Math.max(1, current - 2);
      const endPage = Math.min(totalPages, current + 2);

      if (startPage > 1) {
        html += `<button class="page-btn" data-page="1">1</button>`;
        if (startPage > 2) {
          html += `<span class="page-ellipsis">...</span>`;
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        html += `
          <button class="page-btn ${i === current ? 'active' : ''}" data-page="${i}">
            ${i}
          </button>
        `;
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          html += `<span class="page-ellipsis">...</span>`;
        }
        html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
      }

      // 下一页
      html += `
        <button class="page-btn" data-page="${current + 1}" ${current >= totalPages ? 'disabled' : ''}>
          <i class="icon-chevron-right"></i>
        </button>
      `;

      html += `</div>`;
      container.innerHTML = html;
    }

    /**
     * 渲染统计信息
     */
    renderStats(stats) {
      const container = document.querySelector('.stats-overview');
      if (!container || !stats) return;

      container.innerHTML = `
        <div class="stat-card">
          <div class="stat-value">${stats.total || 0}</div>
          <div class="stat-label">总题数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.new || 0}</div>
          <div class="stat-label">新题目</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.reviewing || 0}</div>
          <div class="stat-label">复习中</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.mastered || 0}</div>
          <div class="stat-label">已掌握</div>
        </div>
      `;
    }

    /**
     * 处理搜索
     */
    handleSearch(query) {
      console.log('🔍 搜索:', query);
      this.currentFilters.search = query;
      this.currentPage = 1;
      this.loadQuestions();
    }

    /**
     * 处理筛选变化
     */
    handleFilterChange(name, value) {
      console.log('🔧 筛选变化:', name, value);
      this.currentFilters[name] = value;
      this.currentPage = 1;
      this.loadQuestions();
    }

    /**
     * 处理排序
     */
    handleSort(sortBy) {
      if (this.sortBy === sortBy) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = sortBy;
        this.sortOrder = 'desc';
      }
      
      this.loadQuestions();
    }

    /**
     * 处理分页变化
     */
    handlePageChange(page) {
      this.currentPage = page;
      this.loadQuestions();
    }

    /**
     * 处理添加错题
     */
    handleAdd() {
      console.log('➕ 添加错题');
      if (window.router) {
        window.router.navigate('/questions/add');
      } else {
        // 使用模态框添加
        this.showAddModal();
      }
    }

    /**
     * 处理编辑错题
     */
    handleEdit(questionId) {
      console.log('✏️ 编辑错题:', questionId);
      if (window.router) {
        window.router.navigate(`/questions/${questionId}/edit`);
      } else {
        this.showEditModal(questionId);
      }
    }

    /**
     * 处理查看错题
     */
    handleView(questionId) {
      console.log('👁️ 查看错题:', questionId);
      if (window.router) {
        window.router.navigate(`/questions/${questionId}`);
      } else {
        this.showViewModal(questionId);
      }
    }

    /**
     * 处理练习错题
     */
    handlePractice(questionId) {
      console.log('🎯 练习错题:', questionId);
      if (window.router) {
        window.router.navigate(`/practice/${questionId}`);
      } else {
        this.showPracticeModal(questionId);
      }
    }

    /**
     * 处理删除错题
     */
    async handleDelete(questionId) {
      console.log('🗑️ 删除错题:', questionId);
      
      const confirmed = await this.showConfirm({
        title: '确认删除',
        message: '确定要删除这道错题吗？此操作不可恢复。',
        type: 'warning'
      });
      
      if (confirmed) {
        try {
          if (window.questionManager) {
            window.questionManager.deleteQuestion(questionId);
          }
          
          this.showNotification('错题删除成功', 'success');
          this.loadQuestions();
        } catch (error) {
          console.error('删除错题失败:', error);
          this.showNotification('删除失败，请稍后重试', 'error');
        }
      }
    }

    /**
     * 工具方法
     */
    getSubjectName(subject) {
      const subjects = {
        'math': '数学',
        'chinese': '语文', 
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物',
        'history': '历史',
        'geography': '地理',
        'politics': '政治'
      };
      return subjects[subject] || subject;
    }

    getDifficultyName(difficulty) {
      const difficulties = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return difficulties[difficulty] || difficulty;
    }

    getStatusName(status) {
      const statuses = {
        'new': '新题目',
        'reviewing': '复习中',
        'mastered': '已掌握'
      };
      return statuses[status] || status;
    }

    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('zh-CN');
    }

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

    // UI 方法
    showLoading() {
      if (window.UI && window.UI.loading) {
        window.UI.loading.show('加载中...');
      }
    }

    hideLoading() {
      if (window.UI && window.UI.loading) {
        window.UI.loading.hide();
      }
    }

    showError(message) {
      if (window.UI && window.UI.notification) {
        window.UI.notification.error(message);
      } else {
        alert(message);
      }
    }

    showNotification(message, type = 'info') {
      if (window.UI && window.UI.notification) {
        window.UI.notification[type](message);
      } else {
        alert(message);
      }
    }

    async showConfirm(options) {
      if (window.UI && window.UI.ConfirmDialog) {
        return await window.UI.ConfirmDialog.show(options);
      } else {
        return confirm(options.message);
      }
    }

    // 模拟数据
    getMockData() {
      return {
        data: [
          {
            id: '1',
            title: '二次函数的图像与性质',
            content: '已知二次函数 f(x) = ax² + bx + c，求其对称轴和顶点坐标...',
            subject: 'math',
            difficulty: 'medium',
            status: 'new',
            createTime: Date.now() - 86400000,
            practiceCount: 0
          },
          {
            id: '2', 
            title: '英语语法-虚拟语气',
            content: 'If I were you, I would study harder. 这句话使用了什么语法结构？',
            subject: 'english',
            difficulty: 'hard',
            status: 'reviewing',
            createTime: Date.now() - 172800000,
            practiceCount: 3,
            lastPracticeTime: Date.now() - 3600000
          }
        ],
        pagination: {
          current: 1,
          pageSize: 10,
          totalCount: 2
        },
        stats: {
          total: 2,
          new: 1,
          reviewing: 1,
          mastered: 0
        }
      };
    }

    // 组件初始化方法
    initDatePicker() {
      // 初始化日期选择器
    }

    initTooltips() {
      // 初始化工具提示
    }

    initDragSort() {
      // 初始化拖拽排序
    }

    // 模态框方法
    showAddModal() {
      // 显示添加错题模态框
    }

    showEditModal(questionId) {
      // 显示编辑错题模态框
    }

    showViewModal(questionId) {
      // 显示查看错题模态框
    }

    showPracticeModal(questionId) {
      // 显示练习错题模态框
    }

    handleBatchDelete() {
      // 批量删除
    }

    handleBatchExport() {
      // 批量导出
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new QuestionsPageController();
    });
  } else {
    new QuestionsPageController();
  }

  // 导出到全局
  window.QuestionsPageController = QuestionsPageController;

})();