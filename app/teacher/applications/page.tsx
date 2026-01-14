'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { format } from 'date-fns';
import { Briefcase, MapPin } from 'lucide-react';

export default function TeacherApplicationsPage() {
  const { user } = useAuth();
  const { getTeacherByUserId, getApplicationsByTeacherId, getJobById, getSchoolById } = useData();

  const teacher = user ? getTeacherByUserId(user.id) : null;
  const applications = teacher ? getApplicationsByTeacherId(teacher.id) : [];

  // Sort applications by date (most recent first)
  const sortedApplications = [...applications].sort((a, b) =>
    new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hired':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">My Applications</h1>
            <p className="text-gray-600">
              Track your job applications and their status
            </p>
          </div>

          {applications.length === 0 ? (
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
                className="mt-4 inline-block px-4 py-2 bg-[#a435f0] text-white rounded-md hover:bg-[#8710d8]"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map(application => {
                const job = getJobById(application.jobId);
                const school = job ? getSchoolById(job.schoolId) : null;

                if (!job || !school) return null;

                return (
                  <div
                    key={application.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/teacher/jobs/${job.id}`} className="hover:text-[#a435f0]">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/teacher/schools/${school.id}`}
                          className="text-gray-600 hover:text-[#a435f0] font-medium text-sm"
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Applied:</span> {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                      </div>
                      <div>
                        <span className="font-medium">Start Date:</span> {format(new Date(job.startDate), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {application.shortlisted && (
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-700 font-medium">
                          ✓ You've been shortlisted for this position!
                        </p>
                      </div>
                    )}

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
