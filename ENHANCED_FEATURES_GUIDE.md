# Nexus AI Platform - 增强功能使用指南

## 🎯 新功能概览

Nexus AI平台现已全面升级，支持以下增强功能：

### 📄 文档导入功能
- **支持格式**: Markdown (.md), Word (.docx), PDF (.pdf), 纯文本 (.txt)
- **智能解析**: AI自动分析和提取关键信息
- **内容预览**: 实时显示文档内容摘要

### 🏷️ AI自定义标签
- **智能识别**: 基于文档内容自动生成相关标签
- **置信度评分**: 每个标签都包含AI置信度百分比
- **分类管理**: 按技术、阶段、类别等维度组织

### 🔄 阶段区分系统
- **6大开发阶段**: 需求分析、产品规划、系统设计、故事创建、编码实现、质量保证
- **自动分类**: AI根据内容智能匹配最合适的开发阶段
- **灵活调整**: 用户可手动修改阶段分类

---

## 📋 详细使用流程

### 第一步：创建流程模板

#### 📍 位置：AI编程流程 → 分享模板

#### 📄 文档导入
1. **点击"📄 Upload Document"按钮**
2. **选择支持的文件格式**：
   - `.md` - Markdown文档（推荐，效果最佳）
   - `.docx` - Word文档（基础预览）
   - `.pdf` - PDF文档（基础预览）
   - `.txt` - 纯文本文件

3. **查看文档预览**：
   ```typescript
   // 上传后显示预览
   📄 Document: my-template.md
   📝 Type: MARKDOWN
   📋 Preview: Document content preview (300 chars)...
   ```

#### 🏷️ AI标签生成
文档上传成功后，系统会自动生成AI标签：

```
🏷️ AI Generated Tags
├── React Optimization (92%)
├── Performance Tuning (88%)
├── Advanced (75%)
└── Frontend Dev (95%)
```

**标签类型说明**：
- **技术标签**: React, Node.js, TypeScript等
- **类别标签**: Performance, Debugging, Documentation等
- **难度标签**: Beginner, Intermediate, Advanced等
- **角色标签**: Frontend Dev, Backend Dev, QA等

#### ⚡ 智能导入增强
1. **使用"⚡ AI Smart Import"**
2. **粘贴文本内容**，AI自动填充字段
3. **点击"🏷️ Generate Tags"**生成AI标签
4. **点击"Auto-Fill"**解析内容到表单

#### 📝 表单填写（增强版）
**必填字段**：
- **Template Title** - 模板标题
- **Development Stage** - 开发阶段选择
- **Prompt Content** - 提示词内容

**可选字段**：
- **Application Type** - 应用类型
- **Technology Stack** - 技术栈（逗号分隔）
- **Description** - 模板描述
- **Input Format** - 输入格式说明
- **Output Format** - 输出格式说明
- **Supported Features** - 支持的功能（逗号分隔）

---

### 第二步：创建提示词

#### 📍 位置：提示词库 → 创建提示词

#### 📄 文档导入流程
与流程模板类似的文档导入功能：

1. **上传文档** - 支持.md, .docx, .pdf, .txt
2. **AI标签生成** - 自动识别技术栈和适用场景
3. **智能角色匹配** - 根据内容自动设置角色

#### 🎯 项目信息填写
**新增项目信息字段**：
- **Project Name** - 项目名称
- **Key Features** - 主要功能（逗号分隔）
- **Frontend Tech** - 前端技术栈（逗号分隔）
- **Backend Tech** - 后端技术栈（逗号分隔）

**示例**：
```
Project Name: E-commerce Platform
Key Features: User authentication, Product catalog, Shopping cart, Payment processing
Frontend Tech: React, Tailwind CSS, TypeScript, Redux
Backend Tech: Node.js, Express, MongoDB, JWT
```

---

### 第三步：智能分类系统

#### 🤖 自动分类逻辑
系统根据内容关键词自动分类：

```typescript
// 开发阶段自动识别
const stageClassification = {
  'requirements': ['requirement', 'pr', '需求', '分析', 'specification'],
  'product_planning': ['plan', 'roadmap', '规划', '路线图', 'milestone'],
  'architecture': ['architecture', 'design', '架构', '设计', 'system'],
  'story_creation': ['story', 'user story', '故事', '用户故事', 'feature'],
  'development': ['code', 'implement', '开发', '编码', 'programming'],
  'qa': ['test', 'qa', '测试', '质量', 'validation']
};
```

#### 🏷️ 标签置信度解释
- **90%+**: 高度相关，建议采用
- **70-89%**: 相关性较强，可以考虑
- **50-69%**: 中等相关，需要人工确认
- **<50%**: 相关性较低，仅供参考

---

### 第四步：闭环反馈系统

#### ⭐ 评分系统
**评分位置**：
- 流程模板详情页面
- 提示词详情页面

**评分机制**：
```typescript
// 实时评分计算
const calculateNewRating = (
  currentAverage: number, 
  totalRatings: number, 
  newScore: number
): number => {
  const totalScore = (currentAverage * totalRatings) + newScore;
  const newTotal = totalRatings + 1;
  return totalScore / newTotal;
};
```

#### 💬 评论系统
**评论功能**：
- **文本反馈** - 详细的使用体验
- **用户信息** - 显示评论者姓名和角色
- **时间戳** - 记录评论时间
- **AI摘要** - 智能分析所有评论

#### 🤖 AI反馈摘要
**触发条件**：评论数量 ≥ 2条
**功能**：
- **调用Gemini API**分析评论内容
- **提取关键观点**和改进建议
- **结构化显示**分析结果

