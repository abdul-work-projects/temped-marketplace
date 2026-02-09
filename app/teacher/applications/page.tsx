'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useTeacherProfile, useTeacherApplications } from '@/lib/hooks/useTeacher';
import { format } from 'date-fns';
import { Briefcase, MapPin, Star, CheckCircle, Loader2 } from 'lucide-react';

// Derive display status: application.status trumps job.progress for "Hired"
function getDisplayStatus(applicationStatus: string, jobProgress: string): string {
  if (applicationStatus === 'Hired') return 'Hired';
  switch (jobProgress) {
    case 'Open': return 'Applied';
    case 'Interviewing': return 'In Progress';
    case 'Hired': return 'Hired';
    case 'Closed': return 'Closed';
    default: return 'Applied';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Hired':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Closed':
      return 'bg-gray-100 text-gray-700';
    case 'Applied':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getJobTypeBadgeColor(jobType: string) {
  switch (jobType) {
    case 'Permanent':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Temporary':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Invigilator':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Coach':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default function TeacherApplicationsPage() {
  const { user } = useAuth();
  const { teacher, loading: teacherLoading } = useTeacherProfile(user?.id);
  const { applications, loading: appsLoading } = useTeacherApplications(teacher?.id);

  const loading = teacherLoading || appsLoading;

  // Count shortlisted
  const shortlistedCount = applications.filter((a) => a.shortlisted).length;

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1c1d1f] mb-1">My Applications</h1>
              <p className="text-gray-600 text-sm">
                Track your job applications and their status
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500">Total</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : applications.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 flex items-center justify-end gap-1"><Star size={12} className="text-yellow-500" />Shortlisted</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : shortlistedCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 flex items-center justify-end gap-1"><CheckCircle size={12} className="text-green-500" />Hired</p>
                <p className="text-2xl font-bold text-[#1c1d1f]">{loading ? '...' : applications.filter((a) => a.status === 'Hired').length}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin text-gray-400" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600">
                Start applying to jobs to see them here
              </p>
              <Link
                href="/teacher/dashboard"
                className="mt-4 inline-block px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const job = application.job;
                const school = application.school;

                if (!job || !school) return null;

                const displayStatus = getDisplayStatus(application.status, job.progress);

                return (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/teacher/jobs/${job.id}`} className="hover:text-[#2563eb]">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/teacher/schools/${school.id}`}
                          className="text-gray-600 hover:text-[#2563eb] font-medium text-sm"
                        >
                          {school.name}
                        </Link>
                        {school.address && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <MapPin size={14} />
                            <span>{school.address}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {application.shortlisted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                            <Star size={12} />
                            Shortlisted
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </div>
                    </div>

                    {/* Job Type & Phase */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-xs font-bold border ${getJobTypeBadgeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.educationPhase}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-bold text-gray-700 border border-gray-300">
                        {job.subject}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applied:</span>{' '}
                        {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span>{' '}
                        {format(new Date(job.startDate), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4">
                      <Link
                        href={`/teacher/jobs/${job.id}`}
                        className="inline-block px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50"
                      >
                        View Job Details
                      </Link>
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
