/**
 * 错题本应用工具函数库
 * 提供常用的工具函数和辅助方法
 */

/**
 * 日期时间工具
 */
const DateUtils = {
  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 获取相对时间
   * @param {Date|string|number} date - 日期
   * @returns {string} 相对时间字符串
   */
  getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;
    
    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < week) {
      return `${Math.floor(diff / day)}天前`;
    } else if (diff < month) {
      return `${Math.floor(diff / week)}周前`;
    } else if (diff < year) {
      return `${Math.floor(diff / month)}个月前`;
    } else {
      return `${Math.floor(diff / year)}年前`;
    }
  },

  /**
   * 获取日期范围
   * @param {string} range - 范围类型 (today, week, month, year)
   * @returns {Object} 包含开始和结束日期的对象
   */
  getDateRange(range) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  }
};

/**
 * 字符串工具
 */
const StringUtils = {
  /**
   * 截断字符串
   * @param {string} str - 原字符串
   * @param {number} length - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的字符串
   */
  truncate(str, length = 100, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * 高亮关键词
   * @param {string} text - 原文本
   * @param {string} keyword - 关键词
   * @returns {string} 高亮后的HTML
   */
  highlight(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * 转换为驼峰命名
   * @param {string} str - 原字符串
   * @returns {string} 驼峰命名字符串
   */
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  },

  /**
   * 转换为短横线命名
   * @param {string} str - 原字符串
   * @returns {string} 短横线命名字符串
   */
  toKebabCase(str) {
    return str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
  },

  /**
   * 生成随机字符串
   * @param {number} length - 长度
   * @returns {string} 随机字符串
   */
  randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

/**
 * 数组工具
 */
const ArrayUtils = {
  /**
   * 数组去重
   * @param {Array} arr - 原数组
   * @param {string} key - 对象数组的去重键
   * @returns {Array} 去重后的数组
   */
  unique(arr, key = null) {
    if (!key) {
      return [...new Set(arr)];
    }
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  /**
   * 数组分组
   * @param {Array} arr - 原数组
   * @param {string|Function} key - 分组键或函数
   * @returns {Object} 分组后的对象
   */
  groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  },

  /**
   * 数组排序
   * @param {Array} arr - 原数组
   * @param {string} key - 排序键
   * @param {string} order - 排序方向 (asc, desc)
   * @returns {Array} 排序后的数组
   */
  sortBy(arr, key, order = 'asc') {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) {
        return order === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  /**
   * 数组分页
   * @param {Array} arr - 原数组
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Object} 分页结果
   */
  paginate(arr, page = 1, size = 10) {
    const total = arr.length;
    const totalPages = Math.ceil(total / size);
    const start = (page - 1) * size;
    const end = start + size;
    const data = arr.slice(start, end);
    
    return {
      data,
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
};

/**
 * 对象工具
 */
const ObjectUtils = {
  /**
   * 深拷贝
   * @param {any} obj - 原对象
   * @returns {any} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    if (typeof obj === 'object') {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
  },

  /**
   * 对象合并
   * @param {Object} target - 目标对象
   * @param {...Object} sources - 源对象
   * @returns {Object} 合并后的对象
   */
  merge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.merge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return this.merge(target, ...sources);
  },

  /**
   * 判断是否为对象
   * @param {any} item - 待判断的值
   * @returns {boolean} 是否为对象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  /**
   * 获取嵌套属性值
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径
   * @param {any} defaultValue - 默认值
   * @returns {any} 属性值
   */
  get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  },

  /**
   * 设置嵌套属性值
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径
   * @param {any} value - 属性值
   */
  set(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
};

/**
 * 数字工具
 */
const NumberUtils = {
  /**
   * 格式化数字
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的数字
   */
  format(num, decimals = 0) {
    return num.toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * 转换为百分比
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @returns {string} 百分比字符串
   */
  toPercent(num, decimals = 1) {
    return (num * 100).toFixed(decimals) + '%';
  },

  /**
   * 生成随机数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机数
   */
  random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  },

  /**
   * 生成随机整数
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机整数
   */
  randomInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 限制数字范围
   * @param {number} num - 数字
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的数字
   */
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
};

/**
 * DOM 工具
 */
const DOMUtils = {
  /**
   * 查询元素
   * @param {string} selector - 选择器
   * @param {Element} context - 上下文元素
   * @returns {Element|null} 元素
   */
  $(selector, context = document) {
    return context.querySelector(selector);
  },

  /**
   * 查询所有元素
   * @param {string} selector - 选择器
   * @param {Element} context - 上下文元素
   * @returns {NodeList} 元素列表
   */
  $$(selector, context = document) {
    return context.querySelectorAll(selector);
  },

  /**
   * 创建元素
   * @param {string} tag - 标签名
   * @param {Object} attrs - 属性对象
   * @param {string} content - 内容
   * @returns {Element} 创建的元素
   */
  createElement(tag, attrs = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },

  /**
   * 添加事件监听器
   * @param {Element|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   * @param {Object} options - 选项
   */
  on(element, event, handler, options = {}) {
    const el = typeof element === 'string' ? this.$(element) : element;
    if (el) {
      el.addEventListener(event, handler, options);
    }
  },

  /**
   * 移除事件监听器
   * @param {Element|string} element - 元素或选择器
   * @param {string} event - 事件名
   * @param {Function} handler - 处理函数
   */
  off(element, event, handler) {
    const el = typeof element === 'string' ? this.$(element) : element;
    if (el) {
      el.removeEventListener(event, handler);
    }
  },

  /**
   * 获取元素位置
   * @param {Element} element - 元素
   * @returns {Object} 位置信息
   */
  getPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * 平滑滚动到元素
   * @param {Element|string} element - 元素或选择器
   * @param {Object} options - 选项
   */
  scrollTo(element, options = {}) {
    const el = typeof element === 'string' ? this.$(element) : element;
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options
      });
    }
  }
};

/**
 * 存储工具
 */
const StorageUtils = {
  /**
   * 设置本地存储
   * @param {string} key - 键
   * @param {any} value - 值
   */
  setLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('设置本地存储失败:', error);
    }
  },

  /**
   * 获取本地存储
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  getLocal(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('获取本地存储失败:', error);
      return defaultValue;
    }
  },

  /**
   * 移除本地存储
   * @param {string} key - 键
   */
  removeLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('移除本地存储失败:', error);
    }
  },

  /**
   * 设置会话存储
   * @param {string} key - 键
   * @param {any} value - 值
   */
  setSession(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('设置会话存储失败:', error);
    }
  },

  /**
   * 获取会话存储
   * @param {string} key - 键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  getSession(key, defaultValue = null) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('获取会话存储失败:', error);
      return defaultValue;
    }
  },

  /**
   * 移除会话存储
   * @param {string} key - 键
   */
  removeSession(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('移除会话存储失败:', error);
    }
  }
};

