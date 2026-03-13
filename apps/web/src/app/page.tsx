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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          AI Job Search OS
        </h1>
        <p className="text-xl text-white/90 mb-8">
          AI-powered job search and application automation platform
        </p>
        <div className="flex space-x-4">
          <Link
            href="/login"
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="mt-16 text-white/75 text-sm">
        <p>Powered by AI • Match • Apply • Succeed</p>
      </div>
    </div>
  );
}
