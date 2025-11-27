
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Guide } from '../types.js';
import { Book, Clock, ChevronRight, ExternalLink, Tag, Box, Monitor, GraduationCap, ChevronLeft, Menu } from 'lucide-react';
import LearningPathViewer from './LearningPathViewer';

interface GuideViewerProps {
  guides: Guide[];
  t: any;
}

const GuideViewer: React.FC<GuideViewerProps> = ({ guides, t }) => {
  const [selectedGuide, setSelectedGuide] = useState<Guide>(guides[0]);
  const [currentUserId] = useState<string>('current-user'); // 实际应用中应该从用户状态获取
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [hasStartedLearning, setHasStartedLearning] = useState<boolean>(false);

  // Group guides by category
  const categories = Array.from(new Set(guides.map(g => g.category)));

  // 处理学习进度更新
  const handleProgressUpdate = (progress: any) => {
    console.log('学习进度更新:', progress);
    // 这里可以触发全局状态更新或发送到后端
  };

  // 当选择学习路径时不自动收缩，只有在开始学习内容时才收缩
  React.useEffect(() => {
    if (!selectedGuide.isLearningPath) {
      // 如果不是学习路径，重置状态
      setIsSidebarCollapsed(false);
      setHasStartedLearning(false);
    }
  }, [selectedGuide]);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-72'} shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300`}>
        <div className="mb-2">
            {!isSidebarCollapsed ? (
              <>
                <h2 className="text-2xl font-bold text-white">{t.guidelines}</h2>
                <p className="text-sm text-slate-400">Tutorials & Tool Documentation</p>
              </>
            ) : (
              <div className="flex justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
            )}
        </div>
        
        {categories.map(category => (
            <div key={category} className="space-y-2">
                <h3 className={`${isSidebarCollapsed ? 'justify-center' : 'text-xs font-bold text-slate-500 uppercase tracking-wider px-1'} flex items-center gap-2`}>
                    {category === 'AI Tools' || category === 'AI工具' ? <Monitor className="w-3 h-3" /> : <Book className="w-3 h-3" />}
                    {!isSidebarCollapsed && category}
                </h3>
                {guides.filter(g => g.category === category).map(guide => (
                    <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`w-full text-left p-3 rounded-lg border transition-all group relative overflow-hidden ${
                        selectedGuide.id === guide.id
                        ? 'bg-slate-800 border-primary-500/50 text-primary-400 shadow-md'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    >
                        {selectedGuide.id === guide.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}
                        {isSidebarCollapsed ? (
                            <div className="flex flex-col items-center justify-center py-2 px-1">
                                {guide.isLearningPath === true ? (
                                    <GraduationCap className="w-4 h-4 text-yellow-400 mb-1" />
                                ) : (
                                    <Book className="w-4 h-4 text-slate-400 mb-1" />
                                )}
                                <div className="text-xs text-center text-slate-400 mt-1 line-clamp-2 leading-tight">
                                    {guide.title.length > 8 ? guide.title.substring(0, 8) + '...' : guide.title}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold truncate pr-2 flex items-center gap-1">
                                        {guide.isLearningPath === true && <GraduationCap className="w-3 h-3 text-yellow-400" />}
                                        {guide.title}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs opacity-70">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 
                                        {guide.isLearningPath ? `${guide.estimatedDuration || 0}分钟` : guide.readTime}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {guide.isLearningPath && (
                                            <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded text-[10px] border border-yellow-500/30">
                                                学习路径
                                            </span>
                                        )}
                                        {guide.toolName && !guide.isLearningPath && (
                                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                                                {guide.toolName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </button>
                ))}
            </div>
        ))}
      </div>

      {/* Main Content Area */}
      {selectedGuide.isLearningPath === true ? (
        // 学习路径模式
        <div className="flex-1 relative">
          {/* 切换侧边栏按钮 */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute left-4 top-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
            title={isSidebarCollapsed ? '展开导航栏' : '收起导航栏'}
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <LearningPathViewer 
            guide={selectedGuide}
            userId={currentUserId}
            t={t}
            onProgressUpdate={handleProgressUpdate}
            isSidebarCollapsed={isSidebarCollapsed}
            onStartLearning={() => {
              setHasStartedLearning(true);
              setIsSidebarCollapsed(true);
            }}
          />
        </div>
      ) : (
        // 普通指南模式
        <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl relative">
          {/* 切换侧边栏按钮 */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute left-4 top-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors shadow-lg"
            title={isSidebarCollapsed ? '展开导航栏' : '收起导航栏'}
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
           {/* Header */}
           <div className="p-8 border-b border-slate-800 bg-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold border border-primary-500/20 uppercase tracking-wide">
                              {selectedGuide.category}
                          </span>
                          {selectedGuide.toolName && (
                              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1">
                                  <Box className="w-3 h-3" /> {selectedGuide.toolName}
                              </span>
                          )}
                      </div>
                      <h1 className="text-3xl font-bold text-white tracking-tight">{selectedGuide.title}</h1>
                      {selectedGuide.tags && (
                          <div className="flex gap-2">
                              {selectedGuide.tags.map(tag => (
                                  <span key={tag} className="text-xs text-slate-500 flex items-center gap-1">
                                      <Tag className="w-3 h-3" /> {tag}
                                  </span>
                              ))}
                          </div>
                      )}
                  </div>
                  
                  {selectedGuide.officialUrl && (
                      <a 
                          href={selectedGuide.officialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-lg"
                      >
                          Visit Official Site <ExternalLink className="w-4 h-4" />
                      </a>
                  )}
              </div>
           </div>

           {/* Markdown Content */}
           <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0d1117]">
              <div className="max-w-3xl mx-auto prose prose-invert prose-slate prose-headings:text-white prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-p:leading-relaxed prose-li:leading-relaxed prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-p:text-sm prose-li:text-sm prose-span:text-sm prose-div:text-sm leading-relaxed" style={{lineHeight: '1.5', fontSize: '14px'}}>
                  <ReactMarkdown>{selectedGuide.content}</ReactMarkdown>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GuideViewer;
