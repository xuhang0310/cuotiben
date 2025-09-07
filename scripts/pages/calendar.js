/**
 * 日历页面脚本
 * 处理错题练习日历和学习计划功能
 */

(function() {
  'use strict';

  /**
   * 日历页面控制器
   */
  class CalendarPageController {
    constructor() {
      this.currentDate = new Date();
      this.currentView = 'month'; // month, week, day
      this.events = [];
      this.studyPlans = [];
      this.practiceRecords = [];
      this.selectedDate = null;
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('📅 初始化日历页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载数据
      this.loadCalendarData();
      
      // 渲染日历
      this.renderCalendar();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 视图切换
      const viewButtons = document.querySelectorAll('.view-btn');
      viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.switchView(e.target.dataset.view);
        });
      });

      // 导航按钮
      const prevBtn = document.querySelector('#prev-btn');
      const nextBtn = document.querySelector('#next-btn');
      const todayBtn = document.querySelector('#today-btn');
      
      if (prevBtn) {
        prevBtn.addEventListener('click', () => this.navigatePrevious());
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.navigateNext());
      }
      if (todayBtn) {
        todayBtn.addEventListener('click', () => this.goToToday());
      }

      // 添加事件按钮
      const addEventBtn = document.querySelector('#add-event-btn');
      if (addEventBtn) {
        addEventBtn.addEventListener('click', () => this.showAddEventModal());
      }

      // 添加学习计划按钮
      const addPlanBtn = document.querySelector('#add-plan-btn');
      if (addPlanBtn) {
        addPlanBtn.addEventListener('click', () => this.showAddPlanModal());
      }

      // 日期选择
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('calendar-day')) {
          this.selectDate(e.target.dataset.date);
        }
      });

      // 事件点击
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('event-item')) {
          this.showEventDetails(e.target.dataset.eventId);
        }
      });

      // 模态框关闭
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });

      // 表单提交
      document.addEventListener('submit', (e) => {
        if (e.target.id === 'event-form') {
          e.preventDefault();
          this.saveEvent();
        }
        if (e.target.id === 'plan-form') {
          e.preventDefault();
          this.savePlan();
        }
      });
    }

    /**
     * 加载日历数据
     */
    async loadCalendarData() {
      try {
        console.log('📊 加载日历数据...');
        
        this.showLoading();
        
        let data = null;
        if (window.questionManager) {
          data = await window.questionManager.getCalendarData();
        } else {
          // 模拟日历数据
          data = this.generateMockCalendarData();
        }
        
        this.events = data.events;
        this.studyPlans = data.studyPlans;
        this.practiceRecords = data.practiceRecords;
        
        // 渲染数据
        this.renderCalendar();
        this.renderSidebar();
        
        console.log('✅ 日历数据加载完成');
        
      } catch (error) {
        console.error('❌ 加载日历数据失败:', error);
        this.showError('加载数据失败，请稍后重试');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 生成模拟日历数据
     */
    generateMockCalendarData() {
      const today = new Date();
      const events = [];
      const studyPlans = [];
      const practiceRecords = [];
      
      // 生成事件
      for (let i = 0; i < 20; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + Math.floor(Math.random() * 60) - 30);
        
        events.push({
          id: i + 1,
          title: this.getRandomEventTitle(),
          date: date.toISOString().split('T')[0],
          time: this.getRandomTime(),
          type: this.getRandomEventType(),
          description: '这是一个示例事件描述',
          completed: Math.random() > 0.3,
          priority: this.getRandomPriority()
        });
      }
      
      // 生成学习计划
      for (let i = 0; i < 10; i++) {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14) + 1);
        
        studyPlans.push({
          id: i + 1,
          title: this.getRandomPlanTitle(),
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          subject: this.getRandomSubject(),
          target: Math.floor(Math.random() * 50) + 10,
          progress: Math.floor(Math.random() * 80),
          status: this.getRandomStatus()
        });
      }
      
      // 生成练习记录
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - Math.floor(Math.random() * 30));
        
        practiceRecords.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          questionsCount: Math.floor(Math.random() * 20) + 5,
          correctCount: Math.floor(Math.random() * 15) + 3,
          timeSpent: Math.floor(Math.random() * 120) + 30, // 分钟
          subject: this.getRandomSubject(),
          difficulty: this.getRandomDifficulty()
        });
      }
      
      return {
        events,
        studyPlans,
        practiceRecords
      };
    }

    /**
     * 渲染日历
     */
    renderCalendar() {
      const container = document.querySelector('.calendar-container');
      if (!container) return;

      switch (this.currentView) {
        case 'month':
          this.renderMonthView(container);
          break;
        case 'week':
          this.renderWeekView(container);
          break;
        case 'day':
          this.renderDayView(container);
          break;
      }
      
      this.updateNavigationTitle();
    }

    /**
     * 渲染月视图
     */
    renderMonthView(container) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      let html = `
        <div class="calendar-header">
          <div class="weekdays">
            <div class="weekday">日</div>
            <div class="weekday">一</div>
            <div class="weekday">二</div>
            <div class="weekday">三</div>
            <div class="weekday">四</div>
            <div class="weekday">五</div>
            <div class="weekday">六</div>
          </div>
        </div>
        <div class="calendar-body">
      `;
      
      const currentDate = new Date(startDate);
      for (let week = 0; week < 6; week++) {
        html += '<div class="calendar-week">';
        
        for (let day = 0; day < 7; day++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const isCurrentMonth = currentDate.getMonth() === month;
          const isToday = this.isToday(currentDate);
          const isSelected = this.selectedDate === dateStr;
          
          const dayEvents = this.getEventsForDate(dateStr);
          const practiceRecord = this.getPracticeRecordForDate(dateStr);
          
          html += `
            <div class="calendar-day ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                 data-date="${dateStr}">
              <div class="day-number">${currentDate.getDate()}</div>
              
              ${practiceRecord ? `
                <div class="practice-indicator" title="练习了${practiceRecord.questionsCount}题">
                  <div class="practice-dot" style="background-color: ${this.getPracticeColor(practiceRecord.correctCount / practiceRecord.questionsCount)}"></div>
                </div>
              ` : ''}
              
              <div class="day-events">
                ${dayEvents.slice(0, 3).map(event => `
                  <div class="event-item event-${event.type}" data-event-id="${event.id}" title="${event.title}">
                    <span class="event-time">${event.time}</span>
                    <span class="event-title">${event.title}</span>
                  </div>
                `).join('')}
                ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3}更多</div>` : ''}
              </div>
            </div>
          `;
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        html += '</div>';
      }
      
      html += '</div>';
      container.innerHTML = html;
    }

    /**
     * 渲染周视图
     */
    renderWeekView(container) {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      let html = `
        <div class="week-view">
          <div class="week-header">
            <div class="time-column"></div>
      `;
      
      // 渲染星期标题
      const currentDate = new Date(startOfWeek);
      for (let i = 0; i < 7; i++) {
        const isToday = this.isToday(currentDate);
        html += `
          <div class="day-column ${isToday ? 'today' : ''}">
            <div class="day-name">${this.getDayName(currentDate.getDay())}</div>
            <div class="day-number">${currentDate.getDate()}</div>
          </div>
        `;
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      html += '</div><div class="week-body">';
      
      // 渲染时间槽
      for (let hour = 0; hour < 24; hour++) {
        html += `
          <div class="time-slot">
            <div class="time-label">${hour.toString().padStart(2, '0')}:00</div>
        `;
        
        const slotDate = new Date(startOfWeek);
        for (let day = 0; day < 7; day++) {
          const dateStr = slotDate.toISOString().split('T')[0];
          const hourEvents = this.getEventsForDateTime(dateStr, hour);
          
          html += `
            <div class="hour-cell" data-date="${dateStr}" data-hour="${hour}">
              ${hourEvents.map(event => `
                <div class="event-item event-${event.type}" data-event-id="${event.id}">
                  ${event.title}
                </div>
              `).join('')}
            </div>
          `;
          
          slotDate.setDate(slotDate.getDate() + 1);
        }
        
        html += '</div>';
      }
      
      html += '</div></div>';
      container.innerHTML = html;
    }

    /**
     * 渲染日视图
     */
    renderDayView(container) {
      const dateStr = this.currentDate.toISOString().split('T')[0];
      const dayEvents = this.getEventsForDate(dateStr);
      const practiceRecord = this.getPracticeRecordForDate(dateStr);
      const studyPlans = this.getStudyPlansForDate(dateStr);
      
      let html = `
        <div class="day-view">
          <div class="day-header">
            <h2>${this.formatDate(this.currentDate)}</h2>
            <div class="day-stats">
              ${practiceRecord ? `
                <div class="stat-item">
                  <span class="stat-label">练习题数:</span>
                  <span class="stat-value">${practiceRecord.questionsCount}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">正确率:</span>
                  <span class="stat-value">${((practiceRecord.correctCount / practiceRecord.questionsCount) * 100).toFixed(1)}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">用时:</span>
                  <span class="stat-value">${practiceRecord.timeSpent}分钟</span>
                </div>
              ` : '<div class="no-practice">今日暂无练习记录</div>'}
            </div>
          </div>
          
          <div class="day-content">
            <div class="events-section">
              <h3>今日事件</h3>
              <div class="events-list">
                ${dayEvents.length > 0 ? dayEvents.map(event => `
                  <div class="event-card event-${event.type}" data-event-id="${event.id}">
                    <div class="event-header">
                      <span class="event-time">${event.time}</span>
                      <span class="event-priority priority-${event.priority}">${this.getPriorityText(event.priority)}</span>
                    </div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-description">${event.description}</div>
                    <div class="event-actions">
                      <button onclick="window.calendarController.editEvent(${event.id})" class="btn btn-sm">编辑</button>
                      <button onclick="window.calendarController.deleteEvent(${event.id})" class="btn btn-sm btn-danger">删除</button>
                      ${!event.completed ? `<button onclick="window.calendarController.completeEvent(${event.id})" class="btn btn-sm btn-success">完成</button>` : ''}
                    </div>
                  </div>
                `).join('') : '<div class="no-events">今日暂无事件</div>'}
              </div>
            </div>
            
            <div class="plans-section">
              <h3>学习计划</h3>
              <div class="plans-list">
                ${studyPlans.length > 0 ? studyPlans.map(plan => `
                  <div class="plan-card">
                    <div class="plan-header">
                      <span class="plan-title">${plan.title}</span>
                      <span class="plan-subject">${plan.subject}</span>
                    </div>
                    <div class="plan-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${plan.progress}%"></div>
                      </div>
                      <span class="progress-text">${plan.progress}%</span>
                    </div>
                    <div class="plan-target">目标: ${plan.target}题</div>
                  </div>
                `).join('') : '<div class="no-plans">今日暂无学习计划</div>'}
              </div>
            </div>
          </div>
        </div>
      `;
      
      container.innerHTML = html;
    }

    /**
     * 渲染侧边栏
     */
    renderSidebar() {
      const sidebar = document.querySelector('.calendar-sidebar');
      if (!sidebar) return;

      const upcomingEvents = this.getUpcomingEvents();
      const activePlans = this.getActivePlans();
      const recentPractice = this.getRecentPracticeRecords();
      
      sidebar.innerHTML = `
        <div class="sidebar-section">
          <h3>即将到来</h3>
          <div class="upcoming-events">
            ${upcomingEvents.slice(0, 5).map(event => `
              <div class="upcoming-event" data-event-id="${event.id}">
                <div class="event-date">${this.formatShortDate(event.date)}</div>
                <div class="event-info">
                  <div class="event-title">${event.title}</div>
                  <div class="event-time">${event.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>进行中的计划</h3>
          <div class="active-plans">
            ${activePlans.slice(0, 3).map(plan => `
              <div class="plan-item">
                <div class="plan-title">${plan.title}</div>
                <div class="plan-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${plan.progress}%"></div>
                  </div>
                  <span class="progress-text">${plan.progress}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>最近练习</h3>
          <div class="recent-practice">
            ${recentPractice.slice(0, 5).map(record => `
              <div class="practice-item">
                <div class="practice-date">${this.formatShortDate(record.date)}</div>
                <div class="practice-stats">
                  <span class="questions-count">${record.questionsCount}题</span>
                  <span class="accuracy">${((record.correctCount / record.questionsCount) * 100).toFixed(0)}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    /**
     * 切换视图
     */
    switchView(view) {
      console.log('🔄 切换视图:', view);
      
      this.currentView = view;
      
      // 更新按钮状态
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector(`[data-view="${view}"]`).classList.add('active');
      
      // 重新渲染日历
      this.renderCalendar();
    }

    /**
     * 导航到上一个时间段
     */
    navigatePrevious() {
      switch (this.currentView) {
        case 'month':
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
          break;
        case 'week':
          this.currentDate.setDate(this.currentDate.getDate() - 7);
          break;
        case 'day':
          this.currentDate.setDate(this.currentDate.getDate() - 1);
          break;
      }
      this.renderCalendar();
    }

    /**
     * 导航到下一个时间段
     */
    navigateNext() {
      switch (this.currentView) {
        case 'month':
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
          break;
        case 'week':
          this.currentDate.setDate(this.currentDate.getDate() + 7);
          break;
        case 'day':
          this.currentDate.setDate(this.currentDate.getDate() + 1);
          break;
      }
      this.renderCalendar();
    }

    /**
     * 回到今天
     */
    goToToday() {
      this.currentDate = new Date();
      this.renderCalendar();
    }

    /**
     * 选择日期
     */
    selectDate(dateStr) {
      console.log('📅 选择日期:', dateStr);
      
      this.selectedDate = dateStr;
      this.currentDate = new Date(dateStr);
      
      // 如果不是日视图，切换到日视图
      if (this.currentView !== 'day') {
        this.switchView('day');
      } else {
        this.renderCalendar();
      }
    }

    /**
     * 显示添加事件模态框
     */
    showAddEventModal() {
      const modal = document.querySelector('#event-modal');
      if (!modal) return;
      
      // 重置表单
      const form = modal.querySelector('#event-form');
      if (form) form.reset();
      
      // 设置默认日期
      const dateInput = modal.querySelector('#event-date');
      if (dateInput) {
        dateInput.value = this.selectedDate || this.currentDate.toISOString().split('T')[0];
      }
      
      modal.style.display = 'block';
    }

    /**
     * 显示添加计划模态框
     */
    showAddPlanModal() {
      const modal = document.querySelector('#plan-modal');
      if (!modal) return;
      
      // 重置表单
      const form = modal.querySelector('#plan-form');
      if (form) form.reset();
      
      modal.style.display = 'block';
    }

    /**
     * 关闭模态框
     */
    closeModal() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    }

    /**
     * 保存事件
     */
    saveEvent() {
      const form = document.querySelector('#event-form');
      if (!form) return;
      
      const formData = new FormData(form);
      const event = {
        id: Date.now(),
        title: formData.get('title'),
        date: formData.get('date'),
        time: formData.get('time'),
        type: formData.get('type'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        completed: false
      };
      
      this.events.push(event);
      this.renderCalendar();
      this.renderSidebar();
      this.closeModal();
      
      this.showNotification('事件添加成功', 'success');
    }

    /**
     * 保存计划
     */
    savePlan() {
      const form = document.querySelector('#plan-form');
      if (!form) return;
      
      const formData = new FormData(form);
      const plan = {
        id: Date.now(),
        title: formData.get('title'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        subject: formData.get('subject'),
        target: parseInt(formData.get('target')),
        progress: 0,
        status: 'active'
      };
      
      this.studyPlans.push(plan);
      this.renderCalendar();
      this.renderSidebar();
      this.closeModal();
      
      this.showNotification('学习计划添加成功', 'success');
    }

    /**
     * 编辑事件
     */
    editEvent(eventId) {
      console.log('✏️ 编辑事件:', eventId);
      
      const event = this.events.find(e => e.id === eventId);
      if (!event) return;
      
      // 填充表单
      const modal = document.querySelector('#event-modal');
      const form = modal.querySelector('#event-form');
      
      form.querySelector('#event-title').value = event.title;
      form.querySelector('#event-date').value = event.date;
      form.querySelector('#event-time').value = event.time;
      form.querySelector('#event-type').value = event.type;
      form.querySelector('#event-description').value = event.description;
      form.querySelector('#event-priority').value = event.priority;
      
      // 设置编辑模式
      form.dataset.editId = eventId;
      
      modal.style.display = 'block';
    }

    /**
     * 删除事件
     */
    deleteEvent(eventId) {
      console.log('🗑️ 删除事件:', eventId);
      
      if (confirm('确定要删除这个事件吗？')) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.renderCalendar();
        this.renderSidebar();
        this.showNotification('事件已删除', 'success');
      }
    }

    /**
     * 完成事件
     */
    completeEvent(eventId) {
      console.log('✅ 完成事件:', eventId);
      
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        event.completed = true;
        this.renderCalendar();
        this.renderSidebar();
        this.showNotification('事件已完成', 'success');
      }
    }

    /**
     * 显示事件详情
     */
    showEventDetails(eventId) {
      console.log('👁️ 显示事件详情:', eventId);
      
      const event = this.events.find(e => e.id === parseInt(eventId));
      if (!event) return;
      
      // 这里可以显示事件详情模态框
      alert(`事件详情:\n标题: ${event.title}\n时间: ${event.date} ${event.time}\n描述: ${event.description}`);
    }

    /**
     * 更新导航标题
     */
    updateNavigationTitle() {
      const titleElement = document.querySelector('.calendar-title');
      if (!titleElement) return;
      
      let title = '';
      switch (this.currentView) {
        case 'month':
          title = `${this.currentDate.getFullYear()}年${this.currentDate.getMonth() + 1}月`;
          break;
        case 'week':
          const startOfWeek = this.getStartOfWeek(this.currentDate);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          title = `${this.formatShortDate(startOfWeek)} - ${this.formatShortDate(endOfWeek)}`;
          break;
        case 'day':
          title = this.formatDate(this.currentDate);
          break;
      }
      
      titleElement.textContent = title;
    }

    // 数据获取方法
    getEventsForDate(dateStr) {
      return this.events.filter(event => event.date === dateStr);
    }

    getEventsForDateTime(dateStr, hour) {
      return this.events.filter(event => {
        if (event.date !== dateStr) return false;
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
      });
    }

    getPracticeRecordForDate(dateStr) {
      return this.practiceRecords.find(record => record.date === dateStr);
    }

    getStudyPlansForDate(dateStr) {
      return this.studyPlans.filter(plan => {
        return dateStr >= plan.startDate && dateStr <= plan.endDate;
      });
    }

    getUpcomingEvents() {
      const today = new Date().toISOString().split('T')[0];
      return this.events
        .filter(event => event.date >= today && !event.completed)
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    }

    getActivePlans() {
      const today = new Date().toISOString().split('T')[0];
      return this.studyPlans.filter(plan => {
        return plan.status === 'active' && plan.endDate >= today;
      });
    }

    getRecentPracticeRecords() {
      return this.practiceRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    }

    // 辅助方法
    isToday(date) {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }

    getStartOfWeek(date) {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      return startOfWeek;
    }

    formatDate(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    formatShortDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    getDayName(dayIndex) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      return days[dayIndex];
    }

    getPracticeColor(accuracy) {
      if (accuracy >= 0.8) return '#4caf50';
      if (accuracy >= 0.6) return '#ff9800';
      return '#f44336';
    }

    getPriorityText(priority) {
      const map = {
        'low': '低',
        'medium': '中',
        'high': '高'
      };
      return map[priority] || priority;
    }

    // 随机数据生成方法
    getRandomEventTitle() {
      const titles = [
        '数学练习', '英语阅读', '物理实验', '化学复习',
        '历史背诵', '地理学习', '生物实验', '语文写作',
        '错题整理', '知识点复习', '模拟考试', '作业完成'
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }

    getRandomEventType() {
      const types = ['study', 'practice', 'exam', 'review', 'homework'];
      return types[Math.floor(Math.random() * types.length)];
    }

    getRandomPriority() {
      const priorities = ['low', 'medium', 'high'];
      return priorities[Math.floor(Math.random() * priorities.length)];
    }

    getRandomTime() {
      const hour = Math.floor(Math.random() * 12) + 8; // 8-19点
      const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    getRandomPlanTitle() {
      const titles = [
        '数学错题专项练习', '英语语法强化', '物理力学复习',
        '化学方程式练习', '历史重点背诵', '地理知识梳理',
        '生物实验总结', '语文阅读理解', '综合练习计划'
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }

    getRandomSubject() {
      const subjects = ['数学', '英语', '物理', '化学', '历史', '地理', '生物', '语文'];
      return subjects[Math.floor(Math.random() * subjects.length)];
    }

    getRandomStatus() {
      const statuses = ['active', 'completed', 'paused'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getRandomDifficulty() {
      const difficulties = ['easy', 'medium', 'hard'];
      return difficulties[Math.floor(Math.random() * difficulties.length)];
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
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.calendarController = new CalendarPageController();
    });
  } else {
    window.calendarController = new CalendarPageController();
  }

  // 导出到全局
  window.CalendarPageController = CalendarPageController;

})();