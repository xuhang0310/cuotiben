# 后端数据结构设计

## 1. 数据库表结构设计

### 1.1 用户表 (users)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);
```

### 1.2 学科表 (subjects)
```sql
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '学科名称，如数学、语文、英语等',
  description TEXT COMMENT '学科描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

### 1.3 题型表 (question_types)
```sql
CREATE TABLE question_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE COMMENT '题型名称，如选择题、填空题、解答题等',
  description TEXT COMMENT '题型描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type_name (type_name)
);
```

### 1.4 题目表 (questions)
```sql
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '题目所属用户ID',
  title VARCHAR(255) NOT NULL COMMENT '题目标题',
  content TEXT NOT NULL COMMENT '题目内容',
  question_type_id INT NOT NULL COMMENT '题型ID',
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium' COMMENT '难度等级',
  subject_id INT NOT NULL COMMENT '学科ID',
  explanation TEXT COMMENT '题目解析',
  correct_answer TEXT COMMENT '正确答案',
  image_url TEXT COMMENT '题目图片URL，可选',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否收藏',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_subject_difficulty (subject_id, difficulty),
  INDEX idx_created_at (created_at),
  INDEX idx_is_favorite (is_favorite)
);


-- 添加图片信息表
CREATE TABLE question_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL COMMENT '题目ID',
  original_filename VARCHAR(255) COMMENT '原始文件名',
  file_size INT COMMENT '文件大小（字节）',
  file_type VARCHAR(50) COMMENT '文件类型（image/jpeg等）',
  storage_path VARCHAR(500) NOT NULL COMMENT '存储路径',
  cdn_url VARCHAR(500) COMMENT 'CDN访问URL',
  upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_processed BOOLEAN DEFAULT FALSE COMMENT '是否已处理（压缩、OCR等）',
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id)
);
```

### 1.5 题目选项表 (question_options)
```sql
CREATE TABLE question_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL COMMENT '题目ID',
  option_label VARCHAR(10) NOT NULL COMMENT '选项标签，如A、B、C、D',
  option_text TEXT NOT NULL COMMENT '选项内容',
  is_correct BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为正确答案',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id)
);
```

### 1.6 标签表 (tags)
```sql
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
  description TEXT COMMENT '标签描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

### 1.7 题目标签关联表 (question_tags)
```sql
CREATE TABLE question_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL COMMENT '题目ID',
  tag_id INT NOT NULL COMMENT '标签ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY uk_question_tag (question_id, tag_id),
  INDEX idx_question_id (question_id),
  INDEX idx_tag_id (tag_id)
);
```

### 1.8 练习记录表 (practice_records)
```sql
CREATE TABLE practice_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  question_id INT NOT NULL COMMENT '题目ID',
  schedule_id INT NULL COMMENT '复习计划ID，练习时为NULL',
  record_type ENUM('practice', 'review') NOT NULL,
  user_answer JSON COMMENT '用户答案JSON格式，支持不同题型',
  correct_answer JSON COMMENT '正确答案JSON格式，便于对比',
  is_correct BOOLEAN NOT NULL COMMENT '是否完全正确',
  partial_score DECIMAL(5,2) DEFAULT 0 COMMENT '部分得分（0-100）',
  max_score DECIMAL(5,2) DEFAULT 100 COMMENT '满分分值',
  time_spent INT DEFAULT 0 COMMENT '用时（秒）',
  answer_details JSON COMMENT '答案详情，包含各部分得分情况',
  practiced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '练习时间',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_question_id (question_id),
  INDEX idx_practiced_at (practiced_at),
  INDEX idx_is_correct (is_correct),
  INDEX idx_partial_score (partial_score)
);
```

### 1.9 答案模板表 (answer_templates)
```sql
CREATE TABLE answer_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_type_id INT NOT NULL COMMENT '题型ID',
  template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
  answer_schema JSON NOT NULL COMMENT '答案结构模板JSON',
  validation_rules JSON COMMENT '验证规则JSON',
  scoring_rules JSON COMMENT '评分规则JSON',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE CASCADE,
  INDEX idx_question_type_id (question_type_id)
);
```

### 1.10 复习计划表 (question_images)

```sql
CREATE TABLE review_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  current_level INT DEFAULT 0 COMMENT '当前复习级别(0-10)',
  next_review_time DATETIME NOT NULL COMMENT '下次复习时间',
  review_count INT DEFAULT 0 COMMENT '已复习次数',
  mastery_score DECIMAL(3,2) DEFAULT 0.00 COMMENT '掌握度评分(0-1)',
  difficulty_factor DECIMAL(3,2) DEFAULT 1.00 COMMENT '难度系数',
  last_review_time DATETIME COMMENT '上次复习时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  UNIQUE KEY unique_user_question (user_id, question_id),
  INDEX idx_next_review (next_review_time),
  INDEX idx_user_review (user_id, next_review_time)
);
```










### 1.10 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  study_goal INT DEFAULT 10 COMMENT '每日学习目标',
  preferred_subjects JSON COMMENT '偏好科目JSON数组',
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '偏好难度',
  theme ENUM('light', 'dark', 'auto') DEFAULT 'light' COMMENT '主题设置',
  language VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言设置',
  font_size ENUM('small', 'medium', 'large') DEFAULT 'medium' COMMENT '字体大小',
  enable_notifications BOOLEAN DEFAULT TRUE COMMENT '是否启用通知',
  study_reminder BOOLEAN DEFAULT TRUE COMMENT '是否启用学习提醒',
  reminder_time TIME DEFAULT '20:00:00' COMMENT '提醒时间',
  auto_backup BOOLEAN DEFAULT TRUE COMMENT '是否自动备份',
  backup_frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily' COMMENT '备份频率',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_settings (user_id)
);
```

