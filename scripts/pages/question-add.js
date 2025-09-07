/**
 * 添加题目页面脚本
 * 处理新题目的添加功能
 */

(function() {
  'use strict';

  /**
   * 添加题目页面控制器
   */
  class QuestionAddPageController {
    constructor() {
      this.formData = {
        subject: '',
        content: '',
        answer: '',
        explanation: '',
        difficulty: 'medium',
        tags: [],
        images: [],
        subject_detail: '',
        chapter: '',
        source: ''
      };
      this.isSubmitting = false;
      this.init();
    }

    /**
     * 初始化页面
     */
    init() {
      console.log('➕ 初始化添加题目页面');
      
      // 绑定事件
      this.bindEvents();
      
      // 初始化表单
      this.initForm();
      
      // 加载科目选项
      this.loadSubjects();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
      // 表单提交
      const form = document.querySelector('#question-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.submitForm();
        });
      }

      // 保存按钮
      const saveBtn = document.querySelector('#save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          this.submitForm();
        });
      }

      // 保存并继续按钮
      const saveAndContinueBtn = document.querySelector('#save-continue-btn');
      if (saveAndContinueBtn) {
        saveAndContinueBtn.addEventListener('click', () => {
          this.submitForm(true);
        });
      }

      // 重置按钮
      const resetBtn = document.querySelector('#reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.resetForm();
        });
      }

      // 预览按钮
      const previewBtn = document.querySelector('#preview-btn');
      if (previewBtn) {
        previewBtn.addEventListener('click', () => {
          this.showPreview();
        });
      }

      // 添加标签
      const addTagBtn = document.querySelector('#add-tag-btn');
      if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
          this.addTag();
        });
      }

      // 标签输入框回车
      const tagInput = document.querySelector('#tag-input');
      if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.addTagFromInput();
          }
        });
      }

      // 图片上传
      const imageUpload = document.querySelector('#image-upload');
      if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
          this.handleImageUpload(e.target.files);
        });
      }

      // 拖拽上传
      const dropZone = document.querySelector('.image-drop-zone');
      if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
          dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('dragover');
          this.handleImageUpload(e.dataTransfer.files);
        });
      }

      // 科目变化
      const subjectSelect = document.querySelector('#subject-select');
      if (subjectSelect) {
        subjectSelect.addEventListener('change', (e) => {
          this.handleSubjectChange(e.target.value);
        });
      }

      // 实时保存草稿
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          this.saveDraft();
        });
      });

      // 返回按钮
      const backBtn = document.querySelector('#back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.goBack();
        });
      }
    }

    /**
     * 初始化表单
     */
    initForm() {
      // 加载草稿
      this.loadDraft();
      
      // 设置默认值
      const difficultySelect = document.querySelector('#difficulty-select');
      if (difficultySelect && !difficultySelect.value) {
        difficultySelect.value = 'medium';
      }
      
      // 聚焦到第一个输入框
      const firstInput = document.querySelector('#subject-select');
      if (firstInput) {
        firstInput.focus();
      }
    }

    /**
     * 加载科目选项
     */
    async loadSubjects() {
      try {
        console.log('📚 加载科目选项');
        
        let subjects = [];
        if (window.questionManager) {
          subjects = await window.questionManager.getSubjects();
        } else {
          // 默认科目
          subjects = [
            { id: 'math', name: '数学', chapters: ['代数', '几何', '概率统计'] },
            { id: 'chinese', name: '语文', chapters: ['现代文阅读', '古诗文', '作文'] },
            { id: 'english', name: '英语', chapters: ['语法', '阅读理解', '写作'] },
            { id: 'physics', name: '物理', chapters: ['力学', '电学', '光学'] },
            { id: 'chemistry', name: '化学', chapters: ['无机化学', '有机化学', '物理化学'] },
            { id: 'biology', name: '生物', chapters: ['细胞生物学', '遗传学', '生态学'] },
            { id: 'history', name: '历史', chapters: ['中国古代史', '中国近现代史', '世界史'] },
            { id: 'geography', name: '地理', chapters: ['自然地理', '人文地理', '区域地理'] },
            { id: 'politics', name: '政治', chapters: ['马克思主义', '毛泽东思想', '中国特色社会主义'] }
          ];
        }
        
        this.renderSubjectOptions(subjects);
        
      } catch (error) {
        console.error('❌ 加载科目失败:', error);
      }
    }

    /**
     * 渲染科目选项
     */
    renderSubjectOptions(subjects) {
      const select = document.querySelector('#subject-select');
      if (!select) return;

      select.innerHTML = '<option value="">请选择科目</option>';
      
      subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        option.dataset.chapters = JSON.stringify(subject.chapters || []);
        select.appendChild(option);
      });
    }

    /**
     * 处理科目变化
     */
    handleSubjectChange(subjectId) {
      console.log('📖 科目变化:', subjectId);
      
      const select = document.querySelector('#subject-select');
      const selectedOption = select.querySelector(`option[value="${subjectId}"]`);
      
      if (selectedOption) {
        const chapters = JSON.parse(selectedOption.dataset.chapters || '[]');
        this.updateChapterOptions(chapters);
      }
    }

    /**
     * 更新章节选项
     */
    updateChapterOptions(chapters) {
      const chapterSelect = document.querySelector('#chapter-select');
      if (!chapterSelect) return;

      chapterSelect.innerHTML = '<option value="">请选择章节</option>';
      
      chapters.forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.textContent = chapter;
        chapterSelect.appendChild(option);
      });
    }

    /**
     * 提交表单
     */
    async submitForm(continueAdding = false) {
      if (this.isSubmitting) return;
      
      try {
        console.log('📝 提交表单');
        
        // 收集表单数据
        const formData = this.collectFormData();
        
        // 验证数据
        if (!this.validateFormData(formData)) {
          return;
        }
        
        this.isSubmitting = true;
        this.showSubmittingState();
        
        // 提交到后端
        let result = null;
        if (window.questionManager) {
          result = await window.questionManager.addQuestion(formData);
        } else {
          // 模拟提交
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = { id: Date.now(), ...formData };
        }
        
        console.log('✅ 题目添加成功:', result.id);
        this.showNotification('题目添加成功！', 'success');
        
        // 清除草稿
        this.clearDraft();
        
        if (continueAdding) {
          // 重置表单继续添加
          this.resetForm();
          this.showNotification('可以继续添加下一个题目', 'info');
        } else {
          // 跳转到题目详情页
          setTimeout(() => {
            if (window.app && window.app.router) {
              window.app.router.navigate(`/question/detail?id=${result.id}`);
            }
          }, 1500);
        }
        
      } catch (error) {
        console.error('❌ 添加题目失败:', error);
        this.showError('添加失败，请稍后重试');
      } finally {
        this.isSubmitting = false;
        this.hideSubmittingState();
      }
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
      const data = {};
      
      // 基本信息
      const subjectSelect = document.querySelector('#subject-select');
      if (subjectSelect) {
        data.subject = subjectSelect.options[subjectSelect.selectedIndex]?.textContent || '';
        data.subject_id = subjectSelect.value;
      }
      
      const contentInput = document.querySelector('#content-input');
      if (contentInput) data.content = contentInput.value.trim();
      
      const answerInput = document.querySelector('#answer-input');
      if (answerInput) data.answer = answerInput.value.trim();
      
      const explanationInput = document.querySelector('#explanation-input');
      if (explanationInput) data.explanation = explanationInput.value.trim();
      
      const difficultySelect = document.querySelector('#difficulty-select');
      if (difficultySelect) data.difficulty = difficultySelect.value;
      
      // 详细信息
      const subjectDetailInput = document.querySelector('#subject-detail-input');
      if (subjectDetailInput) data.subject_detail = subjectDetailInput.value.trim();
      
      const chapterSelect = document.querySelector('#chapter-select');
      if (chapterSelect) data.chapter = chapterSelect.value;
      
      const sourceInput = document.querySelector('#source-input');
      if (sourceInput) data.source = sourceInput.value.trim();
      
      const notesInput = document.querySelector('#notes-input');
      if (notesInput) data.notes = notesInput.value.trim();
      
      // 标签
      const tags = Array.from(document.querySelectorAll('.tag-item')).map(tag => tag.textContent.replace('×', '').trim());
      data.tags = tags;
      
      // 图片
      data.images = this.formData.images || [];
      
      // 时间戳
      data.created_at = new Date().toISOString();
      data.updated_at = new Date().toISOString();
      data.status = 'new';
      
      return data;
    }

    /**
     * 验证表单数据
     */
    validateFormData(data) {
      // 必填字段验证
      if (!data.subject_id) {
        this.showError('请选择科目');
        document.querySelector('#subject-select')?.focus();
        return false;
      }
      
      if (!data.content) {
        this.showError('请输入题目内容');
        document.querySelector('#content-input')?.focus();
        return false;
      }
      
      if (data.content.length < 5) {
        this.showError('题目内容至少需要5个字符');
        document.querySelector('#content-input')?.focus();
        return false;
      }
      
      if (data.content.length > 2000) {
        this.showError('题目内容不能超过2000个字符');
        document.querySelector('#content-input')?.focus();
        return false;
      }
      
      return true;
    }

    /**
     * 添加标签
     */
    addTag() {
      const tagName = prompt('请输入标签名称:');
      if (tagName && tagName.trim()) {
        this.addTagToList(tagName.trim());
      }
    }

    /**
     * 从输入框添加标签
     */
    addTagFromInput() {
      const tagInput = document.querySelector('#tag-input');
      if (tagInput && tagInput.value.trim()) {
        this.addTagToList(tagInput.value.trim());
        tagInput.value = '';
      }
    }

    /**
     * 添加标签到列表
     */
    addTagToList(tagName) {
      const tagsList = document.querySelector('.tags-list');
      if (!tagsList) return;
      
      // 检查是否已存在
      const existingTags = Array.from(tagsList.querySelectorAll('.tag-item')).map(tag => 
        tag.textContent.replace('×', '').trim()
      );
      
      if (existingTags.includes(tagName)) {
        this.showNotification('标签已存在', 'warning');
        return;
      }
      
      // 创建标签元素
      const tagElement = document.createElement('span');
      tagElement.className = 'tag-item';
      tagElement.innerHTML = `
        ${tagName}
        <i class="remove-tag" onclick="this.parentElement.remove()">×</i>
      `;
      
      tagsList.appendChild(tagElement);
      
      console.log('🏷️ 添加标签:', tagName);
    }

    /**
     * 处理图片上传
     */
    handleImageUpload(files) {
      console.log('📷 处理图片上传:', files.length);
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          // 检查文件大小（限制5MB）
          if (file.size > 5 * 1024 * 1024) {
            this.showError(`图片 ${file.name} 太大，请选择小于5MB的图片`);
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const imageData = {
              id: Date.now() + Math.random(),
              url: e.target.result,
              name: file.name,
              size: file.size,
              type: file.type
            };
            
            this.formData.images.push(imageData);
            this.renderImagePreview(imageData);
          };
          reader.readAsDataURL(file);
        } else {
          this.showError(`文件 ${file.name} 不是有效的图片格式`);
        }
      });
    }

    /**
     * 渲染图片预览
     */
    renderImagePreview(imageData) {
      const container = document.querySelector('.image-preview-list');
      if (!container) return;
      
      const imageElement = document.createElement('div');
      imageElement.className = 'image-preview-item';
      imageElement.dataset.id = imageData.id;
      imageElement.innerHTML = `
        <img src="${imageData.url}" alt="${imageData.name}">
        <div class="image-info">
          <div class="image-name">${imageData.name}</div>
          <div class="image-size">${this.formatFileSize(imageData.size)}</div>
        </div>
        <button class="remove-image" onclick="this.removeImage('${imageData.id}')">
          <i class="icon-x"></i>
        </button>
      `;
      
      container.appendChild(imageElement);
    }

    /**
     * 移除图片
     */
    removeImage(imageId) {
      // 从数据中移除
      this.formData.images = this.formData.images.filter(img => img.id !== imageId);
      
      // 从DOM中移除
      const imageElement = document.querySelector(`[data-id="${imageId}"]`);
      if (imageElement) {
        imageElement.remove();
      }
      
      console.log('🗑️ 移除图片:', imageId);
    }

    /**
     * 显示预览
     */
    showPreview() {
      console.log('👁️ 显示预览');
      
      const formData = this.collectFormData();
      
      // 创建预览窗口
      const previewWindow = window.open('', '_blank', 'width=800,height=600');
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>题目预览</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            .preview-header { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .preview-section { margin-bottom: 20px; }
            .preview-label { font-weight: bold; color: #333; }
            .preview-content { margin-top: 5px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
            .tag { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
            .difficulty { padding: 4px 8px; border-radius: 4px; color: white; }
            .difficulty-easy { background: #4caf50; }
            .difficulty-medium { background: #ff9800; }
            .difficulty-hard { background: #f44336; }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h1>题目预览</h1>
            <p>科目: ${formData.subject} | 难度: <span class="difficulty difficulty-${formData.difficulty}">${this.getDifficultyText(formData.difficulty)}</span></p>
          </div>
          
          <div class="preview-section">
            <div class="preview-label">题目内容:</div>
            <div class="preview-content">${formData.content || '未填写'}</div>
          </div>
          
          <div class="preview-section">
            <div class="preview-label">参考答案:</div>
            <div class="preview-content">${formData.answer || '未填写'}</div>
          </div>
          
          <div class="preview-section">
            <div class="preview-label">解题思路:</div>
            <div class="preview-content">${formData.explanation || '未填写'}</div>
          </div>
          
          ${formData.tags.length > 0 ? `
            <div class="preview-section">
              <div class="preview-label">标签:</div>
              <div class="preview-content">
                ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          
          ${formData.chapter ? `
            <div class="preview-section">
              <div class="preview-label">章节:</div>
              <div class="preview-content">${formData.chapter}</div>
            </div>
          ` : ''}
          
          ${formData.source ? `
            <div class="preview-section">
              <div class="preview-label">来源:</div>
              <div class="preview-content">${formData.source}</div>
            </div>
          ` : ''}
        </body>
        </html>
      `);
    }

    /**
     * 重置表单
     */
    resetForm() {
      if (confirm('确定要重置表单吗？所有已填写的内容将被清空。')) {
        console.log('🔄 重置表单');
        
        // 清空表单
        const form = document.querySelector('#question-form');
        if (form) {
          form.reset();
        }
        
        // 清空标签
        const tagsList = document.querySelector('.tags-list');
        if (tagsList) {
          tagsList.innerHTML = '';
        }
        
        // 清空图片
        const imagesList = document.querySelector('.image-preview-list');
        if (imagesList) {
          imagesList.innerHTML = '';
        }
        
        // 重置数据
        this.formData = {
          subject: '',
          content: '',
          answer: '',
          explanation: '',
          difficulty: 'medium',
          tags: [],
          images: [],
          subject_detail: '',
          chapter: '',
          source: ''
        };
        
        // 清除草稿
        this.clearDraft();
        
        // 聚焦到第一个输入框
        const firstInput = document.querySelector('#subject-select');
        if (firstInput) {
          firstInput.focus();
        }
      }
    }

    /**
     * 保存草稿
     */
    saveDraft() {
      try {
        const formData = this.collectFormData();
        localStorage.setItem('question_draft', JSON.stringify(formData));
      } catch (error) {
        console.error('保存草稿失败:', error);
      }
    }

    /**
     * 加载草稿
     */
    loadDraft() {
      try {
        const draft = localStorage.getItem('question_draft');
        if (draft) {
          const data = JSON.parse(draft);
          
          // 恢复表单数据
          if (data.subject_id) {
            const subjectSelect = document.querySelector('#subject-select');
            if (subjectSelect) subjectSelect.value = data.subject_id;
          }
          
          if (data.content) {
            const contentInput = document.querySelector('#content-input');
            if (contentInput) contentInput.value = data.content;
          }
          
          if (data.answer) {
            const answerInput = document.querySelector('#answer-input');
            if (answerInput) answerInput.value = data.answer;
          }
          
          if (data.explanation) {
            const explanationInput = document.querySelector('#explanation-input');
            if (explanationInput) explanationInput.value = data.explanation;
          }
          
          if (data.difficulty) {
            const difficultySelect = document.querySelector('#difficulty-select');
            if (difficultySelect) difficultySelect.value = data.difficulty;
          }
          
          // 恢复标签
          if (data.tags && data.tags.length > 0) {
            data.tags.forEach(tag => this.addTagToList(tag));
          }
          
          console.log('📄 加载草稿成功');
        }
      } catch (error) {
        console.error('加载草稿失败:', error);
      }
    }

    /**
     * 清除草稿
     */
    clearDraft() {
      localStorage.removeItem('question_draft');
    }

    /**
     * 返回上一页
     */
    goBack() {
      // 检查是否有未保存的内容
      const formData = this.collectFormData();
      const hasContent = formData.content || formData.answer || formData.explanation;
      
      if (hasContent && !confirm('有未保存的内容，确定要离开吗？')) {
        return;
      }
      
      if (window.history.length > 1) {
        window.history.back();
      } else {
        if (window.app && window.app.router) {
          window.app.router.navigate('/questions/list');
        }
      }
    }

    /**
     * 显示提交中状态
     */
    showSubmittingState() {
      const saveBtn = document.querySelector('#save-btn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="icon-loader"></i> 保存中...';
      }
      
      const saveContinueBtn = document.querySelector('#save-continue-btn');
      if (saveContinueBtn) {
        saveContinueBtn.disabled = true;
      }
    }

    /**
     * 隐藏提交中状态
     */
    hideSubmittingState() {
      const saveBtn = document.querySelector('#save-btn');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="icon-save"></i> 保存';
      }
      
      const saveContinueBtn = document.querySelector('#save-continue-btn');
      if (saveContinueBtn) {
        saveContinueBtn.disabled = false;
      }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      new QuestionAddPageController();
    });
  } else {
    new QuestionAddPageController();
  }

  // 导出到全局
  window.QuestionAddPageController = QuestionAddPageController;

  // 全局方法供HTML调用
  window.removeImage = function(imageId) {
    if (window.questionAddController) {
      window.questionAddController.removeImage(imageId);
    }
  };

})();