import React, { useState, useEffect, useRef } from 'react';
import { Play, RefreshCw, Copy, Sparkles, FileText, Layout, Layers, ListTree, Code, CheckCircle, ArrowLeft, Zap, Send, Filter, Eye, X, Save, PlusSquare, RotateCcw } from 'lucide-react';
import { generateCode, analyzeCodeEfficiency } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ProcessTemplate, ProcessStage, Prompt, Role } from '../types.js';
import { MOCK_PROCESS_TEMPLATES_CN, APP_TYPES, MOCK_PROJECT_CONTEXT } from '../constants';

interface PlaygroundProps {
    t: any;
    onAddPrompt: (prompt: Prompt) => void;
    initialTemplate: ProcessTemplate | null;
    onClearInitialTemplate: () => void;
}

const Playground: React.FC<PlaygroundProps> = ({ t, onAddPrompt, initialTemplate, onClearInitialTemplate }) => {
  const [mode, setMode] = useState<'selection' | 'execution'>('selection');
  
  // Selection Mode State
  const [activeStage, setActiveStage] = useState<ProcessStage>('development');
  const [selectedAppType, setSelectedAppType] = useState<string>('web_crud');
  const [selectedTechTags, setSelectedTechTags] = useState<string[]>([]);
  
  // Execution Mode State (Workbench)
  const [systemInstruction, setSystemInstruction] = useState(''); 
  const [contextInput, setContextInput] = useState(''); 
  const [userInput, setUserInput] = useState(''); 
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeResult, setCodeResult] = useState('');
  const [viewMode, setViewMode] = useState<'chat' | 'preview'>('chat');
  const [metrics, setMetrics] = useState<{score: number, feedback: string} | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [savePromptTitle, setSavePromptTitle] = useState('');

  // Initialize if jumped from Process Navigator
  useEffect(() => {
      if (initialTemplate) {
          setupExecution(initialTemplate);
      }
  }, [initialTemplate]);

  const setupExecution = (template: ProcessTemplate | null) => {
      setMode('execution');
      setHistory([]);
      setCodeResult('');
      setMetrics(null);
      
      if (template) {
          setSystemInstruction(template.promptContent);
          setContextInput(`Project: ${MOCK_PROJECT_CONTEXT.projectName}\nStack: ${MOCK_PROJECT_CONTEXT.techStack.join(', ')}\nContext: ${template.description}`);
          setUserInput(''); // Clear user input for fresh start
          setSavePromptTitle(`Optimized: ${template.title}`);
      } else {
          // Start from scratch
          setSystemInstruction("You are an expert AI coding assistant. Generate high-quality, clean code.");
          setContextInput("");
          setUserInput("");
          setSavePromptTitle("My Custom Prompt");
      }
  };

  const handleRunTest = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    
    const fullPrompt = `
SYSTEM: ${systemInstruction}
CONTEXT: ${contextInput}
USER REQUEST: ${userInput}
    `;

    const newUserMsg: ChatMessage = { role: 'user', text: userInput, timestamp: Date.now() };
    setHistory(prev => [...prev, newUserMsg]);

    try {
      const result = await generateCode(fullPrompt);
      const newModelMsg: ChatMessage = { role: 'model', text: result, timestamp: Date.now() };
      setHistory(prev => [...prev, newModelMsg]);
      
      const codeMatch = result.match(/```(?:typescript|javascript|tsx|jsx|html)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setCodeResult(codeMatch[1]);
        setViewMode('preview');
      } else {
        setViewMode('chat');
      }
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', text: "Error generating content.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrompt = () => {
      const newPrompt: Prompt = {
          id: Date.now().toString(),
          title: savePromptTitle,
          role: 'User' as Role,
          category: 'Playground',
          scenario: 'Custom Workbench Test',
          content: `SYSTEM: ${systemInstruction}\nCONTEXT: ${contextInput}\nTASK: ${userInput}`,
          model: 'Gemini 2.5',
          efficiencyScore: metrics?.score || 0,
          tags: ['playground', 'workbench'],
          likes: 0,
          comments: [],
          authorId: 'current-user',
          authorName: 'Alex Developer',
          isSystem: false,
          createdAt: Date.now()
      };
      onAddPrompt(newPrompt);
      setIsSaveModalOpen(false);
      alert("Prompt saved to library!");
  };

  const handleAnalyze = async () => {
      if(!codeResult) return;
      setIsLoading(true);
      const result = await analyzeCodeEfficiency(codeResult);
      setMetrics(result);
      setIsLoading(false);
  };

  const techTags = ['Frontend', 'Backend', 'Database', 'DevOps'];
  const stages: { id: ProcessStage; label: string; icon: any }[] = [
    { id: 'requirements', label: t.requirements, icon: FileText },
    { id: 'development', label: t.development, icon: Code },
    { id: 'qa', label: t.qa, icon: CheckCircle },
  ];
  
  const filteredTemplates = MOCK_PROCESS_TEMPLATES_CN.filter(tmpl => {
      const matchStage = tmpl.stage === activeStage;
      const matchAppType = !tmpl.appType || tmpl.appType === selectedAppType || selectedAppType === 'all';
      const matchTech = selectedTechTags.length === 0 || selectedTechTags.some(tag => tmpl.techStack.includes(tag) || tmpl.techStack.includes('General'));
      return matchStage && matchAppType && matchTech;
  });

  if (mode === 'selection') {
      return (
          <div className="animate-fade-in h-full flex flex-col">
              <h2 className="text-2xl font-bold text-white mb-6">{t.testGround}</h2>
              
              {/* Start From Scratch Card */}
              <div onClick={() => setupExecution(null)} className="bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-dashed border-slate-700 hover:border-primary-500 rounded-xl p-6 cursor-pointer mb-8 flex items-center gap-4 group transition-all">
                  <div className="p-4 bg-slate-800 rounded-full group-hover:bg-primary-600 transition-colors">
                      <PlusSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-primary-400">Start from Scratch (Workbench)</h3>
                      <p className="text-slate-400">Open a blank canvas to engineer prompts with separate System, Context, and User inputs.</p>
                  </div>
              </div>

              {/* Stage Nav */}
              <div className="flex gap-3 mb-6 pb-2 border-b border-slate-800 overflow-x-auto">
                  {stages.map(stage => (
                      <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${activeStage === stage.id ? 'bg-slate-800 text-primary-400 border border-primary-500/30' : 'text-slate-500 hover:text-white'}`}>
                          <stage.icon className="w-4 h-4" /> {stage.label}
                      </button>
                  ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                  {APP_TYPES.map(type => (
                      <button key={type.value} onClick={() => setSelectedAppType(type.value)} className={`px-3 py-1 text-xs rounded border ${selectedAppType === type.value ? 'bg-primary-500/20 border-primary-500/50 text-primary-300' : 'border-slate-700 text-slate-400'}`}>{type.label}</button>
                  ))}
              </div>

              {/* Template List */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-8">
                  {filteredTemplates.map(tmpl => (
                      <div key={tmpl.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-primary-500/50 transition-all">
                          <h4 className="font-bold text-white mb-2 text-sm">{tmpl.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{tmpl.description}</p>
                          <button onClick={() => setupExecution(tmpl)} className="w-full py-2 bg-slate-700 hover:bg-primary-600 text-white text-xs rounded font-medium transition-colors">Load Template</button>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  // --- WORKBENCH EXECUTION MODE ---
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {/* Workbench Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <div className="flex items-center gap-3">
              <button onClick={() => { setMode('selection'); onClearInitialTemplate(); }} className="text-slate-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
              <span className="font-bold text-white text-sm">{initialTemplate ? initialTemplate.title : "Custom Workbench Session"}</span>
          </div>
          <div className="flex gap-2">
             <button onClick={() => {setHistory([]); setCodeResult('');}} className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded"><RotateCcw className="w-3 h-3" /> Reset</button>
             <button onClick={() => setIsSaveModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500 font-bold"><Save className="w-3 h-3" /> Save Prompt</button>
          </div>
      </div>

      {/* Workbench Split Pane */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          {/* LEFT: Inputs */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <label className="text-xs font-bold text-primary-400 uppercase mb-2 block flex items-center gap-2"><Sparkles className="w-3 h-3" /> System Instructions (Role & Rules)</label>
                  <textarea value={systemInstruction} onChange={e => setSystemInstruction(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 h-24 font-mono focus:border-primary-500 focus:outline-none" placeholder="You are an expert..." />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <label className="text-xs font-bold text-purple-400 uppercase mb-2 block flex items-center gap-2"><Layers className="w-3 h-3" /> Context (Environment)</label>
                  <textarea value={contextInput} onChange={e => setContextInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 h-20 font-mono focus:border-purple-500 focus:outline-none" placeholder="Project stack, existing code..." />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-white uppercase mb-2 block">User Input (Task)</label>
                  <textarea value={userInput} onChange={e => setUserInput(e.target.value)} className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-mono focus:border-white focus:outline-none resize-none" placeholder="What should I do?" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleRunTest()} />
                  <button onClick={handleRunTest} disabled={isLoading} className="mt-3 w-full py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading ? 'Running...' : <><Play className="w-4 h-4" /> Run</>}
                  </button>
              </div>
          </div>

          {/* RIGHT: Outputs */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-800">
                  <button onClick={() => setViewMode('chat')} className={`flex-1 py-3 text-xs font-bold uppercase ${viewMode === 'chat' ? 'text-white border-b-2 border-primary-500 bg-slate-800' : 'text-slate-500'}`}>Chat History</button>
                  <button onClick={() => setViewMode('preview')} className={`flex-1 py-3 text-xs font-bold uppercase ${viewMode === 'preview' ? 'text-white border-b-2 border-green-500 bg-slate-800' : 'text-slate-500'}`}>Code Preview</button>
              </div>
              <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
                  {viewMode === 'chat' ? (
                      <div className="h-full overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {history.length === 0 && <div className="text-center text-slate-600 mt-10"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />Results appear here</div>}
                          {history.map((msg, i) => (
                              <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-slate-800 text-slate-300' : 'text-slate-200'}`}>
                                  <strong className="block text-xs opacity-50 mb-1 uppercase">{msg.role}</strong>
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                          ))}
                          {isLoading && <div className="p-4 text-slate-500 animate-pulse">Thinking...</div>}
                      </div>
                  ) : (
                      <div className="h-full flex flex-col">
                          <div className="h-1/2 overflow-auto p-4 border-b border-slate-800 custom-scrollbar"><pre className="text-xs font-mono text-slate-300">{codeResult || '// No code generated yet'}</pre></div>
                          <div className="h-1/2 bg-white relative">
                              <iframe ref={iframeRef} className="w-full h-full border-none" srcDoc={`<html><body><div id="root"></div><script>document.getElementById('root').innerHTML = '<div style="color:green;padding:20px;font-family:sans-serif">Preview (Run logic here)</div>'</script></body></html>`} />
                              <button onClick={handleAnalyze} className="absolute top-2 right-2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow">Analyze Efficiency</button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Save Modal */}
      {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Save Prompt Configuration</h2>
                  <input type="text" value={savePromptTitle} onChange={e => setSavePromptTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-white mb-4 focus:outline-none focus:border-primary-500" placeholder="Prompt Title" />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-sm text-slate-400">Cancel</button>
                      <button onClick={handleSavePrompt} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-bold hover:bg-emerald-500">Save</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Playground;