## 2. 数据模型定义 (TypeScript)

### 2.1 用户模型
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSettings {
  id: number;
  userId: number;
  studyGoal: number;
  preferredSubjects: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  enableNotifications: boolean;
  studyReminder: boolean;
  reminderTime: string; // HH:MM format
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 学科模型
```typescript
interface Subject {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}

interface QuestionType {
  id: number;
  typeName: string;
  description?: string;
  createdAt: Date;
}

interface Tag {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}
```

### 2.3 题目模型
```typescript
interface Question {
  id: number;
  userId: number;
  title: string;
  content: string;
  questionTypeId: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subjectId: number;
  explanation?: string;
  correctAnswer?: string;
  imageUrl?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  subject?: Subject;
  questionType?: QuestionType;
  options?: QuestionOption[];
  tags?: Tag[];
  // 虚拟字段（不在数据库中存储，通过关联查询计算）
  practiceCount: number;
  correctCount: number;
  lastPracticeAt?: Date;
}

interface QuestionOption {
  id: number;
  questionId: number;
  optionLabel: string; // A, B, C, D
  optionText: string;
  isCorrect: boolean;
  createdAt: Date;
}
```

### 2.4 练习记录模型
```typescript
interface PracticeRecord {
  id: number;
  userId: number;
  questionId: number;
  userAnswer: QuestionAnswer; // JSON格式，支持不同题型
  correctAnswer: QuestionAnswer; // 正确答案JSON格式
  isCorrect: boolean;
  partialScore: number; // 部分得分（0-100）
  maxScore: number; // 满分分值
  timeSpent: number; // 用时（秒）
  answerDetails: AnswerDetails; // 答案详情
  practicedAt: Date;
}

// 通用答案接口
interface QuestionAnswer {
  type: 'single_choice' | 'multiple_choice' | 'fill_blank' | 'short_answer' | 'essay';
  content: any; // 具体内容根据题型而定
}

// 选择题答案
interface SingleChoiceAnswer extends QuestionAnswer {
  type: 'single_choice';
  content: {
    selectedOption: string; // 选中的选项，如 'A'
  };
}

interface MultipleChoiceAnswer extends QuestionAnswer {
  type: 'multiple_choice';
  content: {
    selectedOptions: string[]; // 选中的选项数组，如 ['A', 'C']
  };
}

// 填空题答案
interface FillBlankAnswer extends QuestionAnswer {
  type: 'fill_blank';
  content: {
    blanks: {
      index: number; // 空的序号
      answer: string; // 填入的答案
    }[];
  };
}

// 简答题答案
interface ShortAnswer extends QuestionAnswer {
  type: 'short_answer';
  content: {
    text: string; // 答案文本
    keywords?: string[]; // 关键词（用于自动评分）
  };
}

// 作文题答案
interface EssayAnswer extends QuestionAnswer {
  type: 'essay';
  content: {
    text: string; // 作文内容
    wordCount: number; // 字数
    structure?: {
      introduction: string;
      body: string;
      conclusion: string;
    };
  };
}

// 答案详情
interface AnswerDetails {
  breakdown: {
    part: string; // 部分名称
    score: number; // 得分
    maxScore: number; // 满分
    feedback?: string; // 反馈
  }[];
  totalScore: number;
  accuracy: number; // 准确率
  feedback: string; // 总体反馈
}

// 答案模板
interface AnswerTemplate {
  id: number;
  questionTypeId: number;
  templateName: string;
  answerSchema: any; // JSON Schema
  validationRules: any; // 验证规则
  scoringRules: any; // 评分规则
  createdAt: Date;
  updatedAt: Date;
}
```

## 3. API 响应数据结构

### 3.1 题目列表响应
```typescript
interface QuestionListResponse {
  questions: Question[];
  total: number;
  page: number;
  pageSize: number;
}

interface QuestionDetailResponse {
  question: Question;
  relatedQuestions: Question[]; // 相关题目
}
```

### 3.2 练习记录响应
```typescript
interface PracticeRecordResponse {
  id: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  practicedAt: Date;
}

interface PracticeStatsResponse {
  totalPractice: number;
  correctCount: number;
  averageTime: number;
  accuracy: number;
}
```

### 3.3 统计数据响应
```typescript
interface StatisticsResponse {
  totalQuestions: number;
  totalPracticed: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  subjectStats: {
    subjectId: number;
    subjectName: string;
    total: number;
    correct: number;
    totalTime: number;
    accuracy: number;
  }[];
  difficultyStats: {
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
    correct: number;
    accuracy: number;
  }[];
  dailyStats: {
    date: string;
    total: number;
    correct: number;
    accuracy: number;
    totalTime: number;
  }[];
  weeklyStats: {
    week: string;
    total: number;
    correct: number;
    accuracy: number;
    totalTime: number;
  }[];
  monthlyStats: {
    month: string;
    total: number;
    correct: number;
    accuracy: number;
    totalTime: number;
  }[];
}
```

## 4. 数据库优化建议

### 4.1 索引策略

已在表结构中包含的索引：

1. **主键索引**：所有表的 `id` 字段
2. **唯一索引**：
   - `users.username`、`users.email`
   - `subjects.name`、`question_types.type_name`、`tags.name`
   - `user_settings.user_id`
   - `question_tags(question_id, tag_id)` 联合唯一索引

3. **外键索引**：所有外键字段自动创建索引

4. **查询优化索引**：
   - `questions(subject_id, difficulty)` 联合索引
   - `questions.created_at`、`questions.is_favorite`
   - `practice_records.practiced_at`、`practice_records.is_correct`

### 4.2 性能优化建议

1. **分页查询优化**：使用 `LIMIT` 和 `OFFSET` 时，配合 `ORDER BY id` 提高性能
2. **统计查询优化**：对于频繁的统计查询，可考虑创建汇总表或使用缓存
3. **图片存储**：`image_url` 建议存储相对路径，实际文件存储在CDN或对象存储服务
4. **JSON字段**：`user_settings.preferred_subjects` 使用JSON类型，便于查询和更新

### 4.3 数据完整性约束

1. **外键约束**：确保数据引用完整性
2. **枚举约束**：限制 `difficulty`、`theme` 等字段的取值范围
3. **非空约束**：关键字段设置 `NOT NULL`
4. **唯一约束**：防止重复数据

### 4.4 扩展性考虑

1. **水平分表**：当数据量过大时，可按用户ID或时间分表
2. **读写分离**：使用主从复制提高查询性能
3. **缓存策略**：对热点数据使用Redis缓存
4. **归档策略**：定期归档历史练习记录

## 5. 题型适配与答案存储方案

### 5.1 设计思路

原始的 `practice_records` 表使用简单的 `TEXT` 字段存储用户答案，存在以下问题：

1. **数据结构不灵活**：无法适应不同题型的复杂答案结构
2. **评分困难**：无法支持部分得分和详细的评分反馈
3. **查询不便**：难以对答案内容进行结构化查询和分析
4. **扩展性差**：新增题型时需要修改表结构

### 5.2 优化方案

#### 核心改进
1. **JSON格式存储**：使用JSON字段存储结构化答案数据
2. **部分得分支持**：添加 `partial_score` 字段支持部分得分
3. **答案模板系统**：通过 `answer_templates` 表定义不同题型的答案结构
4. **详细评分反馈**：`answer_details` 字段存储分项得分和反馈

### 5.3 不同题型的答案存储格式

#### 5.3.1 单选题 (Single Choice)
```json
{
  "type": "single_choice",
  "content": {
    "selectedOption": "B"
  }
}
```

**评分逻辑**：
- 选择正确：100分
- 选择错误：0分

#### 5.3.2 多选题 (Multiple Choice)
```json
{
  "type": "multiple_choice",
  "content": {
    "selectedOptions": ["A", "C", "D"]
  }
}
```

**评分逻辑**：
- 完全正确：100分
- 部分正确：按比例得分
- 有错选：扣除相应分数

#### 5.3.3 填空题 (Fill in the Blank)
```json
{
  "type": "fill_blank",
  "content": {
    "blanks": [
      { "index": 1, "answer": "氢气" },
      { "index": 2, "answer": "氧气" },
      { "index": 3, "answer": "水" }
    ]
  }
}
```

**评分逻辑**：
- 每个空独立评分
- 支持同义词和近似匹配
- 总分为各空得分之和

#### 5.3.4 简答题 (Short Answer)
```json
{
  "type": "short_answer",
  "content": {
    "text": "光合作用是植物利用光能将二氧化碳和水转化为葡萄糖和氧气的过程",
    "keywords": ["光合作用", "光能", "二氧化碳", "水", "葡萄糖", "氧气"]
  }
}
```

**评分逻辑**：
- 关键词匹配得分
- 语义相似度分析
- 答案完整性评估

#### 5.3.5 作文题 (Essay)
```json
{
  "type": "essay",
  "content": {
    "text": "春天是一个充满希望的季节...",
    "wordCount": 350,
    "structure": {
      "introduction": "春天是一个充满希望的季节",
      "body": "春天的景色描述和感受",
      "conclusion": "总结春天的美好"
    }
  }
}
```

**评分逻辑**：
- 结构完整性（开头、正文、结尾）
- 内容相关性和深度
- 语言表达和文采
- 字数要求

### 5.4 答案详情存储格式

```json
{
  "breakdown": [
    {
      "part": "第1空",
      "score": 10,
      "maxScore": 10,
      "feedback": "答案正确"
    },
    {
      "part": "第2空",
      "score": 8,
      "maxScore": 10,
      "feedback": "答案基本正确，但表述不够准确"
    }
  ],
  "totalScore": 18,
  "accuracy": 0.9,
  "feedback": "整体答题情况良好，注意第2空的表述准确性"
}
```

### 5.5 答案模板配置示例

#### 填空题模板
```json
{
  "answerSchema": {
    "type": "object",
    "properties": {
      "type": { "const": "fill_blank" },
      "content": {
        "type": "object",
        "properties": {
          "blanks": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "index": { "type": "number" },
                "answer": { "type": "string" }
              },
              "required": ["index", "answer"]
            }
          }
        },
        "required": ["blanks"]
      }
    },
    "required": ["type", "content"]
  },
  "validationRules": {
    "maxBlankLength": 100,
    "requiredBlanks": [1, 2, 3]
  },
  "scoringRules": {
    "scorePerBlank": 10,
    "partialCredit": true,
    "synonymMatching": true,
    "caseSensitive": false
  }
}
```

### 5.6 实现优势

1. **灵活性**：JSON格式可以适应各种复杂的答案结构
2. **可扩展性**：新增题型只需添加新的答案模板，无需修改表结构
3. **精确评分**：支持部分得分和详细的评分反馈
4. **数据分析**：结构化数据便于进行学习分析和统计
5. **用户体验**：详细的评分反馈帮助用户了解答题情况

### 5.7 性能考虑

1. **索引优化**：为JSON字段中的常用查询路径创建函数索引
2. **数据压缩**：对于长文本答案，考虑使用压缩存储
3. **缓存策略**：将常用的答案模板缓存到内存中
4. **异步评分**：对于复杂题型，采用异步评分机制