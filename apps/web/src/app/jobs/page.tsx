'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  postedAt: string;
  description: string;
  requiredSkills: string[];
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    locationType: '',
    jobType: '',
    seniority: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchJobs(token);
  }, [router]);

  const fetchJobs = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter.locationType && job.locationType !== filter.locationType) return false;
    if (filter.jobType && job.jobType !== filter.jobType) return false;
    if (filter.seniority && job.seniorityLevel !== filter.seniority) return false;
    return true;
  });

  const handleImportJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Create mock source if not exists
      const sourceResponse = await fetch(`${API_URL}/job-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Mock Jobs',
          type: 'mock',
          isActive: true,
          config: {},
        }),
      });

      const sourceData = await sourceResponse.json();

      // Trigger ingestion
      await fetch(`${API_URL}/job-sources/${sourceData.id}/ingest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Job import started! Check back in a few seconds.');
      setTimeout(() => fetchJobs(token), 3000);
    } catch (error) {
      console.error('Error importing jobs:', error);
      alert('Failed to import jobs');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading jobs...</div>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            </div>
            <button
              onClick={handleImportJobs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              📥 Import Jobs
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Type
              </label>
              <select
                value={filter.locationType}
                onChange={(e) => setFilter({ ...filter, locationType: e.target.value })}
                className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Type
              </label>
              <select
                value={filter.jobType}
                onChange={(e) => setFilter({ ...filter, jobType: e.target.value })}
                className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seniority
              </label>
              <select
                value={filter.seniority}
                onChange={(e) => setFilter({ ...filter, seniority: e.target.value })}
                className="w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="entry">Entry</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {jobs.length === 0
                ? "Import jobs to get started"
                : "Try adjusting your filters"}
            </p>
            {jobs.length === 0 && (
              <button
                onClick={handleImportJobs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Import Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Results count */}
        {filteredJobs.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return '';
    const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k` : '';
    const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}k` : '';
    return `${min}${max ? ' - ' + max : ''}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{job.company}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{job.locationType}</Badge>
            <Badge>{job.jobType?.replace('_', '-')}</Badge>
            {job.seniorityLevel && <Badge>{job.seniorityLevel}</Badge>}
            {formatSalary() && <Badge color="green">{formatSalary()}</Badge>}
          </div>

          {job.requiredSkills.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {job.requiredSkills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {job.requiredSkills.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{job.requiredSkills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <Link
            href={`/jobs/${job.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View Details
          </Link>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(job.postedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
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
    <span className={`text-xs px-2 py-1 rounded ${colors[color]}`}>
      {children}
    </span>
  );
}