---

## 🎨 界面功能说明

### 📄 文档上传界面
```
┌─────────────────────────────────────┐
│ 📄 Upload Document               │
├─────────────────────────────────────┤
│ 📋 Document: template.md         │
│ 📝 Type: MARKDOWN               │
│ 📋 Preview: Content preview...   │
└─────────────────────────────────────┘
```

### 🏷️ AI标签显示界面
```
┌─────────────────────────────────────┐
│ 🏷️ AI Generated Tags             │
├─────────────────────────────────────┤
│ React (92%)  Performance (88%)    │
│ Advanced (75%)  Frontend (95%)   │
└─────────────────────────────────────┘
```

### ⭐ 评分界面
```
┌─────────────────────────────────────┐
│ Rate this template:               │
│ ⭐⭐⭐⭐⭐ 4.5 (12 ratings)   │
└─────────────────────────────────────┘
```

---

## 🚀 最佳实践建议

### 📝 创建高质量模板

#### 1. **文档准备**
- **使用Markdown格式**：效果最佳，AI解析准确率最高
- **结构清晰**：使用标题、列表等格式化文档
- **内容完整**：包含使用场景、输入输出、示例等

#### 2. **技术栈明确**
```markdown
## Technology Stack
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Tools: Jest, ESLint, Prettier
```

#### 3. **阶段选择准确**
- **需求分析**: PRD、用户研究、市场分析
- **产品设计**: 原型设计、UI/UX规划
- **系统设计**: 架构图、API设计、数据库设计
- **开发实现**: 代码生成、组件设计、功能实现
- **测试验证**: 测试用例、质量保证、部署

### 🏷️ 标签优化

#### 高质量标签特征：
- **技术相关性**: React Hooks, API Design, Database Schema
- **场景明确**: E-commerce, User Authentication, Data Visualization
- **难度分级**: Beginner, Intermediate, Advanced
- **应用类型**: Web App, Mobile App, Microservice

### 🔄 流程优化

#### 1. **从文档到模板**
```
文档上传 → AI解析 → 标签生成 → 阶段分类 → 模板创建
```

#### 2. **从模板到使用**
```
模板选择 → 复制提示词 → AI测试场 → 代码生成 → 反馈评分
```

#### 3. **从反馈到优化**
```
用户反馈 → AI分析 → 摘要生成 → 模板改进 → 版本更新
```

---

## 🔧 技术实现细节

### 📄 文档处理流程
```typescript
const handleDocumentUpload = async (file: File) => {
  // 1. 文件类型检测
  const fileType = detectFileType(file.name, file.type);
  
  // 2. 内容提取
  const content = await extractContent(file, fileType);
  
  // 3. AI标签生成
  const tags = await generateAITags(content);
  
  // 4. 阶段分类
  const stage = classifyStage(content, tags);
  
  // 5. 数据填充
  fillFormWithExtractedData(content, tags, stage);
};
```

### 🏷️ AI标签生成
```typescript
interface AITag {
  name: string;
  confidence: number;    // 0-1 置信度
  category: 'stage' | 'tech' | 'category' | 'difficulty' | 'role';
}

// 标签生成算法
const generateAITags = async (content: string): Promise<AITag[]> => {
  const response = await geminiApi.generateContent({
    prompt: `Analyze this content and generate relevant tags with confidence scores: ${content}`,
    outputFormat: 'structured'
  });
  
  return parseAIResponse(response);
};
```

### ⚡ 智能解析
```typescript
const smartParseContent = (content: string): ParsedData => {
  return {
    title: extractTitle(content),
    description: extractDescription(content),
    techStack: extractTechStack(content),
    features: extractFeatures(content),
    stage: classifyStage(content),
    confidence: calculateConfidence(content)
  };
};
```

---

## 📊 使用效果监控

### 📈 关键指标
- **文档上传成功率**: 文件解析和内容提取成功率
- **AI标签准确率**: 标签与内容的匹配程度
- **自动分类准确率**: 阶段分类的准确性
- **用户评分分布**: 模板质量评估
- **转化率**: 提示词转换为流程模板的比例

### 🎯 持续改进
1. **收集用户反馈** - 评分、评论、使用数据
2. **AI模型优化** - 提升标签生成和分类准确性
3. **界面体验优化** - 改进用户交互流程
4. **功能扩展** - 增加新的文档格式支持

---

## 🔮 未来规划

### 🚀 即将推出的功能
- **更多文档格式**: Excel、PowerPoint、图片OCR
- **协作功能**: 团队共享和评论
- **版本控制**: 模板历史版本管理
- **API接入**: 第三方工具集成
- **移动端支持**: 响应式设计优化

### 🌟 高级功能
- **智能推荐**: 基于使用历史的模板推荐
- **批量操作**: 同时处理多个文档
- **自定义工作流**: 用户自定义开发流程
- **数据分析**: 使用统计和趋势分析

---

## 📞 支持与反馈

### 💡 使用技巧
1. **使用高质量文档**：结构化、内容完整的文档解析效果最佳
2. **善用AI标签**：参考AI生成的标签，提高模板可发现性
3. **及时反馈**：使用后立即评分和评论，帮助社区改进
4. **定期更新**：根据反馈持续优化模板内容

### 🐛 问题反馈
如遇到问题，请提供：
- 浏览器类型和版本
- 上传的文档类型和大小
- 具体错误信息或截图
- 操作步骤描述

---

**最后更新: 2024年11月21日**  
**版本: 2.0**  
**功能增强: 文档导入 + AI标签 + 智能分类**