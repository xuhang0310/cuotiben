/**
 * 错题本应用数据存储管理模块
 * 提供统一的数据存储和管理接口
 */

/**
 * 数据存储管理器
 */
class DataStorage {
  constructor() {
    this.prefix = 'cuotiben_';
    this.version = '1.0.0';
    this.init();
  }

  /**
   * 初始化存储
   */
  init() {
    // 检查版本兼容性
    this.checkVersion();
    
    // 初始化默认数据
    this.initDefaultData();
  }

  /**
   * 检查版本兼容性
   */
  checkVersion() {
    const storedVersion = this.get('version');
    if (!storedVersion || storedVersion !== this.version) {
      console.log('数据版本更新，执行迁移...');
      this.migrateData(storedVersion, this.version);
      this.set('version', this.version);
    }
  }

  /**
   * 数据迁移
   * @param {string} fromVersion - 源版本
   * @param {string} toVersion - 目标版本
   */
  migrateData(fromVersion, toVersion) {
    // 这里可以添加版本迁移逻辑
    console.log(`数据从 ${fromVersion || '未知'} 迁移到 ${toVersion}`);
  }

  /**
   * 初始化默认数据
   */
  initDefaultData() {
    // 初始化用户设置
    if (!this.get('settings')) {
      this.set('settings', {
        theme: 'light',
        language: 'zh-CN',
        pageSize: 20,
        autoSave: true,
        notifications: true,
        soundEnabled: true,
        aiVoiceEnabled: false,
        reviewReminder: true,
        studyGoal: 10
      });
    }

    // 初始化错题数据
    if (!this.get('questions')) {
      this.set('questions', []);
    }

    // 初始化学习统计
    if (!this.get('statistics')) {
      this.set('statistics', {
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        reviewCount: 0,
        studyDays: 0,
        lastStudyDate: null,
        subjectStats: {},
        difficultyStats: {},
        monthlyStats: {}
      });
    }

    // 初始化复习计划
    if (!this.get('reviewPlans')) {
      this.set('reviewPlans', []);
    }

    // 初始化题簇数据
    if (!this.get('clusters')) {
      this.set('clusters', []);
    }
  }

  /**
   * 生成存储键
   * @param {string} key - 原始键
   * @returns {string} 带前缀的键
   */
  getKey(key) {
    return this.prefix + key;
  }

  /**
   * 设置数据
   * @param {string} key - 键
   * @param {any} value - 值
   */
  set(key, value) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        version: this.version
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
      
