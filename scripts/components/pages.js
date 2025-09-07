/**
 * 页面组件
 * 包含各个页面的具体实现
 */

// 错题列表页面组件
class QuestionsPage {
  constructor() {
    this.currentFilters = {
      subject: 'all',
      difficulty: 'all',
      status: 'all',
      search: ''
    };
    this.currentPage = 1;
    this.pageSize = 12;
    this.sortBy = 'addTime';
    this.sortOrder = 'desc';
  }

  render() {
    return `
      <div class="questions-page">
        <div class="page-header">
          <h1 class="page-title">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            错题本
          </h1>
          <p class="page-subtitle">管理和复习你的错题，提升学习效率</p>
        </div>

        <div class="questions-toolbar">
          <div class="toolbar-left">
            <div class="questions-stats">
              <span class="stat-item">
                <span class="stat-label">总计:</span>
                <span class="stat-value" id="total-count">0</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">待复习:</span>
                <span class="stat-value" id="pending-count">0</span>
              </span>
              <span class="stat-item">
                <span class="stat-label">已掌握:</span>
                <span class="stat-value" id="mastered-count">0</span>
              </span>
            </div>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-primary" id="add-question-btn">
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              添加错题
            </button>
            <button class="btn btn-secondary" id="batch-review-btn">
              <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              批量复习
            </button>
          </div>
        </div>

        <div class="questions-filters">
          <div class="filters">
            <div class="filter-item">
              <label class="filter-label">学科:</label>
              <select class="filter-select" id="subject-filter">
                <option value="all">全部学科</option>
                <option value="math">数学</option>
                <option value="physics">物理</option>
                <option value="chemistry">化学</option>
                <option value="biology">生物</option>
                <option value="chinese">语文</option>
                <option value="english">英语</option>
                <option value="history">历史</option>
                <option value="geography">地理</option>
                <option value="politics">政治</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">难度:</label>
              <select class="filter-select" id="difficulty-filter">
                <option value="all">全部难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">状态:</label>
              <select class="filter-select" id="status-filter">
                <option value="all">全部状态</option>
                <option value="new">新题目</option>
                <option value="reviewing">复习中</option>
                <option value="mastered">已掌握</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="filter-label">排序:</label>
              <select class="filter-select" id="sort-filter">
                <option value="addTime-desc">添加时间(新到旧)</option>
                <option value="addTime-asc">添加时间(旧到新)</option>
                <option value="difficulty-desc">难度(高到低)</option>
                <option value="difficulty-asc">难度(低到高)</option>
                <option value="reviewCount-desc">复习次数(多到少)</option>
                <option value="reviewCount-asc">复习次数(少到多)</option>
              </select>
            </div>
          </div>
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input type="text" class="search-input" id="search-input" placeholder="搜索题目内容...">
          </div>
        </div>

        <div class="questions-content">
          <div class="questions-grid" id="questions-grid">
            <!-- 错题列表将在这里动态生成 -->
          </div>
          
          <div class="questions-pagination" id="questions-pagination">
            <!-- 分页将在这里动态生成 -->
          </div>
        </div>

        <div class="questions-empty" id="questions-empty" style="display: none;">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <h3 class="empty-title">暂无错题</h3>
          <p class="empty-desc">开始添加你的第一道错题吧！</p>
          <div class="empty-action">
            <button class="btn btn-primary" id="add-first-question-btn">
              添加错题
            </button>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    this.bindEvents();
    this.loadQuestions();
    this.updateStats();
  }

  bindEvents() {
    // 筛选器事件
    document.getElementById('subject-filter').addEventListener('change', (e) => {
      this.currentFilters.subject = e.target.value;
      this.currentPage = 1;
      this.loadQuestions();
    });

    document.getElementById('difficulty-filter').addEventListener('change', (e) => {
      this.currentFilters.difficulty = e.target.value;
      this.currentPage = 1;
      this.loadQuestions();
    });

    document.getElementById('status-filter').addEventListener('change', (e) => {
      this.currentFilters.status = e.target.value;
      this.currentPage = 1;
      this.loadQuestions();
    });

    document.getElementById('sort-filter').addEventListener('change', (e) => {
      const [sortBy, sortOrder] = e.target.value.split('-');
      this.sortBy = sortBy;
      this.sortOrder = sortOrder;
      this.currentPage = 1;
      this.loadQuestions();
    });

    // 搜索事件
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.currentFilters.search = e.target.value;
        this.currentPage = 1;
        this.loadQuestions();
      }, 300);
    });

    // 按钮事件
    document.getElementById('add-question-btn').addEventListener('click', () => {
      this.showAddQuestionModal();
    });

    document.getElementById('batch-review-btn').addEventListener('click', () => {
      this.startBatchReview();
    });

    document.getElementById('add-first-question-btn')?.addEventListener('click', () => {
      this.showAddQuestionModal();
    });
  }

  loadQuestions() {
    const questions = window.questionManager.getQuestions({
      ...this.currentFilters,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    });

    this.renderQuestions(questions.data);
    this.renderPagination(questions.total);
  }

  renderQuestions(questions) {
    const grid = document.getElementById('questions-grid');
    const empty = document.getElementById('questions-empty');

    if (questions.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = questions.map(question => this.renderQuestionCard(question)).join('');

    // 绑定卡片事件
    questions.forEach(question => {
      this.bindQuestionCardEvents(question.id);
    });
  }

  renderQuestionCard(question) {
    const difficultyColors = {
      easy: 'var(--color-success)',
      medium: 'var(--color-warning)',
      hard: 'var(--color-error)'
    };

    const statusColors = {
      new: 'var(--color-primary)',
      reviewing: 'var(--color-warning)',
      mastered: 'var(--color-success)'
    };

    return `
      <div class="question-card" data-id="${question.id}">
        <div class="question-header">
          <div class="question-meta">
            <span class="question-subject" style="background: ${this.getSubjectColor(question.subject)};">
              ${this.getSubjectName(question.subject)}
            </span>
            <span class="question-difficulty" style="color: ${difficultyColors[question.difficulty]};">
              ${this.getDifficultyName(question.difficulty)}
            </span>
          </div>
          <div class="question-actions">
            <button class="question-action-btn" data-action="edit" title="编辑">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="question-action-btn" data-action="delete" title="删除">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="question-content">
          <div class="question-text">${this.truncateText(question.content, 100)}</div>
          ${question.image ? `<div class="question-image"><img src="${question.image}" alt="题目图片"></div>` : ''}
        </div>
        
        <div class="question-footer">
          <div class="question-status">
            <span class="status-badge" style="background: ${statusColors[question.status]}20; color: ${statusColors[question.status]};">
              ${this.getStatusName(question.status)}
            </span>
            <span class="review-count">复习 ${question.reviewCount || 0} 次</span>
          </div>
          <div class="question-time">
            ${window.helpers.formatDate(question.addTime)}
          </div>
        </div>
        
        <div class="question-card-actions">
          <button class="btn btn-sm btn-primary" data-action="review">
            开始复习
          </button>
          <button class="btn btn-sm btn-secondary" data-action="view">
            查看详情
          </button>
        </div>
      </div>
    `;
  }

  bindQuestionCardEvents(questionId) {
    const card = document.querySelector(`[data-id="${questionId}"]`);
    
    // 操作按钮事件
    card.querySelectorAll('.question-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'edit') {
          this.editQuestion(questionId);
        } else if (action === 'delete') {
          this.deleteQuestion(questionId);
        }
      });
    });

    // 卡片操作按钮事件
    card.querySelectorAll('.question-card-actions .btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'review') {
          this.reviewQuestion(questionId);
        } else if (action === 'view') {
          this.viewQuestion(questionId);
        }
      });
    });

    // 卡片点击事件
    card.addEventListener('click', () => {
      this.viewQuestion(questionId);
    });
  }

  renderPagination(total) {
    const container = document.getElementById('questions-pagination');
    
    if (this.pagination) {
      this.pagination.update({
        total: total,
        current: this.currentPage,
        pageSize: this.pageSize
      });
    } else {
      this.pagination = new window.UI.Pagination(container, {
        total: total,
        current: this.currentPage,
        pageSize: this.pageSize,
        showSizeChanger: true,
        showQuickJumper: true,
        onChange: (page, pageSize) => {
          this.currentPage = page;
          this.pageSize = pageSize;
          this.loadQuestions();
        },
        onShowSizeChange: (current, size) => {
          this.currentPage = 1;
          this.pageSize = size;
          this.loadQuestions();
        }
      });
    }
  }

  updateStats() {
    const stats = window.questionManager.getStats();
    document.getElementById('total-count').textContent = stats.total;
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('mastered-count').textContent = stats.mastered;
  }

  // 工具方法
  getSubjectColor(subject) {
    const colors = {
      math: 'var(--color-math)',
      physics: 'var(--color-physics)',
      chemistry: 'var(--color-chemistry)',
      biology: 'var(--color-biology)',
      chinese: 'var(--color-chinese)',
      english: 'var(--color-english)',
      history: 'var(--color-history)',
      geography: 'var(--color-geography)',
      politics: 'var(--color-politics)'
    };
    return colors[subject] || 'var(--color-primary)';
  }

  getSubjectName(subject) {
    const names = {
      math: '数学',
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      chinese: '语文',
      english: '英语',
      history: '历史',
      geography: '地理',
      politics: '政治'
    };
    return names[subject] || subject;
  }

  getDifficultyName(difficulty) {
    const names = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    };
    return names[difficulty] || difficulty;
  }

  getStatusName(status) {
    const names = {
      new: '新题目',
      reviewing: '复习中',
      mastered: '已掌握'
    };
    return names[status] || status;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // 操作方法
  showAddQuestionModal() {
    // 实现添加错题模态框
    console.log('显示添加错题模态框');
  }

  editQuestion(questionId) {
    // 实现编辑错题
    console.log('编辑错题:', questionId);
  }

  deleteQuestion(questionId) {
    // 实现删除错题
    window.UI.ConfirmDialog.show({
      title: '确认删除',
      message: '确定要删除这道错题吗？删除后无法恢复。',
      type: 'error'
    }).then(confirmed => {
      if (confirmed) {
        window.questionManager.deleteQuestion(questionId);
        this.loadQuestions();
        this.updateStats();
        window.UI.notification.success('错题删除成功');
      }
    });
  }

  reviewQuestion(questionId) {
    // 实现复习错题
    console.log('复习错题:', questionId);
  }

  viewQuestion(questionId) {
    // 实现查看错题详情
    console.log('查看错题详情:', questionId);
  }

  startBatchReview() {
    // 实现批量复习
    console.log('开始批量复习');
  }
}

// 数据看板页面组件
class DashboardPage {
  constructor() {
    this.charts = {};
  }

  render() {
    return `
      <div class="dashboard-page">
        <div class="page-header">
          <h1 class="page-title">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            数据看板
          </h1>
          <p class="page-subtitle">全面了解你的学习进度和成果</p>
        </div>

        <div class="dashboard-overview">
          <div class="overview-cards">
            <div class="overview-card">
              <div class="card-icon" style="background: var(--color-primary-light); color: var(--color-primary);">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div class="card-content">
                <div class="card-value" id="total-questions">0</div>
                <div class="card-label">总错题数</div>
                <div class="card-trend positive">
                  <span class="trend-icon">↗</span>
                  <span class="trend-text">较上周 +12</span>
                </div>
              </div>
            </div>

            <div class="overview-card">
              <div class="card-icon" style="background: var(--color-success-light); color: var(--color-success);">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="card-content">
                <div class="card-value" id="mastered-questions">0</div>
                <div class="card-label">已掌握</div>
                <div class="card-trend positive">
                  <span class="trend-icon">↗</span>
                  <span class="trend-text">较上周 +8</span>
                </div>
              </div>
            </div>

            <div class="overview-card">
              <div class="card-icon" style="background: var(--color-warning-light); color: var(--color-warning);">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="card-content">
                <div class="card-value" id="review-streak">0</div>
                <div class="card-label">连续复习天数</div>
                <div class="card-trend positive">
                  <span class="trend-icon">↗</span>
                  <span class="trend-text">保持良好</span>
                </div>
              </div>
            </div>

            <div class="overview-card">
              <div class="card-icon" style="background: var(--color-error-light); color: var(--color-error);">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div class="card-content">
                <div class="card-value" id="pending-reviews">0</div>
                <div class="card-label">待复习</div>
                <div class="card-trend negative">
                  <span class="trend-icon">↘</span>
                  <span class="trend-text">需要关注</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-charts">
          <div class="chart-row">
            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">学习进度</h3>
                <div class="chart-actions">
                  <select class="chart-period" id="progress-period">
                    <option value="week">最近一周</option>
                    <option value="month">最近一月</option>
                    <option value="quarter">最近三月</option>
                  </select>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="progress-chart" width="400" height="200"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">学科分布</h3>
              </div>
              <div class="chart-content">
                <canvas id="subject-chart" width="300" height="200"></canvas>
              </div>
            </div>
          </div>

          <div class="chart-row">
            <div class="chart-card full-width">
              <div class="chart-header">
                <h3 class="chart-title">复习热力图</h3>
                <div class="chart-legend">
                  <span class="legend-item">
                    <span class="legend-color" style="background: var(--color-bg-container);"></span>
                    <span class="legend-text">无复习</span>
                  </span>
                  <span class="legend-item">
                    <span class="legend-color" style="background: var(--color-primary-light);"></span>
                    <span class="legend-text">少量复习</span>
                  </span>
                  <span class="legend-item">
                    <span class="legend-color" style="background: var(--color-primary);"></span>
                    <span class="legend-text">大量复习</span>
                  </span>
                </div>
              </div>
              <div class="chart-content">
                <div class="heatmap-container" id="heatmap-container">
                  <!-- 热力图将在这里生成 -->
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-insights">
          <div class="insights-card">
            <div class="insights-header">
              <h3 class="insights-title">学习洞察</h3>
            </div>
            <div class="insights-content">
              <div class="insight-item">
                <div class="insight-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div class="insight-content">
                  <div class="insight-title">最佳复习时间</div>
                  <div class="insight-desc">你在下午2-4点的复习效果最好</div>
                </div>
              </div>
              
              <div class="insight-item">
                <div class="insight-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <div class="insight-content">
                  <div class="insight-title">薄弱学科</div>
                  <div class="insight-desc">物理错题较多，建议加强练习</div>
                </div>
              </div>
              
              <div class="insight-item">
                <div class="insight-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="insight-content">
                  <div class="insight-title">复习建议</div>
                  <div class="insight-desc">建议今天复习5道数学题</div>
                </div>
              </div>
            </div>
          </div>

          <div class="recent-activity">
            <div class="activity-header">
              <h3 class="activity-title">最近活动</h3>
            </div>
            <div class="activity-content" id="recent-activity">
              <!-- 最近活动将在这里生成 -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    this.loadData();
    this.initCharts();
    this.bindEvents();
  }

