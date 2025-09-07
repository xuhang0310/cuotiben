/**
 * 错题列表页面脚本
 */

class QuestionsPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.currentSort = 'nextReview';
        this.currentView = 'grid';
        this.selectedQuestions = new Set();
        this.filters = {
            subjects: [],
            difficulties: [],
            tags: [],
            masteryLevels: []
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadQuestions();
    }
    
    bindEvents() {
        // 排序切换
        document.querySelectorAll('.ant-segmented-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelector('.ant-segmented-item-selected')?.classList.remove('ant-segmented-item-selected');
                item.classList.add('ant-segmented-item-selected');
                this.currentSort = item.dataset.sort;
                this.loadQuestions();
            });
        });
        
        // 视图切换
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.view-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.updateView();
            });
        });
        
        // 筛选按钮
        document.getElementById('openFilter')?.addEventListener('click', () => {
            window.appController?.showSidebar();
        });
        
        // 新增错题按钮
        document.getElementById('addQuestionBtn')?.addEventListener('click', () => {
            window.appController?.navigateTo('question-add');
        });
        
        // 使用说明切换
        document.getElementById('toggleInstructions')?.addEventListener('click', () => {
            const panel = document.getElementById('instructionsPanel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // 批量操作
        document.getElementById('batchDeleteBtn')?.addEventListener('click', () => {
            this.showBatchConfirm('delete');
        });
        
        document.getElementById('batchExportBtn')?.addEventListener('click', () => {
            this.exportSelectedQuestions();
        });
    }
    
    loadQuestions() {
        const container = document.getElementById('questionsGrid');
        if (!container) return;
        
        // 显示加载状态
        container.innerHTML = `
            <div class="loading-placeholder">
                <div class="loading-spinner"></div>
                <p>正在加载错题数据...</p>
            </div>
        `;
        
        // 模拟异步加载
        setTimeout(() => {
            const questions = this.getFilteredQuestions();
            this.renderQuestions(questions);
            this.renderPagination(questions.length);
        }, 500);
    }
    
    getFilteredQuestions() {
        // 获取所有错题数据
        let questions = window.dataManager?.getQuestions() || [];
        
        // 应用筛选条件
        if (this.filters.subjects.length > 0) {
            questions = questions.filter(q => this.filters.subjects.includes(q.subject));
        }
        
        if (this.filters.difficulties.length > 0) {
            questions = questions.filter(q => this.filters.difficulties.includes(q.difficulty));
        }
        
        // 排序
        questions.sort((a, b) => {
            switch (this.currentSort) {
                case 'nextReview':
                    return new Date(a.nextReviewDate) - new Date(b.nextReviewDate);
                case 'recentAdded':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'mastery':
                    return a.masteryLevel - b.masteryLevel;
                default:
                    return 0;
            }
        });
        
        return questions;
    }
    
    renderQuestions(questions) {
        const container = document.getElementById('questionsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        if (questions.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageQuestions = questions.slice(startIndex, endIndex);
        
        container.innerHTML = pageQuestions.map(question => this.renderQuestionCard(question)).join('');
        
        // 绑定卡片事件
        this.bindQuestionCardEvents();
    }
    
    renderQuestionCard(question) {
        const difficultyColors = {
            '简单': '#52c41a',
            '中等': '#faad14',
            '困难': '#f5222d'
        };
        
        const masteryColors = {
            0: '#f5222d',
            1: '#fa8c16',
            2: '#faad14',
            3: '#52c41a',
            4: '#1890ff'
        };
        
        return `
            <div class="question-card" data-id="${question.id}">
                <div class="question-card-header">
                    <div class="question-subject">${question.subject}</div>
                    <div class="question-actions">
                        <input type="checkbox" class="question-checkbox" data-id="${question.id}">
                        <button class="question-menu-btn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <div class="question-content" onclick="questionsPage.showQuestionDetail('${question.id}')">
                    <div class="question-title">${question.title}</div>
                    <div class="question-preview">${question.content.substring(0, 100)}...</div>
                </div>
                
                <div class="question-card-footer">
                    <div class="question-meta">
                        <span class="difficulty-tag" style="background-color: ${difficultyColors[question.difficulty]}">
                            ${question.difficulty}
                        </span>
                        <span class="mastery-level" style="color: ${masteryColors[question.masteryLevel]}">
                            掌握度: ${question.masteryLevel}/4
                        </span>
                    </div>
                    <div class="question-date">
                        下次复习: ${Utils.formatDate(question.nextReviewDate)}
                    </div>
                </div>
            </div>
        `;
    }
    
    bindQuestionCardEvents() {
        // 复选框事件
        document.querySelectorAll('.question-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const questionId = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedQuestions.add(questionId);
                } else {
                    this.selectedQuestions.delete(questionId);
                }
                this.updateBatchActions();
            });
        });
    }
    
    updateBatchActions() {
        const batchActions = document.getElementById('batchActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (batchActions && selectedCount) {
            if (this.selectedQuestions.size > 0) {
                batchActions.style.display = 'flex';
                selectedCount.textContent = this.selectedQuestions.size;
            } else {
                batchActions.style.display = 'none';
            }
        }
    }
    
    updateView() {
        const container = document.getElementById('questionsGrid');
        if (!container) return;
        
        if (this.currentView === 'list') {
            container.classList.add('list-view');
        } else {
            container.classList.remove('list-view');
        }
    }
    
    showQuestionDetail(questionId) {
        const question = window.dataManager?.getQuestionById(questionId);
        if (!question) return;
        
        const modal = document.getElementById('questionDetailModal');
        const content = document.getElementById('questionDetailContent');
        
        if (modal && content) {
            content.innerHTML = this.renderQuestionDetail(question);
            modal.style.display = 'block';
        }
    }
    
    renderQuestionDetail(question) {
        return `
            <div class="question-detail">
                <div class="detail-section">
                    <h4>题目内容</h4>
                    <div class="question-content">${question.content}</div>
                </div>
                
                <div class="detail-section">
                    <h4>正确答案</h4>
                    <div class="question-answer">${question.correctAnswer}</div>
                </div>
                
                <div class="detail-section">
                    <h4>我的答案</h4>
                    <div class="question-my-answer">${question.myAnswer}</div>
                </div>
                
                <div class="detail-section">
                    <h4>解析</h4>
                    <div class="question-explanation">${question.explanation}</div>
                </div>
                
                <div class="detail-meta">
                    <div class="meta-item">
                        <span class="meta-label">学科:</span>
                        <span class="meta-value">${question.subject}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">难度:</span>
                        <span class="meta-value">${question.difficulty}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">掌握度:</span>
                        <span class="meta-value">${question.masteryLevel}/4</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">下次复习:</span>
                        <span class="meta-value">${Utils.formatDate(question.nextReviewDate)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination(totalCount) {
        const container = document.getElementById('paginationContainer');
        if (!container) return;
        
        const totalPages = Math.ceil(totalCount / this.pageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="ant-pagination">';
        
        // 上一页
        paginationHTML += `
            <button class="ant-pagination-prev ${this.currentPage === 1 ? 'ant-pagination-disabled' : ''}" 
                    onclick="questionsPage.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<button class="ant-pagination-item ant-pagination-item-active">${i}</button>`;
            } else {
                paginationHTML += `<button class="ant-pagination-item" onclick="questionsPage.goToPage(${i})">${i}</button>`;
            }
        }
        
        // 下一页
        paginationHTML += `
            <button class="ant-pagination-next ${this.currentPage === totalPages ? 'ant-pagination-disabled' : ''}" 
                    onclick="questionsPage.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const totalQuestions = this.getFilteredQuestions().length;
        const totalPages = Math.ceil(totalQuestions / this.pageSize);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.loadQuestions();
    }
    
    showBatchConfirm(action) {
        const modal = document.getElementById('batchConfirmModal');
        const text = document.getElementById('batchConfirmText');
        
        if (modal && text) {
            text.textContent = `确定要删除选中的 ${this.selectedQuestions.size} 道错题吗？`;
            modal.style.display = 'block';
        }
    }
    
    exportSelectedQuestions() {
        const selectedIds = Array.from(this.selectedQuestions);
        const questions = selectedIds.map(id => window.dataManager?.getQuestionById(id)).filter(Boolean);
        
        // 简单的导出功能
        const exportData = {
            exportDate: new Date().toISOString(),
            questions: questions
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `错题导出_${Utils.formatDate(new Date())}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    applyFilters(filters) {
        this.filters = { ...filters };
        this.currentPage = 1;
        this.loadQuestions();
    }
}

// 全局实例
let questionsPage;

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        questionsPage = new QuestionsPage();
    });
} else {
    questionsPage = new QuestionsPage();
}

// 导出到全局
window.questionsPage = questionsPage;