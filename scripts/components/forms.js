/**
 * 表单组件
 * 包含各种表单功能的实现
 */

// 添加错题表单组件
class AddQuestionForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSubmit: null,
      onCancel: null,
      ...options
    };
    this.currentStep = 1;
    this.formData = {
      subject: '',
      difficulty: 'medium',
      content: '',
      answer: '',
      explanation: '',
      tags: [],
      image: null
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="add-question-form">
        <div class="form-header">
          <h3 class="form-title">添加错题</h3>
          <div class="form-steps">
            <div class="step ${this.currentStep >= 1 ? 'active' : ''}" data-step="1">
              <span class="step-number">1</span>
              <span class="step-label">基本信息</span>
            </div>
            <div class="step ${this.currentStep >= 2 ? 'active' : ''}" data-step="2">
              <span class="step-number">2</span>
              <span class="step-label">题目内容</span>
            </div>
            <div class="step ${this.currentStep >= 3 ? 'active' : ''}" data-step="3">
              <span class="step-number">3</span>
              <span class="step-label">答案解析</span>
            </div>
          </div>
        </div>

        <form class="question-form" id="question-form">
          <!-- 步骤1: 基本信息 -->
          <div class="form-step" id="step-1" style="display: ${this.currentStep === 1 ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label required">学科</label>
              <select class="form-select" name="subject" required>
                <option value="">请选择学科</option>
                <option value="math">数学</option>
                <option value="physics">物理</option>
                <option value="chemistry">化学</option>
                <option value="biology">生物</option>
                <option value="chinese">语文</option>
                <option value="english">英语</option>
                <option value="history">历史</option>
                <option value="geography">地理</option>
                <option value="politics">政治</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label required">难度等级</label>
              <div class="difficulty-selector">
                <label class="difficulty-option">
                  <input type="radio" name="difficulty" value="easy">
                  <span class="difficulty-label easy">简单</span>
                </label>
                <label class="difficulty-option">
                  <input type="radio" name="difficulty" value="medium" checked>
                  <span class="difficulty-label medium">中等</span>
                </label>
                <label class="difficulty-option">
                  <input type="radio" name="difficulty" value="hard">
                  <span class="difficulty-label hard">困难</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">标签</label>
              <div class="tags-input">
                <div class="tags-container" id="tags-container">
                  <!-- 标签将在这里显示 -->
                </div>
                <input type="text" class="tag-input" id="tag-input" placeholder="输入标签后按回车添加">
              </div>
              <div class="form-hint">添加相关标签，便于后续分类和搜索</div>
            </div>
          </div>

          <!-- 步骤2: 题目内容 -->
          <div class="form-step" id="step-2" style="display: ${this.currentStep === 2 ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label required">题目内容</label>
              <textarea 
                class="form-textarea" 
                name="content" 
                rows="6" 
                placeholder="请输入题目内容..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">题目图片</label>
              <div class="image-upload" id="image-upload">
                <div class="upload-area" id="upload-area">
                  <div class="upload-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                    </svg>
                  </div>
                  <div class="upload-text">
                    <p>点击或拖拽图片到这里</p>
                    <p class="upload-hint">支持 JPG、PNG、GIF 格式</p>
                  </div>
                  <input type="file" id="image-input" accept="image/*" style="display: none;">
                </div>
                <div class="image-preview" id="image-preview" style="display: none;">
                  <img id="preview-img" alt="预览图片">
                  <div class="preview-actions">
                    <button type="button" class="btn btn-sm btn-secondary" id="remove-image-btn">
                      删除图片
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤3: 答案解析 -->
          <div class="form-step" id="step-3" style="display: ${this.currentStep === 3 ? 'block' : 'none'};">
            <div class="form-group">
              <label class="form-label required">正确答案</label>
              <textarea 
                class="form-textarea" 
                name="answer" 
                rows="4" 
                placeholder="请输入正确答案..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">解题思路</label>
              <textarea 
                class="form-textarea" 
                name="explanation" 
                rows="6" 
                placeholder="请输入解题思路和知识点分析..."
              ></textarea>
              <div class="form-hint">详细的解题思路有助于后续复习</div>
            </div>

            <div class="form-group">
              <label class="form-label">错误原因</label>
              <div class="error-reasons">
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="careless">
                  <span class="checkbox-label">粗心大意</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="concept">
                  <span class="checkbox-label">概念不清</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="method">
                  <span class="checkbox-label">方法不当</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="calculation">
                  <span class="checkbox-label">计算错误</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="knowledge">
                  <span class="checkbox-label">知识盲点</span>
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" name="errorReasons" value="other">
                  <span class="checkbox-label">其他原因</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="prev-btn" style="display: ${this.currentStep === 1 ? 'none' : 'inline-flex'};">
              上一步
            </button>
            <button type="button" class="btn btn-secondary" id="cancel-btn">
              取消
            </button>
            <button type="button" class="btn btn-primary" id="next-btn" style="display: ${this.currentStep === 3 ? 'none' : 'inline-flex'};">
              下一步
            </button>
            <button type="submit" class="btn btn-primary" id="submit-btn" style="display: ${this.currentStep === 3 ? 'inline-flex' : 'none'};">
              保存错题
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindEvents();
    this.loadFormData();
  }

  bindEvents() {
    const form = document.getElementById('question-form');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-btn');

    // 表单提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // 步骤导航
    nextBtn.addEventListener('click', () => {
      if (this.validateCurrentStep()) {
        this.nextStep();
      }
    });

    prevBtn.addEventListener('click', () => {
      this.prevStep();
    });

    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      if (this.options.onCancel) {
        this.options.onCancel();
      }
    });

    // 标签输入
    this.bindTagEvents();

    // 图片上传
    this.bindImageEvents();

    // 表单数据变化监听
    form.addEventListener('change', () => {
      this.saveFormData();
    });

    form.addEventListener('input', () => {
      this.saveFormData();
    });
  }

  bindTagEvents() {
    const tagInput = document.getElementById('tag-input');
    const tagsContainer = document.getElementById('tags-container');

    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (tag && !this.formData.tags.includes(tag)) {
          this.addTag(tag);
          tagInput.value = '';
        }
      }
    });

    tagInput.addEventListener('blur', () => {
      const tag = tagInput.value.trim();
      if (tag && !this.formData.tags.includes(tag)) {
        this.addTag(tag);
        tagInput.value = '';
      }
    });
  }

  bindImageEvents() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-image-btn');

    // 点击上传
    uploadArea.addEventListener('click', () => {
      imageInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleImageSelect(files[0]);
      }
    });

    // 文件选择
    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageSelect(e.target.files[0]);
      }
    });

    // 删除图片
    removeBtn.addEventListener('click', () => {
      this.removeImage();
    });
  }

  addTag(tag) {
    this.formData.tags.push(tag);
    this.renderTags();
  }

  removeTag(tag) {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
      this.renderTags();
    }
  }

  renderTags() {
    const container = document.getElementById('tags-container');
    container.innerHTML = this.formData.tags.map(tag => `
      <span class="tag">
        ${tag}
        <button type="button" class="tag-remove" data-tag="${tag}">×</button>
      </span>
    `).join('');

    // 绑定删除事件
    container.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTag(btn.dataset.tag);
      });
    });
  }

  handleImageSelect(file) {
    if (!file.type.startsWith('image/')) {
      window.UI.notification.error('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.UI.notification.error('图片大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.formData.image = e.target.result;
      this.showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  showImagePreview(src) {
    const uploadArea = document.getElementById('upload-area');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    previewImg.src = src;
    uploadArea.style.display = 'none';
    imagePreview.style.display = 'block';
  }

  removeImage() {
    const uploadArea = document.getElementById('upload-area');
    const imagePreview = document.getElementById('image-preview');
    const imageInput = document.getElementById('image-input');

    this.formData.image = null;
    imageInput.value = '';
    uploadArea.style.display = 'flex';
    imagePreview.style.display = 'none';
  }

  validateCurrentStep() {
    const form = document.getElementById('question-form');
    const currentStepElement = document.getElementById(`step-${this.currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      } else {
        field.classList.remove('error');
      }
    });

    if (!isValid) {
      window.UI.notification.error('请填写所有必填字段');
    }

    return isValid;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateStepDisplay();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  }

  updateStepDisplay() {
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach((step, index) => {
      if (index + 1 <= this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // 显示/隐藏步骤内容
    for (let i = 1; i <= 3; i++) {
      const stepElement = document.getElementById(`step-${i}`);
      stepElement.style.display = i === this.currentStep ? 'block' : 'none';
    }

    // 更新按钮显示
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
    nextBtn.style.display = this.currentStep === 3 ? 'none' : 'inline-flex';
    submitBtn.style.display = this.currentStep === 3 ? 'inline-flex' : 'none';
  }

  saveFormData() {
    const form = document.getElementById('question-form');
    const formData = new FormData(form);
    
    this.formData.subject = formData.get('subject') || '';
    this.formData.difficulty = formData.get('difficulty') || 'medium';
    this.formData.content = formData.get('content') || '';
    this.formData.answer = formData.get('answer') || '';
    this.formData.explanation = formData.get('explanation') || '';
    
    // 错误原因
    this.formData.errorReasons = Array.from(formData.getAll('errorReasons'));
  }

  loadFormData() {
    const form = document.getElementById('question-form');
    
    // 设置表单值
    if (this.formData.subject) {
      form.querySelector('[name="subject"]').value = this.formData.subject;
    }
    
    if (this.formData.difficulty) {
      form.querySelector(`[name="difficulty"][value="${this.formData.difficulty}"]`).checked = true;
    }
    
    if (this.formData.content) {
      form.querySelector('[name="content"]').value = this.formData.content;
    }
    
    if (this.formData.answer) {
      form.querySelector('[name="answer"]').value = this.formData.answer;
    }
    
    if (this.formData.explanation) {
      form.querySelector('[name="explanation"]').value = this.formData.explanation;
    }

    // 渲染标签
    this.renderTags();

    // 显示图片预览
    if (this.formData.image) {
      this.showImagePreview(this.formData.image);
    }
  }

  handleSubmit() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveFormData();

    // 构建完整的题目数据
    const questionData = {
      id: window.helpers.generateId(),
      subject: this.formData.subject,
      difficulty: this.formData.difficulty,
      content: this.formData.content,
      answer: this.formData.answer,
      explanation: this.formData.explanation,
      tags: this.formData.tags,
      image: this.formData.image,
      errorReasons: this.formData.errorReasons,
      addTime: new Date().toISOString(),
      status: 'new',
      reviewCount: 0,
      lastReviewTime: null,
      nextReviewTime: null
    };

    if (this.options.onSubmit) {
      this.options.onSubmit(questionData);
    }
  }

  reset() {
    this.currentStep = 1;
    this.formData = {
      subject: '',
      difficulty: 'medium',
      content: '',
      answer: '',
      explanation: '',
      tags: [],
      image: null,
      errorReasons: []
    };
    this.render();
  }
}

// 编辑错题表单组件
class EditQuestionForm extends AddQuestionForm {
  constructor(container, questionData, options = {}) {
    super(container, options);
    this.originalData = questionData;
    this.formData = { ...questionData };
  }

  render() {
    // 修改标题
    super.render();
    this.container.querySelector('.form-title').textContent = '编辑错题';
    this.container.querySelector('#submit-btn').textContent = '保存修改';
  }

  handleSubmit() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveFormData();

    // 保持原有的ID和时间信息
    const questionData = {
      ...this.formData,
      id: this.originalData.id,
      addTime: this.originalData.addTime,
      updateTime: new Date().toISOString()
    };

    if (this.options.onSubmit) {
      this.options.onSubmit(questionData);
    }
  }
}

// 搜索表单组件
class SearchForm {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      onSearch: null,
      onReset: null,
      placeholder: '搜索...',
      showAdvanced: true,
      ...options
    };
    this.isAdvancedVisible = false;
  }

  render() {
    this.container.innerHTML = `
      <div class="search-form">
        <div class="search-basic">
          <div class="search-input-group">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              id="search-input" 
              placeholder="${this.options.placeholder}"
            >
            <button type="button" class="search-clear" id="search-clear" style="display: none;">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          ${this.options.showAdvanced ? `
            <button type="button" class="search-advanced-toggle" id="advanced-toggle">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
              </svg>
              高级搜索
            </button>
          ` : ''}
        </div>

        ${this.options.showAdvanced ? `
          <div class="search-advanced" id="search-advanced" style="display: none;">
            <div class="advanced-filters">
              <div class="filter-row">
                <div class="filter-group">
                  <label class="filter-label">学科</label>
                  <select class="filter-select" id="subject-filter">
                    <option value="">全部学科</option>
                    <option value="math">数学</option>
                    <option value="physics">物理</option>
                    <option value="chemistry">化学</option>
                    <option value="biology">生物</option>
                    <option value="chinese">语文</option>
                    <option value="english">英语</option>
                    <option value="history">历史</option>
                    <option value="geography">地理</option>
                    <option value="politics">政治</option>
                  </select>
                </div>
                
                <div class="filter-group">
                  <label class="filter-label">难度</label>
                  <select class="filter-select" id="difficulty-filter">
                    <option value="">全部难度</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                
                <div class="filter-group">
                  <label class="filter-label">状态</label>
                  <select class="filter-select" id="status-filter">
                    <option value="">全部状态</option>
                    <option value="new">新题目</option>
                    <option value="reviewing">复习中</option>
                    <option value="mastered">已掌握</option>
                  </select>
                </div>
              </div>
              
              <div class="filter-row">
                <div class="filter-group">
                  <label class="filter-label">添加时间</label>
                  <div class="date-range">
                    <input type="date" class="date-input" id="start-date">
                    <span class="date-separator">至</span>
                    <input type="date" class="date-input" id="end-date">
                  </div>
                </div>
                
                <div class="filter-group">
                  <label class="filter-label">标签</label>
                  <input type="text" class="filter-input" id="tags-filter" placeholder="输入标签，多个标签用逗号分隔">
                </div>
              </div>
            </div>
            
            <div class="advanced-actions">
              <button type="button" class="btn btn-secondary" id="reset-filters">
                重置筛选
              </button>
              <button type="button" class="btn btn-primary" id="apply-filters">
                应用筛选
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedPanel = document.getElementById('search-advanced');
    const resetBtn = document.getElementById('reset-filters');
    const applyBtn = document.getElementById('apply-filters');

    // 搜索输入
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      const value = e.target.value;
      searchClear.style.display = value ? 'block' : 'none';
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleSearch();
      }, 300);
    });

    // 清空搜索
    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      this.handleSearch();
    });

    // 高级搜索切换
    advancedToggle?.addEventListener('click', () => {
      this.toggleAdvanced();
    });

    // 重置筛选
    resetBtn?.addEventListener('click', () => {
      this.resetFilters();
    });

    // 应用筛选
    applyBtn?.addEventListener('click', () => {
      this.handleSearch();
    });

    // 筛选器变化
    if (advancedPanel) {
      advancedPanel.addEventListener('change', () => {
        this.handleSearch();
      });
    }
  }

  toggleAdvanced() {
    const advancedPanel = document.getElementById('search-advanced');
    const advancedToggle = document.getElementById('advanced-toggle');
    
    this.isAdvancedVisible = !this.isAdvancedVisible;
    advancedPanel.style.display = this.isAdvancedVisible ? 'block' : 'none';
    advancedToggle.classList.toggle('active', this.isAdvancedVisible);
  }

  handleSearch() {
    const searchData = this.getSearchData();
    if (this.options.onSearch) {
      this.options.onSearch(searchData);
    }
  }

  getSearchData() {
    const searchInput = document.getElementById('search-input');
    const data = {
      keyword: searchInput.value.trim()
    };

    if (this.options.showAdvanced && this.isAdvancedVisible) {
      data.subject = document.getElementById('subject-filter')?.value || '';
      data.difficulty = document.getElementById('difficulty-filter')?.value || '';
      data.status = document.getElementById('status-filter')?.value || '';
      data.startDate = document.getElementById('start-date')?.value || '';
      data.endDate = document.getElementById('end-date')?.value || '';
      data.tags = document.getElementById('tags-filter')?.value.split(',').map(tag => tag.trim()).filter(tag => tag) || [];
    }

    return data;
  }

  resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-clear').style.display = 'none';
    
    if (this.options.showAdvanced) {
      document.getElementById('subject-filter').value = '';
      document.getElementById('difficulty-filter').value = '';
      document.getElementById('status-filter').value = '';
      document.getElementById('start-date').value = '';
      document.getElementById('end-date').value = '';
      document.getElementById('tags-filter').value = '';
    }

    if (this.options.onReset) {
      this.options.onReset();
    } else {
      this.handleSearch();
    }
  }

  setSearchValue(value) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = value;
    document.getElementById('search-clear').style.display = value ? 'block' : 'none';
  }
}

// 导出到全局
if (typeof window !== 'undefined') {
  window.Forms = {
    AddQuestionForm,
    EditQuestionForm,
    SearchForm
  };
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AddQuestionForm,
    EditQuestionForm,
    SearchForm
  };
}