      // 触发数据变更事件
      this.emit('dataChanged', { key, value });
    } catch (error) {
      console.error('数据存储失败:', error);
      throw new Error('存储空间不足或数据格式错误');
    }
  }

  /**
   * 获取数据
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return defaultValue;
      
      const data = JSON.parse(item);
      return data.value !== undefined ? data.value : defaultValue;
    } catch (error) {
      console.error('数据读取失败:', error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   * @param {string} key - 键
   */
  remove(key) {
    try {
      localStorage.removeItem(this.getKey(key));
      this.emit('dataChanged', { key, value: null, action: 'remove' });
    } catch (error) {
      console.error('数据删除失败:', error);
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      this.emit('dataCleared');
    } catch (error) {
      console.error('数据清空失败:', error);
    }
  }

  /**
   * 获取存储大小
   * @returns {Object} 存储大小信息
   */
  getStorageSize() {
    let totalSize = 0;
    let itemCount = 0;
    
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        totalSize += localStorage[key].length;
        itemCount++;
      }
    }
    
    return {
      totalSize,
      itemCount,
      formattedSize: this.formatBytes(totalSize)
    };
  }

  /**
   * 格式化字节数
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 导出数据
   * @returns {Object} 所有数据
   */
  exportData() {
    const data = {};
    
    for (const key in localStorage) {
      if (key.startsWith(this.prefix)) {
        const originalKey = key.replace(this.prefix, '');
        data[originalKey] = this.get(originalKey);
      }
    }
    
    return {
      version: this.version,
      exportTime: new Date().toISOString(),
      data
    };
  }

  /**
   * 导入数据
   * @param {Object} importData - 导入的数据
   */
  importData(importData) {
    try {
      if (!importData.data) {
        throw new Error('无效的数据格式');
      }
      
      // 备份当前数据
      const backup = this.exportData();
      
      try {
        // 清空现有数据
        this.clear();
        
        // 导入新数据
        Object.entries(importData.data).forEach(([key, value]) => {
          this.set(key, value);
        });
        
        // 更新版本信息
        this.set('version', this.version);
        
        this.emit('dataImported', importData);
        
      } catch (error) {
        // 导入失败，恢复备份
        console.error('数据导入失败，恢复备份:', error);
        this.clear();
        Object.entries(backup.data).forEach(([key, value]) => {
          this.set(key, value);
        });
        throw error;
      }
      
    } catch (error) {
      console.error('数据导入失败:', error);
      throw new Error('数据导入失败: ' + error.message);
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

/**
 * 错题数据管理器
 */
class QuestionManager {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * 添加错题
   * @param {Object} question - 错题数据
   * @returns {string} 错题ID
   */
  addQuestion(question) {
    const questions = this.storage.get('questions', []);
    const id = this.generateId();
    
    const newQuestion = {
      id,
      ...question,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 1,
      lastReviewAt: null,
      nextReviewAt: this.calculateNextReview(new Date()),
      tags: question.tags || [],
      notes: question.notes || '',
      difficulty: question.difficulty || 'medium',
      subject: question.subject || 'unknown',
      chapter: question.chapter || '',
      source: question.source || '',
      status: 'active'
    };
    
    questions.push(newQuestion);
    this.storage.set('questions', questions);
    
    // 更新统计
    this.updateStatistics('add', newQuestion);
    
    return id;
  }

  /**
   * 更新错题
   * @param {string} id - 错题ID
   * @param {Object} updates - 更新数据
   */
  updateQuestion(id, updates) {
    const questions = this.storage.get('questions', []);
    const index = questions.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error('错题不存在');
    }
    
    const oldQuestion = { ...questions[index] };
    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.storage.set('questions', questions);
    
    // 更新统计
    this.updateStatistics('update', questions[index], oldQuestion);
  }

  /**
   * 删除错题
   * @param {string} id - 错题ID
   */
  deleteQuestion(id) {
    const questions = this.storage.get('questions', []);
    const index = questions.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error('错题不存在');
    }
    
    const deletedQuestion = questions[index];
    questions.splice(index, 1);
    this.storage.set('questions', questions);
    
    // 更新统计
    this.updateStatistics('delete', deletedQuestion);
  }

  /**
   * 获取错题
   * @param {string} id - 错题ID
   * @returns {Object|null} 错题数据
   */
  getQuestion(id) {
    const questions = this.storage.get('questions', []);
    return questions.find(q => q.id === id) || null;
  }

  /**
   * 获取错题列表
   * @param {Object} filters - 筛选条件
   * @param {Object} pagination - 分页参数
   * @returns {Object} 分页结果
   */
  getQuestions(filters = {}, pagination = { page: 1, size: 20 }) {
    let questions = this.storage.get('questions', []);
    
    // 应用筛选
    questions = this.applyFilters(questions, filters);
    
    // 排序
    if (filters.sortBy) {
      questions = this.sortQuestions(questions, filters.sortBy, filters.sortOrder);
    }
    
    // 分页
    const total = questions.length;
    const start = (pagination.page - 1) * pagination.size;
    const end = start + pagination.size;
    const data = questions.slice(start, end);
    
    return {
      data,
      total,
      page: pagination.page,
      size: pagination.size,
      totalPages: Math.ceil(total / pagination.size)
    };
  }

  /**
   * 应用筛选条件
   * @param {Array} questions - 错题列表
   * @param {Object} filters - 筛选条件
   * @returns {Array} 筛选后的错题列表
   */
  applyFilters(questions, filters) {
    return questions.filter(question => {
      // 学科筛选
      if (filters.subject && question.subject !== filters.subject) {
        return false;
      }
      
      // 难度筛选
      if (filters.difficulty && question.difficulty !== filters.difficulty) {
        return false;
      }
      
      // 状态筛选
      if (filters.status && question.status !== filters.status) {
        return false;
      }
      
      // 标签筛选
      if (filters.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => question.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      // 关键词搜索
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const searchText = [
          question.title,
          question.content,
          question.explanation,
          question.notes
        ].join(' ').toLowerCase();
        
        if (!searchText.includes(keyword)) {
          return false;
        }
      }
      
      // 日期范围筛选
      if (filters.dateRange) {
        const questionDate = new Date(question.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (questionDate < startDate || questionDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * 排序错题
   * @param {Array} questions - 错题列表
   * @param {string} sortBy - 排序字段
   * @param {string} sortOrder - 排序方向
   * @returns {Array} 排序后的错题列表
   */
  sortQuestions(questions, sortBy, sortOrder = 'desc') {
    return [...questions].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      // 处理日期字段
      if (sortBy.includes('At') || sortBy.includes('Date')) {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      // 处理数字字段
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // 处理字符串字段
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return 0;
    });
  }

  /**
   * 记录复习结果
   * @param {string} id - 错题ID
   * @param {boolean} isCorrect - 是否答对
   */
  recordReview(id, isCorrect) {
    const question = this.getQuestion(id);
    if (!question) {
      throw new Error('错题不存在');
    }
    
    const updates = {
      reviewCount: question.reviewCount + 1,
      lastReviewAt: new Date().toISOString()
    };
    
    if (isCorrect) {
      updates.correctCount = question.correctCount + 1;
      updates.nextReviewAt = this.calculateNextReview(
        new Date(), 
        question.reviewCount + 1
      ).toISOString();
      
      // 如果连续答对多次，可以标记为已掌握
      if (updates.correctCount >= 3) {
        updates.status = 'mastered';
      }
    } else {
      updates.wrongCount = question.wrongCount + 1;
      updates.nextReviewAt = this.calculateNextReview(new Date(), 0).toISOString();
      updates.status = 'active';
    }
    
    this.updateQuestion(id, updates);
  }

  /**
   * 计算下次复习时间（艾宾浩斯遗忘曲线）
   * @param {Date} baseDate - 基准日期
   * @param {number} reviewCount - 复习次数
   * @returns {Date} 下次复习时间
   */
  calculateNextReview(baseDate, reviewCount = 0) {
    const intervals = [1, 2, 4, 7, 15, 30, 60]; // 天数
    const intervalIndex = Math.min(reviewCount, intervals.length - 1);
    const days = intervals[intervalIndex];
    
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + days);
    
    return nextDate;
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 更新统计数据
   * @param {string} action - 操作类型
   * @param {Object} question - 错题数据
   * @param {Object} oldQuestion - 旧错题数据
   */
  updateStatistics(action, question, oldQuestion = null) {
    const stats = this.storage.get('statistics', {});
    
    switch (action) {
      case 'add':
        stats.totalQuestions = (stats.totalQuestions || 0) + 1;
        stats.wrongCount = (stats.wrongCount || 0) + 1;
        this.updateSubjectStats(stats, question.subject, 'add');
        this.updateDifficultyStats(stats, question.difficulty, 'add');
        break;
        
      case 'delete':
        stats.totalQuestions = Math.max((stats.totalQuestions || 0) - 1, 0);
        this.updateSubjectStats(stats, question.subject, 'delete');
        this.updateDifficultyStats(stats, question.difficulty, 'delete');
        break;
        
      case 'update':
        if (oldQuestion && oldQuestion.subject !== question.subject) {
          this.updateSubjectStats(stats, oldQuestion.subject, 'delete');
          this.updateSubjectStats(stats, question.subject, 'add');
        }
        if (oldQuestion && oldQuestion.difficulty !== question.difficulty) {
          this.updateDifficultyStats(stats, oldQuestion.difficulty, 'delete');
          this.updateDifficultyStats(stats, question.difficulty, 'add');
        }
        break;
    }
    
    this.storage.set('statistics', stats);
  }

  /**
   * 更新学科统计
   * @param {Object} stats - 统计数据
   * @param {string} subject - 学科
   * @param {string} action - 操作类型
   */
  updateSubjectStats(stats, subject, action) {
    if (!stats.subjectStats) stats.subjectStats = {};
    
    if (action === 'add') {
      stats.subjectStats[subject] = (stats.subjectStats[subject] || 0) + 1;
    } else if (action === 'delete') {
      stats.subjectStats[subject] = Math.max((stats.subjectStats[subject] || 0) - 1, 0);
    }
  }

  /**
   * 更新难度统计
   * @param {Object} stats - 统计数据
   * @param {string} difficulty - 难度
   * @param {string} action - 操作类型
   */
  updateDifficultyStats(stats, difficulty, action) {
    if (!stats.difficultyStats) stats.difficultyStats = {};
    
    if (action === 'add') {
      stats.difficultyStats[difficulty] = (stats.difficultyStats[difficulty] || 0) + 1;
    } else if (action === 'delete') {
      stats.difficultyStats[difficulty] = Math.max((stats.difficultyStats[difficulty] || 0) - 1, 0);
    }
  }
}

// 创建全局实例
const dataStorage = new DataStorage();
const questionManager = new QuestionManager(dataStorage);

// 导出到全局
window.DataStorage = dataStorage;
window.QuestionManager = questionManager;

// 兼容模块化导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DataStorage,
    QuestionManager,
    dataStorage,
    questionManager
  };
}