// Pad端错题本应用 - Ant Design风格
// Mock数据系统 + 完整交互逻辑

// 全局数据管理
class DataManager {
    constructor() {
        this.mockData = this.initializeMockData();
        this.currentPage = 'questions';
        this.filters = {
            subject: 'all',
            difficulty: 'all',
            mastery: 'all',
            chapter: 'all'
        };
        this.currentUser = {
            id: 1,
            name: '张同学',
            avatar: 'https://placehold.co/32x32?text=张',
            grade: '高二',
            totalQuestions: 247,
            masteredQuestions: 189,
            pendingReview: 58
        };
    }

    initializeMockData() {
        // 学科映射
        const subjects = ['math', 'chinese', 'english', 'physics'];
        const subjectNames = {
            'math': '数学',
            'chinese': '语文', 
            'english': '英语',
            'physics': '物理'
        };

        // 难度映射
        const difficulties = ['easy', 'medium', 'hard'];
        const difficultyNames = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };

        // 生成错题数据
        const questions = [];
        for (let i = 1; i <= 50; i++) {
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            const masteryLevel = Math.floor(Math.random() * 5) + 1;
            const reviewCount = Math.floor(Math.random() * 8);
            const clusterId = Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : null;
            
            // 艾宾浩斯复习状态
            const daysFromToday = Math.floor(Math.random() * 21) - 10; // -10到+10天
            const isOverdue = daysFromToday < 0;
            const reviewStatus = isOverdue ? 'overdue' : (daysFromToday === 0 ? 'today' : 'upcoming');
            
            questions.push({
                id: i,
                title: this.generateQuestionTitle(subject),
                subject: subject,
                subjectName: subjectNames[subject],
                chapter: `第${Math.floor(Math.random() * 10) + 1}章`,
                difficulty: difficulty,
                difficultyName: difficultyNames[difficulty],
                masteryLevel: masteryLevel,
                reviewCount: reviewCount,
                clusterId: clusterId,
                clusterSize: clusterId ? Math.floor(Math.random() * 5) + 2 : 1,
                addDate: this.generateRandomDate(-60, -1),
                lastReviewDate: reviewCount > 0 ? this.generateRandomDate(-30, -1) : null,
                nextReviewDate: this.generateRandomDate(daysFromToday, daysFromToday),
                reviewStatus: reviewStatus,
                ebbinghausDays: daysFromToday,
                imageUrl: `https://placehold.co/300x200?text=${subjectNames[subject]}题目${i}`,
                tags: this.generateTags(subject),
                errorAnalysis: this.generateErrorAnalysis(subject),
                correctSolution: this.generateCorrectSolution(subject),
                aiExplanation: this.generateAIExplanation(subject)
            });
        }

        // 生成复习计划数据
        const reviewPlans = [];
        const urgentCount = questions.filter(q => q.reviewStatus === 'overdue').length;
        const todayCount = questions.filter(q => q.reviewStatus === 'today').length;
        
        for (let i = 0; i < 15; i++) {
            const question = questions[Math.floor(Math.random() * questions.length)];
            const dayOffset = Math.floor(Math.random() * 10) - 3; // -3到+7天
            const isOverdue = dayOffset < 0;
            const isToday = dayOffset === 0;
            
            reviewPlans.push({
                id: i + 1,
                questionId: question.id,
                questionTitle: question.title,
                subject: question.subject,
                subjectName: question.subjectName,
                reviewDate: this.generateRandomDate(dayOffset, dayOffset),
                status: isOverdue ? 'overdue' : (isToday ? 'today' : 'upcoming'),
                daysOffset: dayOffset,
                completed: Math.random() > 0.7
            });
        }

        // 生成统计数据
        const statistics = {
            overview: {
                totalQuestions: 247,
                mastered: 189,
                pending: 58,
                masteryRate: 76.5,
                weeklyGrowth: 12.5,
                masteredGrowth: 8.3,
                pendingGrowth: -5.2,
                masteryGrowth: 3.8
            },
            subjectDistribution: [
                { subject: 'math', name: '数学', count: 86, percentage: 35 },
                { subject: 'chinese', name: '语文', count: 69, percentage: 28 },
                { subject: 'english', name: '英语', count: 54, percentage: 22 },
                { subject: 'physics', name: '物理', count: 38, percentage: 15 }
            ],
            difficultyDistribution: [
                { difficulty: 'easy', name: '简单', count: 45, percentage: 18 },
                { difficulty: 'medium', name: '中等', count: 132, percentage: 53 },
                { difficulty: 'hard', name: '困难', count: 70, percentage: 28 }
            ],
            masteryTrend: this.generateMasteryTrendData(),
            activityHeatmap: this.generateActivityHeatmapData(),
            subjectDetails: [
                { subject: 'math', name: '数学', total: 86, mastered: 65, pending: 21, rate: 75.6, avgReviews: 3.2, weeklyNew: 5 },
                { subject: 'chinese', name: '语文', total: 69, mastered: 58, pending: 11, rate: 84.1, avgReviews: 2.8, weeklyNew: 3 },
                { subject: 'english', name: '英语', total: 54, mastered: 38, pending: 16, rate: 70.4, avgReviews: 3.5, weeklyNew: 7 },
                { subject: 'physics', name: '物理', total: 38, mastered: 28, pending: 10, rate: 73.7, avgReviews: 2.9, weeklyNew: 2 }
            ]
        };

