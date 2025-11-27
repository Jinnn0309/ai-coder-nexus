import React, { useState, useEffect } from 'react';
import { Guide, LearningSection, UserProgress, QuizQuestion } from '../types.js';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Target, 
  Award, 
  PlayCircle, 
  Lock,
  ChevronRight,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface LearningPathViewerProps {
  guide: Guide;
  userId: string;
  t: any;
  onProgressUpdate?: (progress: UserProgress) => void;
  isSidebarCollapsed?: boolean;
  onStartLearning?: () => void;
}

const LearningPathViewer: React.FC<LearningPathViewerProps> = ({ 
  guide, 
  userId, 
  t, 
  onProgressUpdate,
  isSidebarCollapsed = false,
  onStartLearning
}) => {
  const [currentSection, setCurrentSection] = useState<LearningSection | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  // 初始化学习进度
  useEffect(() => {
    if (guide.isLearningPath && guide.sections) {
      // 从localStorage加载用户进度
      const savedProgress = localStorage.getItem(`progress_${userId}_${guide.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress) as UserProgress;
        setUserProgress(progress);
        
        // 如果有当前章节，设置为当前显示
        if (progress.currentSection) {
          const section = guide.sections.find(s => s.id === progress.currentSection);
          if (section) {
            setCurrentSection(section);
          }
        }
      } else {
        // 创建新进度记录
        const newProgress: UserProgress = {
          userId,
          guideId: guide.id,
          completedSections: [],
          currentSection: guide.sections[0]?.id || '',
          progress: 0,
          startedAt: Date.now(),
          lastAccessedAt: Date.now(),
          quizScores: {}
        };
        setUserProgress(newProgress);
        if (guide.sections[0]) {
          setCurrentSection(guide.sections[0]);
        }
      }
    }
  }, [guide, userId]);

  // 保存进度到localStorage
  const saveProgress = (progress: UserProgress) => {
    localStorage.setItem(`progress_${userId}_${guide.id}`, JSON.stringify(progress));
    setUserProgress(progress);
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  };

  // 完成章节
  const completeSection = (sectionId: string) => {
    if (!userProgress || !guide.sections) return;

    const updatedProgress = { ...userProgress };
    
    // 如果章节还未完成，添加到已完成列表
    if (!updatedProgress.completedSections.includes(sectionId)) {
      updatedProgress.completedSections.push(sectionId);
    }

    // 更新章节的完成状态
    const updatedSections = guide.sections.map(section => ({
      ...section,
      isCompleted: updatedProgress.completedSections.includes(section.id),
      completedAt: updatedProgress.completedSections.includes(section.id) ? Date.now() : undefined
    }));

    // 计算进度
    updatedProgress.progress = (updatedProgress.completedSections.length / guide.sections.length) * 100;
    updatedProgress.lastAccessedAt = Date.now();

    // 如果是最后一个章节，标记为完成
    if (updatedProgress.completedSections.length === guide.sections.length) {
      updatedProgress.completedAt = Date.now();
      updatedProgress.currentSection = '';
    } else {
      // 移动到下一个未完成的章节
      const nextSection = updatedSections.find(s => !updatedProgress.completedSections.includes(s.id));
      if (nextSection) {
        updatedProgress.currentSection = nextSection.id;
        setCurrentSection(nextSection);
      }
    }

    saveProgress(updatedProgress);
    
    // 显示章节测试
    const currentSectionData = updatedSections.find(s => s.id === sectionId);
    if (currentSectionData?.quiz && currentSectionData.quiz.length > 0) {
      setShowQuiz(true);
    }
  };

  // 开始章节学习
  const startSection = (section: LearningSection) => {
    if (!userProgress) return;
    
    // 检查前置条件
    const sectionIndex = guide.sections?.findIndex(s => s.id === section.id) || 0;
    const previousSections = guide.sections?.slice(0, sectionIndex);
    const canAccess = previousSections?.every(s => userProgress.completedSections.includes(s.id)) || sectionIndex === 0;
    
    if (canAccess) {
      setCurrentSection(section);
      setShowQuiz(false);
      setQuizResult(null);
      
      const updatedProgress = { 
        ...userProgress, 
        currentSection: section.id,
        lastAccessedAt: Date.now() 
      };
      saveProgress(updatedProgress);
      
      // 第一次开始学习时收缩导航栏
      if (onStartLearning && (!userProgress.currentSection || userProgress.currentSection === '')) {
        onStartLearning();
      }
    }
  };

  // 提交测试
  const submitQuiz = () => {
    if (!currentSection?.quiz || !userProgress) return;

    let correctCount = 0;
    currentSection.quiz.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = (correctCount / currentSection.quiz.length) * 100;
    const passed = score >= 60; // 60分及格

    setQuizResult({ score, passed });

    if (passed) {
      // 更新用户进度中的测试分数
      const updatedProgress = {
        ...userProgress,
        quizScores: {
          ...userProgress.quizScores,
          [currentSection.id]: score
        }
      };
      saveProgress(updatedProgress);
    }
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'advanced': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  // 获取难度文本
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return t.difficultyBeginner || '初级';
      case 'intermediate': return t.difficultyIntermediate || '中级';
      case 'advanced': return t.difficultyAdvanced || '高级';
      default: return t.difficultyAll || '全部';
    }
  };

  if (!guide.isLearningPath || !guide.sections || guide.sections.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400">
        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>这不是一个学习路径指南</p>
        <p className="text-sm mt-2">isLearningPath: {String(guide.isLearningPath)}</p>
        <p className="text-sm">sections: {guide.sections?.length || 0}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 animate-fade-in">
      {/* 左侧时间轴 */}
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {/* 头部信息 */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h2 className="text-xl font-bold text-white mb-2">{guide.title}</h2>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(guide.difficulty || 'beginner')}`}>
              {getDifficultyText(guide.difficulty || 'beginner')}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {guide.estimatedDuration || 0}分钟
            </span>
          </div>

          {/* 进度条 */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">学习进度</span>
              <span className="text-white font-medium">{userProgress?.progress.toFixed(0) || 0}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userProgress?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800 rounded-lg p-2 text-center">
              <div className="text-green-400 font-bold">
                {userProgress?.completedSections.length || 0}
              </div>
              <div className="text-slate-400">已完成</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-2 text-center">
              <div className="text-blue-400 font-bold">
                {guide.sections.length - (userProgress?.completedSections.length || 0)}
              </div>
              <div className="text-slate-400">待学习</div>
            </div>
          </div>
        </div>

        {/* 学习目标 */}
        {guide.learningObjectives && guide.learningObjectives.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              学习目标
            </h3>
            <ul className="space-y-1">
              {guide.learningObjectives.map((objective, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 章节时间轴 */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            学习路径
          </h3>
          <div className="space-y-2">
            {guide.sections.map((section, index) => {
              const isCompleted = userProgress?.completedSections.includes(section.id) || false;
              const isCurrent = currentSection?.id === section.id;
              const canAccess = index === 0 || (guide.sections[index - 1] && 
                userProgress?.completedSections.includes(guide.sections[index - 1].id));

              return (
                <div
                  key={section.id}
                  className={`relative pl-6 pb-3 ${index < guide.sections.length - 1 ? 'border-l-2 border-slate-700' : ''}`}
                >
                  <div className="absolute left-0 top-1 transform -translate-x-1/2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isCurrent ? (
                      <PlayCircle className="w-5 h-5 text-blue-400" />
                    ) : canAccess ? (
                      <Circle className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-700" />
                    )}
                  </div>

                  <button
                    onClick={() => startSection(section)}
                    disabled={!canAccess}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                        : isCompleted
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : canAccess
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                        : 'bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium">{section.title}</span>
                      <span className="text-xs opacity-70 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {section.duration}分钟
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <CheckCircle2 className="w-3 h-3" />
                        已完成
                        {userProgress?.quizScores[section.id] && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {userProgress.quizScores[section.id].toFixed(0)}分
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 完成奖励 */}
        {userProgress?.completedAt && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30 p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-sm font-bold text-yellow-400">恭喜完成！</div>
                <div className="text-xs text-slate-400">
                  学习时长: {Math.floor((userProgress.completedAt - userProgress.startedAt) / (1000 * 60))}分钟
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
        {showQuiz && currentSection?.quiz ? (
          /* 章节测试 */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">章节测试</h3>
              
              {quizResult ? (
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                  <div className={`text-6xl font-bold mb-4 ${quizResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {quizResult.score.toFixed(0)}%
                  </div>
                  <div className={`text-xl mb-4 ${quizResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {quizResult.passed ? '测试通过！' : '测试未通过，请继续学习'}
                  </div>
                  <div className="flex gap-3 justify-center">
                    {quizResult.passed && (
                      <button
                        onClick={() => completeSection(currentSection.id)}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        继续下一章节
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowQuiz(false);
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                      className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                      返回学习
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentSection.quiz.map((question, qIndex) => (
                    <div key={question.id} className="bg-slate-800 rounded-xl p-6">
                      <h4 className="text-white font-medium mb-4 text-sm">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={oIndex}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [question.id]: oIndex })}
                              className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-slate-200 text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== currentSection.quiz.length}
                      className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      提交答案
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : currentSection ? (
          /* 章节内容 */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{currentSection.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentSection.duration}分钟
                    </span>
                    <span>章节 {guide.sections.findIndex(s => s.id === currentSection.id) + 1} / {guide.sections.length}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    章节测试
                  </button>
                  <button
                    onClick={() => completeSection(currentSection.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    完成章节
                  </button>
                </div>
              </div>
              
              <div className="prose prose-invert prose-slate prose-headings:text-white prose-a:text-blue-400 max-w-none prose-p:leading-relaxed prose-li:leading-relaxed prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h4:text-sm prose-p:text-sm prose-li:text-sm prose-span:text-sm prose-div:text-sm leading-relaxed" style={{lineHeight: '1.5', fontSize: '14px'}}>
                <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
              </div>
            </div>
          </div>
        ) : (
          /* 开始界面 */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">开始学习之旅</h3>
              <p className="text-slate-400 mb-6">
                选择左侧的章节开始学习，完成后系统会自动记录你的进度
              </p>
              {guide.sections.length > 0 && (
                <button
                  onClick={() => startSection(guide.sections[0])}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <PlayCircle className="w-5 h-5" />
                  开始学习
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPathViewer;