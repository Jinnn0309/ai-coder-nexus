// 数据库服务 - 模拟后端API
import { ProcessTemplate, Prompt, Guide, User } from '../types.js';
import { authService } from './authService.js';

export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 模拟数据库存储
interface DatabaseStorage {
  templates: ProcessTemplate[];
  prompts: Prompt[];
  guides: Guide[];
  bookmarks: Array<{ user_id: string; resource_id: string; resource_type: string; created_at: string }>;
  likes: Array<{ user_id: string; resource_id: string; resource_type: string; created_at: string }>;
  comments: Array<{ id: string; user_id: string; resource_id: string; resource_type: string; content: string; created_at: string }>;
  usage_stats: Array<{ user_id: string; date: string; ai_requests: number; templates_created: number; likes_given: number }>;
}

class DatabaseService {
  private readonly STORAGE_PREFIX = 'nexus_ai_';
  private readonly currentUser = authService.getCurrentUser();

  // 获取存储的数据
  private getStorage(): DatabaseStorage {
    try {
      const storage: DatabaseStorage = {
        templates: [],
        prompts: [],
        guides: [],
        bookmarks: [],
        likes: [],
        comments: [],
        usage_stats: []
      };

      // 从localStorage读取数据
      const templates = localStorage.getItem(this.STORAGE_PREFIX + 'templates');
      const prompts = localStorage.getItem(this.STORAGE_PREFIX + 'prompts');
      const guides = localStorage.getItem(this.STORAGE_PREFIX + 'guides');
      const bookmarks = localStorage.getItem(this.STORAGE_PREFIX + 'bookmarks');
      const likes = localStorage.getItem(this.STORAGE_PREFIX + 'likes');
      const comments = localStorage.getItem(this.STORAGE_PREFIX + 'comments');
      const usage_stats = localStorage.getItem(this.STORAGE_PREFIX + 'usage_stats');

      if (templates) storage.templates = JSON.parse(templates);
      if (prompts) storage.prompts = JSON.parse(prompts);
      if (guides) storage.guides = JSON.parse(guides);
      if (bookmarks) storage.bookmarks = JSON.parse(bookmarks);
      if (likes) storage.likes = JSON.parse(likes);
      if (comments) storage.comments = JSON.parse(comments);
      if (usage_stats) storage.usage_stats = JSON.parse(usage_stats);

      return storage;
    } catch (error) {
      console.error('Error reading storage:', error);
      return this.getEmptyStorage();
    }
  }

