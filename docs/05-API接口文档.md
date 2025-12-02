# Nexus AI Platform - API接口文档

**版本**: 1.0  
**更新日期**: 2024年12月2日  
**作者**: 后端团队  
**状态**: 已审核  

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **API版本** | v1.0 |
| **Base URL** | `https://api.nexus-ai.com/v1` |
| **认证方式** | JWT Bearer Token |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |

---

## 1. API概览

### 1.1 设计原则

#### RESTful设计规范
- 使用HTTP动词表示操作类型：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- 使用名词表示资源，避免动词
- 使用复数形式表示资源集合：`/api/v1/templates`
- 使用嵌套路径表示资源关系：`/api/v1/templates/{id}/comments`

#### 统一响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "Success",
  "data": {},
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": 1701234567890
}
```

#### HTTP状态码规范
| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| **200** | OK | 请求成功 |
| **201** | Created | 资源创建成功 |
| **400** | Bad Request | 请求参数错误 |
| **401** | Unauthorized | 未认证 |
| **403** | Forbidden | 权限不足 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 资源冲突 |
| **422** | Unprocessable Entity | 验证失败 |
| **429** | Too Many Requests | 请求超限 |
| **500** | Internal Server Error | 服务器内部错误 |

### 1.2 认证机制

#### JWT令牌结构
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "developer",
    "iat": 1701234567,
    "exp": 1701238167
  }
}
```

#### 请求头格式
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: unique-request-id
X-Client-Version: 1.0.0
```

---

## 2. 用户管理API

### 2.1 用户注册

**接口地址**: `POST /auth/register`  
**接口描述**: 用户注册账户  
**权限要求**: 无需认证  

#### 请求参数
```json
{
  "username": "string",     // 用户名，3-50字符，必填
  "email": "string",        // 邮箱地址，必填
  "password": "string",     // 密码，8-128字符，必填
  "role": "string",         // 用户角色，可选，默认developer
  "acceptTerms": boolean    // 同意服务条款，必填
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "developer",
      "createdAt": "2024-12-02T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  },
  "timestamp": 1701518400000
}
```

#### 错误码
| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| **400** | Invalid input parameters | 请求参数无效 |
| **409** | Email already exists | 邮箱已存在 |
| **409** | Username already exists | 用户名已存在 |
| **422** | Password too weak | 密码强度不足 |

### 2.2 用户登录

**接口地址**: `POST /auth/login`  
**接口描述**: 用户登录获取访问令牌  
**权限要求**: 无需认证  

#### 请求参数
```json
{
  "email": "string",        // 邮箱地址，必填
  "password": "string",     // 密码，必填
  "rememberMe": boolean     // 记住登录状态，可选
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "developer",
      "lastLoginAt": "2024-12-02T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  },
  "timestamp": 1701518400000
}
```

#### 错误码
| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| **400** | Invalid credentials | 认证信息无效 |
| **404** | User not found | 用户不存在 |
| **429** | Too many login attempts | 登录尝试次数过多 |

### 2.3 刷新令牌

**接口地址**: `POST /auth/refresh`  
**接口描述**: 刷新访问令牌  
**权限要求**: 无需认证（使用refresh token）  

#### 请求参数
```json
{
  "refreshToken": "string"   // 刷新令牌，必填
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  },
  "timestamp": 1701518400000
}
```

### 2.4 获取用户信息

**接口地址**: `GET /users/profile`  
**接口描述**: 获取当前用户信息  
**权限要求**: 需要认证  

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "developer",
    "avatar": "https://cdn.example.com/avatars/user.jpg",
    "preferences": {
      "language": "en",
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": false
      }
    },
    "statistics": {
      "templatesCreated": 5,
      "templatesUsed": 120,
      "aiCallsMade": 450
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-12-02T09:30:00Z"
  },
  "timestamp": 1701518400000
}
```

### 2.5 更新用户信息

