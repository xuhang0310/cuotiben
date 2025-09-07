/**
 * 数据管理器 - 负责应用的数据存储和管理
 */
class DataManager {
    constructor() {
        this.storageKey = 'cuotiben_data';
        this.data = this.loadData();
    }

    /**
     * 从本地存储加载数据
     * @returns {Object} 应用数据
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultData();
        } catch (error) {
            console.error('数据加载失败:', error);
            return this.getDefaultData();
        }
    }

    /**
     * 获取默认数据结构
     * @returns {Object} 默认数据
     */
    getDefaultData() {
        return {
            questions: [
                {
                    id: 'demo-1',
                    title: '二次函数的最值问题',
                    content: '已知二次函数f(x) = ax² + bx + c (a ≠ 0)，当x ∈ [-1, 2]时，函数的最大值为8，最小值为-1，且f(0) = 3，求a、b、c的值。',
                    correctAnswer: 'a = 2, b = -2, c = 3',
                    myAnswer: 'a = 1, b = -1, c = 3',
                    explanation: '首先由f(0) = 3得到c = 3。然后根据二次函数的对称轴和区间端点值来确定最值位置，建立方程组求解a和b。',
                    subject: '数学',
                    difficulty: '困难',
                    masteryLevel: 1,
                    tags: ['二次函数', '最值', '函数性质'],
                    nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    lastReviewDate: null,
                    reviewCount: 0,
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'demo-2',
                    title: '英语语法：虚拟语气',
                    content: 'If I _____ (be) you, I would study harder for the exam.',
                    correctAnswer: 'were',
                    myAnswer: 'was',
                    explanation: '在虚拟语气中，if引导的条件句表示与现在事实相反的假设时，be动词统一用were，不管主语是什么。',
                    subject: '英语',
                    difficulty: '中等',
                    masteryLevel: 2,
                    tags: ['虚拟语气', '语法', 'be动词'],
                    nextReviewDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
                    lastReviewDate: null,
                    reviewCount: 0,
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'demo-3',
                    title: '物理：牛顿第二定律',
                    content: '质量为2kg的物体在水平面上受到10N的水平拉力作用，物体与地面的摩擦系数为0.2，求物体的加速度。(g=10m/s²)',
                    correctAnswer: 'a = 3m/s²',
                    myAnswer: 'a = 5m/s²',
                    explanation: '首先计算摩擦力f = μmg = 0.2×2×10 = 4N，然后根据牛顿第二定律：F合 = ma，即10-4 = 2a，解得a = 3m/s²。',
                    subject: '物理',
                    difficulty: '简单',
                    masteryLevel: 3,
                    tags: ['牛顿定律', '摩擦力', '力学'],
                    nextReviewDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
                    lastReviewDate: null,
                    reviewCount: 1,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            subjects: ['数学', '语文', '英语', '物理', '化学'],
            difficulties: ['简单', '中等', '困难'],
            tags: [],
            settings: {
                theme: 'light',
                pageSize: 10,
                autoSave: true
            },
            statistics: {
                totalQuestions: 0,
                correctRate: 0,
                studyTime: 0
            }
        };
    }

    /**
     * 保存数据到本地存储
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('数据保存成功');
        } catch (error) {
            console.error('数据保存失败:', error);
        }
    }

    /**
     * 获取所有错题
     * @returns {Array} 错题列表
     */
    getQuestions() {
        return this.data.questions || [];
    }

    /**
     * 根据条件筛选错题
     * @param {Object} filters - 筛选条件
     * @returns {Array} 筛选后的错题列表
     */
    getFilteredQuestions(filters = {}) {
        let questions = this.getQuestions();

        // 按学科筛选
        if (filters.subject && filters.subject !== 'all') {
            questions = questions.filter(q => q.subject === filters.subject);
        }

        // 按难度筛选
        if (filters.difficulty && filters.difficulty !== 'all') {
            questions = questions.filter(q => q.difficulty === filters.difficulty);
        }

        // 按标签筛选
        if (filters.tags && filters.tags.length > 0) {
            questions = questions.filter(q => 
                filters.tags.some(tag => q.tags && q.tags.includes(tag))
            );
        }

        // 按关键词搜索
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            questions = questions.filter(q => 
                q.title.toLowerCase().includes(keyword) ||
                q.content.toLowerCase().includes(keyword)
            );
        }

        return questions;
    }

    /**
     * 添加错题
     * @param {Object} question - 错题数据
     * @returns {string} 错题ID
     */
    addQuestion(question) {
        const id = this.generateId();
        const newQuestion = {
            id,
            ...question,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.data.questions.push(newQuestion);
        this.updateStatistics();
        this.saveData();

        return id;
    }

    /**
     * 更新错题
     * @param {string} id - 错题ID
     * @param {Object} updates - 更新数据
     * @returns {boolean} 是否更新成功
     */
    updateQuestion(id, updates) {
        const index = this.data.questions.findIndex(q => q.id === id);
        if (index === -1) return false;

        this.data.questions[index] = {
            ...this.data.questions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.updateStatistics();
        this.saveData();
        return true;
    }

    /**
     * 删除错题
     * @param {string} id - 错题ID
     * @returns {boolean} 是否删除成功
     */
    deleteQuestion(id) {
        const index = this.data.questions.findIndex(q => q.id === id);
        if (index === -1) return false;

        this.data.questions.splice(index, 1);
        this.updateStatistics();
        this.saveData();
        return true;
    }

    /**
     * 根据ID获取错题
     * @param {string} id - 错题ID
     * @returns {Object|null} 错题数据
     */
    getQuestionById(id) {
        return this.data.questions.find(q => q.id === id) || null;
    }

    /**
     * 获取统计数据
     * @returns {Object} 统计信息
     */
    getStatistics() {
        return this.data.statistics;
    }

    /**
     * 更新统计数据
     */
    updateStatistics() {
        const questions = this.getQuestions();
        const totalQuestions = questions.length;
        const correctAnswers = questions.filter(q => q.isCorrect).length;
        const correctRate = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;

        this.data.statistics = {
            ...this.data.statistics,
            totalQuestions,
            correctRate: parseFloat(correctRate)
        };
    }

    /**
     * 获取学科列表
     * @returns {Array} 学科列表
     */
    getSubjects() {
        return this.data.subjects || [];
    }

    /**
     * 获取难度列表
     * @returns {Array} 难度列表
     */
    getDifficulties() {
        return this.data.difficulties || [];
    }

    /**
     * 获取标签列表
     * @returns {Array} 标签列表
     */
    getTags() {
        return this.data.tags || [];
    }

    /**
     * 添加标签
     * @param {string} tag - 标签名称
     */
    addTag(tag) {
        if (!this.data.tags.includes(tag)) {
            this.data.tags.push(tag);
            this.saveData();
        }
    }

    /**
     * 获取设置
     * @returns {Object} 设置数据
     */
    getSettings() {
        return this.data.settings;
    }

    /**
     * 更新设置
     * @param {Object} settings - 设置数据
     */
    updateSettings(settings) {
        this.data.settings = {
            ...this.data.settings,
            ...settings
        };
        this.saveData();
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 导出数据
     * @returns {string} JSON格式的数据
     */
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    /**
     * 导入数据
     * @param {string} jsonData - JSON格式的数据
     * @returns {boolean} 是否导入成功
     */
    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            this.data = { ...this.getDefaultData(), ...importedData };
            this.saveData();
            return true;
        } catch (error) {
            console.error('数据导入失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        this.data = this.getDefaultData();
        this.saveData();
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();