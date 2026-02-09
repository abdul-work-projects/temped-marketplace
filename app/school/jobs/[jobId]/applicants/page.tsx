'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { schoolSidebarLinks } from '@/components/shared/Sidebar';
import ContactModal from '@/components/shared/ContactModal';
import { useJobDetail } from '@/lib/hooks/useJobs';
import { useJobApplicants, useUpdateApplication, useUpdateJob } from '@/lib/hooks/useSchool';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { Star, MapPin, GraduationCap, Briefcase, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

function TeacherAvatar({ profilePicture, firstName, surname }: { profilePicture?: string; firstName: string; surname: string }) {
  const url = useSignedUrl('profile-pictures', profilePicture);
  return (
    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
      {url ? (
        <img src={url} alt={`${firstName} ${surname}`} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl text-gray-400">{firstName[0]}{surname[0]}</span>
      )}
    </div>
  );
}

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { job, loading: jobLoading } = useJobDetail(jobId);
  const { applicants, loading: applicantsLoading, refetch } = useJobApplicants(jobId);
  const { updateApplication } = useUpdateApplication();
  const { updateJob } = useUpdateJob();
  const [contactTeacher, setContactTeacher] = useState<{ name: string; email: string } | null>(null);
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

  const loading = jobLoading || applicantsLoading;

  // Sort applications: shortlisted first, then by application date
  const sortedApplicants = [...applicants].sort((a, b) => {
    if (a.application.shortlisted === b.application.shortlisted) {
      return new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime();
    }
    return a.application.shortlisted ? -1 : 1;
  });

  const displayedApplicants = showShortlistedOnly
    ? sortedApplicants.filter(a => a.application.shortlisted)
    : sortedApplicants;

  const handleToggleShortlist = async (applicationId: string, currentStatus: boolean) => {
    await updateApplication(applicationId, { shortlisted: !currentStatus });
    refetch();
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    await updateApplication(applicationId, { status: newStatus });
    refetch();
  };

  const handleUpdateProgress = async (progress: string) => {
    if (!job) return;
    await updateJob(job.id, { progress });
  };

  // Get all subjects as flat array from the Record<string, string[]> structure
  const getSubjectsFlat = (subjects: Record<string, string[]>): string[] => {
    return Object.values(subjects).flat();
  };

  if (loading) {
    return (
      <DashboardLayout sidebarLinks={schoolSidebarLinks} requiredUserType="school">
        <div className="p-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applicants...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            <div className="flex items-start justify-between">
              <div>
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
              <select
                value={job.progress}
                onChange={(e) => handleUpdateProgress(e.target.value)}
                className="px-4 py-2 border border-gray-300 font-bold text-sm focus:outline-none focus:border-[#1c1d1f]"
              >
                <option value="Open">Open</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Hired">Hired</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Applicants ({applicants.length})
              </h2>
              <p className="text-gray-600">
                Review applications and shortlist candidates for interview
              </p>
            </div>
            <button
              onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                showShortlistedOnly
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star size={16} className="inline mr-1" fill={showShortlistedOnly ? 'currentColor' : 'none'} />
              {showShortlistedOnly ? 'Show All' : 'Shortlisted Only'}
            </button>
          </div>

          {displayedApplicants.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showShortlistedOnly ? 'No shortlisted applicants' : 'No applicants yet'}
              </h3>
              <p className="text-gray-600">
                {showShortlistedOnly
                  ? 'Shortlist candidates to see them here.'
                  : 'Teachers will see your job posting and can apply. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedApplicants.map(({ application, teacher }) => {
                const allSubjects = getSubjectsFlat(teacher.subjects);

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
                        <TeacherAvatar profilePicture={teacher.profilePicture} firstName={teacher.firstName} surname={teacher.surname} />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {teacher.firstName} {teacher.surname}
                              {teacher.profileCompleteness >= 80 && (
                                <CheckCircle size={18} className="inline ml-2 text-green-600" />
                              )}
                            </h3>
                            {teacher.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin size={14} />
                                <span>{teacher.address}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleShortlist(application.id, application.shortlisted)}
                            className={`flex items-center gap-2 px-4 py-2 font-bold transition-colors ${
                              application.shortlisted
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                              {teacher.educationPhases.map(phase => (
                                <span
                                  key={phase}
                                  className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
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
                              {allSubjects.slice(0, 3).map(subject => (
                                <span
                                  key={subject}
                                  className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300"
                                >
                                  {subject}
                                </span>
                              ))}
                              {allSubjects.length > 3 && (
                                <span className="px-2 py-1 text-xs font-bold text-gray-700 border border-gray-300">
                                  +{allSubjects.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <span>Applied: {format(new Date(application.appliedAt), 'MMM d, yyyy')}</span>
                          <span>•</span>
                          <span>Profile: {teacher.profileCompleteness}% complete</span>
                          {teacher.profileCompleteness >= 80 && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 font-medium">Profile Complete</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setContactTeacher({ name: `${teacher.firstName} ${teacher.surname}`, email: teacher.email })}
                            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white font-bold hover:bg-[#1d4ed8]"
                          >
                            <Mail size={16} />
                            Contact
                          </button>

                          <select
                            value={application.status}
                            onChange={(e) => handleUpdateStatus(application.id, e.target.value)}
                            className="px-4 py-2 border border-gray-300 font-bold focus:outline-none focus:border-[#1c1d1f]"
                          >
                            <option value="Applied">Applied</option>
                            <option value="In Review">In Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          <Link
                            href={`/school/teachers/${teacher.id}`}
                            className="px-4 py-2 border border-gray-300 text-[#1c1d1f] font-bold hover:bg-gray-50"
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

      {contactTeacher && (
        <ContactModal
          isOpen={!!contactTeacher}
          onClose={() => setContactTeacher(null)}
          name={contactTeacher.name}
          email={contactTeacher.email}
        />
      )}
    </DashboardLayout>
  );
}