**接口地址**: `PUT /users/profile`  
**接口描述**: 更新用户个人信息  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "username": "string",     // 用户名，可选
  "avatar": "string",       // 头像URL，可选
  "preferences": {          // 用户偏好，可选
    "language": "string",
    "theme": "string",
    "notifications": {
      "email": boolean,
      "push": boolean
    }
  }
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "newusername",
    "email": "john@example.com",
    "role": "developer",
    "avatar": "https://cdn.example.com/avatars/new-avatar.jpg",
    "preferences": {
      "language": "zh",
      "theme": "light",
      "notifications": {
        "email": true,
        "push": true
      }
    }
  },
  "timestamp": 1701518400000
}
```

---

## 3. 模板管理API

### 3.1 获取模板列表

**接口地址**: `GET /templates`  
**接口描述**: 获取模板列表，支持筛选、搜索和分页  
**权限要求**: 无需认证（认证用户有更多信息）  

#### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `page` | integer | 页码 | 1 |
| `pageSize` | integer | 每页数量，最大100 | 20 |
| `stage` | string | 开发阶段筛选 | - |
| `techStack` | string[] | 技术栈筛选（逗号分隔） | - |
| `appType` | string[] | 应用类型筛选（逗号分隔） | - |
| `search` | string | 搜索关键词 | - |
| `sortBy` | string | 排序字段 | createdAt |
| `sortOrder` | string | 排序方向：asc/desc | desc |
| `isPinned` | boolean | 是否置顶 | - |
| `authorId` | string | 作者ID筛选 | - |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Templates retrieved successfully",
  "data": [
    {
      "id": "tpl-550e8400-e29b-41d4-a716-446655440000",
      "title": "React Component Generator",
      "description": "Generate React TypeScript components with hooks and testing",
      "stage": "development",
      "techStack": ["react", "typescript", "testing"],
      "appType": ["web_crud", "spa"],
      "supports": ["component-generation", "testing"],
      "inputFormat": "Component name, props, and requirements",
      "outputFormat": "Complete React component with tests",
      "likes": 156,
      "usageCount": 2340,
      "isPinned": true,
      "isSystem": true,
      "author": {
        "id": "auth-550e8400-e29b-41d4-a716-446655440000",
        "name": "Nexus Team",
        "avatar": "https://cdn.example.com/avatars/system.jpg"
      },
      "tags": ["react", "component", "typescript"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-11-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 145,
    "totalPages": 8
  },
  "timestamp": 1701518400000
}
```

### 3.2 获取模板详情

**接口地址**: `GET /templates/{id}`  
**接口描述**: 获取指定模板的详细信息  
**权限要求**: 无需认证（认证用户有更多信息）  

#### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 模板ID |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Template retrieved successfully",
  "data": {
    "id": "tpl-550e8400-e29b-41d4-a716-446655440000",
    "title": "React Component Generator",
    "description": "Generate React TypeScript components with hooks and testing",
    "stage": "development",
    "techStack": ["react", "typescript", "testing"],
    "appType": ["web_crud", "spa"],
    "supports": ["component-generation", "testing"],
    "promptContent": "Generate a React TypeScript component...",
    "inputFormat": "Component name, props description, and requirements",
    "outputFormat": "Complete React component with TypeScript interfaces and Jest tests",
    "templatePreview": "interface UserProps {\n  name: string;\n  email: string;\n}\n\nexport const UserCard: React.FC<UserProps> = ({ name, email }) => { ... };",
    "likes": 156,
    "usageCount": 2340,
    "comments": [
      {
        "id": "cmt-550e8400-e29b-41d4-a716-446655440000",
        "content": "Very useful template! Saved me hours of work.",
        "author": {
          "id": "auth-550e8400-e29b-41d4-a716-446655440001",
          "name": "Alice Chen",
          "avatar": "https://cdn.example.com/avatars/alice.jpg"
        },
        "createdAt": "2024-11-20T14:30:00Z"
      }
    ],
    "isPinned": true,
    "isSystem": true,
    "isFavorited": false,  // 当前用户是否收藏
    "hasUsed": true,      // 当前用户是否使用过
    "author": {
      "id": "auth-550e8400-e29b-41d4-a716-446655440000",
      "name": "Nexus Team",
      "avatar": "https://cdn.example.com/avatars/system.jpg",
      "role": "admin"
    },
    "tags": ["react", "component", "typescript", "hooks"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-11-15T10:30:00Z"
  },
  "timestamp": 1701518400000
}
```

### 3.3 创建模板

**接口地址**: `POST /templates`  
**接口描述**: 创建新的模板  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "title": "string",           // 模板标题，必填
  "description": "string",     // 模板描述，必填
  "stage": "string",          // 开发阶段，必填
  "techStack": ["string"],     // 技术栈列表，必填
  "appType": ["string"],       // 应用类型列表，必填
  "supports": ["string"],      // 支持功能列表，必填
  "promptContent": "string",   // 提示词内容，必填
  "inputFormat": "string",     // 输入格式说明，必填
  "outputFormat": "string",    // 输出格式说明，必填
  "templatePreview": "string", // 模板预览，可选
  "tags": ["string"]          // 标签列表，可选
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 201,
  "message": "Template created successfully",
  "data": {
    "id": "tpl-550e8400-e29b-41d4-a716-446655440001",
    "title": "Custom Vue Component",
    "description": "Generate Vue 3 components with composition API",
    "stage": "development",
    "techStack": ["vue", "typescript"],
    "appType": ["spa"],
    "supports": ["component-generation"],
    "promptContent": "Generate a Vue 3 component...",
    "inputFormat": "Component name and props description",
    "outputFormat": "Vue 3 component with TypeScript",
    "likes": 0,
    "usageCount": 0,
    "isPinned": false,
    "isSystem": false,
    "author": {
      "id": "auth-550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "avatar": "https://cdn.example.com/avatars/john.jpg"
    },
    "tags": ["vue", "component", "composition-api"],
    "createdAt": "2024-12-02T10:00:00Z",
    "updatedAt": "2024-12-02T10:00:00Z"
  },
  "timestamp": 1701518400000
}
```

#### 错误码
| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| **400** | Invalid input parameters | 请求参数无效 |
| **401** | Authentication required | 需要认证 |
| **403** | Permission denied | 权限不足 |
| **422** | Validation failed | 数据验证失败 |

### 3.4 更新模板

**接口地址**: `PUT /templates/{id}`  
**接口描述**: 更新指定模板  
**权限要求**: 需要认证（仅作者或管理员）  

#### 请求参数
```json
{
  "title": "string",           // 模板标题，可选
  "description": "string",     // 模板描述，可选
  "promptContent": "string",   // 提示词内容，可选
  "inputFormat": "string",     // 输入格式说明，可选
  "outputFormat": "string",    // 输出格式说明，可选
  "templatePreview": "string", // 模板预览，可选
  "tags": ["string"]          // 标签列表，可选
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Template updated successfully",
  "data": {
    "id": "tpl-550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated React Component Generator",
    "description": "Generate React TypeScript components with hooks and testing",
    "updatedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

### 3.5 删除模板

**接口地址**: `DELETE /templates/{id}`  
**接口描述**: 删除指定模板  
**权限要求**: 需要认证（仅作者或管理员）  

#### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 模板ID |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Template deleted successfully",
  "data": null,
  "timestamp": 1701518400000
}
```

#### 错误码
| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| **401** | Authentication required | 需要认证 |
| **403** | Permission denied | 权限不足 |
| **404** | Template not found | 模板不存在 |

### 3.6 使用模板

**接口地址**: `POST /templates/{id}/use`  
**接口描述**: 记录模板使用次数  
**权限要求**: 需要认证  

#### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 模板ID |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Template usage recorded",
  "data": {
    "templateId": "tpl-550e8400-e29b-41d4-a716-446655440000",
    "usageCount": 2341,
    "usedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

### 3.7 收藏/取消收藏模板

**接口地址**: `POST /templates/{id}/favorite`  
**接口描述**: 收藏或取消收藏模板  
**权限要求**: 需要认证  

#### 路径参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | string | 模板ID |

#### 请求参数
```json
{
  "action": "string"   // 操作类型：add/remove，必填
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Template favorited successfully",
  "data": {
    "templateId": "tpl-550e8400-e29b-41d4-a716-446655440000",
    "isFavorited": true,
    "totalLikes": 157
  },
  "timestamp": 1701518400000
}
```

---

## 4. 提示词管理API

### 4.1 获取提示词列表

**接口地址**: `GET /prompts`  
**接口描述**: 获取提示词列表，支持筛选和搜索  
**权限要求**: 无需认证  

#### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `page` | integer | 页码 | 1 |
| `pageSize` | integer | 每页数量，最大100 | 20 |
| `role` | string | 角色筛选 | - |
| `category` | string | 类别筛选 | - |
| `techStack` | string[] | 技术栈筛选 | - |
| `search` | string | 搜索关键词 | - |
| `sortBy` | string | 排序字段 | createdAt |
| `sortOrder` | string | 排序方向 | desc |
| `efficiencyMin` | number | 最低效率评分 | - |
| `efficiencyMax` | number | 最高效率评分 | - |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Prompts retrieved successfully",
  "data": [
    {
      "id": "prompt-550e8400-e29b-41d4-a716-446655440000",
      "title": "React Component Optimization",
      "content": "Optimize the following React component for better performance...",
      "description": "Help optimize React components for better performance and best practices",
      "role": "frontend_developer",
      "category": "optimization",
      "techStack": ["react", "javascript", "typescript"],
      "efficiency": 85,
      "usageCount": 567,
      "likes": 89,
      "isPublic": true,
      "author": {
        "id": "auth-550e8400-e29b-41d4-a716-446655440000",
        "name": "Sarah Lee",
        "avatar": "https://cdn.example.com/avatars/sarah.jpg"
      },
      "tags": ["react", "performance", "optimization"],
      "createdAt": "2024-10-15T09:00:00Z",
      "updatedAt": "2024-11-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 234,
    "totalPages": 12
  },
  "timestamp": 1701518400000
}
```

### 4.2 获取提示词详情

**接口地址**: `GET /prompts/{id}`  
**接口描述**: 获取指定提示词的详细信息  
**权限要求**: 无需认证（认证用户有更多信息）  

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Prompt retrieved successfully",
  "data": {
    "id": "prompt-550e8400-e29b-41d4-a716-446655440000",
    "title": "React Component Optimization",
    "content": "Optimize the following React component for better performance. Consider:\n1. Component re-rendering patterns\n2. Memoization strategies\n3. State management optimization\n4. Bundle size impact\n\nComponent to optimize:\n{COMPONENT_CODE}\n\nProvide specific recommendations with code examples.",
    "description": "Help optimize React components for better performance and best practices",
    "role": "frontend_developer",
    "category": "optimization",
    "techStack": ["react", "javascript", "typescript"],
    "efficiency": 85,
    "usageCount": 567,
    "likes": 89,
    "isPublic": true,
    "isFavorited": false,
    "hasUsed": true,
    "author": {
      "id": "auth-550e8400-e29b-41d4-a716-446655440000",
      "name": "Sarah Lee",
      "avatar": "https://cdn.example.com/avatars/sarah.jpg",
      "role": "frontend_developer"
    },
    "tags": ["react", "performance", "optimization"],
    "examples": [
      {
        "title": "Optimizing a List Component",
        "input": "React list component with 1000+ items",
        "output": "Virtualized list with React.memo and useMemo"
      }
    ],
    "createdAt": "2024-10-15T09:00:00Z",
    "updatedAt": "2024-11-20T14:30:00Z"
  },
  "timestamp": 1701518400000
}
```

### 4.3 创建提示词

**接口地址**: `POST /prompts`  
**接口描述**: 创建新的提示词  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "title": "string",         // 提示词标题，必填
  "content": "string",       // 提示词内容，必填
  "description": "string",   // 提示词描述，必填
  "role": "string",          // 适用角色，必填
  "category": "string",     // 类别，必填
  "techStack": ["string"],   // 技术栈列表，可选
  "tags": ["string"],        // 标签列表，可选
  "isPublic": boolean,       // 是否公开，默认true
  "examples": [              // 使用示例，可选
    {
      "title": "string",
      "input": "string",
      "output": "string"
    }
  ]
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 201,
  "message": "Prompt created successfully",
  "data": {
    "id": "prompt-550e8400-e29b-41d4-a716-446655440001",
    "title": "Vue Component Optimization",
    "content": "Optimize the following Vue component...",
    "description": "Help optimize Vue components for better performance",
    "role": "frontend_developer",
    "category": "optimization",
    "techStack": ["vue", "javascript"],
    "efficiency": 0,
    "usageCount": 0,
    "likes": 0,
    "isPublic": true,
    "author": {
      "id": "auth-550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "avatar": "https://cdn.example.com/avatars/john.jpg"
    },
    "tags": ["vue", "performance", "optimization"],
    "createdAt": "2024-12-02T11:00:00Z",
    "updatedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

### 4.4 评价提示词

**接口地址**: `POST /prompts/{id}/rate`  
**接口描述**: 对提示词进行评价  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "rating": "integer",      // 评分1-5，必填
  "comment": "string",      // 评价内容，可选
  "efficiencyFeedback": {   // 效率反馈，可选
    "helpfulness": "integer", // 有用性1-5
    "accuracy": "integer",   // 准确性1-5
    "completeness": "integer" // 完整性1-5
  }
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Prompt rated successfully",
  "data": {
    "promptId": "prompt-550e8400-e29b-41d4-a716-446655440000",
    "averageRating": 4.2,
    "totalRatings": 45,
    "efficiency": 86,
    "userRating": {
      "rating": 5,
      "comment": "Very helpful for optimizing my React components!",
      "createdAt": "2024-12-02T11:00:00Z"
    }
  },
  "timestamp": 1701518400000
}
```

---

## 5. AI服务API

### 5.1 AI对话

**接口地址**: `POST /ai/chat`  
**接口描述**: 与AI进行对话交流  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "message": "string",       // 消息内容，必填
  "context": "string",       // 上下文信息，可选
  "model": "string",         // AI模型选择，可选，默认gemini
  "temperature": "number",    // 温度参数，0-1，可选，默认0.7
  "maxTokens": "integer",    // 最大令牌数，可选，默认1000
  "stream": boolean          // 是否流式响应，可选，默认false
}
```

#### 响应示例（非流式）
```json
{
  "success": true,
  "code": 200,
  "message": "Chat response generated successfully",
  "data": {
    "id": "chat-550e8400-e29b-41d4-a716-446655440000",
    "reply": "To optimize your React component, I recommend the following strategies...",
    "model": "gemini",
    "usage": {
      "promptTokens": 245,
      "completionTokens": 892,
      "totalTokens": 1137
    },
    "suggestions": [
      "Consider using React.memo for component memoization",
      "Implement useMemo for expensive calculations",
      "Use useCallback for function props"
    ],
    "createdAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

#### 响应示例（流式）
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type": "start", "id": "chat-550e8400-e29b-41d4-a716-446655440000"}

data: {"type": "token", "content": "To"}

data: {"type": "token", "content": " optimize"}

data: {"type": "token", "content": " your"}

data: {"type": "end", "usage": {"promptTokens": 245, "completionTokens": 892, "totalTokens": 1137}}
```

### 5.2 代码分析

**接口地址**: `POST /ai/analyze`  
**接口描述**: 分析代码质量和提供优化建议  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "code": "string",          // 代码内容，必填
  "language": "string",     // 编程语言，必填
  "analysisType": "string", // 分析类型，必填
  "framework": "string",    // 框架信息，可选
  "context": "string"       // 上下文信息，可选
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Code analysis completed",
  "data": {
    "id": "analysis-550e8400-e29b-41d4-a716-446655440000",
    "score": 78,
    "issues": [
      {
        "type": "performance",
        "severity": "medium",
        "title": "Unnecessary re-renders",
        "description": "Component may re-render unnecessarily when props haven't changed",
        "line": 15,
        "suggestion": "Consider using React.memo to prevent unnecessary re-renders",
        "code": "const UserCard = ({ name, email }) => {"
      },
      {
        "type": "security",
        "severity": "low",
        "title": "Missing input validation",
        "description": "User input should be validated before processing",
        "line": 8,
        "suggestion": "Add validation for email format and input sanitization"
      }
    ],
    "suggestions": [
      {
        "category": "performance",
        "title": "Implement React.memo",
        "description": "Wrap the component with React.memo to prevent unnecessary re-renders",
        "code": "export const UserCard = React.memo(({ name, email }) => { ... });"
      },
      {
        "category": "readability",
        "title": "Extract complex logic",
        "description": "Move complex validation logic to a separate utility function",
        "code": "const validateEmail = (email) => { /* validation logic */ };"
      }
    ],
    "metrics": {
      "complexity": 3,
      "maintainability": 85,
      "testCoverage": 60
    },
    "model": "gemini",
    "analyzedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

### 5.3 文本生成

**接口地址**: `POST /ai/generate`  
**接口描述**: 根据提示词生成文本内容  
**权限要求**: 需要认证  

#### 请求参数
```json
{
  "prompt": "string",        // 提示词，必填
  "type": "string",          // 生成类型，必填
  "context": "string",       // 上下文，可选
  "model": "string",         // AI模型，可选
  "parameters": {            // 生成参数，可选
    "temperature": "number",
    "maxTokens": "integer",
    "topP": "number",
    "frequencyPenalty": "number",
    "presencePenalty": "number"
  }
}
```

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Text generated successfully",
  "data": {
    "id": "gen-550e8400-e29b-41d4-a716-446655440000",
    "content": "Generated content based on the provided prompt...",
    "model": "gemini",
    "usage": {
      "promptTokens": 156,
      "completionTokens": 423,
      "totalTokens": 579
    },
    "alternatives": [
      "Alternative generated content option 1...",
      "Alternative generated content option 2..."
    ],
    "generatedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

---

## 6. 文件管理API

### 6.1 文件上传

**接口地址**: `POST /files/upload`  
**接口描述**: 上传文件  
**权限要求**: 需要认证  
**请求格式**: `multipart/form-data`

#### 请求参数
| 参数 | 类型 | 说明 |
|------|------|------|
| `file` | File | 文件内容，必填 |
| `type` | string | 文件类型，可选 |
| `description` | string | 文件描述，可选 |

#### 响应示例
```json
{
  "success": true,
  "code": 201,
  "message": "File uploaded successfully",
  "data": {
    "id": "file-550e8400-e29b-41d4-a716-446655440000",
    "filename": "screenshot.png",
    "originalName": "my-screenshot.png",
    "size": 1024576,
    "mimeType": "image/png",
    "url": "https://cdn.nexus-ai.com/files/file-550e8400-e29b-41d4-a716-446655440000.png",
    "thumbnailUrl": "https://cdn.nexus-ai.com/thumbnails/file-550e8400-e29b-41d4-a716-446655440000.jpg",
    "uploadedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

### 6.2 获取文件信息

**接口地址**: `GET /files/{id}`  
**接口描述**: 获取文件信息  
**权限要求**: 需要认证  

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "File retrieved successfully",
  "data": {
    "id": "file-550e8400-e29b-41d4-a716-446655440000",
    "filename": "screenshot.png",
    "originalName": "my-screenshot.png",
    "size": 1024576,
    "mimeType": "image/png",
    "url": "https://cdn.nexus-ai.com/files/file-550e8400-e29b-41d4-a716-446655440000.png",
    "thumbnailUrl": "https://cdn.nexus-ai.com/thumbnails/file-550e8400-e29b-41d4-a716-446655440000.jpg",
    "uploader": {
      "id": "auth-550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe"
    },
    "isPublic": false,
    "uploadedAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

---

## 7. 搜索API

### 7.1 全局搜索

**接口地址**: `GET /search`  
**接口描述**: 全局搜索资源  
**权限要求**: 无需认证（认证用户有更多结果）  

#### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `q` | string | 搜索关键词，必填 | - |
| `type` | string | 资源类型，可选 | - |
| `page` | integer | 页码 | 1 |
| `pageSize` | integer | 每页数量 | 20 |
| `filters` | object | 高级筛选，可选 | - |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Search completed",
  "data": {
    "results": [
      {
        "type": "template",
        "id": "tpl-550e8400-e29b-41d4-a716-446655440000",
        "title": "React Component Generator",
        "description": "Generate React TypeScript components...",
        "highlight": "Generate <mark>React</mark> <mark>component</mark>...",
        "relevance": 0.95,
        "url": "/templates/tpl-550e8400-e29b-41d4-a716-446655440000"
      },
      {
        "type": "prompt",
        "id": "prompt-550e8400-e29b-41d4-a716-446655440000",
        "title": "React Component Optimization",
        "description": "Optimize <mark>React</mark> components...",
        "highlight": "Optimize <mark>React</mark> components for better performance...",
        "relevance": 0.88,
        "url": "/prompts/prompt-550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "facets": {
      "types": {
        "template": 45,
        "prompt": 23,
        "guide": 8
      },
      "categories": {
        "react": 28,
        "vue": 12,
        "nodejs": 8
      }
    },
    "suggestions": [
      "react component",
      "react hooks",
      "react router"
    ]
  },
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 76,
    "totalPages": 4
  },
  "timestamp": 1701518400000
}
```

---

## 8. 统计分析API

### 8.1 获取用户统计

**接口地址**: `GET /analytics/user`  
**接口描述**: 获取当前用户的使用统计  
**权限要求**: 需要认证  

#### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `period` | string | 统计周期：7d/30d/90d/1y | 30d |
| `metrics` | string[] | 指标类型，可选 | - |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "User analytics retrieved",
  "data": {
    "period": "30d",
    "overview": {
      "templatesCreated": 3,
      "templatesUsed": 45,
      "aiCallsMade": 128,
      "promptsCreated": 7,
      "hoursSaved": 12.5
    },
    "trends": {
      "dailyUsage": [
        {
          "date": "2024-11-01",
          "templatesUsed": 2,
          "aiCalls": 5,
          "timeSpent": 45
        }
      ],
      "efficiencyScore": [
        {
          "date": "2024-11-01",
          "score": 78
        }
      ]
    },
    "topUsedTemplates": [
      {
        "templateId": "tpl-550e8400-e29b-41d4-a716-446655440000",
        "title": "React Component Generator",
        "usageCount": 15
      }
    ],
    "categoryBreakdown": {
      "development": 60,
      "requirements": 25,
      "testing": 15
    }
  },
  "timestamp": 1701518400000
}
```

### 8.2 获取系统统计（管理员）

**接口地址**: `GET /analytics/system`  
**接口描述**: 获取系统整体统计（仅管理员）  
**权限要求**: 需要管理员权限  

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "System analytics retrieved",
  "data": {
    "overview": {
      "totalUsers": 10234,
      "activeUsers": 3456,
      "totalTemplates": 1567,
      "totalPrompts": 2341,
      "totalAiCalls": 156789,
      "uptime": "99.95%"
    },
    "growth": {
      "userGrowth": {
        "newUsers": 234,
        "growthRate": 12.5
      },
      "contentGrowth": {
        "newTemplates": 45,
        "newPrompts": 67,
        "growthRate": 8.3
      }
    },
    "performance": {
      "avgResponseTime": 245,
      "errorRate": 0.02,
      "aiCallSuccessRate": 99.2
    }
  },
  "timestamp": 1701518400000
}
```

---

## 9. 通知API

### 9.1 获取通知列表

**接口地址**: `GET /notifications`  
**接口描述**: 获取用户通知列表  
**权限要求**: 需要认证  

#### 查询参数
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `page` | integer | 页码 | 1 |
| `pageSize` | integer | 每页数量 | 20 |
| `type` | string | 通知类型筛选 | - |
| `isRead` | boolean | 是否已读筛选 | - |

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "notif-550e8400-e29b-41d4-a716-446655440000",
      "type": "template_like",
      "title": "Your template received a like",
      "content": "Sarah Lee liked your 'React Component Generator' template",
      "data": {
        "templateId": "tpl-550e8400-e29b-41d4-a716-446655440000",
        "userId": "auth-550e8400-e29b-41d4-a716-446655440001"
      },
      "isRead": false,
      "createdAt": "2024-12-02T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 23,
    "totalPages": 2
  },
  "unreadCount": 5,
  "timestamp": 1701518400000
}
```

### 9.2 标记通知已读

**接口地址**: `PUT /notifications/{id}/read`  
**接口描述**: 标记通知为已读  
**权限要求**: 需要认证  

#### 响应示例
```json
{
  "success": true,
  "code": 200,
  "message": "Notification marked as read",
  "data": {
    "id": "notif-550e8400-e29b-41d4-a716-446655440000",
    "isRead": true,
    "readAt": "2024-12-02T11:00:00Z"
  },
  "timestamp": 1701518400000
}
```

---

## 10. 错误处理

### 10.1 统一错误格式

```json
{
  "success": false,
  "code": 400,
  "message": "Bad Request",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must be between 1 and 100 characters",
        "code": "REQUIRED_FIELD"
      }
    ]
  },
  "requestId": "req-550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1701518400000
}
```

### 10.2 常见错误类型

| 错误类型 | HTTP状态码 | 说明 |
|----------|------------|------|
| **VALIDATION_ERROR** | 400 | 请求参数验证失败 |
| **AUTHENTICATION_ERROR** | 401 | 认证失败 |
| **AUTHORIZATION_ERROR** | 403 | 权限不足 |
| **NOT_FOUND_ERROR** | 404 | 资源不存在 |
| **CONFLICT_ERROR** | 409 | 资源冲突 |
| **RATE_LIMIT_ERROR** | 429 | 请求频率超限 |
| **INTERNAL_ERROR** | 500 | 服务器内部错误 |
| **SERVICE_UNAVAILABLE** | 503 | 服务不可用 |

### 10.3 重试机制

#### 429 错误重试
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1701518460
```

