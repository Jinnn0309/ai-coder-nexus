
export enum View {
  DASHBOARD = 'DASHBOARD',
  PLAYGROUND = 'PLAYGROUND',
  PROCESS = 'PROCESS',
  PROMPTS = 'PROMPTS',
  GUIDES = 'GUIDES',
}

// Updated to 6 stages as per requirements
export type ProcessStage = 'requirements' | 'product_planning' | 'architecture' | 'story_creation' | 'development' | 'qa';

export type Role = 'All' | 'Product Manager' | 'Frontend Dev' | 'Backend Dev' | 'QA Engineer' | 'DevOps' | 'User';

export type AppType = 'web_crud' | 'mobile_app' | 'microservice' | 'data_intensive' | 'real_time' | 'all';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
  bookmarks: string[]; // IDs of bookmarked items
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: number;
}

export interface ProcessTemplate {
  id: string;
  title: string;
  stage: ProcessStage;
  techStack: string[]; 
  appType?: AppType; // New field
  supports?: string[]; // New field
  description: string;
  promptContent: string;
  inputFormat: string; 
  outputFormat: string; 
  templatePreview?: string; // Markdown content for the output template preview
  likes: number;
  usageCount: number;
  comments: Comment[];
  authorId: string; 
  authorName: string;
  isSystem: boolean; 
  createdAt: number;
  // 新增字段
  projectContext?: ProjectContext; // 项目简介信息
  features?: string[]; // 功能列表
  frontend?: string[]; // 前端技术栈
  backend?: string[]; // 后端技术栈
  averageRating?: number; // 平均评分
  totalRatings?: number; // 评分总数
}

export interface Prompt {
  id: string;
  title: string;
  role: Role;
  category: string;
  scenario: string;
  content: string;
  model: string;
  efficiencyScore: number; 
  tags: string[];
  likes: number;
  comments: Comment[];
  authorId: string;
  authorName: string;
  isSystem: boolean;
  createdAt: number;
  description?: string;
  // 新增字段 - 支持转换到流程模板
  projectContext?: ProjectContext;
  features?: string[];
  frontend?: string[];
  backend?: string[];
  // 评分系统
  averageRating?: number;
  totalRatings?: number;
}

export interface Guide {
  id: string;
  title: string;
  category: string; // Changed from enum to string to support 'AI Tools' etc.
  readTime: string;
  content: string;
  toolName?: string;
  officialUrl?: string;
  tags?: string[];
  // 学习路径相关字段
  isLearningPath?: boolean; // 是否是学习路径
  sections?: LearningSection[]; // 学习章节
  estimatedDuration?: number; // 预估学习时长（分钟）
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 难度等级
  prerequisites?: string[]; // 前置知识
  learningObjectives?: string[]; // 学习目标
}

export interface LearningSection {
  id: string;
  title: string;
  content: string;
  duration: number; // 章节时长（分钟）
  order: number; // 章节顺序
  isCompleted: boolean; // 是否完成
  completedAt?: number; // 完成时间
  quiz?: QuizQuestion[]; // 章节测试
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface UserProgress {
  userId: string;
  guideId: string;
  completedSections: string[]; // 已完成章节ID列表
  currentSection: string; // 当前学习章节
  progress: number; // 整体进度百分比
  startedAt: number;
  lastAccessedAt: number;
  completedAt?: number;
  quizScores: { [sectionId: string]: number }; // 各章节测试分数
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ProjectContext {
  projectName: string;
  techStack: string[];
  userStories: string[];
}

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  score: number; // 1-5分
  feedback: string;
  timestamp: number;
}

export interface TemplateFromPrompt {
  promptId: string;
  template: ProcessTemplate;
  convertedAt: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'markdown' | 'word' | 'pdf' | 'text';
  content: string;
  extractedText?: string;
  uploadedAt: number;
  tags?: string[];
  stage?: ProcessStage;
}

export interface AITag {
  name: string;
  confidence: number;
  category: 'stage' | 'tech' | 'category' | 'difficulty';
}