  loadData() {
    const stats = window.questionManager.getStats();
    document.getElementById('total-questions').textContent = stats.total;
    document.getElementById('mastered-questions').textContent = stats.mastered;
    document.getElementById('review-streak').textContent = stats.streak || 0;
    document.getElementById('pending-reviews').textContent = stats.pending;
  }

  initCharts() {
    // 这里可以集成图表库如Chart.js
    console.log('初始化图表');
  }

  bindEvents() {
    document.getElementById('progress-period').addEventListener('change', (e) => {
      this.updateProgressChart(e.target.value);
    });
  }

  updateProgressChart(period) {
    console.log('更新进度图表:', period);
  }
}

// AI讲解页面组件
class AIExplanationPage {
  constructor() {
    this.messages = [];
    this.isRecording = false;
  }

  render() {
    return `
      <div class="ai-explanation-page">
        <div class="page-header">
          <h1 class="page-title">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            AI智能讲解
          </h1>
          <p class="page-subtitle">上传题目图片，获得详细的解题思路和知识点讲解</p>
        </div>

        <div class="ai-chat-container">
          <div class="chat-messages" id="chat-messages">
            <div class="welcome-message">
              <div class="ai-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="message-content">
                <p>你好！我是AI助手，可以帮你解答各种题目。</p>
                <p>你可以：</p>
                <ul>
                  <li>上传题目图片，我来为你详细讲解</li>
                  <li>直接输入题目内容</li>
                  <li>询问相关知识点</li>
                </ul>
                <p>让我们开始学习吧！</p>
              </div>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-toolbar">
              <button class="toolbar-btn" id="upload-btn" title="上传图片">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                </svg>
              </button>
              <button class="toolbar-btn" id="voice-btn" title="语音输入">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              </button>
              <button class="toolbar-btn" id="clear-btn" title="清空对话">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
            
            <div class="input-container">
              <textarea 
                class="chat-input" 
                id="chat-input" 
                placeholder="输入你的问题或上传题目图片..."
                rows="1"
              ></textarea>
              <button class="send-btn" id="send-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 上传文件模态框 -->
        <div class="upload-modal" id="upload-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3>上传题目图片</h3>
              <button class="modal-close" id="upload-modal-close">×</button>
            </div>
            <div class="modal-body">
              <div class="upload-area" id="upload-area">
                <div class="upload-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                </div>
                <div class="upload-text">
                  <p>点击或拖拽图片到这里</p>
                  <p class="upload-hint">支持 JPG、PNG、GIF 格式，大小不超过 10MB</p>
                </div>
                <input type="file" id="file-input" accept="image/*" style="display: none;">
              </div>
              <div class="upload-preview" id="upload-preview" style="display: none;">
                <img id="preview-image" alt="预览图片">
                <div class="preview-actions">
                  <button class="btn btn-secondary" id="reselect-btn">重新选择</button>
                  <button class="btn btn-primary" id="confirm-upload-btn">确认上传</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    this.bindEvents();
    this.initAutoResize();
  }

  bindEvents() {
    // 发送按钮
    document.getElementById('send-btn').addEventListener('click', () => {
      this.sendMessage();
    });

    // 输入框回车发送
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 工具栏按钮
    document.getElementById('upload-btn').addEventListener('click', () => {
      this.showUploadModal();
    });

    document.getElementById('voice-btn').addEventListener('click', () => {
      this.toggleVoiceInput();
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
      this.clearChat();
    });

    // 上传模态框事件
    this.bindUploadEvents();
  }

  bindUploadEvents() {
    const modal = document.getElementById('upload-modal');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');

    // 关闭模态框
    document.getElementById('upload-modal-close').addEventListener('click', () => {
      this.hideUploadModal();
    });

    // 点击上传区域
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    // 重新选择
    document.getElementById('reselect-btn').addEventListener('click', () => {
      preview.style.display = 'none';
      uploadArea.style.display = 'block';
      fileInput.value = '';
    });

    // 确认上传
    document.getElementById('confirm-upload-btn').addEventListener('click', () => {
      this.uploadImage();
    });
  }

  initAutoResize() {
    const textarea = document.getElementById('chat-input');
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    this.addMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    // 模拟AI回复
    setTimeout(() => {
      this.addMessage('ai', '我正在分析你的问题，请稍等...');
      
      setTimeout(() => {
        this.addMessage('ai', this.generateAIResponse(message));
      }, 1500);
    }, 500);
  }

  addMessage(type, content, image = null) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    if (type === 'user') {
      messageDiv.innerHTML = `
        <div class="message-content">
          ${image ? `<div class="message-image"><img src="${image}" alt="上传的图片"></div>` : ''}
          <div class="message-text">${content}</div>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="ai-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="message-content">
          <div class="message-text">${content}</div>
          <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  generateAIResponse(message) {
    // 简单的AI回复生成逻辑
    const responses = [
      '这是一个很好的问题！让我来为你详细解答...',
      '根据你的问题，我建议从以下几个方面来理解...',
      '这道题目涉及到的知识点包括...',
      '解题思路如下：首先...然后...最后...'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  showUploadModal() {
    document.getElementById('upload-modal').style.display = 'flex';
  }

  hideUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('file-input').value = '';
  }

  handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      window.UI.notification.error('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.UI.notification.error('图片大小不能超过10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('preview-image').src = e.target.result;
      document.getElementById('upload-area').style.display = 'none';
      document.getElementById('upload-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  uploadImage() {
    const previewImage = document.getElementById('preview-image');
    this.addMessage('user', '我上传了一张图片，请帮我分析一下。', previewImage.src);
    this.hideUploadModal();

    // 模拟AI分析图片
    setTimeout(() => {
      this.addMessage('ai', '我正在分析你上传的图片，请稍等...');
      
      setTimeout(() => {
        this.addMessage('ai', '根据图片分析，这是一道数学题。让我为你详细讲解解题步骤...');
      }, 2000);
    }, 500);
  }

  toggleVoiceInput() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    // 实现语音输入
    this.isRecording = true;
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.classList.add('recording');
    window.UI.notification.info('开始录音...');
  }

  stopRecording() {
    // 停止语音输入
    this.isRecording = false;
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.classList.remove('recording');
    window.UI.notification.info('录音结束');
  }

  clearChat() {
    window.UI.ConfirmDialog.show({
      title: '清空对话',
      message: '确定要清空所有对话记录吗？',
      type: 'warning'
    }).then(confirmed => {
      if (confirmed) {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = `
          <div class="welcome-message">
            <div class="ai-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div class="message-content">
              <p>对话已清空，让我们重新开始吧！</p>
            </div>
          </div>
        `;
        this.messages = [];
      }
    });
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.Pages = {
    QuestionsPage,
    DashboardPage,
    AIExplanationPage
  };
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QuestionsPage,
    DashboardPage,
    AIExplanationPage
  };
}