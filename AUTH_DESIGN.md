# 认证与授权设计

## 1. 认证机制

### 1.1 JWT Token 认证
系统将使用 JWT (JSON Web Token) 作为主要的认证机制：

1. 用户登录成功后，服务器生成一个 JWT token
2. Token 包含用户 ID 和过期时间等信息
3. 客户端在后续请求中通过 Authorization 头传递 token
4. 服务器验证 token 的有效性

### 1.2 Token 结构
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "number",
    "username": "string",
    "exp": "number", // 过期时间
    "iat": "number"  // 签发时间
  },
  "signature": "string"
}
```

### 1.3 Token 过期与刷新
- 访问 Token 有效期：2小时
- 刷新 Token 有效期：7天
- 提供刷新接口：`POST /api/auth/refresh`

## 2. 密码安全

### 2.1 密码存储
- 使用 bcrypt 对密码进行哈希处理
- 哈希成本因子：12
- 数据库中只存储哈希值，不存储明文密码

### 2.2 密码策略
- 最小长度：8个字符
- 必须包含字母和数字
- 推荐包含特殊字符

## 3. 权限控制

### 3.1 角色定义
```
- USER: 普通用户（默认角色）
- ADMIN: 管理员（预留）
```

### 3.2 资源访问控制
所有资源都与用户关联，用户只能访问自己的数据：

1. **题目资源**:
   - 用户只能创建、读取、更新、删除自己的题目
   - 请求中包含的 userId 必须与 token 中的 userId 一致

2. **练习记录资源**:
   - 用户只能创建、读取自己的练习记录
   - 不能修改或删除练习记录

3. **设置资源**:
   - 用户只能读取和更新自己的设置

### 3.3 权限验证中间件
```typescript
// 伪代码示例
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '缺少访问令牌'
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '无效的访问令牌'
      }
    });
  }
}

function authorize(req, res, next) {
  const userId = req.user.userId;
  const resourceId = req.params.userId || req.body.userId;
  
  if (userId !== parseInt(resourceId)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '没有权限访问该资源'
      }
    });
  }
  
  next();
}
```

## 4. CORS 和安全设置

### 4.1 CORS 配置
```javascript
{
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 4.2 安全头设置
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## 5. 速率限制

为防止滥用，API 将实施速率限制：

1. **匿名请求**: 每分钟最多 10 次
2. **认证请求**: 每分钟最多 100 次
3. **登录接口**: 每分钟最多 5 次

## 6. 日志记录

### 6.1 访问日志
记录所有 API 请求：
- 时间戳
- 用户 ID（如果已认证）
- 请求方法和路径
- 请求 IP
- 响应状态码
- 响应时间

### 6.2 安全日志
记录安全相关事件：
- 登录尝试（成功/失败）
- 密码修改
- 权限违规访问尝试

## 7. 数据隐私与合规

### 7.1 数据加密
- 敏感数据在传输过程中使用 HTTPS 加密
- 数据库连接使用 SSL/TLS 加密

### 7.2 数据保留与删除
- 用户可以请求删除自己的账户和所有相关数据
- 删除请求处理后，数据将在 30 天内从备份中清除

### 7.3 GDPR 合规
- 用户有权访问自己的数据
- 用户有权要求更正不准确的数据
- 用户有权要求删除自己的数据