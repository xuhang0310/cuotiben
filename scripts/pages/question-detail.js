/**
 * 题目详情页面脚本
 * 处理单个题目的详细显示和编辑功能
 */

(function() {
  'use strict';

  /**
   * 题目详情页面控制器
   */
  class QuestionDetailPageController {
    constructor() {
      this.currentQuestion = null;
      this.isEditing = false;
      this.originalData = null;
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('📖 初始化题目详情页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 检查URL参数
      this.checkUrlParams();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 编辑按钮
      const editBtn = document.querySelector('#edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.toggleEditMode();
        });
      }

      // 保存按钮
      const saveBtn = document.querySelector('#save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.saveQuestion();
        });
      }

      // 取消按钮
      const cancelBtn = document.querySelector('#cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          this.cancelEdit();
        });
      }

      // 删除按钮
      const deleteBtn = document.querySelector('#delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteQuestion();
        });
      }

      // 练习按钮
      const practiceBtn = document.querySelector('#practice-btn');
      if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
          this.startPractice();
        });
      }

      // AI讲解按钮
      const aiExplainBtn = document.querySelector('#ai-explain-btn');
      if (aiExplainBtn) {
        aiExplainBtn.addEventListener('click', () => {
          this.openAIExplanation();
        });
      }

      // 标签编辑
      const addTagBtn = document.querySelector('#add-tag-btn');
      if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
          this.addTag();
        });
      }

      // 难度选择
      const difficultySelect = document.querySelector('#difficulty-select');
      if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
          this.updateDifficulty(e.target.value);
        });
      }

      // 状态选择
      const statusSelect = document.querySelector('#status-select');
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          this.updateStatus(e.target.value);
        });
      }

      // 图片上传
      const imageUpload = document.querySelector('#image-upload');
      if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
          this.handleImageUpload(e.target.files);
        });
      }

      // 返回按钮
      const backBtn = document.querySelector('#back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.goBack();
        });
      }
    }

    /**
     * 检查URL参数
     */
    checkUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const questionId = urlParams.get('id');
      
      if (questionId) {
        this.loadQuestion(questionId);
      } else {
        this.showError('未指定题目ID');
      }
    }

    /**
     * 加载题目
     */
    async loadQuestion(questionId) {
      try {
        console.log('📚 加载题目:', questionId);
        
        this.showLoading();
        
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
            explanation: '这是一个标准的二次方程，可以使用因式分解法求解。首先寻找两个数，它们的乘积为6，和为5，这两个数是2和3。因此方程可以分解为(x-2)(x-3)=0，得到x=2或x=3。',
            difficulty: 'medium',
            status: 'reviewing',
            tags: ['二次方程', '因式分解', '代数'],
            subject_detail: '高中数学',
            chapter: '一元二次方程',
            source: '期中考试',
            images: [],
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:20:00Z',
            practice_count: 5,
            correct_count: 3,
            last_practiced: '2024-01-20T14:20:00Z',
            notes: '需要加强因式分解的练习'
          };
        }
        
        this.currentQuestion = question;
        this.originalData = JSON.parse(JSON.stringify(question));
        this.renderQuestion(question);
        
        console.log('✅ 题目加载完成');
        
      } catch (error) {
        console.error('❌ 加载题目失败:', error);
        this.showError('加载题目失败');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 渲染题目
     */
    renderQuestion(question) {
      // 渲染基本信息
      this.renderBasicInfo(question);
      
      // 渲染内容
      this.renderContent(question);
      
      // 渲染元数据
      this.renderMetadata(question);
      
      // 渲染统计信息
      this.renderStatistics(question);
      
      // 渲染操作按钮
      this.renderActions(question);
    }

    /**
     * 渲染基本信息
     */
    renderBasicInfo(question) {
      const container = document.querySelector('.question-header');
      if (!container) return;

      container.innerHTML = `
        <div class="question-meta">
          <div class="meta-item">
            <span class="meta-label">科目:</span>
            <span class="meta-value subject-badge">${question.subject}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">难度:</span>
            <span class="meta-value difficulty-badge difficulty-${question.difficulty}">
              ${this.getDifficultyText(question.difficulty)}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">状态:</span>
            <span class="meta-value status-badge status-${question.status}">
              ${this.getStatusText(question.status)}
            </span>
          </div>
          <div class="meta-item">
            <span class="meta-label">ID:</span>
            <span class="meta-value">#${question.id}</span>
          </div>
        </div>
        
        <div class="question-tags">
          ${question.tags ? question.tags.map(tag => `
            <span class="tag" data-tag="${tag}">
              ${tag}
              ${this.isEditing ? '<i class="icon-x remove-tag"></i>' : ''}
            </span>
          `).join('') : ''}
          ${this.isEditing ? '<button id="add-tag-btn" class="btn btn-sm btn-outline"><i class="icon-plus"></i> 添加标签</button>' : ''}
        </div>
      `;
    }

    /**
     * 渲染内容
     */
    renderContent(question) {
      const container = document.querySelector('.question-content');
      if (!container) return;

      container.innerHTML = `
        <div class="content-section">
          <h3>题目内容</h3>
          ${this.isEditing ? `
            <textarea id="content-input" class="form-control" rows="4" placeholder="请输入题目内容">${question.content}</textarea>
          ` : `
            <div class="content-text">${question.content}</div>
          `}
          
          ${question.images && question.images.length > 0 ? `
            <div class="content-images">
              ${question.images.map(img => `
                <div class="image-item">
                  <img src="${img.url}" alt="题目图片" onclick="this.classList.toggle('enlarged')">
                  ${this.isEditing ? '<button class="remove-image" data-id="' + img.id + '"><i class="icon-x"></i></button>' : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${this.isEditing ? `
            <div class="image-upload-area">
              <input type="file" id="image-upload" accept="image/*" multiple style="display: none;">
              <button onclick="document.getElementById('image-upload').click()" class="btn btn-outline">
                <i class="icon-image"></i> 添加图片
              </button>
            </div>
          ` : ''}
        </div>
        
        <div class="content-section">
          <h3>参考答案</h3>
          ${this.isEditing ? `
            <textarea id="answer-input" class="form-control" rows="3" placeholder="请输入参考答案">${question.answer || ''}</textarea>
          ` : `
            <div class="answer-text">${question.answer || '暂无答案'}</div>
          `}
        </div>
        
        <div class="content-section">
          <h3>解题思路</h3>
          ${this.isEditing ? `
            <textarea id="explanation-input" class="form-control" rows="6" placeholder="请输入解题思路">${question.explanation || ''}</textarea>
          ` : `
            <div class="explanation-text">${question.explanation || '暂无解题思路'}</div>
          `}
        </div>
        
        ${question.notes ? `
          <div class="content-section">
            <h3>备注</h3>
            ${this.isEditing ? `
              <textarea id="notes-input" class="form-control" rows="2" placeholder="请输入备注">${question.notes}</textarea>
            ` : `
              <div class="notes-text">${question.notes}</div>
            `}
          </div>
        ` : ''}
      `;
    }

    /**
     * 渲染元数据
     */
    renderMetadata(question) {
      const container = document.querySelector('.question-metadata');
      if (!container) return;

      container.innerHTML = `
        <div class="metadata-grid">
          <div class="metadata-item">
            <label>科目详情:</label>
            ${this.isEditing ? `
              <input type="text" id="subject-detail-input" class="form-control" value="${question.subject_detail || ''}" placeholder="如：高中数学">
            ` : `
              <span>${question.subject_detail || '未设置'}</span>
            `}
          </div>
          
          <div class="metadata-item">
            <label>章节:</label>
            ${this.isEditing ? `
              <input type="text" id="chapter-input" class="form-control" value="${question.chapter || ''}" placeholder="如：一元二次方程">
            ` : `
              <span>${question.chapter || '未设置'}</span>
            `}
          </div>
          
          <div class="metadata-item">
            <label>来源:</label>
            ${this.isEditing ? `
              <input type="text" id="source-input" class="form-control" value="${question.source || ''}" placeholder="如：期中考试">
            ` : `
              <span>${question.source || '未设置'}</span>
            `}
          </div>
          
          <div class="metadata-item">
            <label>难度:</label>
            ${this.isEditing ? `
              <select id="difficulty-select" class="form-control">
                <option value="easy" ${question.difficulty === 'easy' ? 'selected' : ''}>简单</option>
                <option value="medium" ${question.difficulty === 'medium' ? 'selected' : ''}>中等</option>
                <option value="hard" ${question.difficulty === 'hard' ? 'selected' : ''}>困难</option>
              </select>
            ` : `
              <span class="difficulty-badge difficulty-${question.difficulty}">
                ${this.getDifficultyText(question.difficulty)}
              </span>
            `}
          </div>
          
          <div class="metadata-item">
            <label>状态:</label>
            ${this.isEditing ? `
              <select id="status-select" class="form-control">
                <option value="new" ${question.status === 'new' ? 'selected' : ''}>新题目</option>
                <option value="reviewing" ${question.status === 'reviewing' ? 'selected' : ''}>复习中</option>
                <option value="mastered" ${question.status === 'mastered' ? 'selected' : ''}>已掌握</option>
              </select>
            ` : `
              <span class="status-badge status-${question.status}">
                ${this.getStatusText(question.status)}
              </span>
            `}
          </div>
          
          <div class="metadata-item">
            <label>创建时间:</label>
            <span>${new Date(question.created_at).toLocaleString('zh-CN')}</span>
          </div>
          
          <div class="metadata-item">
            <label>更新时间:</label>
            <span>${new Date(question.updated_at).toLocaleString('zh-CN')}</span>
          </div>
          
          ${question.last_practiced ? `
            <div class="metadata-item">
              <label>最后练习:</label>
              <span>${new Date(question.last_practiced).toLocaleString('zh-CN')}</span>
            </div>
          ` : ''}
        </div>
      `;
    }

    /**
     * 渲染统计信息
     */
    renderStatistics(question) {
      const container = document.querySelector('.question-statistics');
      if (!container) return;

      const accuracy = question.practice_count > 0 ? 
        Math.round((question.correct_count / question.practice_count) * 100) : 0;

      container.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${question.practice_count || 0}</div>
            <div class="stat-label">练习次数</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${question.correct_count || 0}</div>
            <div class="stat-label">正确次数</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">正确率</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">${question.tags ? question.tags.length : 0}</div>
            <div class="stat-label">标签数量</div>
          </div>
        </div>
      `;
    }

    /**
     * 渲染操作按钮
     */
    renderActions(question) {
      const container = document.querySelector('.question-actions');
      if (!container) return;

      if (this.isEditing) {
        container.innerHTML = `
          <button id="save-btn" class="btn btn-primary">
            <i class="icon-save"></i> 保存
          </button>
          <button id="cancel-btn" class="btn btn-secondary">
            <i class="icon-x"></i> 取消
          </button>
        `;
      } else {
        container.innerHTML = `
          <button id="practice-btn" class="btn btn-primary">
            <i class="icon-play"></i> 开始练习
          </button>
          <button id="ai-explain-btn" class="btn btn-secondary">
            <i class="icon-zap"></i> AI讲解
          </button>
          <button id="edit-btn" class="btn btn-outline">
            <i class="icon-edit"></i> 编辑
          </button>
          <button id="delete-btn" class="btn btn-danger">
            <i class="icon-trash"></i> 删除
          </button>
        `;
      }
    }

    /**
     * 切换编辑模式
     */
    toggleEditMode() {
      this.isEditing = !this.isEditing;
      this.renderQuestion(this.currentQuestion);
      this.bindEvents(); // 重新绑定事件
      
      if (this.isEditing) {
        console.log('✏️ 进入编辑模式');
      } else {
        console.log('👁️ 退出编辑模式');
      }
    }

    /**
     * 保存题目
     */
    async saveQuestion() {
      try {
        console.log('💾 保存题目');
        
        // 收集表单数据
        const updatedData = this.collectFormData();
        
        // 验证数据
        if (!this.validateData(updatedData)) {
          return;
        }
        
        this.showLoading();
        
        // 保存到数据库
        if (window.questionManager) {
          await window.questionManager.updateQuestion(this.currentQuestion.id, updatedData);
        }
        
        // 更新当前数据
        Object.assign(this.currentQuestion, updatedData);
        this.originalData = JSON.parse(JSON.stringify(this.currentQuestion));
        
        // 退出编辑模式
        this.isEditing = false;
        this.renderQuestion(this.currentQuestion);
        this.bindEvents();
        
        this.showNotification('保存成功', 'success');
        console.log('✅ 题目保存完成');
        
      } catch (error) {
        console.error('❌ 保存题目失败:', error);
        this.showError('保存失败');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 取消编辑
     */
    cancelEdit() {
      console.log('❌ 取消编辑');
      
      // 恢复原始数据
      this.currentQuestion = JSON.parse(JSON.stringify(this.originalData));
      
      // 退出编辑模式
      this.isEditing = false;
      this.renderQuestion(this.currentQuestion);
      this.bindEvents();
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
      const data = {};
      
      // 基本内容
      const contentInput = document.querySelector('#content-input');
      if (contentInput) data.content = contentInput.value.trim();
      
      const answerInput = document.querySelector('#answer-input');
      if (answerInput) data.answer = answerInput.value.trim();
      
      const explanationInput = document.querySelector('#explanation-input');
      if (explanationInput) data.explanation = explanationInput.value.trim();
      
      const notesInput = document.querySelector('#notes-input');
      if (notesInput) data.notes = notesInput.value.trim();
      
      // 元数据
      const subjectDetailInput = document.querySelector('#subject-detail-input');
      if (subjectDetailInput) data.subject_detail = subjectDetailInput.value.trim();
      
      const chapterInput = document.querySelector('#chapter-input');
      if (chapterInput) data.chapter = chapterInput.value.trim();
      
      const sourceInput = document.querySelector('#source-input');
      if (sourceInput) data.source = sourceInput.value.trim();
      
      const difficultySelect = document.querySelector('#difficulty-select');
      if (difficultySelect) data.difficulty = difficultySelect.value;
      
      const statusSelect = document.querySelector('#status-select');
      if (statusSelect) data.status = statusSelect.value;
      
      // 标签
      const tags = Array.from(document.querySelectorAll('.tag')).map(tag => tag.dataset.tag).filter(Boolean);
      data.tags = tags;
      
      data.updated_at = new Date().toISOString();
      
      return data;
    }

    /**
     * 验证数据
     */
    validateData(data) {
      if (!data.content || data.content.trim() === '') {
        this.showError('题目内容不能为空');
        return false;
      }
      
      return true;
    }

    /**
     * 删除题目
     */
    async deleteQuestion() {
      if (!confirm('确定要删除这个题目吗？此操作不可恢复。')) {
        return;
      }
      
      try {
        console.log('🗑️ 删除题目');
        
        this.showLoading();
        
        if (window.questionManager) {
          await window.questionManager.deleteQuestion(this.currentQuestion.id);
        }
        
        this.showNotification('删除成功', 'success');
        
        // 返回列表页
        setTimeout(() => {
          this.goBack();
        }, 1000);
        
      } catch (error) {
        console.error('❌ 删除题目失败:', error);
        this.showError('删除失败');
      } finally {
        this.hideLoading();
      }
    }

    /**
     * 开始练习
     */
    startPractice() {
      console.log('🎯 开始练习');
      
      // 跳转到练习页面
      if (window.app && window.app.router) {
        window.app.router.navigate(`/practice?questionId=${this.currentQuestion.id}`);
      }
    }

    /**
     * 打开AI讲解
     */
    openAIExplanation() {
      console.log('🤖 打开AI讲解');
      
      // 跳转到AI讲解页面
      if (window.app && window.app.router) {
        window.app.router.navigate(`/ai-explanation?questionId=${this.currentQuestion.id}`);
      }
    }

    /**
     * 添加标签
     */
    addTag() {
      const tagName = prompt('请输入标签名称:');
      if (tagName && tagName.trim()) {
        const trimmedTag = tagName.trim();
        if (!this.currentQuestion.tags.includes(trimmedTag)) {
          this.currentQuestion.tags.push(trimmedTag);
          this.renderBasicInfo(this.currentQuestion);
        }
      }
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(files) {
      console.log('📷 处理图片上传:', files.length);
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = {
              id: Date.now() + Math.random(),
              url: e.target.result,
              name: file.name,
              size: file.size
            };
            
            if (!this.currentQuestion.images) {
              this.currentQuestion.images = [];
            }
            this.currentQuestion.images.push(imageData);
            
            this.renderContent(this.currentQuestion);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    /**
     * 返回上一页
     */
    goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // 默认返回题目列表
        if (window.app && window.app.router) {
          window.app.router.navigate('/questions/list');
        }
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

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'new': '新题目',
        'reviewing': '复习中',
        'mastered': '已掌握'
      };
      return statusMap[status] || status;
    }

    // UI 方法
    showLoading() {
      if (window.UI && window.UI.loading) {
        window.UI.loading.show('处理中...');
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
      new QuestionDetailPageController();
    });
  } else {
    new QuestionDetailPageController();
  }

  // 导出到全局
  window.QuestionDetailPageController = QuestionDetailPageController;

})();