        // 生成AI对话数据
        const aiMessages = [
            {
                id: 1,
                type: 'ai',
                content: '你好！我是你的AI学习助手，可以帮你：\n• 📝 错题知识点分析\n• 💡 解题思路指导\n• 📚 相关知识点推荐\n• 🎯 学习计划建议\n\n请选择一道错题或直接向我提问吧！',
                timestamp: new Date(Date.now() - 3600000),
                suggestions: ['📺 观看视频讲解', '📝 查看相似题目', '📖 复习相关知识点']
            },
            {
                id: 2,
                type: 'user',
                content: '这道函数题我不太明白，能帮我分析一下吗？',
                timestamp: new Date(Date.now() - 1800000)
            },
            {
                id: 3,
                type: 'ai',
                content: '当然可以！这是一道复合函数求导题。让我为你详细分析：\n\n🔍 **题目分析**\n这道题考查的是复合函数的求导法则（链式法则）\n\n📋 **解题步骤**\n1. 识别内外层函数\n2. 分别求导\n3. 应用链式法则\n4. 化简结果',
                timestamp: new Date(Date.now() - 900000),
                analysisCards: [
                    { title: '🔍 题目分析', content: '这道题考查的是复合函数的求导法则（链式法则）' },
                    { title: '📋 解题步骤', content: '1. 识别内外层函数\n2. 分别求导\n3. 应用链式法则\n4. 化简结果' }
                ]
            }
        ];

