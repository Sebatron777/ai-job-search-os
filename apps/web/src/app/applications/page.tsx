'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WORKSPACE_ID = '16e05d35-78d8-4f3d-b5d2-c2a8bb90432f';

interface Application {
  id: string;
  status: string;
  submittedAt?: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  coverLetter?: string;
  customAnswers?: Record<string, any>;
}

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      router.push('/login');
      return;
    }

    fetchApplications(storedToken);
    fetchJobs(storedToken);
  }, [router]);

  const fetchApplications = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/applications?workspaceId=${WORKSPACE_ID}&status=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs?workspaceId=${WORKSPACE_ID}&status=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleCreateApplication = async () => {
    if (!selectedJobId || !token) return;

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          jobId: selectedJobId,
          status: 'draft',
          coverLetter: coverLetter || null,
        }),
      });

      if (response.ok) {
        alert('✅ Application created!');
        setShowCreateModal(false);
        setSelectedJobId('');
        setCoverLetter('');
        fetchApplications(token);
      } else {
        const error = await response.json();
        alert('❌ Error: ' + error.message);
      }
    } catch (error) {
      alert('❌ Error creating application');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`✅ Status updated to ${newStatus}`);
        fetchApplications(token);
      } else {
        alert('❌ Error updating status');
      }
    } catch (error) {
      alert('❌ Error updating status');
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!token) return;
    if (!confirm('Delete this application?')) return;

    try {
      const response = await fetch(`${API_URL}/applications/${appId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('✅ Application deleted');
        fetchApplications(token);
      } else {
        alert('❌ Error deleting application');
      }
    } catch (error) {
      alert('❌ Error deleting application');
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const statusCounts = {
    all: applications.length,
    draft: applications.filter(a => a.status === 'draft').length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offered: applications.filter(a => a.status === 'offered').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ➕ New Application
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <StatBadge label="All" count={statusCounts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
          <StatBadge label="Draft" count={statusCounts.draft} active={filter === 'draft'} onClick={() => setFilter('draft')} />
          <StatBadge label="Submitted" count={statusCounts.submitted} active={filter === 'submitted'} onClick={() => setFilter('submitted')} />
          <StatBadge label="Interview" count={statusCounts.interviewing} active={filter === 'interviewing'} onClick={() => setFilter('interviewing')} />
          <StatBadge label="Offered" count={statusCounts.offered} active={filter === 'offered'} onClick={() => setFilter('offered')} />
          <StatBadge label="Rejected" count={statusCounts.rejected} active={filter === 'rejected'} onClick={() => setFilter('rejected')} />
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first application to start tracking
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              ➕ Create Application
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteApplication}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create Application
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Job
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cover Letter (optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Write a brief cover letter..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateApplication}
                  disabled={!selectedJobId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedJobId('');
                    setCoverLetter('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg text-center transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      } shadow`}
    >
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs mt-1">{label}</p>
    </button>
  );
}

function ApplicationCard({
  application,
  onUpdateStatus,
  onDelete,
}: {
  application: Application;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    interviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    offered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {application.job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{application.job.company}</p>
          
          <div className="mt-3 flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full ${statusColors[application.status]}`}>
              {application.status}
            </span>
            {application.submittedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(application.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {application.coverLetter && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end gap-2">
          <select
            value={application.status}
            onChange={(e) => onUpdateStatus(application.id, e.target.value)}
            className="text-sm border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offered</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => onDelete(application.id)}
            className="text-xs text-red-600 hover:text-red-500"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
