/**
 * 艾宾浩斯复习日历脚本
 */

class EbbinghausCalendar {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.reviewData = new Map(); // 存储复习数据
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadReviewData();
        this.renderCalendar();
        this.updateStats();
    }
    
    bindEvents() {
        // 月份导航
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        // 今天按钮
        document.getElementById('todayBtn')?.addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
            this.showTodayPanel();
        });
        
        // 视图切换
        document.querySelectorAll('.ant-segmented-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelector('.ant-segmented-item-selected')?.classList.remove('ant-segmented-item-selected');
                item.classList.add('ant-segmented-item-selected');
                this.currentView = item.dataset.view;
                this.renderCalendar();
            });
        });
        
        // 关闭今日面板
        document.getElementById('closeTodayPanel')?.addEventListener('click', () => {
            document.getElementById('todayPanel')?.classList.remove('active');
        });
    }
    
    loadReviewData() {
        // 从数据管理器获取复习数据
        const questions = window.dataManager?.getAllQuestions() || [];
        
        questions.forEach(question => {
            const reviewDate = new Date(question.nextReviewDate);
            const dateKey = this.getDateKey(reviewDate);
            
            if (!this.reviewData.has(dateKey)) {
                this.reviewData.set(dateKey, []);
            }
            
            this.reviewData.get(dateKey).push({
                id: question.id,
                title: question.title,
                subject: question.subject,
                difficulty: question.difficulty,
                masteryLevel: question.masteryLevel,
                reviewDate: reviewDate,
                completed: question.lastReviewDate && 
                          new Date(question.lastReviewDate).toDateString() === reviewDate.toDateString()
            });
        });
    }
    
    renderCalendar() {
        const container = document.getElementById('calendarGrid');
        if (!container) return;
        
        // 更新月份标题
        const monthTitle = document.getElementById('currentMonth');
        if (monthTitle) {
            monthTitle.textContent = `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`;
        }
        
        if (this.currentView === 'month') {
            this.renderMonthView(container);
        } else {
            this.renderWeekView(container);
        }
    }
    
    renderMonthView(container) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 获取月份第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取第一天是星期几（0=周日，1=周一...）
        const startDayOfWeek = firstDay.getDay();
        
        let html = '<div class="calendar-month">';
        
        // 星期标题
        html += '<div class="calendar-weekdays">';
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        weekdays.forEach(day => {
            html += `<div class="weekday">${day}</div>`;
        });
        html += '</div>';
        
        // 日期网格
        html += '<div class="calendar-days">';
        
        // 填充上个月的日期
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonth.getDate() - i);
            html += this.renderDayCell(date, true);
        }
        
        // 当前月的日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            html += this.renderDayCell(date, false);
        }
        
        // 填充下个月的日期
        const totalCells = container.querySelectorAll('.day-cell').length;
        const remainingCells = 42 - (startDayOfWeek + lastDay.getDate());
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            html += this.renderDayCell(date, true);
        }
        
        html += '</div></div>';
        container.innerHTML = html;
        
        // 绑定日期点击事件
        this.bindDayEvents();
    }
    
    renderDayCell(date, isOtherMonth) {
        const dateKey = this.getDateKey(date);
        const reviews = this.reviewData.get(dateKey) || [];
        const isToday = date.toDateString() === new Date().toDateString();
        
        let classes = ['day-cell'];
        if (isOtherMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (reviews.length > 0) classes.push('has-reviews');
        
        const completedCount = reviews.filter(r => r.completed).length;
        const totalCount = reviews.length;
        
        let reviewIndicator = '';
        if (totalCount > 0) {
            const completionRate = (completedCount / totalCount) * 100;
            let indicatorClass = 'review-indicator';
            
            if (completionRate === 100) {
                indicatorClass += ' completed';
            } else if (completionRate > 0) {
                indicatorClass += ' partial';
            } else {
                indicatorClass += ' pending';
            }
            
            reviewIndicator = `
                <div class="${indicatorClass}">
                    <span class="review-count">${totalCount}</span>
                </div>
            `;
        }
        
        return `
            <div class="${classes.join(' ')}" data-date="${dateKey}">
                <div class="day-number">${date.getDate()}</div>
                ${reviewIndicator}
            </div>
        `;
    }
    
    renderWeekView(container) {
        // 简化的周视图实现
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        
        let html = '<div class="calendar-week">';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dateKey = this.getDateKey(date);
            const reviews = this.reviewData.get(dateKey) || [];
            const isToday = date.toDateString() === new Date().toDateString();
            
            let classes = ['week-day'];
            if (isToday) classes.push('today');
            
            html += `
                <div class="${classes.join(' ')}" data-date="${dateKey}">
                    <div class="week-day-header">
                        <div class="day-name">${['日', '一', '二', '三', '四', '五', '六'][i]}</div>
                        <div class="day-number">${date.getDate()}</div>
                    </div>
                    <div class="week-day-content">
                        ${reviews.map(review => `
                            <div class="review-item ${review.completed ? 'completed' : 'pending'}">
                                <span class="review-title">${review.title}</span>
                                <span class="review-subject">${review.subject}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        this.bindDayEvents();
    }
    
    bindDayEvents() {
        document.querySelectorAll('.day-cell, .week-day').forEach(cell => {
            cell.addEventListener('click', (e) => {
                const dateKey = cell.dataset.date;
                this.showDayReviews(dateKey);
            });
        });
    }
    
    showDayReviews(dateKey) {
        const reviews = this.reviewData.get(dateKey) || [];
        if (reviews.length === 0) return;
        
        const modal = document.getElementById('reviewDetailModal');
        const content = document.getElementById('reviewDetailContent');
        
        if (modal && content) {
            const date = new Date(dateKey);
            content.innerHTML = `
                <div class="review-day-detail">
                    <h4>${Utils.formatDate(date)} 的复习任务</h4>
                    <div class="review-list">
                        ${reviews.map(review => `
                            <div class="review-item-detail ${review.completed ? 'completed' : 'pending'}">
                                <div class="review-header">
                                    <span class="review-title">${review.title}</span>
                                    <span class="review-status">
                                        ${review.completed ? 
                                            '<i class="fas fa-check-circle" style="color: #52c41a;"></i> 已完成' : 
                                            '<i class="fas fa-clock" style="color: #faad14;"></i> 待复习'
                                        }
                                    </span>
                                </div>
                                <div class="review-meta">
                                    <span class="subject">${review.subject}</span>
                                    <span class="difficulty">${review.difficulty}</span>
                                    <span class="mastery">掌握度: ${review.masteryLevel}/4</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        }
    }
    
    showTodayPanel() {
        const panel = document.getElementById('todayPanel');
        const tasksContainer = document.getElementById('reviewTasks');
        
        if (panel && tasksContainer) {
            const today = this.getDateKey(new Date());
            const todayReviews = this.reviewData.get(today) || [];
            
            tasksContainer.innerHTML = todayReviews.map(review => `
                <div class="review-task ${review.completed ? 'completed' : 'pending'}">
                    <div class="task-content">
                        <h5>${review.title}</h5>
                        <div class="task-meta">
                            <span class="subject">${review.subject}</span>
                            <span class="difficulty">${review.difficulty}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        ${!review.completed ? 
                            `<button class="ant-btn ant-btn-primary ant-btn-sm" onclick="ebbinghausCalendar.startReview('${review.id}')">
                                开始复习
                            </button>` : 
                            '<span class="completed-badge"><i class="fas fa-check"></i> 已完成</span>'
                        }
                    </div>
                </div>
            `).join('');
            
            panel.classList.add('active');
        }
    }
    
    updateStats() {
        const today = this.getDateKey(new Date());
        const todayReviews = this.reviewData.get(today) || [];
        
        // 今日复习数量
        const todayElement = document.getElementById('todayReviews');
        if (todayElement) {
            todayElement.textContent = todayReviews.length;
        }
        
        // 待复习数量
        let pendingCount = 0;
        const now = new Date();
        this.reviewData.forEach((reviews, dateKey) => {
            const date = new Date(dateKey);
            if (date <= now) {
                pendingCount += reviews.filter(r => !r.completed).length;
            }
        });
        
        const pendingElement = document.getElementById('pendingReviews');
        if (pendingElement) {
            pendingElement.textContent = pendingCount;
        }
        
        // 连续天数（简化计算）
        const streakElement = document.getElementById('streakDays');
        if (streakElement) {
            streakElement.textContent = this.calculateStreak();
        }
        
        // 完成率
        const completionElement = document.getElementById('completionRate');
        if (completionElement) {
            const totalReviews = todayReviews.length;
            const completedReviews = todayReviews.filter(r => r.completed).length;
            const rate = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;
            completionElement.textContent = `${rate}%`;
        }
    }
    
    calculateStreak() {
        // 简化的连续天数计算
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = this.getDateKey(date);
            const reviews = this.reviewData.get(dateKey) || [];
            
            if (reviews.length > 0 && reviews.every(r => r.completed)) {
                streak++;
            } else if (reviews.length > 0) {
                break;
            }
        }
        
        return streak;
    }
    
    startReview(questionId) {
        // 跳转到题目详情页面开始复习
        window.appController?.navigateTo('question-detail', { id: questionId });
    }
    
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day;
        return new Date(start.setDate(diff));
    }
}

// 全局实例
let ebbinghausCalendar;

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ebbinghausCalendar = new EbbinghausCalendar();
    });
} else {
    ebbinghausCalendar = new EbbinghausCalendar();
}

// 导出到全局
window.ebbinghausCalendar = ebbinghausCalendar;