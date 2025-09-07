/**
 * UI渲染器 - 负责应用的UI渲染和更新
 */
class UIRenderer {
    constructor() {
        this.templates = new Map();
        this.components = new Map();
    }

    /**
     * 渲染错题列表
     * @param {Array} questions - 错题数据
     * @param {HTMLElement} container - 容器元素
     */
    renderQuestionList(questions, container) {
        if (!container) return;

        if (questions.length === 0) {
            container.innerHTML = this.getEmptyStateHTML('暂无错题数据');
            return;
        }

        const html = questions.map(question => this.renderQuestionCard(question)).join('');
        container.innerHTML = html;
    }

    /**
     * 渲染单个错题卡片
     * @param {Object} question - 错题数据
     * @returns {string} HTML字符串
     */
    renderQuestionCard(question) {
        const difficultyClass = this.getDifficultyClass(question.difficulty);
        const subjectClass = this.getSubjectClass(question.subject);
        const tagsHTML = question.tags ? question.tags.map(tag => 
            `<span class="question-tag">${this.escapeHtml(tag)}</span>`
        ).join('') : '';

        return `
            <div class="question-card" data-id="${question.id}">
                <div class="question-header">
                    <div class="question-meta">
                        <span class="subject-badge ${subjectClass}">${this.escapeHtml(question.subject)}</span>
                        <span class="difficulty-badge ${difficultyClass}">${this.escapeHtml(question.difficulty)}</span>
                        <span class="question-date">${this.formatDate(question.createdAt)}</span>
                    </div>
                    <div class="question-actions">
                        <button class="action-btn edit-btn" data-action="edit" data-id="${question.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-action="delete" data-id="${question.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="question-content">
                    <h3 class="question-title">${this.escapeHtml(question.title)}</h3>
                    <div class="question-description">${this.escapeHtml(question.content)}</div>
                    ${tagsHTML ? `<div class="question-tags">${tagsHTML}</div>` : ''}
                </div>
                <div class="question-footer">
                    <div class="question-stats">
                        <span class="stat-item">
                            <i class="fas fa-eye"></i>
                            查看次数: ${question.viewCount || 0}
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-clock"></i>
                            最后练习: ${question.lastPracticed ? this.formatDate(question.lastPracticed) : '未练习'}
                        </span>
                    </div>
                    <button class="primary-btn view-detail-btn" data-action="view" data-id="${question.id}">
                        查看详情
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 渲染分页组件
     * @param {Object} pagination - 分页信息
     * @param {HTMLElement} container - 容器元素
     */
    renderPagination(pagination, container) {
        if (!container || pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const { currentPage, totalPages, pageSize, total } = pagination;
        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, total);

        let html = `
            <div class="pagination-info">
                显示 ${startItem}-${endItem} 条，共 ${total} 条
            </div>
            <div class="pagination-controls">
        `;

        // 上一页按钮
        html += `
            <button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // 页码按钮
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // 下一页按钮
        html += `
            <button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * 渲染统计卡片
     * @param {Object} stats - 统计数据
     * @param {HTMLElement} container - 容器元素
     */
    renderStatistics(stats, container) {
        if (!container) return;

        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.totalQuestions || 0}</div>
                        <div class="stat-label">总错题数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.correctRate || 0}%</div>
                        <div class="stat-label">正确率</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.formatTime(stats.studyTime || 0)}</div>
                        <div class="stat-label">学习时长</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${stats.todayQuestions || 0}</div>
                        <div class="stat-label">今日新增</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * 渲染加载状态
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 加载消息
     */
    renderLoading(container, message = '加载中...') {
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-message">${this.escapeHtml(message)}</div>
            </div>
        `;
    }

    /**
     * 渲染错误状态
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 错误消息
     */
    renderError(container, message = '加载失败') {
        if (!container) return;

        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-message">${this.escapeHtml(message)}</div>
                <button class="retry-btn" onclick="location.reload()">
                    重试
                </button>
            </div>
        `;
    }

    /**
     * 获取空状态HTML
     * @param {string} message - 空状态消息
     * @returns {string} HTML字符串
     */
    getEmptyStateHTML(message = '暂无数据') {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-message">${this.escapeHtml(message)}</div>
            </div>
        `;
    }

    /**
     * 获取难度样式类
     * @param {string} difficulty - 难度
     * @returns {string} CSS类名
     */
    getDifficultyClass(difficulty) {
        const classMap = {
            '简单': 'difficulty-easy',
            '中等': 'difficulty-medium',
            '困难': 'difficulty-hard'
        };
        return classMap[difficulty] || 'difficulty-medium';
    }

    /**
     * 获取学科样式类
     * @param {string} subject - 学科
     * @returns {string} CSS类名
     */
    getSubjectClass(subject) {
        const classMap = {
            '数学': 'subject-math',
            '语文': 'subject-chinese',
            '英语': 'subject-english',
            '物理': 'subject-physics',
            '化学': 'subject-chemistry'
        };
        return classMap[subject] || 'subject-default';
    }

    /**
     * 格式化日期
     * @param {string|Date} date - 日期
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        // 小于1分钟
        if (diff < 60000) {
            return '刚刚';
        }
        
        // 小于1小时
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        }
        
        // 小于1天
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        }
        
        // 小于7天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }
        
        // 超过7天显示具体日期
        return d.toLocaleDateString('zh-CN');
    }

    /**
     * 格式化时间长度
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}秒`;
        }
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes}分钟`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}小时${remainingMinutes}分钟`;
    }

    /**
     * HTML转义
     * @param {string} text - 需要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (success, error, warning, info)
     * @param {number} duration - 显示时长(毫秒)
     */
    showMessage(message, type = 'info', duration = 3000) {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
            <button class="message-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 添加关闭事件
        const closeBtn = messageEl.querySelector('.message-close');
        closeBtn.addEventListener('click', () => {
            this.removeMessage(messageEl);
        });

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.removeMessage(messageEl);
            }, duration);
        }
    }

    /**
     * 移除消息
     * @param {HTMLElement} messageEl - 消息元素
     */
    removeMessage(messageEl) {
        if (messageEl && messageEl.parentNode) {
            messageEl.classList.add('message-fade-out');
            setTimeout(() => {
                messageEl.parentNode.removeChild(messageEl);
            }, 300);
        }
    }

    /**
     * 获取消息图标
     * @param {string} type - 消息类型
     * @returns {string} 图标类名
     */
    getMessageIcon(type) {
        const iconMap = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return iconMap[type] || 'info-circle';
    }
}

// 创建全局UI渲染器实例
window.uiRenderer = new UIRenderer();