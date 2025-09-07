/**
 * 数据看板页面脚本
 * 处理数据统计、图表展示等功能
 */

(function() {
  'use strict';

  /**
   * 数据看板页面控制器
   */
  class DashboardPageController {
    constructor() {
      this.charts = {};
      this.refreshInterval = null;
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('📊 初始化数据看板页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载数据
      this.loadDashboardData();
      
      // 初始化图表
      this.initCharts();
      
      // 设置自动刷新
      this.setupAutoRefresh();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 时间范围选择
      const timeRangeSelect = document.querySelector('#time-range-select');
      if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', (e) => {
          this.handleTimeRangeChange(e.target.value);
        });
      }

      // 刷新按钮
      const refreshBtn = document.querySelector('#refresh-btn');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
          this.refreshData();
        });
      }

      // 导出按钮
      const exportBtn = document.querySelector('#export-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.handleExport();
        });
      }

      // 图表切换
      const chartTabs = document.querySelectorAll('.chart-tab');
      chartTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.handleChartTabChange(e.target.dataset.chart);
        });
      });
    }

    /**
     * 加载看板数据
     */
    async loadDashboardData() {
      try {
        console.log('📈 加载看板数据...');
        
        this.showLoading();
        
        // 获取统计数据
        const stats = await this.getStatistics();
        const chartData = await this.getChartData();
        const recentActivity = await this.getRecentActivity();
        
        // 渲染数据
        this.renderStatistics(stats);
        this.renderCharts(chartData);
        this.renderRecentActivity(recentActivity);
        
        console.log('✅ 看板数据加载完成');
        
      } catch (error) {
        console.error('❌ 加载看板数据失败:', error);
        this.showError('加载数据失败，请稍后重试');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 获取统计数据
     */
    async getStatistics() {
      if (window.questionManager) {
        return window.questionManager.getStatistics();
      }
      
      // 模拟数据
      return {
        totalQuestions: 156,
        newQuestions: 23,
        reviewingQuestions: 89,
        masteredQuestions: 44,
        todayPractice: 12,
        weeklyPractice: 67,
        accuracy: 78.5,
        streak: 7
      };
    }

    /**
     * 获取图表数据
     */
    async getChartData() {
      // 模拟图表数据
      return {
        practiceChart: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          data: [12, 19, 8, 15, 22, 18, 25]
        },
        subjectChart: {
          labels: ['数学', '语文', '英语', '物理', '化学'],
          data: [45, 32, 28, 25, 26]
        },
        difficultyChart: {
          labels: ['简单', '中等', '困难'],
          data: [62, 78, 16]
        },
        accuracyChart: {
          labels: ['本周', '上周', '上上周', '三周前'],
          data: [78.5, 82.1, 75.3, 79.8]
        }
      };
    }

    /**
     * 获取最近活动
     */
    async getRecentActivity() {
      // 模拟最近活动数据
      return [
        {
          type: 'practice',
          title: '完成数学练习',
          description: '练习了5道二次函数题目',
          time: Date.now() - 3600000,
          accuracy: 80
        },
        {
          type: 'add',
          title: '添加新错题',
          description: '添加了英语语法错题',
          time: Date.now() - 7200000
        },
        {
          type: 'master',
          title: '掌握题目',
          description: '物理力学题目已掌握',
          time: Date.now() - 10800000
        }
      ];
    }

    /**
     * 渲染统计数据
     */
    renderStatistics(stats) {
      const statsContainer = document.querySelector('.stats-grid');
      if (!statsContainer) return;

      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-book"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.totalQuestions}</div>
            <div class="stat-label">总题数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-plus-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.newQuestions}</div>
            <div class="stat-label">新题目</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-refresh"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.reviewingQuestions}</div>
            <div class="stat-label">复习中</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.masteredQuestions}</div>
            <div class="stat-label">已掌握</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-target"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.todayPractice}</div>
            <div class="stat-label">今日练习</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-calendar"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.weeklyPractice}</div>
            <div class="stat-label">本周练习</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-trending-up"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.accuracy}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="icon-fire"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">${stats.streak}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      `;
    }

    /**
     * 渲染图表
     */
    renderCharts(chartData) {
      // 练习趋势图
      this.renderPracticeChart(chartData.practiceChart);
      
      // 科目分布图
      this.renderSubjectChart(chartData.subjectChart);
      
      // 难度分布图
      this.renderDifficultyChart(chartData.difficultyChart);
      
      // 正确率趋势图
      this.renderAccuracyChart(chartData.accuracyChart);
    }

    /**
     * 渲染练习趋势图
     */
    renderPracticeChart(data) {
      const container = document.querySelector('#practice-chart');
      if (!container) return;

      // 简单的柱状图实现
      const maxValue = Math.max(...data.data);
      const html = data.labels.map((label, index) => {
        const height = (data.data[index] / maxValue) * 100;
        return `
          <div class="chart-bar">
            <div class="bar" style="height: ${height}%" title="${label}: ${data.data[index]}"></div>
            <div class="bar-label">${label}</div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="chart-title">本周练习趋势</div>
        <div class="bar-chart">${html}</div>
      `;
    }

    /**
     * 渲染科目分布图
     */
    renderSubjectChart(data) {
      const container = document.querySelector('#subject-chart');
      if (!container) return;

      const total = data.data.reduce((sum, value) => sum + value, 0);
      const html = data.labels.map((label, index) => {
        const percentage = ((data.data[index] / total) * 100).toFixed(1);
        return `
          <div class="pie-item">
            <div class="pie-color" style="background-color: hsl(${index * 72}, 70%, 60%)"></div>
            <div class="pie-label">${label}</div>
            <div class="pie-value">${data.data[index]} (${percentage}%)</div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="chart-title">科目分布</div>
        <div class="pie-chart">${html}</div>
      `;
    }

    /**
     * 渲染难度分布图
     */
    renderDifficultyChart(data) {
      const container = document.querySelector('#difficulty-chart');
      if (!container) return;

      const total = data.data.reduce((sum, value) => sum + value, 0);
      const colors = ['#52c41a', '#faad14', '#ff4d4f'];
      
      const html = data.labels.map((label, index) => {
        const percentage = ((data.data[index] / total) * 100).toFixed(1);
        return `
          <div class="difficulty-item">
            <div class="difficulty-bar">
              <div class="difficulty-fill" style="width: ${percentage}%; background-color: ${colors[index]}"></div>
            </div>
            <div class="difficulty-info">
              <span class="difficulty-label">${label}</span>
              <span class="difficulty-value">${data.data[index]} (${percentage}%)</span>
            </div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="chart-title">难度分布</div>
        <div class="difficulty-chart">${html}</div>
      `;
    }

    /**
     * 渲染正确率趋势图
     */
    renderAccuracyChart(data) {
      const container = document.querySelector('#accuracy-chart');
      if (!container) return;

      const html = data.labels.map((label, index) => {
        const value = data.data[index];
        const color = value >= 80 ? '#52c41a' : value >= 60 ? '#faad14' : '#ff4d4f';
        return `
          <div class="accuracy-item">
            <div class="accuracy-label">${label}</div>
            <div class="accuracy-bar">
              <div class="accuracy-fill" style="width: ${value}%; background-color: ${color}"></div>
            </div>
            <div class="accuracy-value">${value}%</div>
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="chart-title">正确率趋势</div>
        <div class="accuracy-chart">${html}</div>
      `;
    }

    /**
     * 渲染最近活动
     */
    renderRecentActivity(activities) {
      const container = document.querySelector('.recent-activity');
      if (!container) return;

      if (!activities || activities.length === 0) {
        container.innerHTML = `
          <div class="activity-empty">
            <i class="icon-inbox"></i>
            <p>暂无最近活动</p>
          </div>
        `;
        return;
      }

      const html = activities.map(activity => {
        const iconMap = {
          'practice': 'icon-play',
          'add': 'icon-plus',
          'master': 'icon-check',
          'review': 'icon-refresh'
        };
        
        return `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="${iconMap[activity.type] || 'icon-circle'}"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">${activity.title}</div>
              <div class="activity-description">${activity.description}</div>
              <div class="activity-time">${this.formatTime(activity.time)}</div>
            </div>
            ${activity.accuracy ? `<div class="activity-accuracy">${activity.accuracy}%</div>` : ''}
          </div>
        `;
      }).join('');

      container.innerHTML = `
        <div class="section-title">最近活动</div>
        <div class="activity-list">${html}</div>
      `;
    }

    /**
     * 初始化图表
     */
    initCharts() {
      // 如果有第三方图表库，在这里初始化
      console.log('📊 初始化图表组件');
    }

    /**
     * 设置自动刷新
     */
    setupAutoRefresh() {
      // 每5分钟自动刷新一次
      this.refreshInterval = setInterval(() => {
        this.refreshData();
      }, 5 * 60 * 1000);
    }

    /**
     * 刷新数据
     */
    async refreshData() {
      console.log('🔄 刷新看板数据');
      await this.loadDashboardData();
      this.showNotification('数据已刷新', 'success');
    }

    /**
     * 处理时间范围变化
     */
    handleTimeRangeChange(range) {
      console.log('📅 时间范围变化:', range);
      this.currentTimeRange = range;
      this.loadDashboardData();
    }

    /**
     * 处理图表标签页变化
     */
    handleChartTabChange(chartType) {
      console.log('📊 切换图表:', chartType);
      
      // 更新标签页状态
      document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
      
      // 显示对应图表
      document.querySelectorAll('.chart-panel').forEach(panel => {
        panel.style.display = 'none';
      });
      document.querySelector(`#${chartType}-chart`).style.display = 'block';
    }

    /**
     * 处理导出
     */
    handleExport() {
      console.log('📤 导出数据');
      
      // 生成导出数据
      const exportData = {
        timestamp: new Date().toISOString(),
        statistics: this.currentStats,
        charts: this.currentChartData
      };
      
      // 下载JSON文件
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('数据导出成功', 'success');
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60000) {
        return '刚刚';
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
      } else {
        return new Date(timestamp).toLocaleDateString('zh-CN');
      }
    }

    /**
     * 清理资源
     */
    destroy() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
      
      // 清理图表
      Object.values(this.charts).forEach(chart => {
        if (chart && chart.destroy) {
          chart.destroy();
        }
      });
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
      new DashboardPageController();
    });
  } else {
    new DashboardPageController();
  }

  // 导出到全局
  window.DashboardPageController = DashboardPageController;

})();