'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { format } from 'date-fns';
import { Plus, Users, Calendar, Clock } from 'lucide-react';

export default function SchoolDashboard() {
  const { user } = useAuth();
  const { jobs, getSchoolByUserId, getApplicationsByJobId } = useData();

  const school = user ? getSchoolByUserId(user.id) : null;

  // Get jobs posted by this school
  const schoolJobs = school ? jobs.filter(job => job.schoolId === school.id) : [];

  // Sort jobs by creation date (most recent first)
  const sortedJobs = [...schoolJobs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
              className="flex items-center gap-2 px-4 py-3 bg-[#a435f0] text-white font-bold hover:bg-[#8710d8] transition-colors"
            >
              <Plus size={20} />
              Post New Job
            </Link>
          </div>

          {sortedJobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first job posting to start hiring temporary teachers
              </p>
              <Link
                href="/school/post-job"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#a435f0] text-white rounded-md hover:bg-[#8710d8]"
              >
                <Plus size={20} />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedJobs.map(job => {
                const applications = getApplicationsByJobId(job.id);
                const shortlistedCount = applications.filter(app => app.shortlisted).length;

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === 'Open'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {job.status}
                          </span>
                          {job.tags.includes('Urgent') && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Urgent
                            </span>
                          )}
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
                              {applications.length} applicant{applications.length !== 1 ? 's' : ''}
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
                        className="flex-1 py-2 px-4 bg-[#a435f0] text-white text-center rounded-md font-medium hover:bg-[#8710d8] transition-colors"
                      >
                        View Applicants ({applications.length})
                      </Link>
                      {shortlistedCount > 0 && (
                        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-md border border-green-200 font-medium">
                          {shortlistedCount} Shortlisted
                        </div>
                      )}
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
