'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { teacherSidebarLinks } from '@/components/shared/Sidebar';
import JobCard from '@/components/shared/JobCard';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const {
    jobs,
    getSchoolById,
    getTeacherByUserId,
    getApplicationsByTeacherId,
    addApplication
  } = useData();

  const teacher = user ? getTeacherByUserId(user.id) : null;
  const teacherApplications = teacher ? getApplicationsByTeacherId(teacher.id) : [];
  const appliedJobIds = new Set(teacherApplications.map(app => app.jobId));

  // Filter only open jobs
  const openJobs = jobs.filter(job => job.status === 'Open');

  const handleApply = (jobId: string) => {
    if (!teacher) return;

    addApplication({
      jobId,
      teacherId: teacher.id,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0],
      shortlisted: false
    });
  };

  return (
    <DashboardLayout sidebarLinks={teacherSidebarLinks} requiredUserType="teacher">
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-10">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#1c1d1f] mb-2">
                  Available Jobs
                </h1>
                <p className="text-gray-600">
                  Browse and apply to temporary teaching positions
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-300 p-5">
                  <p className="text-gray-600 text-sm font-bold mb-2">Total Jobs</p>
                  <p className="text-3xl font-bold text-[#1c1d1f]">{openJobs.length}</p>
                </div>

                <div className="bg-white border border-gray-300 p-5">
                  <p className="text-gray-600 text-sm font-bold mb-2">Applied</p>
                  <p className="text-3xl font-bold text-[#1c1d1f]">{teacherApplications.length}</p>
                </div>

                <div className="bg-white border border-gray-300 p-5">
                  <p className="text-gray-600 text-sm font-bold mb-2">Profile Completeness</p>
                  <p className="text-3xl font-bold text-[#1c1d1f]">{teacher?.profileCompleteness || 0}%</p>
                </div>
              </div>
            </div>

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
                    <a href="/teacher/setup" className="mt-2 inline-block text-sm font-medium text-yellow-800 hover:text-yellow-900">
                      Complete now →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {openJobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                <p className="text-gray-600">Check back later for new opportunities</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {openJobs.map(job => {
                  const school = getSchoolById(job.schoolId);
                  if (!school) return null;

                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      school={school}
                      teacherLocation={teacher?.location}
                      onApply={handleApply}
                      applied={appliedJobIds.has(job.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
