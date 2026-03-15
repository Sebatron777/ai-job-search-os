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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode user from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.sub,
        email: 'user@example.com',
        name: 'User',
      });
      setFormData({
        name: 'User',
        email: 'user@example.com',
      });
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
    
    // Fetch stats
    fetchStats(token);
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const workspaceId = '16e05d35-78d8-4f3d-b5d2-c2a8bb90432f';
      
      // Fetch jobs count
      const response = await fetch(`${API_URL}/jobs?workspaceId=${workspaceId}&status=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const jobs = await response.json();
        setStats({
          jobs: jobs.length || 0,
          applications: 0,
          interviews: 0,
          offers: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    // Mock save - in real app would call API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser({ ...user, ...formData } as User);
    setEditing(false);
    setSaving(false);
    setMessage('✅ Profile updated successfully!');
    
    setTimeout(() => setMessage(''), 3000);
  };

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
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-500 dark:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Account Information
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                {user?.id}
              </p>
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({ name: user?.name || '', email: user?.email || '' });
                }}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Account Stats */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Jobs Imported" value={stats.jobs.toString()} />
            <StatBox label="Applications" value={stats.applications.toString()} />
            <StatBox label="Interviews" value={stats.interviews.toString()} />
            <StatBox label="Offers" value={stats.offers.toString()} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            ⚠️ Danger Zone
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Irreversible actions that will permanently affect your account data.
          </p>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clean duplicate jobs? This will keep only one copy of each job.')) {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const workspaceId = '16e05d35-78d8-4f3d-b5d2-c2a8bb90432f';
                    
                    // Call API to clean duplicates
                    const response = await fetch(`${API_URL}/jobs/clean-duplicates?workspaceId=${workspaceId}`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      alert(`✅ Cleaned ${result.deletedCount || 0} duplicate jobs!`);
                      window.location.reload();
                    } else {
                      alert('Error cleaning duplicates. Please try again later.');
                    }
                  } catch (error) {
                    alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🗑️ Clean Duplicate Jobs
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to delete ALL jobs? This cannot be undone.')) {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const workspaceId = '16e05d35-78d8-4f3d-b5d2-c2a8bb90432f';
                    
                    // Get all jobs first
                    const response = await fetch(`${API_URL}/jobs?workspaceId=${workspaceId}&status=all`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    
                    if (response.ok) {
                      const jobs = await response.json();
                      alert(`Found ${jobs.length} jobs. Bulk deletion feature coming soon!`);
                    }
                  } catch (error) {
                    alert('Error fetching jobs');
                  }
                }
              }}
              className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🗑️ Delete All Jobs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