  // 保存数据到存储
  private saveStorage(storage: Partial<DatabaseStorage>): void {
    try {
      Object.keys(storage).forEach(key => {
        const value = (storage as any)[key];
        if (value !== undefined) {
          localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(value));
        }
      });
    } catch (error) {
      console.error('Error saving storage:', error);
    }
  }

  // 获取空的存储结构
  private getEmptyStorage(): DatabaseStorage {
    return {
      templates: [],
      prompts: [],
      guides: [],
      bookmarks: [],
      likes: [],
      comments: [],
      usage_stats: []
    };
  }

  // 初始化默认数据（从constants导入）
  initializeDefaultData(): void {
    const existingData = this.getStorage();
    
    // 如果已有数据，不重复初始化
    if (existingData.templates.length > 0 || existingData.prompts.length > 0) {
      return;
    }

    // 动态导入默认数据
    import('../constants.js').then(({ MOCK_PROCESS_TEMPLATES_CN, MOCK_PROMPTS_CN, MOCK_GUIDES_CN }) => {
      this.saveStorage({
        templates: MOCK_PROCESS_TEMPLATES_CN,
        prompts: MOCK_PROMPTS_CN,
        guides: MOCK_GUIDES_CN
      });
    });
  }

  // ==================== 模板相关操作 ====================

  // 获取所有模板
  async getTemplates(): Promise<DatabaseResponse<ProcessTemplate[]>> {
    try {
      const storage = this.getStorage();
      return { success: true, data: storage.templates };
    } catch (error) {
      return { success: false, error: '获取模板失败' };
    }
  }

  // 创建模板
  async createTemplate(template: Omit<ProcessTemplate, 'id' | 'likes_count' | 'usage_count' | 'views_count' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<ProcessTemplate>> {
    try {
      if (!this.currentUser) {
        return { success: false, error: '请先登录' };
      }

      const storage = this.getStorage();
      const newTemplate: ProcessTemplate = {
        ...template,
        id: this.generateUUID(),
        author_id: this.currentUser.id,
        authorName: this.currentUser.name || this.currentUser.username,
        likes_count: 0,
        usage_count: 0,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.templates.unshift(newTemplate);
      this.saveStorage({ templates: storage.templates });

      // 记录使用统计
      this.recordUsageStat('templates_created', 1);

      return { success: true, data: newTemplate };
    } catch (error) {
      return { success: false, error: '创建模板失败' };
    }
  }

  // ==================== 提示词相关操作 ====================

  // 获取所有提示词
  async getPrompts(): Promise<DatabaseResponse<Prompt[]>> {
    try {
      const storage = this.getStorage();
      return { success: true, data: storage.prompts };
    } catch (error) {
      return { success: false, error: '获取提示词失败' };
    }
  }

  // 创建提示词
  async createPrompt(prompt: Omit<Prompt, 'id' | 'likes_count' | 'usage_count' | 'views_count' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Prompt>> {
    try {
      if (!this.currentUser) {
        return { success: false, error: '请先登录' };
      }

      const storage = this.getStorage();
      const newPrompt: Prompt = {
        ...prompt,
        id: this.generateUUID(),
        author_id: this.currentUser.id,
        authorName: this.currentUser.name || this.currentUser.username,
        likes_count: 0,
        usage_count: 0,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.prompts.unshift(newPrompt);
      this.saveStorage({ prompts: storage.prompts });

      return { success: true, data: newPrompt };
    } catch (error) {
      return { success: false, error: '创建提示词失败' };
    }
  }

  // ==================== 指南相关操作 ====================

  // 获取所有指南
  async getGuides(): Promise<DatabaseResponse<Guide[]>> {
    try {
      const storage = this.getStorage();
      return { success: true, data: storage.guides };
    } catch (error) {
      return { success: false, error: '获取指南失败' };
    }
  }

  // ==================== 用户交互相关操作 ====================

  // 切换收藏状态
  async toggleBookmark(resourceId: string, resourceType: 'template' | 'prompt' | 'guide'): Promise<DatabaseResponse<{ isBookmarked: boolean }>> {
    try {
      if (!this.currentUser) {
        return { success: false, error: '请先登录' };
      }

      const storage = this.getStorage();
      const existingIndex = storage.bookmarks.findIndex(
        b => b.user_id === this.currentUser!.id && 
             b.resource_id === resourceId && 
             b.resource_type === resourceType
      );

      let isBookmarked = false;

      if (existingIndex >= 0) {
        // 取消收藏
        storage.bookmarks.splice(existingIndex, 1);
        isBookmarked = false;
      } else {
        // 添加收藏
        storage.bookmarks.push({
          user_id: this.currentUser.id,
          resource_id: resourceId,
          resource_type: resourceType,
          created_at: new Date().toISOString()
        });
        isBookmarked = true;
      }

      this.saveStorage({ bookmarks: storage.bookmarks });
      return { success: true, data: { isBookmarked } };
    } catch (error) {
      return { success: false, error: '操作失败' };
    }
  }

  // 切换点赞状态
  async toggleLike(resourceId: string, resourceType: 'template' | 'prompt' | 'guide'): Promise<DatabaseResponse<{ isLiked: boolean; likesCount: number }>> {
    try {
      if (!this.currentUser) {
        return { success: false, error: '请先登录' };
      }

      const storage = this.getStorage();
      const existingIndex = storage.likes.findIndex(
        l => l.user_id === this.currentUser!.id && 
             l.resource_id === resourceId && 
             l.resource_type === resourceType
      );

      let isLiked = false;
      let likesCount = 0;

      if (existingIndex >= 0) {
        // 取消点赞
        storage.likes.splice(existingIndex, 1);
        isLiked = false;
        likesCount = -1;
      } else {
        // 添加点赞
        storage.likes.push({
          user_id: this.currentUser.id,
          resource_id: resourceId,
          resource_type: resourceType,
          created_at: new Date().toISOString()
        });
        isLiked = true;
        likesCount = 1;
      }

      // 更新对应资源的点赞数
      if (resourceType === 'template') {
        const template = storage.templates.find(t => t.id === resourceId);
        if (template) {
          template.likes_count += likesCount;
        }
      } else if (resourceType === 'prompt') {
        const prompt = storage.prompts.find(p => p.id === resourceId);
        if (prompt) {
          prompt.likes_count += likesCount;
        }
      } else if (resourceType === 'guide') {
        const guide = storage.guides.find(g => g.id === resourceId);
        if (guide) {
          guide.likes_count += likesCount;
        }
      }

      this.saveStorage({ 
        likes: storage.likes,
        templates: storage.templates,
        prompts: storage.prompts,
        guides: storage.guides
      });

      if (isLiked) {
        this.recordUsageStat('likes_given', 1);
      }

      return { success: true, data: { isLiked, likesCount: storage.templates.find(t => t.id === resourceId)?.likes_count || 0 } };
    } catch (error) {
      return { success: false, error: '操作失败' };
    }
  }

  // 检查是否已收藏
  isBookmarked(resourceId: string, resourceType: 'template' | 'prompt' | 'guide'): boolean {
    if (!this.currentUser) return false;
    
    const storage = this.getStorage();
    return storage.bookmarks.some(
      b => b.user_id === this.currentUser!.id && 
           b.resource_id === resourceId && 
           b.resource_type === resourceType
    );
  }

  // 检查是否已点赞
  isLiked(resourceId: string, resourceType: 'template' | 'prompt' | 'guide'): boolean {
    if (!this.currentUser) return false;
    
    const storage = this.getStorage();
    return storage.likes.some(
      l => l.user_id === this.currentUser!.id && 
           l.resource_id === resourceId && 
           l.resource_type === resourceType
    );
  }

  // ==================== 统计相关操作 ====================

  // 获取仪表板统计数据
  async getDashboardStats(): Promise<DatabaseResponse<any>> {
    try {
      const storage = this.getStorage();
      const userId = this.currentUser?.id;

      // 计算各阶段模板数量
      const templatesByStage = storage.templates.reduce((acc, template) => {
        acc[template.stage] = (acc[template.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // 计算平均效率分数
      const promptScores = storage.prompts
        .filter(p => p.efficiency_score)
        .map(p => p.efficiency_score as number);
      const avgEfficiencyScore = promptScores.length > 0 
        ? (promptScores.reduce((sum, score) => sum + score, 0) / promptScores.length).toFixed(1)
        : '0.0';

      // 计算总使用量
      const totalUsage = storage.templates.reduce((sum, template) => sum + template.usage_count, 0);

      // 计算用户相关统计
      const userTemplates = storage.templates.filter(t => t.author_id === userId);
      const userPrompts = storage.prompts.filter(p => p.author_id === userId);
      const userBookmarks = storage.bookmarks.filter(b => b.user_id === userId);
      const userLikes = storage.likes.filter(l => l.user_id === userId);

      // 获取最近7天的使用统计
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentStats = storage.usage_stats.filter(
        stat => stat.user_id === userId && new Date(stat.date) >= sevenDaysAgo
      );

      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayStat = recentStats.find(s => s.date === dateStr);
        
        return {
          day: date.toLocaleDateString('en', { weekday: 'short' }),
          usage: dayStat?.ai_requests || 0,
          efficiency: Math.floor(Math.random() * 50 + 50) // 模拟效率数据
        };
      });

      return {
        success: true,
        data: {
          templatesByStage,
          avgEfficiencyScore,
          totalUsage,
          userStats: {
            templatesCreated: userTemplates.length,
            promptsCreated: userPrompts.length,
            bookmarksCount: userBookmarks.length,
            likesGiven: userLikes.length
          },
          dailyStats,
          popularTemplates: storage.templates
            .filter(t => t.is_public)
            .sort((a, b) => b.usage_count - a.usage_count)
            .slice(0, 5),
          topLanguages: [
            { name: 'TypeScript', value: 75 },
            { name: 'Python', value: 60 },
            { name: 'JavaScript', value: 45 },
            { name: 'React', value: 40 }
          ]
        }
      };
    } catch (error) {
      return { success: false, error: '获取统计数据失败' };
    }
  }

  // 记录使用统计
  private recordUsageStat(metric: string, value: number): void {
    if (!this.currentUser) return;

    const storage = this.getStorage();
    const today = new Date().toISOString().split('T')[0];
    
    let userStat = storage.usage_stats.find(
      s => s.user_id === this.currentUser!.id && s.date === today
    );

    if (!userStat) {
      userStat = {
        user_id: this.currentUser.id,
        date: today,
        ai_requests: 0,
        templates_created: 0,
        likes_given: 0
      };
      storage.usage_stats.push(userStat);
    }

    if (metric === 'ai_requests') userStat.ai_requests += value;
    else if (metric === 'templates_created') userStat.templates_created += value;
    else if (metric === 'likes_given') userStat.likes_given += value;

    this.saveStorage({ usage_stats: storage.usage_stats });
  }

  // 生成UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const databaseService = new DatabaseService();