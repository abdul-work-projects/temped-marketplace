'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import { useAuth } from '@/lib/context/AuthContext';
import { useData } from '@/lib/context/DataContext';
import { Star, MapPin, GraduationCap, Briefcase, Mail, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { user } = useAuth();
  const {
    getJobById,
    getApplicationsByJobId,
    getTeacherById,
    updateApplication
  } = useData();

  const job = getJobById(jobId);
  const applications = job ? getApplicationsByJobId(job.id) : [];

  // Sort applications: shortlisted first, then by application date
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.shortlisted === b.shortlisted) {
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    }
    return a.shortlisted ? -1 : 1;
  });

  const handleToggleShortlist = (applicationId: string, currentStatus: boolean) => {
    updateApplication(applicationId, { shortlisted: !currentStatus });
  };

  const handleUpdateStatus = (applicationId: string, newStatus: 'In Progress' | 'Hired' | 'Closed') => {
    updateApplication(applicationId, { status: newStatus });
  };

  if (!job) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600">Job not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/school/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Job Postings
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>{job.subject}</span>
              <span>•</span>
              <span>{job.educationPhase}</span>
              <span>•</span>
              <span>
                {format(new Date(job.startDate), 'MMM d')} - {format(new Date(job.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Applicants ({applications.length})
            </h2>
            <p className="text-gray-600">
              Review applications and shortlist candidates for interview
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
              <p className="text-gray-600">
                Teachers will see your job posting and can apply. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map(application => {
                const teacher = getTeacherById(application.teacherId);
                if (!teacher) return null;

                return (
                  <div
                    key={application.id}
                    className={`bg-white rounded-lg border-2 p-6 transition-all ${
                      application.shortlisted
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-6">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {teacher.profilePicture ? (
                            <img
                              src={teacher.profilePicture}
                              alt={`${teacher.firstName} ${teacher.surname}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-gray-400">
                              {teacher.firstName[0]}{teacher.surname[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {teacher.firstName} {teacher.surname}
                            </h3>
                            {teacher.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin size={14} />
                                <span>{teacher.address}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleShortlist(application.id, application.shortlisted || false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                              application.shortlisted
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Star size={18} fill={application.shortlisted ? 'currentColor' : 'none'} />
                            {application.shortlisted ? 'Shortlisted' : 'Shortlist'}
                          </button>
                        </div>

                        {teacher.description && (
                          <p className="text-gray-700 mb-4 line-clamp-2">{teacher.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <GraduationCap size={16} />
                              <span className="font-medium">Education Phase:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teacher.educationPhase.map(phase => (
                                <span
                                  key={phase}
                                  className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                                >
                                  {phase}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Briefcase size={16} />
                              <span className="font-medium">Subjects:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {teacher.subjects.slice(0, 3).map(subject => (
                                <span
                                  key={subject}
                                  className="px-2 py-1 rounded text-xs bg-green-100 text-green-700"
                                >
                                  {subject}
                                </span>
                              ))}
                              {teacher.subjects.length > 3 && (
                                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                  +{teacher.subjects.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>Applied: {format(new Date(application.appliedAt), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span>Profile: {teacher.profileCompleteness}% complete</span>
                          {teacher.faceVerified && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">✓ Verified</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <Mail size={16} />
                            Contact
                          </button>

                          <select
                            value={application.status}
                            onChange={(e) => handleUpdateStatus(application.id, e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Applied">Applied</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Hired">Hired</option>
                            <option value="Closed">Closed</option>
                          </select>

                          <Link
                            href={`/school/teachers/${teacher.id}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                            View Full Profile
                          </Link>
                        </div>
                      </div>
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