        return {
            questions,
            reviewPlans,
            statistics,
            aiMessages,
            clusters: this.generateClusterData(questions)
        };
    }

    generateQuestionTitle(subject) {
        const titles = {
            'math': ['函数复合求导', '几何证明', '三角函数', '概率统计', '数列极限', '不等式证明', '向量运算', '导数应用'],
            'chinese': ['古诗词理解', '阅读理解', '文言文翻译', '作文立意', '语法分析', '修辞手法', '字音字形', '成语运用'],
            'english': ['语法时态', '阅读理解', '完形填空', '词汇辨析', '句型转换', '听力理解', '写作表达', '语音语调'],
            'physics': ['力学分析', '电磁感应', '波动光学', '热力学', '原子物理', '动量守恒', '能量转换', '电路分析']
        };
        const subjectTitles = titles[subject] || ['基础题目'];
        return subjectTitles[Math.floor(Math.random() * subjectTitles.length)];
    }

    generateRandomDate(minDays, maxDays) {
        const now = new Date();
        const days = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
        return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    generateTags(subject) {
        const tagsBySubject = {
            'math': ['函数', '导数', '几何', '代数', '概率', '统计'],
            'chinese': ['古诗词', '文言文', '现代文', '作文', '语法', '修辞'],
            'english': ['语法', '词汇', '阅读', '写作', '听力', '口语'],
            'physics': ['力学', '电学', '光学', '热学', '原子', '波动']
        };
        const availableTags = tagsBySubject[subject] || ['基础'];
        const numTags = Math.floor(Math.random() * 3) + 1;
        return availableTags.slice(0, numTags);
    }

    generateErrorAnalysis(subject) {
        const analyses = {
            'math': '对函数概念理解不清晰，没有掌握复合函数的求导法则。',
            'chinese': '对古诗词意境理解不够深入，缺乏文学素养积累。',
            'english': '对语法时态概念混淆，需要系统复习语法规则。',
            'physics': '对物理概念理解不透彻，缺乏实际应用能力。'
        };
        return analyses[subject] || '需要加强基础知识的理解和掌握。';
    }

    generateCorrectSolution(subject) {
        const solutions = {
            'math': '首先识别复合函数结构，然后应用链式法则进行求导。',
            'chinese': '需要结合诗词背景和作者情感，深入分析诗词意境。',
            'english': '系统梳理时态规则，通过大量练习巩固语法概念。',
            'physics': '建立物理模型，结合公式进行定量分析计算。'
        };
        return solutions[subject] || '按照标准解题步骤逐步分析解答。';
    }

    generateAIExplanation(subject) {
        const explanations = {
            'math': '这道题考查复合函数求导，需要先分析函数的复合结构，再应用相应的求导法则...',
            'chinese': '这首诗表达了诗人的思乡之情，通过景物描写来抒发内心感受...',
            'english': '这道语法题考查一般过去时态，需要注意时间状语的提示...',
            'physics': '这道题考查牛顿第二定律的应用，需要正确分析受力情况...'
        };
        return explanations[subject] || 'AI正在为您生成详细解析...';
    }

    generateMasteryTrendData() {
        const data = [];
        for (let i = 0; i < 8; i++) {
            data.push({
                week: `第${i + 1}周`,
                mastery: Math.floor(Math.random() * 20) + 60
            });
        }
        return data;
    }

    generateActivityHeatmapData() {
        const data = [];
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            data.push({
                date: date,
                count: Math.floor(Math.random() * 8),
                level: Math.floor(Math.random() * 5)
            });
        }
        return data;
    }

    generateClusterData(questions) {
        const clusters = [];
        const clusteredQuestions = questions.filter(q => q.clusterId);
        const clusterIds = [...new Set(clusteredQuestions.map(q => q.clusterId))];
        
        clusterIds.forEach(id => {
            const clusterQuestions = clusteredQuestions.filter(q => q.clusterId === id);
            clusters.push({
                id: id,
                name: `${clusterQuestions[0].subjectName}相似题簇${id}`,
                questions: clusterQuestions,
                similarity: Math.random() * 0.3 + 0.7,
                subject: clusterQuestions[0].subject
            });
        });
        
        return clusters;
    }

    // 数据过滤方法
    getFilteredQuestions() {
        let filtered = this.mockData.questions;
        
        if (this.filters.subject !== 'all') {
            filtered = filtered.filter(q => q.subject === this.filters.subject);
        }
        if (this.filters.difficulty !== 'all') {
            filtered = filtered.filter(q => q.difficulty === this.filters.difficulty);
        }
        if (this.filters.mastery !== 'all') {
            if (this.filters.mastery === 'need-review') {
                filtered = filtered.filter(q => q.masteryLevel < 4);
            } else if (this.filters.mastery === 'mastered') {
                filtered = filtered.filter(q => q.masteryLevel >= 4);
            }
        }
        
        return filtered;
    }

    // 搜索方法
    searchQuestions(keyword) {
        if (!keyword.trim()) return this.getFilteredQuestions();
        
        const lowerKeyword = keyword.toLowerCase().trim();
        return this.getFilteredQuestions().filter(q => 
            q.title.toLowerCase().includes(lowerKeyword) ||
            q.subjectName.includes(lowerKeyword) ||
            q.tags.some(tag => tag.includes(lowerKeyword))
        );
    }
}

