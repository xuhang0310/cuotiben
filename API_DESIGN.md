# RESTful API 设计

## 1. 认证相关接口

### 1.1 用户注册
- **URL**: `POST /api/auth/register`
- **请求参数**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "number",
        "username": "string",
        "email": "string"
      },
      "token": "string"
    }
  }
  ```

### 1.2 用户登录
- **URL**: `POST /api/auth/login`
- **请求参数**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "number",
        "username": "string",
        "email": "string"
      },
      "token": "string"
    }
  }
  ```

### 1.3 获取当前用户信息
- **URL**: `GET /api/auth/me`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "avatarUrl": "string"
      }
    }
  }
  ```

## 2. 题目管理接口

### 2.1 获取题目列表
- **URL**: `GET /api/questions`
- **查询参数**:
  - `page`: 页码 (默认: 1)
  - `pageSize`: 每页数量 (默认: 10)
  - `keyword`: 搜索关键词
  - `subject`: 科目筛选
  - `difficulty`: 难度筛选
  - `isFavorite`: 是否收藏
  - `tags`: 标签筛选 (多个标签用逗号分隔)
  - `startDate`: 创建日期起始
  - `endDate`: 创建日期结束
  - `practiceStatus`: 练习状态 (all, practiced, not_practiced)
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "questions": [
        {
          "id": "number",
          "title": "string",
          "content": "string",
          "options": ["string"],
          "correctAnswer": "string",
          "explanation": "string",
          "difficulty": "easy|medium|hard",
          "subject": "string",
          "tags": ["string"],
          "isFavorite": "boolean",
          "createdAt": "date",
          "updatedAt": "date",
          "practiceCount": "number",
          "correctCount": "number",
          "lastPracticeAt": "date"
        }
      ],
      "total": "number",
      "page": "number",
      "pageSize": "number"
    }
  }
  ```

### 2.2 获取题目详情
- **URL**: `GET /api/questions/{id}`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "question": {
        "id": "number",
        "title": "string",
        "content": "string",
        "options": ["string"],
        "correctAnswer": "string",
        "explanation": "string",
        "difficulty": "easy|medium|hard",
        "subject": "string",
        "tags": ["string"],
        "isFavorite": "boolean",
        "createdAt": "date",
        "updatedAt": "date",
        "practiceCount": "number",
        "correctCount": "number",
        "lastPracticeAt": "date"
      },
      "relatedQuestions": [
        // 相关题目列表，结构同上
      ]
    }
  }
  ```

### 2.3 创建题目
- **URL**: `POST /api/questions`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "title": "string",
    "content": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "explanation": "string",
    "difficulty": "easy|medium|hard",
    "subject": "string",
    "tags": ["string"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "question": {
        // 新创建的题目信息
      }
    }
  }
  ```

### 2.4 更新题目
- **URL**: `PUT /api/questions/{id}`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "title": "string",
    "content": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "explanation": "string",
    "difficulty": "easy|medium|hard",
    "subject": "string",
    "tags": ["string"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "question": {
        // 更新后的题目信息
      }
    }
  }
  ```

### 2.5 删除题目
- **URL**: `DELETE /api/questions/{id}`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "message": "题目删除成功"
  }
  ```

### 2.6 切换收藏状态
- **URL**: `POST /api/questions/{id}/toggle-favorite`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "isFavorite": "boolean"
    }
  }
  ```

## 3. 练习接口

### 3.1 开始练习
- **URL**: `POST /api/practice/start`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "mode": "all|wrong|favorite|random",
    "count": "number",
    "subject": "string",
    "difficulty": "easy|medium|hard"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "practiceQuestions": [
        // 题目列表
      ]
    }
  }
  ```

### 3.2 提交答案
- **URL**: `POST /api/practice/submit`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "questionId": "number",
    "userAnswer": "string",
    "timeSpent": "number" // 用时（秒）
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "isCorrect": "boolean",
      "correctAnswer": "string"
    }
  }
  ```

### 3.3 获取练习统计数据
- **URL**: `GET /api/practice/stats`
- **查询参数**:
  - `days`: 天数 (默认: 7)
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "totalPractice": "number",
      "correctCount": "number",
      "averageTime": "number"
    }
  }
  ```

## 4. 统计接口

### 4.1 获取统计数据
- **URL**: `GET /api/statistics`
- **查询参数**:
  - `timeRange`: 时间范围 (week, month, all)
  - `subject`: 科目筛选
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "basicStats": {
        "totalQuestions": "number",
        "totalPracticed": "number",
        "totalAttempts": "number",
        "correctAttempts": "number",
        "accuracy": "number",
        "totalTime": "number",
        "averageTime": "number"
      },
      "subjectStats": [
        {
          "subject": "string",
          "total": "number",
          "correct": "number",
          "totalTime": "number"
        }
      ],
      "difficultyStats": [
        {
          "difficulty": "string",
          "count": "number",
          "correct": "number"
        }
      ],
      "dailyStats": [
        {
          "date": "string",
          "total": "number",
          "correct": "number",
          "accuracy": "number"
        }
      ]
    }
  }
  ```

## 5. 设置接口

### 5.1 获取用户设置
- **URL**: `GET /api/settings`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "settings": {
        "studyGoal": "number",
        "preferredSubjects": ["string"],
        "difficulty": "easy|medium|hard",
        "theme": "light|dark|auto",
        "language": "string",
        "fontSize": "small|medium|large",
        "enableNotifications": "boolean",
        "studyReminder": "boolean",
        "reminderTime": "string",
        "autoBackup": "boolean",
        "backupFrequency": "daily|weekly|monthly"
      }
    }
  }
  ```

### 5.2 更新用户设置
- **URL**: `PUT /api/settings`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "studyGoal": "number",
    "preferredSubjects": ["string"],
    "difficulty": "easy|medium|hard",
    "theme": "light|dark|auto",
    "language": "string",
    "fontSize": "small|medium|large",
    "enableNotifications": "boolean",
    "studyReminder": "boolean",
    "reminderTime": "string",
    "autoBackup": "boolean",
    "backupFrequency": "daily|weekly|monthly"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "settings": {
        // 更新后的设置
      }
    }
  }
  ```

## 6. 拍照录题接口

### 6.1 OCR识别
- **URL**: `POST /api/ocr/recognize`
- **请求头**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **请求参数**:
  - `image`: 图片文件
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "recognizedText": "string"
    }
  }
  ```

### 6.2 保存OCR识别的题目
- **URL**: `POST /api/ocr/save-question`
- **请求头**: `Authorization: Bearer <token>`
- **请求参数**:
  ```json
  {
    "title": "string",
    "content": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "explanation": "string",
    "difficulty": "easy|medium|hard",
    "subject": "string",
    "tags": ["string"]
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "question": {
        // 保存的题目信息
      }
    }
  }
  ```

## 7. 错误响应格式

所有API在出错时都返回统一的错误格式：
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string"
  }
}
```