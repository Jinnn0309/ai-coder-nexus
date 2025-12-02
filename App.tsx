import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Playground from './components/Playground';
import Library from './components/Library';
import ProcessNavigator from './components/ProcessNavigator';
import GuideViewer from './components/GuideViewer';
import AuthModal from './components/AuthModal';
import { View, ProcessStage, ProcessTemplate, Prompt, User } from './types.js';
import { 
    MOCK_PROCESS_TEMPLATES_EN, MOCK_PROCESS_TEMPLATES_CN,
    MOCK_PROMPTS_EN, MOCK_PROMPTS_CN,
    MOCK_GUIDES, MOCK_GUIDES_CN,
    TRANSLATIONS 
} from './constants';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [lang, setLang] = useState<'en' | 'zh'>('zh'); // Default to Chinese

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Data State
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  
  // Navigation State: Process -> Playground
  const [playgroundInitialTemplate, setPlaygroundInitialTemplate] = useState<ProcessTemplate | null>(null);

  // Initialize authentication and data
  useEffect(() => {
    // 检查用户认证状态
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // 未登录，显示登录模态框
      setIsAuthModalOpen(true);
    }

    // 初始化数据库
    databaseService.initializeDefaultData();
  }, []);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesResponse, promptsResponse, guidesResponse] = await Promise.all([
          databaseService.getTemplates(),
          databaseService.getPrompts(),
          databaseService.getGuides()
        ]);

        if (templatesResponse.success) {
          setProcessTemplates(templatesResponse.data || []);
        }
        if (promptsResponse.success) {
          setPrompts(promptsResponse.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const t = TRANSLATIONS[lang];

  // Authentication Handlers
  const handleAuthSuccess = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setProcessTemplates([]);
    setPrompts([]);
  };

  // Data Handlers
  const handleBookmark = async (id: string, resourceType: 'template' | 'prompt' | 'guide') => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      await databaseService.toggleBookmark(id, resourceType);
      // 重新加载数据
      const templatesResponse = await databaseService.getTemplates();
      if (templatesResponse.success) {
        setProcessTemplates(templatesResponse.data || []);
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleAddProcessTemplate = async (template: ProcessTemplate) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    // 保存到数据库
    setProcessTemplates(prev => [template, ...prev]);
  };

  const handleDeleteProcessTemplate = (id: string) => {
    setProcessTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddPrompt = async (prompt: Prompt) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await databaseService.createPrompt({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        scenario: prompt.scenario,
        role: prompt.role,
        language: prompt.language,
        efficiency_score: prompt.efficiencyScore,
        is_system: prompt.isSystem,
        is_public: true,
        status: 'approved',
        tags: prompt.tags || []
      });

      if (response.success) {
        setPrompts(prev => [response.data!, ...prev]);
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };
  
  const handleNavigateToPlayground = (template: ProcessTemplate) => {
      setPlaygroundInitialTemplate(template);
      setCurrentView(View.PLAYGROUND);
  };

  // 处理提示词转换为流程模板
  const handleConvertPromptToTemplate = (prompt: Prompt) => {
      // 根据提示词内容确定适用的开发阶段
      let stage: ProcessStage = 'development';
      const content = prompt.content.toLowerCase();
      const title = prompt.title.toLowerCase();
      const category = prompt.category.toLowerCase();
      
      if (content.includes('requirement') || content.includes('pr') || 
          title.includes('需求') || category.includes('requirement')) {
          stage = 'requirements';
      } else if (content.includes('plan') || content.includes('roadmap') || 
                 title.includes('规划') || category.includes('planning')) {
          stage = 'product_planning';
      } else if (content.includes('architecture') || content.includes('design') || 
                 title.includes('架构') || category.includes('architecture')) {
          stage = 'architecture';
      } else if (content.includes('story') || content.includes('user story') || 
                 title.includes('故事') || category.includes('story')) {
          stage = 'story_creation';
      } else if (content.includes('test') || content.includes('qa') || 
                 title.includes('测试') || category.includes('testing') || category.includes('qa')) {
          stage = 'qa';
      }
      
      const template: ProcessTemplate = {
          id: `template-${Date.now()}`,
          title: prompt.title,
          stage: stage,
          techStack: [
              ...(prompt.frontend || []),
              ...(prompt.backend || []),
              ...(prompt.projectContext?.techStack || [])
          ],
          appType: 'web_crud',
          supports: prompt.features || [],
          description: prompt.scenario || `Converted from prompt: ${prompt.title}`,
          promptContent: prompt.content,
          inputFormat: 'Specific task description',
          outputFormat: 'Code or documentation as requested',
          templatePreview: `# Generated Output Preview\n\nThis template will help you with: ${prompt.scenario}`,
          likes: prompt.likes,
          usageCount: 0,
          comments: prompt.comments,
          authorId: prompt.authorId,
          authorName: prompt.authorName,
          isSystem: false,
          createdAt: Date.now(),
          projectContext: prompt.projectContext,
          features: prompt.features,
          frontend: prompt.frontend,
          backend: prompt.backend,
          averageRating: prompt.averageRating,
          totalRatings: prompt.totalRatings
      };
      
      // 添加到流程模板列表
      handleAddProcessTemplate(template);
      
      // 切换到流程导航页面
      setCurrentView(View.PROCESS);
      
      // 显示成功提示
      alert(`Prompt "${prompt.title}" successfully converted to process template! Check the Process Flow section.`);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard t={t} currentUser={currentUser} />;
      case View.PLAYGROUND:
        return (
            <Playground 
                t={t} 
                onAddPrompt={handleAddPrompt} 
                initialTemplate={playgroundInitialTemplate}
                onClearInitialTemplate={() => setPlaygroundInitialTemplate(null)}
            />
        );
      case View.PROCESS:
        return (
          <ProcessNavigator 
                data={processTemplates}
                currentUser={currentUser || { id: '', name: '', role: 'user', bookmarks: [] }}
                onBookmark={handleBookmark}
                onAdd={handleAddProcessTemplate}
                onDelete={handleDeleteProcessTemplate}
                onRunInPlayground={handleNavigateToPlayground}
                t={t}
              />
        );
      case View.PROMPTS:
        return (
          <Library 
            data={prompts}
            currentUser={currentUser}
            onBookmark={handleBookmark}
            onAdd={handleAddPrompt}
            onDelete={handleDeletePrompt}
            onConvertToTemplate={handleConvertPromptToTemplate}
            t={t}
          />
        );
      case View.GUIDES:
        return <GuideViewer guides={lang === 'zh' ? MOCK_GUIDES_CN : MOCK_GUIDES} t={t} />;
      default:
        return <Dashboard t={t} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        lang={lang}
        setLang={setLang}
        t={t}
      />
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
};

export default App;