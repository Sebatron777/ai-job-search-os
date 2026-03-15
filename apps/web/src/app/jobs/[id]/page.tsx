'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: string;
  jobType: string;
  seniorityLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  postedAt: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  isRemote: boolean;
}

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      router.push('/login');
      return;
    }

    fetchJob(storedToken, params.id as string);
  }, [router, params.id]);

  const fetchJob = async (token: string, jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = () => {
    if (!job?.salaryMin && !job?.salaryMax) return '';
    const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : '';
    const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : '';
    const period = job.salaryPeriod ? `/${job.salaryPeriod}` : '';
    return `${min}${max ? ' - ' + max : ''}${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Job not found
          </h2>
          <Link
            href="/jobs"
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Jobs
          </Link>
        </div>
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
              <Link
                href="/jobs"
                className="text-blue-600 hover:text-blue-500"
              >
                ← Back to Jobs
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {job.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                {job.company}
              </p>
            </div>
            <div className="text-right">
              {formatSalary() && (
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatSalary()}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Posted {new Date(job.postedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{job.locationType}</Badge>
            <Badge>{job.jobType.replace('_', ' ')}</Badge>
            {job.seniorityLevel && <Badge>{job.seniorityLevel}</Badge>}
            {job.isRemote && <Badge color="green">Remote Friendly</Badge>}
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Location */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📍 Location
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{job.location}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {job.locationType === 'remote' && '💻 Fully Remote'}
              {job.locationType === 'hybrid' && '🔄 Hybrid Work'}
              {job.locationType === 'onsite' && '🏢 On-site Only'}
            </p>
          </div>

          {/* Job Type */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💼 Job Type
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {job.jobType.replace('_', ' ')}
            </p>
            {job.seniorityLevel && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Level: {job.seniorityLevel}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📋 Job Description
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Required Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {job.preferredSkills && job.preferredSkills.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⭐ Preferred Skills (Bonus)
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            onClick={() => alert('Apply feature coming soon!')}
          >
            🚀 Apply Now
          </button>
          <button
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors"
            onClick={() => alert('Save feature coming soon!')}
          >
            💾 Save Job
          </button>
        </div>
      </main>
    </div>
  );
}

function Badge({
  children,
  color = 'blue',
}: {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'gray';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`text-xs px-3 py-1 rounded ${colors[color]}`}>
      {children}
    </span>
  );
}
