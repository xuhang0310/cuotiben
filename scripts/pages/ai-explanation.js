/**
 * AI讲解页面脚本
 * 处理AI智能讲解功能
 */

(function() {
  'use strict';

  /**
   * AI讲解页面控制器
   */
  class AIExplanationPageController {
    constructor() {
      this.currentQuestion = null;
      this.isGenerating = false;
      this.explanationHistory = [];
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('🤖 初始化AI讲解页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 加载题目列表
      this.loadQuestionList();
      
      // 检查URL参数
      this.checkUrlParams();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 题目选择
      const questionSelect = document.querySelector('#question-select');
      if (questionSelect) {
        questionSelect.addEventListener('change', (e) => {
          this.handleQuestionSelect(e.target.value);
        });
      }

      // 生成讲解按钮
      const generateBtn = document.querySelector('#generate-explanation-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => {
          this.generateExplanation();
        });
      }

      // 重新生成按钮
      const regenerateBtn = document.querySelector('#regenerate-btn');
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
          this.regenerateExplanation();
        });
      }

      // 保存讲解按钮
      const saveBtn = document.querySelector('#save-explanation-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.saveExplanation();
        });
      }

      // 分享按钮
      const shareBtn = document.querySelector('#share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.shareExplanation();
        });
      }

      // 语音播放按钮
      const speakBtn = document.querySelector('#speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          this.speakExplanation();
        });
      }

      // 讲解类型选择
      const explanationTypes = document.querySelectorAll('input[name="explanation-type"]');
      explanationTypes.forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.handleExplanationTypeChange(e.target.value);
        });
      });

      // 难度级别选择
      const difficultySelect = document.querySelector('#difficulty-level');
      if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
          this.handleDifficultyChange(e.target.value);
        });
      }

      // 历史记录点击
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('history-item')) {
          this.loadHistoryItem(e.target.dataset.id);
        }
      });
    }

    /**
     * 加载题目列表
     */
    async loadQuestionList() {
      try {
        console.log('📚 加载题目列表...');
        
        let questions = [];
        if (window.questionManager) {
          questions = await window.questionManager.getAllQuestions();
        } else {
          // 模拟数据
          questions = [
            { id: 1, subject: '数学', content: '求解二次方程 x² - 5x + 6 = 0', difficulty: 'medium' },
            { id: 2, subject: '物理', content: '计算自由落体运动的速度', difficulty: 'easy' },
            { id: 3, subject: '化学', content: '平衡化学方程式', difficulty: 'hard' }
          ];
        }
        
        this.renderQuestionList(questions);
        
      } catch (error) {
        console.error('❌ 加载题目列表失败:', error);
        this.showError('加载题目列表失败');
      }
    }

    /**
     * 渲染题目列表
     */
    renderQuestionList(questions) {
      const select = document.querySelector('#question-select');
      if (!select) return;

      select.innerHTML = '<option value="">请选择题目</option>';
      
      questions.forEach(question => {
        const option = document.createElement('option');
        option.value = question.id;
        option.textContent = `[${question.subject}] ${question.content.substring(0, 50)}${question.content.length > 50 ? '...' : ''}`;
        select.appendChild(option);
      });
    }

    /**
     * 检查URL参数
     */
    checkUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const questionId = urlParams.get('questionId');
      
      if (questionId) {
        const select = document.querySelector('#question-select');
        if (select) {
          select.value = questionId;
          this.handleQuestionSelect(questionId);
        }
      }
    }

    /**
     * 处理题目选择
     */
    async handleQuestionSelect(questionId) {
      if (!questionId) {
        this.clearQuestion();
        return;
      }

      try {
        console.log('📖 选择题目:', questionId);
        
        let question = null;
        if (window.questionManager) {
          question = await window.questionManager.getQuestion(questionId);
        } else {
          // 模拟数据
          question = {
            id: questionId,
            subject: '数学',
            content: '求解二次方程 x² - 5x + 6 = 0',
            answer: 'x = 2 或 x = 3',
            difficulty: 'medium',
            tags: ['二次方程', '因式分解'],
            explanation: '这是一个标准的二次方程求解问题...'
          };
        }
        
        this.currentQuestion = question;
        this.renderQuestion(question);
        this.loadExplanationHistory(questionId);
        
      } catch (error) {
        console.error('❌ 加载题目失败:', error);
        this.showError('加载题目失败');
      }
    }

    /**
     * 渲染题目
     */
    renderQuestion(question) {
      const container = document.querySelector('.question-display');
      if (!container) return;

      container.innerHTML = `
        <div class="question-header">
          <div class="question-meta">
            <span class="question-subject">${question.subject}</span>
            <span class="question-difficulty difficulty-${question.difficulty}">${this.getDifficultyText(question.difficulty)}</span>
          </div>
          <div class="question-tags">
            ${question.tags ? question.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
          </div>
        </div>
        
        <div class="question-content">
          <h3>题目内容</h3>
          <div class="question-text">${question.content}</div>
        </div>
        
        <div class="question-answer">
          <h3>参考答案</h3>
          <div class="answer-text">${question.answer || '暂无答案'}</div>
        </div>
        
        ${question.explanation ? `
          <div class="question-original-explanation">
            <h3>原始解析</h3>
            <div class="explanation-text">${question.explanation}</div>
          </div>
        ` : ''}
      `;

      // 启用生成按钮
      const generateBtn = document.querySelector('#generate-explanation-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
      }
    }

    /**
     * 清空题目显示
     */
    clearQuestion() {
      const container = document.querySelector('.question-display');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="icon-book"></i>
            <p>请选择一个题目开始AI讲解</p>
          </div>
        `;
      }

      const generateBtn = document.querySelector('#generate-explanation-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
      }

      this.clearExplanation();
    }

    /**
     * 生成AI讲解
     */
    async generateExplanation() {
      if (!this.currentQuestion || this.isGenerating) {
        return;
      }

      try {
        console.log('🤖 生成AI讲解...');
        
        this.isGenerating = true;
        this.showGeneratingState();
        
        // 获取讲解参数
        const explanationType = document.querySelector('input[name="explanation-type"]:checked')?.value || 'detailed';
        const difficultyLevel = document.querySelector('#difficulty-level')?.value || 'medium';
        
        // 调用AI服务
        const explanation = await this.callAIService({
          question: this.currentQuestion,
          type: explanationType,
          difficulty: difficultyLevel
        });
        
        // 渲染讲解结果
        this.renderExplanation(explanation);
        
        // 保存到历史记录
        this.addToHistory(explanation);
        
        console.log('✅ AI讲解生成完成');
        
      } catch (error) {
        console.error('❌ 生成AI讲解失败:', error);
        this.showError('生成讲解失败，请稍后重试');
      } finally {
        this.isGenerating = false;
        this.hideGeneratingState();
      }
    }

    /**
     * 调用AI服务
     */
    async callAIService(params) {
      // 模拟AI服务调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const explanations = {
        detailed: {
          title: '详细解析',
          content: `
            <h4>解题思路</h4>
            <p>这是一个标准的一元二次方程，我们可以使用多种方法来求解。</p>
            
            <h4>方法一：因式分解法</h4>
            <ol>
              <li>观察方程 x² - 5x + 6 = 0</li>
              <li>寻找两个数，它们的乘积为6，和为5</li>
              <li>这两个数是2和3，因为 2 × 3 = 6，2 + 3 = 5</li>
              <li>所以方程可以分解为：(x - 2)(x - 3) = 0</li>
              <li>根据零乘积性质：x - 2 = 0 或 x - 3 = 0</li>
              <li>因此：x = 2 或 x = 3</li>
            </ol>
            
            <h4>方法二：求根公式</h4>
            <p>对于一般形式 ax² + bx + c = 0，其中 a = 1, b = -5, c = 6</p>
            <p>使用求根公式：x = (-b ± √(b² - 4ac)) / 2a</p>
            <p>代入得：x = (5 ± √(25 - 24)) / 2 = (5 ± 1) / 2</p>
            <p>所以：x = 3 或 x = 2</p>
            
            <h4>验证</h4>
            <p>将 x = 2 代入：2² - 5×2 + 6 = 4 - 10 + 6 = 0 ✓</p>
            <p>将 x = 3 代入：3² - 5×3 + 6 = 9 - 15 + 6 = 0 ✓</p>
          `,
          steps: [
            '识别方程类型',
            '选择合适的解法',
            '执行计算步骤',
            '验证答案正确性'
          ],
          tips: [
            '因式分解法适用于系数较小的情况',
            '求根公式是通用方法',
            '记得验证答案'
          ]
        },
        simple: {
          title: '简化解析',
          content: `
            <p>这是一个二次方程，我们用因式分解来解：</p>
            <p>x² - 5x + 6 = 0</p>
            <p>分解为：(x - 2)(x - 3) = 0</p>
            <p>所以：x = 2 或 x = 3</p>
          `,
          steps: ['分解因式', '求解'],
          tips: ['找到乘积为6，和为5的两个数']
        },
        stepwise: {
          title: '分步解析',
          content: `
            <div class="step-by-step">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h5>识别方程类型</h5>
                  <p>x² - 5x + 6 = 0 是一元二次方程</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h5>选择解法</h5>
                  <p>使用因式分解法，寻找两个数使得乘积为6，和为5</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h5>分解因式</h5>
                  <p>2 × 3 = 6，2 + 3 = 5，所以 (x - 2)(x - 3) = 0</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">4</div>
                <div class="step-content">
                  <h5>求解</h5>
                  <p>x - 2 = 0 或 x - 3 = 0，得到 x = 2 或 x = 3</p>
                </div>
              </div>
            </div>
          `,
          steps: ['识别', '选择', '分解', '求解'],
          tips: ['每一步都要仔细计算']
        }
      };
      
      return explanations[params.type] || explanations.detailed;
    }

    /**
     * 渲染讲解结果
     */
    renderExplanation(explanation) {
      const container = document.querySelector('.explanation-result');
      if (!container) return;

      container.innerHTML = `
        <div class="explanation-header">
          <h3>${explanation.title}</h3>
          <div class="explanation-actions">
            <button id="regenerate-btn" class="btn btn-secondary">
              <i class="icon-refresh"></i> 重新生成
            </button>
            <button id="save-explanation-btn" class="btn btn-primary">
              <i class="icon-save"></i> 保存
            </button>
            <button id="share-btn" class="btn btn-secondary">
              <i class="icon-share"></i> 分享
            </button>
            <button id="speak-btn" class="btn btn-secondary">
              <i class="icon-volume-2"></i> 朗读
            </button>
          </div>
        </div>
        
        <div class="explanation-content">
          ${explanation.content}
        </div>
        
        ${explanation.steps ? `
          <div class="explanation-steps">
            <h4>解题步骤</h4>
            <ol>
              ${explanation.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        ${explanation.tips ? `
          <div class="explanation-tips">
            <h4>解题技巧</h4>
            <ul>
              ${explanation.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="explanation-footer">
          <div class="explanation-meta">
            <span class="generation-time">生成时间: ${new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>
      `;

      // 重新绑定按钮事件
      this.bindExplanationEvents();
    }

    /**
     * 绑定讲解相关事件
     */
    bindExplanationEvents() {
      const regenerateBtn = document.querySelector('#regenerate-btn');
      if (regenerateBtn) {
        regenerateBtn.addEventListener('click', () => {
          this.regenerateExplanation();
        });
      }

      const saveBtn = document.querySelector('#save-explanation-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.saveExplanation();
        });
      }

      const shareBtn = document.querySelector('#share-btn');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.shareExplanation();
        });
      }

      const speakBtn = document.querySelector('#speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => {
          this.speakExplanation();
        });
      }
    }

    /**
     * 重新生成讲解
     */
    regenerateExplanation() {
      console.log('🔄 重新生成讲解');
      this.generateExplanation();
    }

    /**
     * 保存讲解
     */
    async saveExplanation() {
      try {
        console.log('💾 保存讲解');
        
        const explanationContent = document.querySelector('.explanation-result').innerHTML;
        
        if (window.questionManager) {
          await window.questionManager.saveExplanation(this.currentQuestion.id, explanationContent);
        }
        
        this.showNotification('讲解已保存', 'success');
        
      } catch (error) {
        console.error('❌ 保存讲解失败:', error);
        this.showError('保存失败');
      }
    }

    /**
     * 分享讲解
     */
    shareExplanation() {
      console.log('📤 分享讲解');
      
      const shareData = {
        title: `AI讲解 - ${this.currentQuestion.subject}`,
        text: this.currentQuestion.content,
        url: `${window.location.origin}${window.location.pathname}?questionId=${this.currentQuestion.id}`
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(shareData.url).then(() => {
          this.showNotification('链接已复制到剪贴板', 'success');
        });
      }
    }

    /**
     * 语音播放讲解
     */
    speakExplanation() {
      console.log('🔊 语音播放讲解');
      
      if ('speechSynthesis' in window) {
        const text = document.querySelector('.explanation-content').textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        
        speechSynthesis.speak(utterance);
        
        this.showNotification('开始语音播放', 'info');
      } else {
        this.showError('浏览器不支持语音播放');
      }
    }

    /**
     * 处理讲解类型变化
     */
    handleExplanationTypeChange(type) {
      console.log('📝 讲解类型变化:', type);
      this.currentExplanationType = type;
    }

    /**
     * 处理难度变化
     */
    handleDifficultyChange(difficulty) {
      console.log('📊 难度变化:', difficulty);
      this.currentDifficulty = difficulty;
    }

    /**
     * 加载讲解历史
     */
    async loadExplanationHistory(questionId) {
      try {
        console.log('📚 加载讲解历史');
        
        let history = [];
        if (window.questionManager) {
          history = await window.questionManager.getExplanationHistory(questionId);
        }
        
        this.renderHistory(history);
        
      } catch (error) {
        console.error('❌ 加载历史失败:', error);
      }
    }

    /**
     * 渲染历史记录
     */
    renderHistory(history) {
      const container = document.querySelector('.explanation-history');
      if (!container) return;

      if (!history || history.length === 0) {
        container.innerHTML = `
          <div class="history-empty">
            <i class="icon-clock"></i>
            <p>暂无历史记录</p>
          </div>
        `;
        return;
      }

      const html = history.map(item => `
        <div class="history-item" data-id="${item.id}">
          <div class="history-title">${item.title}</div>
          <div class="history-time">${new Date(item.createdAt).toLocaleString('zh-CN')}</div>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="section-title">历史记录</div>
        <div class="history-list">${html}</div>
      `;
    }

    /**
     * 加载历史记录项
     */
    loadHistoryItem(id) {
      console.log('📖 加载历史记录:', id);
      // 实现历史记录加载逻辑
    }

    /**
     * 添加到历史记录
     */
    addToHistory(explanation) {
      const historyItem = {
        id: Date.now(),
        questionId: this.currentQuestion.id,
        title: explanation.title,
        content: explanation.content,
        createdAt: new Date().toISOString()
      };
      
      this.explanationHistory.unshift(historyItem);
      
      // 限制历史记录数量
      if (this.explanationHistory.length > 10) {
        this.explanationHistory = this.explanationHistory.slice(0, 10);
      }
      
      this.renderHistory(this.explanationHistory);
    }

    /**
     * 清空讲解显示
     */
    clearExplanation() {
      const container = document.querySelector('.explanation-result');
      if (container) {
        container.innerHTML = `
          <div class="explanation-empty">
            <i class="icon-message-circle"></i>
            <p>点击生成按钮开始AI讲解</p>
          </div>
        `;
      }
    }

    /**
     * 显示生成中状态
     */
    showGeneratingState() {
      const container = document.querySelector('.explanation-result');
      if (container) {
        container.innerHTML = `
          <div class="generating-state">
            <div class="loading-spinner"></div>
            <p>AI正在生成讲解，请稍候...</p>
          </div>
        `;
      }

      const generateBtn = document.querySelector('#generate-explanation-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="icon-loader"></i> 生成中...';
      }
    }

    /**
     * 隐藏生成中状态
     */
    hideGeneratingState() {
      const generateBtn = document.querySelector('#generate-explanation-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="icon-zap"></i> 生成讲解';
      }
    }

    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
      const difficultyMap = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
      };
      return difficultyMap[difficulty] || difficulty;
    }

    // UI 方法
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
      new AIExplanationPageController();
    });
  } else {
    new AIExplanationPageController();
  }

  // 导出到全局
  window.AIExplanationPageController = AIExplanationPageController;

})();