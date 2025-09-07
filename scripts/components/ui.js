/**
 * UI组件库
 * 提供可复用的UI组件
 */

// 通知组件
class Notification {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // 创建通知容器
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-md) var(--spacing-lg);
      margin-bottom: var(--spacing-sm);
      box-shadow: var(--shadow-lg);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 400px;
      word-wrap: break-word;
    `;

    // 设置类型样式
    const typeColors = {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      info: 'var(--color-primary)'
    };
    notification.style.borderLeftColor = typeColors[type];
    notification.style.borderLeftWidth = '4px';

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: var(--spacing-sm);">
        <div style="color: ${typeColors[type]}; margin-top: 2px;">
          ${this.getIcon(type)}
        </div>
        <div style="flex: 1; font-size: var(--font-size-sm); line-height: 1.4;">
          ${message}
        </div>
        <button class="notification-close" style="
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          padding: 0;
          margin-left: var(--spacing-sm);
          font-size: 16px;
          line-height: 1;
        ">×</button>
      </div>
    `;

    this.container.appendChild(notification);

    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.remove(notification));

    // 显示动画
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  remove(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getIcon(type) {
    const icons = {
      success: '✓',
      warning: '⚠',
      error: '✕',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// 模态框组件
class Modal {
  constructor(options = {}) {
    this.options = {
      title: '',
      content: '',
      width: 'auto',
      height: 'auto',
      closable: true,
      maskClosable: true,
      ...options
    };
    this.element = null;
    this.mask = null;
    this.isVisible = false;
  }

  create() {
    // 创建遮罩
    this.mask = document.createElement('div');
    this.mask.className = 'modal-mask';
    this.mask.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 创建模态框
    this.element = document.createElement('div');
    this.element.className = 'modal';
    this.element.style.cssText = `
      background: var(--color-bg-elevated);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 90vw;
      max-height: 90vh;
      width: ${this.options.width};
      height: ${this.options.height};
      transform: scale(0.7);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
    `;

    // 创建头部
    if (this.options.title) {
      const header = document.createElement('div');
      header.className = 'modal-header';
      header.style.cssText = `
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      `;
      header.innerHTML = `
        <h3 style="margin: 0; font-size: var(--font-size-lg); font-weight: var(--font-weight-medium);">
          ${this.options.title}
        </h3>
        ${this.options.closable ? `
          <button class="modal-close" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--color-text-tertiary);
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        ` : ''}
      `;
      this.element.appendChild(header);
    }

    // 创建内容
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
      padding: var(--spacing-lg);
      flex: 1;
      overflow-y: auto;
    `;
    if (typeof this.options.content === 'string') {
      content.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      content.appendChild(this.options.content);
    }
    this.element.appendChild(content);

    this.mask.appendChild(this.element);
    document.body.appendChild(this.mask);

    // 绑定事件
    this.bindEvents();
  }

  bindEvents() {
    // 关闭按钮
    if (this.options.closable) {
      const closeBtn = this.element.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
      }
    }

    // 遮罩点击关闭
    if (this.options.maskClosable) {
      this.mask.addEventListener('click', (e) => {
        if (e.target === this.mask) {
          this.hide();
        }
      });
    }

    // ESC键关闭
    this.escHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }

  show() {
    if (!this.element) {
      this.create();
    }

    this.isVisible = true;
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      this.mask.style.opacity = '1';
      this.element.style.transform = 'scale(1)';
    }, 10);

    return this;
  }

  hide() {
    if (!this.isVisible) return;

    this.isVisible = false;
    document.body.style.overflow = '';
    
    this.mask.style.opacity = '0';
    this.element.style.transform = 'scale(0.7)';

    setTimeout(() => {
      if (this.mask && this.mask.parentNode) {
        this.mask.parentNode.removeChild(this.mask);
      }
      document.removeEventListener('keydown', this.escHandler);
    }, 300);

    return this;
  }

  destroy() {
    this.hide();
    this.element = null;
    this.mask = null;
  }

  setContent(content) {
    const contentEl = this.element.querySelector('.modal-content');
    if (contentEl) {
      if (typeof content === 'string') {
        contentEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        contentEl.innerHTML = '';
        contentEl.appendChild(content);
      }
    }
    return this;
  }
}

// 确认对话框
class ConfirmDialog {
  static show(options = {}) {
    const config = {
      title: '确认',
      message: '确定要执行此操作吗？',
      confirmText: '确定',
      cancelText: '取消',
      type: 'warning',
      ...options
    };

    return new Promise((resolve) => {
      const content = document.createElement('div');
      content.style.cssText = `
        text-align: center;
        padding: var(--spacing-lg) 0;
      `;

      const typeColors = {
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-primary)',
        success: 'var(--color-success)'
      };

      content.innerHTML = `
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${typeColors[config.type]}20;
          color: ${typeColors[config.type]};
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
          font-size: 24px;
        ">
          ${config.type === 'warning' ? '⚠' : config.type === 'error' ? '✕' : config.type === 'success' ? '✓' : 'ℹ'}
        </div>
        <p style="
          margin: 0 0 var(--spacing-xl) 0;
          font-size: var(--font-size-md);
          color: var(--color-text-primary);
          line-height: 1.5;
        ">${config.message}</p>
        <div style="display: flex; gap: var(--spacing-sm); justify-content: center;">
          <button class="confirm-cancel" style="
            padding: var(--spacing-sm) var(--spacing-lg);
            border: 1px solid var(--color-border);
            background: var(--color-bg-container);
            color: var(--color-text-secondary);
            border-radius: var(--border-radius-md);
            cursor: pointer;
            transition: all var(--transition-duration);
          ">${config.cancelText}</button>
          <button class="confirm-ok" style="
            padding: var(--spacing-sm) var(--spacing-lg);
            border: 1px solid ${typeColors[config.type]};
            background: ${typeColors[config.type]};
            color: white;
            border-radius: var(--border-radius-md);
            cursor: pointer;
            transition: all var(--transition-duration);
          ">${config.confirmText}</button>
        </div>
      `;

      const modal = new Modal({
        title: config.title,
        content: content,
        width: '400px',
        closable: false,
        maskClosable: false
      });

      // 绑定按钮事件
      const cancelBtn = content.querySelector('.confirm-cancel');
      const okBtn = content.querySelector('.confirm-ok');

      cancelBtn.addEventListener('click', () => {
        modal.hide();
        resolve(false);
      });

      okBtn.addEventListener('click', () => {
        modal.hide();
        resolve(true);
      });

      modal.show();
    });
  }
}

// 加载组件
class Loading {
  constructor() {
    this.element = null;
    this.isVisible = false;
  }

  show(message = '加载中...') {
    if (this.isVisible) return;

    this.element = document.createElement('div');
    this.element.className = 'loading-overlay';
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    this.element.innerHTML = `
      <div style="
        background: var(--color-bg-elevated);
        padding: var(--spacing-xl);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-lg);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
      ">
        <div style="
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border);
          border-top: 3px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <div style="
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        ">${message}</div>
      </div>
    `;

    document.body.appendChild(this.element);
    this.isVisible = true;

    setTimeout(() => {
      this.element.style.opacity = '1';
    }, 10);
  }

  hide() {
    if (!this.isVisible || !this.element) return;

    this.element.style.opacity = '0';
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
      this.isVisible = false;
    }, 300);
  }
}

// 工具提示组件
class Tooltip {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      content: '',
      placement: 'top',
      trigger: 'hover',
      delay: 100,
      ...options
    };
    this.tooltip = null;
    this.isVisible = false;
    this.init();
  }

  init() {
    if (this.options.trigger === 'hover') {
      this.element.addEventListener('mouseenter', () => this.show());
      this.element.addEventListener('mouseleave', () => this.hide());
    } else if (this.options.trigger === 'click') {
      this.element.addEventListener('click', () => this.toggle());
    }
  }

  create() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    this.tooltip.style.cssText = `
      position: absolute;
      background: var(--color-text-primary);
      color: var(--color-bg-container);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-xs);
      white-space: nowrap;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    `;
    this.tooltip.textContent = this.options.content;
    document.body.appendChild(this.tooltip);
  }

  show() {
    if (this.isVisible) return;

    if (!this.tooltip) {
      this.create();
    }

    this.updatePosition();
    this.isVisible = true;

    setTimeout(() => {
      this.tooltip.style.opacity = '1';
    }, this.options.delay);
  }

  hide() {
    if (!this.isVisible || !this.tooltip) return;

    this.isVisible = false;
    this.tooltip.style.opacity = '0';

    setTimeout(() => {
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
      this.tooltip = null;
    }, 200);
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  updatePosition() {
    const rect = this.element.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    
    let top, left;

    switch (this.options.placement) {
      case 'top':
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + 8;
        break;
      default:
        top = rect.top - tooltipRect.height - 8;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
    }

    this.tooltip.style.top = `${top + window.scrollY}px`;
    this.tooltip.style.left = `${left + window.scrollX}px`;
  }
}

// 分页组件
class Pagination {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      total: 0,
      pageSize: 10,
      current: 1,
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: true,
      onChange: () => {},
      onShowSizeChange: () => {},
      ...options
    };
    this.render();
  }

  render() {
    const totalPages = Math.ceil(this.options.total / this.options.pageSize);
    const current = this.options.current;
    
    this.container.innerHTML = '';
    
    if (totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
    `;

    // 总数显示
    if (this.options.showTotal) {
      const total = document.createElement('span');
      total.style.cssText = `
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-right: var(--spacing-md);
      `;
      total.textContent = `共 ${this.options.total} 条`;
      pagination.appendChild(total);
    }

    // 上一页
    const prevBtn = this.createButton('‹', current > 1, () => {
      if (current > 1) {
        this.changePage(current - 1);
      }
    });
    pagination.appendChild(prevBtn);

    // 页码
    const pages = this.getPageNumbers(current, totalPages);
    pages.forEach(page => {
      if (page === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = `
          padding: var(--spacing-xs) var(--spacing-sm);
          color: var(--color-text-tertiary);
        `;
        pagination.appendChild(ellipsis);
      } else {
        const pageBtn = this.createButton(page, true, () => {
          this.changePage(page);
        }, page === current);
        pagination.appendChild(pageBtn);
      }
    });

    // 下一页
    const nextBtn = this.createButton('›', current < totalPages, () => {
      if (current < totalPages) {
        this.changePage(current + 1);
      }
    });
    pagination.appendChild(nextBtn);

    // 页面大小选择器
    if (this.options.showSizeChanger) {
      const sizeChanger = this.createSizeChanger();
      pagination.appendChild(sizeChanger);
    }

    // 快速跳转
    if (this.options.showQuickJumper) {
      const quickJumper = this.createQuickJumper(totalPages);
      pagination.appendChild(quickJumper);
    }

    this.container.appendChild(pagination);
  }

  createButton(text, enabled, onClick, active = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      min-width: 32px;
      height: 32px;
      border: 1px solid var(--color-border);
      background: ${active ? 'var(--color-primary)' : 'var(--color-bg-container)'};
      color: ${active ? 'white' : enabled ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)'};
      border-radius: var(--border-radius-md);
      cursor: ${enabled ? 'pointer' : 'not-allowed'};
      font-size: var(--font-size-sm);
      transition: all var(--transition-duration);
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    if (enabled && !active) {
      button.addEventListener('mouseenter', () => {
        button.style.borderColor = 'var(--color-primary)';
        button.style.color = 'var(--color-primary)';
      });
      button.addEventListener('mouseleave', () => {
        button.style.borderColor = 'var(--color-border)';
        button.style.color = 'var(--color-text-secondary)';
      });
    }

    if (enabled) {
      button.addEventListener('click', onClick);
    }

    return button;
  }

  createSizeChanger() {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-left: var(--spacing-md);
    `;

    const label = document.createElement('span');
    label.textContent = '每页';
    label.style.cssText = `
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    `;

    const select = document.createElement('select');
    select.style.cssText = `
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      background: var(--color-bg-container);
    `;

    [10, 20, 50, 100].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      option.selected = size === this.options.pageSize;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const newSize = parseInt(e.target.value);
      this.options.onShowSizeChange(this.options.current, newSize);
    });

    const suffix = document.createElement('span');
    suffix.textContent = '条';
    suffix.style.cssText = `
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    `;

    container.appendChild(label);
    container.appendChild(select);
    container.appendChild(suffix);

    return container;
  }

  createQuickJumper(totalPages) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-left: var(--spacing-md);
    `;

    const label = document.createElement('span');
    label.textContent = '跳至';
    label.style.cssText = `
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    `;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = totalPages;
    input.style.cssText = `
      width: 50px;
      padding: var(--spacing-xs);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      text-align: center;
    `;

    const suffix = document.createElement('span');
    suffix.textContent = '页';
    suffix.style.cssText = `
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    `;

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const page = parseInt(input.value);
        if (page >= 1 && page <= totalPages) {
          this.changePage(page);
          input.value = '';
        }
      }
    });

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(suffix);

    return container;
  }

  getPageNumbers(current, total) {
    const pages = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }
    
    return pages;
  }

  changePage(page) {
    this.options.current = page;
    this.options.onChange(page, this.options.pageSize);
    this.render();
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }
}

// 创建全局实例
const notification = new Notification();
const loading = new Loading();

// 导出到全局
if (typeof window !== 'undefined') {
  window.UI = {
    Notification,
    Modal,
    ConfirmDialog,
    Loading,
    Tooltip,
    Pagination,
    notification,
    loading
  };
}

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Notification,
    Modal,
    ConfirmDialog,
    Loading,
    Tooltip,
    Pagination,
    notification,
    loading
  };
}