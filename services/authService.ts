// 用户认证服务
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  name?: string;
}

class AuthService {
  private readonly API_URL = 'http://localhost:3001/api'; // 后端API地址
  private readonly TOKEN_KEY = 'nexus_ai_token';
  private readonly USER_KEY = 'nexus_ai_user';

  // 获取当前用户
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // 获取Token
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  // 保存用户信息和Token
  private saveUserData(user: User, token: string): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // 清除用户信息
  private clearUserData(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // 注册
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 模拟API调用 - 实际项目中这里会调用后端API
      const response = await this.mockRegister(credentials);
      
      if (response.success && response.user && response.token) {
        this.saveUserData(response.user, response.token);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || '注册失败' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  // 登录
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 模拟API调用
      const response = await this.mockLogin(credentials);
      
      if (response.success && response.user && response.token) {
        this.saveUserData(response.user, response.token);
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || '登录失败' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }

  // 退出登录
  logout(): void {
    this.clearUserData();
    // 可以添加调用后端登出API的逻辑
  }

  // 模拟注册API
  private async mockRegister(credentials: RegisterCredentials): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 获取现有用户
    const existingUsers = this.getMockUsers();
    
    // 检查邮箱是否已存在
    if (existingUsers.some(u => u.email === credentials.email)) {
      return { success: false, error: '邮箱已被注册' };
    }

    // 检查用户名是否已存在
    if (existingUsers.some(u => u.username === credentials.username)) {
      return { success: false, error: '用户名已被使用' };
    }

    // 创建新用户
    const newUser: User = {
      id: this.generateUUID(),
      email: credentials.email,
      username: credentials.username,
      name: credentials.name || credentials.username,
      role: 'user',
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 保存到localStorage（实际项目中会保存到数据库）
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('nexus_ai_users', JSON.stringify(updatedUsers));

    return {
      success: true,
      user: newUser,
      token: this.generateToken(newUser)
    };
  }

  // 模拟登录API
  private async mockLogin(credentials: LoginCredentials): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = this.getMockUsers();
    
    // 查找用户
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      return { success: false, error: '邮箱或密码错误' };
    }

    // 实际项目中这里会验证密码哈希，这里简化处理
    // 假设密码正确（演示用）
    return {
      success: true,
      user: user,
      token: this.generateToken(user)
    };
  }

  // 获取模拟用户数据
  private getMockUsers(): User[] {
    try {
      const usersStr = localStorage.getItem('nexus_ai_users');
      if (usersStr) {
        return JSON.parse(usersStr);
      }
    } catch (error) {
      console.error('Error reading mock users:', error);
    }

    // 默认的演示用户
    const defaultUsers: User[] = [
      {
        id: 'demo-user-001',
        email: 'demo@nexus-ai.com',
        username: 'demo',
        name: 'Demo User',
        role: 'user',
        email_verified: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'admin-user-001',
        email: 'admin@nexus-ai.com',
        username: 'admin',
        name: 'Admin User',
        role: 'admin',
        email_verified: true,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      }
    ];

    localStorage.setItem('nexus_ai_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  // 生成UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 生成Token（简化版）
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
    };
    return btoa(JSON.stringify(payload));
  }

  // 验证Token
  validateToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();