// UI渲染管理器
class UIRenderer {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    renderQuestionCards(questions = null) {
        const questionsToRender = questions || this.dataManager.getFilteredQuestions();
        const grid = document.querySelector('.questions-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        questionsToRender.forEach(question => {
            const card = this.createQuestionCard(question);
            grid.appendChild(card);
        });
    }

    createQuestionCard(question) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.setAttribute('data-id', question.id);
        
        const ebbinghausText = question.ebbinghausDays < 0 ? `D${question.ebbinghausDays}` : `D+${question.ebbinghausDays}`;
        const ebbinghausClass = question.reviewStatus === 'overdue' ? 'overdue' : (question.reviewStatus === 'today' ? 'today' : '');
        
        card.innerHTML = `
            <div class="card-badges">
                <span class="ebbinghaus-badge ${ebbinghausClass}" title="艾宾浩斯复习状态">${ebbinghausText}</span>
                ${question.clusterId ? `<span class="cluster-badge" title="重复题簇">🔗${question.clusterSize}</span>` : ''}
            </div>
            <div class="card-header">
                <span class="question-id">题号: ${String(question.id).padStart(3, '0')}</span>
                <span class="update-time">${question.addDate.toLocaleDateString()}</span>
            </div>
            <div class="card-image">
                <img src="${question.imageUrl}" alt="错题图片" loading="lazy">
            </div>
            <div class="card-content">
                <div class="question-title">${question.title}</div>
                <div class="card-tags">
                    <span class="tag subject-tag ${question.subject}">${question.subjectName}</span>
                    ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    <span class="tag difficulty-tag ${question.difficulty}">${question.difficultyName}</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="mastery-stars">
                    ${this.renderStars(question.masteryLevel)}
                </div>
                <div class="review-count">复习${question.reviewCount}次</div>
            </div>
        `;
        
        return card;
    }

    renderStars(level) {
        return Array.from({ length: 5 }, (_, i) => 
            `<span class="star ${i < level ? 'active' : ''}" data-rating="${i + 1}">★</span>`
        ).join('');
    }

    renderReviewPlan() {
        const plans = this.dataManager.mockData.reviewPlans;
        const container = document.querySelector('.plan-items');
        if (!container) return;

        const urgentPlans = plans.filter(p => p.status === 'overdue');
        const todayPlans = plans.filter(p => p.status === 'today');
        const upcomingPlans = plans.filter(p => p.status === 'upcoming');

        container.innerHTML = '';

        // 渲染逾期计划
        urgentPlans.forEach(plan => {
            container.appendChild(this.createPlanItem(plan, 'urgent'));
        });

        // 渲染今日计划
        todayPlans.forEach(plan => {
            container.appendChild(this.createPlanItem(plan, 'today'));
        });

        // 渲染即将到来的计划
        upcomingPlans.slice(0, 5).forEach(plan => {
            container.appendChild(this.createPlanItem(plan, 'upcoming'));
        });
    }

    createPlanItem(plan, type) {
        const item = document.createElement('div');
        item.className = `plan-item ${type}`;
        
        item.innerHTML = `
            <div class="plan-info">
                <div class="plan-subject">${plan.subjectName}</div>
                <div class="plan-title">${plan.questionTitle}</div>
                <div class="plan-date">${plan.reviewDate.toLocaleDateString()}</div>
            </div>
            <div class="plan-actions">
                <button class="ant-btn ant-btn-default">跳过</button>
                <button class="ant-btn ant-btn-primary">开始复习</button>
            </div>
        `;
        
        return item;
    }

    renderStatistics() {
        const stats = this.dataManager.mockData.statistics;
        const overviewCards = document.querySelectorAll('.stat-card');
        
        if (overviewCards.length >= 4) {
            overviewCards[0].querySelector('.stat-value').textContent = stats.overview.totalQuestions;
            overviewCards[1].querySelector('.stat-value').textContent = stats.overview.mastered;
            overviewCards[2].querySelector('.stat-value').textContent = stats.overview.pending;
            overviewCards[3].querySelector('.stat-value').textContent = `${stats.overview.masteryRate}%`;
        }
    }

    renderAIDialog() {
        const messages = this.dataManager.mockData.aiMessages;
        const chatContainer = document.querySelector('.chat-messages');
        if (!chatContainer) return;

        chatContainer.innerHTML = '';

        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            chatContainer.appendChild(messageElement);
        });

        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;

        if (message.type === 'ai') {
            messageDiv.innerHTML = `
                <div class="avatar ai-avatar">🤖</div>
                <div class="message-content">
                    <p>${message.content.replace(/\n/g, '<br>')}</p>
                    ${message.analysisCards ? message.analysisCards.map(card => `
                        <div class="analysis-card">
                            <h4>${card.title}</h4>
                            <p>${card.content}</p>
                        </div>
                    `).join('') : ''}
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="avatar user-avatar">张</div>
                <div class="message-content">
                    <p>${message.content}</p>
                </div>
            `;
        }

        return messageDiv;
    }
}

// 应用主控制器
class AppController {
    constructor() {
        this.dataManager = new DataManager();
        this.uiRenderer = new UIRenderer(this.dataManager);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderInitialData();
        this.setupPageNavigation();
        this.setupFilterSidebar();
    }