客户端应该在 `Retry-After` 指定的时间后重试请求。

---

## 11. API限流

### 11.1 限流规则

| 用户类型 | 请求类型 | 限制 | 时间窗口 |
|----------|----------|------|----------|
| **未认证用户** | API请求 | 100/小时 | 1小时 |
| **普通用户** | API请求 | 1000/小时 | 1小时 |
| **高级用户** | API请求 | 5000/小时 | 1小时 |
| **管理员** | API请求 | 10000/小时 | 1小时 |
| **所有用户** | AI对话 | 100/小时 | 1小时 |
| **所有用户** | 文件上传 | 50/小时 | 1小时 |

### 11.2 限流响应头

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1701518460
```

---

## 12. API版本控制

### 12.1 版本策略

- **URL版本控制**: `/api/v1/`, `/api/v2/`
- **向后兼容**: 旧版本至少维护6个月
- **废弃通知**: 通过响应头 `X-API-Deprecation-Warning` 通知客户端

### 12.2 版本响应头

```http
API-Version: v1
API-Supported-Versions: v1,v2
API-Deprecated-Versions: v0
API-Deprecation-Warning: v1 will be deprecated on 2025-06-01
```

---

## 13. SDK和工具

### 13.1 JavaScript SDK

```javascript
import { NexusAIClient } from '@nexus-ai/sdk';

