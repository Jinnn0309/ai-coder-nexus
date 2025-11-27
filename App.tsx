import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Playground from './components/Playground';
import Library from './components/Library';
import ProcessNavigator from './components/ProcessNavigator';
import GuideViewer from './components/GuideViewer';
import { View, ProcessStage, ProcessTemplate, Prompt, User } from './types.js';
import { 
    MOCK_PROCESS_TEMPLATES_EN, MOCK_PROCESS_TEMPLATES_CN,
    MOCK_PROMPTS_EN, MOCK_PROMPTS_CN,
    MOCK_GUIDES, MOCK_GUIDES_CN,
    CURRENT_USER, TRANSLATIONS 
} from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [lang, setLang] = useState<'en' | 'zh'>('zh'); // Default to Chinese

  // Data State
  const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>(MOCK_PROCESS_TEMPLATES_CN);
  const [prompts, setPrompts] = useState<Prompt[]>(MOCK_PROMPTS_CN);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  
  // Navigation State: Process -> Playground
  const [playgroundInitialTemplate, setPlaygroundInitialTemplate] = useState<ProcessTemplate | null>(null);

  // Effect to switch data when language changes
  useEffect(() => {
    if (lang === 'zh') {
        setProcessTemplates(MOCK_PROCESS_TEMPLATES_CN);
        setPrompts(MOCK_PROMPTS_CN);
    } else {
        setProcessTemplates(MOCK_PROCESS_TEMPLATES_EN);
        setPrompts(MOCK_PROMPTS_EN);
    }
  }, [lang]);

  const t = TRANSLATIONS[lang];

  // Handlers
  const handleBookmark = (id: string) => {
    setCurrentUser(prev => {
      const isBookmarked = prev.bookmarks.includes(id);
      return {
        ...prev,
        bookmarks: isBookmarked 
          ? prev.bookmarks.filter(b => b !== id)
          : [...prev.bookmarks, id]
      };
    });
  };

  const handleAddProcessTemplate = (template: ProcessTemplate) => {
    setProcessTemplates(prev => [template, ...prev]);
  };

  const handleDeleteProcessTemplate = (id: string) => {
    setProcessTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleAddPrompt = (prompt: Prompt) => {
    setPrompts(prev => [prompt, ...prev]);
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
        return <Dashboard t={t} />;
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
            currentUser={currentUser}
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

export default App;