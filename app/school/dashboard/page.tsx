'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useSchoolProfile, useSchoolJobs, useDeleteJob, useUpdateJob } from '@/lib/hooks/useSchool';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { Plus, Users, Calendar, Clock, Trash2, Loader2, Briefcase, Pencil } from 'lucide-react';

export default function SchoolDashboard() {
  const { user } = useAuth();
  const { school, loading: schoolLoading } = useSchoolProfile(user?.id);
  const { jobs, loading: jobsLoading, refetch } = useSchoolJobs(school?.id);
  const { deleteJob, deleting } = useDeleteJob();
  const { updateJob } = useUpdateJob();
  const loading = schoolLoading || jobsLoading;
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [jobsWithHires, setJobsWithHires] = useState<Set<string>>(new Set());
  const supabaseRef = useRef(createClient());

  const fetchApplicantCounts = useCallback(async () => {
    if (jobs.length === 0) return;

    const jobIds = jobs.map(j => j.id);
    const { data } = await supabaseRef.current
      .from('applications')
      .select('job_id, status')
      .in('job_id', jobIds);

    if (data) {
      const counts: Record<string, number> = {};
      const hires = new Set<string>();
      data.forEach((row: { job_id: string; status: string }) => {
        counts[row.job_id] = (counts[row.job_id] || 0) + 1;
        if (row.status === 'Hired') hires.add(row.job_id);
      });
      setApplicantCounts(counts);
      setJobsWithHires(hires);
    }
  }, [jobs]);

  useEffect(() => {
    fetchApplicantCounts();
  }, [fetchApplicantCounts]);

  const handleDelete = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    const { success } = await deleteJob(jobId);
    if (success) {
      refetch();
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Interviewing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Hired':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">Job Postings</h1>
              <p className="text-gray-600">
                Manage your job listings and applications
              </p>
            </div>
            <Link
              href="/school/post-job"
              className="flex items-center gap-2 px-4 py-3 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
            >
              <Plus size={20} />
              Post New Job
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-gray-300 p-12 text-center">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-[#1c1d1f] mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first job posting to start hiring teachers
              </p>
              <Link
                href="/school/post-job"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
              >
                <Plus size={20} />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => {
                const count = applicantCounts[job.id] || 0;

                return (
                  <div
                    key={job.id}
                    className="bg-white border border-gray-300 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1c1d1f]">
                            {job.title}
                          </h3>
                          <select
                            value={job.progress}
                            onChange={async (e) => {
                              const { success } = await updateJob(job.id, { progress: e.target.value });
                              if (success) refetch();
                            }}
                            className={`px-3 py-1 text-xs font-bold border cursor-pointer focus:outline-none ${getProgressColor(job.progress)}`}
                          >
                            <option value="Open">Open</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Closed">Closed</option>
                            {jobsWithHires.has(job.id) && <option value="Hired">Hired</option>}
                          </select>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {job.jobType}
                          </span>
                          {job.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                tag === 'Urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>
                              {format(new Date(job.startDate), 'MMM d')} -{' '}
                              {format(new Date(job.endDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>Apply by {format(new Date(job.applicationDeadline), 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>
                              {count} applicant{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.educationPhase}
                      </span>
                      <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.subject}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/school/jobs/${job.id}/applicants`}
                        className="flex-1 py-2 px-4 bg-[#2563eb] text-white text-center font-medium hover:bg-[#1d4ed8] transition-colors"
                      >
                        View Applicants ({count})
                      </Link>
                      <Link
                        href={`/school/jobs/${job.id}/edit`}
                        className="flex items-center gap-2 py-2 px-4 border border-gray-300 text-[#1c1d1f] font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id, job.title)}
                        disabled={deleting}
                        className="flex items-center gap-2 py-2 px-4 border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
