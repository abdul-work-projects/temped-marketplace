'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import JobCard from '@/components/shared/JobCard';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useTeacherApplications } from '@/lib/hooks/useTeacher';
import { useOpenJobs } from '@/lib/hooks/useJobs';
import { calculateDistance } from '@/lib/utils/distance';
import { EducationPhase, JobType } from '@/types';
import { Filter, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

const EDUCATION_PHASES: EducationPhase[] = [
  'Foundation Phase',
  'Primary',
  'Secondary',
  'Tertiary',
];

const JOB_TYPES: JobType[] = ['Permanent', 'Temporary', 'Invigilator', 'Coach'];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { applications, loading: appsLoading } = useTeacherApplications(teacher?.id);

  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('');

  const filters = useMemo(() => {
    const f: { educationPhase?: string; jobType?: string } = {};
    if (phaseFilter) f.educationPhase = phaseFilter;
    if (jobTypeFilter) f.jobType = jobTypeFilter;
    return f;
  }, [phaseFilter, jobTypeFilter]);

  const { jobs: openJobsWithSchool, loading: jobsLoading } = useOpenJobs(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  const appliedJobIds = useMemo(
    () => new Set(applications.map((app) => app.jobId)),
    [applications]
  );

  // Filter by teacher's distance radius if both teacher and school have locations
  const filteredJobs = useMemo(() => {
    if (!teacher?.location || !teacher.distanceRadius) return openJobsWithSchool;

    return openJobsWithSchool.filter(({ school }) => {
      if (!school.location) return true; // Show jobs where school has no location
      const dist = calculateDistance(
        teacher.location!.lat,
        teacher.location!.lng,
        school.location.lat,
        school.location.lng
      );
      return dist <= teacher.distanceRadius;
    });
  }, [openJobsWithSchool, teacher?.location, teacher?.distanceRadius]);

  const hasActiveFilters = phaseFilter || jobTypeFilter;

  const clearFilters = () => {
    setPhaseFilter('');
    setJobTypeFilter('');
  };

  const loading = teacherLoading || jobsLoading;

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#1c1d1f] mb-1">
                  Available Jobs
                </h1>
                <p className="text-gray-600 text-sm">
                  Browse and apply to teaching positions
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">Available Jobs</p>
                  <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : filteredJobs.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">My Applications</p>
                  <p className="text-2xl font-bold text-[#1c1d1f]">{appsLoading ? '...' : applications.length}</p>
                </div>
              </div>
            </div>

            {/* Profile Completion Warning */}
            {teacher && teacher.profileCompleteness < 100 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Complete your profile</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Your profile is {teacher.profileCompleteness}% complete. Complete it to increase your chances of getting hired.
                    </p>
                    <Link
                      href="/teacher/setup"
                      className="mt-2 inline-block text-sm font-medium text-yellow-800 hover:text-yellow-900"
                    >
                      Complete now &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              <Filter size={16} className="text-gray-400" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">All Phases</option>
                {EDUCATION_PHASES.map((phase) => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 text-sm text-[#1c1d1f] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2563eb]"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-gray-400" />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                <p className="text-gray-600">
                  {hasActiveFilters
                    ? 'No jobs match your current filters. Try adjusting them.'
                    : 'Check back later for new opportunities'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map(({ job, school }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    school={school}
                    teacherLocation={teacher?.location}
                    applied={appliedJobIds.has(job.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
