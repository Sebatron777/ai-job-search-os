'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0c1e] via-[#1a1a3a] to-[#0c0c1e] animate-gradient overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 glass-dark p-12 rounded-[2rem] max-w-2xl w-full text-center mx-4">
        <div className="inline-block p-1 px-3 mb-6 rounded-full glass text-xs font-medium text-primary uppercase tracking-[0.2em]">
          Production Ready v1.0
        </div>
        
        <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
          Job Search <span className="text-primary italic">OS</span>
        </h1>
        
        <p className="text-lg text-white/70 mb-10 leading-relaxed">
          The ultimate AI-powered command center for your career. 
          Automate applications, track responses, and ace interviews with state-of-the-art LLMs.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(150,100,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto glass text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started
          </Link>
        </div>
        
        <div className="mt-12 pt-10 border-t border-white/10 flex items-center justify-center gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
          <span className="text-xs text-white/50 uppercase tracking-widest">Powered by</span>
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" alt="OpenAI" className="h-5 invert" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Anthropic_logo.svg" alt="Anthropic" className="h-4 invert" />
        </div>
      </div>

      <div className="absolute bottom-10 text-white/30 text-xs tracking-widest uppercase">
        Match • Apply • Succeed
      </div>
    </div>
  );
}