const client = new NexusAIClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.nexus-ai.com/v1'
});

// 获取模板列表
const templates = await client.templates.list({
  stage: 'development',
  pageSize: 20
});

// AI对话
const response = await client.ai.chat({
  message: 'How to optimize React components?',
  model: 'gemini'
});
```

### 13.2 Postman集合

提供完整的Postman集合，包含所有API接口的示例请求和测试脚本。

---

## 14. 最佳实践

### 14.1 请求优化

1. **使用分页**: 避免一次性获取大量数据
2. **字段选择**: 只请求需要的字段，减少带宽使用
3. **缓存策略**: 合理使用HTTP缓存头
4. **批量操作**: 使用批量接口减少请求次数

### 14.2 错误处理

1. **检查响应状态**: 始终检查HTTP状态码和success字段
2. **处理网络错误**: 实现重试机制和超时处理
3. **优雅降级**: 在服务不可用时提供备用方案

### 14.3 安全考虑

1. **保护API密钥**: 不要在客户端代码中暴露API密钥
2. **使用HTTPS**: 所有请求都使用HTTPS加密传输
3. **输入验证**: 客户端也应验证输入数据

---

*文档版本: 1.0*  
*最后更新: 2024年12月2日*  
*下次评审: 2024年12月16日*  
*状态: 已审核*  
*负责人: 后端团队*