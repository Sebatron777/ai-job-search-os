'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.sub,
        email: 'user@example.com',
        name: 'User',
      });
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0c1e]">
        <div className="text-xl text-primary animate-pulse">Initializing OS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c1e] text-white relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-dark border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between h-20 items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black italic shadow-[0_0_15px_rgba(150,100,255,0.5)]">
              OS
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              AI Job Search <span className="text-primary italic">OS</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/profile" className="text-sm font-medium text-white/70 hover:text-primary transition-colors flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                {user?.name?.[0] || 'U'}
              </div>
              {user?.name || user?.email}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Systems Online
            </div>
            <h2 className="text-4xl font-black tracking-tight">
              Welcome back, <span className="text-primary">{user?.name || 'Commander'}</span>
            </h2>
            <p className="mt-3 text-white/50 max-w-lg">
              Your AI agents are currently monitoring <span className="text-white font-medium">124</span> sources for new opportunities.
            </p>
          </div>
          <div className="flex gap-3">
             <button className="glass px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/5 transition-all">
                Export Reports
             </button>
             <button className="bg-primary px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(150,100,255,0.3)] transition-all">
                New Search
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Jobs" value={1248} delta="+12%" icon="📊" color="primary" href="/jobs" />
          <StatCard title="Applications" value={42} delta="+5" icon="📝" color="purple" href="/applications" />
          <StatCard title="Interviews" value={8} delta="Hot" icon="🎯" color="green" href="/applications?filter=interviewing" />
          <StatCard title="Success Rate" value="12%" delta="+2%" icon="🎉" color="orange" href="/analytics" />
        </div>

        {/* Quick Actions & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold tracking-tight px-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Recommended Jobs
            </h3>
            <div className="space-y-4">
              <JobRow title="Senior Software Engineer" company="SpaceX" score={98} location="Remote" />
              <JobRow title="AI Platform Architect" company="Anthropic" score={94} location="San Francisco" />
              <JobRow title="Frontend Lead" company="Vercel" score={89} location="Remote" />
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight px-2 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
              System Tasks
            </h3>
            <div className="glass-dark rounded-3xl p-6 space-y-6">
               <TaskItem text="Update your profile for better matching" done={false} />
               <TaskItem text="Review 12 new matches for today" done={true} />
               <TaskItem text="Prepare for interview with SpaceX" done={false} />
               <TaskItem text="Optimize your CV with AI feedback" done={false} />
               
               <button className="w-full py-4 text-xs font-bold uppercase tracking-widest text-primary hover:bg-white/5 rounded-xl transition-all border border-white/5">
                 View All Tasks
               </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, delta, icon, color, href }: any) {
  return (
    <Link href={href} className="group">
      <div className="glass-dark p-8 rounded-[2rem] border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">
           {icon}
        </div>
        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
        <div className="flex items-baseline gap-3">
            <h4 className="text-3xl font-black">{value}</h4>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{delta}</span>
        </div>
      </div>
    </Link>
  );
}

function JobRow({ title, company, score, location }: any) {
  return (
    <div className="glass-dark p-6 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
          🚀
        </div>
        <div>
          <h4 className="font-bold text-white group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-white/40 text-xs">{company} • {location}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black text-primary">{score}%</div>
        <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Match Score</div>
      </div>
    </div>
  );
}

function TaskItem({ text, done }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${done ? 'bg-primary border-primary' : 'border-white/20 group-hover:border-primary'}`}>
        {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-sm ${done ? 'text-white/50 line-through' : 'text-white/80 group-hover:text-white transition-colors'}`}>{text}</span>
    </div>
  );
}
