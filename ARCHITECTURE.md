# 错题本项目重构架构设计

## 当前问题分析

### 现有文件结构问题
1. **index.html (462行)** - 单文件包含所有页面内容，违反单一职责原则
2. **styles.css (2181行)** - 样式文件过大，缺乏模块化组织
3. **script.js** - 功能集中，但相对合理

### 存在的问题
- 文件过大，维护困难
- 功能耦合严重
- 缺乏模块化设计
- 代码复用性差
- 团队协作困难

## 重构目标

1. **模块化设计** - 按功能拆分文件
2. **单一职责** - 每个文件专注一个功能
3. **可维护性** - 清晰的文件组织结构
4. **可扩展性** - 便于添加新功能
5. **代码复用** - 提取公共组件和样式

## 新架构设计

### 目录结构
```
cuotiben/
├── index.html                 # 主入口页面（简化）
├── pages/                     # 功能页面目录
│   ├── questions/            # 错题相关页面
│   │   ├── list.html        # 错题列表页
│   │   ├── detail.html      # 错题详情页（已存在）
│   │   └── add.html         # 添加错题页（已存在）
│   ├── dashboard.html        # 数据看板页
│   ├── ai-explanation.html   # AI讲解页
│   ├── duplicate-cluster.html # 重复题簇页
│   └── ebbinghaus-calendar.html # 复习日历页
├── components/               # 公共组件目录
│   ├── header.html          # 顶部导航组件
│   ├── sidebar.html         # 侧边栏组件
│   └── pagination.html      # 分页组件
├── styles/                   # 样式文件目录
│   ├── base/                # 基础样式
│   │   ├── variables.css    # CSS变量
│   │   ├── reset.css        # 样式重置
│   │   └── typography.css   # 字体样式
│   ├── components/          # 组件样式
│   │   ├── header.css       # 头部样式
│   │   ├── sidebar.css      # 侧边栏样式
│   │   ├── buttons.css      # 按钮样式
│   │   ├── forms.css        # 表单样式
│   │   └── cards.css        # 卡片样式
│   ├── pages/               # 页面样式
│   │   ├── questions.css    # 错题页面样式
│   │   ├── dashboard.css    # 看板样式
│   │   ├── ai-explanation.css # AI讲解样式
│   │   ├── duplicate-cluster.css # 题簇样式
│   │   └── ebbinghaus-calendar.css # 日历样式
│   └── main.css             # 主样式文件（导入所有模块）
├── scripts/                  # JavaScript文件目录
│   ├── core/                # 核心功能
│   │   ├── data-manager.js  # 数据管理
│   │   ├── ui-renderer.js   # UI渲染
│   │   └── app-controller.js # 应用控制
│   ├── pages/               # 页面脚本
│   │   ├── questions.js     # 错题页面逻辑
│   │   ├── dashboard.js     # 看板逻辑
│   │   └── ai-explanation.js # AI讲解逻辑
│   └── utils/               # 工具函数
│       └── helpers.js       # 辅助函数
└── assets/                   # 静态资源
    ├── icons/               # 图标文件
    └── images/              # 图片文件
```

### 页面职责划分

#### 1. index.html - 主入口页面
- **职责**: 应用入口，路由控制
- **内容**: 基础HTML结构，导入样式和脚本
- **大小**: 控制在100行以内

#### 2. pages/questions/list.html - 错题列表页
- **职责**: 错题展示和筛选
- **功能**: 错题卡片、筛选器、分页
- **复用**: header、sidebar组件

#### 3. pages/dashboard.html - 数据看板页
- **职责**: 学习数据展示
- **功能**: 统计图表、趋势分析

#### 4. pages/ai-explanation.html - AI讲解页
- **职责**: AI交互和讲解
- **功能**: 聊天界面、语音播放

#### 5. pages/duplicate-cluster.html - 重复题簇页
- **职责**: 题目关联分析
- **功能**: 力导向图、簇管理

#### 6. pages/ebbinghaus-calendar.html - 复习日历页
- **职责**: 复习计划管理
- **功能**: 日历展示、间隔设置

### 组件化设计

#### 公共组件
1. **Header组件** - 顶部导航栏
2. **Sidebar组件** - 侧边栏筛选器
3. **Pagination组件** - 分页器
4. **QuestionCard组件** - 错题卡片

#### 样式模块化
1. **基础样式** - 变量、重置、字体
2. **组件样式** - 按组件拆分
3. **页面样式** - 按页面拆分
4. **工具样式** - 通用工具类

### 脚本模块化

#### 核心模块
1. **DataManager** - 数据管理和API
2. **UIRenderer** - UI渲染和更新
3. **AppController** - 应用状态控制
4. **Router** - 页面路由管理

#### 页面模块
1. **QuestionsPage** - 错题页面逻辑
2. **DashboardPage** - 看板页面逻辑
3. **AIPage** - AI页面逻辑

## 实施计划

### 第一阶段：基础架构
1. 创建目录结构
2. 拆分CSS变量和基础样式
3. 提取公共组件HTML

### 第二阶段：页面拆分
1. 拆分index.html为独立页面
2. 创建页面专用样式文件
3. 调整页面间导航逻辑

### 第三阶段：脚本重构
1. 拆分script.js为模块
2. 实现模块间通信
3. 优化加载性能

### 第四阶段：测试优化
1. 功能测试
2. 性能优化
3. 代码清理

## 技术规范

### 命名规范
- 文件名：kebab-case（如：question-list.html）
- CSS类名：BEM规范（如：.question-card__title）
- JavaScript：camelCase（如：questionManager）

### 代码组织
- 每个文件不超过300行
- 功能相关的代码放在同一模块
- 公共代码提取到共享模块

### 性能考虑
- 按需加载页面资源
- CSS和JS文件合理拆分
- 避免重复代码

## 预期收益

1. **开发效率提升** - 模块化开发，并行协作
2. **维护成本降低** - 代码结构清晰，定位问题快速
3. **扩展性增强** - 新功能开发更容易
4. **代码质量提升** - 单一职责，代码复用
5. **团队协作改善** - 减少代码冲突，提高协作效率