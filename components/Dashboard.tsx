import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, ThumbsUp, Zap, Code, TrendingUp, Users, FileText, Star } from 'lucide-react';
import { databaseService } from '../services/databaseService.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="flex items-center gap-2 mt-4 text-sm">
      <TrendingUp className="w-4 h-4 text-green-400" />
      <span className="text-green-400 font-medium">{trend}</span>
      <span className="text-slate-500">vs last week</span>
    </div>
  </div>
);

interface DashboardProps {
    t: any;
    currentUser: any;
}

const Dashboard: React.FC<DashboardProps> = ({ t, currentUser }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await databaseService.getDashboardStats();
        if (response.success && response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">{t.welcome}</h2>
            <p className="text-slate-400 mt-1">{t.overview}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 p-6 rounded-xl animate-pulse">
              <div className="h-6 bg-slate-700 rounded mb-2"></div>
              <div className="h-8 bg-slate-700 rounded mb-4"></div>
              <div className="h-4 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { templatesByStage, avgEfficiencyScore, totalUsage, userStats, dailyStats, popularTemplates, topLanguages } = dashboardData;

  // 准备饼图数据
  const pieData = Object.entries(templatesByStage).map(([stage, count]) => ({
    name: t[stage] || stage,
    value: count
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">{t.welcome}</h2>
          <p className="text-slate-400 mt-1">{t.overview}</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-green-500/10 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded border border-green-500/20">System Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="创建的模板"
          value={userStats.templatesCreated.toString()} 
          trend="本周新增" 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="平均效率分数" 
          value={avgEfficiencyScore} 
          trend="优秀" 
          icon={Zap} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="总使用量" 
          value={totalUsage.toString()} 
          trend="活跃" 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="收藏数量" 
          value={userStats.bookmarksCount.toString()} 
          trend="喜欢" 
          icon={Star} 
          color="bg-emerald-500" 
        />
      </div>
      
      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">近7天使用情况</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="使用次数" />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="效率分数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">模板分布</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">热门模板</h3>
          <div className="space-y-3">
            {popularTemplates.map((template: any, index: number) => (
              <div key={template.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-300 w-6">{index + 1}</span>
                  <div>
                    <p className="text-sm text-white font-medium">{template.title}</p>
                    <p className="text-xs text-slate-400">{template.stage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-400">{template.usage_count}</p>
                  <p className="text-xs text-slate-400">使用次数</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">技术栈分布</h3>
          <div className="space-y-3">
            {topLanguages.map((lang: any, index: number) => (
              <div key={lang.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{lang.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${lang.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 w-10">{lang.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;