
import React from 'react';
import { LayoutDashboard, Terminal, GitMerge, Library, BookOpen, Settings, Code2, Globe } from 'lucide-react';
import { View } from '../types.js';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  lang: 'en' | 'zh';
  setLang: (lang: 'en' | 'zh') => void;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, lang, setLang, t }) => {
  const navItems = [
    { id: View.DASHBOARD, label: t.dashboard, icon: LayoutDashboard },
    { id: View.PROCESS, label: t.processFlow, icon: GitMerge },
    { id: View.PLAYGROUND, label: t.testGround, icon: Terminal },
    { id: View.PROMPTS, label: t.promptLibrary, icon: Library },
    { id: View.GUIDES, label: t.guidelines, icon: BookOpen },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-primary-500 p-2 rounded-lg">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">Nexus AI</h1>
          <p className="text-xs text-slate-400">开发平台 v1.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
          {t.platform}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
        >
          <Globe className="w-5 h-5" />
          {lang === 'en' ? '中文' : 'English'}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5" />
          {t.settings}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