    setupEventListeners() {
        // 页面导航
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = item.dataset.page;
                this.switchPage(targetPage);
                this.updateActiveNav(item);
            });
        });

        // 筛选按钮
        const openFilterBtn = document.getElementById('openFilter');
        const closeFilterBtn = document.getElementById('closeFilter');
        const overlay = document.getElementById('overlay');

        if (openFilterBtn) {
            openFilterBtn.addEventListener('click', () => {
                this.openFilterSidebar();
            });
        }

        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', () => {
                this.closeFilterSidebar();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeFilterSidebar();
            });
        }

        // 用户下拉菜单
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }

        // 搜索功能
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value;
                const filteredQuestions = this.dataManager.searchQuestions(keyword);
                this.uiRenderer.renderQuestionCards(filteredQuestions);
            });
        }

        // 视图切换
        document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                this.switchView(view);
                this.updateActiveView(btn);
            });
        });

        // 错题卡片点击事件
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.question-card');
            if (card) {
                const questionId = card.dataset.id;
                this.showQuestionDetail(questionId);
            }
        });

        // AI聊天发送按钮
        const sendBtn = document.querySelector('.send-btn');
        const chatInput = document.querySelector('.chat-input-field');
        
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                this.sendAIMessage(chatInput.value);
                chatInput.value = '';
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage(chatInput.value);
                    chatInput.value = '';
                }
            });
        }
    }

    renderInitialData() {
        // 渲染错题卡片
        this.uiRenderer.renderQuestionCards();
        
        // 渲染统计数据
        this.uiRenderer.renderStatistics();
        
        // 渲染AI对话
        this.uiRenderer.renderAIDialog();
    }

    setupPageNavigation() {
        // 默认显示错题列表页面
        this.switchPage('questions');
    }

    setupFilterSidebar() {
        // 筛选器应用按钮
        const applyBtn = document.querySelector('.filter-actions .ant-btn-primary');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyFilters();
                this.closeFilterSidebar();
            });
        }

        // 筛选器重置按钮
        const resetBtn = document.querySelector('.filter-actions .ant-btn-default');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    switchPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.ant-page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;

            // 根据页面类型执行特定逻辑
            this.handlePageSpecificActions(pageId);
        }
    }

    updateActiveNav(activeItem) {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    handlePageSpecificActions(pageId) {
        switch(pageId) {
            case 'questions':
                this.uiRenderer.renderQuestionCards();
                break;
            case 'dashboard':
                this.uiRenderer.renderStatistics();
                break;
            case 'ai-explanation':
                this.uiRenderer.renderAIDialog();
                break;
        }
    }

    switchView(view) {
        const grid = document.querySelector('.questions-grid');
        if (!grid) return;

        if (view === 'list') {
            grid.classList.remove('questions-grid');
            grid.classList.add('questions-list');
        } else {
            grid.classList.remove('questions-list');
            grid.classList.add('questions-grid');
        }
    }

    updateActiveView(activeBtn) {
        document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    openFilterSidebar() {
        const sider = document.getElementById('filterSider');
        const overlay = document.getElementById('overlay');
        
        if (sider && overlay) {
            sider.classList.add('open');
            overlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    closeFilterSidebar() {
        const sider = document.getElementById('filterSider');
        const overlay = document.getElementById('overlay');
        
        if (sider && overlay) {
            sider.classList.remove('open');
            overlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    applyFilters() {
        // 获取筛选条件
        const subjectCheckboxes = document.querySelectorAll('input[name="subject"]:checked');
        const difficultyCheckboxes = document.querySelectorAll('input[name="difficulty"]:checked');
        const masteryCheckboxes = document.querySelectorAll('input[name="mastery"]:checked');

        // 更新数据管理器中的筛选条件
        if (subjectCheckboxes.length > 0) {
            this.dataManager.filters.subject = subjectCheckboxes[0].value;
        }

        if (difficultyCheckboxes.length > 0) {
            this.dataManager.filters.difficulty = difficultyCheckboxes[0].value;
        }

        if (masteryCheckboxes.length > 0) {
            this.dataManager.filters.mastery = masteryCheckboxes[0].value;
        }

        // 重新渲染错题卡片
        this.uiRenderer.renderQuestionCards();
    }

    resetFilters() {
        // 重置筛选条件
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.value === 'all') {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });

        // 重置数据管理器中的筛选条件
        this.dataManager.filters = {
            subject: 'all',
            difficulty: 'all',
            mastery: 'all',
            chapter: 'all'
        };

        // 重新渲染错题卡片
        this.uiRenderer.renderQuestionCards();
    }

    showQuestionDetail(questionId) {
        // 这里可以实现显示错题详情的逻辑
        console.log('显示错题详情:', questionId);
        
        // 示例：显示一个简单的模态框
        alert(`显示错题 ${questionId} 的详情`);
    }

    sendAIMessage(content) {
        if (!content.trim()) return;

        const chatContainer = document.querySelector('.chat-messages');
        if (!chatContainer) return;

        // 添加用户消息
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: content
        };

        const messageElement = this.uiRenderer.createMessageElement(userMessage);
        chatContainer.appendChild(messageElement);

        // 模拟AI回复
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                content: '感谢您的提问！我会尽快为您提供详细的解答。'
            };

            const aiMessageElement = this.uiRenderer.createMessageElement(aiResponse);
            chatContainer.appendChild(aiMessageElement);

            // 滚动到底部
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);

        // 滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});

// 工具函数
function formatDate(date) {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}