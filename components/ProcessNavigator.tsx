import React, { useState, useEffect } from 'react';
import { FileText, Layers, ListTree, Code, CheckCircle, X, Copy, Eye, Zap, MessageSquare, Bookmark, Plus, Layout, Filter, Sparkles, ThumbsUp, Send, Trash2, User as UserIcon, Wand2, Upload, Tag, File } from 'lucide-react';
import { ProcessTemplate, ProcessStage, Comment, User, AppType, UploadedDocument, AITag } from '../types.js';
import ReactMarkdown from 'react-markdown';
import { APP_TYPES } from '../constants';
import { summarizeFeedback, parseProcessTemplate } from '../services/geminiService';
import { databaseService } from '../services/databaseService';

interface ProcessNavigatorProps {
  data: ProcessTemplate[];
  currentUser: User;
  onBookmark: (id: string) => void;
  onAdd: (template: ProcessTemplate) => void;
  onDelete: (id: string) => void;
  onRunInPlayground: (template: ProcessTemplate) => void;
  t: any;
}

const techTags = ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing'];

const ProcessNavigator: React.FC<ProcessNavigatorProps> = ({ data, currentUser, onBookmark, onAdd, onDelete, onRunInPlayground, t }) => {
  const [activeStage, setActiveStage] = useState<ProcessStage>('requirements');
  const [selectedAppType, setSelectedAppType] = useState<string>('web_crud');
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Feedback State
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Smart Import State
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [showImportInput, setShowImportInput] = useState(false);

  // Document Upload State
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);
  const [aiGeneratedTags, setAiGeneratedTags] = useState<AITag[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // New Template State
  const [newTemplate, setNewTemplate] = useState<Partial<ProcessTemplate>>({
    title: '',
    stage: 'requirements',
    description: '',
    promptContent: '',
    inputFormat: '',
    outputFormat: '',
    techStack: [],
    appType: 'web_crud'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStage]);

  const stages: { id: ProcessStage; label: string; icon: any }[] = [
    { id: 'requirements', label: t.requirements, icon: FileText },
    { id: 'product_planning', label: t.product_planning, icon: Layout },
    { id: 'architecture', label: t.architecture, icon: Layers },
    { id: 'story_creation', label: t.story_creation, icon: ListTree },
    { id: 'development', label: t.development, icon: Code },
    { id: 'qa', label: t.qa, icon: CheckCircle },
  ];

  const filteredData = data.filter(item => {
    const stageMatch = item.stage === activeStage;
    const appTypeMatch = !item.appType || item.appType === selectedAppType || selectedAppType === 'all';
    const techMatch = selectedTechTags.length === 0 || selectedTechTags.some(tag => item.techStack.includes(tag) || item.techStack.includes('General'));
    return stageMatch && appTypeMatch && techMatch;
  });

  const handleSmartParse = async () => {
      if (!importText.trim()) return;
      setIsParsing(true);
      try {
          const parsed = await parseProcessTemplate(importText);
          setNewTemplate(prev => ({
              ...prev,
              ...parsed,
              stage: prev.stage, 
              appType: prev.appType
          }));
          setShowImportInput(false);
      } catch (error) {
          alert("Failed to parse text. Please fill fields manually.");
      } finally {
          setIsParsing(false);
      }
  };

  const handleCreateTemplate = () => {
     if(!newTemplate.title || !newTemplate.promptContent) return;
     
     const template: ProcessTemplate = {
         id: Date.now().toString(),
         title: newTemplate.title!,
         stage: newTemplate.stage as ProcessStage || activeStage,
         techStack: [...(newTemplate.techStack || []), ...selectedTags.filter(tag => 
           ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript'].includes(tag)
         )],
         appType: newTemplate.appType as AppType || 'web_crud',
         supports: selectedTags.filter(tag => 
           !['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'TypeScript', 'JavaScript'].includes(tag)
         ),
         description: newTemplate.description || '',
         promptContent: newTemplate.promptContent!,
         inputFormat: newTemplate.inputFormat || 'None',
         outputFormat: newTemplate.outputFormat || 'Markdown',
         templatePreview: '',
         likes: 0,
         usageCount: 0,
         comments: [],
         authorId: currentUser.id,
         authorName: currentUser.name,
         isSystem: false,
         createdAt: Date.now()
     };

     // 保存到数据库
     const saveTemplate = async () => {
       try {
         const response = await databaseService.createTemplate({
           title: template.title,
           description: template.description,
           content: template.templatePreview || '',
           prompt_content: template.promptContent,
           input_format: template.inputFormat,
           output_format: template.outputFormat,
           stage: template.stage,
           tech_stack: template.techStack || [],
           supports: template.supports || [],
           app_type: template.appType,
           is_system: template.isSystem,
           is_public: true,
           status: 'approved',
           tags: template.supports || []
         });

         if (response.success) {
           onAdd(response.data!);
           resetUploadModal();
           // 显示成功消息
           alert('模板创建成功！');
         } else {
           alert(`创建失败: ${response.error}`);
         }
       } catch (error) {
         console.error('Error creating template:', error);
         alert('创建失败，请稍后重试');
       }
     };

     saveTemplate();
  };

  const resetUploadModal = () => {
     setIsUploadModalOpen(false);
     setNewTemplate({ title: '', stage: 'requirements', description: '', promptContent: '', inputFormat: '', outputFormat: '', techStack: [], appType: 'web_crud' });
     setImportText('');
     setShowImportInput(false);
     setUploadedDocument(null);
     setAiGeneratedTags([]);
     setSelectedTags([]);
  };

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingDocument(true);
    const fileId = Date.now().toString();
    
    try {
      let content = '';
      let fileType: 'markdown' | 'word' | 'pdf' | 'text' = 'text';

      if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
        content = await file.text();
        fileType = 'markdown';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        content = `Word document: ${file.name}\n\nNote: Word document processing requires additional library support.\nCurrent content preview is not available.\n\nPlease copy and paste the key content manually.`;
        fileType = 'word';
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        content = `PDF document: ${file.name}\n\nNote: PDF document processing requires additional library support.\nCurrent content preview is not available.\n\nPlease copy and paste the key content manually.`;
        fileType = 'pdf';
      } else {
        content = await file.text();
        fileType = 'text';
      }

      const document: UploadedDocument = {
        id: fileId,
        name: file.name,
        type: fileType,
        content: content.substring(0, 5000),
        uploadedAt: Date.now()
      };

      setUploadedDocument(document);
      setImportText(content.substring(0, 2000));
      setShowImportInput(true);
      
      // 自动生成AI标签
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
      // 模拟AI标签生成 - 实际应该调用Gemini API
      const mockTags: AITag[] = [
        { name: 'Requirements Analysis', confidence: 0.95, category: 'stage' },
        { name: 'React', confidence: 0.88, category: 'tech' },
        { name: 'User Stories', confidence: 0.92, category: 'category' },
        { name: 'API Design', confidence: 0.85, category: 'category' },
        { name: 'TypeScript', confidence: 0.78, category: 'tech' },
        { name: 'Intermediate', confidence: 0.75, category: 'difficulty' }
      ];
      
      setAiGeneratedTags(mockTags);
      setSelectedTags(mockTags.map(tag => tag.name));
      
      // 根据高置信度的stage标签自动设置开发阶段
      const stageTag = mockTags.find(tag => tag.category === 'stage' && tag.confidence > 0.8);
      if (stageTag) {
        const stageMap: Record<string, ProcessStage> = {
          'requirements analysis': 'requirements',
          'product planning': 'product_planning',
          'system design': 'architecture',
          'story creation': 'story_creation',
          'development': 'development',
          'testing': 'qa'
        };
        
        const mappedStage = stageMap[stageTag.name.toLowerCase()];
        if (mappedStage) {
          setNewTemplate(prev => ({ ...prev, stage: mappedStage }));
        }
      }
    } catch (error) {
      console.error('Error generating AI tags:', error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // 增强的智能导入
  const handleSmartParseEnhanced = async () => {
    if (!importText.trim()) return;
    setIsParsing(true);
    
    try {
      const parsedData = {
        title: uploadedDocument?.name.replace(/\.[^/.]+$/, "") || 'Template from Document',
        description: `Template created from ${uploadedDocument?.name || 'uploaded document'} with AI assistance`,
        promptContent: importText,
        inputFormat: 'Document-based context',
        outputFormat: 'Structured output based on document analysis'
      };
      
      setNewTemplate(prev => ({
        ...prev,
        ...parsedData
      }));
      
      setShowImportInput(false);
    } catch (error) {
      console.error('Error parsing document:', error);
      alert('Error parsing document. Please try manual input.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSummarize = async () => {
      if(!selectedTemplate || selectedTemplate.comments.length === 0) return;
      setIsSummarizing(true);
      const result = await summarizeFeedback(selectedTemplate.comments.map(c => c.text));
      setSummary(result);
      setIsSummarizing(false);
  };

  const handleAddComment = () => {
      if (!newComment.trim() || !selectedTemplate) return;
      const comment: Comment = {
          id: Date.now().toString(),
          author: currentUser.name,
          role: currentUser.role === 'admin' ? 'Admin' : 'User',
          text: newComment,
          timestamp: Date.now()
      };
      selectedTemplate.comments.unshift(comment);
      setNewComment('');
  };

  const handleTemplateRating = (score: number) => {
      if (!selectedTemplate) return;
      
      // 更新平均评分
      const currentTotal = (selectedTemplate.totalRatings || 0) * (selectedTemplate.averageRating || 0);
      const newTotal = currentTotal + score;
      const newCount = (selectedTemplate.totalRatings || 0) + 1;
      const newAverage = newTotal / newCount;
      
      selectedTemplate.averageRating = newAverage;
      selectedTemplate.totalRatings = newCount;
      
      // 触发重新渲染
      setSelectedTemplate({...selectedTemplate});
  };

  const handleOpenDetail = (template: ProcessTemplate) => {
      setSelectedTemplate(template);
      setSummary(null);
      setNewComment('');
  };

  return (
    <div className="animate-fade-in space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
            <h2 className="text-3xl font-bold text-white">{t.processTitle}</h2>
            <p className="text-slate-400 mt-1">{t.processDesc}</p>
        </div>
        <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-900/20"
        >
            <Plus className="w-4 h-4" /> {t.shareTemplate}
        </button>
      </div>

      {/* Stage Navigation */}
      <div className="relative py-2 shrink-0">
        <div className="absolute top-8 left-0 w-full h-0.5 bg-slate-800 hidden md:block rounded-full -z-0" />
        <div className="relative z-10 flex justify-between min-w-[600px] overflow-x-auto no-scrollbar py-2 px-1">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            const isPast = stages.findIndex(s => s.id === activeStage) > index;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className="group flex flex-col items-center gap-3 focus:outline-none min-w-[80px]"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300 z-20 ${
                  isActive 
                    ? 'bg-slate-900 border-primary-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] scale-110' 
                    : isPast 
                      ? 'bg-slate-800 border-primary-500/30 text-primary-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider text-center transition-colors ${
                  isActive ? 'text-primary-400' : 'text-slate-500'
                }`}>
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shrink-0">
             <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Filter className="w-3 h-3" /> {t.appType}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {APP_TYPES.map(type => (
                            <button
                                key={type.value}
                                onClick={() => setSelectedAppType(type.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    selectedAppType === type.value 
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' 
                                    : 'text-slate-400 border border-transparent hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-slate-800 hidden lg:block" />

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
                        {t.techDimensions}
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {techTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    if (selectedTechTags.includes(tag)) setSelectedTechTags(selectedTechTags.filter(t => t !== tag));
                                    else setSelectedTechTags([...selectedTechTags, tag]);
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    selectedTechTags.includes(tag) 
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' 
                                    : 'text-slate-400 border border-transparent hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
             </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-min pb-10">
             {filteredData.length > 0 ? (
                filteredData.map(item => {
                  const isBookmarked = currentUser.bookmarks.includes(item.id);
                  return (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenDetail(item)}
                    className={`relative bg-slate-800 border rounded-xl p-5 cursor-pointer hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all group flex flex-col h-full ${
                        item.isSystem ? 'border-primary-900/50' : 'border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                         <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-medium border border-blue-500/20">
                             {APP_TYPES.find(t => t.value === item.appType)?.label || 'General'}
                         </span>
                         <div className="flex gap-2">
                            {isBookmarked && <Bookmark className="w-4 h-4 text-amber-400 fill-current" />}
                            {item.isSystem && <span className="text-primary-400" title="Official">⭐</span>}
                         </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">{item.description}</p>
                    <div className="pt-4 border-t border-slate-700/50 mt-auto flex items-center justify-between">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onRunInPlayground(item); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary-500/10 text-primary-400 text-xs font-bold hover:bg-primary-500 hover:text-white transition-colors"
                         >
                             <Zap className="w-3.5 h-3.5" /> AI Generate
                         </button>
                         <div className="flex items-center gap-1 text-slate-500 text-xs">
                             <MessageSquare className="w-3 h-3" /> {item.comments.length}
                         </div>
                    </div>
                  </div>
                )})
              ) : (
                <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                  <Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No templates found for this filter combination.</p>
                  <button onClick={() => {setSelectedAppType('web_crud'); setSelectedTechTags([]);}} className="mt-4 text-primary-400 text-sm hover:underline">Clear Filters</button>
                </div>
              )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-800/50 shrink-0">
              <div>
                <div className="flex gap-2 mb-2">
                     <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] uppercase tracking-wider">{selectedTemplate.stage}</span>
                     {selectedTemplate.isSystem && <span className="px-2 py-0.5 bg-primary-900/50 text-primary-400 rounded text-[10px] uppercase tracking-wider border border-primary-500/30">Official Template</span>}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedTemplate.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Author: {selectedTemplate.authorName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-green-400"><ThumbsUp className="w-3 h-3" /> {selectedTemplate.likes}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                    onClick={() => onBookmark(selectedTemplate.id)}
                    className={`p-2 rounded-full transition-colors ${currentUser.bookmarks.includes(selectedTemplate.id) ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    <Bookmark className="w-5 h-5 fill-current" />
                </button>
                {!selectedTemplate.isSystem && selectedTemplate.authorId === currentUser.id && (
                     <button onClick={() => { onDelete(selectedTemplate.id); setSelectedTemplate(null); }} className="p-2 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-full transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
                <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="text-slate-300 text-sm leading-relaxed bg-slate-950/30 p-4 rounded-lg border border-slate-800">
                    {selectedTemplate.description}
                </div>
                <div className="space-y-6">
                    {/* 输入格式 */}
                    <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-blue-400 uppercase flex items-center gap-2">
                                <FileText className="w-4 h-4" /> {t.stageInput}
                            </h4>
                         </div>
                         <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap font-mono min-h-[150px]">
                             {selectedTemplate.inputFormat}
                         </div>
                    </div>

                    {/* 输出格式 */}
                    <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-green-400 uppercase flex items-center gap-2">
                                <Eye className="w-4 h-4" /> {t.stageOutput}
                            </h4>
                         </div>
                         <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 h-[300px] overflow-y-auto custom-scrollbar">
                             <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-mono text-sm prose-p:leading-relaxed prose-li:leading-relaxed leading-relaxed" style={{lineHeight: '1.5'}}>
                                 <ReactMarkdown>{selectedTemplate.templatePreview || ''}</ReactMarkdown>
                             </div>
                         </div>
                    </div>
                </div>
                {/* Feedback and Rating Section */}
                <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Community Feedback
                        </h3>
                        <div className="flex items-center gap-4">
                            {/* 评分系统 */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Rate this template:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                            onClick={() => handleTemplateRating(star)}
                                        >
                                            {star <= (selectedTemplate.averageRating || 0) ? '⭐' : '☆'}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">
                                    {selectedTemplate.averageRating?.toFixed(1) || '0.0'} ({selectedTemplate.totalRatings || 0})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI反馈摘要 */}
                    {selectedTemplate.comments.length > 1 && (
                        <div className="mb-4">
                            <button 
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-2 rounded flex items-center gap-2 hover:bg-purple-500/20"
                            >
                                <Sparkles className="w-3 h-3" /> {isSummarizing ? 'Analyzing...' : '✨ AI Summary'}
                            </button>
                            {summary && (
                                <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-sm text-purple-200">
                                    <span className="font-bold block mb-1">AI Feedback Summary:</span>
                                    {summary}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 评论列表 */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {selectedTemplate.comments.length > 0 ? (
                            selectedTemplate.comments.map(comment => (
                                <div key={comment.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-300">{comment.author}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{comment.role}</span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(comment.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 text-sm py-4">No feedback yet. Be the first to share your experience!</p>
                        )}
                    </div>

                    {/* 添加评论 */}
                    <div className="border-t border-slate-700 pt-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your experience with this template..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                            />
                            <button 
                                onClick={handleAddComment}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-400 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                <button onClick={() => navigator.clipboard.writeText(selectedTemplate.promptContent)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy Prompt
                </button>
                <button onClick={() => onRunInPlayground(selectedTemplate)} className="px-6 py-2 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-500 shadow-lg shadow-primary-900/20 transition-colors flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Use in Playground
                </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Template Modal with Enhanced Features */}
      {isUploadModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-white">{t.shareTemplate}</h2>
                     <div className="flex gap-2">
                         <button onClick={() => setShowImportInput(!showImportInput)} className="flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded hover:bg-purple-500/20 transition-colors">
                            <Wand2 className="w-3 h-3" /> {t.aiSmartImport || '⚡ AI Smart Import'}
                         </button>
                         <label className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded hover:bg-blue-500/20 transition-colors cursor-pointer">
                            <Upload className="w-3 h-3" /> 📄 {t.uploadDocument || 'Upload Document'}
                            <input type="file" accept=".md,.docx,.pdf,.txt" onChange={handleFileUpload} className="hidden" />
                         </label>
                     </div>
                 </div>

                 {/* Document Preview */}
                 {uploadedDocument && (
                     <div className="mb-6 bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                         <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-2">
                                 <File className="w-4 h-4 text-blue-400" />
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
                                 {uploadedDocument.content.substring(0, 500)}
                                 {uploadedDocument.content.length > 500 && '...'}
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
                                 <div key={index} className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded px-2 py-1">
                                     <span 
                                         className={`text-xs ${selectedTags.includes(tag.name) ? 'text-green-400' : 'text-slate-400'}`}
                                     >
                                         {tag.name}
                                     </span>
                                     <span className="text-[10px] text-slate-500">
                                         ({Math.round(tag.confidence * 100)}%)
                                     </span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {showImportInput && (
                     <div className="mb-6 bg-purple-900/10 border border-purple-500/20 rounded-lg p-4">
                         <p className="text-xs text-purple-300 mb-2">Paste raw text and AI will auto-fill fields.</p>
                         <textarea 
                             value={importText} 
                             onChange={(e) => setImportText(e.target.value)} 
                             className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-300 h-24 focus:border-purple-500 focus:outline-none mb-2" 
                             placeholder="Paste your document content here..." 
                         />
                         <div className="flex justify-end gap-2">
                             <button 
                                 onClick={() => generateAITags(importText)} 
                                 disabled={isGeneratingTags || !importText.trim()} 
                                 className="px-3 py-1.5 bg-green-600 text-white text-xs rounded font-bold hover:bg-green-500 disabled:opacity-50"
                             >
                                {isGeneratingTags ? 'Generating...' : '🏷️ Generate Tags'}
                             </button>
                             <button 
                                 onClick={handleSmartParseEnhanced} 
                                 disabled={isParsing || !importText.trim()} 
                                 className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded font-bold hover:bg-purple-500 disabled:opacity-50"
                             >
                                {isParsing ? 'Parsing...' : 'Auto-Fill'}
                             </button>
                         </div>
                     </div>
                 )}

                 {/* Enhanced Form Fields */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Left Column */}
                     <div className="space-y-4">
                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.templateTitle || 'Template Title'} *</label>
                             <input 
                                 type="text" 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" 
                                 value={newTemplate.title} 
                                 onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})} 
                                 placeholder="Enter template title..." 
                             />
                         </div>
                         
                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.developmentStage || 'Development Stage'} *</label>
                             <select 
                                 value={newTemplate.stage} 
                                 onChange={(e) => setNewTemplate({...newTemplate, stage: e.target.value as ProcessStage})}
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                             >
                                 <option value="requirements">{t.requirements || 'Requirements Analysis'}</option>
                                 <option value="product_planning">{t.product_planning || 'Product Planning'}</option>
                                 <option value="architecture">{t.architecture || 'System Design'}</option>
                                 <option value="story_creation">{t.story_creation || 'Story Creation'}</option>
                                 <option value="development">{t.development || 'Development'}</option>
                                 <option value="qa">{t.qa || 'Quality Assurance'}</option>
                             </select>
                         </div>

                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.applicationType || 'Application Type'}</label>
                             <select 
                                 value={newTemplate.appType} 
                                 onChange={(e) => setNewTemplate({...newTemplate, appType: e.target.value as AppType})}
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                             >
                                 {APP_TYPES.map(type => (
                                     <option key={type.value} value={type.value}>{type.label}</option>
                                 ))}
                             </select>
                         </div>

                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.technologyStack || 'Technology Stack'} {t.commaSeparated || '(comma separated)'}</label>
                             <input 
                                 type="text" 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" 
                                 value={newTemplate.techStack?.join(', ') || ''} 
                                 onChange={(e) => setNewTemplate({...newTemplate, techStack: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                                 placeholder="React, Node.js, MongoDB..." 
                             />
                         </div>
                     </div>

                     {/* Right Column */}
                     <div className="space-y-4">
                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.description || 'Description'} *</label>
                             <textarea 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white h-20 resize-none" 
                                 value={newTemplate.description} 
                                 onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})} 
                                 placeholder="Describe what this template does..." 
                             />
                         </div>

                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.inputFormat || 'Input Format'}</label>
                             <textarea 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white h-16 resize-none" 
                                 value={newTemplate.inputFormat} 
                                 onChange={(e) => setNewTemplate({...newTemplate, inputFormat: e.target.value})} 
                                 placeholder="What should the user provide?" 
                             />
                         </div>

                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.outputFormat || 'Output Format'}</label>
                             <textarea 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white h-16 resize-none" 
                                 value={newTemplate.outputFormat} 
                                 onChange={(e) => setNewTemplate({...newTemplate, outputFormat: e.target.value})} 
                                 placeholder="What will be generated?" 
                             />
                         </div>

                         <div>
                             <label className="block text-xs text-slate-400 mb-1">{t.supportedFeatures || 'Supported Features'} {t.commaSeparated || '(comma separated)'}</label>
                             <input 
                                 type="text" 
                                 className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" 
                                 value={newTemplate.supports?.join(', ') || ''} 
                                 onChange={(e) => setNewTemplate({...newTemplate, supports: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                                 placeholder="User Stories, API Design, Database Schema..." 
                             />
                         </div>
                     </div>
                 </div>

                 {/* Main Prompt Content */}
                 <div className="mt-6">
                     <label className="block text-xs text-slate-400 mb-1">{t.promptContent || 'Prompt Content'} *</label>
                     <textarea 
                         className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-white h-40 font-mono resize-none" 
                         value={newTemplate.promptContent} 
                         onChange={(e) => setNewTemplate({...newTemplate, promptContent: e.target.value})} 
                         placeholder="Enter the actual prompt content that will be sent to AI..." 
                     />
                 </div>

                 <div className="mt-6 flex justify-end gap-3">
                     <button 
                         onClick={() => resetUploadModal()} 
                         className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                     >
                         Cancel
                     </button>
                     <button 
                         onClick={handleCreateTemplate} 
                         disabled={!newTemplate.title || !newTemplate.promptContent}
                         className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                         {t.createTemplateBtn || 'Create Template'}
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default ProcessNavigator;