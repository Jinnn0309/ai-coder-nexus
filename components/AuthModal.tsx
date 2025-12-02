import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authService, LoginCredentials, RegisterCredentials } from '../services/authService.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      name: ''
    });
    setError('');
    setShowPassword(false);
  };

  // 切换模式
  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const credentials: LoginCredentials = {
        email: formData.email,
        password: formData.password
      };

      const result = await authService.login(credentials);

      if (result.success) {
        onAuthSuccess();
        onClose();
        resetForm();
      } else {
        setError(result.error || '登录失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 基本验证
      if (!formData.email || !formData.password || !formData.username) {
        setError('请填写所有必填字段');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('密码长度至少6位');
        setIsLoading(false);
        return;
      }

      const credentials: RegisterCredentials = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        name: formData.name || formData.username
      };

      const result = await authService.register(credentials);

      if (result.success) {
        onAuthSuccess();
        onClose();
        resetForm();
      } else {
        setError(result.error || '注册失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  // 如果模态框未打开，返回null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? '登录' : '注册'} Nexus AI
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    用户名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="请输入用户名"
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    姓名（可选）
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="请输入您的姓名"
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="请输入邮箱地址"
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {mode === 'login' ? '登录' : '注册'}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {mode === 'login' ? '还没有账号？' : '已有账号？'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {mode === 'login' ? '立即注册' : '立即登录'}
              </button>
            </p>
          </div>

          {/* Demo Account Info */}
          {mode === 'login' && (
            <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">演示账号：</p>
              <p className="text-xs text-slate-300">邮箱: demo@nexus-ai.com</p>
              <p className="text-xs text-slate-300">密码: demo123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;