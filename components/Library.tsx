
import React, { useState } from 'react';
import { Search, Star, ArrowRight, MessageSquare, User as UserIcon, Filter, X, Copy, Send, ThumbsUp, Plus, Bookmark, Trash2, Sparkles, Zap, Wand2, Upload, FileText, Tag } from 'lucide-react';
import { Prompt, Comment, Role, User } from '../types.js';
import { summarizeFeedback } from '../services/geminiService';

interface LibraryProps {
  data: Prompt[];
  currentUser: User;
  onBookmark: (id: string) => void;
  onAdd: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onConvertToTemplate: (prompt: Prompt) => void;
  t: any;
}

const roles: Role[] = ['All', 'Product Manager', 'Frontend Dev', 'Backend Dev', 'QA Engineer', 'DevOps', 'User'];

const Library: React.FC<LibraryProps> = ({ data, currentUser, onBookmark, onAdd, onDelete, onConvertToTemplate, t }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // New Prompt State
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt>>({
    title: '',
    role: 'User',
    category: '',
    scenario: '',
    content: '',
    model: 'Gemini 2.5',
    tags: []
  });

  // Document Upload State for Library
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [aiGeneratedTags, setAiGeneratedTags] = useState<any[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  // Sorting & Filtering
  const sortedData = [...data].sort((a, b) => {
      if (a.isSystem && !b.isSystem) return -1;
      if (!a.isSystem && b.isSystem) return 1;
      const aBookmarked = currentUser.bookmarks.includes(a.id);
      const bBookmarked = currentUser.bookmarks.includes(b.id);
      if (aBookmarked && !bBookmarked) return -1;
      if (!aBookmarked && bBookmarked) return 1;
      return b.likes - a.likes;
  });

  const filteredData = sortedData.filter(prompt => {
    const matchesRole = selectedRole === 'All' || prompt.role === selectedRole;
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPrompt) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: currentUser.name,
      role: currentUser.role === 'admin' ? 'Admin' : 'User',
      text: newComment,
      timestamp: Date.now()
    };
    selectedPrompt.comments.unshift(comment);
    setNewComment('');
  };

  const handleCreatePrompt = () => {
      if (!newPrompt.title || !newPrompt.content) return;

      const prompt: Prompt = {
          id: Date.now().toString(),
          title: newPrompt.title!,
          role: newPrompt.role as Role || 'User',
          category: newPrompt.category || 'General',
          scenario: newPrompt.scenario || '',
          content: newPrompt.content!,
          model: newPrompt.model || 'Gemini 2.5',
          efficiencyScore: 0,
          tags: [...(newPrompt.tags || []), ...aiGeneratedTags.map(tag => tag.name)],
          likes: 0,
          comments: [],
          authorId: currentUser.id,
          authorName: currentUser.name,
          isSystem: false,
          createdAt: Date.now(),
          projectContext: newPrompt.projectContext,
          features: newPrompt.features,
          frontend: newPrompt.frontend,
          backend: newPrompt.backend,
          averageRating: 0,
          totalRatings: 0
      };

      onAdd(prompt);
      resetPromptModal();
  };

  const resetPromptModal = () => {
      setIsUploadModalOpen(false);
      setNewPrompt({ 
          title: '', 
          role: 'User', 
          category: '', 
          scenario: '', 
          content: '', 
          model: 'Gemini 2.5', 
          tags: [],
          projectContext: undefined,
          features: undefined,
          frontend: undefined,
          backend: undefined
      });
      setUploadedDocument(null);
      setAiGeneratedTags([]);
  };

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingDocument(true);
    
    try {
      let content = '';
      let fileType = 'text';

      if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        content = await file.text();
        fileType = 'markdown';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        content = `Word document: ${file.name}\n\nNote: Word document processing requires additional library support.\nPlease copy and paste key content manually.`;
        fileType = 'word';
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        content = `PDF document: ${file.name}\n\nNote: PDF document processing requires additional library support.\nPlease copy and paste key content manually.`;
        fileType = 'pdf';
      } else {
        content = await file.text();
        fileType = 'text';
      }

      const document = {
        id: Date.now().toString(),
        name: file.name,
        type: fileType,
        content: content.substring(0, 5000)
      };

      setUploadedDocument(document);
      
      // 自动填充内容
      setNewPrompt(prev => ({
          ...prev,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
          content: prev.content || content.substring(0, 1000),
          scenario: prev.scenario || `Template created from ${file.name}`
      }));
      
      // 生成AI标签
      await generateAITags(content);
      
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessingDocument(false);
    }
  };

  // AI标签生成
  const generateAITags = async (content: string) => {
    setIsGeneratingTags(true);
    try {
      // 模拟AI标签生成
      const mockTags = [
        { name: 'React Optimization', confidence: 0.92, category: 'tech' },
        { name: 'Performance Tuning', confidence: 0.88, category: 'category' },
        { name: 'Advanced', confidence: 0.75, category: 'difficulty' },
        { name: 'Frontend Dev', confidence: 0.95, category: 'role' }
      ];
      
      setAiGeneratedTags(mockTags);
      
      // 自动设置角色
      const roleTag = mockTags.find(tag => tag.category === 'role' && tag.confidence > 0.8);
      if (roleTag && roleTag.name.includes('Frontend')) {
        setNewPrompt(prev => ({ ...prev, role: 'Frontend Dev' as Role }));
      }
    } catch (error) {
      console.error('Error generating AI tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSummarize = async () => {
      if(!selectedPrompt || selectedPrompt.comments.length === 0) return;
      setIsSummarizing(true);
      const result = await summarizeFeedback(selectedPrompt.comments.map(c => c.text));
      setSummary(result);
      setIsSummarizing(false);
  };

  // 评分处理函数
  const handleRating = (score: number) => {
      if (!selectedPrompt) return;
      
      // 更新平均评分
      const currentTotal = (selectedPrompt.totalRatings || 0) * (selectedPrompt.averageRating || 0);
      const newTotal = currentTotal + score;
      const newCount = (selectedPrompt.totalRatings || 0) + 1;
      const newAverage = newTotal / newCount;
      
      selectedPrompt.averageRating = newAverage;
      selectedPrompt.totalRatings = newCount;
      
      // 触发重新渲染
      setSelectedPrompt({...selectedPrompt});
  };

  // 转换为流程模板函数
  const handleConvertToTemplate = () => {
      if (!selectedPrompt) return;
      
      // 调用父组件传递的转换函数
      onConvertToTemplate(selectedPrompt);
      
      // 关闭模态框
      setSelectedPrompt(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">{t.promptTitle}</h2>
          <p className="text-slate-400 mt-1">{t.promptDesc}</p>
        </div>
        <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
            <Plus className="w-4 h-4" /> {t.createPrompt}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRole === role
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredData.map(prompt => {
           const isBookmarked = currentUser.bookmarks.includes(prompt.id);
           return (
          <div 
            key={prompt.id}
            onClick={() => setSelectedPrompt(prompt)}
            className={`group bg-slate-800 border rounded-xl p-5 cursor-pointer hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/5 ${
                prompt.isSystem ? 'border-primary-900/50' : 'border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                      prompt.role === 'Product Manager' ? 'bg-purple-500/10 text-purple-400' :
                      prompt.role === 'Frontend Dev' ? 'bg-blue-500/10 text-blue-400' :
                      prompt.role === 'Backend Dev' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-slate-700 text-slate-300'
                  }`}>
                    {prompt.role}
                  </span>
                  {isBookmarked && (
                    <span className="px-2 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        SAVED
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                 {prompt.isSystem && <Sparkles className="w-3 h-3 text-primary-400" />}
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
              {prompt.title}
            </h3>
            
            <p className="text-slate-400 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
              {prompt.scenario}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {prompt.likes}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {prompt.comments.length}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-start shrink-0">
              <div>
                 <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">{selectedPrompt.role}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">{selectedPrompt.category}</span>
                 </div>
                 <h2 className="text-2xl font-bold text-white">{selectedPrompt.title}</h2>
                 <p className="text-slate-400 text-sm mt-1">Model: {selectedPrompt.model} • Author: {selectedPrompt.authorName}</p>
              </div>
              <div className="flex gap-2">
                 <button 
                    onClick={() => onBookmark(selectedPrompt.id)}
                    className={`p-2 rounded-full transition-colors ${currentUser.bookmarks.includes(selectedPrompt.id) ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    <Bookmark className="w-5 h-5 fill-current" />
                </button>
                {!selectedPrompt.isSystem && selectedPrompt.authorId === currentUser.id && (
                     <button 
                        onClick={() => {
                            onDelete(selectedPrompt.id);
                            setSelectedPrompt(null);
                        }}
                        className="p-2 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-full transition-colors"
                     >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
                <button onClick={() => setSelectedPrompt(null)} className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
               {/* Left: Prompt Content */}
               <div className="lg:col-span-2 p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Scenario</h3>
                    <p className="text-slate-400 text-sm">{selectedPrompt.scenario}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Prompt Content</h3>
                        <button 
                            onClick={() => navigator.clipboard.writeText(selectedPrompt.content)}
                            className="text-xs flex items-center gap-1 text-primary-400 hover:text-primary-300"
                        >
                            <Copy className="w-3 h-3" /> Copy
                        </button>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                        {selectedPrompt.content}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">Tags</h3>
                    <div className="flex gap-2 flex-wrap">
                        {selectedPrompt.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">#{tag}</span>
                        ))}
                    </div>
                  </div>
               </div>

               {/* Right: Community & Feedback */}
               <div className="p-6 bg-slate-800/10 space-y-6 flex flex-col h-full">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
                      <div className="text-slate-400 text-xs uppercase font-bold mb-1">Efficiency Score</div>
                      <div className="text-3xl font-bold text-emerald-400">{selectedPrompt.efficiencyScore || 'N/A'}</div>
                  </div>

                  {/* 评分系统 */}
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <div className="text-slate-400 text-xs uppercase font-bold mb-2">User Rating</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                              <button
                                  key={star}
                                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                  onClick={() => handleRating(star)}
                              >
                                  {star <= (selectedPrompt.averageRating || 0) ? '⭐' : '☆'}
                              </button>
                          ))}
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                          {selectedPrompt.averageRating?.toFixed(1) || '0.0'} ({selectedPrompt.totalRatings || 0} ratings)
                      </div>
                  </div>

                  {/* 转换为流程模板按钮 */}
                  {(selectedPrompt.projectContext || selectedPrompt.features) && (
                      <button 
                          onClick={handleConvertToTemplate}
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium text-sm hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                          <Wand2 className="w-4 h-4" />
                          Convert to Process Template
                      </button>
                  )}

                  <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Comments ({selectedPrompt.comments.length})
                          </h3>
                          {selectedPrompt.comments.length > 1 && (
                              <button 
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-500/20"
                              >
                                <Sparkles className="w-3 h-3" /> {isSummarizing ? 'Analyzing...' : 'AI Summary'}
                              </button>
                          )}
                      </div>

                      {summary && (
                          <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-xs text-purple-200 animate-in fade-in slide-in-from-top-2">
                              <span className="font-bold block mb-1">AI Feedback Summary:</span>
                              {summary}
                          </div>
                      )}

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                          {selectedPrompt.comments.map(comment => (
                              <div key={comment.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold text-slate-300">{comment.author}</span>
                                      <span className="text-[10px] text-slate-500">{comment.role}</span>
                                  </div>
                                  <p className="text-xs text-slate-400">{comment.text}</p>
                              </div>
                          ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="relative">
                              <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add feedback..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:border-primary-500 focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                              />
                              <button 
                                onClick={handleAddComment}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-400"
                              >
                                  <Send className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Prompt Modal */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{t.createPrompt}</h2>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded hover:bg-blue-500/20 transition-colors cursor-pointer">
                            <Upload className="w-3 h-3" /> 📄 {t.uploadDocument || 'Upload Document'}
                            <input type="file" accept=".md,.docx,.pdf,.txt" onChange={handleFileUpload} className="hidden" />
                        </label>
                        {aiGeneratedTags.length > 0 && (
                            <button 
                                onClick={() => setAiGeneratedTags([])} 
                                className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/20 transition-colors"
                            >
                                Clear Tags
                            </button>
                        )}
                        <button onClick={() => resetPromptModal()}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Document Preview */}
                    {uploadedDocument && (
                        <div className="mb-6 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-300">{uploadedDocument.name}</span>
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                       {uploadedDocument.type.toUpperCase()}
                                    </span>
                                </div>
                                {isProcessingDocument && (
                                    <span className="text-xs text-blue-300">Processing...</span>
                                )}
                            </div>
                            {uploadedDocument.content && (
                                <div className="bg-slate-950/50 border border-slate-700 rounded p-3 text-xs text-slate-400 max-h-32 overflow-y-auto">
                                    {uploadedDocument.content.substring(0, 300)}
                                    {uploadedDocument.content.length > 300 && '...'}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Generated Tags */}
                    {aiGeneratedTags.length > 0 && (
                        <div className="mb-6 bg-green-900/10 border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-300">AI Generated Tags</span>
                                    {isGeneratingTags && (
                                        <span className="text-xs text-green-300">Generating...</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {aiGeneratedTags.map((tag, index) => (
                                    <div key={index} className="bg-slate-800 border border-slate-600 rounded px-2 py-1">
                                        <span className="text-xs text-slate-300">
                                            {tag.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 ml-1">
                                            ({Math.round(tag.confidence * 100)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input type="text" value={newPrompt.title} onChange={e => setNewPrompt({...newPrompt, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Role</label>
                            <select value={newPrompt.role} onChange={e => setNewPrompt({...newPrompt, role: e.target.value as Role})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white">
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Category</label>
                            <input type="text" value={newPrompt.category} onChange={e => setNewPrompt({...newPrompt, category: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" placeholder="e.g., Debugging" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Scenario Description</label>
                        <textarea value={newPrompt.scenario} onChange={e => setNewPrompt({...newPrompt, scenario: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-20" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Prompt Content</label>
                        <textarea value={newPrompt.content} onChange={e => setNewPrompt({...newPrompt, content: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-32 font-mono" />
                    </div>
                    
                    {/* 项目简介信息 */}
                    <div className="border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-3">Project Context (Optional)</h4>
                        
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Project Name</label>
                            <input type="text" value={newPrompt.projectContext?.projectName || ''} onChange={e => setNewPrompt({
                                ...newPrompt, 
                                projectContext: {...(newPrompt.projectContext || {projectName: '', techStack: [], userStories: []}), projectName: e.target.value}
                            })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3" placeholder="e.g., E-commerce Platform" />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Key Features (comma separated)</label>
                            <input type="text" value={newPrompt.features?.join(', ') || ''} onChange={e => setNewPrompt({
                                ...newPrompt, 
                                features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                            })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3" placeholder="e.g., User authentication, Product catalog, Payment processing" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Frontend Tech (comma separated)</label>
                                <input type="text" value={newPrompt.frontend?.join(', ') || ''} onChange={e => setNewPrompt({
                                    ...newPrompt, 
                                    frontend: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" placeholder="e.g., React, Tailwind, TypeScript" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Backend Tech (comma separated)</label>
                                <input type="text" value={newPrompt.backend?.join(', ') || ''} onChange={e => setNewPrompt({
                                    ...newPrompt, 
                                    backend: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white" placeholder="e.g., Node.js, MongoDB, Express" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-800 flex justify-end gap-2">
                     <button onClick={resetPromptModal} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                     <button 
                         onClick={handleCreatePrompt} 
                         disabled={!newPrompt.title || !newPrompt.content}
                         className="px-4 py-2 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                         {t.createPromptBtn || 'Create Prompt'}
                     </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Library;
