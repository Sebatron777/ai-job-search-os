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

    // Decode user from token or use stored data
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Job Search
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600">
                {user?.name || user?.email}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-500 dark:text-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here&apos;s an overview of your job search progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={0}
            icon="📊"
            color="blue"
            href="/jobs"
          />
          <StatCard
            title="Applications"
            value={0}
            icon="📝"
            color="yellow"
            href="/jobs"
          />
          <StatCard
            title="Interviews"
            value={0}
            icon="🎯"
            color="green"
            href="/jobs"
          />
          <StatCard
            title="Offers"
            value={0}
            icon="🎉"
            color="purple"
            href="/jobs"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <QuickActionCard
            title="Browse Jobs"
            description="View all imported job opportunities"
            icon="📥"
            href="/jobs"
          />
          <QuickActionCard
            title="My Profile"
            description="Manage your account settings"
            icon="👤"
            href="/profile"
          />
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Getting Started Guide
          </h3>
          <ol className="space-y-3">
            <Step number={1} text="Browse available jobs in the Jobs section" />
            <Step number={2} text="Filter jobs by location, type, and seniority" />
            <Step number={3} text="Review job details and requirements" />
            <Step number={4} text="Track your applications" />
          </ol>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            Demo Mode
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            This is a demonstration dashboard connected to production API.
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>API: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">{API_URL}</code></li>
            <li>Frontend: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Vercel</code></li>
            <li>Database: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Railway PostgreSQL</code></li>
          </ul>
          
          {/* Create Workspace Button */}
          <button
            onClick={async () => {
              const token = localStorage.getItem('token');
              if (!token) return;
              
              try {
                const response = await fetch(`${API_URL}/workspaces`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    name: 'My Workspace',
                    slug: `workspace-${Date.now()}`,
                  }),
                });
                
                if (response.ok) {
                  alert('✅ Workspace created! Refresh the page.');
                  window.location.reload();
                } else {
                  const error = await response.json();
                  alert('❌ Error: ' + (error.message || 'Failed to create workspace'));
                }
              } catch (error) {
                alert('❌ Error creating workspace');
              }
            }}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            🔧 Create Workspace (Fix)
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  href: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <Link href={href} className="block">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center">
          <div className={`flex-shrink-0 w-12 h-12 ${colorClasses[color]} rounded-md flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start">
          <div className="text-3xl mr-4">{icon}</div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <li className="flex items-start">
      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
        {number}
      </span>
      <span className="text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
}
