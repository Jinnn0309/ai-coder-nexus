
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, ThumbsUp, Zap, Code, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', usage: 40, efficiency: 24 },
  { name: 'Tue', usage: 30, efficiency: 13 },
  { name: 'Wed', usage: 20, efficiency: 58 },
  { name: 'Thu', usage: 27, efficiency: 39 },
  { name: 'Fri', usage: 18, efficiency: 48 },
  { name: 'Sat', usage: 23, efficiency: 38 },
  { name: 'Sun', usage: 34, efficiency: 43 },
];

const popularLangs = [
  { name: 'Python', value: 85 },
  { name: 'TypeScript', value: 72 },
  { name: 'Rust', value: 45 },
  { name: 'Go', value: 30 },
];

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
}

const Dashboard: React.FC<DashboardProps> = ({ t }) => {
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
          title={t.generate}
          value="1,284" 
          trend="+12.5%" 
          icon={Code} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Avg. Efficiency Score" 
          value="88.4" 
          trend="+2.1%" 
          icon={Zap} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Template Usage" 
          value="432" 
          trend="+8.4%" 
          icon={Activity} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Prompt Feedback" 
          value="95%" 
          trend="+1.2%" 
          icon={ThumbsUp} 
          color="bg-emerald-500" 
        />
      </div>
      
      {/* Charts Area (Kept standard) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Code Acceptance Rate</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="efficiency" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Most Popular Languages</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularLangs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} fontSize={12} />
                <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