/**
 * 验证工具
 */
const ValidationUtils = {
  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  /**
   * 验证手机号
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isPhone(phone) {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  },

  /**
   * 验证身份证号
   * @param {string} idCard - 身份证号
   * @returns {boolean} 是否有效
   */
  isIdCard(idCard) {
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  },

  /**
   * 验证URL
   * @param {string} url - URL地址
   * @returns {boolean} 是否有效
   */
  isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 验证密码强度
   * @param {string} password - 密码
   * @returns {Object} 验证结果
   */
  checkPasswordStrength(password) {
    const result = {
      score: 0,
      level: 'weak',
      suggestions: []
    };
    
    if (password.length >= 8) {
      result.score += 1;
    } else {
      result.suggestions.push('密码长度至少8位');
    }
    
    if (/[a-z]/.test(password)) {
      result.score += 1;
    } else {
      result.suggestions.push('包含小写字母');
    }
    
    if (/[A-Z]/.test(password)) {
      result.score += 1;
    } else {
      result.suggestions.push('包含大写字母');
    }
    
    if (/\d/.test(password)) {
      result.score += 1;
    } else {
      result.suggestions.push('包含数字');
    }
    
    if (/[^\w\s]/.test(password)) {
      result.score += 1;
    } else {
      result.suggestions.push('包含特殊字符');
    }
    
    if (result.score >= 4) {
      result.level = 'strong';
    } else if (result.score >= 2) {
      result.level = 'medium';
    }
    
    return result;
  }
};

/**
 * 文件工具
 */
const FileUtils = {
  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * 获取文件扩展名
   * @param {string} filename - 文件名
   * @returns {string} 扩展名
   */
  getExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  /**
   * 读取文件为Base64
   * @param {File} file - 文件对象
   * @returns {Promise<string>} Base64字符串
   */
  readAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * 下载文件
   * @param {string} url - 文件URL
   * @param {string} filename - 文件名
   */
  download(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 导出所有工具
window.Utils = {
  Date: DateUtils,
  String: StringUtils,
  Array: ArrayUtils,
  Object: ObjectUtils,
  Number: NumberUtils,
  DOM: DOMUtils,
  Storage: StorageUtils,
  Validation: ValidationUtils,
  File: FileUtils
};

// 兼容模块化导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DateUtils,
    StringUtils,
    ArrayUtils,
    ObjectUtils,
    NumberUtils,
    DOMUtils,
    StorageUtils,
    ValidationUtils,
    FileUtils
  };
}